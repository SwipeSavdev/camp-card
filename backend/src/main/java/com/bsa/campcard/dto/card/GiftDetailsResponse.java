package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response with gift card details for the claim page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftDetailsResponse {

    private String cardNumber;
    private String senderName;
    private String senderEmail;
    private String message;
    private LocalDateTime giftedAt;
    private LocalDateTime expiresAt;

    // Whether the gift has already been claimed
    private boolean claimed;
    private LocalDateTime claimedAt;

    // Whether the gift has expired
    private boolean expired;
}
