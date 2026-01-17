package com.bsa.campcard.service;

import com.bsa.campcard.entity.DeviceToken;
import com.bsa.campcard.repository.DeviceTokenRepository;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Push Notification Service for BSA Camp Card
 *
 * Sends branded push notifications via Firebase Cloud Messaging (FCM)
 * to iOS and Android devices.
 *
 * Notification types:
 * - Transactional: Account, security, payment notifications
 * - Engagement: Referrals, milestones, offers
 * - Informational: Updates, announcements
 *
 * All notifications follow BSA Camp Card branding:
 * - Clear, concise messaging
 * - Professional tone for family audiences
 * - Actionable with deep links to relevant screens
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final NotificationService notificationService;

    // BSA Brand Color for Android notifications
    private static final String BSA_NAVY_COLOR = "#003f87";

    // Notification Categories/Channels
    public static final String CHANNEL_ACCOUNT = "account";
    public static final String CHANNEL_SECURITY = "security";
    public static final String CHANNEL_PAYMENT = "payment";
    public static final String CHANNEL_REFERRAL = "referral";
    public static final String CHANNEL_OFFER = "offer";
    public static final String CHANNEL_MILESTONE = "milestone";
    public static final String CHANNEL_TROOP = "troop";
    public static final String CHANNEL_GENERAL = "general";

    // ========================================================================
    // AUTHENTICATION & ACCOUNT NOTIFICATIONS
    // ========================================================================

    /**
     * Notify user of successful email verification
     */
    @Async
    public void sendEmailVerifiedNotification(Long userId) {
        sendPushNotification(
            userId,
            "Email Verified!",
            "Your email has been verified. You now have full access to BSA Camp Card features.",
            CHANNEL_ACCOUNT,
            Map.of(
                "type", "email_verified",
                "screen", "home"
            )
        );
    }

    /**
     * Notify user of password change
     */
    @Async
    public void sendPasswordChangedNotification(Long userId) {
        sendPushNotification(
            userId,
            "Password Changed",
            "Your password was successfully updated. If you didn't make this change, contact support immediately.",
            CHANNEL_SECURITY,
            Map.of(
                "type", "password_changed",
                "screen", "security_settings"
            )
        );
    }

    /**
     * Notify user of new device login
     */
    @Async
    public void sendNewDeviceLoginNotification(Long userId, String deviceInfo) {
        sendPushNotification(
            userId,
            "New Login Detected",
            "New login from " + deviceInfo + ". If this wasn't you, secure your account now.",
            CHANNEL_SECURITY,
            Map.of(
                "type", "new_device_login",
                "screen", "security_settings",
                "device", deviceInfo
            )
        );
    }

    /**
     * Notify user their account was locked
     */
    @Async
    public void sendAccountLockedNotification(Long userId) {
        sendPushNotification(
            userId,
            "Account Temporarily Locked",
            "Your account has been locked due to unusual activity. Contact support to unlock.",
            CHANNEL_SECURITY,
            Map.of(
                "type", "account_locked",
                "screen", "support"
            )
        );
    }

    // ========================================================================
    // WELCOME & ONBOARDING NOTIFICATIONS
    // ========================================================================

    /**
     * Welcome notification for new users
     */
    @Async
    public void sendWelcomeNotification(Long userId, String firstName) {
        sendPushNotification(
            userId,
            "Welcome to BSA Camp Card, " + firstName + "!",
            "Start discovering exclusive offers from local merchants and support Scouts in your community.",
            CHANNEL_GENERAL,
            Map.of(
                "type", "welcome",
                "screen", "offers"
            )
        );
    }

    /**
     * Welcome notification for new Scouts
     */
    @Async
    public void sendScoutWelcomeNotification(Long userId, String scoutName, String referralCode) {
        sendPushNotification(
            userId,
            "Welcome, Scout " + scoutName + "!",
            "Your referral code is " + referralCode + ". Share it to help your troop succeed!",
            CHANNEL_GENERAL,
            Map.of(
                "type", "scout_welcome",
                "screen", "dashboard",
                "referral_code", referralCode
            )
        );
    }

    /**
     * Welcome notification for Troop Leaders
     */
    @Async
    public void sendTroopLeaderWelcomeNotification(Long userId, String firstName, String troopNumber) {
        sendPushNotification(
            userId,
            "Welcome, Troop " + troopNumber + " Leader!",
            "Your dashboard is ready. Start inviting Scouts and track your troop's progress.",
            CHANNEL_TROOP,
            Map.of(
                "type", "leader_welcome",
                "screen", "leader_dashboard",
                "troop_number", troopNumber
            )
        );
    }

    /**
     * Onboarding reminder after 24 hours of inactivity
     */
    @Async
    public void sendOnboardingReminderNotification(Long userId, String firstName) {
        sendPushNotification(
            userId,
            "Don't Miss Out, " + firstName + "!",
            "Complete your profile to unlock all Camp Card features and start saving.",
            CHANNEL_GENERAL,
            Map.of(
                "type", "onboarding_reminder",
                "screen", "profile"
            )
        );
    }

    // ========================================================================
    // REFERRAL NOTIFICATIONS
    // ========================================================================

    /**
     * Notify Scout of new referral signup
     */
    @Async
    public void sendReferralNotification(Long userId, String customerName) {
        sendPushNotification(
            userId,
            "New Referral! 🎉",
            customerName + " just signed up using your link. Keep sharing!",
            CHANNEL_REFERRAL,
            Map.of(
                "type", "new_referral",
                "screen", "referrals",
                "customer_name", customerName
            )
        );
    }

    /**
     * Notify Scout of referral click (engagement tracking)
     */
    @Async
    public void sendReferralClickNotification(Long userId, int totalClicks) {
        sendPushNotification(
            userId,
            "Someone Clicked Your Link!",
            "Your referral link has " + totalClicks + " total clicks. Keep sharing to convert more!",
            CHANNEL_REFERRAL,
            Map.of(
                "type", "referral_click",
                "screen", "referrals",
                "total_clicks", String.valueOf(totalClicks)
            )
        );
    }

    // ========================================================================
    // SALES MILESTONE NOTIFICATIONS
    // ========================================================================

    /**
     * Notify Scout of sales milestone achievement
     */
    @Async
    public void sendMilestoneNotification(Long userId, String scoutName, int salesCount, String milestoneName) {
        sendPushNotification(
            userId,
            "Milestone Achieved! 🏆",
            "Congratulations " + scoutName + "! You've reached " + milestoneName + " with " + salesCount + " sales!",
            CHANNEL_MILESTONE,
            Map.of(
                "type", "milestone_achieved",
                "screen", "achievements",
                "milestone", milestoneName,
                "sales_count", String.valueOf(salesCount)
            )
        );
    }

    /**
     * Notify Scout they're close to next milestone
     */
    @Async
    public void sendMilestoneProgressNotification(Long userId, String milestoneName, int remaining) {
        sendPushNotification(
            userId,
            "Almost There!",
            "Just " + remaining + " more sale" + (remaining == 1 ? "" : "s") + " to reach " + milestoneName + "!",
            CHANNEL_MILESTONE,
            Map.of(
                "type", "milestone_progress",
                "screen", "dashboard",
                "milestone", milestoneName,
                "remaining", String.valueOf(remaining)
            )
        );
    }

    /**
     * Weekly progress summary for Scouts
     */
    @Async
    public void sendWeeklyProgressNotification(Long userId, int weeklySales, int totalSales, int troopRank) {
        String rankSuffix = getRankSuffix(troopRank);
        sendPushNotification(
            userId,
            "Your Weekly Recap 📊",
            weeklySales + " sales this week! You're " + troopRank + rankSuffix + " in your troop with " + totalSales + " total.",
            CHANNEL_MILESTONE,
            Map.of(
                "type", "weekly_progress",
                "screen", "dashboard",
                "weekly_sales", String.valueOf(weeklySales),
                "total_sales", String.valueOf(totalSales),
                "rank", String.valueOf(troopRank)
            )
        );
    }

    // ========================================================================
    // SUBSCRIPTION NOTIFICATIONS
    // ========================================================================

    /**
     * Confirm subscription activation
     */
    @Async
    public void sendSubscriptionActiveNotification(Long userId, String planName) {
        sendPushNotification(
            userId,
            "Subscription Active! ✅",
            "Your " + planName + " subscription is now active. Start exploring exclusive offers!",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "subscription_active",
                "screen", "offers",
                "plan", planName
            )
        );
    }

    /**
     * Subscription expiring reminder
     */
    @Async
    public void sendSubscriptionExpiringNotification(Long userId, int daysRemaining) {
        String urgency = daysRemaining <= 1 ? "⚠️ " : "";
        String timeText = daysRemaining == 1 ? "tomorrow" : "in " + daysRemaining + " days";

        sendPushNotification(
            userId,
            urgency + "Subscription Expiring",
            "Your Camp Card subscription expires " + timeText + ". Renew now to keep your access.",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "subscription_expiring",
                "screen", "subscription",
                "days_remaining", String.valueOf(daysRemaining)
            )
        );
    }

    /**
     * Subscription expired notification
     */
    @Async
    public void sendSubscriptionExpiredNotification(Long userId) {
        sendPushNotification(
            userId,
            "Subscription Expired",
            "Your Camp Card subscription has ended. Renew to continue accessing exclusive offers.",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "subscription_expired",
                "screen", "subscription"
            )
        );
    }

    /**
     * Subscription renewed confirmation
     */
    @Async
    public void sendSubscriptionRenewedNotification(Long userId, LocalDate expirationDate) {
        String dateStr = expirationDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        sendPushNotification(
            userId,
            "Subscription Renewed! 🎉",
            "Thank you! Your subscription is valid until " + dateStr + ".",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "subscription_renewed",
                "screen", "home",
                "expiration", dateStr
            )
        );
    }

    // ========================================================================
    // PAYMENT NOTIFICATIONS
    // ========================================================================

    /**
     * Payment successful confirmation
     */
    @Async
    public void sendPaymentSuccessNotification(Long userId, BigDecimal amount) {
        String amountStr = String.format("$%.2f", amount);
        sendPushNotification(
            userId,
            "Payment Successful",
            "Payment of " + amountStr + " received. Receipt sent to your email.",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "payment_success",
                "screen", "receipts",
                "amount", amountStr
            )
        );
    }

    /**
     * Payment failed notification
     */
    @Async
    public void sendPaymentFailedNotification(Long userId) {
        sendPushNotification(
            userId,
            "Payment Failed",
            "We couldn't process your payment. Please update your payment method.",
            CHANNEL_PAYMENT,
            Map.of(
                "type", "payment_failed",
                "screen", "payment_methods"
            )
        );
    }

    // ========================================================================
    // OFFER NOTIFICATIONS
    // ========================================================================

    /**
     * New offer available near user
     */
    @Async
    public void sendNewOfferNotification(Long userId, String merchantName, String offerTitle) {
        sendPushNotification(
            userId,
            "New Offer Available! 🎁",
            merchantName + " just added \"" + offerTitle + "\" - check it out!",
            CHANNEL_OFFER,
            Map.of(
                "type", "new_offer",
                "screen", "offers",
                "merchant", merchantName
            )
        );
    }

    /**
     * Favorite merchant has new offer
     */
    @Async
    public void sendFavoriteMerchantOfferNotification(Long userId, String merchantName, String offerTitle) {
        sendPushNotification(
            userId,
            "From Your Favorites ❤️",
            merchantName + " has a new offer: \"" + offerTitle + "\"",
            CHANNEL_OFFER,
            Map.of(
                "type", "favorite_offer",
                "screen", "offers",
                "merchant", merchantName
            )
        );
    }

    /**
     * Offer expiring soon reminder
     */
    @Async
    public void sendOfferExpiringNotification(Long userId, String merchantName, String offerTitle, int hoursRemaining) {
        sendPushNotification(
            userId,
            "Offer Expiring Soon! ⏰",
            "\"" + offerTitle + "\" at " + merchantName + " expires in " + hoursRemaining + " hours!",
            CHANNEL_OFFER,
            Map.of(
                "type", "offer_expiring",
                "screen", "offers",
                "merchant", merchantName,
                "hours", String.valueOf(hoursRemaining)
            )
        );
    }

    /**
     * Redemption successful confirmation
     */
    @Async
    public void sendRedemptionConfirmationNotification(Long userId, String merchantName, String offerTitle) {
        sendPushNotification(
            userId,
            "Offer Redeemed! 🎫",
            "You've redeemed \"" + offerTitle + "\" at " + merchantName + ". Enjoy your savings!",
            CHANNEL_OFFER,
            Map.of(
                "type", "redemption_success",
                "screen", "redemption_history",
                "merchant", merchantName
            )
        );
    }

    // ========================================================================
    // TROOP & COUNCIL NOTIFICATIONS
    // ========================================================================

    /**
     * Notify Troop Leader of new Scout registration
     */
    @Async
    public void sendNewScoutJoinedNotification(Long leaderId, String scoutName, String troopNumber) {
        sendPushNotification(
            leaderId,
            "New Scout Joined! 👋",
            scoutName + " has joined Troop " + troopNumber + ". Welcome them in your dashboard.",
            CHANNEL_TROOP,
            Map.of(
                "type", "new_scout",
                "screen", "troop_members",
                "scout_name", scoutName
            )
        );
    }

    /**
     * Troop milestone achieved
     */
    @Async
    public void sendTroopMilestoneNotification(Long userId, String troopNumber, String milestoneName, int totalSales) {
        sendPushNotification(
            userId,
            "Troop " + troopNumber + " Milestone! 🎉",
            "Your troop reached " + milestoneName + " with " + totalSales + " total sales!",
            CHANNEL_TROOP,
            Map.of(
                "type", "troop_milestone",
                "screen", "troop_dashboard",
                "milestone", milestoneName
            )
        );
    }

    /**
     * Weekly troop leaderboard update
     */
    @Async
    public void sendTroopLeaderboardNotification(Long userId, int currentRank, int previousRank, String troopNumber) {
        String movement;
        if (currentRank < previousRank) {
            movement = "You moved up to #" + currentRank + "!";
        } else if (currentRank > previousRank) {
            movement = "You're now #" + currentRank + ". Time to catch up!";
        } else {
            movement = "You're holding steady at #" + currentRank + ".";
        }

        sendPushNotification(
            userId,
            "Troop " + troopNumber + " Leaderboard 📊",
            movement + " Check how your troop is doing.",
            CHANNEL_TROOP,
            Map.of(
                "type", "leaderboard_update",
                "screen", "leaderboard",
                "rank", String.valueOf(currentRank)
            )
        );
    }

    // ========================================================================
    // MERCHANT NOTIFICATIONS
    // ========================================================================

    /**
     * Merchant account approved
     */
    @Async
    public void sendMerchantApprovedNotification(Long userId, String businessName) {
        sendPushNotification(
            userId,
            "Merchant Account Approved! ✅",
            businessName + " is now part of the Camp Card network. Create your first offer!",
            CHANNEL_GENERAL,
            Map.of(
                "type", "merchant_approved",
                "screen", "merchant_dashboard"
            )
        );
    }

    /**
     * New redemption at merchant location
     */
    @Async
    public void sendMerchantRedemptionNotification(Long merchantUserId, String offerTitle, String customerName) {
        sendPushNotification(
            merchantUserId,
            "New Redemption! 💰",
            customerName + " just redeemed \"" + offerTitle + "\" at your location.",
            CHANNEL_GENERAL,
            Map.of(
                "type", "merchant_redemption",
                "screen", "merchant_redemptions"
            )
        );
    }

    // ========================================================================
    // BULK NOTIFICATION METHODS
    // ========================================================================

    /**
     * Send notification to multiple users
     */
    @Async
    public void sendBulkNotification(List<Long> userIds, String title, String body, String channel, Map<String, String> data) {
        for (Long userId : userIds) {
            sendPushNotification(userId, title, body, channel, data);
        }
    }

    /**
     * Send announcement to all active users
     */
    @Async
    public void sendAnnouncementNotification(String title, String body, Map<String, String> data) {
        // This would typically query for all users with active device tokens
        // For now, log the announcement
        log.info("Sending announcement to all users: {} - {}", title, body);
        // Implementation would depend on scale requirements
    }

    // ========================================================================
    // CORE NOTIFICATION METHOD
    // ========================================================================

    /**
     * Send push notification to a specific user via all their registered devices
     */
    private void sendPushNotification(Long userId, String title, String body, String channel, Map<String, String> data) {
        try {
            // Get all active device tokens for user
            List<DeviceToken> tokens = deviceTokenRepository.findByUserIdAndActiveTrue(userId);

            if (tokens.isEmpty()) {
                log.debug("No active device tokens for user: {}", userId);
                return;
            }

            // Add channel and notification metadata to data payload
            Map<String, String> enrichedData = new HashMap<>(data);
            enrichedData.put("channel", channel);
            enrichedData.put("notification_id", java.util.UUID.randomUUID().toString());

            // Group tokens by platform
            Map<DeviceToken.DeviceType, List<String>> tokensByPlatform = tokens.stream()
                    .collect(Collectors.groupingBy(
                            DeviceToken::getDeviceType,
                            Collectors.mapping(DeviceToken::getToken, Collectors.toList())
                    ));

            // Build notification
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            // Send to iOS devices
            if (tokensByPlatform.containsKey(DeviceToken.DeviceType.IOS)) {
                sendToIOS(tokensByPlatform.get(DeviceToken.DeviceType.IOS), notification, enrichedData, channel);
            }

            // Send to Android devices
            if (tokensByPlatform.containsKey(DeviceToken.DeviceType.ANDROID)) {
                sendToAndroid(tokensByPlatform.get(DeviceToken.DeviceType.ANDROID), notification, enrichedData, channel);
            }

            log.info("Push notification sent to user {} - {} devices", userId, tokens.size());

        } catch (Exception e) {
            log.error("Failed to send push notification to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send to iOS devices via FCM with APNs configuration
     */
    private void sendToIOS(List<String> tokens, Notification notification, Map<String, String> data, String channel) {
        try {
            // Build APNs configuration
            ApnsConfig apnsConfig = ApnsConfig.builder()
                    .setAps(Aps.builder()
                            .setSound("default")
                            .setBadge(1)
                            .setCategory(channel)
                            .setThreadId(channel)
                            .build())
                    .putHeader("apns-priority", "10")
                    .putHeader("apns-push-type", "alert")
                    .build();

            // Send in batches of 500 (FCM limit)
            for (int i = 0; i < tokens.size(); i += 500) {
                List<String> batch = tokens.subList(i, Math.min(i + 500, tokens.size()));

                MulticastMessage message = MulticastMessage.builder()
                        .setNotification(notification)
                        .putAllData(data)
                        .setApnsConfig(apnsConfig)
                        .addAllTokens(batch)
                        .build();

                BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
                handleSendResponse(response, batch, "iOS");
            }

        } catch (FirebaseMessagingException e) {
            log.error("Error sending to iOS devices: {}", e.getMessage());
        }
    }

    /**
     * Send to Android devices via FCM
     */
    private void sendToAndroid(List<String> tokens, Notification notification, Map<String, String> data, String channel) {
        try {
            // Build Android configuration with BSA branding
            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .setNotification(AndroidNotification.builder()
                            .setSound("default")
                            .setColor(BSA_NAVY_COLOR)
                            .setChannelId(channel)
                            .setIcon("ic_notification")
                            .build())
                    .build();

            // Send in batches of 500 (FCM limit)
            for (int i = 0; i < tokens.size(); i += 500) {
                List<String> batch = tokens.subList(i, Math.min(i + 500, tokens.size()));

                MulticastMessage message = MulticastMessage.builder()
                        .setNotification(notification)
                        .putAllData(data)
                        .setAndroidConfig(androidConfig)
                        .addAllTokens(batch)
                        .build();

                BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
                handleSendResponse(response, batch, "Android");
            }

        } catch (FirebaseMessagingException e) {
            log.error("Error sending to Android devices: {}", e.getMessage());
        }
    }

    /**
     * Handle FCM send response and clean up invalid tokens
     */
    private void handleSendResponse(BatchResponse response, List<String> tokens, String platform) {
        log.info("{} notifications - Success: {}, Failure: {}",
                platform, response.getSuccessCount(), response.getFailureCount());

        // Handle failed tokens
        if (response.getFailureCount() > 0) {
            List<SendResponse> responses = response.getResponses();
            for (int i = 0; i < responses.size(); i++) {
                if (!responses.get(i).isSuccessful()) {
                    FirebaseMessagingException exception = responses.get(i).getException();
                    if (exception != null) {
                        String errorCode = exception.getMessagingErrorCode() != null
                                ? exception.getMessagingErrorCode().name()
                                : "UNKNOWN";

                        // Deactivate invalid tokens
                        if ("UNREGISTERED".equals(errorCode) || "INVALID_ARGUMENT".equals(errorCode)) {
                            String invalidToken = tokens.get(i);
                            deactivateToken(invalidToken);
                        }
                    }
                }
            }
        }
    }

    /**
     * Deactivate an invalid device token
     */
    private void deactivateToken(String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceToken -> {
            deviceToken.setActive(false);
            deviceTokenRepository.save(deviceToken);
            log.info("Deactivated invalid device token");
        });
    }

    /**
     * Get ordinal suffix for rank (1st, 2nd, 3rd, etc.)
     */
    private String getRankSuffix(int rank) {
        if (rank >= 11 && rank <= 13) {
            return "th";
        }
        return switch (rank % 10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };
    }
}
