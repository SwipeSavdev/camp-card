package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardExpiryStatusResponse {
    private int daysUntilExpiry;
    private int expiringCardCount;
    private int totalActiveCards;
    private LocalDate earliestExpiry;
}
