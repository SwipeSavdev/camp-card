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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Tag(name = "Marketing Campaigns", description = "AI-powered marketing campaign management")
public class CampaignController {

    private final MarketingCampaignService campaignService;
    private final AIMarketingAgentService aiAgentService;

    // Campaign CRUD

    @PostMapping
    @Operation(summary = "Create a new campaign")
    public ResponseEntity<CampaignDTO> createCampaign(
            @Valid @RequestBody CampaignDTO dto,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId) {

        CampaignDTO created = campaignService.createCampaign(dto, userId, councilId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Get campaigns with filtering and pagination")
    public ResponseEntity<Page<CampaignDTO>> getCampaigns(
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId,
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) CampaignType type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<CampaignDTO> campaigns = campaignService.getCampaigns(councilId, status, type, search, pageable);
        return ResponseEntity.ok(campaigns);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campaign by ID")
    public ResponseEntity<CampaignDTO> getCampaign(@PathVariable Long id) {
        CampaignDTO campaign = campaignService.getCampaign(id);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping("/uuid/{uuid}")
    @Operation(summary = "Get campaign by UUID")
    public ResponseEntity<CampaignDTO> getCampaignByUuid(@PathVariable UUID uuid) {
        CampaignDTO campaign = campaignService.getCampaignByUuid(uuid);
        return ResponseEntity.ok(campaign);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a campaign")
    public ResponseEntity<CampaignDTO> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignDTO dto,
            @RequestHeader("X-User-Id") UUID userId) {

        CampaignDTO updated = campaignService.updateCampaign(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update campaign status")
    public ResponseEntity<CampaignDTO> updateCampaignStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") UUID userId) {

        CampaignStatus newStatus = CampaignStatus.valueOf(body.get("status"));
        CampaignDTO updated = campaignService.updateCampaignStatus(id, newStatus, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a campaign")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    // Saved Campaigns (User Drafts & Templates)

    @PostMapping("/saved")
    @Operation(summary = "Save a campaign draft or template")
    public ResponseEntity<SavedCampaignDTO> saveCampaign(
            @Valid @RequestBody SavedCampaignDTO dto,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId) {

        SavedCampaignDTO saved = campaignService.saveCampaign(dto, userId, councilId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/saved")
    @Operation(summary = "Get user's saved campaigns")
    public ResponseEntity<Page<SavedCampaignDTO>> getSavedCampaigns(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(required = false) SaveType saveType,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<SavedCampaignDTO> saved = campaignService.getSavedCampaigns(userId, saveType, search, pageable);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/saved/{id}")
    @Operation(summary = "Get a saved campaign")
    public ResponseEntity<SavedCampaignDTO> getSavedCampaign(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") UUID userId) {

        SavedCampaignDTO saved = campaignService.getSavedCampaign(id, userId);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/saved/favorites")
    @Operation(summary = "Get user's favorite saved campaigns")
    public ResponseEntity<List<SavedCampaignDTO>> getFavorites(
            @RequestHeader("X-User-Id") UUID userId) {

        List<SavedCampaignDTO> favorites = campaignService.getFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @PutMapping("/saved/{id}")
    @Operation(summary = "Update a saved campaign")
    public ResponseEntity<SavedCampaignDTO> updateSavedCampaign(
            @PathVariable Long id,
            @Valid @RequestBody SavedCampaignDTO dto,
            @RequestHeader("X-User-Id") UUID userId) {

        SavedCampaignDTO updated = campaignService.updateSavedCampaign(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/saved/{id}")
    @Operation(summary = "Delete a saved campaign")
    public ResponseEntity<Void> deleteSavedCampaign(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") UUID userId) {

        campaignService.deleteSavedCampaign(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/saved/{id}/create")
    @Operation(summary = "Create a campaign from a saved template")
    public ResponseEntity<CampaignDTO> createFromSaved(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId) {

        CampaignDTO created = campaignService.createCampaignFromSaved(id, userId, councilId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Segments

    @GetMapping("/segments")
    @Operation(summary = "Get available segments for targeting")
    public ResponseEntity<List<MarketingSegment>> getSegments(
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId) {

        List<MarketingSegment> segments = campaignService.getAvailableSegments(councilId);
        return ResponseEntity.ok(segments);
    }

    // AI Content Generation

    @PostMapping("/ai/generate")
    @Operation(summary = "Generate AI content for a campaign")
    public ResponseEntity<AIGeneratedContent> generateContent(
            @Valid @RequestBody CampaignContentRequest request) {

        AIGeneratedContent content = aiAgentService.generateCampaignContent(request);
        return ResponseEntity.ok(content);
    }

    @PostMapping("/ai/generate/variations")
    @Operation(summary = "Generate multiple content variations")
    public ResponseEntity<List<AIGeneratedContent>> generateVariations(
            @Valid @RequestBody CampaignContentRequest request,
            @RequestParam(defaultValue = "3") int numVariations) {

        List<AIGeneratedContent> variations = aiAgentService.generateContentVariations(request, numVariations);
        return ResponseEntity.ok(variations);
    }

    @PostMapping("/ai/modify")
    @Operation(summary = "Modify existing content with AI")
    public ResponseEntity<AIModifyContentResponse> modifyContent(
            @Valid @RequestBody AIModifyContentRequest request) {

        AIModifyContentResponse response = aiAgentService.modifyContent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai/optimize")
    @Operation(summary = "Optimize content for better performance")
    public ResponseEntity<ContentOptimization> optimizeContent(
            @Valid @RequestBody ContentOptimizationRequest request) {

        ContentOptimization optimization = aiAgentService.optimizeContent(request);
        return ResponseEntity.ok(optimization);
    }

    @PostMapping("/ai/suggest")
    @Operation(summary = "Get AI campaign suggestions")
    public ResponseEntity<CampaignSuggestion> suggestCampaign(
            @Valid @RequestBody CampaignSuggestionRequest request) {

        CampaignSuggestion suggestion = aiAgentService.suggestCampaign(request);
        return ResponseEntity.ok(suggestion);
    }

    @GetMapping("/ai/analyze/segment/{segmentId}")
    @Operation(summary = "Get AI analysis of a segment")
    public ResponseEntity<SegmentAnalysis> analyzeSegment(
            @PathVariable Long segmentId,
            @RequestHeader(value = "X-Council-Id", required = false) Long councilId) {

        SegmentAnalysis analysis = aiAgentService.analyzeSegment(segmentId, councilId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/{id}/ai/predict")
    @Operation(summary = "Get AI performance prediction for a campaign")
    public ResponseEntity<CampaignPerformancePrediction> predictPerformance(@PathVariable Long id) {
        CampaignDTO campaign = campaignService.getCampaign(id);

        // Convert DTO to entity for prediction
        com.bsa.campcard.entity.MarketingCampaign entity = new com.bsa.campcard.entity.MarketingCampaign();
        entity.setId(campaign.getId());
        entity.setName(campaign.getName());
        entity.setCampaignType(campaign.getCampaignType());
        entity.setSegmentId(campaign.getSegmentId());
        entity.setChannels(campaign.getChannels());
        entity.setEstimatedReach(campaign.getEstimatedReach());
        entity.setContentText(campaign.getContentText());

        CampaignPerformancePrediction prediction = aiAgentService.predictPerformance(entity);
        return ResponseEntity.ok(prediction);
    }

    @PostMapping("/ai/agent/task")
    @Operation(summary = "Execute an AI agent task")
    public ResponseEntity<AIAgentAction> executeAgentTask(
            @Valid @RequestBody AIAgentTaskRequest request) {

        AIAgentAction action = aiAgentService.executeAgentTask(request);
        return ResponseEntity.ok(action);
    }
}
