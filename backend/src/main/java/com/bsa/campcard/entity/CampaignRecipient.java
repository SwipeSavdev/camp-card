package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Tracks individual campaign delivery to each recipient.
 * Used for delivery status, metrics tracking, and preventing duplicate sends.
 */
@Entity
@Table(name = "campaign_recipients", schema = "campcard",
    indexes = {
        @Index(name = "idx_campaign_recipients_campaign", columnList = "campaign_id"),
        @Index(name = "idx_campaign_recipients_user", columnList = "user_id"),
        @Index(name = "idx_campaign_recipients_status", columnList = "status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_campaign_user_channel", columnNames = {"campaign_id", "user_id", "channel"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "campaign_id", nullable = false)
    private Long campaignId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Channel channel;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    // Contact info used for delivery (email/phone/device token)
    @Column(name = "contact_info", length = 500)
    private String contactInfo;

    // Timestamps
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "clicked_at")
    private LocalDateTime clickedAt;

    @Column(name = "converted_at")
    private LocalDateTime convertedAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    // Error tracking
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "last_retry_at")
    private LocalDateTime lastRetryAt;

    // Engagement tracking
    @Column(name = "open_count")
    private Integer openCount;

    @Column(name = "click_count")
    private Integer clickCount;

    // Metadata for tracking (e.g., link clicked, conversion details)
    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    // Geofence trigger info (if location-based)
    @Column(name = "triggered_by_geofence")
    private Boolean triggeredByGeofence;

    @Column(name = "geofence_id")
    private String geofenceId;

    @Column(name = "trigger_latitude")
    private Double triggerLatitude;

    @Column(name = "trigger_longitude")
    private Double triggerLongitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (status == null) {
            status = DeliveryStatus.PENDING;
        }
        if (retryCount == null) {
            retryCount = 0;
        }
        if (openCount == null) {
            openCount = 0;
        }
        if (clickCount == null) {
            clickCount = 0;
        }
        if (triggeredByGeofence == null) {
            triggeredByGeofence = false;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Channel {
        EMAIL,
        SMS,
        PUSH,
        IN_APP
    }

    public enum DeliveryStatus {
        PENDING,      // Queued for delivery
        SCHEDULED,    // Scheduled for future delivery
        SENDING,      // Currently being sent
        SENT,         // Successfully sent to provider
        DELIVERED,    // Confirmed delivered to device
        OPENED,       // Recipient opened/viewed
        CLICKED,      // Recipient clicked a link
        CONVERTED,    // Recipient completed desired action
        FAILED,       // Delivery failed
        BOUNCED,      // Email bounced
        UNSUBSCRIBED, // User unsubscribed
        SKIPPED       // Skipped (e.g., user preferences)
    }
}
