package com.bsa.campcard.controller;

import com.bsa.campcard.dto.card.PurchaseCardsRequest;
import com.bsa.campcard.dto.card.PurchaseCardsResponse;
import com.bsa.campcard.dto.subscription.CreateSubscriptionRequest;
import com.bsa.campcard.service.CampCardService;
import com.bsa.campcard.service.GooglePlayBillingService;
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
@RequestMapping("/api/v1/google")
@RequiredArgsConstructor
@Tag(name = "Google Play Billing", description = "Google Play In-App Purchase verification and fulfillment")
@Slf4j
public class GooglePlayController {

    private final GooglePlayBillingService googlePlayBillingService;
    private final SubscriptionService subscriptionService;
    private final CampCardService campCardService;

    @PostMapping("/verify-receipt")
    @Operation(summary = "Verify Google Play purchase and fulfill")
    public ResponseEntity<?> verifyReceipt(@RequestBody VerifyReceiptRequest request) {
        log.info("[GooglePlay] Verifying receipt for product: {}, order: {}", request.productId(), request.orderId());

        // Validate the purchase with Google Play
        GooglePlayBillingService.GooglePurchaseValidationResult result = googlePlayBillingService.verifyPurchase(
                request.productId(),
                request.receiptData(), // purchaseToken is sent as receiptData from mobile
                request.orderId()
        );

        if (!result.isValid()) {
            log.warn("[GooglePlay] Purchase validation failed: {}", result.getErrorMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", result.getErrorMessage() != null ? result.getErrorMessage() : "Invalid purchase"
            ));
        }

        // Fulfill the purchase based on product type
        if (result.isSubscription()) {
            return fulfillSubscription(request, result);
        } else {
            return fulfillCardPurchase(request, result);
        }
    }

    private ResponseEntity<?> fulfillSubscription(VerifyReceiptRequest request, GooglePlayBillingService.GooglePurchaseValidationResult result) {
        try {
            UUID userId = request.userId() != null ? UUID.fromString(request.userId()) : null;

            if (userId == null) {
                // For signup flow - return validation result without creating subscription
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "productId", result.getProductId(),
                        "transactionId", result.getOrderId(),
                        "isSubscription", true
                ));
            }

            // For authenticated users - create subscription via existing service
            CreateSubscriptionRequest subRequest = new CreateSubscriptionRequest();
            Long planId = resolvePlanId(result.getProductId());
            subRequest.setPlanId(planId);

            CreateSubscriptionRequest.PaymentMethod paymentMethod = new CreateSubscriptionRequest.PaymentMethod();
            paymentMethod.setType("GOOGLE_PLAY");
            paymentMethod.setApplePayToken(result.getOrderId()); // Reusing field for Google order ID
            subRequest.setPaymentMethod(paymentMethod);

            var subscription = subscriptionService.createSubscription(userId, subRequest);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getOrderId(),
                    "subscriptionId", subscription.getId(),
                    "isSubscription", true
            ));
        } catch (Exception e) {
            log.error("[GooglePlay] Failed to fulfill subscription", e);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getOrderId(),
                    "isSubscription", true,
                    "message", "Purchase valid but subscription creation failed: " + e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> fulfillCardPurchase(VerifyReceiptRequest request, GooglePlayBillingService.GooglePurchaseValidationResult result) {
        try {
            UUID userId = request.userId() != null ? UUID.fromString(request.userId()) : null;

            if (userId == null) {
                // For signup flow - return validation result, cards will be created during signup
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "productId", result.getProductId(),
                        "transactionId", result.getOrderId(),
                        "isSubscription", false,
                        "cardsPurchased", result.getCardQuantity()
                ));
            }

            // For authenticated users - create cards via existing service
            PurchaseCardsRequest cardsRequest = new PurchaseCardsRequest();
            cardsRequest.setQuantity(result.getCardQuantity());
            cardsRequest.setPaymentToken("google_play_" + result.getOrderId());

            PurchaseCardsResponse cardsResponse = campCardService.purchaseCards(userId, cardsRequest);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getOrderId(),
                    "isSubscription", false,
                    "cardsPurchased", result.getCardQuantity(),
                    "orderId", cardsResponse.getOrderId().toString()
            ));
        } catch (Exception e) {
            log.error("[GooglePlay] Failed to fulfill card purchase", e);
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "productId", result.getProductId(),
                    "transactionId", result.getOrderId(),
                    "isSubscription", false,
                    "cardsPurchased", result.getCardQuantity(),
                    "message", "Purchase valid but card creation failed: " + e.getMessage()
            ));
        }
    }

    private Long resolvePlanId(String productId) {
        // Map product IDs to backend subscription plan IDs
        if (productId.contains("scout")) {
            return 2L; // Scout referral plan ($10)
        }
        return 1L; // Direct plan ($15)
    }

    // Request DTO - matches the mobile app's verifyReceipt() data format
    public record VerifyReceiptRequest(
            String receiptData,   // Google Play purchase token
            String productId,
            String transactionId,
            String orderId,       // Google Play order ID
            String userId         // Optional - null for unauthenticated signup flow
    ) {}
}
