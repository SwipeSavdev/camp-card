package com.bsa.campcard.dto.subscription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanResponse {
    private Long id;
    private UUID uuid;
    private String name;
    private String description;
    private Integer priceCents;
    private String currency;
    private String billingInterval; // MONTHLY, ANNUAL
    private Integer trialDays;
    private List<String> features;
}
