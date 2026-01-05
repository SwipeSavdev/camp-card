package com.bsa.campcard.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionQueryRequest {
    
    @NotBlank(message = "Transaction ID is required")
    private String transactionId;
}
