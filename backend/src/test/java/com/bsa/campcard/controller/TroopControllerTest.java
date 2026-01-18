package com.bsa.campcard.controller;

import com.bsa.campcard.dto.CreateTroopRequest;
import com.bsa.campcard.dto.TroopResponse;
import com.bsa.campcard.service.TroopService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
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
import org.springframework.context.annotation.Import;

/**
 * Unit tests for TroopController REST API endpoints.
 *
 * Uses @WebMvcTest to test the controller layer in isolation with MockMvc.
 * TroopService is mocked to test only controller behavior.
 *
 * Test categories:
 * - CRUD operations (create, read, update, delete)
 * - Search and filtering
 * - Council-specific troop queries
 * - Top performing troops
 * - Statistics updates
 * - Authorization tests
 * - Not found scenarios
 * - Pagination
 */
@WebMvcTest(value = TroopController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("TroopController Tests")
class TroopControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TroopService troopService;

    private CreateTroopRequest createRequest;
    private TroopResponse troopResponse;
    private UUID testScoutmasterId;
    private Long testCouncilId;

    @BeforeEach
    void setUp() {
        testScoutmasterId = UUID.randomUUID();
        testCouncilId = 100L;

        // Create request using setters (DTOs use @Data)
        createRequest = new CreateTroopRequest();
        createRequest.setTroopNumber("123");
        createRequest.setCouncilId(testCouncilId);
        createRequest.setTroopName("Troop 123 - Eagles");
        createRequest.setTroopType("SCOUTS_BSA");
        createRequest.setCharterOrganization("First Methodist Church");
        createRequest.setMeetingLocation("123 Main St, Dallas, TX");
        createRequest.setMeetingDay("Monday");
        createRequest.setMeetingTime("7:00 PM");
        createRequest.setScoutmasterId(testScoutmasterId);
        createRequest.setScoutmasterName("John Smith");
        createRequest.setScoutmasterEmail("john.smith@email.com");
        createRequest.setScoutmasterPhone("555-123-4567");
        createRequest.setGoalAmount(new BigDecimal("5000.00"));

        // Create response using setters (DTOs use @Data)
        troopResponse = new TroopResponse();
        troopResponse.setId(1L);
        troopResponse.setUuid(UUID.randomUUID());
        troopResponse.setTroopNumber("123");
        troopResponse.setCouncilId(testCouncilId);
        troopResponse.setTroopName("Troop 123 - Eagles");
        troopResponse.setTroopType("SCOUTS_BSA");
        troopResponse.setCharterOrganization("First Methodist Church");
        troopResponse.setMeetingLocation("123 Main St, Dallas, TX");
        troopResponse.setMeetingDay("Monday");
        troopResponse.setMeetingTime("7:00 PM");
        troopResponse.setScoutmasterId(testScoutmasterId);
        troopResponse.setScoutmasterName("John Smith");
        troopResponse.setScoutmasterEmail("john.smith@email.com");
        troopResponse.setScoutmasterPhone("555-123-4567");
        troopResponse.setTotalScouts(15);
        troopResponse.setActiveScouts(12);
        troopResponse.setTotalSales(new BigDecimal("2500.00"));
        troopResponse.setCardsSold(125);
        troopResponse.setGoalAmount(new BigDecimal("5000.00"));
        troopResponse.setGoalProgress(50.0);
        troopResponse.setAverageSalesPerScout(new BigDecimal("208.33"));
        troopResponse.setStatus("ACTIVE");
        troopResponse.setCreatedAt(LocalDateTime.now());
    }

    // Helper method to create TroopResponse with specific values
    private TroopResponse createTroopResponse(Long id, String troopNumber, Long councilId,
                                               BigDecimal totalSales, int cardsSold) {
        TroopResponse response = new TroopResponse();
        response.setId(id);
        response.setUuid(UUID.randomUUID());
        response.setTroopNumber(troopNumber);
        response.setCouncilId(councilId);
        response.setTroopName("Troop " + troopNumber);
        response.setTroopType("SCOUTS_BSA");
        response.setTotalSales(totalSales);
        response.setCardsSold(cardsSold);
        response.setStatus("ACTIVE");
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    @Nested
    @DisplayName("POST /api/v1/troops - Create Troop")
    class CreateTroopTests {

        @Test
        @DisplayName("Should create troop successfully")
        void createTroop_Success() throws Exception {
            when(troopService.createTroop(any(CreateTroopRequest.class))).thenReturn(troopResponse);

            mockMvc.perform(post("/api/v1/troops")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.troopNumber").value("123"))
                    .andExpect(jsonPath("$.troopName").value("Troop 123 - Eagles"))
                    .andExpect(jsonPath("$.troopType").value("SCOUTS_BSA"))
                    .andExpect(jsonPath("$.councilId").value(testCouncilId))
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(troopService).createTroop(any(CreateTroopRequest.class));
        }

        @Test
        @DisplayName("Should return created troop with all fields populated")
        void createTroop_ReturnsAllFields() throws Exception {
            when(troopService.createTroop(any(CreateTroopRequest.class))).thenReturn(troopResponse);

            mockMvc.perform(post("/api/v1/troops")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.charterOrganization").value("First Methodist Church"))
                    .andExpect(jsonPath("$.meetingLocation").value("123 Main St, Dallas, TX"))
                    .andExpect(jsonPath("$.meetingDay").value("Monday"))
                    .andExpect(jsonPath("$.meetingTime").value("7:00 PM"))
                    .andExpect(jsonPath("$.scoutmasterName").value("John Smith"))
                    .andExpect(jsonPath("$.scoutmasterEmail").value("john.smith@email.com"))
                    .andExpect(jsonPath("$.scoutmasterPhone").value("555-123-4567"));
        }

        @Test
        @DisplayName("Should return error when troop number already exists")
        void createTroop_DuplicateTroopNumber() throws Exception {
            when(troopService.createTroop(any(CreateTroopRequest.class)))
                    .thenThrow(new IllegalArgumentException("Troop number already exists"));

            mockMvc.perform(post("/api/v1/troops")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/troops/{id} - Update Troop")
    class UpdateTroopTests {

        @Test
        @DisplayName("Should update troop successfully")
        void updateTroop_Success() throws Exception {
            CreateTroopRequest updateRequest = new CreateTroopRequest();
            updateRequest.setTroopName("Updated Troop Name");
            updateRequest.setMeetingDay("Tuesday");

            TroopResponse updatedResponse = new TroopResponse();
            updatedResponse.setId(1L);
            updatedResponse.setTroopNumber("123");
            updatedResponse.setTroopName("Updated Troop Name");
            updatedResponse.setMeetingDay("Tuesday");
            updatedResponse.setStatus("ACTIVE");

            when(troopService.updateTroop(eq(1L), any(CreateTroopRequest.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/v1/troops/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopName").value("Updated Troop Name"))
                    .andExpect(jsonPath("$.meetingDay").value("Tuesday"));

            verify(troopService).updateTroop(eq(1L), any(CreateTroopRequest.class));
        }

        @Test
        @DisplayName("Should return error when updating non-existent troop")
        void updateTroop_NotFound() throws Exception {
            when(troopService.updateTroop(eq(999L), any(CreateTroopRequest.class)))
                    .thenThrow(new IllegalArgumentException("Troop not found"));

            mockMvc.perform(put("/api/v1/troops/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should update troop with partial data")
        void updateTroop_PartialUpdate() throws Exception {
            CreateTroopRequest partialRequest = new CreateTroopRequest();
            partialRequest.setGoalAmount(new BigDecimal("7500.00"));

            TroopResponse updatedResponse = new TroopResponse();
            updatedResponse.setId(1L);
            updatedResponse.setTroopNumber("123");
            updatedResponse.setTroopName("Troop 123 - Eagles");
            updatedResponse.setGoalAmount(new BigDecimal("7500.00"));

            when(troopService.updateTroop(eq(1L), any(CreateTroopRequest.class))).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/v1/troops/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(partialRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.goalAmount").value(7500.00));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops/{id} - Get Troop by ID")
    class GetTroopByIdTests {

        @Test
        @DisplayName("Should return troop when found by ID")
        void getTroop_Found() throws Exception {
            when(troopService.getTroop(1L)).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.troopNumber").value("123"))
                    .andExpect(jsonPath("$.troopName").value("Troop 123 - Eagles"))
                    .andExpect(jsonPath("$.councilId").value(testCouncilId))
                    .andExpect(jsonPath("$.totalScouts").value(15))
                    .andExpect(jsonPath("$.activeScouts").value(12))
                    .andExpect(jsonPath("$.totalSales").value(2500.00))
                    .andExpect(jsonPath("$.cardsSold").value(125))
                    .andExpect(jsonPath("$.goalProgress").value(50.0));

            verify(troopService).getTroop(1L);
        }

        @Test
        @DisplayName("Should return error when troop not found by ID")
        void getTroop_NotFound() throws Exception {
            when(troopService.getTroop(999L)).thenThrow(new IllegalArgumentException("Troop not found"));

            mockMvc.perform(get("/api/v1/troops/999"))
                    .andExpect(status().isBadRequest());

            verify(troopService).getTroop(999L);
        }

        @Test
        @DisplayName("Should return all troop statistics")
        void getTroop_ReturnsStatistics() throws Exception {
            when(troopService.getTroop(1L)).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.averageSalesPerScout").value(208.33))
                    .andExpect(jsonPath("$.goalProgress").value(50.0))
                    .andExpect(jsonPath("$.goalAmount").value(5000.00));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops/number/{troopNumber} - Get Troop by Number")
    class GetTroopByNumberTests {

        @Test
        @DisplayName("Should return troop when found by number")
        void getTroopByNumber_Found() throws Exception {
            when(troopService.getTroopByNumber("123")).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/number/123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopNumber").value("123"))
                    .andExpect(jsonPath("$.troopName").value("Troop 123 - Eagles"));

            verify(troopService).getTroopByNumber("123");
        }

        @Test
        @DisplayName("Should return error when troop number not found")
        void getTroopByNumber_NotFound() throws Exception {
            when(troopService.getTroopByNumber("999")).thenThrow(new IllegalArgumentException("Troop not found"));

            mockMvc.perform(get("/api/v1/troops/number/999"))
                    .andExpect(status().isBadRequest());

            verify(troopService).getTroopByNumber("999");
        }

        @Test
        @DisplayName("Should handle alphanumeric troop numbers")
        void getTroopByNumber_AlphanumericNumber() throws Exception {
            TroopResponse alphaResponse = createTroopResponse(2L, "123A", testCouncilId, new BigDecimal("1000"), 50);
            when(troopService.getTroopByNumber("123A")).thenReturn(alphaResponse);

            mockMvc.perform(get("/api/v1/troops/number/123A"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.troopNumber").value("123A"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops - Get All Troops with Pagination")
    class GetTroopsTests {

        @Test
        @DisplayName("Should return all troops with default pagination")
        void getTroops_DefaultPagination() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].troopNumber").value("123"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(troopService).getAllTroops(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return troops with custom pagination")
        void getTroops_CustomPagination() throws Exception {
            TroopResponse troop2 = createTroopResponse(2L, "456", testCouncilId, new BigDecimal("1000"), 50);
            Page<TroopResponse> troopPage = new PageImpl<>(
                    List.of(troopResponse, troop2),
                    PageRequest.of(0, 10, Sort.by("troopNumber")),
                    2
            );
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("page", "0")
                            .param("size", "10")
                            .param("sortBy", "troopNumber")
                            .param("sortDir", "ASC"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.totalElements").value(2));

            verify(troopService).getAllTroops(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no troops exist")
        void getTroops_EmptyPage() throws Exception {
            Page<TroopResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/troops"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @DisplayName("Should handle second page request")
        void getTroops_SecondPage() throws Exception {
            TroopResponse troop2 = createTroopResponse(2L, "456", testCouncilId, new BigDecimal("1500"), 75);
            Page<TroopResponse> secondPage = new PageImpl<>(
                    List.of(troop2),
                    PageRequest.of(1, 1),
                    2
            );
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(secondPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("page", "1")
                            .param("size", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(1))
                    .andExpect(jsonPath("$.totalElements").value(2))
                    .andExpect(jsonPath("$.totalPages").value(2))
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("Should handle descending sort direction")
        void getTroops_DescendingSort() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("sortBy", "totalSales")
                            .param("sortDir", "DESC"))
                    .andExpect(status().isOk());

            verify(troopService).getAllTroops(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops - Search Troops")
    class SearchTroopsTests {

        @Test
        @DisplayName("Should search troops by query")
        void searchTroops_WithQuery() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.searchTroops(eq("Eagles"), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("search", "Eagles"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].troopName").value("Troop 123 - Eagles"));

            verify(troopService).searchTroops(eq("Eagles"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty results when search has no matches")
        void searchTroops_NoMatches() throws Exception {
            Page<TroopResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(troopService.searchTroops(eq("NonExistent"), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("search", "NonExistent"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(troopService).searchTroops(eq("NonExistent"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search by troop number")
        void searchTroops_ByTroopNumber() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.searchTroops(eq("123"), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("search", "123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].troopNumber").value("123"));

            verify(troopService).searchTroops(eq("123"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search by charter organization")
        void searchTroops_ByCharterOrganization() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.searchTroops(eq("Methodist"), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("search", "Methodist"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].charterOrganization").value("First Methodist Church"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops - Filter by Council")
    class GetTroopsByCouncilTests {

        @Test
        @DisplayName("Should filter troops by council ID using query parameter")
        void getTroops_ByCouncilId() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getTroopsByCouncil(eq(testCouncilId), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("councilId", String.valueOf(testCouncilId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].councilId").value(testCouncilId));

            verify(troopService).getTroopsByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty when council has no troops")
        void getTroops_ByCouncilId_Empty() throws Exception {
            Page<TroopResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(troopService.getTroopsByCouncil(eq(999L), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("councilId", "999"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops/council/{councilId} - Get Troops by Council Path")
    class GetTroopsByCouncilPathTests {

        @Test
        @DisplayName("Should return troops for council with default pagination")
        void getTroopsByCouncil_Success() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getTroopsByCouncil(eq(testCouncilId), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops/council/{councilId}", testCouncilId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].councilId").value(testCouncilId));

            verify(troopService).getTroopsByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return troops with custom pagination parameters")
        void getTroopsByCouncil_CustomPagination() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(1, 5), 6);
            when(troopService.getTroopsByCouncil(eq(testCouncilId), any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops/council/{councilId}", testCouncilId)
                            .param("page", "1")
                            .param("size", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(1))
                    .andExpect(jsonPath("$.size").value(5));

            verify(troopService).getTroopsByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page for council with no troops")
        void getTroopsByCouncil_NoTroops() throws Exception {
            Page<TroopResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(troopService.getTroopsByCouncil(eq(999L), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/troops/council/999"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops/top-performers - Top Performing Troops")
    class GetTopPerformingTroopsTests {

        @Test
        @DisplayName("Should return top performing troops globally")
        void getTopPerformingTroops_Global() throws Exception {
            TroopResponse topTroop = createTroopResponse(2L, "456", testCouncilId, new BigDecimal("10000"), 500);
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(topTroop, troopResponse), PageRequest.of(0, 20), 2);
            when(troopService.getTopPerformingTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops/top-performers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].totalSales").value(10000.00));

            verify(troopService).getTopPerformingTroops(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return top performing troops by council")
        void getTopPerformingTroops_ByCouncil() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getTopPerformingTroopsByCouncil(eq(testCouncilId), any(Pageable.class)))
                    .thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops/top-performers")
                            .param("councilId", String.valueOf(testCouncilId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].councilId").value(testCouncilId));

            verify(troopService).getTopPerformingTroopsByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return limited results based on page size")
        void getTopPerformingTroops_LimitedResults() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 5), 10);
            when(troopService.getTopPerformingTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops/top-performers")
                            .param("size", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.totalElements").value(10))
                    .andExpect(jsonPath("$.size").value(5));
        }

        @Test
        @DisplayName("Should return empty when no troops exist")
        void getTopPerformingTroops_Empty() throws Exception {
            Page<TroopResponse> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 20), 0);
            when(troopService.getTopPerformingTroops(any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/troops/top-performers"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/troops - Top Performers Flag")
    class GetTroopsTopPerformersTests {

        @Test
        @DisplayName("Should return top performers when flag is true")
        void getTroops_TopPerformersFlag() throws Exception {
            TroopResponse topTroop = createTroopResponse(2L, "456", testCouncilId, new BigDecimal("15000"), 750);
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(topTroop, troopResponse), PageRequest.of(0, 20), 2);
            when(troopService.getTopPerformingTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("topPerformers", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)));

            verify(troopService).getTopPerformingTroops(any(Pageable.class));
        }

        @Test
        @DisplayName("Should return top performers by council when flag and councilId are provided")
        void getTroops_TopPerformersWithCouncil() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getTopPerformingTroopsByCouncil(eq(testCouncilId), any(Pageable.class)))
                    .thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("topPerformers", "true")
                            .param("councilId", String.valueOf(testCouncilId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));

            verify(troopService).getTopPerformingTroopsByCouncil(eq(testCouncilId), any(Pageable.class));
        }

        @Test
        @DisplayName("Should not use top performers when flag is false")
        void getTroops_TopPerformersFlagFalse() throws Exception {
            Page<TroopResponse> troopPage = new PageImpl<>(List.of(troopResponse), PageRequest.of(0, 20), 1);
            when(troopService.getAllTroops(any(Pageable.class))).thenReturn(troopPage);

            mockMvc.perform(get("/api/v1/troops")
                            .param("topPerformers", "false"))
                    .andExpect(status().isOk());

            verify(troopService).getAllTroops(any(Pageable.class));
            verify(troopService, never()).getTopPerformingTroops(any());
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/troops/{id}/status - Update Troop Status")
    class UpdateTroopStatusTests {

        @Test
        @DisplayName("Should update troop status to INACTIVE")
        void updateTroopStatus_ToInactive() throws Exception {
            doNothing().when(troopService).updateTroopStatus(1L, "INACTIVE");

            mockMvc.perform(patch("/api/v1/troops/1/status")
                            .param("status", "INACTIVE"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStatus(1L, "INACTIVE");
        }

        @Test
        @DisplayName("Should update troop status to SUSPENDED")
        void updateTroopStatus_ToSuspended() throws Exception {
            doNothing().when(troopService).updateTroopStatus(1L, "SUSPENDED");

            mockMvc.perform(patch("/api/v1/troops/1/status")
                            .param("status", "SUSPENDED"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStatus(1L, "SUSPENDED");
        }

        @Test
        @DisplayName("Should update troop status to ARCHIVED")
        void updateTroopStatus_ToArchived() throws Exception {
            doNothing().when(troopService).updateTroopStatus(1L, "ARCHIVED");

            mockMvc.perform(patch("/api/v1/troops/1/status")
                            .param("status", "ARCHIVED"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStatus(1L, "ARCHIVED");
        }

        @Test
        @DisplayName("Should reactivate troop")
        void updateTroopStatus_Reactivate() throws Exception {
            doNothing().when(troopService).updateTroopStatus(1L, "ACTIVE");

            mockMvc.perform(patch("/api/v1/troops/1/status")
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStatus(1L, "ACTIVE");
        }

        @Test
        @DisplayName("Should return error when troop not found")
        void updateTroopStatus_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Troop not found"))
                    .when(troopService).updateTroopStatus(999L, "INACTIVE");

            mockMvc.perform(patch("/api/v1/troops/999/status")
                            .param("status", "INACTIVE"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return error for invalid status value")
        void updateTroopStatus_InvalidStatus() throws Exception {
            doThrow(new IllegalArgumentException("Invalid status"))
                    .when(troopService).updateTroopStatus(1L, "INVALID_STATUS");

            mockMvc.perform(patch("/api/v1/troops/1/status")
                            .param("status", "INVALID_STATUS"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/troops/{id}/update-stats - Update Troop Statistics")
    class UpdateTroopStatsTests {

        @Test
        @DisplayName("Should update troop statistics successfully")
        void updateTroopStats_Success() throws Exception {
            doNothing().when(troopService).updateTroopStats(1L);

            mockMvc.perform(post("/api/v1/troops/1/update-stats"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStats(1L);
        }

        @Test
        @DisplayName("Should return error when troop not found")
        void updateTroopStats_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Troop not found"))
                    .when(troopService).updateTroopStats(999L);

            mockMvc.perform(post("/api/v1/troops/999/update-stats"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should call service method with correct troop ID")
        void updateTroopStats_CorrectId() throws Exception {
            doNothing().when(troopService).updateTroopStats(42L);

            mockMvc.perform(post("/api/v1/troops/42/update-stats"))
                    .andExpect(status().isOk());

            verify(troopService).updateTroopStats(42L);
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/troops/{id} - Delete Troop")
    class DeleteTroopTests {

        @Test
        @DisplayName("Should delete troop successfully")
        void deleteTroop_Success() throws Exception {
            doNothing().when(troopService).deleteTroop(1L);

            mockMvc.perform(delete("/api/v1/troops/1"))
                    .andExpect(status().isOk());

            verify(troopService).deleteTroop(1L);
        }

        @Test
        @DisplayName("Should return error when troop not found")
        void deleteTroop_NotFound() throws Exception {
            doThrow(new IllegalArgumentException("Troop not found"))
                    .when(troopService).deleteTroop(999L);

            mockMvc.perform(delete("/api/v1/troops/999"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return error when troop has active scouts")
        void deleteTroop_WithActiveScouts() throws Exception {
            doThrow(new IllegalStateException("Cannot delete troop with active scouts"))
                    .when(troopService).deleteTroop(1L);

            mockMvc.perform(delete("/api/v1/troops/1"))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should call service method with correct troop ID")
        void deleteTroop_CorrectId() throws Exception {
            doNothing().when(troopService).deleteTroop(42L);

            mockMvc.perform(delete("/api/v1/troops/42"))
                    .andExpect(status().isOk());

            verify(troopService).deleteTroop(42L);
        }
    }

    @Nested
    @DisplayName("Response Fields Validation")
    class ResponseFieldsTests {

        @Test
        @DisplayName("Should return UUID in response")
        void getTroop_ReturnsUuid() throws Exception {
            when(troopService.getTroop(1L)).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.uuid").exists());
        }

        @Test
        @DisplayName("Should return createdAt timestamp")
        void getTroop_ReturnsCreatedAt() throws Exception {
            when(troopService.getTroop(1L)).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.createdAt").exists());
        }

        @Test
        @DisplayName("Should return scoutmaster information")
        void getTroop_ReturnsScoutmasterInfo() throws Exception {
            when(troopService.getTroop(1L)).thenReturn(troopResponse);

            mockMvc.perform(get("/api/v1/troops/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.scoutmasterId").exists())
                    .andExpect(jsonPath("$.scoutmasterName").value("John Smith"))
                    .andExpect(jsonPath("$.scoutmasterEmail").value("john.smith@email.com"))
                    .andExpect(jsonPath("$.scoutmasterPhone").value("555-123-4567"));
        }
    }
}
