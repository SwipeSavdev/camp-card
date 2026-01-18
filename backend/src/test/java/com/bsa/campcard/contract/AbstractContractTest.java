package com.bsa.campcard.contract;

import com.bsa.campcard.integration.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * Base class for API contract tests.
 *
 * Provides common utilities for testing API contracts including:
 * - Request/response schema validation
 * - Authentication helpers
 * - Content type assertions
 *
 * Contract tests verify that:
 * - Request schemas match expected DTOs
 * - Response schemas match expected DTOs
 * - Required fields are enforced
 * - Enum values match backend enums
 * - Error responses follow standard format
 */
@AutoConfigureMockMvc
public abstract class AbstractContractTest extends AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    // Standard content type for all API requests
    protected static final MediaType JSON = MediaType.APPLICATION_JSON;

    // Test credentials
    protected static final String TEST_ADMIN_EMAIL = "contract-admin@test.com";
    protected static final String TEST_ADMIN_PASSWORD = "ContractTest123!";
    protected static final String TEST_USER_EMAIL = "contract-user@test.com";
    protected static final String TEST_USER_PASSWORD = "ContractTest123!";

    /**
     * Perform GET request without authentication.
     */
    protected ResultActions getRequest(String url) throws Exception {
        return mockMvc.perform(get(url)
                .contentType(JSON)
                .accept(JSON))
                .andDo(print());
    }

    /**
     * Perform GET request with JWT authentication.
     */
    protected ResultActions getRequest(String url, String token) throws Exception {
        return mockMvc.perform(get(url)
                .contentType(JSON)
                .accept(JSON)
                .header("Authorization", "Bearer " + token))
                .andDo(print());
    }

    /**
     * Perform POST request without authentication.
     */
    protected ResultActions postRequest(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(JSON)
                .accept(JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andDo(print());
    }

    /**
     * Perform POST request with JWT authentication.
     */
    protected ResultActions postRequest(String url, Object body, String token) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(JSON)
                .accept(JSON)
                .header("Authorization", "Bearer " + token)
                .content(objectMapper.writeValueAsString(body)))
                .andDo(print());
    }

    /**
     * Perform PUT request with JWT authentication.
     */
    protected ResultActions putRequest(String url, Object body, String token) throws Exception {
        return mockMvc.perform(put(url)
                .contentType(JSON)
                .accept(JSON)
                .header("Authorization", "Bearer " + token)
                .content(objectMapper.writeValueAsString(body)))
                .andDo(print());
    }

    /**
     * Perform DELETE request with JWT authentication.
     */
    protected ResultActions deleteRequest(String url, String token) throws Exception {
        return mockMvc.perform(delete(url)
                .contentType(JSON)
                .accept(JSON)
                .header("Authorization", "Bearer " + token))
                .andDo(print());
    }

    /**
     * Perform PATCH request with JWT authentication.
     */
    protected ResultActions patchRequest(String url, Object body, String token) throws Exception {
        return mockMvc.perform(patch(url)
                .contentType(JSON)
                .accept(JSON)
                .header("Authorization", "Bearer " + token)
                .content(objectMapper.writeValueAsString(body)))
                .andDo(print());
    }

    /**
     * Extract access token from auth response.
     */
    protected String extractToken(MvcResult result) throws Exception {
        String content = result.getResponse().getContentAsString();
        return objectMapper.readTree(content).get("accessToken").asText();
    }

    /**
     * Convert object to JSON string.
     */
    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }
}
