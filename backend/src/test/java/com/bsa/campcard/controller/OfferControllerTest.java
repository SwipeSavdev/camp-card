package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.service.OfferService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive unit tests for OfferController REST API endpoints.
 *
 * Uses @WebMvcTest for lightweight controller testing with MockMvc.
 * Security is tested using @WithMockUser for different roles.
 * OfferService is mocked using @MockBean.
 */
@WebMvcTest(OfferController.class)
@DisplayName("OfferController Tests")
class OfferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OfferService offerService;

    private static final String BASE_URL = "/api/v1/offers";
    private static final MediaType JSON = MediaType.APPLICATION_JSON;

    // Test data
    private CreateOfferRequest validCreateRequest;
    private OfferResponse sampleOfferResponse;
    private RedeemOfferRequest validRedeemRequest;
    private OfferRedemptionResponse sampleRedemptionResponse;
    private UUID testUserId;
    private Long testOfferId;
    private Long testMerchantId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testOfferId = 1L;
        testMerchantId = 100L;

        // Setup valid create request
        validCreateRequest = new CreateOfferRequest();
        validCreateRequest.setMerchantId(testMerchantId);
        validCreateRequest.setTitle("10% Off All Items");
        validCreateRequest.setDescription("Get 10% off your entire purchase");
        validCreateRequest.setDiscountType("PERCENTAGE");
        validCreateRequest.setDiscountValue(new BigDecimal("10.00"));
        validCreateRequest.setMinPurchaseAmount(new BigDecimal("20.00"));
        validCreateRequest.setMaxDiscountAmount(new BigDecimal("50.00"));
        validCreateRequest.setCategory("RETAIL");
        validCreateRequest.setTerms("Valid for Camp Card holders only");
        validCreateRequest.setImageUrl("https://example.com/offer.jpg");
        validCreateRequest.setValidFrom(LocalDateTime.now());
        validCreateRequest.setValidUntil(LocalDateTime.now().plusMonths(3));
        validCreateRequest.setUsageLimit(1000);
        validCreateRequest.setUsageLimitPerUser(5);
        validCreateRequest.setFeatured(false);
        validCreateRequest.setScoutExclusive(true);
        validCreateRequest.setRequiresQrVerification(true);
        validCreateRequest.setLocationSpecific(false);

        // Setup sample offer response
        sampleOfferResponse = new OfferResponse();
        sampleOfferResponse.setId(testOfferId);
        sampleOfferResponse.setUuid(UUID.randomUUID());
        sampleOfferResponse.setMerchantId(testMerchantId);
        sampleOfferResponse.setMerchantName("Test Merchant");
        sampleOfferResponse.setMerchantLogoUrl("https://example.com/logo.png");
        sampleOfferResponse.setTitle("10% Off All Items");
        sampleOfferResponse.setDescription("Get 10% off your entire purchase");
        sampleOfferResponse.setDiscountType("PERCENTAGE");
        sampleOfferResponse.setDiscountValue(new BigDecimal("10.00"));
        sampleOfferResponse.setMinPurchaseAmount(new BigDecimal("20.00"));
        sampleOfferResponse.setMaxDiscountAmount(new BigDecimal("50.00"));
        sampleOfferResponse.setCategory("RETAIL");
        sampleOfferResponse.setTerms("Valid for Camp Card holders only");
        sampleOfferResponse.setImageUrl("https://example.com/offer.jpg");
        sampleOfferResponse.setStatus("ACTIVE");
        sampleOfferResponse.setValidFrom(LocalDateTime.now());
        sampleOfferResponse.setValidUntil(LocalDateTime.now().plusMonths(3));
        sampleOfferResponse.setUsageLimit(1000);
        sampleOfferResponse.setUsageLimitPerUser(5);
        sampleOfferResponse.setTotalRedemptions(50);
        sampleOfferResponse.setFeatured(false);
        sampleOfferResponse.setScoutExclusive(true);
        sampleOfferResponse.setRequiresQrVerification(true);
        sampleOfferResponse.setLocationSpecific(false);
        sampleOfferResponse.setCreatedAt(LocalDateTime.now());
        sampleOfferResponse.setIsValid(true);
        sampleOfferResponse.setRemainingRedemptions(950);

        // Setup valid redeem request
        validRedeemRequest = new RedeemOfferRequest();
        validRedeemRequest.setOfferId(testOfferId);
        validRedeemRequest.setUserId(testUserId);
        validRedeemRequest.setMerchantLocationId(1L);
        validRedeemRequest.setPurchaseAmount(new BigDecimal("100.00"));
        validRedeemRequest.setRedemptionMethod("show_to_cashier");
        validRedeemRequest.setNotes("Test redemption");

        // Setup sample redemption response
        sampleRedemptionResponse = new OfferRedemptionResponse();
        sampleRedemptionResponse.setId(1L);
        sampleRedemptionResponse.setUuid(UUID.randomUUID());
        sampleRedemptionResponse.setOfferId(testOfferId);
        sampleRedemptionResponse.setOfferTitle("10% Off All Items");
        sampleRedemptionResponse.setUserId(testUserId);
        sampleRedemptionResponse.setUserName("Test User");
        sampleRedemptionResponse.setMerchantId(testMerchantId);
        sampleRedemptionResponse.setMerchantName("Test Merchant");
        sampleRedemptionResponse.setMerchantLocationId(1L);
        sampleRedemptionResponse.setLocationName("Main Store");
        sampleRedemptionResponse.setPurchaseAmount(new BigDecimal("100.00"));
        sampleRedemptionResponse.setDiscountAmount(new BigDecimal("10.00"));
        sampleRedemptionResponse.setFinalAmount(new BigDecimal("90.00"));
        sampleRedemptionResponse.setVerificationCode("ABC12345");
        sampleRedemptionResponse.setStatus("PENDING");
        sampleRedemptionResponse.setRedeemedAt(LocalDateTime.now());
        sampleRedemptionResponse.setCreatedAt(LocalDateTime.now());
    }

    // ==================== CREATE OFFER TESTS ====================

    @Nested
    @DisplayName("POST /api/v1/offers - Create Offer")
    class CreateOfferTests {

        @Test
        @DisplayName("Should create offer successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldCreateOfferAsNationalAdmin() throws Exception {
            when(offerService.createOffer(any(CreateOfferRequest.class)))
                    .thenReturn(sampleOfferResponse);

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").value(testOfferId))
                    .andExpect(jsonPath("$.title").value("10% Off All Items"))
                    .andExpect(jsonPath("$.discountType").value("PERCENTAGE"))
                    .andExpect(jsonPath("$.discountValue").value(10.00))
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(offerService, times(1)).createOffer(any(CreateOfferRequest.class));
        }

        @Test
        @DisplayName("Should create offer successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldCreateOfferAsCouncilAdmin() throws Exception {
            when(offerService.createOffer(any(CreateOfferRequest.class)))
                    .thenReturn(sampleOfferResponse);

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testOfferId));

            verify(offerService, times(1)).createOffer(any(CreateOfferRequest.class));
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to create offer")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyCreateForScout() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).createOffer(any());
        }

        @Test
        @DisplayName("Should return 403 when PARENT tries to create offer")
        @WithMockUser(roles = "PARENT")
        void shouldDenyCreateForParent() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).createOffer(any());
        }

        @Test
        @DisplayName("Should return 403 when TROOP_LEADER tries to create offer")
        @WithMockUser(roles = "TROOP_LEADER")
        void shouldDenyCreateForTroopLeader() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).createOffer(any());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldRequireAuthentication() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ==================== UPDATE OFFER TESTS ====================

    @Nested
    @DisplayName("PUT /api/v1/offers/{id} - Update Offer")
    class UpdateOfferTests {

        @Test
        @DisplayName("Should update offer successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldUpdateOfferAsNationalAdmin() throws Exception {
            validCreateRequest.setTitle("Updated Offer Title");
            sampleOfferResponse.setTitle("Updated Offer Title");

            when(offerService.updateOffer(eq(testOfferId), any(CreateOfferRequest.class)))
                    .thenReturn(sampleOfferResponse);

            mockMvc.perform(put(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(testOfferId))
                    .andExpect(jsonPath("$.title").value("Updated Offer Title"));

            verify(offerService, times(1)).updateOffer(eq(testOfferId), any(CreateOfferRequest.class));
        }

        @Test
        @DisplayName("Should update offer successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldUpdateOfferAsCouncilAdmin() throws Exception {
            when(offerService.updateOffer(eq(testOfferId), any(CreateOfferRequest.class)))
                    .thenReturn(sampleOfferResponse);

            mockMvc.perform(put(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).updateOffer(eq(testOfferId), any(CreateOfferRequest.class));
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to update offer")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyUpdateForScout() throws Exception {
            mockMvc.perform(put(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).updateOffer(any(), any());
        }

        @Test
        @DisplayName("Should return 404 when offer not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturn404WhenOfferNotFound() throws Exception {
            Long nonExistentId = 9999L;
            when(offerService.updateOffer(eq(nonExistentId), any(CreateOfferRequest.class)))
                    .thenThrow(new IllegalArgumentException("Offer not found"));

            mockMvc.perform(put(BASE_URL + "/" + nonExistentId)
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validCreateRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET OFFER TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/{id} - Get Single Offer")
    class GetOfferTests {

        @Test
        @DisplayName("Should get offer by ID for authenticated user")
        @WithMockUser(roles = "SCOUT")
        void shouldGetOfferById() throws Exception {
            when(offerService.getOffer(testOfferId)).thenReturn(sampleOfferResponse);

            mockMvc.perform(get(BASE_URL + "/" + testOfferId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").value(testOfferId))
                    .andExpect(jsonPath("$.title").value("10% Off All Items"))
                    .andExpect(jsonPath("$.merchantName").value("Test Merchant"))
                    .andExpect(jsonPath("$.discountType").value("PERCENTAGE"))
                    .andExpect(jsonPath("$.discountValue").value(10.00))
                    .andExpect(jsonPath("$.isValid").value(true));

            verify(offerService, times(1)).getOffer(testOfferId);
        }

        @Test
        @DisplayName("Should return offer details with merchant info")
        @WithMockUser(roles = "PARENT")
        void shouldReturnOfferWithMerchantInfo() throws Exception {
            when(offerService.getOffer(testOfferId)).thenReturn(sampleOfferResponse);

            mockMvc.perform(get(BASE_URL + "/" + testOfferId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.merchantId").value(testMerchantId))
                    .andExpect(jsonPath("$.merchantName").value("Test Merchant"))
                    .andExpect(jsonPath("$.merchantLogoUrl").value("https://example.com/logo.png"));
        }

        @Test
        @DisplayName("Should return 400 when offer not found")
        @WithMockUser(roles = "SCOUT")
        void shouldReturn400WhenOfferNotFound() throws Exception {
            Long nonExistentId = 9999L;
            when(offerService.getOffer(nonExistentId))
                    .thenThrow(new IllegalArgumentException("Offer not found"));

            mockMvc.perform(get(BASE_URL + "/" + nonExistentId)
                            .contentType(JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET OFFERS (LIST WITH FILTERS) TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers - Get Offers with Filters")
    class GetOffersTests {

        @Test
        @DisplayName("Should get paginated offers with default parameters")
        @WithMockUser(roles = "SCOUT")
        void shouldGetPaginatedOffersWithDefaults() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")),
                    1
            );
            when(offerService.getActiveOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].id").value(testOfferId))
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.pageable").exists());
        }

        @Test
        @DisplayName("Should filter offers by merchantId")
        @WithMockUser(roles = "SCOUT")
        void shouldFilterByMerchantId() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getMerchantOffers(eq(testMerchantId), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .param("merchantId", testMerchantId.toString())
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].merchantId").value(testMerchantId));

            verify(offerService, times(1)).getMerchantOffers(eq(testMerchantId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter offers by category")
        @WithMockUser(roles = "SCOUT")
        void shouldFilterByCategory() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getOffersByCategory(eq("RETAIL"), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .param("category", "RETAIL")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].category").value("RETAIL"));

            verify(offerService, times(1)).getOffersByCategory(eq("RETAIL"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search offers by keyword")
        @WithMockUser(roles = "SCOUT")
        void shouldSearchOffersByKeyword() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.searchOffers(eq("discount"), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .param("search", "discount")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));

            verify(offerService, times(1)).searchOffers(eq("discount"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter featured offers")
        @WithMockUser(roles = "SCOUT")
        void shouldFilterFeaturedOffers() throws Exception {
            sampleOfferResponse.setFeatured(true);
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getFeaturedOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .param("featured", "true")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].featured").value(true));

            verify(offerService, times(1)).getFeaturedOffers(any(Pageable.class));
        }

        @Test
        @DisplayName("Should handle custom pagination parameters")
        @WithMockUser(roles = "SCOUT")
        void shouldHandleCustomPagination() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(1, 10, Sort.by(Sort.Direction.ASC, "title")),
                    15
            );
            when(offerService.getActiveOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL)
                            .param("page", "1")
                            .param("size", "10")
                            .param("sortBy", "title")
                            .param("sortDir", "ASC")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements").value(15))
                    .andExpect(jsonPath("$.pageable.pageNumber").value(1))
                    .andExpect(jsonPath("$.pageable.pageSize").value(10));
        }

        @Test
        @DisplayName("Should return empty page when no offers match")
        @WithMockUser(roles = "SCOUT")
        void shouldReturnEmptyPageWhenNoOffersMatch() throws Exception {
            Page<OfferResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(offerService.getActiveOffers(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get(BASE_URL)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    // ==================== GET ACTIVE OFFERS TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/active - Get Active Offers")
    class GetActiveOffersTests {

        @Test
        @DisplayName("Should get active offers with default pagination")
        @WithMockUser(roles = "SCOUT")
        void shouldGetActiveOffers() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getActiveOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/active")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));

            verify(offerService, times(1)).getActiveOffers(any(Pageable.class));
        }

        @Test
        @DisplayName("Should get active offers with custom pagination")
        @WithMockUser(roles = "SCOUT")
        void shouldGetActiveOffersWithCustomPagination() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(2, 5),
                    20
            );
            when(offerService.getActiveOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/active")
                            .param("page", "2")
                            .param("size", "5")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.pageable.pageNumber").value(2))
                    .andExpect(jsonPath("$.pageable.pageSize").value(5));
        }
    }

    // ==================== GET ACTIVE OFFERS FOR USER TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/active/user/{userId} - Get Active Offers for User")
    class GetActiveOffersForUserTests {

        @Test
        @DisplayName("Should get active offers for specific user")
        @WithMockUser(roles = "SCOUT")
        void shouldGetActiveOffersForUser() throws Exception {
            sampleOfferResponse.setUserRedemptionCount(2);
            sampleOfferResponse.setUserHasReachedLimit(false);

            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getActiveOffersForUser(eq(testUserId), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/active/user/" + testUserId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].userRedemptionCount").value(2))
                    .andExpect(jsonPath("$.content[0].userHasReachedLimit").value(false));

            verify(offerService, times(1)).getActiveOffersForUser(eq(testUserId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should show user has reached limit when applicable")
        @WithMockUser(roles = "SCOUT")
        void shouldShowUserReachedLimit() throws Exception {
            sampleOfferResponse.setUserRedemptionCount(5);
            sampleOfferResponse.setUserHasReachedLimit(true);

            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getActiveOffersForUser(eq(testUserId), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/active/user/" + testUserId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].userHasReachedLimit").value(true));
        }
    }

    // ==================== GET FEATURED OFFERS TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/featured - Get Featured Offers")
    class GetFeaturedOffersTests {

        @Test
        @DisplayName("Should get featured offers")
        @WithMockUser(roles = "SCOUT")
        void shouldGetFeaturedOffers() throws Exception {
            sampleOfferResponse.setFeatured(true);
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 10),
                    1
            );
            when(offerService.getFeaturedOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/featured")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].featured").value(true));

            verify(offerService, times(1)).getFeaturedOffers(any(Pageable.class));
        }

        @Test
        @DisplayName("Should use default page size of 10 for featured offers")
        @WithMockUser(roles = "SCOUT")
        void shouldUseDefaultPageSizeForFeatured() throws Exception {
            sampleOfferResponse.setFeatured(true);
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 10),
                    1
            );
            when(offerService.getFeaturedOffers(any(Pageable.class))).thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/featured")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.pageable.pageSize").value(10));
        }
    }

    // ==================== GET OFFERS BY CATEGORY TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/category/{category} - Get Offers by Category")
    class GetOffersByCategoryTests {

        @Test
        @DisplayName("Should get offers by category")
        @WithMockUser(roles = "SCOUT")
        void shouldGetOffersByCategory() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getOffersByCategory(eq("RETAIL"), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/category/RETAIL")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].category").value("RETAIL"));

            verify(offerService, times(1)).getOffersByCategory(eq("RETAIL"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty list for category with no offers")
        @WithMockUser(roles = "SCOUT")
        void shouldReturnEmptyForUnknownCategory() throws Exception {
            Page<OfferResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(offerService.getOffersByCategory(eq("UNKNOWN"), any(Pageable.class)))
                    .thenReturn(emptyPage);

            mockMvc.perform(get(BASE_URL + "/category/UNKNOWN")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // ==================== GET MERCHANT OFFERS TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/merchant/{merchantId} - Get Merchant Offers")
    class GetMerchantOffersTests {

        @Test
        @DisplayName("Should get offers for specific merchant")
        @WithMockUser(roles = "SCOUT")
        void shouldGetMerchantOffers() throws Exception {
            Page<OfferResponse> offerPage = new PageImpl<>(
                    List.of(sampleOfferResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getMerchantOffers(eq(testMerchantId), any(Pageable.class)))
                    .thenReturn(offerPage);

            mockMvc.perform(get(BASE_URL + "/merchant/" + testMerchantId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].merchantId").value(testMerchantId));

            verify(offerService, times(1)).getMerchantOffers(eq(testMerchantId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty list for merchant with no offers")
        @WithMockUser(roles = "SCOUT")
        void shouldReturnEmptyForMerchantWithNoOffers() throws Exception {
            Long merchantWithNoOffers = 999L;
            Page<OfferResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(offerService.getMerchantOffers(eq(merchantWithNoOffers), any(Pageable.class)))
                    .thenReturn(emptyPage);

            mockMvc.perform(get(BASE_URL + "/merchant/" + merchantWithNoOffers)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    // ==================== PAUSE OFFER TESTS ====================

    @Nested
    @DisplayName("POST /api/v1/offers/{id}/pause - Pause Offer")
    class PauseOfferTests {

        @Test
        @DisplayName("Should pause offer successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldPauseOfferAsNationalAdmin() throws Exception {
            doNothing().when(offerService).pauseOffer(testOfferId);

            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/pause")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).pauseOffer(testOfferId);
        }

        @Test
        @DisplayName("Should pause offer successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldPauseOfferAsCouncilAdmin() throws Exception {
            doNothing().when(offerService).pauseOffer(testOfferId);

            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/pause")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).pauseOffer(testOfferId);
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to pause offer")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyPauseForScout() throws Exception {
            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/pause")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).pauseOffer(any());
        }

        @Test
        @DisplayName("Should return 400 when pausing non-existent offer")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturn400WhenPausingNonExistentOffer() throws Exception {
            Long nonExistentId = 9999L;
            doThrow(new IllegalArgumentException("Offer not found"))
                    .when(offerService).pauseOffer(nonExistentId);

            mockMvc.perform(post(BASE_URL + "/" + nonExistentId + "/pause")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== RESUME OFFER TESTS ====================

    @Nested
    @DisplayName("POST /api/v1/offers/{id}/resume - Resume Offer")
    class ResumeOfferTests {

        @Test
        @DisplayName("Should resume offer successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldResumeOfferAsNationalAdmin() throws Exception {
            doNothing().when(offerService).resumeOffer(testOfferId);

            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/resume")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).resumeOffer(testOfferId);
        }

        @Test
        @DisplayName("Should resume offer successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldResumeOfferAsCouncilAdmin() throws Exception {
            doNothing().when(offerService).resumeOffer(testOfferId);

            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/resume")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).resumeOffer(testOfferId);
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to resume offer")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyResumeForScout() throws Exception {
            mockMvc.perform(post(BASE_URL + "/" + testOfferId + "/resume")
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).resumeOffer(any());
        }
    }

    // ==================== DELETE OFFER TESTS ====================

    @Nested
    @DisplayName("DELETE /api/v1/offers/{id} - Delete Offer")
    class DeleteOfferTests {

        @Test
        @DisplayName("Should delete offer successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldDeleteOfferAsNationalAdmin() throws Exception {
            doNothing().when(offerService).deleteOffer(testOfferId);

            mockMvc.perform(delete(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).deleteOffer(testOfferId);
        }

        @Test
        @DisplayName("Should delete offer successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldDeleteOfferAsCouncilAdmin() throws Exception {
            doNothing().when(offerService).deleteOffer(testOfferId);

            mockMvc.perform(delete(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).deleteOffer(testOfferId);
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to delete offer")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyDeleteForScout() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).deleteOffer(any());
        }

        @Test
        @DisplayName("Should return 403 when TROOP_LEADER tries to delete offer")
        @WithMockUser(roles = "TROOP_LEADER")
        void shouldDenyDeleteForTroopLeader() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/" + testOfferId)
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).deleteOffer(any());
        }

        @Test
        @DisplayName("Should return 400 when deleting non-existent offer")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturn400WhenDeletingNonExistentOffer() throws Exception {
            Long nonExistentId = 9999L;
            doThrow(new IllegalArgumentException("Offer not found"))
                    .when(offerService).deleteOffer(nonExistentId);

            mockMvc.perform(delete(BASE_URL + "/" + nonExistentId)
                            .with(csrf())
                            .contentType(JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== REDEEM OFFER TESTS ====================

    @Nested
    @DisplayName("POST /api/v1/offers/redeem - Redeem Offer")
    class RedeemOfferTests {

        @Test
        @DisplayName("Should redeem offer successfully")
        @WithMockUser(roles = "SCOUT")
        void shouldRedeemOfferSuccessfully() throws Exception {
            when(offerService.redeemOffer(any(RedeemOfferRequest.class)))
                    .thenReturn(sampleRedemptionResponse);

            mockMvc.perform(post(BASE_URL + "/redeem")
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validRedeemRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.offerId").value(testOfferId))
                    .andExpect(jsonPath("$.userId").value(testUserId.toString()))
                    .andExpect(jsonPath("$.verificationCode").value("ABC12345"))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.discountAmount").value(10.00))
                    .andExpect(jsonPath("$.finalAmount").value(90.00));

            verify(offerService, times(1)).redeemOffer(any(RedeemOfferRequest.class));
        }

        @Test
        @DisplayName("Should allow PARENT to redeem offer")
        @WithMockUser(roles = "PARENT")
        void shouldAllowParentToRedeem() throws Exception {
            when(offerService.redeemOffer(any(RedeemOfferRequest.class)))
                    .thenReturn(sampleRedemptionResponse);

            mockMvc.perform(post(BASE_URL + "/redeem")
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validRedeemRequest)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 400 when offer not found")
        @WithMockUser(roles = "SCOUT")
        void shouldReturn400WhenOfferNotFound() throws Exception {
            when(offerService.redeemOffer(any(RedeemOfferRequest.class)))
                    .thenThrow(new IllegalArgumentException("Offer not found"));

            mockMvc.perform(post(BASE_URL + "/redeem")
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validRedeemRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when offer is invalid or expired")
        @WithMockUser(roles = "SCOUT")
        void shouldReturn400WhenOfferInvalidOrExpired() throws Exception {
            when(offerService.redeemOffer(any(RedeemOfferRequest.class)))
                    .thenThrow(new IllegalStateException("Offer is not valid or has expired"));

            mockMvc.perform(post(BASE_URL + "/redeem")
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validRedeemRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when user reached redemption limit")
        @WithMockUser(roles = "SCOUT")
        void shouldReturn400WhenRedemptionLimitReached() throws Exception {
            when(offerService.redeemOffer(any(RedeemOfferRequest.class)))
                    .thenThrow(new IllegalStateException("User has reached redemption limit for this offer"));

            mockMvc.perform(post(BASE_URL + "/redeem")
                            .with(csrf())
                            .contentType(JSON)
                            .content(objectMapper.writeValueAsString(validRedeemRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== VERIFY REDEMPTION TESTS ====================

    @Nested
    @DisplayName("POST /api/v1/offers/verify/{verificationCode} - Verify Redemption")
    class VerifyRedemptionTests {

        private final String verificationCode = "ABC12345";

        @Test
        @DisplayName("Should verify redemption successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldVerifyRedemptionAsNationalAdmin() throws Exception {
            UUID verifierId = UUID.randomUUID();
            sampleRedemptionResponse.setStatus("COMPLETED");
            sampleRedemptionResponse.setVerifiedAt(LocalDateTime.now());

            when(offerService.verifyRedemption(eq(verificationCode), eq(verifierId)))
                    .thenReturn(sampleRedemptionResponse);

            mockMvc.perform(post(BASE_URL + "/verify/" + verificationCode)
                            .with(csrf())
                            .param("verifierId", verifierId.toString())
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("COMPLETED"))
                    .andExpect(jsonPath("$.verifiedAt").exists());

            verify(offerService, times(1)).verifyRedemption(eq(verificationCode), eq(verifierId));
        }

        @Test
        @DisplayName("Should verify redemption successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldVerifyRedemptionAsCouncilAdmin() throws Exception {
            UUID verifierId = UUID.randomUUID();
            sampleRedemptionResponse.setStatus("COMPLETED");

            when(offerService.verifyRedemption(eq(verificationCode), eq(verifierId)))
                    .thenReturn(sampleRedemptionResponse);

            mockMvc.perform(post(BASE_URL + "/verify/" + verificationCode)
                            .with(csrf())
                            .param("verifierId", verifierId.toString())
                            .contentType(JSON))
                    .andExpect(status().isOk());

            verify(offerService, times(1)).verifyRedemption(eq(verificationCode), eq(verifierId));
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to verify")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyVerifyForScout() throws Exception {
            UUID verifierId = UUID.randomUUID();

            mockMvc.perform(post(BASE_URL + "/verify/" + verificationCode)
                            .with(csrf())
                            .param("verifierId", verifierId.toString())
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).verifyRedemption(any(), any());
        }

        @Test
        @DisplayName("Should return 400 for invalid verification code")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturn400ForInvalidVerificationCode() throws Exception {
            UUID verifierId = UUID.randomUUID();
            String invalidCode = "INVALID123";

            when(offerService.verifyRedemption(eq(invalidCode), eq(verifierId)))
                    .thenThrow(new IllegalArgumentException("Invalid verification code"));

            mockMvc.perform(post(BASE_URL + "/verify/" + invalidCode)
                            .with(csrf())
                            .param("verifierId", verifierId.toString())
                            .contentType(JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when redemption already processed")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturn400WhenRedemptionAlreadyProcessed() throws Exception {
            UUID verifierId = UUID.randomUUID();

            when(offerService.verifyRedemption(eq(verificationCode), eq(verifierId)))
                    .thenThrow(new IllegalStateException("Redemption has already been processed"));

            mockMvc.perform(post(BASE_URL + "/verify/" + verificationCode)
                            .with(csrf())
                            .param("verifierId", verifierId.toString())
                            .contentType(JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== GET USER REDEMPTIONS TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/redemptions/user/{userId} - Get User Redemptions")
    class GetUserRedemptionsTests {

        @Test
        @DisplayName("Should get user redemptions successfully")
        @WithMockUser(roles = "SCOUT")
        void shouldGetUserRedemptions() throws Exception {
            Page<OfferRedemptionResponse> redemptionPage = new PageImpl<>(
                    List.of(sampleRedemptionResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getUserRedemptions(eq(testUserId), any(Pageable.class)))
                    .thenReturn(redemptionPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/user/" + testUserId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].userId").value(testUserId.toString()))
                    .andExpect(jsonPath("$.content[0].offerId").value(testOfferId))
                    .andExpect(jsonPath("$.content[0].verificationCode").value("ABC12345"));

            verify(offerService, times(1)).getUserRedemptions(eq(testUserId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should get user redemptions with pagination")
        @WithMockUser(roles = "SCOUT")
        void shouldGetUserRedemptionsWithPagination() throws Exception {
            Page<OfferRedemptionResponse> redemptionPage = new PageImpl<>(
                    List.of(sampleRedemptionResponse),
                    PageRequest.of(1, 5),
                    10
            );
            when(offerService.getUserRedemptions(eq(testUserId), any(Pageable.class)))
                    .thenReturn(redemptionPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/user/" + testUserId)
                            .param("page", "1")
                            .param("size", "5")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.pageable.pageNumber").value(1))
                    .andExpect(jsonPath("$.pageable.pageSize").value(5))
                    .andExpect(jsonPath("$.totalElements").value(10));
        }

        @Test
        @DisplayName("Should return empty list when user has no redemptions")
        @WithMockUser(roles = "SCOUT")
        void shouldReturnEmptyListWhenNoRedemptions() throws Exception {
            UUID userWithNoRedemptions = UUID.randomUUID();
            Page<OfferRedemptionResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(offerService.getUserRedemptions(eq(userWithNoRedemptions), any(Pageable.class)))
                    .thenReturn(emptyPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/user/" + userWithNoRedemptions)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }

    // ==================== GET MERCHANT REDEMPTIONS TESTS ====================

    @Nested
    @DisplayName("GET /api/v1/offers/redemptions/merchant/{merchantId} - Get Merchant Redemptions")
    class GetMerchantRedemptionsTests {

        @Test
        @DisplayName("Should get merchant redemptions as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldGetMerchantRedemptionsAsNationalAdmin() throws Exception {
            Page<OfferRedemptionResponse> redemptionPage = new PageImpl<>(
                    List.of(sampleRedemptionResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getMerchantRedemptions(eq(testMerchantId), any(Pageable.class)))
                    .thenReturn(redemptionPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + testMerchantId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].merchantId").value(testMerchantId));

            verify(offerService, times(1)).getMerchantRedemptions(eq(testMerchantId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should get merchant redemptions as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void shouldGetMerchantRedemptionsAsCouncilAdmin() throws Exception {
            Page<OfferRedemptionResponse> redemptionPage = new PageImpl<>(
                    List.of(sampleRedemptionResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(offerService.getMerchantRedemptions(eq(testMerchantId), any(Pageable.class)))
                    .thenReturn(redemptionPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + testMerchantId)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should return 403 when SCOUT tries to get merchant redemptions")
        @WithMockUser(roles = "SCOUT")
        void shouldDenyMerchantRedemptionsForScout() throws Exception {
            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + testMerchantId)
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).getMerchantRedemptions(any(), any());
        }

        @Test
        @DisplayName("Should return 403 when PARENT tries to get merchant redemptions")
        @WithMockUser(roles = "PARENT")
        void shouldDenyMerchantRedemptionsForParent() throws Exception {
            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + testMerchantId)
                            .contentType(JSON))
                    .andExpect(status().isForbidden());

            verify(offerService, never()).getMerchantRedemptions(any(), any());
        }

        @Test
        @DisplayName("Should get merchant redemptions with pagination")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldGetMerchantRedemptionsWithPagination() throws Exception {
            Page<OfferRedemptionResponse> redemptionPage = new PageImpl<>(
                    List.of(sampleRedemptionResponse),
                    PageRequest.of(2, 10),
                    50
            );
            when(offerService.getMerchantRedemptions(eq(testMerchantId), any(Pageable.class)))
                    .thenReturn(redemptionPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + testMerchantId)
                            .param("page", "2")
                            .param("size", "10")
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.pageable.pageNumber").value(2))
                    .andExpect(jsonPath("$.pageable.pageSize").value(10))
                    .andExpect(jsonPath("$.totalElements").value(50));
        }

        @Test
        @DisplayName("Should return empty list for merchant with no redemptions")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void shouldReturnEmptyForMerchantWithNoRedemptions() throws Exception {
            Long merchantWithNoRedemptions = 999L;
            Page<OfferRedemptionResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(offerService.getMerchantRedemptions(eq(merchantWithNoRedemptions), any(Pageable.class)))
                    .thenReturn(emptyPage);

            mockMvc.perform(get(BASE_URL + "/redemptions/merchant/" + merchantWithNoRedemptions)
                            .contentType(JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }
    }
}
