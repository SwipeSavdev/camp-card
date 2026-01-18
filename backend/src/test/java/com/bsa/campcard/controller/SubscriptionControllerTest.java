package com.bsa.campcard.controller;

import com.bsa.campcard.dto.subscription.*;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.service.SubscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsa.campcard.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for SubscriptionController using @WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Request/response handling
 * - Input validation
 * - Authorization (RBAC)
 * - Error handling
 * - Payment integration scenarios
 */
@WebMvcTest(SubscriptionController.class)
@Import(TestSecurityConfig.class)
@DisplayName("SubscriptionController Tests")
class SubscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SubscriptionService subscriptionService;

    private CreateSubscriptionRequest validCreateRequest;
    private UpdateSubscriptionRequest validUpdateRequest;
    private SubscriptionResponse sampleSubscriptionResponse;
    private SubscriptionPlanResponse samplePlanResponse;
    private UUID testUserId;
    private UUID testSubscriptionUuid;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testSubscriptionUuid = UUID.randomUUID();

        // Create a valid subscription plan response
        samplePlanResponse = new SubscriptionPlanResponse();
        samplePlanResponse.setId(1L);
        samplePlanResponse.setUuid(UUID.randomUUID());
        samplePlanResponse.setName("Annual Camp Card");
        samplePlanResponse.setDescription("Full access to all merchant discounts for one year");
        samplePlanResponse.setPriceCents(2500);
        samplePlanResponse.setCurrency("USD");
        samplePlanResponse.setBillingInterval("ANNUAL");
        samplePlanResponse.setTrialDays(0);
        samplePlanResponse.setFeatures(List.of("All merchant offers", "QR code access", "Family sharing"));

        // Create a sample subscription response
        sampleSubscriptionResponse = new SubscriptionResponse();
        sampleSubscriptionResponse.setId(testSubscriptionUuid.toString());
        sampleSubscriptionResponse.setPlan(samplePlanResponse);
        sampleSubscriptionResponse.setStatus("ACTIVE");
        sampleSubscriptionResponse.setCurrentPeriodStart(LocalDateTime.now());
        sampleSubscriptionResponse.setCurrentPeriodEnd(LocalDateTime.now().plusYears(1));
        sampleSubscriptionResponse.setCancelAtPeriodEnd(false);
        sampleSubscriptionResponse.setAutoRenew(true);
        sampleSubscriptionResponse.setTotalSavings(150.0);

        // Create a valid create subscription request
        CreateSubscriptionRequest.PaymentMethod paymentMethod = new CreateSubscriptionRequest.PaymentMethod();
        paymentMethod.setType("STRIPE");
        paymentMethod.setStripePaymentMethodId("pm_test_123456");

        validCreateRequest = new CreateSubscriptionRequest();
        validCreateRequest.setPlanId(1L);
        validCreateRequest.setReferralCode("SCOUT123");
        validCreateRequest.setPaymentMethod(paymentMethod);
        validCreateRequest.setIdempotencyKey(UUID.randomUUID().toString());

        // Create a valid update subscription request
        validUpdateRequest = new UpdateSubscriptionRequest();
        validUpdateRequest.setCancelAtPeriodEnd(true);
        validUpdateRequest.setStripePaymentMethodId(null);
    }

    // ========================================================================
    // GET SUBSCRIPTION PLANS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/subscription-plans - Get Subscription Plans")
    class GetSubscriptionPlansTests {

        @Test
        @DisplayName("Should return all subscription plans without council filter")
        @WithMockUser(roles = "SCOUT")
        void getSubscriptionPlans_NoFilter_Success() throws Exception {
            List<SubscriptionPlanResponse> plans = List.of(samplePlanResponse);
            when(subscriptionService.getAvailablePlans()).thenReturn(plans);

            mockMvc.perform(get("/api/v1/subscription-plans")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].id").value(1L))
                    .andExpect(jsonPath("$.data[0].name").value("Annual Camp Card"))
                    .andExpect(jsonPath("$.data[0].priceCents").value(2500))
                    .andExpect(jsonPath("$.data[0].billingInterval").value("ANNUAL"));

            verify(subscriptionService).getAvailablePlans();
            verify(subscriptionService, never()).getAvailablePlans(anyLong());
        }

        @Test
        @DisplayName("Should return subscription plans filtered by council ID")
        @WithMockUser(roles = "SCOUT")
        void getSubscriptionPlans_WithCouncilFilter_Success() throws Exception {
            List<SubscriptionPlanResponse> plans = List.of(samplePlanResponse);
            when(subscriptionService.getAvailablePlans(1L)).thenReturn(plans);

            mockMvc.perform(get("/api/v1/subscription-plans")
                            .param("councilId", "1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data", hasSize(1)));

            verify(subscriptionService).getAvailablePlans(1L);
            verify(subscriptionService, never()).getAvailablePlans();
        }

        @Test
        @DisplayName("Should return empty list when no plans available")
        @WithMockUser(roles = "SCOUT")
        void getSubscriptionPlans_NoPlanFound_ReturnsEmptyList() throws Exception {
            when(subscriptionService.getAvailablePlans()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/subscription-plans")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data", hasSize(0)));

            verify(subscriptionService).getAvailablePlans();
        }

        @Test
        @DisplayName("Should return plans with multiple billing intervals")
        @WithMockUser(roles = "PARENT")
        void getSubscriptionPlans_MultiplePlans_Success() throws Exception {
            SubscriptionPlanResponse monthlyPlan = new SubscriptionPlanResponse();
            monthlyPlan.setId(2L);
            monthlyPlan.setName("Monthly Camp Card");
            monthlyPlan.setPriceCents(500);
            monthlyPlan.setBillingInterval("MONTHLY");

            List<SubscriptionPlanResponse> plans = List.of(samplePlanResponse, monthlyPlan);
            when(subscriptionService.getAvailablePlans()).thenReturn(plans);

            mockMvc.perform(get("/api/v1/subscription-plans")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.data[0].billingInterval").value("ANNUAL"))
                    .andExpect(jsonPath("$.data[1].billingInterval").value("MONTHLY"));

            verify(subscriptionService).getAvailablePlans();
        }

        @Test
        @DisplayName("Should allow unauthenticated access to subscription plans")
        void getSubscriptionPlans_Unauthenticated_Unauthorized() throws Exception {
            // This endpoint does not have @PreAuthorize, but our test config requires auth
            mockMvc.perform(get("/api/v1/subscription-plans")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ========================================================================
    // CREATE SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/subscriptions - Create Subscription")
    class CreateSubscriptionTests {

        @Test
        @DisplayName("Should create subscription when authenticated")
        void createSubscription_Authenticated_Success() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(testSubscriptionUuid.toString()))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.plan.name").value("Annual Camp Card"))
                    .andExpect(jsonPath("$.autoRenew").value(true));

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should create subscription as PARENT role")
        void createSubscription_AsParent_Success() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_PARENT")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should create subscription as TROOP_LEADER role")
        void createSubscription_AsTroopLeader_Success() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_TROOP_LEADER")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void createSubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/subscriptions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).createSubscription(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when planId is null")
        void createSubscription_NullPlanId_BadRequest() throws Exception {
            validCreateRequest.setPlanId(null);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isBadRequest());

            verify(subscriptionService, never()).createSubscription(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when payment method is null")
        void createSubscription_NullPaymentMethod_BadRequest() throws Exception {
            validCreateRequest.setPaymentMethod(null);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isBadRequest());

            verify(subscriptionService, never()).createSubscription(any(), any());
        }

        @Test
        @DisplayName("Should return 400 when payment type is null")
        void createSubscription_NullPaymentType_BadRequest() throws Exception {
            validCreateRequest.getPaymentMethod().setType(null);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isBadRequest());

            verify(subscriptionService, never()).createSubscription(any(), any());
        }

        @Test
        @DisplayName("Should handle IllegalStateException when user already has active subscription")
        void createSubscription_AlreadyExists_Conflict() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenThrow(new IllegalStateException("User already has an active subscription"));

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isInternalServerError());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should handle ResourceNotFoundException when plan not found")
        void createSubscription_PlanNotFound_NotFound() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Subscription plan not found"));

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }
    }

    // ========================================================================
    // GET MY SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/subscriptions/me - Get My Subscription")
    class GetMySubscriptionTests {

        @Test
        @DisplayName("Should return user's subscription when authenticated")
        void getMySubscription_Authenticated_Success() throws Exception {
            when(subscriptionService.getUserSubscription(testUserId)).thenReturn(sampleSubscriptionResponse);

            performGetWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testSubscriptionUuid.toString()))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.plan.name").value("Annual Camp Card"))
                    .andExpect(jsonPath("$.totalSavings").value(150.0));

            verify(subscriptionService).getUserSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getMySubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/subscriptions/me")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).getUserSubscription(any());
        }

        @Test
        @DisplayName("Should return 404 when no subscription found")
        void getMySubscription_NotFound_ReturnsNotFound() throws Exception {
            when(subscriptionService.getUserSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performGetWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).getUserSubscription(testUserId);
        }

        @Test
        @DisplayName("Should work for PARENT role")
        void getMySubscription_AsParent_Success() throws Exception {
            when(subscriptionService.getUserSubscription(testUserId)).thenReturn(sampleSubscriptionResponse);

            performGetWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_PARENT")
                    .andExpect(status().isOk());

            verify(subscriptionService).getUserSubscription(testUserId);
        }
    }

    // ========================================================================
    // UPDATE SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("PATCH /api/v1/subscriptions/me - Update My Subscription")
    class UpdateSubscriptionTests {

        @Test
        @DisplayName("Should update subscription to cancel at period end")
        void updateSubscription_CancelAtPeriodEnd_Success() throws Exception {
            SubscriptionResponse canceledResponse = new SubscriptionResponse();
            canceledResponse.setId(testSubscriptionUuid.toString());
            canceledResponse.setPlan(samplePlanResponse);
            canceledResponse.setStatus("ACTIVE");
            canceledResponse.setCancelAtPeriodEnd(true);
            canceledResponse.setAutoRenew(false);

            when(subscriptionService.updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class)))
                    .thenReturn(canceledResponse);

            performPatchWithAuth("/api/v1/subscriptions/me", validUpdateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cancelAtPeriodEnd").value(true))
                    .andExpect(jsonPath("$.autoRenew").value(false));

            verify(subscriptionService).updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should update subscription with new payment method")
        void updateSubscription_PaymentMethod_Success() throws Exception {
            validUpdateRequest.setCancelAtPeriodEnd(null);
            validUpdateRequest.setStripePaymentMethodId("pm_new_12345");

            when(subscriptionService.updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPatchWithAuth("/api/v1/subscriptions/me", validUpdateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isOk());

            verify(subscriptionService).updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void updateSubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(patch("/api/v1/subscriptions/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validUpdateRequest))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).updateSubscription(any(), any());
        }

        @Test
        @DisplayName("Should return 404 when no subscription found")
        void updateSubscription_NotFound_ReturnsNotFound() throws Exception {
            when(subscriptionService.updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class)))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPatchWithAuth("/api/v1/subscriptions/me", validUpdateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class));
        }
    }

    // ========================================================================
    // REACTIVATE SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/subscriptions/me/reactivate - Reactivate Subscription")
    class ReactivateSubscriptionTests {

        @Test
        @DisplayName("Should reactivate canceled subscription")
        void reactivateSubscription_Success() throws Exception {
            when(subscriptionService.reactivateSubscription(testUserId)).thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions/me/reactivate", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cancelAtPeriodEnd").value(false))
                    .andExpect(jsonPath("$.autoRenew").value(true));

            verify(subscriptionService).reactivateSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void reactivateSubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/subscriptions/me/reactivate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).reactivateSubscription(any());
        }

        @Test
        @DisplayName("Should return error when subscription is not canceled")
        void reactivateSubscription_NotCanceled_Error() throws Exception {
            when(subscriptionService.reactivateSubscription(testUserId))
                    .thenThrow(new IllegalStateException("Subscription is not canceled"));

            performPostWithAuth("/api/v1/subscriptions/me/reactivate", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isInternalServerError());

            verify(subscriptionService).reactivateSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 404 when no subscription found")
        void reactivateSubscription_NotFound_ReturnsNotFound() throws Exception {
            when(subscriptionService.reactivateSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPostWithAuth("/api/v1/subscriptions/me/reactivate", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).reactivateSubscription(testUserId);
        }
    }

    // ========================================================================
    // RENEW SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/subscriptions/me/renew - Renew Subscription")
    class RenewSubscriptionTests {

        @Test
        @DisplayName("Should renew subscription and extend period")
        void renewSubscription_Success() throws Exception {
            SubscriptionResponse renewedResponse = new SubscriptionResponse();
            renewedResponse.setId(testSubscriptionUuid.toString());
            renewedResponse.setPlan(samplePlanResponse);
            renewedResponse.setStatus("ACTIVE");
            renewedResponse.setCurrentPeriodStart(LocalDateTime.now().plusYears(1));
            renewedResponse.setCurrentPeriodEnd(LocalDateTime.now().plusYears(2));
            renewedResponse.setCancelAtPeriodEnd(false);
            renewedResponse.setAutoRenew(true);

            when(subscriptionService.renewSubscription(testUserId)).thenReturn(renewedResponse);

            performPostWithAuth("/api/v1/subscriptions/me/renew", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.cancelAtPeriodEnd").value(false));

            verify(subscriptionService).renewSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void renewSubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/subscriptions/me/renew")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).renewSubscription(any());
        }

        @Test
        @DisplayName("Should return error when subscription is not active")
        void renewSubscription_NotActive_Error() throws Exception {
            when(subscriptionService.renewSubscription(testUserId))
                    .thenThrow(new IllegalStateException("Can only renew active subscriptions"));

            performPostWithAuth("/api/v1/subscriptions/me/renew", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isInternalServerError());

            verify(subscriptionService).renewSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 404 when no subscription found")
        void renewSubscription_NotFound_ReturnsNotFound() throws Exception {
            when(subscriptionService.renewSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPostWithAuth("/api/v1/subscriptions/me/renew", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).renewSubscription(testUserId);
        }

        @Test
        @DisplayName("Should work for PARENT role")
        void renewSubscription_AsParent_Success() throws Exception {
            when(subscriptionService.renewSubscription(testUserId)).thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions/me/renew", null, testUserId, "ROLE_PARENT")
                    .andExpect(status().isOk());

            verify(subscriptionService).renewSubscription(testUserId);
        }
    }

    // ========================================================================
    // CANCEL SUBSCRIPTION TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/subscriptions/me - Cancel Subscription")
    class CancelSubscriptionTests {

        @Test
        @DisplayName("Should cancel subscription immediately")
        void cancelSubscription_Success() throws Exception {
            doNothing().when(subscriptionService).cancelSubscription(testUserId);

            performDeleteWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNoContent());

            verify(subscriptionService).cancelSubscription(testUserId);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void cancelSubscription_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(delete("/api/v1/subscriptions/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(subscriptionService, never()).cancelSubscription(any());
        }

        @Test
        @DisplayName("Should return 404 when no subscription found")
        void cancelSubscription_NotFound_ReturnsNotFound() throws Exception {
            doThrow(new ResourceNotFoundException("No subscription found"))
                    .when(subscriptionService).cancelSubscription(testUserId);

            performDeleteWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());

            verify(subscriptionService).cancelSubscription(testUserId);
        }

        @Test
        @DisplayName("Should work for TROOP_LEADER role")
        void cancelSubscription_AsTroopLeader_Success() throws Exception {
            doNothing().when(subscriptionService).cancelSubscription(testUserId);

            performDeleteWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_TROOP_LEADER")
                    .andExpect(status().isNoContent());

            verify(subscriptionService).cancelSubscription(testUserId);
        }
    }

    // ========================================================================
    // AUTHORIZATION TESTS
    // ========================================================================

    @Nested
    @DisplayName("Authorization Tests")
    class AuthorizationTests {

        @Test
        @DisplayName("Should allow NATIONAL_ADMIN to create subscription")
        void authorization_NationalAdmin_CanCreateSubscription() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_NATIONAL_ADMIN")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should allow COUNCIL_ADMIN to create subscription")
        void authorization_CouncilAdmin_CanCreateSubscription() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_COUNCIL_ADMIN")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("All authenticated users should access their own subscription")
        void authorization_AllRoles_CanAccessOwnSubscription() throws Exception {
            when(subscriptionService.getUserSubscription(any())).thenReturn(sampleSubscriptionResponse);

            String[] roles = {"ROLE_SCOUT", "ROLE_PARENT", "ROLE_TROOP_LEADER", "ROLE_COUNCIL_ADMIN", "ROLE_NATIONAL_ADMIN"};
            for (String role : roles) {
                performGetWithAuth("/api/v1/subscriptions/me", UUID.randomUUID(), role)
                        .andExpect(status().isOk());
            }

            verify(subscriptionService, times(5)).getUserSubscription(any());
        }
    }

    // ========================================================================
    // PAYMENT INTEGRATION TESTS
    // ========================================================================

    @Nested
    @DisplayName("Payment Integration Tests")
    class PaymentIntegrationTests {

        @Test
        @DisplayName("Should create subscription with Stripe payment method")
        void payment_StripePayment_Success() throws Exception {
            CreateSubscriptionRequest.PaymentMethod stripeMethod = new CreateSubscriptionRequest.PaymentMethod();
            stripeMethod.setType("STRIPE");
            stripeMethod.setStripePaymentMethodId("pm_stripe_test_123");

            validCreateRequest.setPaymentMethod(stripeMethod);

            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should create subscription with Apple Pay")
        void payment_ApplePay_Success() throws Exception {
            CreateSubscriptionRequest.PaymentMethod applePayMethod = new CreateSubscriptionRequest.PaymentMethod();
            applePayMethod.setType("APPLE_PAY");
            applePayMethod.setApplePayToken("apple_pay_token_123");

            validCreateRequest.setPaymentMethod(applePayMethod);

            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should create subscription with Google Pay")
        void payment_GooglePay_Success() throws Exception {
            CreateSubscriptionRequest.PaymentMethod googlePayMethod = new CreateSubscriptionRequest.PaymentMethod();
            googlePayMethod.setType("GOOGLE_PAY");
            googlePayMethod.setGooglePayToken("google_pay_token_123");

            validCreateRequest.setPaymentMethod(googlePayMethod);

            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }

        @Test
        @DisplayName("Should accept idempotency key for duplicate request prevention")
        void payment_IdempotencyKey_Success() throws Exception {
            String idempotencyKey = UUID.randomUUID().toString();
            validCreateRequest.setIdempotencyKey(idempotencyKey);

            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenReturn(sampleSubscriptionResponse);

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isCreated());

            verify(subscriptionService).createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class));
        }
    }

    // ========================================================================
    // NOT FOUND SCENARIOS
    // ========================================================================

    @Nested
    @DisplayName("Not Found Scenarios")
    class NotFoundScenarios {

        @Test
        @DisplayName("Should return 404 when getting subscription that doesn't exist")
        void notFound_GetSubscription_ReturnsNotFound() throws Exception {
            when(subscriptionService.getUserSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performGetWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when updating subscription that doesn't exist")
        void notFound_UpdateSubscription_ReturnsNotFound() throws Exception {
            when(subscriptionService.updateSubscription(eq(testUserId), any(UpdateSubscriptionRequest.class)))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPatchWithAuth("/api/v1/subscriptions/me", validUpdateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when reactivating subscription that doesn't exist")
        void notFound_ReactivateSubscription_ReturnsNotFound() throws Exception {
            when(subscriptionService.reactivateSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPostWithAuth("/api/v1/subscriptions/me/reactivate", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when renewing subscription that doesn't exist")
        void notFound_RenewSubscription_ReturnsNotFound() throws Exception {
            when(subscriptionService.renewSubscription(testUserId))
                    .thenThrow(new ResourceNotFoundException("No subscription found"));

            performPostWithAuth("/api/v1/subscriptions/me/renew", null, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when canceling subscription that doesn't exist")
        void notFound_CancelSubscription_ReturnsNotFound() throws Exception {
            doThrow(new ResourceNotFoundException("No subscription found"))
                    .when(subscriptionService).cancelSubscription(testUserId);

            performDeleteWithAuth("/api/v1/subscriptions/me", testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when plan not found during creation")
        void notFound_CreateSubscription_PlanNotFound() throws Exception {
            when(subscriptionService.createSubscription(eq(testUserId), any(CreateSubscriptionRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Subscription plan not found"));

            performPostWithAuth("/api/v1/subscriptions", validCreateRequest, testUserId, "ROLE_SCOUT")
                    .andExpect(status().isNotFound());
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private User createMockUser(UUID userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setEmail("test@campcard.org");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(User.UserRole.valueOf(role.replace("ROLE_", "")));
        return user;
    }

    private UsernamePasswordAuthenticationToken createAuthentication(UUID userId, String role) {
        User user = createMockUser(userId, role);
        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
    }

    private ResultActions performPostWithAuth(String url, Object content, UUID userId, String role) throws Exception {
        var requestBuilder = post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .with(authentication(createAuthentication(userId, role)))
                .with(csrf());

        if (content != null) {
            requestBuilder.content(objectMapper.writeValueAsString(content));
        }

        return mockMvc.perform(requestBuilder);
    }

    private ResultActions performGetWithAuth(String url, UUID userId, String role) throws Exception {
        return mockMvc.perform(get(url)
                .contentType(MediaType.APPLICATION_JSON)
                .with(authentication(createAuthentication(userId, role))));
    }

    private ResultActions performPatchWithAuth(String url, Object content, UUID userId, String role) throws Exception {
        return mockMvc.perform(patch(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .with(authentication(createAuthentication(userId, role)))
                .with(csrf()));
    }

    private ResultActions performDeleteWithAuth(String url, UUID userId, String role) throws Exception {
        return mockMvc.perform(delete(url)
                .contentType(MediaType.APPLICATION_JSON)
                .with(authentication(createAuthentication(userId, role)))
                .with(csrf()));
    }
}
