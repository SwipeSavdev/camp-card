package com.bsa.campcard.dto.ai;

import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CampaignSuggestion {
    private String suggestedName;
    private CampaignType suggestedType;
    private List<String> recommendedChannels;
    private String contentTheme;
    private String rawSuggestion;
    private LocalDateTime generatedAt;
}
