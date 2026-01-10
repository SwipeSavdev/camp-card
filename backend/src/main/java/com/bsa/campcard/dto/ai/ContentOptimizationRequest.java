package com.bsa.campcard.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContentOptimizationRequest {

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Optimization type is required")
    private String optimizationType; // ENGAGEMENT, CONVERSION, CLARITY, BREVITY, TONE

    private String optimizationGoals;
    private String targetAudience;
}
