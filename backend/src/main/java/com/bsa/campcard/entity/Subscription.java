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
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private UUID uuid;
    
    @Column(nullable = false)
    private Long councilId;
    
    @Column(nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Column(nullable = false)
    private Long planId;
    
    // Referral attribution
    private String referralCode;
    
    @Column(columnDefinition = "UUID")
    private UUID rootScoutId;
    
    private Integer referralDepth = 0;
    
    // Stripe integration
    private String stripeSubscriptionId;
    private String stripeCustomerId;
    
    // Billing period
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    
    private Boolean cancelAtPeriodEnd = false;
    private LocalDateTime canceledAt;
    
    // Status
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.PENDING;

    // Card number (auto-generated on creation)
    @Column(name = "card_number", unique = true, length = 20)
    private String cardNumber;

    // Audit
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt;
    
    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum SubscriptionStatus {
        PENDING,    // Payment not yet completed
        ACTIVE,     // Active subscription
        SUSPENDED,  // Payment failed, grace period
        CANCELED    // Canceled by user
    }
}
