package com.bsa.campcard.dto;

import com.bsa.campcard.entity.OfferRedemption;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferRedemptionResponse {
    private Long id;
    private UUID uuid;
    private Long offerId;
    private String offerTitle;
    private UUID userId;
    private String userName;
    private Long merchantId;
    private String merchantName;
    private Long merchantLocationId;
    private String locationName;
    private BigDecimal purchaseAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String verificationCode;
    private String status;
    private LocalDateTime redeemedAt;
    private LocalDateTime verifiedAt;
    private String notes;
    private LocalDateTime createdAt;
    
    public static OfferRedemptionResponse fromEntity(OfferRedemption redemption) {
        OfferRedemptionResponse response = new OfferRedemptionResponse();
        response.setId(redemption.getId());
        response.setUuid(redemption.getUuid());
        response.setOfferId(redemption.getOfferId());
        response.setUserId(redemption.getUserId());
        response.setMerchantId(redemption.getMerchantId());
        response.setMerchantLocationId(redemption.getMerchantLocationId());
        response.setPurchaseAmount(redemption.getPurchaseAmount());
        response.setDiscountAmount(redemption.getDiscountAmount());
        response.setFinalAmount(redemption.getFinalAmount());
        response.setVerificationCode(redemption.getVerificationCode());
        response.setStatus(redemption.getStatus().name());
        response.setRedeemedAt(redemption.getRedeemedAt());
        response.setVerifiedAt(redemption.getVerifiedAt());
        response.setNotes(redemption.getNotes());
        response.setCreatedAt(redemption.getCreatedAt());
        return response;
    }
}
