package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // Summary Metrics
    private Long totalTroops;
    private Long activeTroops;
    private Long totalScouts;
    private Long activeScouts;
    private BigDecimal totalSales;
    private Integer totalCardsSold;
    private Long totalReferrals;
    private Long successfulReferrals;
    private Double referralConversionRate;
    private Long totalMerchants;
    private Long activeMerchants;
    private Long totalOffers;
    private Long activeOffers;

    // Trend Data (percentage change from previous period)
    private Double salesTrend;
    private Double scoutsTrend;
    private Double troopsTrend;
    private Double referralsTrend;

    // BSA Reporting Data
    private List<TroopSalesData> troopSales;
    private List<TroopRecruitingData> troopRecruiting;
    private List<ScoutSalesData> scoutSales;
    private List<ScoutReferralData> scoutReferrals;
    private List<CustomerReferralData> customerReferrals;

    // Time series data for charts
    private List<TimeSeriesPoint> salesTrend30Days;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TroopSalesData {
        private Long id;
        private String name;
        private String council;
        private BigDecimal sales;
        private Integer scouts;
        private BigDecimal avgPerScout;
        private Double trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TroopRecruitingData {
        private Long id;
        private String name;
        private String council;
        private Integer newScouts;
        private Integer totalScouts;
        private Integer recruitingGoal;
        private Double percentOfGoal;
        private Double trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoutSalesData {
        private Long id;
        private String name;
        private String troop;
        private BigDecimal sales;
        private Integer cards;
        private Integer referrals;
        private String rank;
        private Double trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoutReferralData {
        private Long id;
        private String name;
        private String troop;
        private Integer referrals;
        private Integer conversions;
        private BigDecimal revenue;
        private Double conversionRate;
        private Double trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerReferralData {
        private String id;
        private String name;
        private String email;
        private Integer referrals;
        private Integer conversions;
        private BigDecimal totalRevenue;
        private BigDecimal avgOrderValue;
        private String lastReferral;
        private Double trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String date;
        private BigDecimal value;
    }
}
