package com.bsa.campcard.service;

import com.bsa.campcard.dto.CouncilPaymentConfigRequest;
import com.bsa.campcard.dto.CouncilPaymentConfigResponse;
import com.bsa.campcard.dto.PaymentConfigVerificationResult;
import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.CouncilPaymentConfig;
import com.bsa.campcard.entity.GatewayType;
import com.bsa.campcard.repository.CouncilPaymentConfigRepository;
import com.bsa.campcard.repository.CouncilRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.authorize.Environment;
import net.authorize.api.contract.v1.*;
import net.authorize.api.controller.AuthenticateTestController;
import net.authorize.api.controller.base.ApiOperationBase;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing council-specific payment gateway configurations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CouncilPaymentConfigService {

    private final CouncilPaymentConfigRepository configRepository;
    private final CouncilRepository councilRepository;
    private final UserRepository userRepository;
    private final CredentialEncryptionService encryptionService;

    /**
     * Create a new payment gateway configuration for a council.
     */
    @Transactional
    public CouncilPaymentConfigResponse createConfig(Long councilId, CouncilPaymentConfigRequest request, UUID userId) {
        log.info("Creating payment config for council: {}", councilId);

        // Check if council exists
        Council council = councilRepository.findById(councilId)
                .orElseThrow(() -> new IllegalArgumentException("Council not found: " + councilId));

        // Check if config already exists
        if (configRepository.existsByCouncilId(councilId)) {
            throw new IllegalStateException("Payment configuration already exists for council: " + councilId);
        }

        // Get the creating user
        User createdBy = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Encrypt credentials
        String apiLoginIdEncrypted = encryptionService.encrypt(request.getApiLoginId());
        String transactionKeyEncrypted = encryptionService.encrypt(request.getTransactionKey());

        // Create config
        CouncilPaymentConfig config = CouncilPaymentConfig.builder()
                .council(council)
                .gatewayType(request.getGatewayType() != null ? request.getGatewayType() : GatewayType.AUTHORIZE_NET)
                .apiLoginIdEncrypted(apiLoginIdEncrypted)
                .transactionKeyEncrypted(transactionKeyEncrypted)
                .environment(request.getEnvironment())
                .isActive(true)
                .isVerified(false)
                .createdBy(createdBy)
                .updatedBy(createdBy)
                .build();

        config = configRepository.save(config);
        log.info("Created payment config {} for council {}", config.getId(), councilId);

        return toResponse(config);
    }

    /**
     * Update an existing payment gateway configuration.
     */
    @Transactional
    public CouncilPaymentConfigResponse updateConfig(Long councilId, CouncilPaymentConfigRequest request, UUID userId) {
        log.info("Updating payment config for council: {}", councilId);

        CouncilPaymentConfig config = configRepository.findByCouncilId(councilId)
                .orElseThrow(() -> new IllegalArgumentException("Payment configuration not found for council: " + councilId));

        // Get the updating user
        User updatedBy = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Update encrypted credentials
        config.setApiLoginIdEncrypted(encryptionService.encrypt(request.getApiLoginId()));
        config.setTransactionKeyEncrypted(encryptionService.encrypt(request.getTransactionKey()));
        config.setEnvironment(request.getEnvironment());
        config.setIsVerified(false); // Reset verification when credentials change
        config.setLastVerifiedAt(null);
        config.setUpdatedBy(updatedBy);

        config = configRepository.save(config);
        log.info("Updated payment config {} for council {}", config.getId(), councilId);

        return toResponse(config);
    }

    /**
     * Get payment configuration for a council.
     */
    @Transactional(readOnly = true)
    public Optional<CouncilPaymentConfigResponse> getConfig(Long councilId) {
        return configRepository.findByCouncilId(councilId)
                .map(this::toResponse);
    }

    /**
     * Verify payment gateway credentials by making a test authentication call.
     */
    @Transactional
    public PaymentConfigVerificationResult verifyConfig(Long councilId) {
        log.info("Verifying payment config for council: {}", councilId);

        CouncilPaymentConfig config = configRepository.findByCouncilId(councilId)
                .orElseThrow(() -> new IllegalArgumentException("Payment configuration not found for council: " + councilId));

        // Decrypt credentials
        String apiLoginId = encryptionService.decrypt(config.getApiLoginIdEncrypted());
        String transactionKey = encryptionService.decrypt(config.getTransactionKeyEncrypted());

        try {
            // Set up merchant authentication
            MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();
            merchantAuth.setName(apiLoginId);
            merchantAuth.setTransactionKey(transactionKey);

            // Create test authentication request
            AuthenticateTestRequest testRequest = new AuthenticateTestRequest();
            testRequest.setMerchantAuthentication(merchantAuth);

            // Set environment
            Environment env = config.getEnvironment() == com.bsa.campcard.entity.GatewayEnvironment.PRODUCTION
                    ? Environment.PRODUCTION
                    : Environment.SANDBOX;
            ApiOperationBase.setEnvironment(env);

            // Execute test
            AuthenticateTestController controller = new AuthenticateTestController(testRequest);
            controller.execute();

            AuthenticateTestResponse response = controller.getApiResponse();

            if (response != null && response.getMessages().getResultCode() == MessageTypeEnum.OK) {
                // Update verification status
                config.setIsVerified(true);
                config.setLastVerifiedAt(LocalDateTime.now());
                configRepository.save(config);

                log.info("Payment config verified successfully for council {}", councilId);

                return PaymentConfigVerificationResult.builder()
                        .success(true)
                        .message("Credentials verified successfully")
                        .verifiedAt(config.getLastVerifiedAt())
                        .build();
            } else {
                String errorMessage = response != null && response.getMessages() != null
                        ? response.getMessages().getMessage().get(0).getText()
                        : "Unknown error";
                String errorCode = response != null && response.getMessages() != null
                        ? response.getMessages().getMessage().get(0).getCode()
                        : "UNKNOWN";

                log.warn("Payment config verification failed for council {}: {} - {}", councilId, errorCode, errorMessage);

                return PaymentConfigVerificationResult.builder()
                        .success(false)
                        .message(errorMessage)
                        .errorCode(errorCode)
                        .build();
            }

        } catch (Exception e) {
            log.error("Error verifying payment config for council {}", councilId, e);

            return PaymentConfigVerificationResult.builder()
                    .success(false)
                    .message("Verification failed: " + e.getMessage())
                    .errorCode("INTERNAL_ERROR")
                    .build();
        }
    }

    /**
     * Deactivate payment configuration for a council.
     */
    @Transactional
    public void deactivateConfig(Long councilId, UUID userId) {
        log.info("Deactivating payment config for council: {}", councilId);

        CouncilPaymentConfig config = configRepository.findByCouncilId(councilId)
                .orElseThrow(() -> new IllegalArgumentException("Payment configuration not found for council: " + councilId));

        User updatedBy = userId != null ? userRepository.findById(userId).orElse(null) : null;

        config.setIsActive(false);
        config.setUpdatedBy(updatedBy);
        configRepository.save(config);

        log.info("Deactivated payment config {} for council {}", config.getId(), councilId);
    }

    /**
     * Get decrypted credentials for a council (used internally by PaymentService).
     * Returns null if no active, verified config exists.
     */
    @Transactional(readOnly = true)
    public Optional<DecryptedCredentials> getDecryptedCredentials(Long councilId) {
        return configRepository.findByCouncilIdAndIsActiveTrue(councilId)
                .filter(CouncilPaymentConfig::getIsVerified)
                .map(config -> DecryptedCredentials.builder()
                        .apiLoginId(encryptionService.decrypt(config.getApiLoginIdEncrypted()))
                        .transactionKey(encryptionService.decrypt(config.getTransactionKeyEncrypted()))
                        .environment(config.getEnvironment())
                        .build());
    }

    /**
     * Check if a council has an active, verified payment configuration.
     */
    @Transactional(readOnly = true)
    public boolean hasActiveVerifiedConfig(Long councilId) {
        return configRepository.hasActiveVerifiedConfig(councilId);
    }

    /**
     * Convert entity to response DTO with masked credentials.
     */
    private CouncilPaymentConfigResponse toResponse(CouncilPaymentConfig config) {
        // Decrypt and mask credentials for display
        String apiLoginId = encryptionService.decrypt(config.getApiLoginIdEncrypted());
        String transactionKey = encryptionService.decrypt(config.getTransactionKeyEncrypted());

        return CouncilPaymentConfigResponse.builder()
                .id(config.getId())
                .uuid(config.getUuid())
                .councilId(config.getCouncil().getId())
                .councilName(config.getCouncil().getName())
                .gatewayType(config.getGatewayType())
                .apiLoginIdMasked(CredentialEncryptionService.mask(apiLoginId))
                .transactionKeyMasked(CredentialEncryptionService.mask(transactionKey))
                .environment(config.getEnvironment())
                .isActive(config.getIsActive())
                .isVerified(config.getIsVerified())
                .lastVerifiedAt(config.getLastVerifiedAt())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    /**
     * DTO for decrypted credentials (internal use only).
     */
    @lombok.Builder
    @lombok.Data
    public static class DecryptedCredentials {
        private String apiLoginId;
        private String transactionKey;
        private com.bsa.campcard.entity.GatewayEnvironment environment;
    }
}
