package com.bsa.campcard.dto.qr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardQRCodeResponse {

    private Long cardId;
    private String cardNumber;
    private String uniqueCode;
    private String qrCodeData;
    private LocalDateTime validUntil;
    private String status;
}
