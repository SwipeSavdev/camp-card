package com.bsa.campcard.service.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TogetherAIService {

    @Value("${together.ai.api-key:}")
    private String apiKey;

    @Value("${together.ai.base-url:https://api.together.xyz/v1}")
    private String baseUrl;

    @Value("${together.ai.default-model:meta-llama/Llama-3.3-70B-Instruct-Turbo}")
    private String defaultModel;

    private final ObjectMapper objectMapper;

    private WebClient getWebClient() {
        return WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public String generateContent(String prompt) {
        return generateContent(prompt, defaultModel, 0.7, 1000);
    }

    public String generateContent(String prompt, String model, double temperature, int maxTokens) {
        try {
            ChatRequest request = new ChatRequest();
            request.setModel(model != null ? model : defaultModel);
            request.setTemperature(temperature);
            request.setMaxTokens(maxTokens);

            List<Message> messages = new ArrayList<>();
            messages.add(new Message("system", getSystemPrompt()));
            messages.add(new Message("user", prompt));
            request.setMessages(messages);

            String response = getWebClient()
                .post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("Error generating content with Together.AI: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI content: " + e.getMessage(), e);
        }
    }

    public Mono<String> generateContentAsync(String prompt, String model, double temperature, int maxTokens) {
        ChatRequest request = new ChatRequest();
        request.setModel(model != null ? model : defaultModel);
        request.setTemperature(temperature);
        request.setMaxTokens(maxTokens);

        List<Message> messages = new ArrayList<>();
        messages.add(new Message("system", getSystemPrompt()));
        messages.add(new Message("user", prompt));
        request.setMessages(messages);

        return getWebClient()
            .post()
            .uri("/chat/completions")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(String.class)
            .map(response -> {
                try {
                    JsonNode jsonNode = objectMapper.readTree(response);
                    return jsonNode.path("choices").get(0).path("message").path("content").asText();
                } catch (Exception e) {
                    throw new RuntimeException("Failed to parse AI response", e);
                }
            });
    }

    public String generateWithTools(String prompt, List<Tool> tools) {
        try {
            ChatRequest request = new ChatRequest();
            request.setModel(defaultModel);
            request.setTemperature(0.7);
            request.setMaxTokens(2000);

            List<Message> messages = new ArrayList<>();
            messages.add(new Message("system", getAgentSystemPrompt()));
            messages.add(new Message("user", prompt));
            request.setMessages(messages);
            request.setTools(tools);

            String response = getWebClient()
                .post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            return response;

        } catch (Exception e) {
            log.error("Error generating content with tools: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI content with tools: " + e.getMessage(), e);
        }
    }

    private String getSystemPrompt() {
        return """
            You are an expert marketing content creator for the BSA Camp Card program,
            a fundraising initiative for Boy Scouts of America. Your role is to create
            compelling, family-friendly marketing content that:

            1. Promotes local merchant offers and discounts
            2. Encourages participation in Scout fundraising
            3. Builds community engagement
            4. Drives user engagement and redemptions

            Guidelines:
            - Keep content professional yet friendly
            - Use action-oriented language
            - Include clear calls-to-action
            - Be concise and impactful
            - Avoid exaggeration or false claims
            - Maintain family-friendly tone appropriate for Scouts

            Format your responses as requested (email, push notification, SMS, etc.)
            """;
    }

    private String getAgentSystemPrompt() {
        return """
            You are an intelligent marketing AI agent for the BSA Camp Card program.
            You can analyze data, create campaigns, optimize content, and make decisions
            about marketing strategies.

            Your capabilities include:
            1. Analyzing user segments and engagement patterns
            2. Creating personalized marketing content
            3. Recommending optimal send times and channels
            4. A/B testing content variations
            5. Predicting campaign performance
            6. Adjusting campaigns based on real-time feedback

            When given a task, break it down into steps and execute them methodically.
            Always explain your reasoning and provide actionable recommendations.

            Use the provided tools when needed to gather data or take actions.
            """;
    }

    @Data
    public static class ChatRequest {
        private String model;
        private List<Message> messages;
        private double temperature;
        @JsonProperty("max_tokens")
        private int maxTokens;
        private List<Tool> tools;
    }

    @Data
    public static class Message {
        private String role;
        private String content;

        public Message() {}

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    @Data
    public static class Tool {
        private String type = "function";
        private Function function;

        @Data
        public static class Function {
            private String name;
            private String description;
            private Map<String, Object> parameters;
        }
    }
}
