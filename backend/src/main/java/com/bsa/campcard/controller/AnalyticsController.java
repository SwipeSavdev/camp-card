package com.bsa.campcard.controller;

import com.bsa.campcard.dto.WalletAnalyticsResponse;
import com.bsa.campcard.repository.OfferRedemptionRepository;
import com.bsa.campcard.repository.ReferralRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics", description = "User analytics and statistics endpoints")
public class AnalyticsController {

    private final OfferRedemptionRepository offerRedemptionRepository;
    private final ReferralRepository referralRepository;

    @GetMapping("/wallet")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get wallet analytics", description = "Returns wallet statistics for the authenticated user")
    public ResponseEntity<WalletAnalyticsResponse> getWalletAnalytics(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UUID userId = user.getId();
        log.info("Wallet analytics requested for user: {}", userId);

        long totalRedemptions = offerRedemptionRepository.countCompletedByUserId(userId);
        BigDecimal totalSavings = offerRedemptionRepository.sumSavingsByUserId(userId);
        long thisMonth = offerRedemptionRepository.countCompletedByUserIdSince(
                userId, LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0));

        int referralsMade = referralRepository.findByReferrerId(userId).size();
        Long successfulReferrals = referralRepository.countSuccessfulReferrals(userId);

        WalletAnalyticsResponse response = WalletAnalyticsResponse.builder()
                .totalRedemptions((int) totalRedemptions)
                .totalSavings(totalSavings != null ? totalSavings.doubleValue() : 0.0)
                .thisMonth((int) thisMonth)
                .favoriteCategory("None yet")
                .referralsMade(referralsMade)
                .referralChain(successfulReferrals != null ? successfulReferrals.intValue() : 0)
                .recentSavings(totalSavings != null ? totalSavings.doubleValue() : 0.0)
                .build();

        return ResponseEntity.ok(response);
    }
}
