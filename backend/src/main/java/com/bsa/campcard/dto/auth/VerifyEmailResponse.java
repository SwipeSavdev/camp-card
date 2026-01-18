package com.bsa.campcard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyEmailResponse {
    private boolean success;
    private String message;
    private boolean requiresPasswordSetup;
    private String passwordSetupToken;
}
