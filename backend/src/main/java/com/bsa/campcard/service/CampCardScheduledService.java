package com.bsa.campcard.service;

import com.bsa.campcard.entity.CampCard;
import com.bsa.campcard.entity.CampCard.CampCardStatus;
import com.bsa.campcard.entity.CardNotificationLog;
import com.bsa.campcard.repository.CampCardRepository;
import com.bsa.campcard.repository.CardNotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Scheduled jobs for camp card expiry notifications, reminders, and cleanup.
 *
 * Jobs:
 * - CardExpiryNotificationJob: Send 30/15/7/3-day expiry alerts (Daily @ 9:00 AM)
 * - UnusedCardReminderJob: Remind users with unused cards (Weekly Mondays @ 10:00 AM)
 * - GiftClaimReminderJob: Remind about unclaimed gifts 3/7/14 days (Daily @ 11:00 AM)
 * - ExpireCardsJob: Mark all expired cards (Jan 1 @ 00:01 AM)
 * - CleanupExpiredGiftsJob: Return unclaimed gifts to EXPIRED (Jan 1 @ 00:05 AM)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampCardScheduledService {

    private final CampCardRepository campCardRepository;
    private final CardNotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ==================== EXPIRY NOTIFICATIONS ====================

    /**
     * Send expiry reminders at 30, 15, 7, and 3 days before December 31st.
     * Runs daily at 9:00 AM.
     */
    @Scheduled(cron = "0 0 9 * * *") // Daily at 9:00 AM
    @Transactional
    public void sendExpiryNotifications() {
        log.info("Running card expiry notification job");
        LocalDateTime now = LocalDateTime.now();

        // Check each interval
        sendExpiryNotificationsForDays(30, CardNotificationLog.EXPIRY_30_DAYS, now);
        sendExpiryNotificationsForDays(15, CardNotificationLog.EXPIRY_15_DAYS, now);
        sendExpiryNotificationsForDays(7, CardNotificationLog.EXPIRY_7_DAYS, now);
        sendExpiryNotificationsForDays(3, CardNotificationLog.EXPIRY_3_DAYS, now);

        log.info("Card expiry notification job completed");
    }

    private void sendExpiryNotificationsForDays(int days, String notificationType, LocalDateTime now) {
        // Calculate the date range for cards expiring in exactly 'days' days
        LocalDateTime startOfDay = now.plusDays(days).toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<CampCard> expiringCards = campCardRepository.findCardsExpiringBetween(startOfDay, endOfDay);

        log.info("Found {} cards expiring in {} days", expiringCards.size(), days);

        for (CampCard card : expiringCards) {
            // Check if notification already sent
            if (notificationLogRepository.existsByCampCardIdAndNotificationType(card.getId(), notificationType)) {
                continue;
            }

            // Send notification
            sendExpiryNotification(card, days, notificationType);

            // Log that notification was sent
            CardNotificationLog logEntry = CardNotificationLog.builder()
                    .campCardId(card.getId())
                    .userId(card.getOwnerUserId())
                    .notificationType(notificationType)
                    .build();
            notificationLogRepository.save(logEntry);
        }
    }

    private void sendExpiryNotification(CampCard card, int daysUntilExpiry, String notificationType) {
        if (card.getOwnerUserId() == null) {
            return;
        }

        Optional<User> userOpt = userRepository.findById(card.getOwnerUserId());
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();

        // Calculate unused offers (simplified - actual count would come from redemption tracking)
        int unusedOffersCount = 0; // Could be calculated based on offer redemption history

        // Send email notification for all expiry alerts
        emailService.sendCardExpiryReminder(
            user.getEmail(),
            user.getFullName(),
            card.getCardNumber(),
            daysUntilExpiry,
            card.getExpiresAt().toLocalDate(),
            unusedOffersCount
        );

        log.info("Sent expiry notification to user {}: {} days until card {} expires",
                user.getEmail(), daysUntilExpiry, card.getCardNumber());
    }

    // ==================== UNUSED CARD REMINDERS ====================

    /**
     * Send weekly reminders to users with unused cards.
     * Runs every Monday at 10:00 AM.
     */
    @Scheduled(cron = "0 0 10 * * MON") // Every Monday at 10:00 AM
    @Transactional
    public void sendUnusedCardReminders() {
        log.info("Running unused card reminder job");
        LocalDateTime now = LocalDateTime.now();

        List<UUID> usersWithUnusedCards = campCardRepository.findUsersWithUnusedCards(now);

        log.info("Found {} users with unused cards", usersWithUnusedCards.size());

        for (UUID userId : usersWithUnusedCards) {
            sendUnusedCardReminder(userId);
        }

        log.info("Unused card reminder job completed");
    }

    private void sendUnusedCardReminder(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        List<CampCard> unusedCards = campCardRepository.findUnusedCardsByUserId(userId, LocalDateTime.now());

        if (unusedCards.isEmpty()) {
            return;
        }

        String message = String.format("You have %d unused Camp Cards. Gift them or use for more offers!",
                unusedCards.size());

        // TODO: Send push notification
        log.info("Sending unused card reminder to user {}: {}", user.getEmail(), message);
    }

    // ==================== GIFT CLAIM REMINDERS ====================

    /**
     * Send reminders about unclaimed gifts at 3, 7, and 14 days.
     * Runs daily at 11:00 AM.
     */
    @Scheduled(cron = "0 0 11 * * *") // Daily at 11:00 AM
    @Transactional
    public void sendGiftClaimReminders() {
        log.info("Running gift claim reminder job");
        LocalDateTime now = LocalDateTime.now();

        // Send reminders at 3, 7, and 14 days
        sendGiftReminderForDays(3, CardNotificationLog.GIFT_PENDING_3_DAYS, now);
        sendGiftReminderForDays(7, CardNotificationLog.GIFT_PENDING_7_DAYS, now);
        sendGiftReminderForDays(14, CardNotificationLog.GIFT_PENDING_14_DAYS, now);

        log.info("Gift claim reminder job completed");
    }

    private void sendGiftReminderForDays(int days, String notificationType, LocalDateTime now) {
        // Find gifts sent exactly 'days' ago that haven't been claimed
        LocalDateTime startOfDay = now.minusDays(days).toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<CampCard> pendingGifts = campCardRepository.findGiftedCardsBetweenDates(startOfDay, endOfDay);

        log.info("Found {} unclaimed gifts from {} days ago", pendingGifts.size(), days);

        for (CampCard card : pendingGifts) {
            // Check if notification already sent
            if (notificationLogRepository.existsByCampCardIdAndNotificationType(card.getId(), notificationType)) {
                continue;
            }

            // Send reminder to the original purchaser (sender)
            sendGiftClaimReminder(card, days);

            // Log notification
            CardNotificationLog logEntry = CardNotificationLog.builder()
                    .campCardId(card.getId())
                    .userId(card.getOriginalPurchaserId())
                    .notificationType(notificationType)
                    .build();
            notificationLogRepository.save(logEntry);
        }
    }

    private void sendGiftClaimReminder(CampCard card, int daysSinceGifted) {
        if (card.getOriginalPurchaserId() == null) {
            return;
        }

        Optional<User> senderOpt = userRepository.findById(card.getOriginalPurchaserId());
        if (senderOpt.isEmpty()) {
            return;
        }

        User sender = senderOpt.get();

        // Send reminder email to the gift recipient
        emailService.sendGiftClaimReminder(
            card.getGiftedToEmail(),
            sender.getFullName(),
            null, // recipientName not stored
            card.getGiftClaimToken(),
            card.getCardNumber(),
            daysSinceGifted,
            card.getExpiresAt().toLocalDate()
        );

        log.info("Sent gift claim reminder ({} days) for card {} to recipient {}",
                daysSinceGifted, card.getId(), card.getGiftedToEmail());
    }

    // ==================== CARD EXPIRATION JOB ====================

    /**
     * Mark all cards as expired on January 1st.
     * Runs January 1st at 00:01 AM.
     */
    @Scheduled(cron = "0 1 0 1 1 *") // January 1st at 00:01 AM
    @Transactional
    public void expireCards() {
        log.info("Running card expiration job for new year");
        LocalDateTime now = LocalDateTime.now();

        List<CampCard> expiredCards = campCardRepository.findExpiredCards(now);

        log.info("Found {} cards to expire", expiredCards.size());

        int expiredCount = 0;
        for (CampCard card : expiredCards) {
            card.expire();
            campCardRepository.save(card);
            expiredCount++;
        }

        log.info("Expired {} cards", expiredCount);
    }

    // ==================== CLEANUP EXPIRED GIFTS ====================

    /**
     * Mark unclaimed gifts as expired on January 1st.
     * Runs January 1st at 00:05 AM.
     */
    @Scheduled(cron = "0 5 0 1 1 *") // January 1st at 00:05 AM
    @Transactional
    public void cleanupExpiredGifts() {
        log.info("Running expired gifts cleanup job");
        LocalDateTime now = LocalDateTime.now();

        // Find all gifted cards that have expired
        List<CampCard> expiredGifts = campCardRepository.findExpiredCards(now).stream()
                .filter(card -> card.getStatus() == CampCardStatus.GIFTED)
                .toList();

        log.info("Found {} expired unclaimed gifts", expiredGifts.size());

        for (CampCard card : expiredGifts) {
            // Mark as expired (not claimed in time)
            card.expire();
            campCardRepository.save(card);

            // Notify original purchaser
            notifyGiftExpired(card);
        }

        log.info("Cleaned up {} expired gifts", expiredGifts.size());
    }

    private void notifyGiftExpired(CampCard card) {
        if (card.getOriginalPurchaserId() == null) {
            return;
        }

        Optional<User> senderOpt = userRepository.findById(card.getOriginalPurchaserId());
        if (senderOpt.isEmpty()) {
            return;
        }

        User sender = senderOpt.get();

        // Send notification to sender that their gift expired
        emailService.sendGiftExpiredNotification(
            sender.getEmail(),
            sender.getFullName(),
            card.getGiftedToEmail(),
            card.getCardNumber()
        );

        log.info("Sent gift expired notification to sender {} for card {}",
                sender.getEmail(), card.getId());
    }

    // ==================== MANUAL TRIGGER METHODS (FOR TESTING) ====================

    /**
     * Manually trigger expiry notifications (for testing)
     */
    public void triggerExpiryNotifications() {
        sendExpiryNotifications();
    }

    /**
     * Manually trigger unused card reminders (for testing)
     */
    public void triggerUnusedCardReminders() {
        sendUnusedCardReminders();
    }

    /**
     * Manually trigger gift claim reminders (for testing)
     */
    public void triggerGiftClaimReminders() {
        sendGiftClaimReminders();
    }

    /**
     * Manually trigger card expiration (for testing)
     */
    public void triggerExpireCards() {
        expireCards();
    }
}
