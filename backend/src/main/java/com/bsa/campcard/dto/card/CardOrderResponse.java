package com.bsa.campcard.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response for a card order (purchase transaction)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardOrderResponse {

    private Long id;
    private UUID uuid;
    private Integer quantity;
    private Integer unitPriceCents;
    private Integer totalPriceCents;
    private String transactionId;
    private String paymentStatus;
    private String scoutCode;
    private LocalDateTime createdAt;

    // Cards created from this order
    private List<CampCardResponse> cards;
}
