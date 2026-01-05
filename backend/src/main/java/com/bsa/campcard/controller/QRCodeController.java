package com.bsa.campcard.controller;

import com.bsa.campcard.dto.qr.*;
import com.bsa.campcard.service.QRCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "QR Code & Sharing", description = "QR code generation and link sharing endpoints")
public class QRCodeController {

    private final QRCodeService qrCodeService;

    @GetMapping("/users/me/qr-code")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's QR code", description = "Generate or retrieve user's unique QR code for sharing")
    public ResponseEntity<QRCodeResponse> getMyQRCode(Authentication authentication) {
        // Extract user ID from authentication principal
        UUID userId = UUID.randomUUID(); // TODO: Extract from authentication
        log.info("Generating QR code for current user");

        QRCodeResponse response = qrCodeService.generateUserQRCode(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/qr-code")
    @PreAuthorize("hasAnyRole('COUNCIL_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get user's QR code by ID", description = "Admin endpoint to retrieve any user's QR code")
    public ResponseEntity<QRCodeResponse> getUserQRCode(@PathVariable UUID userId) {
        log.info("Generating QR code for user: {}", userId);
        QRCodeResponse response = qrCodeService.generateUserQRCode(userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/offers/generate-link")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate shareable link", description = "Create a unique shareable link for an offer")
    public ResponseEntity<ShareableLinkResponse> generateOfferLink(
            @Valid @RequestBody GenerateLinkRequest request,
            Authentication authentication) {
        // In real implementation, extract user ID from authentication
        if (request.getUserId() == null) {
            request.setUserId(1L); // Placeholder
        }
        
        log.info("Generating shareable link for offer: {}", request.getOfferId());
        ShareableLinkResponse response = qrCodeService.generateOfferLink(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/offers/link/{uniqueCode}")
    @Operation(summary = "Validate offer link", description = "Validate and retrieve offer data from unique code")
    public ResponseEntity<Map<String, Object>> validateOfferLink(@PathVariable String uniqueCode) {
        log.info("Validating offer link: {}", uniqueCode);
        Map<String, Object> linkData = qrCodeService.validateOfferLink(uniqueCode);
        return ResponseEntity.ok(linkData);
    }
    
    @GetMapping("/qr/validate/{uniqueCode}")
    @Operation(summary = "Validate QR code", description = "Validate user QR code and return user info")
    public ResponseEntity<QRCodeResponse> validateQRCode(@PathVariable String uniqueCode) {
        log.info("Validating QR code: {}", uniqueCode);
        QRCodeResponse response = qrCodeService.validateUserQRCode(uniqueCode);
        return ResponseEntity.ok(response);
    }
}
