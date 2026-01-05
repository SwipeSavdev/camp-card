package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RedeemOfferRequest {
    private Long offerId;
    private UUID userId;
    private Long merchantLocationId;
    private BigDecimal purchaseAmount;
    private String notes;
}
