package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodResponse {
    private Long id;
    private String cardLastFour;
    private String cardType;
    private Integer expirationMonth;
    private Integer expirationYear;
    private Boolean isDefault;
}
