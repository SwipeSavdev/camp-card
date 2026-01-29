package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptHostedTokenRequest {

    private String customerEmail;

    private String referralCode;

    private String returnUrl;

    private String cancelUrl;

    /** Total amount to charge (card price + donation). Falls back to WEB_SUBSCRIPTION_PRICE if null. */
    private BigDecimal amount;

    /** Optional donation amount included in the total. */
    private BigDecimal donationAmount;
}
