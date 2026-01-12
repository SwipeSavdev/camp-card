package com.bsa.campcard.service;

import com.bsa.campcard.dto.notification.NotificationRequest;
import com.bsa.campcard.entity.CampaignRecipient;
import com.bsa.campcard.entity.CampaignRecipient.Channel;
import com.bsa.campcard.entity.CampaignRecipient.DeliveryStatus;
import com.bsa.campcard.entity.MarketingCampaign;
import com.bsa.campcard.entity.MarketingCampaign.CampaignStatus;
import com.bsa.campcard.entity.MarketingSegment;
import com.bsa.campcard.entity.Notification;
import com.bsa.campcard.repository.CampaignRecipientRepository;
import com.bsa.campcard.repository.MarketingCampaignRepository;
import com.bsa.campcard.repository.MarketingSegmentRepository;
import com.bsa.campcard.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Campaign Dispatch Orchestrator Service
 *
 * Responsible for:
 * 1. Executing scheduled campaigns when their send time arrives
 * 2. Dispatching campaigns through multiple channels (EMAIL, SMS, PUSH, IN_APP)
 * 3. Tracking delivery status for each recipient
 * 4. Retrying failed deliveries
 * 5. Updating campaign metrics
 *
 * Integration with AWS Services:
 * - AWS SES for email campaigns via EmailService
 * - AWS SNS for SMS campaigns via SmsService
 * - Firebase FCM for push notifications via NotificationService
 * - AWS Location Service for geofence-triggered campaigns via LocationService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignDispatchService {

    private final MarketingCampaignRepository campaignRepository;
    private final MarketingSegmentRepository segmentRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // AWS Services
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationService notificationService;
    private final LocationService locationService;

    @Value("${campcard.campaigns.batch-size:100}")
    private int batchSize;

    @Value("${campcard.campaigns.max-retries:3}")
    private int maxRetries;

    @Value("${campcard.campaigns.retry-delay-minutes:30}")
    private int retryDelayMinutes;

    // ========================================================================
    // SCHEDULED CAMPAIGN EXECUTION
    // ========================================================================

    /**
     * Check for scheduled campaigns every minute and execute them
     */
    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void processScheduledCampaigns() {
        LocalDateTime now = LocalDateTime.now();

        // Find campaigns that are scheduled and ready to send
        List<MarketingCampaign> readyCampaigns = campaignRepository
            .findByStatusAndScheduledAtBefore(CampaignStatus.SCHEDULED, now);

        for (MarketingCampaign campaign : readyCampaigns) {
            try {
                log.info("Starting scheduled campaign: {} (ID: {})", campaign.getName(), campaign.getId());
                executeCampaign(campaign.getId());
            } catch (Exception e) {
                log.error("Failed to execute scheduled campaign {}: {}", campaign.getId(), e.getMessage(), e);
                campaign.setStatus(CampaignStatus.FAILED);
                campaignRepository.save(campaign);
            }
        }
    }

    /**
     * Retry failed deliveries every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // Every 30 minutes
    @Transactional
    public void retryFailedDeliveries() {
        LocalDateTime retryAfter = LocalDateTime.now().minusMinutes(retryDelayMinutes);
        List<CampaignRecipient> failedRecipients = recipientRepository
            .findFailedRecipientsForRetry(maxRetries, retryAfter);

        if (failedRecipients.isEmpty()) {
            return;
        }

        log.info("Retrying {} failed campaign deliveries", failedRecipients.size());

        for (CampaignRecipient recipient : failedRecipients) {
            try {
                MarketingCampaign campaign = campaignRepository.findById(recipient.getCampaignId())
                    .orElse(null);

                if (campaign == null || campaign.getStatus() == CampaignStatus.CANCELLED) {
                    recipient.setStatus(DeliveryStatus.SKIPPED);
                    recipientRepository.save(recipient);
                    continue;
                }

                User user = userRepository.findById(recipient.getUserId()).orElse(null);
                if (user == null) {
                    recipient.setStatus(DeliveryStatus.SKIPPED);
                    recipientRepository.save(recipient);
                    continue;
                }

                recipient.setRetryCount(recipient.getRetryCount() + 1);
                recipient.setLastRetryAt(LocalDateTime.now());
                recipient.setStatus(DeliveryStatus.SENDING);
                recipientRepository.save(recipient);

                sendToChannel(campaign, user, recipient);
            } catch (Exception e) {
                log.error("Retry failed for recipient {}: {}", recipient.getId(), e.getMessage());
                recipient.setStatus(DeliveryStatus.FAILED);
                recipient.setErrorMessage("Retry failed: " + e.getMessage());
                recipientRepository.save(recipient);
            }
        }
    }

    // ========================================================================
    // CAMPAIGN EXECUTION
    // ========================================================================

    /**
     * Execute a campaign - main entry point
     */
    @Async
    @Transactional
    public CompletableFuture<CampaignExecutionResult> executeCampaign(Long campaignId) {
        MarketingCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        // Validate campaign state
        if (campaign.getStatus() == CampaignStatus.COMPLETED ||
            campaign.getStatus() == CampaignStatus.CANCELLED) {
            log.warn("Campaign {} is already {} - skipping execution", campaignId, campaign.getStatus());
            return CompletableFuture.completedFuture(
                new CampaignExecutionResult(campaignId, 0, 0, "Campaign already completed or cancelled")
            );
        }

        // Update campaign status to SENDING
        campaign.setStatus(CampaignStatus.SENDING);
        campaign.setStartedAt(LocalDateTime.now());
        campaignRepository.save(campaign);

        log.info("Executing campaign {} with channels: {}", campaignId, Arrays.toString(campaign.getChannels()));

        try {
            // Get target users based on segment or audience criteria
            List<User> targetUsers = getTargetUsers(campaign);
            log.info("Campaign {} targeting {} users", campaignId, targetUsers.size());

            if (targetUsers.isEmpty()) {
                campaign.setStatus(CampaignStatus.COMPLETED);
                campaign.setCompletedAt(LocalDateTime.now());
                campaignRepository.save(campaign);
                return CompletableFuture.completedFuture(
                    new CampaignExecutionResult(campaignId, 0, 0, "No target users found")
                );
            }

            // Create recipient records and dispatch
            int successCount = 0;
            int failCount = 0;
            String[] channels = campaign.getChannels();

            for (String channelStr : channels) {
                Channel channel = Channel.valueOf(channelStr.toUpperCase());
                log.info("Dispatching campaign {} via {} channel", campaignId, channel);

                for (int i = 0; i < targetUsers.size(); i += batchSize) {
                    List<User> batch = targetUsers.subList(i, Math.min(i + batchSize, targetUsers.size()));

                    for (User user : batch) {
                        try {
                            // Skip if already sent to this user via this channel
                            if (recipientRepository.existsByCampaignIdAndUserIdAndChannel(
                                    campaignId, user.getId(), channel)) {
                                continue;
                            }

                            CampaignRecipient recipient = createRecipient(campaign, user, channel);
                            sendToChannel(campaign, user, recipient);
                            successCount++;
                        } catch (Exception e) {
                            log.error("Failed to send to user {} via {}: {}",
                                user.getId(), channel, e.getMessage());
                            failCount++;
                        }
                    }
                }
            }

            // Update campaign status
            campaign.setStatus(CampaignStatus.COMPLETED);
            campaign.setCompletedAt(LocalDateTime.now());
            campaignRepository.save(campaign);

            log.info("Campaign {} completed: {} sent, {} failed", campaignId, successCount, failCount);
            return CompletableFuture.completedFuture(
                new CampaignExecutionResult(campaignId, successCount, failCount, "Campaign executed successfully")
            );

        } catch (Exception e) {
            log.error("Campaign {} execution failed: {}", campaignId, e.getMessage(), e);
            campaign.setStatus(CampaignStatus.FAILED);
            campaignRepository.save(campaign);
            return CompletableFuture.completedFuture(
                new CampaignExecutionResult(campaignId, 0, 0, "Execution failed: " + e.getMessage())
            );
        }
    }

    /**
     * Schedule a campaign for future execution
     */
    @Transactional
    public void scheduleCampaign(Long campaignId, LocalDateTime scheduledTime) {
        MarketingCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        campaign.setScheduledAt(scheduledTime);
        campaign.setStatus(CampaignStatus.SCHEDULED);
        campaignRepository.save(campaign);

        log.info("Campaign {} scheduled for {}", campaignId, scheduledTime);
    }

    /**
     * Cancel a running or scheduled campaign
     */
    @Transactional
    public void cancelCampaign(Long campaignId) {
        MarketingCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));

        campaign.setStatus(CampaignStatus.CANCELLED);
        campaign.setCompletedAt(LocalDateTime.now());
        campaignRepository.save(campaign);

        // Mark pending recipients as skipped
        recipientRepository.bulkUpdateStatus(
            campaignId,
            DeliveryStatus.PENDING,
            DeliveryStatus.SKIPPED,
            LocalDateTime.now()
        );

        log.info("Campaign {} cancelled", campaignId);
    }

    // ========================================================================
    // CHANNEL-SPECIFIC DISPATCH
    // ========================================================================

    private void sendToChannel(MarketingCampaign campaign, User user, CampaignRecipient recipient) {
        try {
            switch (recipient.getChannel()) {
                case EMAIL -> sendEmail(campaign, user, recipient);
                case SMS -> sendSms(campaign, user, recipient);
                case PUSH -> sendPush(campaign, user, recipient);
                case IN_APP -> sendInApp(campaign, user, recipient);
            }
        } catch (Exception e) {
            recipient.setStatus(DeliveryStatus.FAILED);
            recipient.setErrorMessage(e.getMessage());
            recipient.setFailedAt(LocalDateTime.now());
            recipientRepository.save(recipient);
            throw e;
        }
    }

    /**
     * Send campaign via EMAIL (AWS SES)
     */
    private void sendEmail(MarketingCampaign campaign, User user, CampaignRecipient recipient) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            recipient.setStatus(DeliveryStatus.SKIPPED);
            recipient.setErrorMessage("No email address");
            recipientRepository.save(recipient);
            return;
        }

        recipient.setContactInfo(user.getEmail());
        recipient.setStatus(DeliveryStatus.SENDING);
        recipientRepository.save(recipient);

        try {
            // Use EmailService to send via AWS SES
            emailService.sendCampaignEmail(
                user.getEmail(),
                user.getFirstName(),
                campaign.getSubjectLine(),
                campaign.getContentHtml(),
                campaign.getContentText(),
                campaign.getId().toString()
            );

            recipient.setStatus(DeliveryStatus.SENT);
            recipient.setSentAt(LocalDateTime.now());
            recipientRepository.save(recipient);

            log.debug("Email sent for campaign {} to user {}", campaign.getId(), user.getId());
        } catch (Exception e) {
            recipient.setStatus(DeliveryStatus.FAILED);
            recipient.setErrorMessage("Email send failed: " + e.getMessage());
            recipient.setFailedAt(LocalDateTime.now());
            recipientRepository.save(recipient);
            throw new RuntimeException("Email send failed", e);
        }
    }

    /**
     * Send campaign via SMS (AWS SNS)
     */
    private void sendSms(MarketingCampaign campaign, User user, CampaignRecipient recipient) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            recipient.setStatus(DeliveryStatus.SKIPPED);
            recipient.setErrorMessage("No phone number");
            recipientRepository.save(recipient);
            return;
        }

        recipient.setContactInfo(user.getPhoneNumber());
        recipient.setStatus(DeliveryStatus.SENDING);
        recipientRepository.save(recipient);

        try {
            // Format SMS message (limit to 160 chars for single SMS)
            String smsContent = formatSmsContent(campaign);

            // Use SmsService to send via AWS SNS
            smsService.sendCampaignSms(user.getPhoneNumber(), smsContent, campaign.getId().toString());

            recipient.setStatus(DeliveryStatus.SENT);
            recipient.setSentAt(LocalDateTime.now());
            recipientRepository.save(recipient);

            log.debug("SMS sent for campaign {} to user {}", campaign.getId(), user.getId());
        } catch (Exception e) {
            recipient.setStatus(DeliveryStatus.FAILED);
            recipient.setErrorMessage("SMS send failed: " + e.getMessage());
            recipient.setFailedAt(LocalDateTime.now());
            recipientRepository.save(recipient);
            throw new RuntimeException("SMS send failed", e);
        }
    }

    /**
     * Send campaign via PUSH notification (Firebase FCM)
     */
    private void sendPush(MarketingCampaign campaign, User user, CampaignRecipient recipient) {
        recipient.setStatus(DeliveryStatus.SENDING);
        recipientRepository.save(recipient);

        try {
            // Create push notification request
            NotificationRequest pushRequest = NotificationRequest.builder()
                .userIds(List.of(user.getId().hashCode() % Long.MAX_VALUE)) // Convert UUID to Long
                .title(campaign.getSubjectLine() != null ? campaign.getSubjectLine() : campaign.getName())
                .body(campaign.getContentText() != null ?
                    truncate(campaign.getContentText(), 200) :
                    campaign.getDescription())
                .type(Notification.NotificationType.MARKETING)
                .data(Map.of(
                    "campaignId", campaign.getId().toString(),
                    "campaignUuid", campaign.getUuid().toString(),
                    "type", "CAMPAIGN"
                ))
                .saveToDatabase(true)
                .build();

            // Send via NotificationService (Firebase FCM)
            notificationService.sendNotification(pushRequest);

            recipient.setStatus(DeliveryStatus.SENT);
            recipient.setSentAt(LocalDateTime.now());
            recipientRepository.save(recipient);

            log.debug("Push notification sent for campaign {} to user {}", campaign.getId(), user.getId());
        } catch (Exception e) {
            recipient.setStatus(DeliveryStatus.FAILED);
            recipient.setErrorMessage("Push send failed: " + e.getMessage());
            recipient.setFailedAt(LocalDateTime.now());
            recipientRepository.save(recipient);
            throw new RuntimeException("Push send failed", e);
        }
    }

    /**
     * Send campaign via IN_APP notification
     */
    private void sendInApp(MarketingCampaign campaign, User user, CampaignRecipient recipient) {
        recipient.setStatus(DeliveryStatus.SENDING);
        recipientRepository.save(recipient);

        try {
            // Create in-app notification record
            Notification notification = Notification.builder()
                .userId(user.getId().hashCode() % Long.MAX_VALUE) // Convert UUID to Long
                .title(campaign.getSubjectLine() != null ? campaign.getSubjectLine() : campaign.getName())
                .body(campaign.getContentText() != null ? campaign.getContentText() : campaign.getDescription())
                .type(Notification.NotificationType.MARKETING)
                .imageUrl(getImageUrl(campaign))
                .data(serializeData(Map.of(
                    "campaignId", campaign.getId().toString(),
                    "campaignUuid", campaign.getUuid().toString()
                )))
                .sent(true)
                .read(false)
                .build();

            notificationRepository.save(notification);

            recipient.setStatus(DeliveryStatus.DELIVERED);
            recipient.setSentAt(LocalDateTime.now());
            recipient.setDeliveredAt(LocalDateTime.now());
            recipientRepository.save(recipient);

            log.debug("In-app notification created for campaign {} to user {}", campaign.getId(), user.getId());
        } catch (Exception e) {
            recipient.setStatus(DeliveryStatus.FAILED);
            recipient.setErrorMessage("In-app notification failed: " + e.getMessage());
            recipient.setFailedAt(LocalDateTime.now());
            recipientRepository.save(recipient);
            throw new RuntimeException("In-app notification failed", e);
        }
    }

    // ========================================================================
    // GEOFENCE-TRIGGERED CAMPAIGNS
    // ========================================================================

    /**
     * Called when a user enters a geofence - triggers location-based campaigns
     */
    @Transactional
    public void onGeofenceEntry(UUID userId, String geofenceId, double latitude, double longitude) {
        log.info("Geofence entry detected: user={}, geofence={}", userId, geofenceId);

        // Find active location-based campaigns
        List<MarketingCampaign> locationCampaigns = campaignRepository
            .findActiveCampaignsWithGeofencing();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found for geofence trigger: {}", userId);
            return;
        }

        for (MarketingCampaign campaign : locationCampaigns) {
            try {
                // Check if user is in target segment
                if (!isUserInTargetSegment(campaign, user)) {
                    continue;
                }

                // Check if already sent to this user
                for (String channelStr : campaign.getChannels()) {
                    Channel channel = Channel.valueOf(channelStr.toUpperCase());

                    if (recipientRepository.existsByCampaignIdAndUserIdAndChannel(
                            campaign.getId(), userId, channel)) {
                        continue;
                    }

                    // Create recipient with geofence info
                    CampaignRecipient recipient = CampaignRecipient.builder()
                        .campaignId(campaign.getId())
                        .userId(userId)
                        .channel(channel)
                        .status(DeliveryStatus.PENDING)
                        .triggeredByGeofence(true)
                        .geofenceId(geofenceId)
                        .triggerLatitude(latitude)
                        .triggerLongitude(longitude)
                        .build();
                    recipientRepository.save(recipient);

                    // Send immediately
                    sendToChannel(campaign, user, recipient);

                    log.info("Geofence-triggered campaign {} sent to user {} via {}",
                        campaign.getId(), userId, channel);
                }
            } catch (Exception e) {
                log.error("Failed to process geofence campaign {} for user {}: {}",
                    campaign.getId(), userId, e.getMessage());
            }
        }
    }

    // ========================================================================
    // METRICS & TRACKING
    // ========================================================================

    /**
     * Get campaign execution metrics
     */
    public CampaignMetrics getCampaignMetrics(Long campaignId) {
        return CampaignMetrics.builder()
            .campaignId(campaignId)
            .totalSent(recipientRepository.countSentByCampaign(campaignId))
            .totalDelivered(recipientRepository.countDeliveredByCampaign(campaignId))
            .totalOpened(recipientRepository.countOpenedByCampaign(campaignId))
            .totalClicked(recipientRepository.countClickedByCampaign(campaignId))
            .totalConverted(recipientRepository.countConvertedByCampaign(campaignId))
            .totalFailed(recipientRepository.countFailedByCampaign(campaignId))
            .build();
    }

    /**
     * Record that a campaign message was opened
     */
    @Transactional
    public void recordOpen(UUID recipientUuid) {
        recipientRepository.findByUuid(recipientUuid).ifPresent(recipient -> {
            recipient.setOpenedAt(LocalDateTime.now());
            recipient.setOpenCount(recipient.getOpenCount() + 1);
            if (recipient.getStatus() == DeliveryStatus.SENT ||
                recipient.getStatus() == DeliveryStatus.DELIVERED) {
                recipient.setStatus(DeliveryStatus.OPENED);
            }
            recipientRepository.save(recipient);
        });
    }

    /**
     * Record that a campaign link was clicked
     */
    @Transactional
    public void recordClick(UUID recipientUuid, String linkUrl) {
        recipientRepository.findByUuid(recipientUuid).ifPresent(recipient -> {
            recipient.setClickedAt(LocalDateTime.now());
            recipient.setClickCount(recipient.getClickCount() + 1);
            if (recipient.getStatus() == DeliveryStatus.SENT ||
                recipient.getStatus() == DeliveryStatus.DELIVERED ||
                recipient.getStatus() == DeliveryStatus.OPENED) {
                recipient.setStatus(DeliveryStatus.CLICKED);
            }

            Map<String, Object> metadata = recipient.getMetadata();
            if (metadata == null) {
                metadata = new HashMap<>();
            }
            metadata.put("lastClickedLink", linkUrl);
            metadata.put("lastClickedAt", LocalDateTime.now().toString());
            recipient.setMetadata(metadata);

            recipientRepository.save(recipient);
        });
    }

    /**
     * Record a conversion (e.g., offer redemption)
     */
    @Transactional
    public void recordConversion(UUID recipientUuid, String conversionType, Map<String, Object> conversionData) {
        recipientRepository.findByUuid(recipientUuid).ifPresent(recipient -> {
            recipient.setConvertedAt(LocalDateTime.now());
            recipient.setStatus(DeliveryStatus.CONVERTED);

            Map<String, Object> metadata = recipient.getMetadata();
            if (metadata == null) {
                metadata = new HashMap<>();
            }
            metadata.put("conversionType", conversionType);
            metadata.put("conversionData", conversionData);
            recipient.setMetadata(metadata);

            recipientRepository.save(recipient);
        });
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private List<User> getTargetUsers(MarketingCampaign campaign) {
        // If segment is specified, get users from segment
        if (campaign.getSegmentId() != null) {
            MarketingSegment segment = segmentRepository.findById(campaign.getSegmentId())
                .orElse(null);

            if (segment != null) {
                return getUsersFromSegment(segment, campaign.getCouncilId());
            }
        }

        // If target audience criteria is specified
        if (campaign.getTargetAudience() != null && !campaign.getTargetAudience().isEmpty()) {
            return getUsersFromAudienceCriteria(campaign.getTargetAudience(), campaign.getCouncilId());
        }

        // Default: all active users in the council
        if (campaign.getCouncilId() != null) {
            return userRepository.findByCouncilId(
                UUID.fromString(campaign.getCouncilId().toString()),
                PageRequest.of(0, 10000)
            ).getContent();
        }

        return Collections.emptyList();
    }

    private List<User> getUsersFromSegment(MarketingSegment segment, Long councilId) {
        Map<String, Object> rules = segment.getRules();
        if (rules == null || rules.isEmpty()) {
            return Collections.emptyList();
        }

        // Apply segment rules to query users
        // This is a simplified implementation - in production, use dynamic query building
        String segmentType = segment.getSegmentType().name();

        return switch (segmentType) {
            case "ALL_USERS" -> userRepository.findAll(PageRequest.of(0, 10000)).getContent();
            case "ACTIVE_SUBSCRIBERS" -> userRepository.findAll(PageRequest.of(0, 10000)).getContent()
                .stream()
                .filter(u -> u.getIsActive() != null && u.getIsActive())
                .collect(Collectors.toList());
            case "SCOUTS" -> userRepository.findByRole(User.UserRole.SCOUT, PageRequest.of(0, 10000)).getContent();
            case "PARENTS" -> userRepository.findByRole(User.UserRole.PARENT, PageRequest.of(0, 10000)).getContent();
            case "TROOP_LEADERS" -> userRepository.findByRole(User.UserRole.TROOP_LEADER, PageRequest.of(0, 10000)).getContent();
            default -> Collections.emptyList();
        };
    }

    private List<User> getUsersFromAudienceCriteria(Map<String, Object> criteria, Long councilId) {
        // Build query based on audience criteria
        List<User> users = userRepository.findAll(PageRequest.of(0, 10000)).getContent();

        // Apply filters
        if (criteria.containsKey("roles")) {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) criteria.get("roles");
            users = users.stream()
                .filter(u -> roles.contains(u.getRole().name()))
                .collect(Collectors.toList());
        }

        if (criteria.containsKey("isActive")) {
            boolean isActive = (Boolean) criteria.get("isActive");
            users = users.stream()
                .filter(u -> u.getIsActive() != null && u.getIsActive() == isActive)
                .collect(Collectors.toList());
        }

        return users;
    }

    private boolean isUserInTargetSegment(MarketingCampaign campaign, User user) {
        if (campaign.getSegmentId() == null &&
            (campaign.getTargetAudience() == null || campaign.getTargetAudience().isEmpty())) {
            return true; // No targeting = everyone
        }

        List<User> targetUsers = getTargetUsers(campaign);
        return targetUsers.stream().anyMatch(u -> u.getId().equals(user.getId()));
    }

    private CampaignRecipient createRecipient(MarketingCampaign campaign, User user, Channel channel) {
        CampaignRecipient recipient = CampaignRecipient.builder()
            .campaignId(campaign.getId())
            .userId(user.getId())
            .channel(channel)
            .status(DeliveryStatus.PENDING)
            .build();
        return recipientRepository.save(recipient);
    }

    private String formatSmsContent(MarketingCampaign campaign) {
        String content = campaign.getContentText();
        if (content == null || content.isBlank()) {
            content = campaign.getDescription();
        }
        if (content == null) {
            content = campaign.getName();
        }

        // Prepend identifier and truncate to SMS limit
        String prefix = "Camp Card: ";
        int maxLength = 160 - prefix.length() - 20; // Leave room for opt-out

        if (content.length() > maxLength) {
            content = content.substring(0, maxLength - 3) + "...";
        }

        return prefix + content + " Reply STOP to unsubscribe.";
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }

    private String getImageUrl(MarketingCampaign campaign) {
        if (campaign.getContentJson() != null && campaign.getContentJson().containsKey("imageUrl")) {
            return (String) campaign.getContentJson().get("imageUrl");
        }
        return null;
    }

    private String serializeData(Map<String, String> data) {
        if (data == null || data.isEmpty()) return null;
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data);
        } catch (Exception e) {
            return null;
        }
    }

    // ========================================================================
    // RESULT CLASSES
    // ========================================================================

    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    public static class CampaignExecutionResult {
        private Long campaignId;
        private int successCount;
        private int failureCount;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    public static class CampaignMetrics {
        private Long campaignId;
        private long totalSent;
        private long totalDelivered;
        private long totalOpened;
        private long totalClicked;
        private long totalConverted;
        private long totalFailed;

        public double getDeliveryRate() {
            return totalSent > 0 ? (double) totalDelivered / totalSent * 100 : 0;
        }

        public double getOpenRate() {
            return totalDelivered > 0 ? (double) totalOpened / totalDelivered * 100 : 0;
        }

        public double getClickRate() {
            return totalOpened > 0 ? (double) totalClicked / totalOpened * 100 : 0;
        }

        public double getConversionRate() {
            return totalClicked > 0 ? (double) totalConverted / totalClicked * 100 : 0;
        }
    }
}
