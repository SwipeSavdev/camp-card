package com.bsa.campcard.controller;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.dto.payment.SubscriptionCheckoutRequest;
import com.bsa.campcard.entity.CustomerPaymentProfile;
import com.bsa.campcard.repository.CustomerPaymentProfileRepository;
import com.bsa.campcard.service.PaymentService;
import com.bsa.campcard.service.SubscriptionPurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment processing endpoints")
public class PaymentController {

    private final PaymentService paymentService;
    private final SubscriptionPurchaseService subscriptionPurchaseService;
    private final CustomerPaymentProfileRepository paymentProfileRepository;

    @PostMapping("/charge")
    @PreAuthorize("hasAnyRole('SCOUT', 'PARENT', 'UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'TROOP_LEADER')")
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
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
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

    @PostMapping("/subscribe/mobile-charge")
    @Operation(summary = "Process mobile subscription payment",
            description = "Charge a credit card for Camp Card purchases via mobile app. " +
                    "Supports $15 self-service signups and multi-card purchases (1-10+ cards). " +
                    "No authentication required for new subscribers.")
    public ResponseEntity<PaymentResponse> chargeMobileSubscription(@Valid @RequestBody ChargeRequest request) {
        log.info("Processing mobile subscription charge for amount: {}", request.getAmount());

        // Validate minimum amount ($10 for scout referral, $15 for self-service)
        if (request.getAmount() == null ||
            request.getAmount().compareTo(new java.math.BigDecimal("10.00")) < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PaymentResponse.builder()
                            .status("FAILED")
                            .errorMessage("Invalid amount. Minimum is $10.00.")
                            .build());
        }

        // Validate maximum reasonable amount (10 cards at $15 = $150, with some buffer)
        if (request.getAmount().compareTo(new java.math.BigDecimal("200.00")) > 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(PaymentResponse.builder()
                            .status("FAILED")
                            .errorMessage("Amount exceeds maximum allowed for subscription purchases.")
                            .build());
        }

