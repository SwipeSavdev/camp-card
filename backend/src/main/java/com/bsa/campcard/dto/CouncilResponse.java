package com.bsa.campcard.dto;

import com.bsa.campcard.entity.Council;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilResponse {

    private Long id;
    private UUID uuid;
    private String councilNumber;
    private String name;
    private String shortName;
    private String region;

    // Address
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String location; // Combined city, state for frontend

    // Contact
    private String phone;
    private String email;
    private String websiteUrl;
    private String logoUrl;

    // Personnel
    private String scoutExecutiveName;
    private String scoutExecutiveEmail;
    private String campCardCoordinatorName;
    private String campCardCoordinatorEmail;
    private String campCardCoordinatorPhone;

    // Statistics
    private Integer totalTroops;
    private Integer totalScouts;
    private BigDecimal totalSales;
    private Integer cardsSold;

    // Campaign
    private LocalDate campaignStartDate;
    private LocalDate campaignEndDate;
    private BigDecimal goalAmount;
    private Double campaignProgress; // Calculated percentage

    // Status
    private String status;
    private String subscriptionTier;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert entity to response DTO
     */
    public static CouncilResponse fromEntity(Council council) {
        if (council == null) {
            return null;
        }

        String location = null;
        if (council.getCity() != null || council.getState() != null) {
            location = (council.getCity() != null ? council.getCity() : "") +
                      (council.getCity() != null && council.getState() != null ? ", " : "") +
                      (council.getState() != null ? council.getState() : "");
        }

        Double progress = null;
        if (council.getGoalAmount() != null && council.getGoalAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = council.getTotalSales()
                .divide(council.getGoalAmount(), 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        return CouncilResponse.builder()
            .id(council.getId())
            .uuid(council.getUuid())
            .councilNumber(council.getCouncilNumber())
            .name(council.getName())
            .shortName(council.getShortName())
            .region(council.getRegion())
            .streetAddress(council.getStreetAddress())
            .city(council.getCity())
            .state(council.getState())
            .zipCode(council.getZipCode())
            .location(location)
            .phone(council.getPhone())
            .email(council.getEmail())
            .websiteUrl(council.getWebsiteUrl())
            .logoUrl(council.getLogoUrl())
            .scoutExecutiveName(council.getScoutExecutiveName())
            .scoutExecutiveEmail(council.getScoutExecutiveEmail())
            .campCardCoordinatorName(council.getCampCardCoordinatorName())
            .campCardCoordinatorEmail(council.getCampCardCoordinatorEmail())
            .campCardCoordinatorPhone(council.getCampCardCoordinatorPhone())
            .totalTroops(council.getTotalTroops())
            .totalScouts(council.getTotalScouts())
            .totalSales(council.getTotalSales())
            .cardsSold(council.getCardsSold())
            .campaignStartDate(council.getCampaignStartDate())
            .campaignEndDate(council.getCampaignEndDate())
            .goalAmount(council.getGoalAmount())
            .campaignProgress(progress)
            .status(council.getStatus() != null ? council.getStatus().name() : null)
            .subscriptionTier(council.getSubscriptionTier())
            .createdAt(council.getCreatedAt())
            .updatedAt(council.getUpdatedAt())
            .build();
    }
}
