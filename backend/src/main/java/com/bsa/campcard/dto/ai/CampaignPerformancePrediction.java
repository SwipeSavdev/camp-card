package com.bsa.campcard.dto.ai;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CampaignPerformancePrediction {
    private Long campaignId;
    private String prediction;
    private Double predictedOpenRate;
    private Double predictedClickRate;
    private Double predictedConversionRate;
    private Double predictedROI;
    private String confidenceLevel;
    private LocalDateTime generatedAt;
}
