package com.bsa.campcard.dto.payment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPurchaseRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

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

    // Direct Scout referral code (from ?scout= parameter) - $10/year tier
    private String scoutCode;

    // Customer referral code (from ?ref= parameter) - $15/year tier
    // When present, the system looks up the chain to find the original Scout
    private String customerRefCode;

    // Legacy field for backwards compatibility
    private String referralCode;
}
