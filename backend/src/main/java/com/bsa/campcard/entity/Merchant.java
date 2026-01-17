package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "merchants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Merchant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private UUID uuid;
    
    @Column(nullable = false)
    private Long councilId;
    
    // Business Information
    @Column(nullable = false, length = 200)
    private String businessName;
    
    @Column(length = 200)
    private String dbaName; // Doing Business As
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 100)
    private String category; // RESTAURANTS, RETAIL, SERVICES, ENTERTAINMENT, etc.
    
    @Column(length = 20)
    private String taxId; // EIN for verification
    
    // Contact Information
    @Column(nullable = false, length = 200)
    private String contactName;
    
    @Column(nullable = false, length = 100)
    private String contactEmail;
    
    @Column(length = 20)
    private String contactPhone;
    
    // Business Details
    @Column(length = 500)
    private String websiteUrl;
    
    @Column(length = 500)
    private String logoUrl;
    
    @Column(columnDefinition = "TEXT")
    private String businessHours; // JSON or formatted string
    
    // Status and Approval
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MerchantStatus status = MerchantStatus.PENDING;

    private LocalDateTime approvedAt;

    @Column(columnDefinition = "UUID")
    private UUID approvedBy; // Admin user ID

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Agreement
    @Builder.Default
    private Boolean termsAccepted = false;
    private LocalDateTime termsAcceptedAt;

    // Metrics
    @Builder.Default
    private Integer totalOffers = 0;
    @Builder.Default
    private Integer activeOffers = 0;
    @Builder.Default
    private Integer totalRedemptions = 0;
    
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
    
    public enum MerchantStatus {
        PENDING,    // Awaiting approval
        APPROVED,   // Active and can create offers
        REJECTED,   // Application denied
        SUSPENDED,  // Temporarily disabled
        INACTIVE    // Merchant deactivated account
    }
}
