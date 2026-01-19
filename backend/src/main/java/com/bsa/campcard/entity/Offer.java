package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "offers")
public class Offer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid = UUID.randomUUID();
    
    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;
    
    @Column(name = "discount_value", precision = 10, scale = 2)
    private BigDecimal discountValue;
    
    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount;
    
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;
    
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String terms;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status = OfferStatus.ACTIVE;
    
    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;
    
    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;
    
    @Column(name = "usage_limit")
    private Integer usageLimit;
    
    @Column(name = "usage_limit_per_user")
    private Integer usageLimitPerUser;
    
    @Column(name = "total_redemptions", nullable = false)
    private Integer totalRedemptions = 0;
    
    @Column(name = "featured")
    private Boolean featured = false;
    
    @Column(name = "scout_exclusive")
    private Boolean scoutExclusive = false;
    
    @Column(name = "requires_qr_verification")
    private Boolean requiresQrVerification = true;
    
    @Column(name = "location_specific")
    private Boolean locationSpecific = false;
    
    @Column(name = "merchant_location_id")
    private Long merchantLocationId;

    // TODO: Uncomment after DBA adds barcode column
    // Optional barcode for one-time use offers tracking
    // @Column(name = "barcode")
    // private String barcode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum DiscountType {
        PERCENTAGE,
        FIXED_AMOUNT,
        BUY_ONE_GET_ONE,
        FREE_ITEM,
        SPECIAL_PRICE
    }
    
    public enum OfferStatus {
        DRAFT,
        ACTIVE,
        PAUSED,
        EXPIRED,
        SUSPENDED
    }
    
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == OfferStatus.ACTIVE 
            && now.isAfter(validFrom) 
            && now.isBefore(validUntil)
            && (usageLimit == null || totalRedemptions < usageLimit);
    }
    
    public boolean canRedeem(int userRedemptionCount) {
        if (!isValid()) {
            return false;
        }
        
        if (usageLimitPerUser != null && userRedemptionCount >= usageLimitPerUser) {
            return false;
        }
        
        return true;
    }
    
    public BigDecimal calculateDiscount(BigDecimal purchaseAmount) {
        if (purchaseAmount == null) {
            return BigDecimal.ZERO;
        }
        
        if (minPurchaseAmount != null && purchaseAmount.compareTo(minPurchaseAmount) < 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discount = BigDecimal.ZERO;
        
        switch (discountType) {
            case PERCENTAGE:
                if (discountValue != null) {
                    discount = purchaseAmount.multiply(discountValue).divide(new BigDecimal("100"));
                }
                break;
            case FIXED_AMOUNT:
                discount = discountValue != null ? discountValue : BigDecimal.ZERO;
                break;
            default:
                // BUY_ONE_GET_ONE, FREE_ITEM, SPECIAL_PRICE require manual calculation
                break;
        }
        
        if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
            discount = maxDiscountAmount;
        }
        
        return discount;
    }
}
