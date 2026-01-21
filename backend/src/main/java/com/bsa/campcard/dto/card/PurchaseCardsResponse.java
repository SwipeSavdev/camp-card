package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Response after purchasing multiple camp cards
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseCardsResponse {

    private UUID orderId;
    private String transactionId;
    private List<CampCardResponse> cards;
    private Integer quantity;
    private Integer unitPriceCents;
    private Integer totalPriceCents;
    private String paymentStatus;
}
