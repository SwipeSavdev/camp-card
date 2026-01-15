package com.bsa.campcard.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptHostedTokenRequest {

    private String customerEmail;

    private String referralCode;

    private String returnUrl;

    private String cancelUrl;
}
