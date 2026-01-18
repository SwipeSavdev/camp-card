package com.bsa.campcard.controller;

import com.bsa.campcard.dto.merchant.*;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.security.JwtTokenProvider;
import com.bsa.campcard.service.MerchantService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bsa.campcard.config.JwtAuthenticationFilter;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.Import;

@Import(ControllerTestConfig.class)
@WebMvcTest(controllers = MerchantController.class)
@org.springframework.boot.autoconfigure.ImportAutoConfiguration({
    org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("MerchantController Tests")
class MerchantControllerTest {

    /**
     * Test exception handler to properly handle exceptions during testing.
     */
    @ControllerAdvice
    static class TestExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Validation failed"));
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required parameter: " + ex.getParameterName()));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }

        @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
        public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
                org.springframework.http.converter.HttpMessageNotReadableException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request body"));
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MerchantService merchantService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserRepository userRepository;

    private static final String BASE_URL = "/api/v1/merchants";

    private CreateMerchantRequest validMerchantRequest;
    private MerchantResponse merchantResponse;
    private CreateLocationRequest validLocationRequest;
    private MerchantLocationResponse locationResponse;
    private ApproveMerchantRequest approveRequest;
    private UUID testUuid;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();

        // Build valid merchant request using setters
        validMerchantRequest = createValidMerchantRequest();

        // Build merchant response using builder (response DTOs have @Builder)
        merchantResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "PENDING");

        // Build valid location request using setters
        validLocationRequest = createValidLocationRequest();

        // Build location response
        locationResponse = createLocationResponse(1L, UUID.randomUUID(), "Main Store");

        // Build approve request using setters
        approveRequest = createApproveRequest("APPROVE", null);
    }

    // ============================================
    // Helper Methods for Creating Test Objects
    // ============================================

    private CreateMerchantRequest createValidMerchantRequest() {
        CreateMerchantRequest request = new CreateMerchantRequest();
        request.setBusinessName("Test Restaurant");
        request.setDbaName("Test DBA");
        request.setDescription("A great test restaurant");
        request.setCategory("RESTAURANT");
        request.setTaxId("12-3456789");
        request.setContactName("John Doe");
        request.setContactEmail("john@testrestaurant.com");
        request.setContactPhone("555-123-4567");
        request.setWebsiteUrl("https://testrestaurant.com");
        request.setLogoUrl("https://testrestaurant.com/logo.png");
        request.setBusinessHours("Mon-Fri 9-5");
        request.setTermsAccepted(true);
        return request;
    }

    private CreateLocationRequest createValidLocationRequest() {
        CreateLocationRequest request = new CreateLocationRequest();
        request.setLocationName("Main Store");
        request.setStreetAddress("123 Main Street");
        request.setAddressLine2("Suite 100");
        request.setCity("Dallas");
        request.setState("TX");
        request.setZipCode("75001");
        request.setCountry("USA");
        request.setLatitude(BigDecimal.valueOf(32.7767));
        request.setLongitude(BigDecimal.valueOf(-96.7970));
        request.setPhone("555-987-6543");
        request.setHours("Mon-Fri 9-5");
        request.setPrimaryLocation(true);
        return request;
    }

    private MerchantResponse createMerchantResponse(Long id, UUID uuid, String businessName, String status) {
        return MerchantResponse.builder()
                .id(id)
                .uuid(uuid)
                .businessName(businessName)
                .dbaName("Test DBA")
                .description("A great test restaurant")
                .category("RESTAURANT")
                .contactName("John Doe")
                .contactEmail("john@testrestaurant.com")
                .contactPhone("555-123-4567")
                .websiteUrl("https://testrestaurant.com")
                .logoUrl("https://testrestaurant.com/logo.png")
                .status(status)
                .totalOffers(0)
                .activeOffers(0)
                .totalRedemptions(0)
                .locations(Collections.emptyList())
                .build();
    }

    private MerchantLocationResponse createLocationResponse(Long id, UUID uuid, String locationName) {
        return MerchantLocationResponse.builder()
                .id(id)
                .uuid(uuid)
                .locationName(locationName)
                .streetAddress("123 Main Street")
                .addressLine2("Suite 100")
                .city("Dallas")
                .state("TX")
                .zipCode("75001")
                .country("USA")
                .latitude(BigDecimal.valueOf(32.7767))
                .longitude(BigDecimal.valueOf(-96.7970))
                .phone("555-987-6543")
                .hours("Mon-Fri 9-5")
                .primaryLocation(true)
                .active(true)
                .build();
    }

    private ApproveMerchantRequest createApproveRequest(String action, String rejectionReason) {
        ApproveMerchantRequest request = new ApproveMerchantRequest();
        request.setAction(action);
        request.setRejectionReason(rejectionReason);
        return request;
    }

    // ============================================
    // CREATE MERCHANT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/merchants - Create Merchant")
    class CreateMerchantTests {

        @Test
        @DisplayName("Should create merchant successfully with valid request")
        @WithMockUser
        void createMerchant_ValidRequest_ReturnsCreated() throws Exception {
            // Arrange
            when(merchantService.createMerchant(any(CreateMerchantRequest.class), anyLong()))
                    .thenReturn(merchantResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.businessName").value("Test Restaurant"))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.contactEmail").value("john@testrestaurant.com"));

            verify(merchantService).createMerchant(any(CreateMerchantRequest.class), eq(1L));
        }

        @Test
        @DisplayName("Should return 400 when business name is missing")
        @WithMockUser
        void createMerchant_MissingBusinessName_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setBusinessName(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(merchantService, never()).createMerchant(any(), anyLong());
        }

        @Test
        @DisplayName("Should return 400 when business name is blank")
        @WithMockUser
        void createMerchant_BlankBusinessName_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setBusinessName("   ");

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when category is missing")
        @WithMockUser
        void createMerchant_MissingCategory_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setCategory(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when contact name is missing")
        @WithMockUser
        void createMerchant_MissingContactName_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setContactName(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when contact email is missing")
        @WithMockUser
        void createMerchant_MissingContactEmail_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setContactEmail(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when contact email is invalid format")
        @WithMockUser
        void createMerchant_InvalidEmailFormat_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setContactEmail("invalid-email");

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should create merchant with primary location")
        @WithMockUser
        void createMerchant_WithPrimaryLocation_ReturnsCreated() throws Exception {
            // Arrange
            validMerchantRequest.setPrimaryLocation(validLocationRequest);
            MerchantResponse responseWithLocation = createMerchantResponse(1L, testUuid, "Test Restaurant", "PENDING");
            responseWithLocation.setLocations(List.of(locationResponse));
            when(merchantService.createMerchant(any(CreateMerchantRequest.class), anyLong()))
                    .thenReturn(responseWithLocation);

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.locations", hasSize(1)));
        }
    }

    // ============================================
    // GET MERCHANTS (LIST) TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants - List Merchants")
    class GetMerchantsTests {

        @Test
        @DisplayName("Should return paginated merchants list")
        @WithMockUser
        void getMerchants_ValidRequest_ReturnsMerchants() throws Exception {
            // Arrange - use PageRequest to avoid UnsupportedOperationException on sort serialization
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    org.springframework.data.domain.PageRequest.of(0, 20),
                    1
            );
            when(merchantService.getMerchants(any(), any(), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].businessName").value("Test Restaurant"));
        }

        @Test
        @DisplayName("Should filter merchants by status")
        @WithMockUser
        void getMerchants_FilterByStatus_ReturnsMerchants() throws Exception {
            // Arrange - use PageRequest to avoid UnsupportedOperationException on sort serialization
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    org.springframework.data.domain.PageRequest.of(0, 20),
                    1
            );
            when(merchantService.getMerchants(eq(Merchant.MerchantStatus.PENDING), isNull(), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .param("status", "PENDING")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should search merchants by term")
        @WithMockUser
        void getMerchants_SearchTerm_ReturnsMerchants() throws Exception {
            // Arrange
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(merchantService.getMerchants(isNull(), eq("Restaurant"), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .param("search", "Restaurant")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should apply pagination parameters")
        @WithMockUser
        void getMerchants_WithPagination_ReturnsPagedResults() throws Exception {
            // Arrange
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    PageRequest.of(0, 10),
                    1
            );
            when(merchantService.getMerchants(any(), any(), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .param("page", "0")
                            .param("size", "10")
                            .param("sortBy", "businessName")
                            .param("direction", "ASC")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(merchantService).getMerchants(any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no merchants")
        @WithMockUser
        void getMerchants_NoMerchants_ReturnsEmptyPage() throws Exception {
            // Arrange
            Page<MerchantResponse> emptyPage = new PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(0, 20),
                    0
            );
            when(merchantService.getMerchants(any(), any(), any(Pageable.class)))
                    .thenReturn(emptyPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should use default pagination values")
        @WithMockUser
        void getMerchants_DefaultPagination_ReturnsResults() throws Exception {
            // Arrange
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(merchantService.getMerchants(any(), any(), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(merchantService).getMerchants(isNull(), isNull(), any(Pageable.class));
        }
    }

    // ============================================
    // GET MERCHANT BY ID TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants/{merchantId} - Get Merchant")
    class GetMerchantTests {

        @Test
        @DisplayName("Should return merchant by ID")
        @WithMockUser
        void getMerchant_ValidId_ReturnsMerchant() throws Exception {
            // Arrange
            when(merchantService.getMerchant(1L)).thenReturn(merchantResponse);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.businessName").value("Test Restaurant"));
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser
        void getMerchant_NotFound_ReturnsNotFound() throws Exception {
            // Arrange
            when(merchantService.getMerchant(999L))
                    .thenThrow(new ResourceNotFoundException("Merchant not found"));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return merchant with all fields populated")
        @WithMockUser
        void getMerchant_ValidId_ReturnsAllFields() throws Exception {
            // Arrange
            when(merchantService.getMerchant(1L)).thenReturn(merchantResponse);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.uuid").exists())
                    .andExpect(jsonPath("$.businessName").exists())
                    .andExpect(jsonPath("$.category").exists())
                    .andExpect(jsonPath("$.contactName").exists())
                    .andExpect(jsonPath("$.contactEmail").exists())
                    .andExpect(jsonPath("$.status").exists())
                    .andExpect(jsonPath("$.locations").isArray());
        }
    }

    // ============================================
    // GET MERCHANTS BY CATEGORY TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants/category/{category} - Get Merchants by Category")
    class GetMerchantsByCategoryTests {

        @Test
        @DisplayName("Should return merchants in category")
        @WithMockUser
        void getMerchantsByCategory_ValidCategory_ReturnsMerchants() throws Exception {
            // Arrange
            when(merchantService.getMerchantsByCategory("RESTAURANT"))
                    .thenReturn(List.of(merchantResponse));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/category/RESTAURANT")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].category").value("RESTAURANT"));
        }

        @Test
        @DisplayName("Should return empty list for non-existent category")
        @WithMockUser
        void getMerchantsByCategory_NoMerchants_ReturnsEmptyList() throws Exception {
            // Arrange
            when(merchantService.getMerchantsByCategory("NONEXISTENT"))
                    .thenReturn(Collections.emptyList());

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/category/NONEXISTENT")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should return multiple merchants in category")
        @WithMockUser
        void getMerchantsByCategory_MultipleMerchants_ReturnsAll() throws Exception {
            // Arrange
            MerchantResponse secondMerchant = createMerchantResponse(2L, UUID.randomUUID(), "Another Restaurant", "APPROVED");
            when(merchantService.getMerchantsByCategory("RESTAURANT"))
                    .thenReturn(List.of(merchantResponse, secondMerchant));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/category/RESTAURANT")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ============================================
    // UPDATE MERCHANT TESTS
    // ============================================

    @Nested
    @DisplayName("PUT /api/v1/merchants/{merchantId} - Update Merchant")
    class UpdateMerchantTests {

        @Test
        @DisplayName("Should update merchant successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchant_AsNationalAdmin_ReturnsUpdatedMerchant() throws Exception {
            // Arrange
            MerchantResponse updatedResponse = createMerchantResponse(1L, testUuid, "Updated Restaurant", "PENDING");
            when(merchantService.updateMerchant(eq(1L), any(CreateMerchantRequest.class)))
                    .thenReturn(updatedResponse);

            validMerchantRequest.setBusinessName("Updated Restaurant");

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.businessName").value("Updated Restaurant"));
        }

        @Test
        @DisplayName("Should update merchant successfully as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateMerchant_AsCouncilAdmin_ReturnsUpdatedMerchant() throws Exception {
            // Arrange
            when(merchantService.updateMerchant(eq(1L), any(CreateMerchantRequest.class)))
                    .thenReturn(merchantResponse);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchant_NotFound_ReturnsNotFound() throws Exception {
            // Arrange
            when(merchantService.updateMerchant(eq(999L), any(CreateMerchantRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Merchant not found"));

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/999")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 when request body is invalid")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchant_InvalidRequest_ReturnsBadRequest() throws Exception {
            // Arrange
            validMerchantRequest.setBusinessName(null);

            // Act & Assert
            mockMvc.perform(put(BASE_URL + "/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // APPROVE MERCHANT TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/merchants/{merchantId}/approve - Approve Merchant")
    class ApproveMerchantTests {

        @Test
        @DisplayName("Should approve merchant successfully as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_Approve_ReturnsApprovedMerchant() throws Exception {
            // Arrange
            MerchantResponse approvedResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "APPROVED");
            when(merchantService.approveMerchant(eq(1L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenReturn(approvedResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(approveRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("APPROVED"));
        }

        @Test
        @DisplayName("Should reject merchant with reason")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_Reject_ReturnsRejectedMerchant() throws Exception {
            // Arrange
            ApproveMerchantRequest rejectRequest = createApproveRequest("REJECT", "Incomplete documentation");
            MerchantResponse rejectedResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "REJECTED");
            when(merchantService.approveMerchant(eq(1L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenReturn(rejectedResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(rejectRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REJECTED"));
        }

        @Test
        @DisplayName("Should return 400 when action is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_MissingAction_ReturnsBadRequest() throws Exception {
            // Arrange
            ApproveMerchantRequest invalidRequest = new ApproveMerchantRequest();
            invalidRequest.setAction(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_NotFound_ReturnsNotFound() throws Exception {
            // Arrange
            when(merchantService.approveMerchant(eq(999L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenThrow(new ResourceNotFoundException("Merchant not found"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/999/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(approveRequest)))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 409 when merchant already processed")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_AlreadyProcessed_ReturnsConflict() throws Exception {
            // Arrange
            when(merchantService.approveMerchant(eq(1L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenThrow(new IllegalStateException("Merchant has already been processed"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(approveRequest)))
                    .andDo(print())
                    .andExpect(status().isConflict());
        }
    }

    // ============================================
    // UPDATE MERCHANT STATUS TESTS
    // ============================================

    @Nested
    @DisplayName("PATCH /api/v1/merchants/{merchantId}/status - Update Merchant Status")
    class UpdateMerchantStatusTests {

        @Test
        @DisplayName("Should suspend merchant as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchantStatus_Suspend_ReturnsSuspendedMerchant() throws Exception {
            // Arrange
            MerchantResponse suspendedResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "SUSPENDED");
            when(merchantService.updateMerchantStatus(1L, Merchant.MerchantStatus.SUSPENDED))
                    .thenReturn(suspendedResponse);

            // Act & Assert
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .with(csrf())
                            .param("status", "SUSPENDED")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUSPENDED"));
        }

        @Test
        @DisplayName("Should reactivate merchant as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchantStatus_Reactivate_ReturnsApprovedMerchant() throws Exception {
            // Arrange
            MerchantResponse approvedResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "APPROVED");
            when(merchantService.updateMerchantStatus(1L, Merchant.MerchantStatus.APPROVED))
                    .thenReturn(approvedResponse);

            // Act & Assert
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .with(csrf())
                            .param("status", "APPROVED")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("APPROVED"));
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchantStatus_NotFound_ReturnsNotFound() throws Exception {
            // Arrange
            when(merchantService.updateMerchantStatus(999L, Merchant.MerchantStatus.SUSPENDED))
                    .thenThrow(new ResourceNotFoundException("Merchant not found"));

            // Act & Assert
            mockMvc.perform(patch(BASE_URL + "/999/status")
                            .with(csrf())
                            .param("status", "SUSPENDED")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should handle case-insensitive status parameter")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchantStatus_LowercaseStatus_ReturnsOk() throws Exception {
            // Arrange
            MerchantResponse suspendedResponse = createMerchantResponse(1L, testUuid, "Test Restaurant", "SUSPENDED");
            when(merchantService.updateMerchantStatus(1L, Merchant.MerchantStatus.SUSPENDED))
                    .thenReturn(suspendedResponse);

            // Act & Assert
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .with(csrf())
                            .param("status", "suspended")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    // ============================================
    // DELETE MERCHANT TESTS
    // ============================================

    @Nested
    @DisplayName("DELETE /api/v1/merchants/{merchantId} - Delete Merchant")
    class DeleteMerchantTests {

        @Test
        @DisplayName("Should delete merchant as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteMerchant_AsNationalAdmin_ReturnsNoContent() throws Exception {
            // Arrange
            doNothing().when(merchantService).deleteMerchant(1L);

            // Act & Assert
            mockMvc.perform(delete(BASE_URL + "/1")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNoContent());

            verify(merchantService).deleteMerchant(1L);
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteMerchant_NotFound_ReturnsNotFound() throws Exception {
            // Arrange
            doThrow(new ResourceNotFoundException("Merchant not found"))
                    .when(merchantService).deleteMerchant(999L);

            // Act & Assert
            mockMvc.perform(delete(BASE_URL + "/999")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }
    }

    // ============================================
    // CREATE LOCATION TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/v1/merchants/{merchantId}/locations - Create Location")
    class CreateLocationTests {

        @Test
        @DisplayName("Should create location as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_AsNationalAdmin_ReturnsCreated() throws Exception {
            // Arrange
            when(merchantService.createLocation(eq(1L), any(CreateLocationRequest.class)))
                    .thenReturn(locationResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.locationName").value("Main Store"))
                    .andExpect(jsonPath("$.city").value("Dallas"));
        }

        @Test
        @DisplayName("Should create location as COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void createLocation_AsCouncilAdmin_ReturnsCreated() throws Exception {
            // Arrange
            when(merchantService.createLocation(eq(1L), any(CreateLocationRequest.class)))
                    .thenReturn(locationResponse);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Should return 400 when location name is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MissingLocationName_ReturnsBadRequest() throws Exception {
            // Arrange
            validLocationRequest.setLocationName(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when street address is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MissingStreetAddress_ReturnsBadRequest() throws Exception {
            // Arrange
            validLocationRequest.setStreetAddress(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when city is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MissingCity_ReturnsBadRequest() throws Exception {
            // Arrange
            validLocationRequest.setCity(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when state is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MissingState_ReturnsBadRequest() throws Exception {
            // Arrange
            validLocationRequest.setState(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when zip code is missing")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MissingZipCode_ReturnsBadRequest() throws Exception {
            // Arrange
            validLocationRequest.setZipCode(null);

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 when merchant not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createLocation_MerchantNotFound_ReturnsNotFound() throws Exception {
            // Arrange
            when(merchantService.createLocation(eq(999L), any(CreateLocationRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Merchant not found"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/999/locations")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validLocationRequest)))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }
    }

    // ============================================
    // GET MERCHANT LOCATIONS TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants/{merchantId}/locations - Get Merchant Locations")
    class GetMerchantLocationsTests {

        @Test
        @DisplayName("Should return merchant locations")
        @WithMockUser
        void getMerchantLocations_ValidMerchant_ReturnsLocations() throws Exception {
            // Arrange
            when(merchantService.getMerchantLocations(1L))
                    .thenReturn(List.of(locationResponse));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1/locations")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].locationName").value("Main Store"));
        }

        @Test
        @DisplayName("Should return empty list when no locations")
        @WithMockUser
        void getMerchantLocations_NoLocations_ReturnsEmptyList() throws Exception {
            // Arrange
            when(merchantService.getMerchantLocations(1L))
                    .thenReturn(Collections.emptyList());

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1/locations")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should return multiple locations")
        @WithMockUser
        void getMerchantLocations_MultipleLocations_ReturnsAll() throws Exception {
            // Arrange
            MerchantLocationResponse secondLocation = createLocationResponse(2L, UUID.randomUUID(), "Second Store");
            when(merchantService.getMerchantLocations(1L))
                    .thenReturn(List.of(locationResponse, secondLocation));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1/locations")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    // ============================================
    // FIND NEARBY LOCATIONS TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants/locations/nearby - Find Nearby Locations")
    class FindNearbyLocationsTests {

        @Test
        @DisplayName("Should find nearby locations")
        @WithMockUser
        void findNearbyLocations_ValidCoordinates_ReturnsLocations() throws Exception {
            // Arrange
            when(merchantService.findNearbyLocations(
                    any(BigDecimal.class), any(BigDecimal.class), anyDouble()))
                    .thenReturn(List.of(locationResponse));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/locations/nearby")
                            .param("latitude", "32.7767")
                            .param("longitude", "-96.7970")
                            .param("radiusKm", "10.0")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("Should use default radius when not provided")
        @WithMockUser
        void findNearbyLocations_DefaultRadius_ReturnsLocations() throws Exception {
            // Arrange
            when(merchantService.findNearbyLocations(
                    any(BigDecimal.class), any(BigDecimal.class), eq(25.0)))
                    .thenReturn(List.of(locationResponse));

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/locations/nearby")
                            .param("latitude", "32.7767")
                            .param("longitude", "-96.7970")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk());

            verify(merchantService).findNearbyLocations(any(), any(), eq(25.0));
        }

        @Test
        @DisplayName("Should return empty list when no locations nearby")
        @WithMockUser
        void findNearbyLocations_NoNearbyLocations_ReturnsEmptyList() throws Exception {
            // Arrange
            when(merchantService.findNearbyLocations(any(), any(), anyDouble()))
                    .thenReturn(Collections.emptyList());

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/locations/nearby")
                            .param("latitude", "0.0")
                            .param("longitude", "0.0")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should return 400 when latitude is missing")
        @WithMockUser
        void findNearbyLocations_MissingLatitude_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/locations/nearby")
                            .param("longitude", "-96.7970")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when longitude is missing")
        @WithMockUser
        void findNearbyLocations_MissingLongitude_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/locations/nearby")
                            .param("latitude", "32.7767")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // GET MERCHANT STATS TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/v1/merchants/stats - Get Merchant Stats")
    class GetMerchantStatsTests {

        @Test
        @DisplayName("Should return merchant stats as NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getMerchantStats_AsNationalAdmin_ReturnsStats() throws Exception {
            // Arrange
            MerchantService.MerchantStats stats = MerchantService.MerchantStats.builder()
                    .totalPending(5L)
                    .totalApproved(20L)
                    .totalRejected(3L)
                    .build();
            when(merchantService.getMerchantStats()).thenReturn(stats);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalPending").value(5))
                    .andExpect(jsonPath("$.totalApproved").value(20))
                    .andExpect(jsonPath("$.totalRejected").value(3));
        }

        @Test
        @DisplayName("Should return zero stats when no merchants")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getMerchantStats_NoMerchants_ReturnsZeroStats() throws Exception {
            // Arrange
            MerchantService.MerchantStats stats = MerchantService.MerchantStats.builder()
                    .totalPending(0L)
                    .totalApproved(0L)
                    .totalRejected(0L)
                    .build();
            when(merchantService.getMerchantStats()).thenReturn(stats);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalPending").value(0))
                    .andExpect(jsonPath("$.totalApproved").value(0))
                    .andExpect(jsonPath("$.totalRejected").value(0));
        }
    }

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should handle IllegalArgumentException from service")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createMerchant_ServiceThrowsIllegalArgument_ReturnsBadRequest() throws Exception {
            // Arrange
            when(merchantService.createMerchant(any(CreateMerchantRequest.class), anyLong()))
                    .thenThrow(new IllegalArgumentException("Terms must be accepted"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validMerchantRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle IllegalStateException from service")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_ServiceThrowsIllegalState_ReturnsConflict() throws Exception {
            // Arrange
            when(merchantService.approveMerchant(eq(1L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenThrow(new IllegalStateException("Merchant has already been processed"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(approveRequest)))
                    .andDo(print())
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should handle invalid JSON request body")
        @WithMockUser
        void createMerchant_InvalidJson_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ invalid json }"))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle empty request body")
        @WithMockUser
        void createMerchant_EmptyBody_ReturnsBadRequest() throws Exception {
            // Act & Assert
            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle invalid status parameter")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateMerchantStatus_InvalidStatus_ReturnsBadRequest() throws Exception {
            // Act & Assert - IllegalArgumentException from enum parsing
            mockMvc.perform(patch(BASE_URL + "/1/status")
                            .with(csrf())
                            .param("status", "INVALID_STATUS")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle invalid approve action")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void approveMerchant_InvalidAction_ReturnsBadRequest() throws Exception {
            // Arrange
            ApproveMerchantRequest invalidRequest = createApproveRequest("INVALID_ACTION", null);
            when(merchantService.approveMerchant(eq(1L), any(ApproveMerchantRequest.class), any(UUID.class)))
                    .thenThrow(new IllegalArgumentException("Invalid action. Must be APPROVE or REJECT"));

            // Act & Assert
            mockMvc.perform(post(BASE_URL + "/1/approve")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // CONTENT TYPE AND RESPONSE FORMAT TESTS
    // ============================================

    @Nested
    @DisplayName("Content Type and Response Format Tests")
    class ContentTypeTests {

        @Test
        @DisplayName("Should return JSON content type")
        @WithMockUser
        void getMerchant_ReturnsJsonContentType() throws Exception {
            // Arrange
            when(merchantService.getMerchant(1L)).thenReturn(merchantResponse);

            // Act & Assert
            mockMvc.perform(get(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON));
        }

        @Test
        @DisplayName("Should return proper page structure")
        @WithMockUser
        void getMerchants_ReturnsProperPageStructure() throws Exception {
            // Arrange
            Page<MerchantResponse> merchantPage = new PageImpl<>(
                    List.of(merchantResponse),
                    org.springframework.data.domain.PageRequest.of(0, 20),
                    1
            );
            when(merchantService.getMerchants(any(), any(), any(Pageable.class)))
                    .thenReturn(merchantPage);

            // Act & Assert
            mockMvc.perform(get(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.totalElements").exists())
                    .andExpect(jsonPath("$.totalPages").exists())
                    .andExpect(jsonPath("$.size").exists())
                    .andExpect(jsonPath("$.number").exists());
        }
    }
}
