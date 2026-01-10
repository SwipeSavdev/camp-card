package com.bsa.campcard.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIModifyContentRequest {

    @NotBlank(message = "Original content is required")
    private String originalContent;

    @NotBlank(message = "Modification instructions are required")
    private String modificationInstructions;

    private String contentType; // EMAIL_SUBJECT, EMAIL_BODY, PUSH_NOTIFICATION, SMS, IN_APP_MESSAGE
    private String campaignId;
}
