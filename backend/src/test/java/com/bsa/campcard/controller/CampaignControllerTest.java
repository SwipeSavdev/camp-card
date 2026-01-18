package com.bsa.campcard.controller;

import com.bsa.campcard.dto.CampaignDTO;
import com.bsa.campcard.dto.SavedCampaignDTO;
import com.bsa.campcard.dto.ai.*;
import com.bsa.campcard.entity.MarketingCampaign.CampaignStatus;
import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
import com.bsa.campcard.entity.MarketingSegment;
import com.bsa.campcard.entity.SavedCampaign.SaveType;
import com.bsa.campcard.service.MarketingCampaignService;
import com.bsa.campcard.service.ai.AIMarketingAgentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
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

import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for CampaignController using @Import(TestSecurityConfig.class)
@WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Campaign CRUD operations
 * - Saved campaigns (drafts/templates)
 * - AI content generation
 * - Segment management
 * - Authorization
 * - Input validation
 * - Error handling
 */
@Import(TestSecurityConfig.class)
@WebMvcTest(CampaignController.class)
@DisplayName("CampaignController Tests")
class CampaignControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MarketingCampaignService campaignService;

    @MockBean
    private AIMarketingAgentService aiAgentService;

    private CampaignDTO validCampaignDTO;
    private CampaignDTO sampleCampaignResponse;
    private SavedCampaignDTO validSavedCampaignDTO;
    private SavedCampaignDTO sampleSavedCampaignResponse;
    private UUID testUuid;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUuid = UUID.randomUUID();
        testUserId = UUID.randomUUID();

        // Create a valid campaign request using setters (DTOs use @Data)
        validCampaignDTO = new CampaignDTO();
        validCampaignDTO.setName("Summer Camp Sale");
        validCampaignDTO.setDescription("Promote summer camp card sales");
        validCampaignDTO.setCampaignType(CampaignType.SEASONAL);
        validCampaignDTO.setStatus(CampaignStatus.DRAFT);
        validCampaignDTO.setSubjectLine("Don't miss our summer deals!");
        validCampaignDTO.setContentText("Get amazing discounts on camp cards this summer.");
        validCampaignDTO.setSegmentId(1L);
        validCampaignDTO.setChannels(new String[]{"EMAIL", "PUSH"});
        validCampaignDTO.setEstimatedReach(5000);
        validCampaignDTO.setEnableGeofencing(false);
        validCampaignDTO.setEnableGamification(true);
        validCampaignDTO.setEnableAiOptimization(true);

        // Create a sample response
        sampleCampaignResponse = new CampaignDTO();
        sampleCampaignResponse.setId(1L);
        sampleCampaignResponse.setUuid(testUuid);
        sampleCampaignResponse.setName("Summer Camp Sale");
        sampleCampaignResponse.setDescription("Promote summer camp card sales");
        sampleCampaignResponse.setCampaignType(CampaignType.SEASONAL);
        sampleCampaignResponse.setStatus(CampaignStatus.DRAFT);
        sampleCampaignResponse.setSubjectLine("Don't miss our summer deals!");
        sampleCampaignResponse.setContentText("Get amazing discounts on camp cards this summer.");
        sampleCampaignResponse.setSegmentId(1L);
        sampleCampaignResponse.setSegmentName("Active Scouts");
        sampleCampaignResponse.setChannels(new String[]{"EMAIL", "PUSH"});
        sampleCampaignResponse.setEstimatedReach(5000);
        sampleCampaignResponse.setMessagesSent(0);
        sampleCampaignResponse.setMessagesDelivered(0);
        sampleCampaignResponse.setOpens(0);
        sampleCampaignResponse.setClicks(0);
        sampleCampaignResponse.setConversions(0);
        sampleCampaignResponse.setCreatedBy(testUserId);
        sampleCampaignResponse.setCreatedAt(LocalDateTime.now());
        sampleCampaignResponse.setUpdatedAt(LocalDateTime.now());

        // Create a valid saved campaign request
        validSavedCampaignDTO = new SavedCampaignDTO();
        validSavedCampaignDTO.setName("My Campaign Template");
        validSavedCampaignDTO.setDescription("Template for weekly campaigns");
        Map<String, Object> config = new HashMap<>();
        config.put("campaignType", "SEASONAL");
        config.put("channels", Arrays.asList("EMAIL", "PUSH"));
        validSavedCampaignDTO.setCampaignConfig(config);
        validSavedCampaignDTO.setSaveType(SaveType.TEMPLATE);

        // Create a sample saved campaign response
        sampleSavedCampaignResponse = new SavedCampaignDTO();
        sampleSavedCampaignResponse.setId(1L);
        sampleSavedCampaignResponse.setUuid(testUuid);
        sampleSavedCampaignResponse.setName("My Campaign Template");
        sampleSavedCampaignResponse.setDescription("Template for weekly campaigns");
        sampleSavedCampaignResponse.setCampaignConfig(config);
        sampleSavedCampaignResponse.setSaveType(SaveType.TEMPLATE);
        sampleSavedCampaignResponse.setIsFavorite(false);
        sampleSavedCampaignResponse.setCreatedAt(LocalDateTime.now());
        sampleSavedCampaignResponse.setUpdatedAt(LocalDateTime.now());
    }

    // ========================================================================
    // CREATE CAMPAIGN TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/campaigns - Create Campaign")
    class CreateCampaignTests {

        @Test
        @DisplayName("Should create campaign with valid data")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCampaign_ValidData_Success() throws Exception {
            when(campaignService.createCampaign(any(CampaignDTO.class), any(UUID.class), any()))
                    .thenReturn(sampleCampaignResponse);

            performPost("/api/v1/campaigns", validCampaignDTO)
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Summer Camp Sale"))
                    .andExpect(jsonPath("$.campaignType").value("SEASONAL"))
                    .andExpect(jsonPath("$.status").value("DRAFT"));

            verify(campaignService).createCampaign(any(CampaignDTO.class), any(UUID.class), any());
        }

        @Test
        @DisplayName("Should create campaign with X-User-Id header")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void createCampaign_WithUserIdHeader_Success() throws Exception {
            when(campaignService.createCampaign(any(CampaignDTO.class), eq(testUserId), any()))
                    .thenReturn(sampleCampaignResponse);

            mockMvc.perform(post("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCampaignDTO))
                            .header("X-User-Id", testUserId.toString())
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1L));

            verify(campaignService).createCampaign(any(CampaignDTO.class), eq(testUserId), any());
        }

        @Test
        @DisplayName("Should return 400 when name is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCampaign_BlankName_BadRequest() throws Exception {
            validCampaignDTO.setName("");

            performPost("/api/v1/campaigns", validCampaignDTO)
                    .andExpect(status().isBadRequest());

            verify(campaignService, never()).createCampaign(any(), any(), any());
        }

        @Test
        @DisplayName("Should return 400 when campaign type is null")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void createCampaign_NullCampaignType_BadRequest() throws Exception {
            validCampaignDTO.setCampaignType(null);

            performPost("/api/v1/campaigns", validCampaignDTO)
                    .andExpect(status().isBadRequest());

            verify(campaignService, never()).createCampaign(any(), any(), any());
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void createCampaign_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(post("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validCampaignDTO))
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(campaignService, never()).createCampaign(any(), any(), any());
        }
    }

    // ========================================================================
    // GET CAMPAIGNS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/campaigns - Get Campaigns List")
    class GetCampaignsTests {

        @Test
        @DisplayName("Should return paginated campaigns")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaigns_Success() throws Exception {
            Page<CampaignDTO> campaignPage = new PageImpl<>(
                    List.of(sampleCampaignResponse),
                    PageRequest.of(0, 10),
                    1
            );
            when(campaignService.getCampaigns(any(), any(), any(), any(), any(Pageable.class)))
                    .thenReturn(campaignPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].id").value(1L))
                    .andExpect(jsonPath("$.content[0].name").value("Summer Camp Sale"))
                    .andExpect(jsonPath("$.totalElements").value(1));

            verify(campaignService).getCampaigns(any(), any(), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter campaigns by status")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaigns_FilterByStatus_Success() throws Exception {
            Page<CampaignDTO> campaignPage = new PageImpl<>(List.of(sampleCampaignResponse));
            when(campaignService.getCampaigns(any(), eq(CampaignStatus.DRAFT), any(), any(), any(Pageable.class)))
                    .thenReturn(campaignPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .param("status", "DRAFT")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(campaignService).getCampaigns(any(), eq(CampaignStatus.DRAFT), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should filter campaigns by type")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaigns_FilterByType_Success() throws Exception {
            Page<CampaignDTO> campaignPage = new PageImpl<>(List.of(sampleCampaignResponse));
            when(campaignService.getCampaigns(any(), any(), eq(CampaignType.SEASONAL), any(), any(Pageable.class)))
                    .thenReturn(campaignPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .param("type", "SEASONAL")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(campaignService).getCampaigns(any(), any(), eq(CampaignType.SEASONAL), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should search campaigns by keyword")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaigns_WithSearch_Success() throws Exception {
            Page<CampaignDTO> campaignPage = new PageImpl<>(List.of(sampleCampaignResponse));
            when(campaignService.getCampaigns(any(), any(), any(), eq("summer"), any(Pageable.class)))
                    .thenReturn(campaignPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .param("search", "summer")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(campaignService).getCampaigns(any(), any(), any(), eq("summer"), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page when no campaigns exist")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaigns_Empty_ReturnsEmptyPage() throws Exception {
            Page<CampaignDTO> emptyPage = new PageImpl<>(Collections.emptyList());
            when(campaignService.getCampaigns(any(), any(), any(), any(), any(Pageable.class)))
                    .thenReturn(emptyPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements").value(0));

            verify(campaignService).getCampaigns(any(), any(), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getCampaigns_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(campaignService, never()).getCampaigns(any(), any(), any(), any(), any());
        }
    }

    // ========================================================================
    // GET CAMPAIGN BY ID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/campaigns/{id} - Get Campaign by ID")
    class GetCampaignByIdTests {

        @Test
        @DisplayName("Should return campaign by ID")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaign_ByLongId_Success() throws Exception {
            when(campaignService.getCampaign(1L)).thenReturn(sampleCampaignResponse);

            mockMvc.perform(get("/api/v1/campaigns/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Summer Camp Sale"))
                    .andExpect(jsonPath("$.uuid").value(testUuid.toString()));

            verify(campaignService).getCampaign(1L);
        }

        @Test
        @DisplayName("Should throw exception when campaign not found")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaign_NotFound_ThrowsException() throws Exception {
            when(campaignService.getCampaign(999L)).thenThrow(new RuntimeException("Campaign not found: 999"));

            mockMvc.perform(get("/api/v1/campaigns/999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(campaignService).getCampaign(999L);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void getCampaign_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/v1/campaigns/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());

            verify(campaignService, never()).getCampaign(anyLong());
        }
    }

    // ========================================================================
    // GET CAMPAIGN BY UUID TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/campaigns/uuid/{uuid} - Get Campaign by UUID")
    class GetCampaignByUuidTests {

        @Test
        @DisplayName("Should return campaign by UUID")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaignByUuid_Success() throws Exception {
            when(campaignService.getCampaignByUuid(testUuid)).thenReturn(sampleCampaignResponse);

            mockMvc.perform(get("/api/v1/campaigns/uuid/" + testUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.uuid").value(testUuid.toString()))
                    .andExpect(jsonPath("$.name").value("Summer Camp Sale"));

            verify(campaignService).getCampaignByUuid(testUuid);
        }

        @Test
        @DisplayName("Should throw exception when UUID not found")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaignByUuid_NotFound_ThrowsException() throws Exception {
            UUID unknownUuid = UUID.randomUUID();
            when(campaignService.getCampaignByUuid(unknownUuid))
                    .thenThrow(new RuntimeException("Campaign not found: " + unknownUuid));

            mockMvc.perform(get("/api/v1/campaigns/uuid/" + unknownUuid)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isInternalServerError());

            verify(campaignService).getCampaignByUuid(unknownUuid);
        }

        @Test
        @DisplayName("Should return 400 for invalid UUID format")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getCampaignByUuid_InvalidFormat_BadRequest() throws Exception {
            mockMvc.perform(get("/api/v1/campaigns/uuid/not-a-uuid")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());

            verify(campaignService, never()).getCampaignByUuid(any());
        }
    }

    // ========================================================================
    // UPDATE CAMPAIGN TESTS
    // ========================================================================

    @Nested
    @DisplayName("PUT /api/v1/campaigns/{id} - Update Campaign")
    class UpdateCampaignTests {

        @Test
        @DisplayName("Should update campaign with valid data")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCampaign_ValidData_Success() throws Exception {
            CampaignDTO updatedResponse = new CampaignDTO();
            updatedResponse.setId(1L);
            updatedResponse.setUuid(testUuid);
            updatedResponse.setName("Updated Campaign Name");
            updatedResponse.setCampaignType(CampaignType.FLASH_SALE);
            updatedResponse.setStatus(CampaignStatus.APPROVED);

            when(campaignService.updateCampaign(eq(1L), any(CampaignDTO.class), any(UUID.class)))
                    .thenReturn(updatedResponse);

            validCampaignDTO.setName("Updated Campaign Name");
            validCampaignDTO.setCampaignType(CampaignType.FLASH_SALE);

            performPut("/api/v1/campaigns/1", validCampaignDTO)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Updated Campaign Name"))
                    .andExpect(jsonPath("$.campaignType").value("FLASH_SALE"));

            verify(campaignService).updateCampaign(eq(1L), any(CampaignDTO.class), any(UUID.class));
        }

        @Test
        @DisplayName("Should return 400 when name is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCampaign_BlankName_BadRequest() throws Exception {
            validCampaignDTO.setName("");

            performPut("/api/v1/campaigns/1", validCampaignDTO)
                    .andExpect(status().isBadRequest());

            verify(campaignService, never()).updateCampaign(anyLong(), any(), any());
        }

        @Test
        @DisplayName("Should throw exception when campaign not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCampaign_NotFound_ThrowsException() throws Exception {
            when(campaignService.updateCampaign(eq(999L), any(CampaignDTO.class), any(UUID.class)))
                    .thenThrow(new RuntimeException("Campaign not found: 999"));

            performPut("/api/v1/campaigns/999", validCampaignDTO)
                    .andExpect(status().isInternalServerError());

            verify(campaignService).updateCampaign(eq(999L), any(CampaignDTO.class), any(UUID.class));
        }
    }

    // ========================================================================
    // UPDATE CAMPAIGN STATUS TESTS
    // ========================================================================

    @Nested
    @DisplayName("PATCH /api/v1/campaigns/{id}/status - Update Campaign Status")
    class UpdateCampaignStatusTests {

        @Test
        @DisplayName("Should update campaign status")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCampaignStatus_Success() throws Exception {
            CampaignDTO activeResponse = new CampaignDTO();
            activeResponse.setId(1L);
            activeResponse.setStatus(CampaignStatus.ACTIVE);

            when(campaignService.updateCampaignStatus(eq(1L), eq(CampaignStatus.ACTIVE), any(UUID.class)))
                    .thenReturn(activeResponse);

            Map<String, String> statusBody = new HashMap<>();
            statusBody.put("status", "ACTIVE");

            mockMvc.perform(patch("/api/v1/campaigns/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(statusBody))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACTIVE"));

            verify(campaignService).updateCampaignStatus(eq(1L), eq(CampaignStatus.ACTIVE), any(UUID.class));
        }

        @Test
        @DisplayName("Should pause campaign")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateCampaignStatus_Pause_Success() throws Exception {
            CampaignDTO pausedResponse = new CampaignDTO();
            pausedResponse.setId(1L);
            pausedResponse.setStatus(CampaignStatus.PAUSED);

            when(campaignService.updateCampaignStatus(eq(1L), eq(CampaignStatus.PAUSED), any(UUID.class)))
                    .thenReturn(pausedResponse);

            Map<String, String> statusBody = new HashMap<>();
            statusBody.put("status", "PAUSED");

            mockMvc.perform(patch("/api/v1/campaigns/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(statusBody))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("PAUSED"));

            verify(campaignService).updateCampaignStatus(eq(1L), eq(CampaignStatus.PAUSED), any(UUID.class));
        }

        @Test
        @DisplayName("Should cancel campaign")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void updateCampaignStatus_Cancel_Success() throws Exception {
            CampaignDTO cancelledResponse = new CampaignDTO();
            cancelledResponse.setId(1L);
            cancelledResponse.setStatus(CampaignStatus.CANCELLED);

            when(campaignService.updateCampaignStatus(eq(1L), eq(CampaignStatus.CANCELLED), any(UUID.class)))
                    .thenReturn(cancelledResponse);

            Map<String, String> statusBody = new HashMap<>();
            statusBody.put("status", "CANCELLED");

            mockMvc.perform(patch("/api/v1/campaigns/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(statusBody))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            verify(campaignService).updateCampaignStatus(eq(1L), eq(CampaignStatus.CANCELLED), any(UUID.class));
        }
    }

    // ========================================================================
    // DELETE CAMPAIGN TESTS
    // ========================================================================

    @Nested
    @DisplayName("DELETE /api/v1/campaigns/{id} - Delete Campaign")
    class DeleteCampaignTests {

        @Test
        @DisplayName("Should delete campaign")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCampaign_Success() throws Exception {
            doNothing().when(campaignService).deleteCampaign(1L);

            mockMvc.perform(delete("/api/v1/campaigns/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(campaignService).deleteCampaign(1L);
        }

        @Test
        @DisplayName("Should throw exception when campaign not found")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void deleteCampaign_NotFound_ThrowsException() throws Exception {
            doThrow(new RuntimeException("Campaign not found: 999")).when(campaignService).deleteCampaign(999L);

            mockMvc.perform(delete("/api/v1/campaigns/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isInternalServerError());

            verify(campaignService).deleteCampaign(999L);
        }

        @Test
        @DisplayName("Should return 401 when unauthenticated")
        void deleteCampaign_Unauthenticated_Unauthorized() throws Exception {
            mockMvc.perform(delete("/api/v1/campaigns/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());

            verify(campaignService, never()).deleteCampaign(anyLong());
        }
    }

    // ========================================================================
    // SAVED CAMPAIGNS TESTS
    // ========================================================================

    @Nested
    @DisplayName("Saved Campaigns (Drafts & Templates)")
    class SavedCampaignsTests {

        @Test
        @DisplayName("POST /api/v1/campaigns/saved - Should save campaign draft")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void saveCampaign_Success() throws Exception {
            when(campaignService.saveCampaign(any(SavedCampaignDTO.class), any(UUID.class), any()))
                    .thenReturn(sampleSavedCampaignResponse);

            performPost("/api/v1/campaigns/saved", validSavedCampaignDTO)
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("My Campaign Template"))
                    .andExpect(jsonPath("$.saveType").value("TEMPLATE"));

            verify(campaignService).saveCampaign(any(SavedCampaignDTO.class), any(UUID.class), any());
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/saved - Should return 400 when name is blank")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void saveCampaign_BlankName_BadRequest() throws Exception {
            validSavedCampaignDTO.setName("");

            performPost("/api/v1/campaigns/saved", validSavedCampaignDTO)
                    .andExpect(status().isBadRequest());

            verify(campaignService, never()).saveCampaign(any(), any(), any());
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/saved - Should return saved campaigns")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getSavedCampaigns_Success() throws Exception {
            Page<SavedCampaignDTO> savedPage = new PageImpl<>(List.of(sampleSavedCampaignResponse));
            when(campaignService.getSavedCampaigns(any(UUID.class), any(), any(), any(Pageable.class)))
                    .thenReturn(savedPage);

            mockMvc.perform(get("/api/v1/campaigns/saved")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray())
                    .andExpect(jsonPath("$.content[0].name").value("My Campaign Template"));

            verify(campaignService).getSavedCampaigns(any(UUID.class), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/saved/{id} - Should return saved campaign by ID")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getSavedCampaign_Success() throws Exception {
            when(campaignService.getSavedCampaign(eq(1L), any(UUID.class)))
                    .thenReturn(sampleSavedCampaignResponse);

            mockMvc.perform(get("/api/v1/campaigns/saved/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("My Campaign Template"));

            verify(campaignService).getSavedCampaign(eq(1L), any(UUID.class));
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/saved/favorites - Should return favorite campaigns")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getFavorites_Success() throws Exception {
            sampleSavedCampaignResponse.setIsFavorite(true);
            when(campaignService.getFavorites(any(UUID.class)))
                    .thenReturn(List.of(sampleSavedCampaignResponse));

            mockMvc.perform(get("/api/v1/campaigns/saved/favorites")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].isFavorite").value(true));

            verify(campaignService).getFavorites(any(UUID.class));
        }

        @Test
        @DisplayName("PUT /api/v1/campaigns/saved/{id} - Should update saved campaign")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void updateSavedCampaign_Success() throws Exception {
            SavedCampaignDTO updated = new SavedCampaignDTO();
            updated.setId(1L);
            updated.setName("Updated Template");
            updated.setCampaignConfig(validSavedCampaignDTO.getCampaignConfig());

            when(campaignService.updateSavedCampaign(eq(1L), any(SavedCampaignDTO.class), any(UUID.class)))
                    .thenReturn(updated);

            validSavedCampaignDTO.setName("Updated Template");

            performPut("/api/v1/campaigns/saved/1", validSavedCampaignDTO)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated Template"));

            verify(campaignService).updateSavedCampaign(eq(1L), any(SavedCampaignDTO.class), any(UUID.class));
        }

        @Test
        @DisplayName("DELETE /api/v1/campaigns/saved/{id} - Should delete saved campaign")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void deleteSavedCampaign_Success() throws Exception {
            doNothing().when(campaignService).deleteSavedCampaign(eq(1L), any(UUID.class));

            mockMvc.perform(delete("/api/v1/campaigns/saved/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(campaignService).deleteSavedCampaign(eq(1L), any(UUID.class));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/saved/{id}/create - Should create campaign from saved")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void createFromSaved_Success() throws Exception {
            when(campaignService.createCampaignFromSaved(eq(1L), any(UUID.class), any()))
                    .thenReturn(sampleCampaignResponse);

            mockMvc.perform(post("/api/v1/campaigns/saved/1/create")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.name").value("Summer Camp Sale"));

            verify(campaignService).createCampaignFromSaved(eq(1L), any(UUID.class), any());
        }
    }

    // ========================================================================
    // SEGMENTS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/campaigns/segments - Get Segments")
    class GetSegmentsTests {

        @Test
        @DisplayName("Should return available segments")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getSegments_Success() throws Exception {
            MarketingSegment segment = new MarketingSegment();
            segment.setId(1L);
            segment.setUuid(UUID.randomUUID());
            segment.setName("Active Scouts");
            segment.setDescription("Scouts with active subscriptions");
            segment.setSegmentType(MarketingSegment.SegmentType.BEHAVIORAL);
            segment.setUserCount(500);

            when(campaignService.getAvailableSegments(any())).thenReturn(List.of(segment));

            mockMvc.perform(get("/api/v1/campaigns/segments")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[0].name").value("Active Scouts"));

            verify(campaignService).getAvailableSegments(any());
        }

        @Test
        @DisplayName("Should return segments filtered by council")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void getSegments_WithCouncilFilter_Success() throws Exception {
            MarketingSegment segment = new MarketingSegment();
            segment.setId(1L);
            segment.setName("Council Scouts");

            when(campaignService.getAvailableSegments(123L)).thenReturn(List.of(segment));

            mockMvc.perform(get("/api/v1/campaigns/segments")
                            .header("X-Council-Id", "123")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(campaignService).getAvailableSegments(123L);
        }
    }

    // ========================================================================
    // AI CONTENT GENERATION TESTS
    // ========================================================================

    @Nested
    @DisplayName("AI Content Generation Endpoints")
    class AIContentGenerationTests {

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/generate - Should generate content")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void generateContent_Success() throws Exception {
            CampaignContentRequest request = new CampaignContentRequest();
            request.setContentType("EMAIL_SUBJECT");
            request.setCampaignType("SEASONAL");
            request.setTargetAudience("Active scouts");
            request.setTone("FRIENDLY");

            AIGeneratedContent response = new AIGeneratedContent();
            response.setSubjectLine("Summer Camp Cards - Don't Miss Out!");
            response.setBodyContent("Dear Scout, we have exciting offers for you...");
            response.setModel("claude-3");
            response.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.generateCampaignContent(any(CampaignContentRequest.class)))
                    .thenReturn(response);

            performPost("/api/v1/campaigns/ai/generate", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.subjectLine").value("Summer Camp Cards - Don't Miss Out!"));

            verify(aiAgentService).generateCampaignContent(any(CampaignContentRequest.class));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/generate - Should return 400 when content type is blank")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void generateContent_BlankContentType_BadRequest() throws Exception {
            CampaignContentRequest request = new CampaignContentRequest();
            request.setContentType("");
            request.setCampaignType("SEASONAL");

            performPost("/api/v1/campaigns/ai/generate", request)
                    .andExpect(status().isBadRequest());

            verify(aiAgentService, never()).generateCampaignContent(any());
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/generate/variations - Should generate variations")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void generateVariations_Success() throws Exception {
            CampaignContentRequest request = new CampaignContentRequest();
            request.setContentType("EMAIL_SUBJECT");
            request.setCampaignType("SEASONAL");

            AIGeneratedContent var1 = new AIGeneratedContent();
            var1.setSubjectLine("Variation 1");
            var1.setVariationNumber(1);

            AIGeneratedContent var2 = new AIGeneratedContent();
            var2.setSubjectLine("Variation 2");
            var2.setVariationNumber(2);

            when(aiAgentService.generateContentVariations(any(CampaignContentRequest.class), eq(3)))
                    .thenReturn(List.of(var1, var2));

            mockMvc.perform(post("/api/v1/campaigns/ai/generate/variations")
                            .param("numVariations", "3")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(2)));

            verify(aiAgentService).generateContentVariations(any(CampaignContentRequest.class), eq(3));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/modify - Should modify content")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void modifyContent_Success() throws Exception {
            AIModifyContentRequest request = new AIModifyContentRequest();
            request.setOriginalContent("Original content here");
            request.setModificationInstructions("Make it more casual");

            AIModifyContentResponse response = new AIModifyContentResponse();
            response.setOriginalContent("Original content here");
            response.setModifiedContent("Hey! Check out this content...");
            response.setModificationApplied("Made tone more casual");
            response.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.modifyContent(any(AIModifyContentRequest.class)))
                    .thenReturn(response);

            performPost("/api/v1/campaigns/ai/modify", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.modifiedContent").value("Hey! Check out this content..."));

            verify(aiAgentService).modifyContent(any(AIModifyContentRequest.class));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/optimize - Should optimize content")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void optimizeContent_Success() throws Exception {
            ContentOptimizationRequest request = new ContentOptimizationRequest();
            request.setContent("Some content to optimize");
            request.setOptimizationType("ENGAGEMENT");

            ContentOptimization response = new ContentOptimization();
            response.setOriginalContent("Some content to optimize");
            response.setOptimizedContent("Optimized content for better engagement!");
            response.setOptimizationType("ENGAGEMENT");
            response.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.optimizeContent(any(ContentOptimizationRequest.class)))
                    .thenReturn(response);

            performPost("/api/v1/campaigns/ai/optimize", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.optimizationType").value("ENGAGEMENT"));

            verify(aiAgentService).optimizeContent(any(ContentOptimizationRequest.class));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/suggest - Should suggest campaign")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void suggestCampaign_Success() throws Exception {
            CampaignSuggestionRequest request = new CampaignSuggestionRequest();
            request.setBusinessGoal("Increase sales");
            request.setTargetSegment("Active scouts");
            request.setBudgetLevel("MEDIUM");
            request.setTimeline("THIS_MONTH");

            CampaignSuggestion response = new CampaignSuggestion();
            response.setSuggestedName("Monthly Sales Boost Campaign");
            response.setSuggestedType(CampaignType.LOYALTY_BOOST);
            response.setRecommendedChannels(List.of("EMAIL", "PUSH"));
            response.setContentTheme("Reward loyalty with exclusive discounts");
            response.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.suggestCampaign(any(CampaignSuggestionRequest.class)))
                    .thenReturn(response);

            performPost("/api/v1/campaigns/ai/suggest", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.suggestedName").value("Monthly Sales Boost Campaign"))
                    .andExpect(jsonPath("$.suggestedType").value("LOYALTY_BOOST"));

            verify(aiAgentService).suggestCampaign(any(CampaignSuggestionRequest.class));
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/ai/analyze/segment/{segmentId} - Should analyze segment")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void analyzeSegment_Success() throws Exception {
            SegmentAnalysis response = new SegmentAnalysis();
            response.setSegmentId(1L);
            response.setSegmentName("Active Scouts");
            response.setAnalysis("This segment shows high engagement potential...");
            response.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.analyzeSegment(eq(1L), any())).thenReturn(response);

            mockMvc.perform(get("/api/v1/campaigns/ai/analyze/segment/1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.segmentId").value(1L))
                    .andExpect(jsonPath("$.segmentName").value("Active Scouts"));

            verify(aiAgentService).analyzeSegment(eq(1L), any());
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/{id}/ai/predict - Should predict performance")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void predictPerformance_Success() throws Exception {
            when(campaignService.getCampaign(1L)).thenReturn(sampleCampaignResponse);

            CampaignPerformancePrediction prediction = new CampaignPerformancePrediction();
            prediction.setCampaignId(1L);
            prediction.setPrediction("This campaign is expected to perform well...");
            prediction.setPredictedOpenRate(35.5);
            prediction.setPredictedClickRate(12.3);
            prediction.setPredictedConversionRate(5.8);
            prediction.setPredictedROI(250.0);
            prediction.setConfidenceLevel("HIGH");
            prediction.setGeneratedAt(LocalDateTime.now());

            when(aiAgentService.predictPerformance(any())).thenReturn(prediction);

            mockMvc.perform(get("/api/v1/campaigns/1/ai/predict")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.campaignId").value(1L))
                    .andExpect(jsonPath("$.predictedOpenRate").value(35.5))
                    .andExpect(jsonPath("$.confidenceLevel").value("HIGH"));

            verify(campaignService).getCampaign(1L);
            verify(aiAgentService).predictPerformance(any());
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/agent/task - Should execute agent task")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void executeAgentTask_Success() throws Exception {
            AIAgentTaskRequest request = new AIAgentTaskRequest();
            request.setTaskType("CREATE_CAMPAIGN");
            request.setPriority("HIGH");
            Map<String, Object> taskData = new HashMap<>();
            taskData.put("campaignName", "Auto Campaign");
            request.setTaskData(taskData);

            AIAgentAction response = new AIAgentAction();
            response.setTaskType("CREATE_CAMPAIGN");
            response.setStatus("COMPLETED");
            Map<String, Object> result = new HashMap<>();
            result.put("campaignId", 1L);
            response.setResult(result);
            response.setStartedAt(LocalDateTime.now().minusMinutes(1));
            response.setCompletedAt(LocalDateTime.now());

            when(aiAgentService.executeAgentTask(any(AIAgentTaskRequest.class)))
                    .thenReturn(response);

            performPost("/api/v1/campaigns/ai/agent/task", request)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.taskType").value("CREATE_CAMPAIGN"))
                    .andExpect(jsonPath("$.status").value("COMPLETED"));

            verify(aiAgentService).executeAgentTask(any(AIAgentTaskRequest.class));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/ai/agent/task - Should return 400 when task type is blank")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void executeAgentTask_BlankTaskType_BadRequest() throws Exception {
            AIAgentTaskRequest request = new AIAgentTaskRequest();
            request.setTaskType("");

            performPost("/api/v1/campaigns/ai/agent/task", request)
                    .andExpect(status().isBadRequest());

            verify(aiAgentService, never()).executeAgentTask(any());
        }
    }

    // ========================================================================
    // AUTHORIZATION TESTS
    // ========================================================================

    @Nested
    @DisplayName("Authorization Tests")
    class AuthorizationTests {

        @Test
        @DisplayName("Should allow SCOUT to view campaigns")
        @WithMockUser(roles = "SCOUT")
        void scout_CanViewCampaigns() throws Exception {
            verifyRoleCanViewCampaigns();
        }

        @Test
        @DisplayName("Should allow TROOP_LEADER to view campaigns")
        @WithMockUser(roles = "TROOP_LEADER")
        void troopLeader_CanViewCampaigns() throws Exception {
            verifyRoleCanViewCampaigns();
        }

        @Test
        @DisplayName("Should allow PARENT to view campaigns")
        @WithMockUser(roles = "PARENT")
        void parent_CanViewCampaigns() throws Exception {
            verifyRoleCanViewCampaigns();
        }

        private void verifyRoleCanViewCampaigns() throws Exception {
            Page<CampaignDTO> campaignPage = new PageImpl<>(List.of(sampleCampaignResponse));
            when(campaignService.getCampaigns(any(), any(), any(), any(), any(Pageable.class)))
                    .thenReturn(campaignPage);

            mockMvc.perform(get("/api/v1/campaigns")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(campaignService).getCampaigns(any(), any(), any(), any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should allow COUNCIL_ADMIN to create campaigns")
        @WithMockUser(roles = "COUNCIL_ADMIN")
        void councilAdmin_CanCreateCampaigns() throws Exception {
            when(campaignService.createCampaign(any(CampaignDTO.class), any(UUID.class), any()))
                    .thenReturn(sampleCampaignResponse);

            performPost("/api/v1/campaigns", validCampaignDTO)
                    .andExpect(status().isCreated());

            verify(campaignService).createCampaign(any(CampaignDTO.class), any(UUID.class), any());
        }

        @Test
        @DisplayName("Should allow NATIONAL_ADMIN to delete campaigns")
        @WithMockUser(roles = "NATIONAL_ADMIN")
        void nationalAdmin_CanDeleteCampaigns() throws Exception {
            doNothing().when(campaignService).deleteCampaign(1L);

            mockMvc.perform(delete("/api/v1/campaigns/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(campaignService).deleteCampaign(1L);
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private ResultActions performPost(String url, Object content) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .header("X-User-Id", testUserId.toString())
                .with(csrf()));
    }

    private ResultActions performPut(String url, Object content) throws Exception {
        return mockMvc.perform(put(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(content))
                .header("X-User-Id", testUserId.toString())
                .with(csrf()));
    }
}
