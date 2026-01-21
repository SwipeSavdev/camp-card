package com.bsa.campcard.service;

import com.bsa.campcard.dto.notification.*;
import com.bsa.campcard.entity.DeviceToken;
import com.bsa.campcard.entity.Notification;
import com.bsa.campcard.repository.DeviceTokenRepository;
import com.bsa.campcard.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnsNotificationService {

    private final SnsClient snsClient;
    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ObjectMapper objectMapper;

    @Value("${aws.sns.platform-application-arn.ios:}")
    private String iosPlatformArn;

    @Value("${aws.sns.platform-application-arn.android:}")
    private String androidPlatformArn;

    /**
     * Register a device token with AWS SNS and store in database
     * Note: Takes UUID from controller but converts to Long for database storage (temporary until DBA migration)
     */
    @Transactional
    public String registerDeviceToken(UUID userId, DeviceTokenRequest request) {
        log.info("Registering device token for user: {} on platform: {}", userId, request.getDeviceType());

        // Convert UUID to Long for database storage (temporary until DBA migration)
        Long userIdAsLong = userId.getMostSignificantBits() & Long.MAX_VALUE;

        String platformArn = getPlatformArn(request.getDeviceType());
        if (platformArn == null || platformArn.isEmpty()) {
            log.warn("Platform ARN not configured for device type: {}", request.getDeviceType());
            // Still save the token locally even if SNS is not configured
            saveDeviceTokenLocally(userIdAsLong, request, null);
            return null;
        }

        try {
            // Create SNS platform endpoint for this device
            CreatePlatformEndpointRequest endpointRequest = CreatePlatformEndpointRequest.builder()
                    .platformApplicationArn(platformArn)
                    .token(request.getToken())
                    .customUserData(userId.toString())
                    .build();

            CreatePlatformEndpointResponse response = snsClient.createPlatformEndpoint(endpointRequest);
            String endpointArn = response.endpointArn();

            log.info("Created SNS endpoint: {} for user: {}", endpointArn, userId);

            // Save to database with endpoint ARN
            saveDeviceTokenLocally(userIdAsLong, request, endpointArn);

            return endpointArn;

        } catch (InvalidParameterException e) {
            // Token already exists, update it
            log.info("Token already registered, updating existing endpoint");
            return handleExistingEndpoint(userId, userIdAsLong, request, platformArn);
        } catch (SnsException e) {
            log.error("Error creating SNS endpoint for user: {}", userId, e);
            // Still save the token locally
            saveDeviceTokenLocally(userIdAsLong, request, null);
            return null;
        }
    }

    /**
     * Handle case where endpoint already exists
     */
    private String handleExistingEndpoint(UUID userId, Long userIdAsLong, DeviceTokenRequest request, String platformArn) {
        try {
            // List endpoints to find the existing one
            ListEndpointsByPlatformApplicationRequest listRequest = ListEndpointsByPlatformApplicationRequest.builder()
                    .platformApplicationArn(platformArn)
                    .build();

            ListEndpointsByPlatformApplicationResponse listResponse = snsClient.listEndpointsByPlatformApplication(listRequest);

            for (Endpoint endpoint : listResponse.endpoints()) {
                if (request.getToken().equals(endpoint.attributes().get("Token"))) {
                    // Enable the endpoint if disabled
                    SetEndpointAttributesRequest setAttrRequest = SetEndpointAttributesRequest.builder()
                            .endpointArn(endpoint.endpointArn())
                            .attributes(Map.of(
                                    "Enabled", "true",
                                    "CustomUserData", userId.toString()
                            ))
                            .build();
                    snsClient.setEndpointAttributes(setAttrRequest);

                    saveDeviceTokenLocally(userIdAsLong, request, endpoint.endpointArn());
                    return endpoint.endpointArn();
                }
            }
        } catch (SnsException e) {
            log.error("Error handling existing endpoint", e);
        }

        saveDeviceTokenLocally(userIdAsLong, request, null);
        return null;
    }

    /**
     * Save device token to local database
     */
    private void saveDeviceTokenLocally(Long userId, DeviceTokenRequest request, String endpointArn) {
        var existingToken = deviceTokenRepository.findByToken(request.getToken());

        if (existingToken.isPresent()) {
            DeviceToken token = existingToken.get();
            token.setUserId(userId);
            token.setDeviceType(request.getDeviceType());
            token.setDeviceModel(request.getDeviceModel());
            token.setOsVersion(request.getOsVersion());
            token.setAppVersion(request.getAppVersion());
            token.setEndpointArn(endpointArn);
            token.setActive(true);
            token.setLastUsedAt(LocalDateTime.now());
            deviceTokenRepository.save(token);
        } else {
            DeviceToken token = DeviceToken.builder()
                    .userId(userId)
                    .token(request.getToken())
                    .deviceType(request.getDeviceType())
                    .deviceModel(request.getDeviceModel())
                    .osVersion(request.getOsVersion())
                    .appVersion(request.getAppVersion())
                    .endpointArn(endpointArn)
                    .active(true)
                    .build();
            deviceTokenRepository.save(token);
        }
    }

    /**
     * Unregister a device token
     */
    @Transactional
    public void unregisterDeviceToken(String token) {
        log.info("Unregistering device token");

        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            // Delete SNS endpoint if exists
            if (deviceToken.getEndpointArn() != null) {
                try {
                    DeleteEndpointRequest deleteRequest = DeleteEndpointRequest.builder()
                            .endpointArn(deviceToken.getEndpointArn())
                            .build();
                    snsClient.deleteEndpoint(deleteRequest);
                    log.info("Deleted SNS endpoint: {}", deviceToken.getEndpointArn());
                } catch (SnsException e) {
                    log.error("Error deleting SNS endpoint", e);
                }
            }

            deviceToken.setActive(false);
            deviceToken.setEndpointArn(null);
            deviceTokenRepository.save(deviceToken);
        });
    }

    /**
     * Send push notification to specific users via AWS SNS
     */
    @Transactional
    public void sendNotification(NotificationRequest request) {
        log.info("Sending notification to {} users via SNS", request.getUserIds().size());

        // Get all active device tokens for target users
        List<DeviceToken> tokens = deviceTokenRepository.findByUserIdInAndActiveTrue(request.getUserIds());

        if (tokens.isEmpty()) {
            log.warn("No active device tokens found for users: {}", request.getUserIds());
            return;
        }

        // Save to database if requested
        if (Boolean.TRUE.equals(request.getSaveToDatabase())) {
            for (Long userId : request.getUserIds()) {
                Notification notification = Notification.builder()
                        .userId(userId)
                        .title(request.getTitle())
                        .body(request.getBody())
                        .type(request.getType())
                        .imageUrl(request.getImageUrl())
                        .data(serializeData(request.getData()))
                        .sent(false)
                        .read(false)
                        .build();
                notificationRepository.save(notification);
            }
        }

        // Send SNS notifications
        int successCount = 0;
        int failureCount = 0;

        for (DeviceToken deviceToken : tokens) {
            if (deviceToken.getEndpointArn() != null) {
                try {
                    sendToEndpoint(deviceToken, request);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send to endpoint: {}", deviceToken.getEndpointArn(), e);
                    failureCount++;
                    handleFailedEndpoint(deviceToken);
                }
            } else {
                log.warn("No endpoint ARN for device token: {}", deviceToken.getId());
                failureCount++;
            }
        }

        log.info("SNS notifications sent. Success: {}, Failure: {}", successCount, failureCount);
    }

    /**
     * Send notification to a single SNS endpoint
     */
    private void sendToEndpoint(DeviceToken deviceToken, NotificationRequest request) {
        String message = buildPlatformMessage(deviceToken.getDeviceType(), request);

        PublishRequest publishRequest = PublishRequest.builder()
                .targetArn(deviceToken.getEndpointArn())
                .message(message)
                .messageStructure("json")
                .build();

        PublishResponse response = snsClient.publish(publishRequest);
        log.debug("Published message ID: {} to endpoint: {}", response.messageId(), deviceToken.getEndpointArn());
    }

    /**
     * Build platform-specific message payload
     */
    private String buildPlatformMessage(DeviceToken.DeviceType deviceType, NotificationRequest request) {
        Map<String, Object> payload = new HashMap<>();

        if (deviceType == DeviceToken.DeviceType.IOS) {
            // APNs payload
            Map<String, Object> aps = new HashMap<>();
            Map<String, Object> alert = new HashMap<>();
            alert.put("title", request.getTitle());
            alert.put("body", request.getBody());
            aps.put("alert", alert);
            aps.put("sound", "default");
            aps.put("badge", 1);

            Map<String, Object> apnsPayload = new HashMap<>();
            apnsPayload.put("aps", aps);

            // Add custom data
            if (request.getData() != null) {
                apnsPayload.putAll(request.getData());
            }

            payload.put("APNS", serializeJson(apnsPayload));
            payload.put("APNS_SANDBOX", serializeJson(apnsPayload));

        } else if (deviceType == DeviceToken.DeviceType.ANDROID) {
            // FCM payload (through SNS)
            Map<String, Object> fcmPayload = new HashMap<>();
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", request.getTitle());
            notification.put("body", request.getBody());
            notification.put("sound", "default");
            notification.put("color", "#003f87"); // BSA Navy

            fcmPayload.put("notification", notification);

            // Add custom data
            if (request.getData() != null) {
                fcmPayload.put("data", request.getData());
            }

            payload.put("GCM", serializeJson(fcmPayload));
        }

        // Default message for other platforms
        payload.put("default", request.getTitle() + ": " + request.getBody());

        return serializeJson(payload);
    }

    /**
     * Handle failed endpoint (disable or delete)
     */
    private void handleFailedEndpoint(DeviceToken deviceToken) {
        try {
            // Check if endpoint is disabled
            GetEndpointAttributesRequest attrRequest = GetEndpointAttributesRequest.builder()
                    .endpointArn(deviceToken.getEndpointArn())
                    .build();

            GetEndpointAttributesResponse attrResponse = snsClient.getEndpointAttributes(attrRequest);
            String enabled = attrResponse.attributes().get("Enabled");

            if ("false".equals(enabled)) {
                log.info("Endpoint disabled, marking device token as inactive: {}", deviceToken.getId());
                deviceToken.setActive(false);
                deviceTokenRepository.save(deviceToken);
            }
        } catch (NotFoundException e) {
            // Endpoint doesn't exist anymore
            log.info("Endpoint not found, marking device token as inactive: {}", deviceToken.getId());
            deviceToken.setActive(false);
            deviceToken.setEndpointArn(null);
            deviceTokenRepository.save(deviceToken);
        } catch (SnsException e) {
            log.error("Error checking endpoint status", e);
        }
    }

    /**
     * Get platform ARN based on device type
     */
    private String getPlatformArn(DeviceToken.DeviceType deviceType) {
        return switch (deviceType) {
            case IOS -> iosPlatformArn;
            case ANDROID -> androidPlatformArn;
            default -> null;
        };
    }

    /**
     * Get user notifications
     * Note: Takes UUID from controller but converts to Long for database query (temporary until DBA migration)
     */
    public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        Long userIdAsLong = userId.getMostSignificantBits() & Long.MAX_VALUE;
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userIdAsLong, pageable)
                .map(this::toResponse);
    }

    /**
     * Get unread notifications count
     * Note: Takes UUID from controller but converts to Long for database query (temporary until DBA migration)
     */
    public Long getUnreadCount(UUID userId) {
        Long userIdAsLong = userId.getMostSignificantBits() & Long.MAX_VALUE;
        return notificationRepository.countByUserIdAndReadFalse(userIdAsLong);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    /**
     * Mark all notifications as read for a user
     * Note: Takes UUID from controller but converts to Long for database query (temporary until DBA migration)
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        Long userIdAsLong = userId.getMostSignificantBits() & Long.MAX_VALUE;
        List<Notification> notifications = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userIdAsLong);

        notifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        notificationRepository.saveAll(notifications);
    }

    private String serializeData(Map<String, String> data) {
        if (data == null || data.isEmpty()) {
            return null;
        }
        return serializeJson(data);
    }

    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Error serializing to JSON", e);
            return "{}";
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .body(notification.getBody())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .imageUrl(notification.getImageUrl())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
