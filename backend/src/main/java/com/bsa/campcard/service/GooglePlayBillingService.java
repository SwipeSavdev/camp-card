package com.bsa.campcard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.Objects;

@Service
@Slf4j
public class GooglePlayBillingService {

    private static final String ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
    private static final String PLAY_API_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
    private static final String PACKAGE_NAME = "org.bsa.campcard";

    @Value("${google.play.service-account-path:}")
    private String serviceAccountPath;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private GoogleCredentials credentials;

    @PostConstruct
    public void init() {
        if (serviceAccountPath == null || serviceAccountPath.isEmpty()) {
            log.warn("[GooglePlay] No service account path configured. Receipt verification will use basic validation only.");
            return;
        }
        try (InputStream is = new FileInputStream(serviceAccountPath)) {
            credentials = ServiceAccountCredentials
                    .fromStream(is)
                    .createScoped(Collections.singletonList(ANDROID_PUBLISHER_SCOPE));
            log.info("[GooglePlay] Service account credentials loaded from {}", serviceAccountPath);
        } catch (IOException e) {
            log.error("[GooglePlay] Failed to load service account credentials from {}", serviceAccountPath, e);
        }
    }

    /**
     * Verify a Google Play in-app product purchase by calling the Google Play Developer API.
     */
    public GooglePurchaseValidationResult verifyPurchase(String productId, String purchaseToken, String orderId) {
        log.info("[GooglePlay] Verifying purchase: product={}, order={}", productId, orderId);

        try {
            if (purchaseToken == null || purchaseToken.isEmpty()) {
                return GooglePurchaseValidationResult.invalid("Missing purchase token");
            }
            if (productId == null || productId.isEmpty()) {
                return GooglePurchaseValidationResult.invalid("Missing product ID");
            }

            boolean isSubscription = productId.contains("subscription");

            // If credentials are available, verify with Google Play API
            if (credentials != null) {
                if (isSubscription) {
                    return verifySubscriptionWithApi(productId, purchaseToken, orderId);
                } else {
                    return verifyProductWithApi(productId, purchaseToken, orderId);
                }
            }

            // Fallback: basic validation without API verification
            log.warn("[GooglePlay] No credentials configured, using basic validation for product={}", productId);
            int cardQuantity = isSubscription ? 0 : mapProductIdToCardQuantity(productId);

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

    /**
     * Verify a one-time product purchase via Google Play Developer API.
     * Endpoint: GET /androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
     */
    private GooglePurchaseValidationResult verifyProductWithApi(String productId, String purchaseToken, String orderId) {
        String url = String.format("%s/%s/purchases/products/%s/tokens/%s",
                PLAY_API_BASE, PACKAGE_NAME, productId, purchaseToken);

        try {
            String accessToken = getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode body = objectMapper.readTree(response.getBody());

            // purchaseState: 0 = Purchased, 1 = Canceled, 2 = Pending
            int purchaseState = body.path("purchaseState").asInt(-1);
            // consumptionState: 0 = Yet to be consumed, 1 = Consumed
            int consumptionState = body.path("consumptionState").asInt(-1);
            // acknowledgementState: 0 = Yet to be acknowledged, 1 = Acknowledged
            int acknowledgementState = body.path("acknowledgementState").asInt(-1);
            String apiOrderId = body.path("orderId").asText("");

            log.info("[GooglePlay] Product API response: purchaseState={}, consumptionState={}, acknowledgementState={}, orderId={}",
                    purchaseState, consumptionState, acknowledgementState, apiOrderId);

            if (purchaseState != 0) {
                return GooglePurchaseValidationResult.invalid(
                        "Purchase not in valid state. State: " + purchaseState);
            }

            int cardQuantity = mapProductIdToCardQuantity(productId);
            String resolvedOrderId = !apiOrderId.isEmpty() ? apiOrderId : Objects.requireNonNullElse(orderId, "");

            return GooglePurchaseValidationResult.builder()
                    .valid(true)
                    .productId(productId)
                    .purchaseToken(purchaseToken)
                    .orderId(resolvedOrderId)
                    .isSubscription(false)
                    .cardQuantity(cardQuantity)
                    .build();

        } catch (HttpClientErrorException e) {
            log.error("[GooglePlay] Product verification API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return GooglePurchaseValidationResult.invalid("Google Play API error: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("[GooglePlay] Product verification failed", e);
            return GooglePurchaseValidationResult.invalid("Verification failed: " + e.getMessage());
        }
    }

    /**
     * Verify a subscription purchase via Google Play Developer API.
     * Endpoint: GET /androidpublisher/v3/applications/{packageName}/purchases/subscriptionsv2/tokens/{token}
     */
    private GooglePurchaseValidationResult verifySubscriptionWithApi(String productId, String purchaseToken, String orderId) {
        // Use subscriptionsv2 endpoint (newer, recommended)
        String url = String.format("%s/%s/purchases/subscriptionsv2/tokens/%s",
                PLAY_API_BASE, PACKAGE_NAME, purchaseToken);

        try {
            String accessToken = getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode body = objectMapper.readTree(response.getBody());

            // subscriptionState: SUBSCRIPTION_STATE_ACTIVE, SUBSCRIPTION_STATE_EXPIRED, etc.
            String subscriptionState = body.path("subscriptionState").asText("");
            String latestOrderId = body.path("latestOrderId").asText("");
            String expiryTime = "";

            // Extract expiry from lineItems
            JsonNode lineItems = body.path("lineItems");
            if (lineItems.isArray() && lineItems.size() > 0) {
                expiryTime = lineItems.get(0).path("expiryTime").asText("");
            }

            log.info("[GooglePlay] Subscription API response: state={}, orderId={}, expiryTime={}",
                    subscriptionState, latestOrderId, expiryTime);

            boolean isActive = "SUBSCRIPTION_STATE_ACTIVE".equals(subscriptionState)
                    || "SUBSCRIPTION_STATE_IN_GRACE_PERIOD".equals(subscriptionState);

            if (!isActive) {
                return GooglePurchaseValidationResult.invalid(
                        "Subscription not active. State: " + subscriptionState);
            }

            String resolvedOrderId = !latestOrderId.isEmpty() ? latestOrderId : Objects.requireNonNullElse(orderId, "");

            return GooglePurchaseValidationResult.builder()
                    .valid(true)
                    .productId(productId)
                    .purchaseToken(purchaseToken)
                    .orderId(resolvedOrderId)
                    .isSubscription(true)
                    .cardQuantity(0)
                    .expiryTime(expiryTime)
                    .build();

        } catch (HttpClientErrorException e) {
            log.error("[GooglePlay] Subscription verification API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return GooglePurchaseValidationResult.invalid("Google Play API error: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("[GooglePlay] Subscription verification failed", e);
            return GooglePurchaseValidationResult.invalid("Verification failed: " + e.getMessage());
        }
    }

    private String getAccessToken() throws IOException {
        credentials.refreshIfExpired();
        return credentials.getAccessToken().getTokenValue();
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
        private String expiryTime;

        public static GooglePurchaseValidationResult invalid(String message) {
            GooglePurchaseValidationResult result = new GooglePurchaseValidationResult();
            result.setValid(false);
            result.setErrorMessage(message);
            return result;
        }
    }
}
