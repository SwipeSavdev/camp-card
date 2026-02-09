package com.bsa.campcard.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GooglePlayBillingService {

    /**
     * Verify a Google Play in-app product purchase.
     * For now, accepts all purchases as valid (server-side verification with Google Play Developer API
     * requires OAuth2 service account setup which will be configured during production hardening).
     */
    public GooglePurchaseValidationResult verifyPurchase(String productId, String purchaseToken, String orderId) {
        log.info("[GooglePlay] Verifying purchase: product={}, order={}", productId, orderId);

        try {
            // Basic validation - ensure required fields are present
            if (purchaseToken == null || purchaseToken.isEmpty()) {
                return GooglePurchaseValidationResult.invalid("Missing purchase token");
            }
            if (productId == null || productId.isEmpty()) {
                return GooglePurchaseValidationResult.invalid("Missing product ID");
            }

            // Determine if this is a subscription or consumable
            boolean isSubscription = productId.contains("subscription");
            int cardQuantity = isSubscription ? 0 : mapProductIdToCardQuantity(productId);

            log.info("[GooglePlay] Purchase validated: product={}, isSubscription={}, cards={}", productId, isSubscription, cardQuantity);

            return GooglePurchaseValidationResult.builder()
                    .valid(true)
                    .productId(productId)
                    .purchaseToken(purchaseToken)
                    .orderId(orderId != null ? orderId : "")
                    .isSubscription(isSubscription)
                    .cardQuantity(cardQuantity)
                    .build();

        } catch (Exception e) {
            log.error("[GooglePlay] Purchase verification error", e);
            return GooglePurchaseValidationResult.invalid("Verification error: " + e.getMessage());
        }
    }

    private int mapProductIdToCardQuantity(String productId) {
        if (productId.endsWith(".cards.1")) return 1;
        if (productId.endsWith(".cards.3")) return 3;
        if (productId.endsWith(".cards.5")) return 5;
        if (productId.endsWith(".cards.10")) return 10;
        return 1; // default
    }

    @Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GooglePurchaseValidationResult {
        private boolean valid;
        private String productId;
        private String purchaseToken;
        private String orderId;
        private boolean isSubscription;
        private int cardQuantity;
        private String errorMessage;

        public static GooglePurchaseValidationResult invalid(String message) {
            GooglePurchaseValidationResult result = new GooglePurchaseValidationResult();
            result.setValid(false);
            result.setErrorMessage(message);
            return result;
        }
    }
}
