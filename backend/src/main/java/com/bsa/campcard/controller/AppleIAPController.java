package com.bsa.campcard.controller;

import com.bsa.campcard.dto.card.PurchaseCardsRequest;
import com.bsa.campcard.dto.card.PurchaseCardsResponse;
import com.bsa.campcard.dto.subscription.CreateSubscriptionRequest;
import com.bsa.campcard.service.AppleIAPService;
import com.bsa.campcard.service.CampCardService;
import com.bsa.campcard.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/apple")
@RequiredArgsConstructor
@Tag(name = "Apple IAP", description = "Apple In-App Purchase receipt validation and fulfillment")
@Slf4j
public class AppleIAPController {

    private final AppleIAPService appleIAPService;
    private final SubscriptionService subscriptionService;
    private final CampCardService campCardService;

    @PostMapping("/verify-receipt")
    @Operation(summary = "Verify Apple IAP receipt and fulfill purchase")
    public ResponseEntity<?> verifyReceipt(@RequestBody VerifyReceiptRequest request) {
        log.info("[AppleIAP] Verifying receipt for product: {}, txn: {}", request.productId(), request.transactionId());

        // Validate the receipt with Apple
        AppleIAPService.AppleReceiptValidationResult result = appleIAPService.verifyReceipt(
                request.receiptData(),
                request.productId(),
                request.transactionId()
        );

        if (!result.isValid()) {
            log.warn("[AppleIAP] Receipt validation failed: {}", result.getErrorMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", result.getErrorMessage() != null ? result.getErrorMessage() : "Invalid receipt"
            ));
        }

        // Fulfill the purchase based on product type
        if (result.isSubscription()) {
            return fulfillSubscription(request, result);
        } else {
            return fulfillCardPurchase(request, result);
        }
    }

    private ResponseEntity<?> fulfillSubscription(VerifyReceiptRequest request, AppleIAPService.AppleReceiptValidationResult result) {
        try {
            UUID userId = request.userId() != null ? UUID.fromString(request.userId()) : null;

            if (userId == null) {
                // For signup flow — return validation result without creating subscription
                // The subscription will be created during the signup process
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "productId", result.getProductId(),
                        "transactionId", result.getTransactionId(),
                        "isSubscription", true,
                        "expiresDate", result.getExpiresDate() != null ? result.getExpiresDate().toString() : "",
                        "originalTransactionId", result.getOriginalTransactionId() != null ? result.getOriginalTransactionId() : ""
                ));
            }

            // For authenticated users — create subscription via existing service
            CreateSubscriptionRequest subRequest = new CreateSubscriptionRequest();
            // Determine plan ID based on product (annual = $15, scout = $10)
            Long planId = resolvePlanId(result.getProductId());
            subRequest.setPlanId(planId);

            CreateSubscriptionRequest.PaymentMethod paymentMethod = new CreateSubscriptionRequest.PaymentMethod();
            paymentMethod.setType("APPLE_IAP");
            paymentMethod.setApplePayToken(result.getTransactionId());
            subRequest.setPaymentMethod(paymentMethod);

            var subscription = subscriptionService.createSubscription(userId, subRequest);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getTransactionId(),
                    "subscriptionId", subscription.getId(),
                    "isSubscription", true,
                    "expiresDate", result.getExpiresDate() != null ? result.getExpiresDate().toString() : ""
            ));
        } catch (Exception e) {
            log.error("[AppleIAP] Failed to fulfill subscription", e);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getTransactionId(),
                    "isSubscription", true,
                    "message", "Receipt valid but subscription creation failed: " + e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> fulfillCardPurchase(VerifyReceiptRequest request, AppleIAPService.AppleReceiptValidationResult result) {
        try {
            UUID userId = request.userId() != null ? UUID.fromString(request.userId()) : null;

            if (userId == null) {
                // For signup flow — return validation result, cards will be created during signup
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "productId", result.getProductId(),
                        "transactionId", result.getTransactionId(),
                        "isSubscription", false,
                        "cardsPurchased", result.getCardQuantity()
                ));
            }

            // For authenticated users — create cards via existing service
            PurchaseCardsRequest cardsRequest = new PurchaseCardsRequest();
            cardsRequest.setQuantity(result.getCardQuantity());
            cardsRequest.setPaymentToken("apple_iap_" + result.getTransactionId());

            PurchaseCardsResponse cardsResponse = campCardService.purchaseCards(userId, cardsRequest);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getTransactionId(),
                    "isSubscription", false,
                    "cardsPurchased", result.getCardQuantity(),
                    "orderId", cardsResponse.getOrderId().toString()
            ));
        } catch (Exception e) {
            log.error("[AppleIAP] Failed to fulfill card purchase", e);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getTransactionId(),
                    "isSubscription", false,
                    "cardsPurchased", result.getCardQuantity(),
                    "message", "Receipt valid but card creation failed: " + e.getMessage()
            ));
        }
    }

    private Long resolvePlanId(String productId) {
        // Map Apple product IDs to backend subscription plan IDs
        // The $15 direct plan is typically plan ID 1, $10 scout plan is ID 2
        // These should match what's in the subscription_plans table
        if (productId.contains("scout")) {
            return 2L; // Scout referral plan ($10)
        }
        return 1L; // Direct plan ($15)
    }

    @PostMapping("/webhook")
    @Operation(summary = "Apple Server-to-Server notification webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload) {
        // Apple S2S V2 notifications for subscription status changes
        log.info("[AppleIAP] Received webhook notification");
        // TODO: Parse JWS payload, verify signature, handle notification types:
        // DID_RENEW, DID_FAIL_TO_RENEW, DID_CHANGE_RENEWAL_STATUS, EXPIRED, etc.
        return ResponseEntity.ok().build();
    }

    // Request DTO
    public record VerifyReceiptRequest(
            String receiptData,
            String productId,
            String transactionId,
            String userId // Optional — null for unauthenticated signup flow
    ) {}
}
