package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "referrals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Referral {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "UUID")
    private UUID referrerId; // User who referred
    
    @Column(nullable = false, columnDefinition = "UUID")
    private UUID referredUserId; // User who was referred
    
    @Column(nullable = false, unique = true, length = 20)
    private String referralCode;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ReferralStatus status;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal rewardAmount;
    
    @Column(nullable = false)
    private Boolean rewardClaimed = false;
    
    private LocalDateTime rewardClaimedAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum ReferralStatus {
        PENDING,      // Referred user registered but hasn't subscribed
        COMPLETED,    // Referred user has active subscription
        REWARDED,     // Reward has been distributed
        EXPIRED,      // Referral link expired
        CANCELLED     // Referral was cancelled
    }
}
