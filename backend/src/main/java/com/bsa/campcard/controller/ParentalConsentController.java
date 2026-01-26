package com.bsa.campcard.controller;

import com.bsa.campcard.dto.auth.MessageResponse;
import com.bsa.campcard.entity.ParentalConsent;
import com.bsa.campcard.service.AuthService;
import com.bsa.campcard.service.ParentalConsentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for COPPA parental consent management.
 * Handles consent requests, verification, and status updates.
 */
@RestController
@RequestMapping("/api/v1/consent")
@RequiredArgsConstructor
@Tag(name = "Parental Consent", description = "COPPA parental consent management endpoints")
@Slf4j
public class ParentalConsentController {

    private final ParentalConsentService consentService;
    private final AuthService authService;

    // ========================================================================
    // PUBLIC ENDPOINTS (for parent consent verification)
    // ========================================================================

    /**
     * Get consent verification page data by token.
     * This endpoint is public as parents may not have accounts.
     */
    @GetMapping("/verify/{token}")
    @Operation(summary = "Get consent verification details for a token")
    public ResponseEntity<ConsentVerificationResponse> getConsentVerificationDetails(
            @PathVariable String token
    ) {
        return consentService.getConsentVerificationDetails(token)
                .map(details -> ResponseEntity.ok(new ConsentVerificationResponse(
                        details.consentId(),
                        details.minorName(),
                        details.minorDateOfBirth() != null ? details.minorDateOfBirth().toString() : null,
                        details.parentName(),
                        details.status().name(),
                        details.tokenValid()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ConsentVerificationResponse(null, null, null, null, "INVALID", false)));
    }

    /**
     * Submit parent's consent decision.
     * This endpoint is public as parents may not have accounts.
     */
    @PostMapping("/verify/{token}")
    @Operation(summary = "Submit parent consent decision")
    public ResponseEntity<ConsentDecisionResponse> submitConsentDecision(
            @PathVariable String token,
            @Valid @RequestBody ConsentDecisionRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");

            ParentalConsent consent = consentService.processConsentDecision(
                    token,
                    request.granted(),
                    request.locationConsent(),
                    request.marketingConsent(),
                    ipAddress,
                    userAgent
            );

            return ResponseEntity.ok(new ConsentDecisionResponse(
                    consent.getId(),
                    consent.getConsentStatus().name(),
                    consent.isLocationAllowed(),
                    request.granted() ? "Consent granted successfully" : "Consent decision recorded"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ConsentDecisionResponse(null, "INVALID", false, e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ConsentDecisionResponse(null, "EXPIRED", false, e.getMessage()));
        }
    }

    // ========================================================================
    // AUTHENTICATED ENDPOINTS (for logged-in users)
    // ========================================================================

    /**
     * Get current user's consent status.
     */
    @GetMapping("/my-status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's consent status")
    public ResponseEntity<ConsentStatusResponse> getMyConsentStatus(
            @RequestHeader("Authorization") String authHeader
    ) {
        UUID userId = extractUserId(authHeader);
        return consentService.getConsentForUser(userId)
                .map(consent -> ResponseEntity.ok(new ConsentStatusResponse(
                        consent.getConsentStatus().name(),
                        consent.isLocationAllowed(),
                        consent.getParentEmail(),
                        maskEmail(consent.getParentEmail()),
                        consent.getConsentGrantedAt() != null ? consent.getConsentGrantedAt().toString() : null
                )))
                .orElse(ResponseEntity.ok(new ConsentStatusResponse(
                        "NOT_REQUIRED", true, null, null, null
                )));
    }

    /**
     * Resend consent request email to parent.
     */
    @PostMapping("/resend")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Resend consent request email to parent")
    public ResponseEntity<MessageResponse> resendConsentRequest(
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            UUID userId = extractUserId(authHeader);
            consentService.resendConsentRequest(userId);
            return ResponseEntity.ok(new MessageResponse("Consent request email sent to your parent"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update parent email and resend consent request.
     */
    @PostMapping("/update-parent")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update parent email and resend consent request")
    public ResponseEntity<MessageResponse> updateParentAndResend(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateParentRequest request
    ) {
        try {
            UUID userId = extractUserId(authHeader);
            consentService.updateParentAndResend(userId, request.parentEmail(), request.parentName());
            return ResponseEntity.ok(new MessageResponse("Consent request sent to new parent email"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // ========================================================================
    // PARENT MANAGEMENT ENDPOINTS (for parents with accounts)
    // ========================================================================

    /**
     * Update location consent toggle for a child.
     */
    @PutMapping("/children/{minorUserId}/location")
    @PreAuthorize("hasAnyRole('PARENT')")
    @Operation(summary = "Toggle location consent for a child")
    public ResponseEntity<MessageResponse> updateLocationConsent(
            @PathVariable UUID minorUserId,
            @RequestBody LocationConsentRequest request
    ) {
        try {
            consentService.updateLocationConsent(minorUserId, request.enabled());
            return ResponseEntity.ok(new MessageResponse(
                    request.enabled() ? "Location access enabled for your child" : "Location access disabled for your child"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Revoke consent for a child.
     */
    @PostMapping("/children/{minorUserId}/revoke")
    @PreAuthorize("hasAnyRole('PARENT')")
    @Operation(summary = "Revoke consent for a child")
    public ResponseEntity<MessageResponse> revokeConsent(
            @PathVariable UUID minorUserId,
            @RequestBody(required = false) RevokeConsentRequest request
    ) {
        try {
            String reason = request != null ? request.reason() : null;
            consentService.revokeConsent(minorUserId, reason);
            return ResponseEntity.ok(new MessageResponse("Consent has been revoked. Your child's app access has been restricted."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // ========================================================================
    // ADMIN ENDPOINTS (for Unit Leaders managing scouts)
    // ========================================================================

    /**
     * Get consent status for a scout (Unit Leader only).
     */
    @GetMapping("/scouts/{scoutUserId}/status")
    @PreAuthorize("hasAnyRole('UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN')")
    @Operation(summary = "Get consent status for a scout")
    public ResponseEntity<ConsentStatusResponse> getScoutConsentStatus(
            @PathVariable UUID scoutUserId
    ) {
        return consentService.getConsentForUser(scoutUserId)
                .map(consent -> ResponseEntity.ok(new ConsentStatusResponse(
                        consent.getConsentStatus().name(),
                        consent.isLocationAllowed(),
                        consent.getParentEmail(),
                        maskEmail(consent.getParentEmail()),
                        consent.getConsentGrantedAt() != null ? consent.getConsentGrantedAt().toString() : null
                )))
                .orElse(ResponseEntity.ok(new ConsentStatusResponse(
                        "NOT_REQUIRED", true, null, null, null
                )));
    }

    /**
     * Resend consent email for a scout (Unit Leader only).
     */
    @PostMapping("/scouts/{scoutUserId}/resend")
    @PreAuthorize("hasAnyRole('UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN')")
    @Operation(summary = "Resend consent request for a scout")
    public ResponseEntity<MessageResponse> resendScoutConsent(
            @PathVariable UUID scoutUserId
    ) {
        try {
            consentService.resendConsentRequest(scoutUserId);
            return ResponseEntity.ok(new MessageResponse("Consent request email sent to parent"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // ========================================================================
    // DTOs
    // ========================================================================

    public record ConsentVerificationResponse(
            UUID consentId,
            String minorName,
            String minorDateOfBirth,
            String parentName,
            String status,
            boolean tokenValid
    ) {}

    public record ConsentDecisionRequest(
            boolean granted,
            boolean locationConsent,
            boolean marketingConsent
    ) {}

    public record ConsentDecisionResponse(
            UUID consentId,
            String status,
            boolean locationAllowed,
            String message
    ) {}

    public record ConsentStatusResponse(
            String status,
            boolean locationAllowed,
            String parentEmail,
            String parentEmailMasked,
            String consentGrantedAt
    ) {}

    public record UpdateParentRequest(
            @NotBlank @Email String parentEmail,
            @NotBlank String parentName
    ) {}

    public record LocationConsentRequest(boolean enabled) {}

    public record RevokeConsentRequest(String reason) {}

    // ========================================================================
    // Helper methods
    // ========================================================================

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return authService.getUserIdFromToken(token);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return local.charAt(0) + "****@" + domain;
        }
        return local.charAt(0) + "****" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
