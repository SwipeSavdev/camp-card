package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "councils")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Council {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "council_number", nullable = false, unique = true, length = 10)
    private String councilNumber;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(name = "street_address")
    private String streetAddress;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(length = 20)
    private String phone;

    private String email;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "scout_executive_name")
    private String scoutExecutiveName;

    @Column(name = "scout_executive_email")
    private String scoutExecutiveEmail;

    @Column(name = "camp_card_coordinator_name")
    private String campCardCoordinatorName;

    @Column(name = "camp_card_coordinator_email")
    private String campCardCoordinatorEmail;

    @Column(name = "camp_card_coordinator_phone", length = 20)
    private String campCardCoordinatorPhone;

    @Column(name = "total_troops")
    @Builder.Default
    private Integer totalTroops = 0;

    @Column(name = "total_scouts")
    @Builder.Default
    private Integer totalScouts = 0;

    @Column(name = "total_sales", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Column(name = "cards_sold")
    @Builder.Default
    private Integer cardsSold = 0;

    @Column(name = "campaign_start_date")
    private LocalDate campaignStartDate;

    @Column(name = "campaign_end_date")
    private LocalDate campaignEndDate;

    @Column(name = "goal_amount", precision = 12, scale = 2)
    private BigDecimal goalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CouncilStatus status = CouncilStatus.ACTIVE;

    @Column(name = "subscription_tier", length = 50)
    @Builder.Default
    private String subscriptionTier = "BASIC";

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

    public enum CouncilStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        TRIAL
    }

    public enum CouncilRegion {
        NORTHEAST,
        SOUTHEAST,
        CENTRAL,
        SOUTHERN,
        WESTERN
    }
}
