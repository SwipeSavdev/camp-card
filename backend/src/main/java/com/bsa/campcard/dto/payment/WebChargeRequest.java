package com.bsa.campcard.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for web-based payments using Accept.js opaque data.
 * Accept.js tokenizes card details on the client side and returns
 * an opaque data token — raw card data never touches our server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebChargeRequest {

    @NotBlank(message = "Data descriptor is required")
    private String dataDescriptor;

    @NotBlank(message = "Data value is required")
    private String dataValue;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.00", message = "Minimum amount is $10.00")
    private BigDecimal amount;

    private String customerEmail;

    private String description;

    /** Optional donation amount included in the total. */
    private BigDecimal donationAmount;

    /** Optional referral code. */
    private String referralCode;
}
