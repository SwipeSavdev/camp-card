package com.bsa.campcard.dto;

import com.bsa.campcard.entity.MarketingCampaign.CampaignStatus;
import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class CampaignDTO {
    private Long id;
    private UUID uuid;

    @NotBlank(message = "Campaign name is required")
    private String name;

    private String description;

    @NotNull(message = "Campaign type is required")
    private CampaignType campaignType;

    private CampaignStatus status;

    // Content
    private String subjectLine;
    private String contentHtml;
    private String contentText;
    private Map<String, Object> contentJson;

    // AI
    private Boolean aiGenerated;
    private String aiPrompt;
    private String aiModel;

    // Targeting
    private Long segmentId;
    private String segmentName;
    private Map<String, Object> targetAudience;
    private Integer estimatedReach;

    // Channels
    private String[] channels;

    // Scheduling
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    // Settings
    private Boolean enableGeofencing;
    private Boolean enableGamification;
    private Boolean enableAiOptimization;

    // Associated entities
    private Long merchantId;
    private String merchantName;
    private Long offerId;
    private String offerName;

    // Metadata
    private String[] tags;
    private Map<String, Object> metadata;

    // Metrics (for responses)
    private Integer messagesSent;
    private Integer messagesDelivered;
    private Integer opens;
    private Integer clicks;
    private Integer conversions;
    private Double openRate;
    private Double clickRate;
    private Double conversionRate;
    private Double roi;

    // Audit
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
