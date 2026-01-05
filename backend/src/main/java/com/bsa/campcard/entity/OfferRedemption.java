package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "offer_redemptions")
public class OfferRedemption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid = UUID.randomUUID();
    
    @Column(name = "offer_id", nullable = false)
    private Long offerId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;
    
    @Column(name = "merchant_location_id")
    private Long merchantLocationId;
    
    @Column(name = "purchase_amount", precision = 10, scale = 2)
    private BigDecimal purchaseAmount;
    
    @Column(name = "discount_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal discountAmount;
    
    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount;
    
    @Column(name = "verification_code", unique = true)
    private String verificationCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RedemptionStatus status = RedemptionStatus.PENDING;
    
    @Column(name = "redeemed_at")
    private LocalDateTime redeemedAt;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "verified_by_user_id")
    private UUID verifiedByUserId;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum RedemptionStatus {
        PENDING,
        VERIFIED,
        COMPLETED,
        CANCELLED,
        EXPIRED
    }
    
    public void verify(UUID verifierId) {
        this.status = RedemptionStatus.VERIFIED;
        this.verifiedAt = LocalDateTime.now();
        this.verifiedByUserId = verifierId;
    }
    
    public void complete() {
        this.status = RedemptionStatus.COMPLETED;
        this.redeemedAt = LocalDateTime.now();
    }
    
    public void cancel() {
        this.status = RedemptionStatus.CANCELLED;
    }
}
