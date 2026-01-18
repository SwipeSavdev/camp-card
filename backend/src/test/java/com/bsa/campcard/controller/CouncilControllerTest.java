package com.bsa.campcard.controller;

import com.bsa.campcard.dto.CouncilRequest;
import com.bsa.campcard.dto.CouncilResponse;
import com.bsa.campcard.dto.CouncilStatsResponse;
import com.bsa.campcard.service.CouncilService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CouncilController using @Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Request/response handling
 * - Input validation
 * - Authorization (RBAC)
 * - ID parsing (Long, UUID, council number)
 * - Error handling
 */
@Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest(CouncilController.class)
@DisplayName("CouncilController Tests")
class CouncilControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CouncilService councilService;

    private CouncilRequest validCouncilRequest;
    private CouncilResponse sampleCouncilResponse;
    private CouncilStatsResponse sampleStatsResponse;
    private UUID testUuid;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();

        // Create a valid request using setters (DTOs use @Data)
        validCouncilRequest = new CouncilRequest();
        validCouncilRequest.setCouncilNumber("123");
        validCouncilRequest.setName("Test Council");
        validCouncilRequest.setShortName("TC");
        validCouncilRequest.setRegion("WESTERN");
        validCouncilRequest.setStreetAddress("123 Scout Way");
        validCouncilRequest.setCity("Denver");
        validCouncilRequest.setState("CO");
        validCouncilRequest.setZipCode("80202");
        validCouncilRequest.setPhone("303-555-1234");
        validCouncilRequest.setEmail("contact@testcouncil.org");
        validCouncilRequest.setWebsiteUrl("https://testcouncil.org");
        validCouncilRequest.setLogoUrl("https://testcouncil.org/logo.png");
        validCouncilRequest.setScoutExecutiveName("John Executive");
        validCouncilRequest.setScoutExecutiveEmail("john@testcouncil.org");
        validCouncilRequest.setCampCardCoordinatorName("Jane Coordinator");
        validCouncilRequest.setCampCardCoordinatorEmail("jane@testcouncil.org");
        validCouncilRequest.setCampCardCoordinatorPhone("303-555-5678");
        validCouncilRequest.setCampaignStartDate(LocalDate.now());
        validCouncilRequest.setCampaignEndDate(LocalDate.now().plusMonths(3));
        validCouncilRequest.setGoalAmount(new BigDecimal("50000.00"));
        validCouncilRequest.setStatus("ACTIVE");
        validCouncilRequest.setSubscriptionTier("PREMIUM");

        // Create a sample response using setters
        sampleCouncilResponse = new CouncilResponse();
        sampleCouncilResponse.setId(1L);
        sampleCouncilResponse.setUuid(testUuid);
        sampleCouncilResponse.setCouncilNumber("123");
        sampleCouncilResponse.setName("Test Council");
        sampleCouncilResponse.setShortName("TC");
        sampleCouncilResponse.setRegion("WESTERN");
        sampleCouncilResponse.setStreetAddress("123 Scout Way");
        sampleCouncilResponse.setCity("Denver");
        sampleCouncilResponse.setState("CO");
        sampleCouncilResponse.setZipCode("80202");
        sampleCouncilResponse.setLocation("Denver, CO");
        sampleCouncilResponse.setPhone("303-555-1234");
        sampleCouncilResponse.setEmail("contact@testcouncil.org");
        sampleCouncilResponse.setWebsiteUrl("https://testcouncil.org");
        sampleCouncilResponse.setLogoUrl("https://testcouncil.org/logo.png");
        sampleCouncilResponse.setScoutExecutiveName("John Executive");
        sampleCouncilResponse.setScoutExecutiveEmail("john@testcouncil.org");
        sampleCouncilResponse.setCampCardCoordinatorName("Jane Coordinator");
        sampleCouncilResponse.setCampCardCoordinatorEmail("jane@testcouncil.org");
        sampleCouncilResponse.setCampCardCoordinatorPhone("303-555-5678");
        sampleCouncilResponse.setTotalTroops(10);
        sampleCouncilResponse.setTotalScouts(150);
        sampleCouncilResponse.setTotalSales(new BigDecimal("25000.00"));
        sampleCouncilResponse.setCardsSold(500);
        sampleCouncilResponse.setCampaignStartDate(LocalDate.now());
        sampleCouncilResponse.setCampaignEndDate(LocalDate.now().plusMonths(3));
        sampleCouncilResponse.setGoalAmount(new BigDecimal("50000.00"));
        sampleCouncilResponse.setCampaignProgress(50.0);
        sampleCouncilResponse.setStatus("ACTIVE");
        sampleCouncilResponse.setSubscriptionTier("PREMIUM");
        sampleCouncilResponse.setCreatedAt(LocalDateTime.now());
        sampleCouncilResponse.setUpdatedAt(LocalDateTime.now());

        // Create sample stats response
        Map<String, Long> councilsByRegion = new HashMap<>();
        councilsByRegion.put("WESTERN", 5L);
        councilsByRegion.put("CENTRAL", 3L);
        councilsByRegion.put("NORTHEAST", 2L);

        sampleStatsResponse = new CouncilStatsResponse();
        sampleStatsResponse.setTotalCouncils(10L);
        sampleStatsResponse.setActiveCouncils(7L);
        sampleStatsResponse.setInactiveCouncils(2L);
        sampleStatsResponse.setTrialCouncils(1L);
        sampleStatsResponse.setTotalScouts(500L);
        sampleStatsResponse.setTotalTroops(50L);
        sampleStatsResponse.setTotalSales(new BigDecimal("100000.00"));
        sampleStatsResponse.setTotalCardsSold(2000L);
        sampleStatsResponse.setCouncilsByRegion(councilsByRegion);
        sampleStatsResponse.setActiveCampaigns(5L);
        sampleStatsResponse.setTotalGoalAmount(new BigDecimal("500000.00"));
        sampleStatsResponse.setOverallProgress(20.0);
    }

    // ========================================================================
    // CREATE COUNCIL TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/councils - Create Council")
    class CreateCouncilTests {

        @Test
        @DisplayName("Should create council when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_AsNationalAdmin_Success() throws Exception {
            when(councilService.createCouncil(any(CouncilRequest.class))).thenReturn(sampleCouncilResponse);

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Test Council"))
                    .andExpect(jsonPath("$.councilNumber").value("123"))
                    .andExpect(jsonPath("$.region").value("WESTERN"))
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(councilService).createCouncil(any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should create council when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void createCouncil_AsCouncilAdmin_Success() throws Exception {
            when(councilService.createCouncil(any(CouncilRequest.class))).thenReturn(sampleCouncilResponse);

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L));

            verify(councilService).createCouncil(any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations (compatibility)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_OrganizationsEndpoint_Success() throws Exception {
            when(councilService.createCouncil(any(CouncilRequest.class))).thenReturn(sampleCouncilResponse);

            performPost("/api/v1/organizations", validCouncilRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L));

            verify(councilService).createCouncil(any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void createCouncil_AsScout_Forbidden() throws Exception {
            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isForbidden());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void createCouncil_AsParent_Forbidden() throws Exception {
            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isForbidden());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 403 when user is TROOP_LEADER")
        @WithMockUser(roles = "TROOP_LEADER")
        void createCouncil_AsTroopLeader_Forbidden() throws Exception {
            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isForbidden());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void createCouncil_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/councils")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCouncilRequest))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when councilNumber is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_BlankCouncilNumber_BadRequest() throws Exception {
            validCouncilRequest.setCouncilNumber("");

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when councilNumber is null")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_NullCouncilNumber_BadRequest() throws Exception {
            validCouncilRequest.setCouncilNumber(null);

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when name is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_BlankName_BadRequest() throws Exception {
            validCouncilRequest.setName("");

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when region is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_BlankRegion_BadRequest() throws Exception {
            validCouncilRequest.setRegion("");

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when councilNumber exceeds max length")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_CouncilNumberTooLong_BadRequest() throws Exception {
            validCouncilRequest.setCouncilNumber("12345678901"); // 11 chars, max is 10

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when email format is invalid")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_InvalidEmail_BadRequest() throws Exception {
            validCouncilRequest.setEmail("invalid-email");

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when scoutExecutiveEmail format is invalid")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_InvalidScoutExecutiveEmail_BadRequest() throws Exception {
            validCouncilRequest.setScoutExecutiveEmail("not-an-email");

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }

        @Test
        @DisplayName("Should return 400 when state exceeds max length")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCouncil_StateTooLong_BadRequest() throws Exception {
            validCouncilRequest.setState("COL"); // 3 chars, max is 2

            performPost("/api/v1/councils", validCouncilRequest)
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).createCouncil(any());
        }
    }

    // ========================================================================
    // GET ALL COUNCILS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/councils - Get Councils List")
    class GetCouncilsTests {

        @Test
        @DisplayName("Should return paginated councils for authenticated user")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_Authenticated_Success() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(
                    List.of(sampleCouncilResponse),
                    PageRequest.of(0, 20),
                    1
            );
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].id").value(1L))
                    .andExpect(jsonPath("$.content[0].name").value("Test Council"))
                    .andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.totalPages").value(1))
                    .andExpect(jsonPath("$.size").value(20))
                    .andExpect(jsonPath("$.number").value(0));

            verify(councilService).getAllCouncils(any(Pageable.class));
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations (compatibility)")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_OrganizationsEndpoint_Success() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/organizations")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(councilService).getAllCouncils(any(Pageable.class));
        }

        @Test
        @DisplayName("Should search councils when search parameter is provided")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_WithSearch_CallsSearchMethod() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.searchCouncils(eq("Denver"), any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("search", "Denver")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(councilService).searchCouncils(eq("Denver"), any(Pageable.class));
            verify(councilService, never()).getAllCouncils(any());
        }

        @Test
        @DisplayName("Should filter by status when status parameter is provided")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_WithStatus_CallsStatusMethod() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.getCouncilsByStatus(eq("ACTIVE"), any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("status", "ACTIVE")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(councilService).getCouncilsByStatus(eq("ACTIVE"), any(Pageable.class));
            verify(councilService, never()).getAllCouncils(any());
        }

        @Test
        @DisplayName("Should filter by region when region parameter is provided")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_WithRegion_CallsRegionMethod() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.getCouncilsByRegion(eq("WESTERN"), any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("region", "WESTERN")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(councilService).getCouncilsByRegion(eq("WESTERN"), any(Pageable.class));
            verify(councilService, never()).getAllCouncils(any());
        }

        @Test
        @DisplayName("Should handle custom pagination parameters")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_WithCustomPagination_Success() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(
                    List.of(sampleCouncilResponse),
                    PageRequest.of(2, 50),
                    151
            );
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("page", "2")
                            .param("size", "50")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.size").value(50))
                    .andExpect(jsonPath("$.number").value(2));

            verify(councilService).getAllCouncils(any(Pageable.class));
        }

        @Test
        @DisplayName("Should handle custom sorting parameters")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_WithCustomSort_Success() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("sortBy", "createdAt")
                            .param("sortDir", "DESC")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(councilService).getAllCouncils(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no councils exist")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_Empty_ReturnsEmptyPage() throws Exception {
            Page<CouncilResponse> emptyPage = new PageImpl<>(Collections.emptyList());
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/councils")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));

            verify(councilService).getAllCouncils(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getCouncils_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/councils")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(councilService, never()).getAllCouncils(any());
        }

        @Test
        @DisplayName("Should ignore empty search parameter")
        @WithMockUser(roles = "SCOUT")
        void getCouncils_EmptySearch_CallsGetAll() throws Exception {
            Page<CouncilResponse> councilPage = new PageImpl<>(List.of(sampleCouncilResponse));
            when(councilService.getAllCouncils(any(Pageable.class))).thenReturn(councilPage);

            mockMvc.perform(get("/api/v1/councils")
                            .param("search", "   ")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(councilService).getAllCouncils(any(Pageable.class));
            verify(councilService, never()).searchCouncils(anyString(), any());
        }
    }

    // ========================================================================
    // GET COUNCIL BY ID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/councils/{id} - Get Council by ID")
    class GetCouncilByIdTests {

        @Test
        @DisplayName("Should return council when ID is numeric (Long)")
        @WithMockUser(roles = "SCOUT")
        void getCouncil_ByLongId_Success() throws Exception {
            when(councilService.getCouncil(1L)).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Test Council"))
                    .andExpect(jsonPath("$.uuid").value(testUuid.toString()));

            verify(councilService).getCouncil(1L);
        }

        @Test
        @DisplayName("Should return council when ID is UUID")
        @WithMockUser(roles = "SCOUT")
        void getCouncil_ByUuid_Success() throws Exception {
            when(councilService.getCouncilByUuid(testUuid)).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/councils/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.uuid").value(testUuid.toString()));

            verify(councilService).getCouncilByUuid(testUuid);
        }

        @Test
        @DisplayName("Should return council when ID is council number")
        @WithMockUser(roles = "SCOUT")
        void getCouncil_ByCouncilNumber_Success() throws Exception {
            when(councilService.getCouncilByNumber("ABC123")).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/councils/ABC123")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L));

            verify(councilService).getCouncilByNumber("ABC123");
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations/{id} (compatibility)")
        @WithMockUser(roles = "SCOUT")
        void getCouncil_OrganizationsEndpoint_Success() throws Exception {
            when(councilService.getCouncil(1L)).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/organizations/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L));

            verify(councilService).getCouncil(1L);
        }

        @Test
        @DisplayName("Should throw RuntimeException when council not found by Long ID")
        @WithMockUser(roles = "SCOUT")
        void getCouncil_NotFoundByLongId_ThrowsException() throws Exception {
            when(councilService.getCouncil(999L)).thenThrow(new RuntimeException("Council not found: 999"));

            mockMvc.perform(get("/api/v1/councils/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(councilService).getCouncil(999L);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getCouncil_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(councilService, never()).getCouncil(anyLong());
        }
    }

    // ========================================================================
    // GET COUNCIL BY NUMBER TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/councils/number/{councilNumber} - Get Council by Number")
    class GetCouncilByNumberTests {

        @Test
        @DisplayName("Should return council by council number")
        @WithMockUser(roles = "SCOUT")
        void getCouncilByNumber_Success() throws Exception {
            when(councilService.getCouncilByNumber("123")).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/councils/number/123")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.councilNumber").value("123"))
                    .andExpect(jsonPath("$.name").value("Test Council"));

            verify(councilService).getCouncilByNumber("123");
        }

        @Test
        @DisplayName("Should throw RuntimeException when council number not found")
        @WithMockUser(roles = "SCOUT")
        void getCouncilByNumber_NotFound_ThrowsException() throws Exception {
            when(councilService.getCouncilByNumber("999")).thenThrow(new RuntimeException("Council not found: 999"));

            mockMvc.perform(get("/api/v1/councils/number/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(councilService).getCouncilByNumber("999");
        }
    }

    // ========================================================================
    // GET COUNCIL BY UUID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/councils/uuid/{uuid} - Get Council by UUID")
    class GetCouncilByUuidTests {

        @Test
        @DisplayName("Should return council by UUID")
        @WithMockUser(roles = "SCOUT")
        void getCouncilByUuid_Success() throws Exception {
            when(councilService.getCouncilByUuid(testUuid)).thenReturn(sampleCouncilResponse);

            mockMvc.perform(get("/api/v1/councils/uuid/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.uuid").value(testUuid.toString()))
                    .andExpect(jsonPath("$.name").value("Test Council"));

            verify(councilService).getCouncilByUuid(testUuid);
        }

        @Test
        @DisplayName("Should throw RuntimeException when UUID not found")
        @WithMockUser(roles = "SCOUT")
        void getCouncilByUuid_NotFound_ThrowsException() throws Exception {
            UUID unknownUuid = UUID.randomUUID();
            when(councilService.getCouncilByUuid(unknownUuid))
                    .thenThrow(new RuntimeException("Council not found: " + unknownUuid));

            mockMvc.perform(get("/api/v1/councils/uuid/" + unknownUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(councilService).getCouncilByUuid(unknownUuid);
        }

        @Test
        @DisplayName("Should return 400 for invalid UUID format")
        @WithMockUser(roles = "SCOUT")
        void getCouncilByUuid_InvalidFormat_BadRequest() throws Exception {
            mockMvc.perform(get("/api/v1/councils/uuid/not-a-uuid")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());

            verify(councilService, never()).getCouncilByUuid(any());
        }
    }

    // ========================================================================
    // UPDATE COUNCIL TESTS
    // ========================================================================

    @Nested
    @DisplayName("PUT /api/v1/councils/{id} - Update Council")
    class UpdateCouncilTests {

        @Test
        @DisplayName("Should update council when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncil_AsNationalAdmin_Success() throws Exception {
            CouncilResponse updatedResponse = new CouncilResponse();
            updatedResponse.setId(1L);
            updatedResponse.setUuid(testUuid);
            updatedResponse.setCouncilNumber("123");
            updatedResponse.setName("Updated Council");
            updatedResponse.setRegion("CENTRAL");
            updatedResponse.setStatus("ACTIVE");

            when(councilService.updateCouncil(eq(1L), any(CouncilRequest.class))).thenReturn(updatedResponse);

            validCouncilRequest.setName("Updated Council");
            validCouncilRequest.setRegion("CENTRAL");

            performPut("/api/v1/councils/1", validCouncilRequest)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Updated Council"))
                    .andExpect(jsonPath("$.region").value("CENTRAL"));

            verify(councilService).updateCouncil(eq(1L), any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should update council when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateCouncil_AsCouncilAdmin_Success() throws Exception {
            when(councilService.updateCouncil(eq(1L), any(CouncilRequest.class))).thenReturn(sampleCouncilResponse);

            performPut("/api/v1/councils/1", validCouncilRequest)
                    .andExpect(status().isOk());

            verify(councilService).updateCouncil(eq(1L), any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations/{id} (compatibility)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncil_OrganizationsEndpoint_Success() throws Exception {
            when(councilService.updateCouncil(eq(1L), any(CouncilRequest.class))).thenReturn(sampleCouncilResponse);

            performPut("/api/v1/organizations/1", validCouncilRequest)
                    .andExpect(status().isOk());

            verify(councilService).updateCouncil(eq(1L), any(CouncilRequest.class));
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void updateCouncil_AsScout_Forbidden() throws Exception {
            performPut("/api/v1/councils/1", validCouncilRequest)
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateCouncil(anyLong(), any());
        }

        @Test
        @DisplayName("Should return 403 when user is TROOP_LEADER")
        @WithMockUser(roles = "TROOP_LEADER")
        void updateCouncil_AsTroopLeader_Forbidden() throws Exception {
            performPut("/api/v1/councils/1", validCouncilRequest)
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateCouncil(anyLong(), any());
        }

        @Test
        @DisplayName("Should throw RuntimeException when council not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncil_NotFound_ThrowsException() throws Exception {
            when(councilService.updateCouncil(eq(999L), any(CouncilRequest.class)))
                    .thenThrow(new RuntimeException("Council not found: 999"));

            performPut("/api/v1/councils/999", validCouncilRequest)
                    .andExpect(status().isInternalServerError());

            verify(councilService).updateCouncil(eq(999L), any(CouncilRequest.class));
        }
    }

    // ========================================================================
    // UPDATE COUNCIL STATUS TESTS
    // ========================================================================

    @Nested
    @DisplayName("PATCH /api/v1/councils/{id}/status - Update Council Status")
    class UpdateCouncilStatusTests {

        @Test
        @DisplayName("Should update status when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStatus_AsNationalAdmin_Success() throws Exception {
            CouncilResponse inactiveResponse = new CouncilResponse();
            inactiveResponse.setId(1L);
            inactiveResponse.setStatus("INACTIVE");

            when(councilService.updateStatus(1L, "INACTIVE")).thenReturn(inactiveResponse);

            mockMvc.perform(patch("/api/v1/councils/1/status")
                            .param("status", "INACTIVE")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("INACTIVE"));

            verify(councilService).updateStatus(1L, "INACTIVE");
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations/{id}/status (compatibility)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStatus_OrganizationsEndpoint_Success() throws Exception {
            CouncilResponse suspendedResponse = new CouncilResponse();
            suspendedResponse.setId(1L);
            suspendedResponse.setStatus("SUSPENDED");

            when(councilService.updateStatus(1L, "SUSPENDED")).thenReturn(suspendedResponse);

            mockMvc.perform(patch("/api/v1/organizations/1/status")
                            .param("status", "SUSPENDED")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUSPENDED"));

            verify(councilService).updateStatus(1L, "SUSPENDED");
        }

        @Test
        @DisplayName("Should return 403 when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateCouncilStatus_AsCouncilAdmin_Forbidden() throws Exception {
            mockMvc.perform(patch("/api/v1/councils/1/status")
                            .param("status", "INACTIVE")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateStatus(anyLong(), anyString());
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void updateCouncilStatus_AsScout_Forbidden() throws Exception {
            mockMvc.perform(patch("/api/v1/councils/1/status")
                            .param("status", "INACTIVE")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateStatus(anyLong(), anyString());
        }

        @Test
        @DisplayName("Should update status to TRIAL")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStatus_ToTrial_Success() throws Exception {
            CouncilResponse trialResponse = new CouncilResponse();
            trialResponse.setId(1L);
            trialResponse.setStatus("TRIAL");

            when(councilService.updateStatus(1L, "TRIAL")).thenReturn(trialResponse);

            mockMvc.perform(patch("/api/v1/councils/1/status")
                            .param("status", "TRIAL")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("TRIAL"));

            verify(councilService).updateStatus(1L, "TRIAL");
        }

        @Test
        @DisplayName("Should update status to ACTIVE")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStatus_ToActive_Success() throws Exception {
            when(councilService.updateStatus(1L, "ACTIVE")).thenReturn(sampleCouncilResponse);

            mockMvc.perform(patch("/api/v1/councils/1/status")
                            .param("status", "ACTIVE")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(councilService).updateStatus(1L, "ACTIVE");
        }
    }

    // ========================================================================
    // DELETE COUNCIL TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/councils/{id} - Delete Council")
    class DeleteCouncilTests {

        @Test
        @DisplayName("Should delete council when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCouncil_AsNationalAdmin_Success() throws Exception {
            doNothing().when(councilService).deleteCouncil(1L);

            mockMvc.perform(delete("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk());

            verify(councilService).deleteCouncil(1L);
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations/{id} (compatibility)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCouncil_OrganizationsEndpoint_Success() throws Exception {
            doNothing().when(councilService).deleteCouncil(1L);

            mockMvc.perform(delete("/api/v1/organizations/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk());

            verify(councilService).deleteCouncil(1L);
        }

        @Test
        @DisplayName("Should return 403 when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void deleteCouncil_AsCouncilAdmin_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).deleteCouncil(anyLong());
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void deleteCouncil_AsScout_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).deleteCouncil(anyLong());
        }

        @Test
        @DisplayName("Should return 403 when user is TROOP_LEADER")
        @WithMockUser(roles = "TROOP_LEADER")
        void deleteCouncil_AsTroopLeader_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).deleteCouncil(anyLong());
        }

        @Test
        @DisplayName("Should throw RuntimeException when council not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCouncil_NotFound_ThrowsException() throws Exception {
            doThrow(new RuntimeException("Council not found: 999")).when(councilService).deleteCouncil(999L);

            mockMvc.perform(delete("/api/v1/councils/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isInternalServerError());

            verify(councilService).deleteCouncil(999L);
        }

        @Test
        @DisplayName("Should throw RuntimeException when council has troops")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCouncil_HasTroops_ThrowsException() throws Exception {
            doThrow(new RuntimeException("Cannot delete council with 5 troops. Remove troops first."))
                    .when(councilService).deleteCouncil(1L);

            mockMvc.perform(delete("/api/v1/councils/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isInternalServerError());

            verify(councilService).deleteCouncil(1L);
        }
    }

    // ========================================================================
    // GET COUNCIL STATS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/councils/stats - Get Council Statistics")
    class GetCouncilStatsTests {

        @Test
        @DisplayName("Should return stats when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getCouncilStats_AsNationalAdmin_Success() throws Exception {
            when(councilService.getStats()).thenReturn(sampleStatsResponse);

            mockMvc.perform(get("/api/v1/councils/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalCouncils").value(10L))
                    .andExpect(jsonPath("$.activeCouncils").value(7L))
                    .andExpect(jsonPath("$.inactiveCouncils").value(2L))
                    .andExpect(jsonPath("$.trialCouncils").value(1L))
                    .andExpect(jsonPath("$.totalScouts").value(500L))
                    .andExpect(jsonPath("$.totalTroops").value(50L))
                    .andExpect(jsonPath("$.totalSales").value(100000.00))
                    .andExpect(jsonPath("$.totalCardsSold").value(2000L))
                    .andExpect(jsonPath("$.councilsByRegion.WESTERN").value(5L))
                    .andExpect(jsonPath("$.activeCampaigns").value(5L))
                    .andExpect(jsonPath("$.totalGoalAmount").value(500000.00))
                    .andExpect(jsonPath("$.overallProgress").value(20.0));

            verify(councilService).getStats();
        }

        @Test
        @DisplayName("Should return stats when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCouncilStats_AsCouncilAdmin_Success() throws Exception {
            when(councilService.getStats()).thenReturn(sampleStatsResponse);

            mockMvc.perform(get("/api/v1/councils/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalCouncils").value(10L));

            verify(councilService).getStats();
        }

        @Test
        @DisplayName("Should also accept requests to /api/v1/organizations/stats (compatibility)")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getCouncilStats_OrganizationsEndpoint_Success() throws Exception {
            when(councilService.getStats()).thenReturn(sampleStatsResponse);

            mockMvc.perform(get("/api/v1/organizations/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalCouncils").value(10L));

            verify(councilService).getStats();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getCouncilStats_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/councils/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).getStats();
        }

        @Test
        @DisplayName("Should return 403 when user is TROOP_LEADER")
        @WithMockUser(roles = "TROOP_LEADER")
        void getCouncilStats_AsTroopLeader_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/councils/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).getStats();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getCouncilStats_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/councils/stats")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).getStats();
        }
    }

    // ========================================================================
    // UPDATE COUNCIL STATS TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/councils/{id}/update-stats - Update Council Statistics")
    class UpdateCouncilStatsTests {

        @Test
        @DisplayName("Should update council stats when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStats_AsNationalAdmin_Success() throws Exception {
            CouncilResponse updatedResponse = new CouncilResponse();
            updatedResponse.setId(1L);
            updatedResponse.setTotalTroops(20);
            updatedResponse.setTotalSales(new BigDecimal("75000.00"));
            updatedResponse.setCardsSold(1500);

            when(councilService.updateCouncilStats(1L)).thenReturn(updatedResponse);

            mockMvc.perform(post("/api/v1/councils/1/update-stats")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.totalTroops").value(20))
                    .andExpect(jsonPath("$.totalSales").value(75000.00))
                    .andExpect(jsonPath("$.cardsSold").value(1500));

            verify(councilService).updateCouncilStats(1L);
        }

        @Test
        @DisplayName("Should update council stats when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateCouncilStats_AsCouncilAdmin_Success() throws Exception {
            when(councilService.updateCouncilStats(1L)).thenReturn(sampleCouncilResponse);

            mockMvc.perform(post("/api/v1/councils/1/update-stats")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isOk());

            verify(councilService).updateCouncilStats(1L);
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void updateCouncilStats_AsScout_Forbidden() throws Exception {
            mockMvc.perform(post("/api/v1/councils/1/update-stats")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateCouncilStats(anyLong());
        }

        @Test
        @DisplayName("Should return 403 when user is TROOP_LEADER")
        @WithMockUser(roles = "TROOP_LEADER")
        void updateCouncilStats_AsTroopLeader_Forbidden() throws Exception {
            mockMvc.perform(post("/api/v1/councils/1/update-stats")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(councilService, never()).updateCouncilStats(anyLong());
        }

        @Test
        @DisplayName("Should throw RuntimeException when council not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCouncilStats_NotFound_ThrowsException() throws Exception {
            when(councilService.updateCouncilStats(999L))
                    .thenThrow(new RuntimeException("Council not found: 999"));

            mockMvc.perform(post("/api/v1/councils/999/update-stats")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isInternalServerError());

            verify(councilService).updateCouncilStats(999L);
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private ResultActions performPost(String url, Object content) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .with(csrf()));
    }

    private ResultActions performPut(String url, Object content) throws Exception {
        return mockMvc.perform(put(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .with(csrf()));
    }
}
