package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "scouts")
public class Scout {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "troop_id", nullable = false)
    private Long troopId;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "bsa_member_id")
    private String bsaMemberId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScoutRank rank = ScoutRank.SCOUT;
    
    @Column(name = "join_date")
    private LocalDate joinDate;
    
    @Column(name = "parent_name")
    private String parentName;
    
    @Column(name = "parent_email")
    private String parentEmail;
    
    @Column(name = "parent_phone")
    private String parentPhone;
    
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;
    
    @Column(name = "cards_sold", nullable = false)
    private Integer cardsSold = 0;
    
    @Column(name = "total_sales", precision = 10, scale = 2)
    private BigDecimal totalSales = BigDecimal.ZERO;
    
    @Column(name = "sales_goal", precision = 10, scale = 2)
    private BigDecimal salesGoal;
    
    @Column(name = "commission_earned", precision = 10, scale = 2)
    private BigDecimal commissionEarned = BigDecimal.ZERO;
    
    @Column(name = "top_seller")
    private Boolean topSeller = false;
    
    @Column(name = "awards_earned")
    private Integer awardsEarned = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScoutStatus status = ScoutStatus.ACTIVE;
    
    @Column(name = "profile_image_url")
    private String profileImageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum ScoutRank {
        SCOUT,
        TENDERFOOT,
        SECOND_CLASS,
        FIRST_CLASS,
        STAR,
        LIFE,
        EAGLE,
        // Cub Scout ranks
        BOBCAT,
        TIGER,
        WOLF,
        BEAR,
        WEBELOS,
        ARROW_OF_LIGHT
    }
    
    public enum ScoutStatus {
        ACTIVE,
        INACTIVE,
        TRANSFERRED,
        AGED_OUT,
        DROPPED
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public int getAge() {
        if (birthDate == null) {
            return 0;
        }
        LocalDate now = LocalDate.now();
        return now.getYear() - birthDate.getYear();
    }
    
    public double getGoalProgress() {
        if (salesGoal == null || salesGoal.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return totalSales.divide(salesGoal, 4, java.math.RoundingMode.HALF_UP)
            .multiply(new BigDecimal("100"))
            .doubleValue();
    }
    
    public boolean hasMetGoal() {
        if (salesGoal == null) {
            return false;
        }
        return totalSales.compareTo(salesGoal) >= 0;
    }
}
