package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "offer_redemptions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
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
    @Builder.Default
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
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // QR code tracking fields
    // NOTE: These fields are temporarily disabled until DBA adds columns to RDS
    // See V019 migration file for the required ALTER TABLE statements
    @Transient
    private String redemptionToken;

    @Transient
    private LocalDateTime tokenExpiresAt;

    @Transient
    @Builder.Default
    private Integer scanCount = 0;

    @Transient
    private LocalDateTime lastScannedAt;

    @Transient
    private String lastScanDeviceFingerprint;

    @Transient
    @Builder.Default
    private Boolean flaggedForAbuse = false;

    @Transient
    private String abuseFlagReason;

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

    /**
     * Flag this redemption for abuse
     */
    public void flagForAbuse(String reason) {
        this.flaggedForAbuse = true;
        this.abuseFlagReason = reason;
    }

    /**
     * Record a scan of this redemption's QR code
     */
    public void recordScan(String deviceFingerprint) {
        this.scanCount = (this.scanCount != null ? this.scanCount : 0) + 1;
        this.lastScannedAt = LocalDateTime.now();
        this.lastScanDeviceFingerprint = deviceFingerprint;
    }
}
