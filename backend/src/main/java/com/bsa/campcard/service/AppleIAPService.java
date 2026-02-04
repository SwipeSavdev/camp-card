package com.bsa.campcard.service;

import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.repository.SubscriptionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppleIAPService {

    private final SubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${apple.iap.shared-secret:}")
    private String sharedSecret;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private static final String PRODUCTION_VERIFY_URL = "https://buy.itunes.apple.com/verifyReceipt";
    private static final String SANDBOX_VERIFY_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

    // Apple status codes
    private static final int STATUS_OK = 0;
    private static final int STATUS_SANDBOX_RECEIPT_ON_PRODUCTION = 21007;
    private static final int STATUS_PRODUCTION_RECEIPT_ON_SANDBOX = 21008;

    /**
     * Verify an Apple IAP receipt and return the validated transaction info.
     */
    public AppleReceiptValidationResult verifyReceipt(String receiptData, String expectedProductId, String expectedTransactionId) {
        try {
            // Try production first
            JsonNode response = callAppleVerifyEndpoint(receiptData, PRODUCTION_VERIFY_URL);
            int status = response.path("status").asInt(-1);

            // If receipt is from sandbox, retry with sandbox URL
            if (status == STATUS_SANDBOX_RECEIPT_ON_PRODUCTION) {
                log.info("[AppleIAP] Sandbox receipt detected, retrying with sandbox URL");
                response = callAppleVerifyEndpoint(receiptData, SANDBOX_VERIFY_URL);
                status = response.path("status").asInt(-1);
            }

            if (status != STATUS_OK) {
                log.warn("[AppleIAP] Receipt verification failed with status: {}", status);
                return AppleReceiptValidationResult.invalid("Apple verification failed with status " + status);
            }

            // Parse the receipt
            JsonNode receipt = response.path("receipt");
            JsonNode inApp = receipt.path("in_app");

            if (inApp.isMissingNode() || !inApp.isArray() || inApp.isEmpty()) {
                // Check latest_receipt_info for subscriptions
                JsonNode latestReceiptInfo = response.path("latest_receipt_info");
                if (!latestReceiptInfo.isMissingNode() && latestReceiptInfo.isArray() && !latestReceiptInfo.isEmpty()) {
                    return processSubscriptionReceipt(latestReceiptInfo, expectedProductId, expectedTransactionId);
                }
                log.warn("[AppleIAP] No in-app purchases found in receipt");
                return AppleReceiptValidationResult.invalid("No purchases found in receipt");
            }

            // Find the matching transaction
            for (JsonNode transaction : inApp) {
                String productId = transaction.path("product_id").asText();
                String transactionId = transaction.path("transaction_id").asText();

                if (productId.equals(expectedProductId)) {
                    // Check if this is a subscription or consumable
                    if (productId.contains("subscription")) {
                        return processSubscriptionTransaction(transaction, response);
                    } else {
                        return processConsumableTransaction(transaction);
                    }
                }
            }

            // Also check latest_receipt_info for subscriptions
            JsonNode latestReceiptInfo = response.path("latest_receipt_info");
            if (!latestReceiptInfo.isMissingNode() && latestReceiptInfo.isArray()) {
                return processSubscriptionReceipt(latestReceiptInfo, expectedProductId, expectedTransactionId);
            }

            log.warn("[AppleIAP] Product {} not found in receipt", expectedProductId);
            return AppleReceiptValidationResult.invalid("Product not found in receipt");

        } catch (Exception e) {
            log.error("[AppleIAP] Receipt verification error", e);
            return AppleReceiptValidationResult.invalid("Receipt verification error: " + e.getMessage());
        }
    }

    private AppleReceiptValidationResult processSubscriptionTransaction(JsonNode transaction, JsonNode fullResponse) {
        String productId = transaction.path("product_id").asText();
        String transactionId = transaction.path("transaction_id").asText();
        String originalTransactionId = transaction.path("original_transaction_id").asText();

        // Get expiry from latest_receipt_info or pending_renewal_info
        LocalDateTime expiresDate = null;
        JsonNode latestReceiptInfo = fullResponse.path("latest_receipt_info");
        if (latestReceiptInfo.isArray()) {
            for (JsonNode entry : latestReceiptInfo) {
                if (entry.path("product_id").asText().equals(productId)) {
                    long expiresMs = entry.path("expires_date_ms").asLong(0);
                    if (expiresMs > 0) {
                        expiresDate = LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(expiresMs), ZoneId.systemDefault());
                    }
                    break;
                }
            }
        }

        log.info("[AppleIAP] Subscription validated: product={}, txn={}, expires={}", productId, transactionId, expiresDate);

        return AppleReceiptValidationResult.builder()
                .valid(true)
                .productId(productId)
                .transactionId(transactionId)
                .originalTransactionId(originalTransactionId)
                .isSubscription(true)
                .expiresDate(expiresDate)
                .build();
    }

    private AppleReceiptValidationResult processSubscriptionReceipt(JsonNode latestReceiptInfo, String expectedProductId, String expectedTransactionId) {
        for (JsonNode entry : latestReceiptInfo) {
            String productId = entry.path("product_id").asText();
            if (productId.equals(expectedProductId)) {
                String transactionId = entry.path("transaction_id").asText();
                String originalTransactionId = entry.path("original_transaction_id").asText();
                long expiresMs = entry.path("expires_date_ms").asLong(0);
                LocalDateTime expiresDate = expiresMs > 0
                        ? LocalDateTime.ofInstant(Instant.ofEpochMilli(expiresMs), ZoneId.systemDefault())
                        : null;

                log.info("[AppleIAP] Subscription from latest_receipt_info: product={}, txn={}, expires={}",
                        productId, transactionId, expiresDate);

                return AppleReceiptValidationResult.builder()
                        .valid(true)
                        .productId(productId)
                        .transactionId(transactionId)
                        .originalTransactionId(originalTransactionId)
                        .isSubscription(true)
                        .expiresDate(expiresDate)
                        .build();
            }
        }
        return AppleReceiptValidationResult.invalid("Subscription product not found in latest_receipt_info");
    }

    private AppleReceiptValidationResult processConsumableTransaction(JsonNode transaction) {
        String productId = transaction.path("product_id").asText();
        String transactionId = transaction.path("transaction_id").asText();
        int quantity = transaction.path("quantity").asInt(1);

        // Map product ID to card quantity
        int cardQuantity = mapProductIdToCardQuantity(productId);

        log.info("[AppleIAP] Consumable validated: product={}, txn={}, cards={}", productId, transactionId, cardQuantity);

        return AppleReceiptValidationResult.builder()
                .valid(true)
                .productId(productId)
                .transactionId(transactionId)
                .isSubscription(false)
                .cardQuantity(cardQuantity)
                .build();
    }

    private int mapProductIdToCardQuantity(String productId) {
        if (productId.endsWith(".cards.1")) return 1;
        if (productId.endsWith(".cards.3")) return 3;
        if (productId.endsWith(".cards.5")) return 5;
        if (productId.endsWith(".cards.10")) return 10;
        return 1; // default
    }

    private JsonNode callAppleVerifyEndpoint(String receiptData, String url) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("receipt-data", receiptData);
        if (sharedSecret != null && !sharedSecret.isEmpty()) {
            requestBody.put("password", sharedSecret);
        }
        requestBody.put("exclude-old-transactions", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        return objectMapper.readTree(response.getBody());
    }

    /**
     * Check if an Apple subscription is still active by originalTransactionId.
     */
    public boolean isSubscriptionActive(String originalTransactionId) {
        return subscriptionRepository.findAll().stream()
                .filter(s -> originalTransactionId.equals(s.getStripeSubscriptionId())) // reusing this field for Apple originalTransactionId
                .anyMatch(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE);
    }

    // Result class
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AppleReceiptValidationResult {
        private boolean valid;
        private String productId;
        private String transactionId;
        private String originalTransactionId;
        private boolean isSubscription;
        private LocalDateTime expiresDate;
        private int cardQuantity;
        private String errorMessage;

        public static AppleReceiptValidationResult invalid(String message) {
            AppleReceiptValidationResult result = new AppleReceiptValidationResult();
            result.setValid(false);
            result.setErrorMessage(message);
            return result;
        }
    }
}
