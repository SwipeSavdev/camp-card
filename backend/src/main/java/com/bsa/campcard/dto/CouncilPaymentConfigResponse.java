package com.bsa.campcard.dto;

import com.bsa.campcard.entity.GatewayEnvironment;
import com.bsa.campcard.entity.GatewayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for council payment gateway configuration.
 * Credentials are always masked for security.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilPaymentConfigResponse {

    private Long id;
    private UUID uuid;
    private Long councilId;
    private String councilName;
    private GatewayType gatewayType;

    // Masked credentials (e.g., "••••••••1234")
    private String apiLoginIdMasked;
    private String transactionKeyMasked;

    private GatewayEnvironment environment;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime lastVerifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
