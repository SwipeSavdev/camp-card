package com.bsa.campcard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private boolean emailVerified;
    private String profileImageUrl;
    private String cardNumber;
    private String subscriptionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private ScoutProfile scoutProfile;
    private CouncilInfo council;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoutProfile {
        private Long scoutId;
        private String rank;
        private Integer cardsSold;
        private Double totalSales;
        private Double commissionEarned;
        private Integer awardsEarned;
        private boolean topSeller;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouncilInfo {
        private Long councilId;
        private String name;
        private String councilNumber;
    }
}
