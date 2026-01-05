package com.bsa.campcard.dto.referral;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralCodeResponse {
    
    private String referralCode;
    
    private String shareableLink;
    
    private Integer totalReferrals;
    
    private Integer successfulReferrals;
    
    private BigDecimal totalRewardsEarned;
    
    private BigDecimal pendingRewards;
}
