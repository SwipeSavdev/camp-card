package com.bsa.campcard.dto.offer;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request object for scanning/validating a QR code.
 * Sent by merchants when they scan a customer's QR code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrScanRequest {

    /**
     * The scanned QR code token
     */
    @NotBlank(message = "Token is required")
    private String token;

    /**
     * Device fingerprint for fraud detection (hash of device characteristics)
     */
    private String deviceFingerprint;

    /**
     * IP address of the scanning device
     */
    private String ipAddress;

    /**
     * User agent string of the scanning device
     */
    private String userAgent;

    /**
     * Latitude of scan location (optional, for geo-verification)
     */
    private BigDecimal latitude;

    /**
     * Longitude of scan location (optional, for geo-verification)
     */
    private BigDecimal longitude;

    /**
     * Purchase amount for discount calculation
     */
    private BigDecimal purchaseAmount;

    /**
     * Merchant location ID (if applicable)
     */
    private Long merchantLocationId;

    /**
     * ID of the merchant employee scanning the code
     */
    private String scannedByUserId;
}
