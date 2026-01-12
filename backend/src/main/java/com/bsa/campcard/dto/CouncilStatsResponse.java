package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilStatsResponse {

    private Long totalCouncils;
    private Long activeCouncils;
    private Long inactiveCouncils;
    private Long trialCouncils;

    private Long totalScouts;
    private Long totalTroops;
    private BigDecimal totalSales;
    private Long totalCardsSold;

    // By region
    private Map<String, Long> councilsByRegion;

    // Campaign stats
    private Long activeCampaigns;
    private BigDecimal totalGoalAmount;
    private Double overallProgress;
}
