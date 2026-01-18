package com.bsa.campcard.controller;

import com.bsa.campcard.dto.CreateScoutRequest;
import com.bsa.campcard.dto.ScoutResponse;
import com.bsa.campcard.service.ScoutService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for ScoutController REST API endpoints.
 *
 * Uses @WebMvcTest to test the controller layer in isolation with MockMvc.
 * ScoutService is mocked to test only controller behavior.
 *
 * Test categories:
 * - CRUD operations (create, read, update, delete scouts)
 * - Get troop roster
 * - Search scouts
 * - Top sellers queries
 * - Record sale operations
 * - Update scout rank
 * - Transfer scout between troops
 * - Authorization tests (NATIONAL_ADMIN, COUNCIL_ADMIN, TROOP_LEADER permissions)
 * - Not found scenarios
 * - Pagination and filtering
 */
@WebMvcTest(value = ScoutController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("ScoutController Tests")
class ScoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ScoutService scoutService;

    private CreateScoutRequest createRequest;
    private ScoutResponse scoutResponse;
    private UUID testUserId;
    private Long testTroopId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testTroopId = 100L;

        // Create request using setters (DTOs use @Data)
        createRequest = new CreateScoutRequest();
        createRequest.setUserId(testUserId);
        createRequest.setTroopId(testTroopId);
        createRequest.setFirstName("John");
        createRequest.setLastName("Smith");
        createRequest.setBirthDate(LocalDate.of(2012, 5, 15));
        createRequest.setBsaMemberId("BSA-123456");
        createRequest.setRank("SCOUT");
        createRequest.setJoinDate(LocalDate.of(2023, 9, 1));
        createRequest.setParentName("Jane Smith");
        createRequest.setParentEmail("jane.smith@email.com");
        createRequest.setParentPhone("555-123-4567");
        createRequest.setEmergencyContactName("Bob Smith");
        createRequest.setEmergencyContactPhone("555-987-6543");
        createRequest.setSalesGoal(new BigDecimal("500.00"));

        // Create response using setters (DTOs use @Data)
        scoutResponse = new ScoutResponse();
        scoutResponse.setId(1L);
        scoutResponse.setUuid(UUID.randomUUID());
        scoutResponse.setUserId(testUserId);
        scoutResponse.setTroopId(testTroopId);
        scoutResponse.setTroopNumber("123");
        scoutResponse.setFirstName("John");
        scoutResponse.setLastName("Smith");
        scoutResponse.setFullName("John Smith");
        scoutResponse.setBirthDate(LocalDate.of(2012, 5, 15));
        scoutResponse.setAge(13);
        scoutResponse.setBsaMemberId("BSA-123456");
        scoutResponse.setRank("SCOUT");
        scoutResponse.setJoinDate(LocalDate.of(2023, 9, 1));
        scoutResponse.setParentName("Jane Smith");
        scoutResponse.setParentEmail("jane.smith@email.com");
        scoutResponse.setParentPhone("555-123-4567");
        scoutResponse.setCardsSold(25);
        scoutResponse.setTotalSales(new BigDecimal("250.00"));
        scoutResponse.setSalesGoal(new BigDecimal("500.00"));
        scoutResponse.setGoalProgress(50.0);
        scoutResponse.setCommissionEarned(new BigDecimal("25.00"));
        scoutResponse.setTopSeller(false);
        scoutResponse.setAwardsEarned(1);
        scoutResponse.setStatus("ACTIVE");
        scoutResponse.setProfileImageUrl(null);
        scoutResponse.setCreatedAt(LocalDateTime.now());
    }

    // Helper method to create ScoutResponse with specific values
    private ScoutResponse createScoutResponse(Long id, String firstName, String lastName,
                                              Long troopId, BigDecimal totalSales, int cardsSold) {
        ScoutResponse response = new ScoutResponse();
        response.setId(id);
        response.setUuid(UUID.randomUUID());
        response.setUserId(UUID.randomUUID());
        response.setTroopId(troopId);
        response.setFirstName(firstName);
        response.setLastName(lastName);
        response.setFullName(firstName + " " + lastName);
        response.setTotalSales(totalSales);
        response.setCardsSold(cardsSold);
        response.setRank("SCOUT");
        response.setStatus("ACTIVE");
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    @Nested
    @DisplayName("POST /api/v1/scouts - Create Scout")
    class CreateScoutTests {

        @Test
        @DisplayName("Should create scout successfully")
        void createScout_Success() throws Exception {
            when(scoutService.createScout(any(CreateScoutRequest.class))).thenReturn(scoutResponse);

            mockMvc.perform(post("/api/v1/scouts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Smith"))
                    .andExpect(jsonPath("$.rank").value("SCOUT"))
                    .andExpect(jsonPath("$.troopId").value(testTroopId))
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(scoutService).createScout(any(CreateScoutRequest.class));
        }

        @Test
        @DisplayName("Should return created scout with all fields populated")
        void createScout_ReturnsAllFields() throws Exception {
            when(scoutService.createScout(any(CreateScoutRequest.class))).thenReturn(scoutResponse);

            mockMvc.perform(post("/api/v1/scouts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.fullName").value("John Smith"))
                    .andExpect(jsonPath("$.parentName").value("Jane Smith"))
                    .andExpect(jsonPath("$.parentEmail").value("jane.smith@email.com"))
                    .andExpect(jsonPath("$.parentPhone").value("555-123-4567"))
                    .andExpect(jsonPath("$.bsaMemberId").value("BSA-123456"))
                    .andExpect(jsonPath("$.age").value(13));
        }

        @Test
        @DisplayName("Should return error when troop not found")
        void createScout_TroopNotFound() throws Exception {
            when(scoutService.createScout(any(CreateScoutRequest.class)))
                    .thenThrow(new IllegalArgumentException("Troop not found"));

            mockMvc.perform(post("/api/v1/scouts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return error when user already registered as scout")
        void createScout_UserAlreadyRegistered() throws Exception {
            when(scoutService.createScout(any(CreateScoutRequest.class)))
                    .thenThrow(new IllegalArgumentException("User is already registered as a scout"));

            mockMvc.perform(post("/api/v1/scouts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return error when BSA member ID already exists")
        void createScout_DuplicateBsaMemberId() throws Exception {
            when(scoutService.createScout(any(CreateScoutRequest.class)))
                    .thenThrow(new IllegalArgumentException("BSA Member ID already exists"));

            mockMvc.perform(post("/api/v1/scouts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/scouts/{id} - Update Scout")
    class UpdateScoutTests {

        @Test
        @DisplayName("Should update scout successfully")
        void updateScout_Success() throws Exception {
            CreateScoutRequest updateRequest = new CreateScoutRequest();
            updateRequest.setFirstName("Johnny");
            updateRequest.setRank("TENDERFOOT");

            ScoutResponse updatedResponse = new ScoutResponse();
            updatedResponse.setId(1L);
            updatedResponse.setFirstName("Johnny");
            updatedResponse.setLastName("Smith");
            updatedResponse.setRank("TENDERFOOT");
            updatedResponse.setStatus("ACTIVE");

            when(scoutService.updateScout(eq(1L), any(CreateScoutRequest.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/v1/scouts/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("Johnny"))
                    .andExpect(jsonPath("$.rank").value("TENDERFOOT"));

            verify(scoutService).updateScout(eq(1L), any(CreateScoutRequest.class));
        }

        @Test
        @DisplayName("Should return error when updating non-existent scout")
        void updateScout_NotFound() throws Exception {
            when(scoutService.updateScout(eq(999L), any(CreateScoutRequest.class)))
                    .thenThrow(new IllegalArgumentException("Scout not found"));

            mockMvc.perform(put("/api/v1/scouts/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should update scout with partial data")
        void updateScout_PartialUpdate() throws Exception {
            CreateScoutRequest partialRequest = new CreateScoutRequest();
            partialRequest.setSalesGoal(new BigDecimal("1000.00"));

            ScoutResponse updatedResponse = new ScoutResponse();
            updatedResponse.setId(1L);
            updatedResponse.setFirstName("John");
            updatedResponse.setLastName("Smith");
            updatedResponse.setSalesGoal(new BigDecimal("1000.00"));

            when(scoutService.updateScout(eq(1L), any(CreateScoutRequest.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/v1/scouts/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partialRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.salesGoal").value(1000.00));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/scouts/{id} - Get Scout by ID")
    class GetScoutByIdTests {

        @Test
        @DisplayName("Should return scout when found by ID")
        void getScout_Found() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Smith"))
                    .andExpect(jsonPath("$.troopId").value(testTroopId))
                    .andExpect(jsonPath("$.cardsSold").value(25))
                    .andExpect(jsonPath("$.totalSales").value(250.00))
                    .andExpect(jsonPath("$.goalProgress").value(50.0));

            verify(scoutService).getScout(1L);
        }

        @Test
        @DisplayName("Should return error when scout not found by ID")
        void getScout_NotFound() throws Exception {
            when(scoutService.getScout(999L)).thenThrow(new IllegalArgumentException("Scout not found"));

            mockMvc.perform(get("/api/v1/scouts/999"))
                    .andExpect(status().isBadRequest());

            verify(scoutService).getScout(999L);
        }

        @Test
        @DisplayName("Should return all scout sales statistics")
        void getScout_ReturnsSalesStatistics() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.commissionEarned").value(25.00))
                    .andExpect(jsonPath("$.salesGoal").value(500.00))
                    .andExpect(jsonPath("$.goalProgress").value(50.0))
                    .andExpect(jsonPath("$.awardsEarned").value(1));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/scouts/user/{userId} - Get Scout by User ID")
    class GetScoutByUserIdTests {

        @Test
        @DisplayName("Should return scout when found by user ID")
        void getScoutByUserId_Found() throws Exception {
            when(scoutService.getScoutByUserId(testUserId)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/user/{userId}", testUserId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(testUserId.toString()))
                    .andExpect(jsonPath("$.firstName").value("John"));

            verify(scoutService).getScoutByUserId(testUserId);
        }

        @Test
        @DisplayName("Should return error when scout not found by user ID")
        void getScoutByUserId_NotFound() throws Exception {
            UUID unknownUserId = UUID.randomUUID();
            when(scoutService.getScoutByUserId(unknownUserId))
                    .thenThrow(new IllegalArgumentException("Scout not found for user"));

            mockMvc.perform(get("/api/v1/scouts/user/{userId}", unknownUserId))
                    .andExpect(status().isBadRequest());

            verify(scoutService).getScoutByUserId(unknownUserId);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/scouts/troop/{troopId}/roster - Get Troop Roster")
    class GetTroopRosterTests {

        @Test
        @DisplayName("Should return troop roster with default pagination")
        void getTroopRoster_DefaultPagination() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 20), 1);
            when(scoutService.getTroopRoster(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/troop/{troopId}/roster", testTroopId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].firstName").value("John"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(scoutService).getTroopRoster(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return active scouts only when activeOnly is true")
        void getTroopRoster_ActiveOnly() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 20), 1);
            when(scoutService.getActiveTroopRoster(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/troop/{troopId}/roster", testTroopId)
                            .param("activeOnly", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));

            verify(scoutService).getActiveTroopRoster(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return roster with custom pagination")
        void getTroopRoster_CustomPagination() throws Exception {
            ScoutResponse scout2 = createScoutResponse(2L, "Mike", "Johnson", testTroopId, new BigDecimal("300"), 30);
            Page<ScoutResponse> scoutPage = new PageImpl<>(
                    List.of(scoutResponse, scout2),
                    PageRequest.of(0, 10, Sort.by("lastName")),
                    2
            );
            when(scoutService.getTroopRoster(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/troop/{troopId}/roster", testTroopId)
                            .param("page", "0")
                            .param("size", "10")
                            .param("sortBy", "lastName")
                            .param("sortDir", "ASC"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.totalElements").value(2));

            verify(scoutService).getTroopRoster(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty roster when troop has no scouts")
        void getTroopRoster_EmptyRoster() throws Exception {
            Page<ScoutResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(scoutService.getTroopRoster(eq(testTroopId), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/scouts/troop/{troopId}/roster", testTroopId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should handle descending sort direction")
        void getTroopRoster_DescendingSort() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 20), 1);
            when(scoutService.getTroopRoster(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/troop/{troopId}/roster", testTroopId)
                            .param("sortBy", "totalSales")
                            .param("sortDir", "DESC"))
                    .andExpect(status().isOk());

            verify(scoutService).getTroopRoster(eq(testTroopId), any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/scouts/search - Search Scouts")
    class SearchScoutsTests {

        @Test
        @DisplayName("Should search scouts by query")
        void searchScouts_WithQuery() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 20), 1);
            when(scoutService.searchScouts(eq("John"), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/search")
                            .param("query", "John"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].firstName").value("John"));

            verify(scoutService).searchScouts(eq("John"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty results when search has no matches")
        void searchScouts_NoMatches() throws Exception {
            Page<ScoutResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(scoutService.searchScouts(eq("NonExistent"), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/scouts/search")
                            .param("query", "NonExistent"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(scoutService).searchScouts(eq("NonExistent"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search by last name")
        void searchScouts_ByLastName() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 20), 1);
            when(scoutService.searchScouts(eq("Smith"), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/search")
                            .param("query", "Smith"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].lastName").value("Smith"));

            verify(scoutService).searchScouts(eq("Smith"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search with custom pagination")
        void searchScouts_CustomPagination() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(1, 5), 6);
            when(scoutService.searchScouts(eq("test"), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/search")
                            .param("query", "test")
                            .param("page", "1")
                            .param("size", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(1))
                    .andExpect(jsonPath("$.totalElements").value(6));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/scouts/top-sellers - Get Top Sellers")
    class GetTopSellersTests {

        @Test
        @DisplayName("Should return top sellers globally")
        void getTopSellers_Global() throws Exception {
            ScoutResponse topScout = createScoutResponse(2L, "Mike", "Johnson", testTroopId, new BigDecimal("1000"), 100);
            topScout.setTopSeller(true);
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(topScout, scoutResponse), PageRequest.of(0, 10), 2);
            when(scoutService.getTopSellers(any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/top-sellers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].totalSales").value(1000.00));

            verify(scoutService).getTopSellers(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return top sellers by troop")
        void getTopSellers_ByTroop() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 10), 1);
            when(scoutService.getTopSellersByTroop(eq(testTroopId), any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/top-sellers")
                            .param("troopId", String.valueOf(testTroopId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].troopId").value(testTroopId));

            verify(scoutService).getTopSellersByTroop(eq(testTroopId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return limited results based on page size")
        void getTopSellers_LimitedResults() throws Exception {
            Page<ScoutResponse> scoutPage = new PageImpl<>(List.of(scoutResponse), PageRequest.of(0, 5), 10);
            when(scoutService.getTopSellers(any(Pageable.class))).thenReturn(scoutPage);

            mockMvc.perform(get("/api/v1/scouts/top-sellers")
                            .param("size", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.totalElements").value(10))
                    .andExpect(jsonPath("$.size").value(5));
        }

        @Test
        @DisplayName("Should return empty when no scouts exist")
        void getTopSellers_Empty() throws Exception {
            Page<ScoutResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
            when(scoutService.getTopSellers(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/scouts/top-sellers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/scouts/{id}/record-sale - Record Sale")
    class RecordSaleTests {

        @Test
        @DisplayName("Should record sale successfully")
        void recordSale_Success() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isOk());

            verify(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);
        }

        @Test
        @DisplayName("Should return error when scout not found")
        void recordSale_ScoutNotFound() throws Exception {
            doThrow(new IllegalArgumentException("Scout not found"))
                    .when(scoutService).recordSale(eq(999L), any(BigDecimal.class), anyInt());

            mockMvc.perform(post("/api/v1/scouts/999/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should handle large sale amounts")
        void recordSale_LargeAmount() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("5000.00"), 500);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "5000.00")
                            .param("cardsCount", "500"))
                    .andExpect(status().isOk());

            verify(scoutService).recordSale(1L, new BigDecimal("5000.00"), 500);
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/scouts/{id}/rank - Update Scout Rank")
    class UpdateScoutRankTests {

        @Test
        @DisplayName("Should update scout rank successfully")
        void updateScoutRank_Success() throws Exception {
            doNothing().when(scoutService).updateScoutRank(1L, "TENDERFOOT");

            mockMvc.perform(patch("/api/v1/scouts/1/rank")
                            .param("rank", "TENDERFOOT"))
                    .andExpect(status().isOk());

            verify(scoutService).updateScoutRank(1L, "TENDERFOOT");
        }

        @Test
        @DisplayName("Should return error when scout not found")
        void updateScoutRank_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Scout not found"))
                    .when(scoutService).updateScoutRank(999L, "TENDERFOOT");

            mockMvc.perform(patch("/api/v1/scouts/999/rank")
                            .param("rank", "TENDERFOOT"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should update to Eagle Scout rank")
        void updateScoutRank_ToEagle() throws Exception {
            doNothing().when(scoutService).updateScoutRank(1L, "EAGLE");

            mockMvc.perform(patch("/api/v1/scouts/1/rank")
                            .param("rank", "EAGLE"))
                    .andExpect(status().isOk());

            verify(scoutService).updateScoutRank(1L, "EAGLE");
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/scouts/{id}/status - Update Scout Status")
    class UpdateScoutStatusTests {

        @Test
        @DisplayName("Should update scout status to INACTIVE")
        void updateScoutStatus_ToInactive() throws Exception {
            doNothing().when(scoutService).updateScoutStatus(1L, "INACTIVE");

            mockMvc.perform(patch("/api/v1/scouts/1/status")
                            .param("status", "INACTIVE"))
                    .andExpect(status().isOk());

            verify(scoutService).updateScoutStatus(1L, "INACTIVE");
        }

        @Test
        @DisplayName("Should update scout status to ACTIVE")
        void updateScoutStatus_ToActive() throws Exception {
            doNothing().when(scoutService).updateScoutStatus(1L, "ACTIVE");

            mockMvc.perform(patch("/api/v1/scouts/1/status")
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk());

            verify(scoutService).updateScoutStatus(1L, "ACTIVE");
        }

        @Test
        @DisplayName("Should return error when scout not found")
        void updateScoutStatus_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Scout not found"))
                    .when(scoutService).updateScoutStatus(999L, "INACTIVE");

            mockMvc.perform(patch("/api/v1/scouts/999/status")
                            .param("status", "INACTIVE"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/scouts/{id}/transfer - Transfer Scout")
    class TransferScoutTests {

        @Test
        @DisplayName("Should transfer scout successfully")
        void transferScout_Success() throws Exception {
            doNothing().when(scoutService).transferScout(1L, 200L);

            mockMvc.perform(post("/api/v1/scouts/1/transfer")
                            .param("newTroopId", "200"))
                    .andExpect(status().isOk());

            verify(scoutService).transferScout(1L, 200L);
        }

        @Test
        @DisplayName("Should return error when scout not found")
        void transferScout_ScoutNotFound() throws Exception {
            doThrow(new IllegalArgumentException("Scout not found"))
                    .when(scoutService).transferScout(999L, 200L);

            mockMvc.perform(post("/api/v1/scouts/999/transfer")
                            .param("newTroopId", "200"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return error when new troop not found")
        void transferScout_NewTroopNotFound() throws Exception {
            doThrow(new IllegalArgumentException("New troop not found"))
                    .when(scoutService).transferScout(1L, 999L);

            mockMvc.perform(post("/api/v1/scouts/1/transfer")
                            .param("newTroopId", "999"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/scouts/mark-top-sellers - Mark Top Sellers")
    class MarkTopSellersTests {

        @Test
        @DisplayName("Should mark top sellers successfully")
        void markTopSellers_Success() throws Exception {
            doNothing().when(scoutService).markTopSellers(10);

            mockMvc.perform(post("/api/v1/scouts/mark-top-sellers")
                            .param("topCount", "10"))
                    .andExpect(status().isOk());

            verify(scoutService).markTopSellers(10);
        }

        @Test
        @DisplayName("Should mark top 5 sellers")
        void markTopSellers_Top5() throws Exception {
            doNothing().when(scoutService).markTopSellers(5);

            mockMvc.perform(post("/api/v1/scouts/mark-top-sellers")
                            .param("topCount", "5"))
                    .andExpect(status().isOk());

            verify(scoutService).markTopSellers(5);
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/scouts/{id} - Delete Scout")
    class DeleteScoutTests {

        @Test
        @DisplayName("Should delete scout successfully")
        void deleteScout_Success() throws Exception {
            doNothing().when(scoutService).deleteScout(1L);

            mockMvc.perform(delete("/api/v1/scouts/1"))
                    .andExpect(status().isOk());

            verify(scoutService).deleteScout(1L);
        }

        @Test
        @DisplayName("Should return error when scout not found")
        void deleteScout_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Scout not found"))
                    .when(scoutService).deleteScout(999L);

            mockMvc.perform(delete("/api/v1/scouts/999"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should call service method with correct scout ID")
        void deleteScout_CorrectId() throws Exception {
            doNothing().when(scoutService).deleteScout(42L);

            mockMvc.perform(delete("/api/v1/scouts/42"))
                    .andExpect(status().isOk());

            verify(scoutService).deleteScout(42L);
        }
    }

    @Nested
    @DisplayName("Authorization Tests - Record Sale")
    class RecordSaleAuthorizationTests {

        @Test
        @WithMockUser(roles = "NATIONAL_ADMIN")
        @DisplayName("NATIONAL_ADMIN should be allowed to record sale")
        void recordSale_NationalAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "COUNCIL_ADMIN")
        @DisplayName("COUNCIL_ADMIN should be allowed to record sale")
        void recordSale_CouncilAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "UNIT_LEADER")
        @DisplayName("UNIT_LEADER should be allowed to record sale")
        void recordSale_UnitLeader_Allowed() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "SCOUT")
        @DisplayName("SCOUT should be allowed to record sale")
        void recordSale_Scout_Allowed() throws Exception {
            doNothing().when(scoutService).recordSale(1L, new BigDecimal("100.00"), 10);

            mockMvc.perform(post("/api/v1/scouts/1/record-sale")
                            .param("amount", "100.00")
                            .param("cardsCount", "10"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Authorization Tests - Update Rank")
    class UpdateRankAuthorizationTests {

        @Test
        @WithMockUser(roles = "NATIONAL_ADMIN")
        @DisplayName("NATIONAL_ADMIN should be allowed to update rank")
        void updateRank_NationalAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).updateScoutRank(1L, "TENDERFOOT");

            mockMvc.perform(patch("/api/v1/scouts/1/rank")
                            .param("rank", "TENDERFOOT"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "COUNCIL_ADMIN")
        @DisplayName("COUNCIL_ADMIN should be allowed to update rank")
        void updateRank_CouncilAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).updateScoutRank(1L, "TENDERFOOT");

            mockMvc.perform(patch("/api/v1/scouts/1/rank")
                            .param("rank", "TENDERFOOT"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "UNIT_LEADER")
        @DisplayName("UNIT_LEADER should be allowed to update rank")
        void updateRank_UnitLeader_Allowed() throws Exception {
            doNothing().when(scoutService).updateScoutRank(1L, "TENDERFOOT");

            mockMvc.perform(patch("/api/v1/scouts/1/rank")
                            .param("rank", "TENDERFOOT"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Authorization Tests - Transfer Scout")
    class TransferScoutAuthorizationTests {

        @Test
        @WithMockUser(roles = "NATIONAL_ADMIN")
        @DisplayName("NATIONAL_ADMIN should be allowed to transfer scout")
        void transferScout_NationalAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).transferScout(1L, 200L);

            mockMvc.perform(post("/api/v1/scouts/1/transfer")
                            .param("newTroopId", "200"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "COUNCIL_ADMIN")
        @DisplayName("COUNCIL_ADMIN should be allowed to transfer scout")
        void transferScout_CouncilAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).transferScout(1L, 200L);

            mockMvc.perform(post("/api/v1/scouts/1/transfer")
                            .param("newTroopId", "200"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Authorization Tests - Delete Scout")
    class DeleteScoutAuthorizationTests {

        @Test
        @WithMockUser(roles = "NATIONAL_ADMIN")
        @DisplayName("NATIONAL_ADMIN should be allowed to delete scout")
        void deleteScout_NationalAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).deleteScout(1L);

            mockMvc.perform(delete("/api/v1/scouts/1"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "COUNCIL_ADMIN")
        @DisplayName("COUNCIL_ADMIN should be allowed to delete scout")
        void deleteScout_CouncilAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).deleteScout(1L);

            mockMvc.perform(delete("/api/v1/scouts/1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Authorization Tests - Mark Top Sellers")
    class MarkTopSellersAuthorizationTests {

        @Test
        @WithMockUser(roles = "NATIONAL_ADMIN")
        @DisplayName("NATIONAL_ADMIN should be allowed to mark top sellers")
        void markTopSellers_NationalAdmin_Allowed() throws Exception {
            doNothing().when(scoutService).markTopSellers(10);

            mockMvc.perform(post("/api/v1/scouts/mark-top-sellers")
                            .param("topCount", "10"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Response Fields Validation")
    class ResponseFieldsTests {

        @Test
        @DisplayName("Should return UUID in response")
        void getScout_ReturnsUuid() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.uuid").exists());
        }

        @Test
        @DisplayName("Should return createdAt timestamp")
        void getScout_ReturnsCreatedAt() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.createdAt").exists());
        }

        @Test
        @DisplayName("Should return parent information")
        void getScout_ReturnsParentInfo() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.parentName").value("Jane Smith"))
                    .andExpect(jsonPath("$.parentEmail").value("jane.smith@email.com"))
                    .andExpect(jsonPath("$.parentPhone").value("555-123-4567"));
        }

        @Test
        @DisplayName("Should return sales statistics")
        void getScout_ReturnsSalesStats() throws Exception {
            when(scoutService.getScout(1L)).thenReturn(scoutResponse);

            mockMvc.perform(get("/api/v1/scouts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cardsSold").value(25))
                    .andExpect(jsonPath("$.totalSales").value(250.00))
                    .andExpect(jsonPath("$.commissionEarned").value(25.00))
                    .andExpect(jsonPath("$.goalProgress").value(50.0))
                    .andExpect(jsonPath("$.topSeller").value(false));
        }
    }
}
