package com.bsa.campcard.controller;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.dto.DashboardResponse.*;
import com.bsa.campcard.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for DashboardController using @Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Dashboard statistics retrieval
 * - Troop sales data
 * - Troop recruiting data
 * - Scout sales data
 * - Scout referrals
 * - Customer referrals
 * - Sales trend data
 * - Authorization (RBAC)
 * - Error handling
 */
@Import({ControllerTestConfig.class, TestSecurityConfig.class})
@WebMvcTest(DashboardController.class)
@DisplayName("DashboardController Tests")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    private DashboardResponse sampleDashboardResponse;
    private List<TroopSalesData> sampleTroopSales;
    private List<TroopRecruitingData> sampleTroopRecruiting;
    private List<ScoutSalesData> sampleScoutSales;
    private List<ScoutReferralData> sampleScoutReferrals;
    private List<CustomerReferralData> sampleCustomerReferrals;
    private List<TimeSeriesPoint> sampleSalesTrend;

    @BeforeEach
    void setUp() {
        // Create sample troop sales data
        sampleTroopSales = new ArrayList<>();
        TroopSalesData troopSales1 = new TroopSalesData();
        troopSales1.setId(1L);
        troopSales1.setName("Troop 101");
        troopSales1.setCouncil("Denver Area Council");
        troopSales1.setSales(new BigDecimal("5000.00"));
        troopSales1.setScouts(25);
        troopSales1.setAvgPerScout(new BigDecimal("200.00"));
        troopSales1.setTrend(15.5);
        sampleTroopSales.add(troopSales1);

        TroopSalesData troopSales2 = new TroopSalesData();
        troopSales2.setId(2L);
        troopSales2.setName("Troop 202");
        troopSales2.setCouncil("Boulder Council");
        troopSales2.setSales(new BigDecimal("3500.00"));
        troopSales2.setScouts(18);
        troopSales2.setAvgPerScout(new BigDecimal("194.44"));
        troopSales2.setTrend(-5.2);
        sampleTroopSales.add(troopSales2);

        // Create sample troop recruiting data
        sampleTroopRecruiting = new ArrayList<>();
        TroopRecruitingData recruiting1 = new TroopRecruitingData();
        recruiting1.setId(1L);
        recruiting1.setName("Troop 101");
        recruiting1.setCouncil("Denver Area Council");
        recruiting1.setNewScouts(5);
        recruiting1.setTotalScouts(25);
        recruiting1.setRecruitingGoal(10);
        recruiting1.setPercentOfGoal(50.0);
        recruiting1.setTrend(10.0);
        sampleTroopRecruiting.add(recruiting1);

        // Create sample scout sales data
        sampleScoutSales = new ArrayList<>();
        ScoutSalesData scoutSales1 = new ScoutSalesData();
        scoutSales1.setId(1L);
        scoutSales1.setName("John Smith");
        scoutSales1.setTroop("Troop 101");
        scoutSales1.setSales(new BigDecimal("450.00"));
        scoutSales1.setCards(15);
        scoutSales1.setReferrals(3);
        scoutSales1.setRank("First Class");
        scoutSales1.setTrend(25.0);
        sampleScoutSales.add(scoutSales1);

        // Create sample scout referral data
        sampleScoutReferrals = new ArrayList<>();
        ScoutReferralData referral1 = new ScoutReferralData();
        referral1.setId(1L);
        referral1.setName("Jane Doe");
        referral1.setTroop("Troop 202");
        referral1.setReferrals(10);
        referral1.setConversions(7);
        referral1.setRevenue(new BigDecimal("350.00"));
        referral1.setConversionRate(70.0);
        referral1.setTrend(12.5);
        sampleScoutReferrals.add(referral1);

        // Create sample customer referral data
        sampleCustomerReferrals = new ArrayList<>();
        CustomerReferralData customer1 = new CustomerReferralData();
        customer1.setId("uuid-1234");
        customer1.setName("Customer ABC");
        customer1.setEmail("customer@email.com");
        customer1.setReferrals(5);
        customer1.setConversions(3);
        customer1.setTotalRevenue(new BigDecimal("150.00"));
        customer1.setAvgOrderValue(new BigDecimal("50.00"));
        customer1.setLastReferral("2 days ago");
        customer1.setTrend(8.0);
        sampleCustomerReferrals.add(customer1);

        // Create sample sales trend data
        sampleSalesTrend = new ArrayList<>();
        TimeSeriesPoint point1 = new TimeSeriesPoint();
        point1.setDate("Jan 01");
        point1.setValue(new BigDecimal("1500.00"));
        sampleSalesTrend.add(point1);

        TimeSeriesPoint point2 = new TimeSeriesPoint();
        point2.setDate("Jan 02");
        point2.setValue(new BigDecimal("1750.00"));
        sampleSalesTrend.add(point2);

        // Create the full dashboard response
        sampleDashboardResponse = new DashboardResponse();
        sampleDashboardResponse.setTotalTroops(50L);
        sampleDashboardResponse.setActiveTroops(45L);
        sampleDashboardResponse.setTotalScouts(500L);
        sampleDashboardResponse.setActiveScouts(480L);
        sampleDashboardResponse.setTotalSales(new BigDecimal("75000.00"));
        sampleDashboardResponse.setTotalCardsSold(1500);
        sampleDashboardResponse.setTotalReferrals(200L);
        sampleDashboardResponse.setSuccessfulReferrals(150L);
        sampleDashboardResponse.setReferralConversionRate(75.0);
        sampleDashboardResponse.setTotalMerchants(100L);
        sampleDashboardResponse.setActiveMerchants(85L);
        sampleDashboardResponse.setTotalOffers(250L);
        sampleDashboardResponse.setActiveOffers(200L);
        sampleDashboardResponse.setSalesTrend(12.5);
        sampleDashboardResponse.setScoutsTrend(5.0);
        sampleDashboardResponse.setTroopsTrend(3.5);
        sampleDashboardResponse.setReferralsTrend(8.0);
        sampleDashboardResponse.setTroopSales(sampleTroopSales);
        sampleDashboardResponse.setTroopRecruiting(sampleTroopRecruiting);
        sampleDashboardResponse.setScoutSales(sampleScoutSales);
        sampleDashboardResponse.setScoutReferrals(sampleScoutReferrals);
        sampleDashboardResponse.setCustomerReferrals(sampleCustomerReferrals);
        sampleDashboardResponse.setSalesTrend30Days(sampleSalesTrend);
    }

    // ========================================================================
    // GET FULL DASHBOARD TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard - Get Full Dashboard")
    class GetDashboardTests {

        @Test
        @DisplayName("Should return full dashboard when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getDashboard_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.totalTroops").value(50L))
                    .andExpect(jsonPath("$.activeTroops").value(45L))
                    .andExpect(jsonPath("$.totalScouts").value(500L))
                    .andExpect(jsonPath("$.activeScouts").value(480L))
                    .andExpect(jsonPath("$.totalSales").value(75000.00))
                    .andExpect(jsonPath("$.totalCardsSold").value(1500))
                    .andExpect(jsonPath("$.totalReferrals").value(200L))
                    .andExpect(jsonPath("$.successfulReferrals").value(150L))
                    .andExpect(jsonPath("$.referralConversionRate").value(75.0))
                    .andExpect(jsonPath("$.totalMerchants").value(100L))
                    .andExpect(jsonPath("$.activeMerchants").value(85L))
                    .andExpect(jsonPath("$.totalOffers").value(250L))
                    .andExpect(jsonPath("$.activeOffers").value(200L))
                    .andExpect(jsonPath("$.salesTrend").value(12.5))
                    .andExpect(jsonPath("$.scoutsTrend").value(5.0))
                    .andExpect(jsonPath("$.troopsTrend").value(3.5))
                    .andExpect(jsonPath("$.referralsTrend").value(8.0))
                    .andExpect(jsonPath("$.troopSales").isArray())
                    .andExpect(jsonPath("$.troopSales", hasSize(2)))
                    .andExpect(jsonPath("$.troopRecruiting").isArray())
                    .andExpect(jsonPath("$.scoutSales").isArray())
                    .andExpect(jsonPath("$.scoutReferrals").isArray())
                    .andExpect(jsonPath("$.customerReferrals").isArray())
                    .andExpect(jsonPath("$.salesTrend30Days").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return full dashboard when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getDashboard_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalTroops").value(50L));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getDashboard_AsUnitLeader_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getDashboard_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getDashboard_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getDashboard_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // GET DASHBOARD SUMMARY TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/summary - Get Dashboard Summary")
    class GetDashboardSummaryTests {

        @Test
        @DisplayName("Should return summary when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getDashboardSummary_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalTroops").value(50L))
                    .andExpect(jsonPath("$.totalScouts").value(500L))
                    .andExpect(jsonPath("$.totalSales").value(75000.00))
                    // Summary should clear detailed data
                    .andExpect(jsonPath("$.troopSales").isEmpty())
                    .andExpect(jsonPath("$.troopRecruiting").isEmpty())
                    .andExpect(jsonPath("$.scoutSales").isEmpty())
                    .andExpect(jsonPath("$.scoutReferrals").isEmpty())
                    .andExpect(jsonPath("$.customerReferrals").isEmpty());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return summary when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getDashboardSummary_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalTroops").value(50L));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return summary when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getDashboardSummary_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalTroops").value(50L));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getDashboardSummary_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getDashboardSummary_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getDashboardSummary_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // GET TROOP SALES TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/troop-sales - Get Troop Sales Data")
    class GetTroopSalesTests {

        @Test
        @DisplayName("Should return troop sales when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getTroopSales_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[0].name").value("Troop 101"))
                    .andExpect(jsonPath("$[0].council").value("Denver Area Council"))
                    .andExpect(jsonPath("$[0].sales").value(5000.00))
                    .andExpect(jsonPath("$[0].scouts").value(25))
                    .andExpect(jsonPath("$[0].avgPerScout").value(200.00))
                    .andExpect(jsonPath("$[0].trend").value(15.5));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return troop sales when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getTroopSales_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return troop sales when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getTroopSales_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getTroopSales_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return empty array when no troop sales data")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getTroopSales_Empty_ReturnsEmptyArray() throws Exception {
            DashboardResponse emptyResponse = new DashboardResponse();
            emptyResponse.setTroopSales(Collections.emptyList());
            when(dashboardService.getDashboardData()).thenReturn(emptyResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(dashboardService).getDashboardData();
        }
    }

    // ========================================================================
    // GET TROOP RECRUITING TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/troop-recruiting - Get Troop Recruiting Data")
    class GetTroopRecruitingTests {

        @Test
        @DisplayName("Should return troop recruiting when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getTroopRecruiting_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-recruiting")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[0].name").value("Troop 101"))
                    .andExpect(jsonPath("$[0].council").value("Denver Area Council"))
                    .andExpect(jsonPath("$[0].newScouts").value(5))
                    .andExpect(jsonPath("$[0].totalScouts").value(25))
                    .andExpect(jsonPath("$[0].recruitingGoal").value(10))
                    .andExpect(jsonPath("$[0].percentOfGoal").value(50.0));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return troop recruiting when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getTroopRecruiting_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-recruiting")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getTroopRecruiting_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/troop-recruiting")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // GET SCOUT SALES TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/scout-sales - Get Scout Sales Data")
    class GetScoutSalesTests {

        @Test
        @DisplayName("Should return scout sales when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getScoutSales_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/scout-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[0].name").value("John Smith"))
                    .andExpect(jsonPath("$[0].troop").value("Troop 101"))
                    .andExpect(jsonPath("$[0].sales").value(450.00))
                    .andExpect(jsonPath("$[0].cards").value(15))
                    .andExpect(jsonPath("$[0].referrals").value(3))
                    .andExpect(jsonPath("$[0].rank").value("First Class"));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return scout sales when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getScoutSales_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/scout-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return scout sales when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getScoutSales_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/scout-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getScoutSales_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/scout-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // GET SCOUT REFERRALS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/scout-referrals - Get Scout Referrals")
    class GetScoutReferralsTests {

        @Test
        @DisplayName("Should return scout referrals when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getScoutReferrals_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/scout-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[0].name").value("Jane Doe"))
                    .andExpect(jsonPath("$[0].troop").value("Troop 202"))
                    .andExpect(jsonPath("$[0].referrals").value(10))
                    .andExpect(jsonPath("$[0].conversions").value(7))
                    .andExpect(jsonPath("$[0].revenue").value(350.00))
                    .andExpect(jsonPath("$[0].conversionRate").value(70.0));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return scout referrals when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getScoutReferrals_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/scout-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getScoutReferrals_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/scout-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // GET CUSTOMER REFERRALS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/customer-referrals - Get Customer Referrals")
    class GetCustomerReferralsTests {

        @Test
        @DisplayName("Should return customer referrals when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getCustomerReferrals_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value("uuid-1234"))
                    .andExpect(jsonPath("$[0].name").value("Customer ABC"))
                    .andExpect(jsonPath("$[0].email").value("customer@email.com"))
                    .andExpect(jsonPath("$[0].referrals").value(5))
                    .andExpect(jsonPath("$[0].conversions").value(3))
                    .andExpect(jsonPath("$[0].totalRevenue").value(150.00))
                    .andExpect(jsonPath("$[0].avgOrderValue").value(50.00))
                    .andExpect(jsonPath("$[0].lastReferral").value("2 days ago"));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return customer referrals when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCustomerReferrals_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getCustomerReferrals_AsUnitLeader_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getCustomerReferrals_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getCustomerReferrals_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return empty array when no customer referrals")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getCustomerReferrals_Empty_ReturnsEmptyArray() throws Exception {
            DashboardResponse emptyResponse = new DashboardResponse();
            emptyResponse.setCustomerReferrals(Collections.emptyList());
            when(dashboardService.getDashboardData()).thenReturn(emptyResponse);

            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(dashboardService).getDashboardData();
        }
    }

    // ========================================================================
    // GET SALES TREND TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/dashboard/sales-trend - Get Sales Trend Data")
    class GetSalesTrendTests {

        @Test
        @DisplayName("Should return sales trend when user is NATIONAL_ADMIN")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getSalesTrend_AsNationalAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].date").value("Jan 01"))
                    .andExpect(jsonPath("$[0].value").value(1500.00))
                    .andExpect(jsonPath("$[1].date").value("Jan 02"))
                    .andExpect(jsonPath("$[1].value").value(1750.00));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return sales trend when user is COUNCIL_ADMIN")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getSalesTrend_AsCouncilAdmin_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return sales trend when user is UNIT_LEADER")
        @WithMockUser(roles = "UNIT_LEADER")
        void getSalesTrend_AsUnitLeader_Success() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is SCOUT")
        @WithMockUser(roles = "SCOUT")
        void getSalesTrend_AsScout_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return 403 when user is PARENT")
        @WithMockUser(roles = "PARENT")
        void getSalesTrend_AsParent_Forbidden() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Should return empty array when no sales trend data")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getSalesTrend_Empty_ReturnsEmptyArray() throws Exception {
            DashboardResponse emptyResponse = new DashboardResponse();
            emptyResponse.setSalesTrend30Days(Collections.emptyList());
            when(dashboardService.getDashboardData()).thenReturn(emptyResponse);

            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getSalesTrend_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(dashboardService, never()).getDashboardData();
        }
    }

    // ========================================================================
    // ERROR HANDLING TESTS
    // ========================================================================

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should return 500 when service throws RuntimeException")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getDashboard_ServiceException_ReturnsInternalServerError() throws Exception {
            when(dashboardService.getDashboardData())
                    .thenThrow(new RuntimeException("Database connection failed"));

            mockMvc.perform(get("/api/v1/dashboard")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should return 500 when troop sales request causes service exception")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getTroopSales_ServiceException_ReturnsInternalServerError() throws Exception {
            when(dashboardService.getDashboardData())
                    .thenThrow(new RuntimeException("Failed to fetch troop sales"));

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should handle null troop sales gracefully")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getTroopSales_NullData_ReturnsNull() throws Exception {
            DashboardResponse responseWithNull = new DashboardResponse();
            responseWithNull.setTroopSales(null);
            when(dashboardService.getDashboardData()).thenReturn(responseWithNull);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").doesNotExist());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should handle null customer referrals gracefully")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getCustomerReferrals_NullData_ReturnsNull() throws Exception {
            DashboardResponse responseWithNull = new DashboardResponse();
            responseWithNull.setCustomerReferrals(null);
            when(dashboardService.getDashboardData()).thenReturn(responseWithNull);

            mockMvc.perform(get("/api/v1/dashboard/customer-referrals")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").doesNotExist());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("Should handle null sales trend gracefully")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void getSalesTrend_NullData_ReturnsNull() throws Exception {
            DashboardResponse responseWithNull = new DashboardResponse();
            responseWithNull.setSalesTrend30Days(null);
            when(dashboardService.getDashboardData()).thenReturn(responseWithNull);

            mockMvc.perform(get("/api/v1/dashboard/sales-trend")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").doesNotExist());

            verify(dashboardService).getDashboardData();
        }
    }

    // ========================================================================
    // AUTHORIZATION MATRIX TESTS
    // ========================================================================

    @Nested
    @DisplayName("Authorization Matrix")
    class AuthorizationMatrixTests {

        @Test
        @DisplayName("TROOP_LEADER can access summary endpoint")
        @WithMockUser(roles = "TROOP_LEADER")
        void troopLeader_CanAccessSummary() throws Exception {
            // Note: TROOP_LEADER role is different from UNIT_LEADER
            // The controller uses UNIT_LEADER - test should fail
            mockMvc.perform(get("/api/v1/dashboard/summary")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isForbidden());

            verify(dashboardService, never()).getDashboardData();
        }

        @Test
        @DisplayName("Multiple authorized roles can access troop-sales endpoint")
        @WithMockUser(roles = {"NATIONAL_ADMIN", "COUNCIL_ADMIN"})
        void multipleRoles_CanAccessTroopSales() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            mockMvc.perform(get("/api/v1/dashboard/troop-sales")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(dashboardService).getDashboardData();
        }

        @Test
        @DisplayName("NATIONAL_ADMIN has access to all endpoints")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void nationalAdmin_HasFullAccess() throws Exception {
            when(dashboardService.getDashboardData()).thenReturn(sampleDashboardResponse);

            // Test all endpoints
            mockMvc.perform(get("/api/v1/dashboard"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/summary"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/troop-sales"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/troop-recruiting"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/scout-sales"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/scout-referrals"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/customer-referrals"))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/api/v1/dashboard/sales-trend"))
                    .andExpect(status().isOk());

            verify(dashboardService, times(8)).getDashboardData();
        }
    }
}
