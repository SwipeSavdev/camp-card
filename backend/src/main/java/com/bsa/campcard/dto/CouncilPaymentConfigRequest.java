package com.bsa.campcard.dto;

import com.bsa.campcard.entity.GatewayEnvironment;
import com.bsa.campcard.entity.GatewayType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating council payment gateway configuration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilPaymentConfigRequest {

    @Builder.Default
    private GatewayType gatewayType = GatewayType.AUTHORIZE_NET;

    @NotBlank(message = "API Login ID is required")
    @Size(min = 5, max = 100, message = "API Login ID must be between 5 and 100 characters")
    private String apiLoginId;

    @NotBlank(message = "Transaction Key is required")
    @Size(min = 10, max = 100, message = "Transaction Key must be between 10 and 100 characters")
    private String transactionKey;

    @NotNull(message = "Environment is required")
    @Builder.Default
    private GatewayEnvironment environment = GatewayEnvironment.SANDBOX;
}
