package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "troops")
public class Troop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid = UUID.randomUUID();
    
    @Column(name = "troop_number", nullable = false)
    private String troopNumber;
    
    @Column(name = "council_id", nullable = false)
    private Long councilId;
    
    @Column(name = "troop_name")
    private String troopName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "troop_type", nullable = false)
    private TroopType troopType;
    
    @Column(name = "charter_organization")
    private String charterOrganization;
    
    @Column(name = "meeting_location")
    private String meetingLocation;
    
    @Column(name = "meeting_day")
    private String meetingDay;
    
    @Column(name = "meeting_time")
    private String meetingTime;
    
    @Column(name = "scoutmaster_id")
    private UUID scoutmasterId;
    
    @Column(name = "scoutmaster_name")
    private String scoutmasterName;
    
    @Column(name = "scoutmaster_email")
    private String scoutmasterEmail;
    
    @Column(name = "scoutmaster_phone")
    private String scoutmasterPhone;
    
    @Column(name = "assistant_scoutmaster_id")
    private UUID assistantScoutmasterId;
    
    @Column(name = "total_scouts", nullable = false)
    private Integer totalScouts = 0;
    
    @Column(name = "active_scouts", nullable = false)
    private Integer activeScouts = 0;
    
    @Column(name = "total_sales", precision = 10, scale = 2)
    private java.math.BigDecimal totalSales = java.math.BigDecimal.ZERO;
    
    @Column(name = "cards_sold", nullable = false)
    private Integer cardsSold = 0;
    
    @Column(name = "goal_amount", precision = 10, scale = 2)
    private java.math.BigDecimal goalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TroopStatus status = TroopStatus.ACTIVE;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum TroopType {
        SCOUTS_BSA,
        CUB_SCOUTS,
        VENTURING,
        SEA_SCOUTS,
        EXPLORING
    }
    
    public enum TroopStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        ARCHIVED
    }
    
    public double getGoalProgress() {
        if (goalAmount == null || goalAmount.compareTo(java.math.BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return totalSales.divide(goalAmount, 4, java.math.RoundingMode.HALF_UP)
            .multiply(new java.math.BigDecimal("100"))
            .doubleValue();
    }
    
    public java.math.BigDecimal getAverageSalesPerScout() {
        if (activeScouts == 0) {
            return java.math.BigDecimal.ZERO;
        }
        return totalSales.divide(
            new java.math.BigDecimal(activeScouts), 
            2, 
            java.math.RoundingMode.HALF_UP
        );
    }
}
