package com.bsa.campcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateScoutRequest {
    private UUID userId;
    private Long troopId;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String bsaMemberId;
    private String rank;
    private LocalDate joinDate;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private BigDecimal salesGoal;
}
