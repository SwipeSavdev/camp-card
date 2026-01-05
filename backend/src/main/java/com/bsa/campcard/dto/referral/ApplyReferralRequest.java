package com.bsa.campcard.dto.referral;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyReferralRequest {
    
    @NotBlank(message = "Referral code is required")
    private String referralCode;
}
