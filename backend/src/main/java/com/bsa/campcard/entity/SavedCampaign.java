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

@Entity
@Table(name = "saved_campaigns", schema = "campcard")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "council_id")
    private Long councilId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "campaign_config", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> campaignConfig;

    @Column(name = "save_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SaveType saveType;

    @Column(name = "source_campaign_id")
    private Long sourceCampaignId;

    @Column(name = "is_favorite")
    private Boolean isFavorite;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (saveType == null) {
            saveType = SaveType.DRAFT;
        }
        if (isFavorite == null) {
            isFavorite = false;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SaveType {
        DRAFT,
        TEMPLATE,
        FAVORITE,
        ARCHIVED
    }
}
