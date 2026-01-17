package com.bsa.campcard.dto.subscription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String id; // UUID as string
    private SubscriptionPlanResponse plan;
    private String status;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private Boolean cancelAtPeriodEnd;
    private Boolean autoRenew;
    private ScoutAttribution scoutAttribution;
    private Double totalSavings; // Calculated from redemptions
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoutAttribution {
        private String scoutName;
        private String troopNumber;
    }
}
