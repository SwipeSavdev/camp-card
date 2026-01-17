package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletAnalyticsResponse {

    private Integer totalRedemptions;
    private Double totalSavings;
    private Integer thisMonth;
    private String favoriteCategory;
}
