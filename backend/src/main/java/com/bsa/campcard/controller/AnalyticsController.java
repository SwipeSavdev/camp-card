package com.bsa.campcard.controller;

import com.bsa.campcard.dto.WalletAnalyticsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics", description = "User analytics and statistics endpoints")
public class AnalyticsController {

    @GetMapping("/wallet")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get wallet analytics", description = "Returns wallet statistics for the authenticated user")
    public ResponseEntity<WalletAnalyticsResponse> getWalletAnalytics(Authentication authentication) {
        log.info("Wallet analytics requested for user: {}", authentication.getName());

        // TODO: Implement actual analytics calculation from database
        // For now, return mock data to fix the 404 error
        WalletAnalyticsResponse response = WalletAnalyticsResponse.builder()
                .totalRedemptions(0)
                .totalSavings(0.0)
                .thisMonth(0)
                .favoriteCategory("None yet")
                .build();

        return ResponseEntity.ok(response);
    }
}
