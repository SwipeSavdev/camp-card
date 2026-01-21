package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for a single camp card
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampCardResponse {

    private Long id;
    private UUID uuid;
    private String cardNumber;
    private String status;

    // Dates
    private LocalDateTime activatedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    // Gift info (only populated if status is GIFTED)
    private LocalDateTime giftedAt;
    private String giftedToEmail;
    private String giftMessage;
    private LocalDateTime giftClaimedAt;

    // Usage stats
    private Integer offersUsed;
    private Integer totalOffers;  // Total available offers
    private Double totalSavings;  // In dollars

    // Scout attribution
    private UUID scoutAttributionId;
    private String scoutName;

    // Replacement tracking
    private Long replacedByCardId;
}
