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
@Table(name = "marketing_segments", schema = "campcard")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "council_id")
    private Long councilId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "segment_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private SegmentType segmentType;

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> rules;

    @Column(name = "user_count")
    private Integer userCount;

    @Column(name = "is_system")
    private Boolean isSystem;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "last_computed_at")
    private LocalDateTime lastComputedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (isSystem == null) {
            isSystem = false;
        }
        if (isActive == null) {
            isActive = true;
        }
        if (userCount == null) {
            userCount = 0;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SegmentType {
        // Base types
        BEHAVIORAL,
        DEMOGRAPHIC,
        GEOGRAPHIC,
        TRANSACTIONAL,
        CUSTOM,
        AI_GENERATED,
        // Predefined segment types for CampaignDispatchService
        ALL_USERS,
        ACTIVE_SUBSCRIBERS,
        SCOUTS,
        PARENTS,
        UNIT_LEADERS
    }
}
