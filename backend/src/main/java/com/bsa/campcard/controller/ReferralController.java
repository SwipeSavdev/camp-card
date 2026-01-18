package com.bsa.campcard.controller;

import com.bsa.campcard.dto.referral.*;
import com.bsa.campcard.service.ReferralService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
@Tag(name = "Referrals", description = "Referral system endpoints")
public class ReferralController {
    
    private final ReferralService referralService;
    
    @GetMapping("/my-code")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my referral code", description = "Get or generate user's referral code")
    public ResponseEntity<ReferralCodeResponse> getMyReferralCode(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Getting referral code for user: {}", userId);
        ReferralCodeResponse response = referralService.getUserReferralCode(userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/apply")
    @Operation(summary = "Apply referral code", description = "Apply referral code during registration")
    public ResponseEntity<Void> applyReferralCode(
            @Valid @RequestBody ApplyReferralRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Applying referral code: {}", request.getReferralCode());
        referralService.applyReferralCode(userId, request.getReferralCode());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-referrals")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my referrals", description = "Get list of users I have referred")
    public ResponseEntity<List<ReferralResponse>> getMyReferrals(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Getting referrals for user: {}", userId);
        List<ReferralResponse> referrals = referralService.getUserReferrals(userId);
        return ResponseEntity.ok(referrals);
    }

    @PostMapping("/{referralId}/claim")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Claim referral reward", description = "Claim reward for completed referral")
    public ResponseEntity<Void> claimReward(
            @PathVariable Long referralId,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Claiming reward for referral: {}", referralId);
        referralService.claimReward(userId, referralId);
        return ResponseEntity.ok().build();
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        org.bsa.campcard.domain.user.User user = (org.bsa.campcard.domain.user.User) authentication.getPrincipal();
        return user.getId();
    }
}