        PaymentResponse response = paymentService.charge(request);

        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
        }
    }

    @PostMapping("/subscribe/web-charge")
    @Operation(summary = "Process web payment with Accept.js",
            description = "Charge using Accept.js opaque data token. Card data is tokenized client-side and never reaches our server.")
    public ResponseEntity<PaymentResponse> webCharge(@Valid @RequestBody WebChargeRequest request) {
        log.info("Processing web charge via Accept.js for amount: {}", request.getAmount());

        PaymentResponse response = paymentService.chargeWithOpaqueData(request);

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

    @PostMapping("/subscribe/checkout")
    @Operation(summary = "Complete subscription checkout",
            description = "Process payment and create account in a single step. " +
                    "Collects card details and account information, processes payment with Authorize.Net, " +
                    "creates user account, and returns auth tokens for immediate login.")
    public ResponseEntity<SubscriptionPurchaseResponse> checkout(
            @Valid @RequestBody SubscriptionCheckoutRequest request) {
        log.info("Processing subscription checkout for email: {}", request.getEmail());

        SubscriptionPurchaseResponse response = subscriptionPurchaseService.checkout(request);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // ========================================================================
    // PAYMENT METHOD MANAGEMENT (CIM - stored cards for auto-renew)
    // ========================================================================

    @PostMapping("/payment-methods")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Save a payment method",
            description = "Tokenize and store a credit card via Authorize.net CIM for future charges (e.g., auto-renew)")
    public ResponseEntity<PaymentMethodResponse> savePaymentMethod(
            @Valid @RequestBody SavePaymentMethodRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        log.info("Saving payment method for user: {}", userId);

        try {
            // Find or create the CIM customer profile
            String customerProfileId;
            var existing = paymentProfileRepository.findByUserId(userId);
            if (!existing.isEmpty()) {
                customerProfileId = existing.get(0).getAuthorizeCustomerProfileId();
            } else {
                customerProfileId = paymentService.createCustomerProfile(
                        user.getEmail(), userId.toString());
            }

            // Parse expiration: mobile sends MMYY, CIM expects YYYY-MM
            String expDate = request.getExpirationDate();
            String cimExpDate;
            if (expDate.length() == 4) {
                cimExpDate = "20" + expDate.substring(2) + "-" + expDate.substring(0, 2);
            } else {
                cimExpDate = expDate;
            }

            String firstName = request.getFirstName() != null ? request.getFirstName() : user.getFirstName();
            String lastName = request.getLastName() != null ? request.getLastName() : user.getLastName();

            // Create payment profile in Authorize.net
            String paymentProfileId = paymentService.createPaymentProfile(
                    customerProfileId, request.getCardNumber(), cimExpDate,
                    request.getCvv(), firstName, lastName);

            // If setAsDefault, unset previous defaults
            if (Boolean.TRUE.equals(request.getSetAsDefault())) {
                for (CustomerPaymentProfile p : existing) {
                    if (Boolean.TRUE.equals(p.getIsDefault())) {
                        p.setIsDefault(false);
                        paymentProfileRepository.save(p);
                    }
                }
            }

            // Derive card metadata
            String cardLastFour = request.getCardNumber().length() >= 4
                    ? request.getCardNumber().substring(request.getCardNumber().length() - 4)
                    : request.getCardNumber();
            int expMonth = Integer.parseInt(expDate.substring(0, 2));
            int expYear = 2000 + Integer.parseInt(expDate.substring(2, 4));

            // Persist locally
            CustomerPaymentProfile profile = CustomerPaymentProfile.builder()
                    .userId(userId)
                    .authorizeCustomerProfileId(customerProfileId)
                    .authorizePaymentProfileId(paymentProfileId)
                    .cardLastFour(cardLastFour)
                    .cardType(detectCardType(request.getCardNumber()))
                    .expirationMonth(expMonth)
                    .expirationYear(expYear)
                    .isDefault(Boolean.TRUE.equals(request.getSetAsDefault()) || existing.isEmpty())
                    .build();

            profile = paymentProfileRepository.save(profile);

            return ResponseEntity.status(HttpStatus.CREATED).body(toPaymentMethodResponse(profile));

        } catch (Exception e) {
            log.error("Failed to save payment method for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    PaymentMethodResponse.builder().build());
        }
    }

    @GetMapping("/payment-methods")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get saved payment methods",
            description = "Returns the user's stored payment methods (card last four, type, expiration)")
    public ResponseEntity<List<PaymentMethodResponse>> getPaymentMethods(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();

        List<PaymentMethodResponse> methods = paymentProfileRepository.findByUserId(userId).stream()
                .map(this::toPaymentMethodResponse)
                .toList();

        return ResponseEntity.ok(methods);
    }

    @DeleteMapping("/payment-methods/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove a saved payment method",
            description = "Deletes a stored payment method from both local DB and Authorize.net CIM")
    public ResponseEntity<Void> deletePaymentMethod(
            @PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();

        CustomerPaymentProfile profile = paymentProfileRepository.findById(id).orElse(null);
        if (profile == null || !profile.getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        try {
            paymentService.deletePaymentProfile(
                    profile.getAuthorizeCustomerProfileId(),
                    profile.getAuthorizePaymentProfileId());
        } catch (Exception e) {
            log.warn("Failed to delete CIM profile (may already be removed): {}", e.getMessage());
        }

        paymentProfileRepository.delete(profile);
        return ResponseEntity.noContent().build();
    }

    private PaymentMethodResponse toPaymentMethodResponse(CustomerPaymentProfile profile) {
        return PaymentMethodResponse.builder()
                .id(profile.getId())
                .cardLastFour(profile.getCardLastFour())
                .cardType(profile.getCardType())
                .expirationMonth(profile.getExpirationMonth())
                .expirationYear(profile.getExpirationYear())
                .isDefault(profile.getIsDefault())
                .build();
    }

    private String detectCardType(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) return "Unknown";
        char first = cardNumber.charAt(0);
        return switch (first) {
            case '4' -> "Visa";
            case '5' -> "Mastercard";
            case '3' -> cardNumber.startsWith("34") || cardNumber.startsWith("37") ? "Amex" : "Other";
            case '6' -> "Discover";
            default -> "Other";
        };
    }
}
