package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private String transactionId;
    
    private String status; // SUCCESS, FAILED, PENDING, REFUNDED
    
    private BigDecimal amount;
    
    private String currency;
    
    private String message;
    
    private String authCode;
    
    private String cardNumberLast4;
    
    private String cardType;
    
    private LocalDateTime timestamp;
    
    private String receiptUrl;
    
    private String errorCode;
    
    private String errorMessage;
}
