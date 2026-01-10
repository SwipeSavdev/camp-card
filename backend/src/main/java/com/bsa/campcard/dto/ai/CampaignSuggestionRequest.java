package com.bsa.campcard.dto.ai;

import lombok.Data;

@Data
public class CampaignSuggestionRequest {
    private String businessGoal;
    private String targetSegment;
    private String budgetLevel; // LOW, MEDIUM, HIGH
    private String timeline; // IMMEDIATE, THIS_WEEK, THIS_MONTH, QUARTERLY
    private String previousPerformance;
    private Long councilId;
}
