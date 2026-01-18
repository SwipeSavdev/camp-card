package com.bsa.campcard.service;

import com.bsa.campcard.dto.subscription.*;
import com.bsa.campcard.entity.Subscription;
import com.bsa.campcard.entity.SubscriptionPlan;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.OfferRedemptionRepository;
import com.bsa.campcard.repository.SubscriptionPlanRepository;
import com.bsa.campcard.repository.SubscriptionRepository;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubscriptionService Tests")
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private OfferRedemptionRepository offerRedemptionRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private UUID testUserId;
    private SubscriptionPlan annualPlan;
    private SubscriptionPlan monthlyPlan;
    private Subscription activeSubscription;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        annualPlan = SubscriptionPlan.builder()
                .id(1L)
                .uuid(UUID.randomUUID())
                .councilId(1L)
                .name("Annual Camp Card")
                .description("Full year access")
                .priceCents(2500)
                .currency("USD")
                .billingInterval(SubscriptionPlan.BillingInterval.ANNUAL)
                .trialDays(0)
                .status(SubscriptionPlan.PlanStatus.ACTIVE)
                .features(new String[]{"All offers", "QR code", "Referrals"})
                .build();

        monthlyPlan = SubscriptionPlan.builder()
                .id(2L)
                .uuid(UUID.randomUUID())
                .councilId(1L)
                .name("Monthly Camp Card")
                .description("Monthly access")
                .priceCents(500)
                .currency("USD")
                .billingInterval(SubscriptionPlan.BillingInterval.MONTHLY)
                .trialDays(0)
                .status(SubscriptionPlan.PlanStatus.ACTIVE)
                .build();

        activeSubscription = Subscription.builder()
                .id(1L)
                .uuid(UUID.randomUUID())
                .userId(testUserId)
                .councilId(1L)
                .planId(1L)
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .currentPeriodStart(LocalDateTime.now().minusMonths(6))
                .currentPeriodEnd(LocalDateTime.now().plusMonths(6))
                .cancelAtPeriodEnd(false)
                .build();
    }

    @Nested
    @DisplayName("getAvailablePlans Tests")
    class GetAvailablePlansTests {

        @Test
        @DisplayName("Should return all active plans")
        void shouldReturnAllActivePlans() {
            // Given
            when(subscriptionPlanRepository.findByStatusAndDeletedAtIsNull(SubscriptionPlan.PlanStatus.ACTIVE))
                    .thenReturn(List.of(annualPlan, monthlyPlan));

            // When
            List<SubscriptionPlanResponse> plans = subscriptionService.getAvailablePlans();

            // Then
            assertEquals(2, plans.size());
            assertEquals("Annual Camp Card", plans.get(0).getName());
            assertEquals("Monthly Camp Card", plans.get(1).getName());
        }

        @Test
        @DisplayName("Should return plans for specific council")
        void shouldReturnPlansForCouncil() {
            // Given
            Long councilId = 1L;
            when(subscriptionPlanRepository.findByCouncilIdAndStatusAndDeletedAtIsNull(
                    councilId, SubscriptionPlan.PlanStatus.ACTIVE))
                    .thenReturn(List.of(annualPlan));

            // When
            List<SubscriptionPlanResponse> plans = subscriptionService.getAvailablePlans(councilId);

            // Then
            assertEquals(1, plans.size());
            assertEquals("Annual Camp Card", plans.get(0).getName());
        }

        @Test
        @DisplayName("Should return empty list when no active plans")
        void shouldReturnEmptyListWhenNoPlans() {
            // Given
            when(subscriptionPlanRepository.findByStatusAndDeletedAtIsNull(SubscriptionPlan.PlanStatus.ACTIVE))
                    .thenReturn(List.of());

            // When
            List<SubscriptionPlanResponse> plans = subscriptionService.getAvailablePlans();

            // Then
            assertTrue(plans.isEmpty());
        }
    }

    @Nested
    @DisplayName("createSubscription Tests")
    class CreateSubscriptionTests {

        @Test
        @DisplayName("Should create subscription successfully")
        void shouldCreateSubscriptionSuccessfully() {
            // Given
            CreateSubscriptionRequest request = new CreateSubscriptionRequest();
            request.setPlanId(1L);

            User user = User.builder()
                    .id(testUserId)
                    .email("test@example.com")
                    .firstName("John")
                    .build();

            when(subscriptionPlanRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(annualPlan));
            when(subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(testUserId, Subscription.SubscriptionStatus.ACTIVE))
                    .thenReturn(Optional.empty());
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> {
                Subscription sub = i.getArgument(0);
                sub.setUuid(UUID.randomUUID());
                return sub;
            });
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(user));

            // When
            SubscriptionResponse response = subscriptionService.createSubscription(testUserId, request);

            // Then
            assertNotNull(response);
            assertEquals("ACTIVE", response.getStatus());
            assertNotNull(response.getCurrentPeriodEnd());
            verify(subscriptionRepository, times(2)).save(any(Subscription.class));
            verify(emailService).sendSubscriptionConfirmation(
                    eq("test@example.com"),
                    eq("John"),
                    eq("Annual Camp Card"),
                    any(),
                    any()
            );
        }

        @Test
        @DisplayName("Should throw exception when plan not found")
        void shouldThrowExceptionWhenPlanNotFound() {
            // Given
            CreateSubscriptionRequest request = new CreateSubscriptionRequest();
            request.setPlanId(999L);

            when(subscriptionPlanRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThrows(ResourceNotFoundException.class, () ->
                    subscriptionService.createSubscription(testUserId, request));
        }

        @Test
        @DisplayName("Should throw exception when user already has active subscription")
        void shouldThrowExceptionWhenUserHasActiveSubscription() {
            // Given
            CreateSubscriptionRequest request = new CreateSubscriptionRequest();
            request.setPlanId(1L);

            when(subscriptionPlanRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(annualPlan));
            when(subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(testUserId, Subscription.SubscriptionStatus.ACTIVE))
                    .thenReturn(Optional.of(activeSubscription));

            // When/Then
            assertThrows(IllegalStateException.class, () ->
                    subscriptionService.createSubscription(testUserId, request));
        }

        @Test
        @DisplayName("Should calculate correct period end for annual plan")
        void shouldCalculateCorrectPeriodEndForAnnualPlan() {
            // Given
            CreateSubscriptionRequest request = new CreateSubscriptionRequest();
            request.setPlanId(1L);

            when(subscriptionPlanRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(annualPlan));
            when(subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(testUserId, Subscription.SubscriptionStatus.ACTIVE))
                    .thenReturn(Optional.empty());
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> {
                Subscription sub = i.getArgument(0);
                sub.setUuid(UUID.randomUUID());
                return sub;
            });
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // When
            subscriptionService.createSubscription(testUserId, request);

            // Then
            ArgumentCaptor<Subscription> captor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository, atLeastOnce()).save(captor.capture());
            Subscription saved = captor.getValue();

            // Period end should be approximately 1 year from now
            assertTrue(saved.getCurrentPeriodEnd().isAfter(LocalDateTime.now().plusMonths(11)));
            assertTrue(saved.getCurrentPeriodEnd().isBefore(LocalDateTime.now().plusMonths(13)));
        }

        @Test
        @DisplayName("Should calculate correct period end for monthly plan")
        void shouldCalculateCorrectPeriodEndForMonthlyPlan() {
            // Given
            CreateSubscriptionRequest request = new CreateSubscriptionRequest();
            request.setPlanId(2L);

            when(subscriptionPlanRepository.findByIdAndDeletedAtIsNull(2L)).thenReturn(Optional.of(monthlyPlan));
            when(subscriptionRepository.findByUserIdAndStatusAndDeletedAtIsNull(testUserId, Subscription.SubscriptionStatus.ACTIVE))
                    .thenReturn(Optional.empty());
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> {
                Subscription sub = i.getArgument(0);
                sub.setUuid(UUID.randomUUID());
                return sub;
            });
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // When
            subscriptionService.createSubscription(testUserId, request);

            // Then
            ArgumentCaptor<Subscription> captor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository, atLeastOnce()).save(captor.capture());
            Subscription saved = captor.getValue();

            // Period end should be approximately 1 month from now
            assertTrue(saved.getCurrentPeriodEnd().isAfter(LocalDateTime.now().plusDays(27)));
            assertTrue(saved.getCurrentPeriodEnd().isBefore(LocalDateTime.now().plusDays(32)));
        }
    }

    @Nested
    @DisplayName("getUserSubscription Tests")
    class GetUserSubscriptionTests {

        @Test
        @DisplayName("Should return user subscription")
        void shouldReturnUserSubscription() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));

            // When
            SubscriptionResponse response = subscriptionService.getUserSubscription(testUserId);

            // Then
            assertNotNull(response);
            assertEquals("ACTIVE", response.getStatus());
        }

        @Test
        @DisplayName("Should throw exception when no subscription found")
        void shouldThrowExceptionWhenNoSubscription() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.empty());

            // When/Then
            assertThrows(ResourceNotFoundException.class, () ->
                    subscriptionService.getUserSubscription(testUserId));
        }
    }

    @Nested
    @DisplayName("updateSubscription Tests")
    class UpdateSubscriptionTests {

        @Test
        @DisplayName("Should set cancel at period end")
        void shouldSetCancelAtPeriodEnd() {
            // Given
            UpdateSubscriptionRequest request = new UpdateSubscriptionRequest();
            request.setCancelAtPeriodEnd(true);

            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));

            // When
            SubscriptionResponse response = subscriptionService.updateSubscription(testUserId, request);

            // Then
            assertTrue(response.getCancelAtPeriodEnd());
            assertFalse(response.getAutoRenew());
        }

        @Test
        @DisplayName("Should revert cancellation")
        void shouldRevertCancellation() {
            // Given
            activeSubscription.setCancelAtPeriodEnd(true);
            activeSubscription.setCanceledAt(LocalDateTime.now());

            UpdateSubscriptionRequest request = new UpdateSubscriptionRequest();
            request.setCancelAtPeriodEnd(false);

            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));

            // When
            SubscriptionResponse response = subscriptionService.updateSubscription(testUserId, request);

            // Then
            assertFalse(response.getCancelAtPeriodEnd());
            assertTrue(response.getAutoRenew());
        }
    }

    @Nested
    @DisplayName("reactivateSubscription Tests")
    class ReactivateSubscriptionTests {

        @Test
        @DisplayName("Should reactivate canceled subscription")
        void shouldReactivateCanceledSubscription() {
            // Given
            activeSubscription.setCancelAtPeriodEnd(true);
            activeSubscription.setCanceledAt(LocalDateTime.now());

            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));

            // When
            SubscriptionResponse response = subscriptionService.reactivateSubscription(testUserId);

            // Then
            assertFalse(response.getCancelAtPeriodEnd());
            assertTrue(response.getAutoRenew());
        }

        @Test
        @DisplayName("Should throw exception when subscription not canceled")
        void shouldThrowExceptionWhenNotCanceled() {
            // Given
            activeSubscription.setCancelAtPeriodEnd(false);

            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));

            // When/Then
            assertThrows(IllegalStateException.class, () ->
                    subscriptionService.reactivateSubscription(testUserId));
        }
    }

    @Nested
    @DisplayName("cancelSubscription Tests")
    class CancelSubscriptionTests {

        @Test
        @DisplayName("Should cancel subscription immediately")
        void shouldCancelSubscriptionImmediately() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));

            // When
            subscriptionService.cancelSubscription(testUserId);

            // Then
            ArgumentCaptor<Subscription> captor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository).save(captor.capture());
            assertEquals(Subscription.SubscriptionStatus.CANCELED, captor.getValue().getStatus());
            assertNotNull(captor.getValue().getCanceledAt());
        }

        @Test
        @DisplayName("Should throw exception when no subscription found")
        void shouldThrowExceptionWhenNoSubscription() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.empty());

            // When/Then
            assertThrows(ResourceNotFoundException.class, () ->
                    subscriptionService.cancelSubscription(testUserId));
        }
    }

    @Nested
    @DisplayName("renewSubscription Tests")
    class RenewSubscriptionTests {

        @Test
        @DisplayName("Should renew subscription and extend period")
        void shouldRenewSubscriptionAndExtendPeriod() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));

            LocalDateTime originalPeriodEnd = activeSubscription.getCurrentPeriodEnd();

            // When
            SubscriptionResponse response = subscriptionService.renewSubscription(testUserId);

            // Then
            ArgumentCaptor<Subscription> captor = ArgumentCaptor.forClass(Subscription.class);
            verify(subscriptionRepository).save(captor.capture());
            assertTrue(captor.getValue().getCurrentPeriodEnd().isAfter(originalPeriodEnd));
            assertFalse(response.getCancelAtPeriodEnd());
        }

        @Test
        @DisplayName("Should throw exception when subscription not active")
        void shouldThrowExceptionWhenNotActive() {
            // Given
            activeSubscription.setStatus(Subscription.SubscriptionStatus.CANCELED);

            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));

            // When/Then
            assertThrows(IllegalStateException.class, () ->
                    subscriptionService.renewSubscription(testUserId));
        }

        @Test
        @DisplayName("Should replenish offers on renewal")
        void shouldReplenishOffersOnRenewal() {
            // Given
            when(subscriptionRepository.findByUserIdAndDeletedAtIsNull(testUserId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionPlanRepository.findById(1L)).thenReturn(Optional.of(annualPlan));
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> i.getArgument(0));

            // When
            subscriptionService.renewSubscription(testUserId);

            // Then
            verify(offerRedemptionRepository).deleteByUserId(testUserId);
        }
    }

    @Nested
    @DisplayName("replenishOffers Tests")
    class ReplenishOffersTests {

        @Test
        @DisplayName("Should delete all redemptions for user")
        void shouldDeleteAllRedemptionsForUser() {
            // When
            subscriptionService.replenishOffers(testUserId);

            // Then
            verify(offerRedemptionRepository).deleteByUserId(testUserId);
        }
    }
}
