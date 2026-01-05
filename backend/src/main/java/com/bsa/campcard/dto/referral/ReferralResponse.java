package com.bsa.campcard.dto.referral;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralResponse {

    private Long id;
    private UUID referredUserId;
    
    private String referredUserName;
    
    private String referredUserEmail;
    
    private String status;
    
    private BigDecimal rewardAmount;
    
    private Boolean rewardClaimed;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
}
