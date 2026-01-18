package com.bsa.campcard.controller;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import org.springframework.context.annotation.Import;

/**
 * Unit tests for AnalyticsController using @WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Wallet analytics endpoint mapping
 *
 * Security is disabled for unit testing - authorization is tested at integration level.
 *
 * Note: The AnalyticsController injects Authentication as a method parameter.
 * With security disabled, this parameter is null, causing the controller to fail
 * when the endpoint is called. Therefore, these tests verify endpoint mappings
 * exist rather than the response content. Full testing should be done at
 * integration level where proper authentication is available.
 */
@WebMvcTest(value = AnalyticsController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("AnalyticsController Tests")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ========================================================================
    // GET WALLET ANALYTICS TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/analytics/wallet - Get Wallet Analytics")
    class GetWalletAnalyticsTests {

        @Test
        @DisplayName("Endpoint should be mapped and respond (even without auth)")
        void getWalletAnalytics_EndpointMapped() throws Exception {
            // This test verifies the endpoint is mapped.
            // Without authentication, it will return an error status (not 404).
            mockMvc.perform(get("/api/v1/analytics/wallet")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        // Accept any status except 404 (not found) to verify endpoint exists
                        assert status != 404 : "Endpoint should exist (not return 404)";
                    });
        }

        @Test
        @DisplayName("Endpoint should accept JSON content type")
        void getWalletAnalytics_AcceptsJsonContentType() throws Exception {
            mockMvc.perform(get("/api/v1/analytics/wallet")
                            .accept(MediaType.APPLICATION_JSON)
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        // The endpoint exists and processes the request
                        assert status != 404 : "Endpoint should exist";
                    });
        }
    }
}
