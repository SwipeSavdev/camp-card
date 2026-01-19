package com.bsa.campcard.dto;

import com.bsa.campcard.entity.Offer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferResponse {
    private Long id;
    private UUID uuid;
    private Long merchantId;
    private String merchantName;
    private String merchantLogoUrl;
    private String title;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchaseAmount;
    private BigDecimal maxDiscountAmount;
    private String category;
    private String terms;
    private String imageUrl;
    private String status;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer usageLimit;
    private Integer usageLimitPerUser;
    private Integer totalRedemptions;
    private Boolean featured;
    private Boolean scoutExclusive;
    private Boolean requiresQrVerification;
    private Boolean locationSpecific;
    private Long merchantLocationId;
    private String locationName;
    // TODO: Uncomment after DBA adds barcode column
    // private String barcode; // Optional barcode for one-time use offers tracking
    private LocalDateTime createdAt;
    private Boolean isValid;
    private Integer remainingRedemptions;

    // User-specific redemption tracking
    private Integer userRedemptionCount;
    private Boolean userHasReachedLimit;

    public static OfferResponse fromEntity(Offer offer) {
        return fromEntity(offer, null, null);
    }

    public static OfferResponse fromEntity(Offer offer, String merchantName, String merchantLogoUrl) {
        OfferResponse response = new OfferResponse();
        response.setId(offer.getId());
        response.setUuid(offer.getUuid());
        response.setMerchantId(offer.getMerchantId());
        response.setMerchantName(merchantName);
        response.setMerchantLogoUrl(merchantLogoUrl);
        response.setTitle(offer.getTitle());
        response.setDescription(offer.getDescription());
        response.setDiscountType(offer.getDiscountType().name());
        response.setDiscountValue(offer.getDiscountValue());
        response.setMinPurchaseAmount(offer.getMinPurchaseAmount());
        response.setMaxDiscountAmount(offer.getMaxDiscountAmount());
        response.setCategory(offer.getCategory());
        response.setTerms(offer.getTerms());
        response.setImageUrl(offer.getImageUrl());
        response.setStatus(offer.getStatus().name());
        response.setValidFrom(offer.getValidFrom());
        response.setValidUntil(offer.getValidUntil());
        response.setUsageLimit(offer.getUsageLimit());
        response.setUsageLimitPerUser(offer.getUsageLimitPerUser());
        response.setTotalRedemptions(offer.getTotalRedemptions());
        response.setFeatured(offer.getFeatured());
        response.setScoutExclusive(offer.getScoutExclusive());
        response.setRequiresQrVerification(offer.getRequiresQrVerification());
        response.setLocationSpecific(offer.getLocationSpecific());
        response.setMerchantLocationId(offer.getMerchantLocationId());
        // TODO: Uncomment after DBA adds barcode column
        // response.setBarcode(offer.getBarcode());
        response.setCreatedAt(offer.getCreatedAt());
        response.setIsValid(offer.isValid());

        if (offer.getUsageLimit() != null) {
            int remaining = offer.getUsageLimit() - offer.getTotalRedemptions();
            response.setRemainingRedemptions(Math.max(0, remaining));
        }

        return response;
    }

    public static OfferResponse fromEntityWithUserData(Offer offer, String merchantName, String merchantLogoUrl, int userRedemptionCount) {
        OfferResponse response = fromEntity(offer, merchantName, merchantLogoUrl);
        response.setUserRedemptionCount(userRedemptionCount);

        // Determine if user has reached their personal limit for this offer
        Integer userLimit = offer.getUsageLimitPerUser();
        if (userLimit != null) {
            response.setUserHasReachedLimit(userRedemptionCount >= userLimit);
        } else {
            response.setUserHasReachedLimit(false);
        }

        return response;
    }
}
