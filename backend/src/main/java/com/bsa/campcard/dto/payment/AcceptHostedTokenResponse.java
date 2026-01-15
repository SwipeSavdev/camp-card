package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptHostedTokenResponse {

    private String token;

    private String formUrl;

    private String transactionId;

    private boolean success;

    private String errorMessage;

    private String errorCode;
}
