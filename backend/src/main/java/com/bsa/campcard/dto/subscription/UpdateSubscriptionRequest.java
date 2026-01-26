package com.bsa.campcard.dto.subscription;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSubscriptionRequest {
    private Boolean cancelAtPeriodEnd;
    private String paymentNonce; // Authorize.net payment nonce for payment method update
}
