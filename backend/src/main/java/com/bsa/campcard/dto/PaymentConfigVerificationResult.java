package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for payment gateway credential verification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfigVerificationResult {

    private boolean success;
    private String message;
    private String errorCode;
    private LocalDateTime verifiedAt;
}
