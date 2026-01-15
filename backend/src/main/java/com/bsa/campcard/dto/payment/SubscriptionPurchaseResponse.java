package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPurchaseResponse {

    private boolean success;

    private String userId;

    private String email;

    private String firstName;

    private String lastName;

    private String cardNumber;

    private String subscriptionStatus;

    private LocalDateTime subscriptionExpiresAt;

    private String transactionId;

    private String accessToken;

    private String refreshToken;

    private String errorMessage;

    private String errorCode;
}
