package com.bsa.campcard.dto.payment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Combined request for subscription checkout.
 * Includes both payment card details and account information.
 * This allows the frontend to collect all data in one form and make a single API call.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCheckoutRequest {

    // ==================== Card Details ====================

    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @NotBlank(message = "Expiration date is required")
    private String expirationDate; // Format: MMYY or MM/YY

    @NotBlank(message = "CVV is required")
    private String cvv;

    // Billing address (optional for AVS)
    private String billingZip;

    // ==================== Account Details ====================

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;

    // ==================== Referral Codes ====================

    // Direct Scout referral code (from ?scout= parameter) - $10/year tier
    private String scoutCode;

    // Customer referral code (from ?ref= parameter) - $15/year tier
    private String customerRefCode;
}
