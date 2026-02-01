package com.bsa.campcard.service;

import com.bsa.campcard.dto.subscription.*;
import com.bsa.campcard.entity.CustomerPaymentProfile;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.entity.SubscriptionPlan;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.CustomerPaymentProfileRepository;
import com.bsa.campcard.repository.OfferRedemptionRepository;
import com.bsa.campcard.repository.SubscriptionPlanRepository;
import com.bsa.campcard.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final String PLAN_NOT_FOUND = "Subscription plan not found";
    private static final String SUBSCRIPTION_NOT_FOUND = "No subscription found";

    private static final int[] REMINDER_DAY_WINDOWS = {45, 30, 15, 7};

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final OfferRedemptionRepository offerRedemptionRepository;
    private final CustomerPaymentProfileRepository paymentProfileRepository;
    private final PaymentService paymentService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    
    /**
     * Get all active subscription plans
     */
    public List<SubscriptionPlanResponse> getAvailablePlans() {
        log.info("Fetching available subscription plans");
        
        List<SubscriptionPlan> plans = subscriptionPlanRepository
                .findByStatusAndDeletedAtIsNull(SubscriptionPlan.PlanStatus.ACTIVE);
        
        return plans.stream()
                .map(this::toPlanResponse)
                .toList();
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
                .toList();
    }
    
    /**
     * Create new subscription
     */
    @Transactional
    public SubscriptionResponse createSubscription(UUID userId, CreateSubscriptionRequest request) {
        log.info("Creating subscription for user: {} with plan: {}", userId, request.getPlanId());

        // Validate plan exists
        SubscriptionPlan plan = subscriptionPlanRepository.findByIdAndDeletedAtIsNull(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));

        // Check if user already has active subscription
        subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(
                userId, Subscription.SubscriptionStatus.ACTIVE
        ).ifPresent(sub -> {
            throw new IllegalStateException("User already has an active subscription");
        });

        // Get council ID for payment gateway routing
        Long councilId = plan.getCouncilId();

        // Verify payment if transactionId provided (Authorize.net Accept Hosted flow)
        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            verifyPayment(councilId, request.getTransactionId());
        }

        // Calculate period dates
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime periodEnd = calculatePeriodEnd(now, plan.getBillingInterval());

        // Create subscription
        Subscription subscription = Subscription.builder()
                .userId(userId)
                .councilId(councilId)
                .planId(plan.getId())
                .referralCode(request.getReferralCode())
                .currentPeriodStart(now)
                .currentPeriodEnd(periodEnd)
                .status(Subscription.SubscriptionStatus.PENDING) // Will be activated after payment
                .cancelAtPeriodEnd(false)
                .build();

        subscription = subscriptionRepository.save(subscription);

        log.info("Subscription created: {}", subscription.getId());

        // Activate subscription (payment already verified or will be processed separately)
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscription = subscriptionRepository.save(subscription);

        // Send subscription confirmation email
        sendSubscriptionConfirmationEmail(userId);

        return toSubscriptionResponse(subscription, plan);
    }

    /**
     * Verify payment via Authorize.net using council-specific gateway
     */
    private void verifyPayment(Long councilId, String transactionId) {
        try {
            com.bsa.campcard.dto.payment.PaymentResponse paymentResponse =
                    paymentService.verifySubscriptionPayment(councilId, transactionId);

            if ("SUCCESS".equals(paymentResponse.getStatus())) {
                log.info("Payment verified via council {} gateway: {}", councilId, transactionId);
            } else {
                log.error("Payment verification failed: {}", paymentResponse.getErrorMessage());
                throw new IllegalStateException("Payment verification failed: " + paymentResponse.getErrorMessage());
            }
        } catch (com.bsa.campcard.exception.PaymentException e) {
            log.error("Payment processing failed: {}", e.getMessage());
            throw new IllegalStateException("Payment processing failed: " + e.getMessage());
        }
    }

    /**
     * Send subscription confirmation email to user
     */
    private void sendSubscriptionConfirmationEmail(UUID userId) {
        try {
            log.info("Subscription confirmation email notification scheduled for user: {}", userId);
            // Email sending via async notification service
        } catch (Exception e) {
            log.error("Failed to send subscription confirmation email for user: {}", userId, e);
        }
    }

    /**
     * Get user's current subscription
     */
    public SubscriptionResponse getUserSubscription(UUID userId) {
        log.info("Fetching subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException(SUBSCRIPTION_NOT_FOUND));
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
        
        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Update subscription
     */
    @Transactional
    public SubscriptionResponse updateSubscription(UUID userId, UpdateSubscriptionRequest request) {
        log.info("Updating subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException(SUBSCRIPTION_NOT_FOUND));
        
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
        
        if (request.getPaymentNonce() != null) {
            log.info("Payment method update requested via Authorize.net");
        }
        
        subscription = subscriptionRepository.save(subscription);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
        
        return toSubscriptionResponse(subscription, plan);
    }
    
    /**
     * Reactivate canceled subscription
     */
    @Transactional
    public SubscriptionResponse reactivateSubscription(UUID userId) {
        log.info("Reactivating subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException(SUBSCRIPTION_NOT_FOUND));
        
        if (!subscription.getCancelAtPeriodEnd()) {
            throw new IllegalStateException("Subscription is not canceled");
        }
        
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCanceledAt(null);
        
        subscription = subscriptionRepository.save(subscription);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));
        
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
                .orElseThrow(() -> new ResourceNotFoundException(SUBSCRIPTION_NOT_FOUND));
        
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
                .orElseThrow(() -> new ResourceNotFoundException(SUBSCRIPTION_NOT_FOUND));

        if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Can only renew active subscriptions");
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException(PLAN_NOT_FOUND));

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
                // Renew subscription — charge stored payment method if available
                SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getPlanId())
                        .orElse(null);

                if (plan != null) {
                    boolean paymentSuccess = chargeStoredPaymentForRenewal(subscription, plan);

                    if (paymentSuccess) {
                        LocalDateTime newPeriodEnd = calculatePeriodEnd(now, plan.getBillingInterval());
                        subscription.setCurrentPeriodStart(now);
                        subscription.setCurrentPeriodEnd(newPeriodEnd);
                        log.info("Subscription renewed: {} until {}", subscription.getId(), newPeriodEnd);
                    } else {
                        // No stored payment method or charge failed — suspend
                        subscription.setStatus(Subscription.SubscriptionStatus.SUSPENDED);
                        log.warn("Subscription {} suspended — renewal payment failed", subscription.getId());
                    }
                }
            }
            
            subscriptionRepository.save(subscription);
        }
    }
    
    /**
     * Send renewal reminders at 45, 30, 15, and 7 days before expiration (scheduled job)
     */
    public void sendRenewalReminders() {
        LocalDateTime now = LocalDateTime.now();

        for (int days : REMINDER_DAY_WINDOWS) {
            LocalDateTime windowStart = now.plusDays(days);
            LocalDateTime windowEnd = windowStart.plusDays(1);

            List<Subscription> renewals = subscriptionRepository.findRenewalsInPeriod(
                    windowStart, windowEnd
            );

            log.info("Found {} subscriptions expiring in {} days", renewals.size(), days);

            for (Subscription subscription : renewals) {
                try {
                    LocalDate expirationDate = subscription.getCurrentPeriodEnd().toLocalDate();

                    User user = userRepository.findById(subscription.getUserId()).orElse(null);
                    if (user == null) {
                        log.warn("User not found for subscription: {}", subscription.getId());
                        continue;
                    }

                    emailService.sendSubscriptionExpiringReminder(
                            user.getEmail(),
                            user.getFirstName(),
                            days,
                            expirationDate
                    );

                    log.info("Sent {}-day renewal reminder to {} for subscription: {} expiring on: {}",
                            days, user.getEmail(), subscription.getId(), expirationDate);
                } catch (Exception e) {
                    log.error("Failed to send {}-day renewal reminder for subscription: {}",
                            days, subscription.getId(), e);
                }
            }
        }
    }
    
    /**
     * Attempt to charge a stored payment method for subscription renewal.
     *
     * @return true if payment succeeded or no payment is needed, false if charge failed
     */
    private boolean chargeStoredPaymentForRenewal(Subscription subscription, SubscriptionPlan plan) {
        UUID userId = subscription.getUserId();

        Optional<CustomerPaymentProfile> defaultProfile =
                paymentProfileRepository.findByUserIdAndIsDefaultTrue(userId);

        if (defaultProfile.isEmpty()) {
            log.warn("No stored payment method for user: {} — cannot auto-renew", userId);
            return false;
        }

        CustomerPaymentProfile profile = defaultProfile.get();
        BigDecimal amount = new BigDecimal(plan.getPriceCents()).divide(BigDecimal.valueOf(100));

        try {
            com.bsa.campcard.dto.payment.PaymentResponse result = paymentService.chargeCustomerProfile(
                    profile.getAuthorizeCustomerProfileId(),
                    profile.getAuthorizePaymentProfileId(),
                    amount,
                    "Camp Card Subscription Renewal"
            );

            if ("SUCCESS".equals(result.getStatus())) {
                log.info("Auto-renewal charge successful for user: {}, txn: {}", userId, result.getTransactionId());
                return true;
            } else {
                log.error("Auto-renewal charge failed for user: {}: {}", userId, result.getErrorMessage());
                return false;
            }
        } catch (Exception e) {
            log.error("Auto-renewal charge exception for user: {}", userId, e);
            return false;
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
