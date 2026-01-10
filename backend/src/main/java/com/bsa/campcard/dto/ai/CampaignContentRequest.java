package com.bsa.campcard.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CampaignContentRequest {

    @NotBlank(message = "Content type is required")
    private String contentType; // EMAIL_SUBJECT, EMAIL_BODY, PUSH_NOTIFICATION, SMS, IN_APP_MESSAGE

    @NotBlank(message = "Campaign type is required")
    private String campaignType; // REACTIVATION, LOYALTY_BOOST, etc.

    private String targetAudience;
    private String merchantName;
    private String offerDetails;
    private String tone; // FORMAL, CASUAL, URGENT, FRIENDLY
    private List<String> keywords;
    private String additionalContext;
    private String model;
    private Double temperature;
    private Integer maxTokens;
}
