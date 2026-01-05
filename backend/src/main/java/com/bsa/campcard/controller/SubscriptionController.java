package com.bsa.campcard.controller;

import com.bsa.campcard.dto.subscription.*;
import com.bsa.campcard.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Subscription management endpoints")
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    @GetMapping("/subscription-plans")
    @Operation(summary = "Get available subscription plans", 
               description = "List all active subscription plans")
    public ResponseEntity<Map<String, Object>> getSubscriptionPlans(
            @RequestParam(required = false) Long councilId) {
        log.info("Fetching subscription plans. Council ID: {}", councilId);
        
        List<SubscriptionPlanResponse> plans = councilId != null
                ? subscriptionService.getAvailablePlans(councilId)
                : subscriptionService.getAvailablePlans();
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", plans);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/subscriptions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create subscription",
               description = "Purchase a new subscription")
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody CreateSubscriptionRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("Creating subscription for user: {}", userId);
        SubscriptionResponse subscription = subscriptionService.createSubscription(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(subscription);
    }

    @GetMapping("/subscriptions/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my subscription",
               description = "Get current user's subscription details")
    public ResponseEntity<SubscriptionResponse> getMySubscription(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("Fetching subscription for user: {}", userId);
        SubscriptionResponse subscription = subscriptionService.getUserSubscription(userId);
        return ResponseEntity.ok(subscription);
    }

    @PatchMapping("/subscriptions/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update my subscription",
               description = "Update subscription settings (cancel, payment method)")
    public ResponseEntity<SubscriptionResponse> updateMySubscription(
            @Valid @RequestBody UpdateSubscriptionRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("Updating subscription for user: {}", userId);
        SubscriptionResponse subscription = subscriptionService.updateSubscription(userId, request);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/subscriptions/me/reactivate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reactivate subscription",
               description = "Reactivate a canceled subscription before period ends")
    public ResponseEntity<SubscriptionResponse> reactivateSubscription(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("Reactivating subscription for user: {}", userId);
        SubscriptionResponse subscription = subscriptionService.reactivateSubscription(userId);
        return ResponseEntity.ok(subscription);
    }

    @DeleteMapping("/subscriptions/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel subscription immediately",
               description = "Cancel subscription immediately (admin only)")
    public ResponseEntity<Void> cancelSubscription(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        log.info("Canceling subscription for user: {}", userId);
        subscriptionService.cancelSubscription(userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        org.bsa.campcard.domain.user.User user = (org.bsa.campcard.domain.user.User) authentication.getPrincipal();
        return user.getId();
    }
}
