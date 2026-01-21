package com.bsa.campcard.dto.card;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to purchase multiple camp cards (1-10)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseCardsRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Minimum quantity is 1")
    @Max(value = 10, message = "Maximum quantity is 10")
    private Integer quantity;

    // Optional scout referral code for attribution
    private String scoutCode;

    // Payment token from Authorize.net (if paying now)
    private String paymentToken;

    // Customer info (for new users purchasing before signup)
    @Email(message = "Valid email is required")
    private String email;

    private String firstName;
    private String lastName;

    // Plan ID (determines price)
    @NotNull(message = "Plan ID is required")
    private Long planId;
}
