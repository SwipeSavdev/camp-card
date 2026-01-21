package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response with user's complete card inventory
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyCardsResponse {

    // Currently active card (at most one)
    private CampCardResponse activeCard;

    // Unused cards available for gift or replenishment
    private List<CampCardResponse> unusedCards;

    // Cards that have been gifted (pending claim)
    private List<CampCardResponse> giftedCards;

    // Historical cards (replaced, expired)
    private List<CampCardResponse> historicalCards;

    // Summary stats
    private Integer totalCards;
    private Integer activeCards;
    private Integer unusedCardsCount;
    private Integer giftedCardsCount;
    private Double totalSavings;
    private Integer totalOffersUsed;
}
