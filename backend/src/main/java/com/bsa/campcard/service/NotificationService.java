package com.bsa.campcard.service;

import com.bsa.campcard.dto.notification.*;
import com.bsa.campcard.entity.DeviceToken;
import com.bsa.campcard.entity.Notification;
import com.bsa.campcard.repository.DeviceTokenRepository;
import com.bsa.campcard.repository.NotificationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ObjectMapper objectMapper;

    /**
     * Register a new device token for push notifications
     */
    @Transactional
    public void registerDeviceToken(Long userId, DeviceTokenRequest request) {
        log.info("Registering device token for user: {}", userId);

        // Check if token already exists
        var existingToken = deviceTokenRepository.findByToken(request.getToken());

        if (existingToken.isPresent()) {
            // Update existing token
            DeviceToken token = existingToken.get();
            token.setUserId(userId);
            token.setDeviceType(request.getDeviceType());
            token.setDeviceModel(request.getDeviceModel());
            token.setOsVersion(request.getOsVersion());
            token.setAppVersion(request.getAppVersion());
            token.setActive(true);
            token.setLastUsedAt(LocalDateTime.now());
            deviceTokenRepository.save(token);
        } else {
            // Create new token
            DeviceToken token = DeviceToken.builder()
                    .userId(userId)
                    .token(request.getToken())
                    .deviceType(request.getDeviceType())
                    .deviceModel(request.getDeviceModel())
                    .osVersion(request.getOsVersion())
                    .appVersion(request.getAppVersion())
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
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
        });
    }

    /**
     * Send push notification to specific users
     */
    @Transactional
    public void sendNotification(NotificationRequest request) {
        log.info("Sending notification to {} users", request.getUserIds().size());

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

        // Send FCM notifications
        sendFCMNotifications(tokens, request);
    }

    /**
     * Send FCM push notifications
     */
    private void sendFCMNotifications(List<DeviceToken> tokens, NotificationRequest request) {
        try {
            // Build notification message
            com.google.firebase.messaging.Notification notification =
                com.google.firebase.messaging.Notification.builder()
                    .setTitle(request.getTitle())
                    .setBody(request.getBody())
                    .setImage(request.getImageUrl())
                    .build();

            // Build data payload
            Map<String, String> data = request.getData() != null
                    ? request.getData()
                    : Map.of();

            // Group tokens by platform for efficient sending
            Map<DeviceToken.DeviceType, List<String>> tokensByPlatform = tokens.stream()
                    .collect(Collectors.groupingBy(
                            DeviceToken::getDeviceType,
                            Collectors.mapping(DeviceToken::getToken, Collectors.toList())
                    ));

            // Send to iOS devices
            if (tokensByPlatform.containsKey(DeviceToken.DeviceType.IOS)) {
                sendToIOS(tokensByPlatform.get(DeviceToken.DeviceType.IOS), notification, data);
            }

            // Send to Android devices
            if (tokensByPlatform.containsKey(DeviceToken.DeviceType.ANDROID)) {
                sendToAndroid(tokensByPlatform.get(DeviceToken.DeviceType.ANDROID), notification, data);
            }

            log.info("Successfully sent notifications to {} devices", tokens.size());

        } catch (Exception e) {
            log.error("Error sending FCM notifications", e);
        }
    }

    /**
     * Send notifications to iOS devices
     */
    private void sendToIOS(List<String> tokens, com.google.firebase.messaging.Notification notification, Map<String, String> data) {
        try {
            ApnsConfig apnsConfig = ApnsConfig.builder()
                    .setAps(Aps.builder()
                            .setSound("default")
                            .setBadge(1)
                            .build())
                    .build();

            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(notification)
                    .putAllData(data)
                    .setApnsConfig(apnsConfig)
                    .addAllTokens(tokens)
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("iOS notifications sent. Success: {}, Failure: {}",
                    response.getSuccessCount(), response.getFailureCount());

        } catch (FirebaseMessagingException e) {
            log.error("Error sending to iOS devices", e);
        }
    }

    /**
     * Send notifications to Android devices
     */
    private void sendToAndroid(List<String> tokens, com.google.firebase.messaging.Notification notification, Map<String, String> data) {
        try {
            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .setNotification(AndroidNotification.builder()
                            .setSound("default")
                            .setColor("#003f87")
                            .build())
                    .build();

            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(notification)
                    .putAllData(data)
                    .setAndroidConfig(androidConfig)
                    .addAllTokens(tokens)
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("Android notifications sent. Success: {}, Failure: {}",
                    response.getSuccessCount(), response.getFailureCount());

        } catch (FirebaseMessagingException e) {
            log.error("Error sending to Android devices", e);
        }
    }

    /**
     * Get user notifications
     */
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    /**
     * Get unread notifications count
     */
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
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
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);

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
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Error serializing notification data", e);
            return null;
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
