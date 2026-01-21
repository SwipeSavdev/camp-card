package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks which notifications have been sent to avoid duplicates.
 * Used for expiry reminders, unused card alerts, and gift claim reminders.
 */
@Entity
@Table(name = "card_notification_log",
       uniqueConstraints = @UniqueConstraint(columnNames = {"camp_card_id", "notification_type"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardNotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camp_card_id", nullable = false)
    private Long campCardId;

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType;

    @Column(name = "sent_at", nullable = false)
    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    /**
     * Notification type constants
     */
    public static final String EXPIRY_30_DAYS = "EXPIRY_30_DAYS";
    public static final String EXPIRY_15_DAYS = "EXPIRY_15_DAYS";
    public static final String EXPIRY_7_DAYS = "EXPIRY_7_DAYS";
    public static final String EXPIRY_3_DAYS = "EXPIRY_3_DAYS";
    public static final String UNUSED_CARD_REMINDER = "UNUSED_CARD_REMINDER";
    public static final String GIFT_PENDING_3_DAYS = "GIFT_PENDING_3_DAYS";
    public static final String GIFT_PENDING_7_DAYS = "GIFT_PENDING_7_DAYS";
    public static final String GIFT_PENDING_14_DAYS = "GIFT_PENDING_14_DAYS";
}
