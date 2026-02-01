package com.bsa.campcard.dto;

import com.bsa.campcard.entity.Scout;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoutResponse {
    private Long id;
    private UUID uuid;
    private UUID userId;
    private Long troopId;
    private String troopNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate birthDate;
    private Integer age;
    private String bsaMemberId;
    private String rank;
    private LocalDate joinDate;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private Integer cardsSold;
    private BigDecimal totalSales;
    private BigDecimal salesGoal;
    private Double goalProgress;
    private BigDecimal commissionEarned;
    private Boolean topSeller;
    private Integer awardsEarned;
    private String status;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private Integer referralCount;
    private Integer conversionCount;
    
    public static ScoutResponse fromEntity(Scout scout) {
        ScoutResponse response = new ScoutResponse();
        response.setId(scout.getId());
        response.setUuid(scout.getUuid());
        response.setUserId(scout.getUserId());
        response.setTroopId(scout.getTroopId());
        response.setFirstName(scout.getFirstName());
        response.setLastName(scout.getLastName());
        response.setFullName(scout.getFullName());
        response.setBirthDate(scout.getBirthDate());
        response.setAge(scout.getAge());
        response.setBsaMemberId(scout.getBsaMemberId());
        response.setRank(scout.getRank().name());
        response.setJoinDate(scout.getJoinDate());
        response.setParentName(scout.getParentName());
        response.setParentEmail(scout.getParentEmail());
        response.setParentPhone(scout.getParentPhone());
        response.setCardsSold(scout.getCardsSold());
        response.setTotalSales(scout.getTotalSales());
        response.setSalesGoal(scout.getSalesGoal());
        response.setGoalProgress(scout.getGoalProgress());
        response.setCommissionEarned(scout.getCommissionEarned());
        response.setTopSeller(scout.getTopSeller());
        response.setAwardsEarned(scout.getAwardsEarned());
        response.setStatus(scout.getStatus().name());
        response.setProfileImageUrl(scout.getProfileImageUrl());
        response.setCreatedAt(scout.getCreatedAt());
        return response;
    }
}
