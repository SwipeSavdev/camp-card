package com.bsa.campcard.service.ai;

import com.bsa.campcard.dto.ai.*;
import com.bsa.campcard.entity.MarketingCampaign;
import com.bsa.campcard.entity.MarketingCampaign.CampaignType;
import com.bsa.campcard.entity.MarketingSegment;
import com.bsa.campcard.repository.MarketingCampaignRepository;
import com.bsa.campcard.repository.MarketingSegmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIMarketingAgentService {

    private final TogetherAIService togetherAIService;
    private final MarketingCampaignRepository campaignRepository;
    private final MarketingSegmentRepository segmentRepository;
    private final ObjectMapper objectMapper;

    public AIGeneratedContent generateCampaignContent(CampaignContentRequest request) {
        String prompt = buildContentPrompt(request);
        String aiResponse = togetherAIService.generateContent(prompt);

        AIGeneratedContent content = new AIGeneratedContent();
        content.setRawContent(aiResponse);
        content.setGeneratedAt(LocalDateTime.now());
        content.setModel(request.getModel() != null ? request.getModel() : "meta-llama/Llama-3.3-70B-Instruct-Turbo");
        content.setPromptUsed(prompt);

        parseAndStructureContent(content, aiResponse, request.getContentType());

        return content;
    }

    public List<AIGeneratedContent> generateContentVariations(CampaignContentRequest request, int numVariations) {
        List<AIGeneratedContent> variations = new ArrayList<>();

        for (int i = 0; i < numVariations; i++) {
            String variationPrompt = buildContentPrompt(request) +
                "\n\nThis is variation " + (i + 1) + " of " + numVariations +
                ". Make this version " + getVariationInstruction(i) + ".";

            String aiResponse = togetherAIService.generateContent(variationPrompt);

            AIGeneratedContent content = new AIGeneratedContent();
            content.setRawContent(aiResponse);
            content.setGeneratedAt(LocalDateTime.now());
            content.setVariationNumber(i + 1);
            content.setVariationType(getVariationType(i));

            parseAndStructureContent(content, aiResponse, request.getContentType());
            variations.add(content);
        }

        return variations;
    }

    public CampaignSuggestion suggestCampaign(CampaignSuggestionRequest request) {
        String prompt = buildSuggestionPrompt(request);
        String aiResponse = togetherAIService.generateContent(prompt, null, 0.8, 1500);

        CampaignSuggestion suggestion = new CampaignSuggestion();
        suggestion.setRawSuggestion(aiResponse);
        suggestion.setGeneratedAt(LocalDateTime.now());

        parseSuggestion(suggestion, aiResponse);

        return suggestion;
    }

    public ContentOptimization optimizeContent(ContentOptimizationRequest request) {
        String prompt = buildOptimizationPrompt(request);
        String aiResponse = togetherAIService.generateContent(prompt, null, 0.6, 1500);

        ContentOptimization optimization = new ContentOptimization();
        optimization.setOriginalContent(request.getContent());
        optimization.setOptimizedContent(aiResponse);
        optimization.setOptimizationType(request.getOptimizationType());
        optimization.setGeneratedAt(LocalDateTime.now());

        return optimization;
    }

    public SegmentAnalysis analyzeSegment(Long segmentId, Long councilId) {
        MarketingSegment segment = segmentRepository.findById(segmentId)
            .orElseThrow(() -> new RuntimeException("Segment not found"));

        String prompt = String.format("""
            Analyze this marketing segment and provide insights:

            Segment Name: %s
            Description: %s
            Type: %s
            User Count: %d
            Rules: %s

            Provide:
            1. Key characteristics of this segment
            2. Recommended campaign types for this audience
            3. Best channels to reach them (email, push, SMS, in-app)
            4. Optimal timing for campaigns
            5. Content tone and messaging recommendations
            6. Predicted engagement rate range

            Format as structured recommendations.
            """,
            segment.getName(),
            segment.getDescription(),
            segment.getSegmentType(),
            segment.getUserCount(),
            segment.getRules()
        );

        String aiResponse = togetherAIService.generateContent(prompt, null, 0.7, 1500);

        SegmentAnalysis analysis = new SegmentAnalysis();
        analysis.setSegmentId(segmentId);
        analysis.setSegmentName(segment.getName());
        analysis.setAnalysis(aiResponse);
        analysis.setGeneratedAt(LocalDateTime.now());

        return analysis;
    }

    public CampaignPerformancePrediction predictPerformance(MarketingCampaign campaign) {
        String prompt = String.format("""
            Predict the performance of this marketing campaign:

            Campaign: %s
            Type: %s
            Target Segment: %s
            Channels: %s
            Estimated Reach: %d
            Content Preview: %s

            Based on industry benchmarks and campaign characteristics, predict:
            1. Expected open rate (for email/push)
            2. Expected click-through rate
            3. Expected conversion rate
            4. Estimated revenue impact
            5. ROI prediction
            6. Risk factors that could impact performance
            7. Recommendations to improve predicted performance

            Provide specific percentage predictions with confidence ranges.
            """,
            campaign.getName(),
            campaign.getCampaignType(),
            campaign.getSegmentId(),
            Arrays.toString(campaign.getChannels()),
            campaign.getEstimatedReach(),
            campaign.getContentText() != null ? campaign.getContentText().substring(0, Math.min(200, campaign.getContentText().length())) : "N/A"
        );

        String aiResponse = togetherAIService.generateContent(prompt, null, 0.6, 1500);

        CampaignPerformancePrediction prediction = new CampaignPerformancePrediction();
        prediction.setCampaignId(campaign.getId());
        prediction.setPrediction(aiResponse);
        prediction.setGeneratedAt(LocalDateTime.now());

        return prediction;
    }

    public AIAgentAction executeAgentTask(AIAgentTaskRequest request) {
        log.info("Executing AI agent task: {}", request.getTaskType());

        AIAgentAction action = new AIAgentAction();
        action.setTaskType(request.getTaskType());
        action.setStartedAt(LocalDateTime.now());

        try {
            switch (request.getTaskType()) {
                case "CREATE_CAMPAIGN" -> action.setResult(executeCreateCampaign(request));
                case "OPTIMIZE_CAMPAIGN" -> action.setResult(executeOptimizeCampaign(request));
                case "ANALYZE_PERFORMANCE" -> action.setResult(executeAnalyzePerformance(request));
                case "SUGGEST_IMPROVEMENTS" -> action.setResult(executeSuggestImprovements(request));
                case "GENERATE_REPORT" -> action.setResult(executeGenerateReport(request));
                case "AUTO_SEGMENT" -> action.setResult(executeAutoSegment(request));
                default -> throw new IllegalArgumentException("Unknown task type: " + request.getTaskType());
            }
            action.setStatus("COMPLETED");
        } catch (Exception e) {
            log.error("Agent task failed: {}", e.getMessage(), e);
            action.setStatus("FAILED");
            action.setError(e.getMessage());
        }

        action.setCompletedAt(LocalDateTime.now());
        return action;
    }

    public AIModifyContentResponse modifyContent(AIModifyContentRequest request) {
        String prompt = String.format("""
            Modify the following marketing content according to the instructions:

            Original Content:
            %s

            Modification Instructions:
            %s

            Content Type: %s

            Apply the modifications while maintaining:
            1. The core message and intent
            2. Appropriate length for the content type
            3. BSA Camp Card brand voice
            4. Clear call-to-action

            Provide the modified content only, without explanations.
            """,
            request.getOriginalContent(),
            request.getModificationInstructions(),
            request.getContentType()
        );

        String modifiedContent = togetherAIService.generateContent(prompt, null, 0.7, 1000);

        AIModifyContentResponse response = new AIModifyContentResponse();
        response.setOriginalContent(request.getOriginalContent());
        response.setModifiedContent(modifiedContent);
        response.setModificationApplied(request.getModificationInstructions());
        response.setGeneratedAt(LocalDateTime.now());

        return response;
    }

    private String buildContentPrompt(CampaignContentRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Create ").append(request.getContentType()).append(" content for a ");
        prompt.append(request.getCampaignType()).append(" campaign.\n\n");

        if (request.getTargetAudience() != null) {
            prompt.append("Target Audience: ").append(request.getTargetAudience()).append("\n");
        }
        if (request.getMerchantName() != null) {
            prompt.append("Merchant: ").append(request.getMerchantName()).append("\n");
        }
        if (request.getOfferDetails() != null) {
            prompt.append("Offer: ").append(request.getOfferDetails()).append("\n");
        }
        if (request.getTone() != null) {
            prompt.append("Tone: ").append(request.getTone()).append("\n");
        }
        if (request.getKeywords() != null && !request.getKeywords().isEmpty()) {
            prompt.append("Keywords to include: ").append(String.join(", ", request.getKeywords())).append("\n");
        }
        if (request.getAdditionalContext() != null) {
            prompt.append("Additional context: ").append(request.getAdditionalContext()).append("\n");
        }

        prompt.append("\nContent requirements:\n");
        switch (request.getContentType().toUpperCase()) {
            case "EMAIL_SUBJECT" -> prompt.append("- Maximum 60 characters\n- Compelling and action-oriented\n- Avoid spam trigger words");
            case "EMAIL_BODY" -> prompt.append("- 100-200 words\n- Include greeting, main message, and CTA\n- HTML-ready with paragraph breaks");
            case "PUSH_NOTIFICATION" -> prompt.append("- Maximum 100 characters\n- Urgent and engaging\n- Clear value proposition");
            case "SMS" -> prompt.append("- Maximum 160 characters\n- Include key info and link placeholder\n- Clear CTA");
            case "IN_APP_MESSAGE" -> prompt.append("- 50-100 words\n- Conversational tone\n- Visual-friendly format");
        }

        return prompt.toString();
    }

    private String buildSuggestionPrompt(CampaignSuggestionRequest request) {
        return String.format("""
            Based on the following context, suggest a marketing campaign:

            Business Goal: %s
            Target Segment: %s
            Budget Level: %s
            Timeline: %s
            Previous Campaign Performance: %s

            Provide a complete campaign suggestion including:
            1. Campaign name and type
            2. Recommended channels
            3. Content theme and messaging
            4. Optimal timing
            5. Success metrics to track
            6. Estimated budget allocation
            7. A/B testing recommendations
            """,
            request.getBusinessGoal(),
            request.getTargetSegment(),
            request.getBudgetLevel(),
            request.getTimeline(),
            request.getPreviousPerformance()
        );
    }

    private String buildOptimizationPrompt(ContentOptimizationRequest request) {
        return String.format("""
            Optimize this marketing content for %s:

            Original Content:
            %s

            Optimization Goals:
            - %s

            Constraints:
            - Maintain brand voice
            - Keep similar length
            - Preserve key message

            Provide the optimized version.
            """,
            request.getOptimizationType(),
            request.getContent(),
            request.getOptimizationGoals()
        );
    }

    private void parseAndStructureContent(AIGeneratedContent content, String aiResponse, String contentType) {
        content.setSubjectLine(null);
        content.setBodyContent(aiResponse.trim());

        if ("EMAIL".equalsIgnoreCase(contentType) || "EMAIL_BODY".equalsIgnoreCase(contentType)) {
            String[] lines = aiResponse.split("\n", 2);
            if (lines.length > 1 && lines[0].length() <= 100) {
                content.setSubjectLine(lines[0].replaceAll("^Subject:\\s*", "").trim());
                content.setBodyContent(lines[1].trim());
            }
        }
    }

    private void parseSuggestion(CampaignSuggestion suggestion, String aiResponse) {
        suggestion.setSuggestedName("AI Suggested Campaign");
        suggestion.setSuggestedType(CampaignType.CUSTOM);
        suggestion.setRecommendedChannels(List.of("PUSH", "EMAIL"));
    }

    private String getVariationInstruction(int index) {
        return switch (index % 4) {
            case 0 -> "more formal and professional";
            case 1 -> "more casual and friendly";
            case 2 -> "more urgent with scarcity messaging";
            case 3 -> "more benefit-focused and value-oriented";
            default -> "unique and creative";
        };
    }

    private String getVariationType(int index) {
        return switch (index % 4) {
            case 0 -> "FORMAL";
            case 1 -> "CASUAL";
            case 2 -> "URGENT";
            case 3 -> "BENEFIT_FOCUSED";
            default -> "CREATIVE";
        };
    }

    private Map<String, Object> executeCreateCampaign(AIAgentTaskRequest request) {
        String prompt = String.format("""
            Create a complete marketing campaign configuration based on:
            %s

            Return a structured campaign plan with:
            - Name, description, type
            - Target segment recommendation
            - Content for each channel
            - Scheduling recommendation
            - Success metrics
            """, request.getTaskData());

        String result = togetherAIService.generateContent(prompt, null, 0.8, 2000);
        return Map.of("campaignPlan", result, "status", "generated");
    }

    private Map<String, Object> executeOptimizeCampaign(AIAgentTaskRequest request) {
        Long campaignId = (Long) request.getTaskData().get("campaignId");
        MarketingCampaign campaign = campaignRepository.findById(campaignId)
            .orElseThrow(() -> new RuntimeException("Campaign not found"));

        String prompt = String.format("""
            Analyze and optimize this campaign:
            Name: %s
            Type: %s
            Current Content: %s

            Provide specific optimization recommendations.
            """, campaign.getName(), campaign.getCampaignType(), campaign.getContentText());

        String result = togetherAIService.generateContent(prompt, null, 0.7, 1500);
        return Map.of("optimizations", result, "campaignId", campaignId);
    }

    private Map<String, Object> executeAnalyzePerformance(AIAgentTaskRequest request) {
        String analysisResult = togetherAIService.generateContent(
            "Analyze campaign performance trends and provide insights: " + request.getTaskData(),
            null, 0.6, 1500
        );
        return Map.of("analysis", analysisResult);
    }

    private Map<String, Object> executeSuggestImprovements(AIAgentTaskRequest request) {
        String suggestions = togetherAIService.generateContent(
            "Suggest improvements for: " + request.getTaskData(),
            null, 0.8, 1500
        );
        return Map.of("suggestions", suggestions);
    }

    private Map<String, Object> executeGenerateReport(AIAgentTaskRequest request) {
        String report = togetherAIService.generateContent(
            "Generate a marketing performance report: " + request.getTaskData(),
            null, 0.5, 2000
        );
        return Map.of("report", report);
    }

    private Map<String, Object> executeAutoSegment(AIAgentTaskRequest request) {
        String segmentSuggestions = togetherAIService.generateContent(
            "Suggest new user segments based on: " + request.getTaskData(),
            null, 0.7, 1500
        );
        return Map.of("segmentSuggestions", segmentSuggestions);
    }
}
