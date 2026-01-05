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
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    private String idempotencyKey;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethod {
        @NotNull(message = "Payment type is required")
        private String type; // STRIPE, APPLE_PAY, GOOGLE_PAY
        
        private String stripePaymentMethodId;
        private String applePayToken;
        private String googlePayToken;
    }
}
