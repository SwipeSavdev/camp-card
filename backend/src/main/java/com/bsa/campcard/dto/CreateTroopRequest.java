package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTroopRequest {
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
    private BigDecimal goalAmount;
}
