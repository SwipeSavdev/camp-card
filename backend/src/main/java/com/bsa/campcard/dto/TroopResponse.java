package com.bsa.campcard.dto;

import com.bsa.campcard.entity.Troop;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TroopResponse {
    private Long id;
    private UUID uuid;
    private String troopNumber;
    private Long councilId;
    private String troopName;
    private String troopType;
    private String charterOrganization;
    private String meetingLocation;
    private String meetingDay;
    private String meetingTime;
    private UUID scoutmasterId;
    private String scoutmasterName;
    private String scoutmasterEmail;
    private String scoutmasterPhone;
    private Integer totalScouts;
    private Integer activeScouts;
    private BigDecimal totalSales;
    private Integer cardsSold;
    private BigDecimal goalAmount;
    private Double goalProgress;
    private BigDecimal averageSalesPerScout;
    private String status;
    private LocalDateTime createdAt;
    
    public static TroopResponse fromEntity(Troop troop) {
        TroopResponse response = new TroopResponse();
        response.setId(troop.getId());
        response.setUuid(troop.getUuid());
        response.setTroopNumber(troop.getTroopNumber());
        response.setCouncilId(troop.getCouncilId());
        response.setTroopName(troop.getTroopName());
        response.setTroopType(troop.getTroopType().name());
        response.setCharterOrganization(troop.getCharterOrganization());
        response.setMeetingLocation(troop.getMeetingLocation());
        response.setMeetingDay(troop.getMeetingDay());
        response.setMeetingTime(troop.getMeetingTime());
        response.setScoutmasterId(troop.getScoutmasterId());
        response.setScoutmasterName(troop.getScoutmasterName());
        response.setScoutmasterEmail(troop.getScoutmasterEmail());
        response.setScoutmasterPhone(troop.getScoutmasterPhone());
        response.setTotalScouts(troop.getTotalScouts());
        response.setActiveScouts(troop.getActiveScouts());
        response.setTotalSales(troop.getTotalSales());
        response.setCardsSold(troop.getCardsSold());
        response.setGoalAmount(troop.getGoalAmount());
        response.setGoalProgress(troop.getGoalProgress());
        response.setAverageSalesPerScout(troop.getAverageSalesPerScout());
        response.setStatus(troop.getStatus().name());
        response.setCreatedAt(troop.getCreatedAt());
        return response;
    }
}
