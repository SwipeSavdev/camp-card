package com.bsa.campcard.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavePaymentMethodRequest {

    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @NotBlank(message = "Expiration date is required")
    private String expirationDate; // MMYY format from mobile

    @NotBlank(message = "CVV is required")
    private String cvv;

    private String firstName;
    private String lastName;
    private Boolean setAsDefault;
}
