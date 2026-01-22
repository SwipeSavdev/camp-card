package com.bsa.campcard.dto.subscription;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequest {

    @NotNull(message = "Plan ID is required")
    private Long planId;

    private String referralCode;

    // Payment method for mobile (Authorize.net Accept.js / Apple Pay / Google Pay)
    private PaymentMethod paymentMethod;

    private String idempotencyKey;

    // Authorize.net transaction ID from Accept Hosted (for web portal)
    private String transactionId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethod {
        @NotNull(message = "Payment type is required")
        private String type; // AUTHORIZE_NET, APPLE_PAY, GOOGLE_PAY

        // Authorize.net payment nonce from Accept.js tokenization
        private String paymentNonce;

        // Apple Pay token (for Apple Pay integration)
        private String applePayToken;

        // Google Pay token (for Google Pay integration)
        private String googlePayToken;
    }
}
