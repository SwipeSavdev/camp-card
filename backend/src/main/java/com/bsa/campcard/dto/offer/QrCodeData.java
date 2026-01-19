package com.bsa.campcard.dto.offer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data structure for QR code content.
 * This is what gets encoded into the QR code for merchants to scan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeData {

    /**
     * HMAC-signed token containing offer ID, user ID, and expiration
     */
    private String token;

    /**
     * Offer ID for display purposes
     */
    private Long offerId;

    /**
     * User ID for display purposes
     */
    private String userId;

    /**
     * Offer title for display
     */
    private String offerTitle;

    /**
     * Type of discount (PERCENTAGE, FIXED_AMOUNT, etc.)
     */
    private String discountType;

    /**
     * Discount value
     */
    private BigDecimal discountValue;

    /**
     * When this QR code expires
     */
    private LocalDateTime expiresAt;
}
