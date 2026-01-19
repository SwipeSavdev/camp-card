package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfferRequest {
    private Long merchantId;
    private String title;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchaseAmount;
    private BigDecimal maxDiscountAmount;
    private String category;
    private String terms;
    private String imageUrl;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer usageLimit;
    private Integer usageLimitPerUser;
    private Boolean featured;
    private Boolean scoutExclusive;
    private Boolean requiresQrVerification;
    private Boolean locationSpecific;
    private Long merchantLocationId;
    // TODO: Uncomment after DBA adds barcode column
    // private String barcode; // Optional barcode for one-time use offers tracking
}
