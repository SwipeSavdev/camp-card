package com.bsa.campcard.controller;

import com.bsa.campcard.dto.payment.*;
import com.bsa.campcard.service.PaymentService;
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
    @PreAuthorize("hasAnyRole('MERCHANT', 'COUNCIL_ADMIN', 'SUPER_ADMIN')")
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
}
