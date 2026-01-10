package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "marketing_campaigns", schema = "campcard")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "council_id")
    private Long councilId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "campaign_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private CampaignType campaignType;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private CampaignStatus status;

    // Content
    @Column(name = "subject_line", length = 255)
    private String subjectLine;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "content_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> contentJson;

    // AI-generated content
    @Column(name = "ai_generated")
    private Boolean aiGenerated;

    @Column(name = "ai_prompt", columnDefinition = "TEXT")
    private String aiPrompt;

    @Column(name = "ai_model", length = 100)
    private String aiModel;

    @Column(name = "ai_generation_metadata", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> aiGenerationMetadata;

    // Targeting
    @Column(name = "segment_id")
    private Long segmentId;

    @Column(name = "target_audience", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> targetAudience;

    @Column(name = "estimated_reach")
    private Integer estimatedReach;

    // Channels
    @Column(name = "channels", columnDefinition = "varchar(100)[]")
    private String[] channels;

    // Scheduling
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Settings
    @Column(name = "enable_geofencing")
    private Boolean enableGeofencing;

    @Column(name = "enable_gamification")
    private Boolean enableGamification;

    @Column(name = "enable_ai_optimization")
    private Boolean enableAiOptimization;

    // Associated entities
    @Column(name = "merchant_id")
    private Long merchantId;

    @Column(name = "offer_id")
    private Long offerId;

    // Metadata
    @Column(name = "tags", columnDefinition = "varchar(50)[]")
    private String[] tags;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    // Audit
    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

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
            status = CampaignStatus.DRAFT;
        }
        if (aiGenerated == null) {
            aiGenerated = false;
        }
        if (enableAiOptimization == null) {
            enableAiOptimization = true;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CampaignType {
        REACTIVATION,
        LOYALTY_BOOST,
        WEEKEND_SPECIAL,
        CATEGORY_PROMO,
        LOCATION_BASED,
        NEW_USER_WELCOME,
        SEASONAL,
        FLASH_SALE,
        REFERRAL_BOOST,
        CUSTOM
    }

    public enum CampaignStatus {
        DRAFT,
        PENDING_APPROVAL,
        APPROVED,
        SCHEDULED,
        SENDING,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED,
        FAILED
    }
}
