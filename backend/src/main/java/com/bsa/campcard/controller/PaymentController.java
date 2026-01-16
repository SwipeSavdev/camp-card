package com.bsa.campcard.controller;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.service.PaymentService;
import com.bsa.campcard.service.SubscriptionPurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment processing endpoints")
public class PaymentController {

    private final PaymentService paymentService;
    private final SubscriptionPurchaseService subscriptionPurchaseService;

    @PostMapping("/charge")
    @PreAuthorize("hasAnyRole('SCOUT', 'PARENT', 'TROOP_LEADER', 'COUNCIL_ADMIN')")
    @Operation(summary = "Process a payment", description = "Charge a credit card using Authorize.net")
    public ResponseEntity<PaymentResponse> charge(@Valid @RequestBody ChargeRequest request) {
        log.info("Received charge request for amount: {}", request.getAmount());
        PaymentResponse response = paymentService.charge(request);

        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
        }
    }

    @PostMapping("/refund")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    @Operation(summary = "Process a refund", description = "Refund a previous transaction")
    public ResponseEntity<PaymentResponse> refund(@Valid @RequestBody RefundRequest request) {
        log.info("Received refund request for transaction: {}", request.getTransactionId());
        PaymentResponse response = paymentService.refund(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transaction/details")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get transaction details", description = "Query details for a specific transaction")
    public ResponseEntity<PaymentResponse> getTransactionDetails(@Valid @RequestBody TransactionQueryRequest request) {
        log.info("Received transaction query request for: {}", request.getTransactionId());
        PaymentResponse response = paymentService.getTransactionDetails(request);
        return ResponseEntity.ok(response);
    }

    // ========================================================================
    // PUBLIC ENDPOINTS FOR WEB SUBSCRIPTION PURCHASE (No auth required)
    // ========================================================================

    @PostMapping("/subscribe/charge")
    @Operation(summary = "Process subscription payment",
            description = "Charge a credit card for the $10/year subscription. No authentication required for new subscribers.")
    public ResponseEntity<PaymentResponse> chargeSubscription(@Valid @RequestBody ChargeRequest request) {
        log.info("Processing subscription charge for amount: {}", request.getAmount());

        // Ensure it's the correct subscription amount ($10)
        if (request.getAmount() == null ||
            request.getAmount().compareTo(new java.math.BigDecimal("10.00")) != 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PaymentResponse.builder()
                            .status("FAILED")
                            .errorMessage("Invalid subscription amount. Subscription is $10/year.")
                            .build());
        }

        PaymentResponse response = paymentService.charge(request);

        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
        }
    }

    @PostMapping("/subscribe/token")
    @Operation(summary = "Get Accept Hosted token",
            description = "Generate a token for Authorize.Net Accept Hosted payment form. Static $10/year subscription price.")
    public ResponseEntity<AcceptHostedTokenResponse> getAcceptHostedToken(
            @RequestBody(required = false) AcceptHostedTokenRequest request) {
        log.info("Generating Accept Hosted token for subscription");

        if (request == null) {
            request = new AcceptHostedTokenRequest();
        }

        AcceptHostedTokenResponse response = paymentService.getAcceptHostedToken(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/subscribe/complete")
    @Operation(summary = "Complete subscription purchase",
            description = "After successful payment, create user account and enroll in annual subscription. " +
                    "Verifies the transaction ID with Authorize.Net before creating the account.")
    public ResponseEntity<SubscriptionPurchaseResponse> completeSubscriptionPurchase(
            @Valid @RequestBody SubscriptionPurchaseRequest request) {
        log.info("Completing subscription purchase for email: {}, transaction: {}",
                request.getEmail(), request.getTransactionId());

        SubscriptionPurchaseResponse response = subscriptionPurchaseService.completePurchase(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/subscribe/verify/{transactionId}")
    @Operation(summary = "Verify payment transaction",
            description = "Check if a transaction ID is valid and matches the subscription amount")
    public ResponseEntity<PaymentResponse> verifyPayment(@PathVariable String transactionId) {
        log.info("Verifying subscription payment: {}", transactionId);

        try {
            PaymentResponse response = paymentService.verifySubscriptionPayment(transactionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PaymentResponse.builder()
                            .status("FAILED")
                            .errorMessage(e.getMessage())
                            .build());
        }
    }
}
