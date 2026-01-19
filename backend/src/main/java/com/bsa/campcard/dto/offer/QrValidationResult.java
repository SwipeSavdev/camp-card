package com.bsa.campcard.dto.offer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Internal result object for QR token validation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrValidationResult {

    /**
     * Whether the token is valid
     */
    private boolean valid;

    /**
     * Offer ID extracted from token
     */
    private Long offerId;

    /**
     * User ID extracted from token
     */
    private UUID userId;

    /**
     * Failure reason code if invalid
     */
    private String failureReason;

    /**
     * Human-readable error message if invalid
     */
    private String errorMessage;

    /**
     * Create a valid result
     */
    public static QrValidationResult valid(Long offerId, UUID userId) {
        return QrValidationResult.builder()
                .valid(true)
                .offerId(offerId)
                .userId(userId)
                .build();
    }

    /**
     * Create an invalid result
     */
    public static QrValidationResult invalid(String failureReason, String errorMessage) {
        return QrValidationResult.builder()
                .valid(false)
                .failureReason(failureReason)
                .errorMessage(errorMessage)
                .build();
    }
}
