package com.bsa.campcard.dto.offer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response object for QR code scan/validation.
 * Returned to merchants after scanning a customer's QR code.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrScanResponse {

    /**
     * Whether the scan was successful
     */
    private boolean success;

    /**
     * Redemption ID if successful
     */
    private String redemptionId;

    /**
     * Verification code for the redemption
     */
    private String verificationCode;

    /**
     * Offer title
     */
    private String offerTitle;

    /**
     * Type of discount applied
     */
    private String discountType;

    /**
     * Discount value (percentage or fixed amount)
     */
    private BigDecimal discountValue;

    /**
     * Calculated discount amount
     */
    private BigDecimal discountAmount;

    /**
     * Success message
     */
    private String message;

    /**
     * Error code if scan failed
     */
    private String errorCode;

    /**
     * Error message if scan failed
     */
    private String errorMessage;

    /**
     * Whether this scan was flagged for abuse
     */
    private boolean flaggedForAbuse;

    /**
     * Reason for abuse flag if applicable
     */
    private String abuseReason;
}
