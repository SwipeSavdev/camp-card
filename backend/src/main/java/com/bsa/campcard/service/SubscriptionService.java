package com.bsa.campcard.service;

import com.bsa.campcard.dto.subscription.*;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.entity.SubscriptionPlan;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.OfferRedemptionRepository;
import com.bsa.campcard.repository.SubscriptionPlanRepository;
import com.bsa.campcard.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OfferRedemptionRepository offerRedemptionRepository;
    
    /**
     * Get all active subscription plans
     */
    public List<SubscriptionPlanResponse> getAvailablePlans() {
        log.info("Fetching available subscription plans");
        
        List<SubscriptionPlan> plans = subscriptionPlanRepository
                .findByStatusAndDeletedAtIsNull(SubscriptionPlan.PlanStatus.ACTIVE);
        
        return plans.stream()
                .map(this::toPlanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active subscription plans for a specific council
     */
    public List<SubscriptionPlanResponse> getAvailablePlans(Long councilId) {
        log.info("Fetching subscription plans for council: {}", councilId);
        
        List<SubscriptionPlan> plans = subscriptionPlanRepository
                .findByCouncilIdAndStatusAndDeletedAtIsNull(
                    councilId, 
                    SubscriptionPlan.PlanStatus.ACTIVE
                );
        
        return plans.stream()
                .map(this::toPlanResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Create new subscription
     */
    @Transactional
    public SubscriptionResponse createSubscription(UUID userId, CreateSubscriptionRequest request) {
        log.info("Creating subscription for user: {} with plan: {}", userId, request.getPlanId());
        
        // Validate plan exists
        SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndDeletedAtIsNull(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        
        // Check if user already has active subscription
        subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(
                userId, Subscription.SubscriptionStatus.ACTIVE
        ).ifPresent(sub -> {
            throw new IllegalStateException("User already has an active subscription");
        });
        
        // Calculate period dates
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodEnd = calculatePeriodEnd(now, plan.getBillingInterval());
        
        // Create subscription
        Subscription subscription = Subscription.builder()
                .userId(userId)
                .councilId(plan.getCouncilId())
                .planId(plan.getId())
                .referralCode(request.getReferralCode())
                .currentPeriodStart(now)
                .currentPeriodEnd(periodEnd)
                .status(Subscription.SubscriptionStatus.PENDING) // Will be activated after payment
                .cancelAtPeriodEnd(false)
                .build();
        
        subscription = subscriptionRepository.save(subscription);
        
        log.info("Subscription created: {}", subscription.getId());

        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscription = subscriptionRepository.save(subscription);

        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Get user's current subscription
     */
    public SubscriptionResponse getUserSubscription(UUID userId) {
        log.info("Fetching subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        
        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Update subscription
     */
    @Transactional
    public SubscriptionResponse updateSubscription(UUID userId, UpdateSubscriptionRequest request) {
        log.info("Updating subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));
        
        if (request.getCancelAtPeriodEnd() != null) {
            subscription.setCancelAtPeriodEnd(request.getCancelAtPeriodEnd());
            if (request.getCancelAtPeriodEnd()) {
                subscription.setCanceledAt(LocalDateTime.now());
                log.info("Subscription will be canceled at period end: {}", subscription.getCurrentPeriodEnd());
            } else {
                subscription.setCanceledAt(null);
                log.info("Subscription cancellation reverted");
            }
        }
        
        if (request.getStripePaymentMethodId() != null) {
            log.info("Payment method update requested");
        }
        
        subscription = subscriptionRepository.save(subscription);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        
        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Reactivate canceled subscription
     */
    @Transactional
    public SubscriptionResponse reactivateSubscription(UUID userId) {
        log.info("Reactivating subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));
        
        if (!subscription.getCancelAtPeriodEnd()) {
            throw new IllegalStateException("Subscription is not canceled");
        }
        
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCanceledAt(null);
        
        subscription = subscriptionRepository.save(subscription);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));
        
        log.info("Subscription reactivated: {}", subscription.getId());
        
        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Cancel subscription immediately (admin function)
     */
    @Transactional
    public void cancelSubscription(UUID userId) {
        log.info("Canceling subscription immediately for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));
        
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELED);
        subscription.setCanceledAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        
        log.info("Subscription canceled: {}", subscription.getId());
    }
    
    /**
     * Renew subscription immediately (user-initiated)
     * This extends the subscription period and replenishes all one-time offers
     */
    @Transactional
    public SubscriptionResponse renewSubscription(UUID userId) {
        log.info("Renewing subscription for user: {}", userId);

        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No subscription found"));

        if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Can only renew active subscriptions");
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));

        // Extend the subscription period from current end date
        LocalDateTime newPeriodStart = subscription.getCurrentPeriodEnd();
        LocalDateTime newPeriodEnd = calculatePeriodEnd(newPeriodStart, plan.getBillingInterval());

        subscription.setCurrentPeriodStart(newPeriodStart);
        subscription.setCurrentPeriodEnd(newPeriodEnd);
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCanceledAt(null);

        subscription = subscriptionRepository.save(subscription);

        // Replenish all one-time offers by deleting user's redemption history
        replenishOffers(userId);

        log.info("Subscription renewed for user: {} until {}", userId, newPeriodEnd);

        return toSubscriptionResponse(subscription, plan);
    }

    /**
     * Replenish all one-time offers for a user by clearing their redemption history
     */
    @Transactional
    public void replenishOffers(UUID userId) {
        log.info("Replenishing offers for user: {}", userId);
        offerRedemptionRepository.deleteByUserId(userId);
        log.info("Offer redemptions cleared for user: {}", userId);
    }

    /**
     * Process subscription renewal (scheduled job)
     */
    @Transactional
    public void processRenewals() {
        LocalDateTime now = LocalDateTime.now();
        
        List<Subscription> expiring = subscriptionRepository.findByStatusAndCurrentPeriodEndBefore(
                Subscription.SubscriptionStatus.ACTIVE,
                now
        );
        
        log.info("Processing {} expiring subscriptions", expiring.size());
        
        for (Subscription subscription : expiring) {
            if (subscription.getCancelAtPeriodEnd()) {
                // Cancel subscription
                subscription.setStatus(Subscription.SubscriptionStatus.CANCELED);
                log.info("Subscription canceled at period end: {}", subscription.getId());
            } else {
                // Renew subscription
                SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                        .orElse(null);
                
                if (plan != null) {
                    LocalDateTime newPeriodEnd = calculatePeriodEnd(now, plan.getBillingInterval());
                    subscription.setCurrentPeriodStart(now);
                    subscription.setCurrentPeriodEnd(newPeriodEnd);
                    
                    log.info("Subscription renewed: {} until {}", subscription.getId(), newPeriodEnd);
                }
            }
            
            subscriptionRepository.save(subscription);
        }
    }
    
    /**
     * Send renewal reminders (scheduled job)
     */
    public void sendRenewalReminders() {
        LocalDateTime sevenDaysFromNow = LocalDateTime.now().plusDays(7);
        LocalDateTime eightDaysFromNow = sevenDaysFromNow.plusDays(1);
        
        List<Subscription> renewals = subscriptionRepository.findRenewalsInPeriod(
                sevenDaysFromNow,
                eightDaysFromNow
        );
        
        log.info("Sending {} renewal reminders", renewals.size());

        for (Subscription subscription : renewals) {
            log.info("Renewal reminder: Subscription {} renews on {}", 
                    subscription.getId(), subscription.getCurrentPeriodEnd());
        }
    }
    
    // Helper methods
    
    private LocalDateTime calculatePeriodEnd(LocalDateTime start, SubscriptionPlan.BillingInterval interval) {
        return switch (interval) {
            case MONTHLY -> start.plusMonths(1);
            case ANNUAL -> start.plusYears(1);
        };
    }
    
    private SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .uuid(plan.getUuid())
                .name(plan.getName())
                .description(plan.getDescription())
                .priceCents(plan.getPriceCents())
                .currency(plan.getCurrency())
                .billingInterval(plan.getBillingInterval().name())
                .trialDays(plan.getTrialDays())
                .features(plan.getFeatures() != null ? Arrays.asList(plan.getFeatures()) : List.of())
                .build();
    }
    
    private SubscriptionResponse toSubscriptionResponse(Subscription subscription, SubscriptionPlan plan) {
        return SubscriptionResponse.builder()
                .id(subscription.getUuid().toString())
                .plan(toPlanResponse(plan))
                .status(subscription.getStatus().name())
                .currentPeriodStart(subscription.getCurrentPeriodStart())
                .currentPeriodEnd(subscription.getCurrentPeriodEnd())
                .cancelAtPeriodEnd(subscription.getCancelAtPeriodEnd())
                .autoRenew(!subscription.getCancelAtPeriodEnd())
                .totalSavings(0.0) // TODO: Calculate from redemptions
                .build();
    }
}
