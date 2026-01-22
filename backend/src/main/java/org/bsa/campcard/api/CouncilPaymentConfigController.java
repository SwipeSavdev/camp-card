package org.bsa.campcard.api;

import com.bsa.campcard.dto.CouncilPaymentConfigRequest;
import com.bsa.campcard.dto.CouncilPaymentConfigResponse;
import com.bsa.campcard.dto.PaymentConfigVerificationResult;
import com.bsa.campcard.service.CouncilPaymentConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing council-specific payment gateway configurations.
 *
 * Security:
 * - GLOBAL_SYSTEM_ADMIN, ADMIN, SUPPORT_REPRESENTATIVE, NATIONAL_ADMIN: Full access to all councils
 * - COUNCIL_ADMIN: View and verify their own council's config only
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/councils/{councilId}/payment-config")
@RequiredArgsConstructor
@Tag(name = "Council Payment Config", description = "Manage council-specific payment gateway configurations")
public class CouncilPaymentConfigController {

    private final CouncilPaymentConfigService configService;

    /**
     * Get the current authenticated user from SecurityContext.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Get the current user's ID.
     */
    private UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    @Operation(
        summary = "Get payment configuration",
        description = "Get the payment gateway configuration for a council. Credentials are masked."
    )
    @ApiResponse(responseCode = "200", description = "Configuration found")
    @ApiResponse(responseCode = "404", description = "Configuration not found")
    @GetMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<CouncilPaymentConfigResponse> getConfig(
            @Parameter(description = "Council ID") @PathVariable Long councilId) {

        User currentUser = getCurrentUser();
        log.info("User {} requesting payment config for council {}",
                currentUser != null ? currentUser.getEmail() : "unknown", councilId);

        // Council admins can only view their own council's config
        if (currentUser != null && currentUser.getRole() == User.UserRole.COUNCIL_ADMIN) {
            // TODO: Add council ID check when User entity has council reference
        }

        return configService.getConfig(councilId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Create payment configuration",
        description = "Create a new payment gateway configuration for a council. Only National Admins can perform this action."
    )
    @ApiResponse(responseCode = "201", description = "Configuration created")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @ApiResponse(responseCode = "409", description = "Configuration already exists")
    @PostMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN')")
    public ResponseEntity<CouncilPaymentConfigResponse> createConfig(
            @Parameter(description = "Council ID") @PathVariable Long councilId,
            @Valid @RequestBody CouncilPaymentConfigRequest request) {

        User currentUser = getCurrentUser();
        log.info("User {} creating payment config for council {}",
                currentUser != null ? currentUser.getEmail() : "unknown", councilId);

        try {
            CouncilPaymentConfigResponse response = configService.createConfig(councilId, request, getCurrentUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            // Config already exists
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @Operation(
        summary = "Update payment configuration",
        description = "Update an existing payment gateway configuration. Only National Admins can perform this action."
    )
    @ApiResponse(responseCode = "200", description = "Configuration updated")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @ApiResponse(responseCode = "404", description = "Configuration not found")
    @PutMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN')")
    public ResponseEntity<CouncilPaymentConfigResponse> updateConfig(
            @Parameter(description = "Council ID") @PathVariable Long councilId,
            @Valid @RequestBody CouncilPaymentConfigRequest request) {

        User currentUser = getCurrentUser();
        log.info("User {} updating payment config for council {}",
                currentUser != null ? currentUser.getEmail() : "unknown", councilId);

        try {
            CouncilPaymentConfigResponse response = configService.updateConfig(councilId, request, getCurrentUserId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Verify payment configuration",
        description = "Test the payment gateway credentials by making a test authentication call to Authorize.net."
    )
    @ApiResponse(responseCode = "200", description = "Verification completed (check success field)")
    @ApiResponse(responseCode = "404", description = "Configuration not found")
    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<PaymentConfigVerificationResult> verifyConfig(
            @Parameter(description = "Council ID") @PathVariable Long councilId) {

        User currentUser = getCurrentUser();
        log.info("User {} verifying payment config for council {}",
                currentUser != null ? currentUser.getEmail() : "unknown", councilId);

        try {
            PaymentConfigVerificationResult result = configService.verifyConfig(councilId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Deactivate payment configuration",
        description = "Deactivate a council's payment configuration. The council will fall back to the default gateway."
    )
    @ApiResponse(responseCode = "204", description = "Configuration deactivated")
    @ApiResponse(responseCode = "404", description = "Configuration not found")
    @DeleteMapping
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN')")
    public ResponseEntity<Void> deactivateConfig(
            @Parameter(description = "Council ID") @PathVariable Long councilId) {

        User currentUser = getCurrentUser();
        log.info("User {} deactivating payment config for council {}",
                currentUser != null ? currentUser.getEmail() : "unknown", councilId);

        try {
            configService.deactivateConfig(councilId, getCurrentUserId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Check if council has payment configuration",
        description = "Check if a council has an active and verified payment gateway configuration."
    )
    @ApiResponse(responseCode = "200", description = "Check completed")
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'SUPPORT_REPRESENTATIVE', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Map<String, Object>> checkConfigStatus(
            @Parameter(description = "Council ID") @PathVariable Long councilId) {

        // Get detailed config status
        var config = configService.getConfig(councilId);
        boolean hasConfig = config.isPresent();
        boolean isActive = config.map(c -> Boolean.TRUE.equals(c.getIsActive())).orElse(false);
        boolean isVerified = config.map(c -> Boolean.TRUE.equals(c.getIsVerified())).orElse(false);

        return ResponseEntity.ok(Map.of(
            "councilId", councilId,
            "hasConfig", hasConfig,
            "isActive", isActive,
            "isVerified", isVerified,
            "hasActiveVerifiedConfig", hasConfig && isActive && isVerified,
            "usesDefaultGateway", !hasConfig || !isActive || !isVerified
        ));
    }
}
