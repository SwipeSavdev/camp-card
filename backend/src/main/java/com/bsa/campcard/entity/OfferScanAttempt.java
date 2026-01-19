package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking QR code scan attempts for anti-abuse detection.
 * Every scan of an offer QR code is logged here for pattern analysis.
 */
@Entity
@Table(name = "offer_scan_attempts", indexes = {
    @Index(name = "idx_offer_scan_attempts_offer_id", columnList = "offer_id"),
    @Index(name = "idx_offer_scan_attempts_user_id", columnList = "user_id"),
    @Index(name = "idx_offer_scan_attempts_redemption_token", columnList = "redemption_token"),
    @Index(name = "idx_offer_scan_attempts_scanned_at", columnList = "scanned_at"),
    @Index(name = "idx_offer_scan_attempts_scan_result", columnList = "scan_result")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferScanAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "offer_id", nullable = false)
    private Long offerId;

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "redemption_id")
    private Long redemptionId;

    @Column(name = "redemption_token", nullable = false, length = 255)
    private String redemptionToken;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt;

    @Column(name = "device_fingerprint", length = 255)
    private String deviceFingerprint;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "scan_result", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ScanResult scanResult = ScanResult.PENDING;

    @Column(name = "was_successful")
    @Builder.Default
    private Boolean wasSuccessful = false;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "is_suspicious")
    @Builder.Default
    private Boolean isSuspicious = false;

    @Column(name = "suspicious_reason", columnDefinition = "TEXT")
    private String suspiciousReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Merchant tracking fields for merchant-side abuse detection
    @Column(name = "merchant_id")
    private Long merchantId;

    @Column(name = "merchant_location_id")
    private Long merchantLocationId;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (scannedAt == null) {
            scannedAt = LocalDateTime.now();
        }
    }

    public enum ScanResult {
        PENDING,          // Scan recorded, not yet processed
        SUCCESS,          // Valid scan, redemption allowed
        ALREADY_REDEEMED, // Offer already used by this user
        EXPIRED,          // Token or offer has expired
        INVALID,          // Invalid or tampered token
        FLAGGED           // Suspicious activity detected
    }

    /**
     * Mark this scan as successful
     */
    public void markSuccess(Long redemptionId) {
        this.scanResult = ScanResult.SUCCESS;
        this.wasSuccessful = true;
        this.redemptionId = redemptionId;
    }

    /**
     * Mark this scan as failed with a reason
     */
    public void markFailed(ScanResult result, String reason) {
        this.scanResult = result;
        this.wasSuccessful = false;
        this.failureReason = reason;
    }

    /**
     * Flag this scan as suspicious
     */
    public void flagSuspicious(String reason) {
        this.isSuspicious = true;
        this.suspiciousReason = reason;
        this.scanResult = ScanResult.FLAGGED;
    }
}
