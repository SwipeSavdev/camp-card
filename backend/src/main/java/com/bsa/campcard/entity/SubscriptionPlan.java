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
@Table(name = "subscription_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private UUID uuid;
    
    @Column(nullable = false)
    private Long councilId;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Integer priceCents;
    
    @Column(nullable = false, length = 3)
    private String currency = "USD";
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private BillingInterval billingInterval;
    
    private Integer trialDays = 0;
    
    private Integer maxMembers = 1;
    
    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private PlanStatus status = PlanStatus.ACTIVE;
    
    // Stripe integration
    private String stripeProductId;
    private String stripePriceId;
    
    @Column(columnDefinition = "TEXT[]")
    private String[] features;
    
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
    
    public enum BillingInterval {
        MONTHLY,
        ANNUAL
    }
    
    public enum PlanStatus {
        ACTIVE,
        INACTIVE
    }
}
