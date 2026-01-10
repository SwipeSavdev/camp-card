package com.bsa.campcard.dto;

import com.bsa.campcard.entity.SavedCampaign.SaveType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class SavedCampaignDTO {
    private Long id;
    private UUID uuid;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Campaign configuration is required")
    private Map<String, Object> campaignConfig;

    private SaveType saveType;
    private Long sourceCampaignId;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
