package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.dto.offer.QrCodeData;
import com.bsa.campcard.dto.offer.QrScanRequest;
import com.bsa.campcard.dto.offer.QrScanResponse;
import com.bsa.campcard.service.OfferQrService;
import com.bsa.campcard.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Offer management and QR code redemption endpoints")
public class OfferController {

    private final OfferService offerService;
    private final OfferQrService offerQrService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<OfferResponse> createOffer(@RequestBody CreateOfferRequest request) {
        OfferResponse offer = offerService.createOffer(request);
        return ResponseEntity.ok(offer);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<OfferResponse> updateOffer(
            @PathVariable Long id,
            @RequestBody CreateOfferRequest request) {
        OfferResponse offer = offerService.updateOffer(id, request);
        return ResponseEntity.ok(offer);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOffer(@PathVariable Long id) {
        OfferResponse offer = offerService.getOffer(id);
        return ResponseEntity.ok(offer);
    }
    
    @GetMapping
    public ResponseEntity<Page<OfferResponse>> getOffers(
            @RequestParam(required = false) Long merchantId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<OfferResponse> offers;
        
        if (search != null && !search.trim().isEmpty()) {
            offers = offerService.searchOffers(search, pageable);
        } else if (merchantId != null) {
            offers = offerService.getMerchantOffers(merchantId, pageable);
        } else if (category != null) {
            offers = offerService.getOffersByCategory(category, pageable);
        } else if (featured) {
            offers = offerService.getFeaturedOffers(pageable);
        } else {
            offers = offerService.getActiveOffers(pageable);
        }
        
        return ResponseEntity.ok(offers);
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<OfferResponse>> getActiveOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferResponse> offers = offerService.getActiveOffers(pageable);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/active/user/{userId}")
    public ResponseEntity<Page<OfferResponse>> getActiveOffersForUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferResponse> offers = offerService.getActiveOffersForUser(userId, pageable);
        return ResponseEntity.ok(offers);
    }
    
    @GetMapping("/featured")
    public ResponseEntity<Page<OfferResponse>> getFeaturedOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<OfferResponse> offers = offerService.getFeaturedOffers(pageable);
        return ResponseEntity.ok(offers);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<OfferResponse>> getOffersByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferResponse> offers = offerService.getOffersByCategory(category, pageable);
        return ResponseEntity.ok(offers);
    }
    
    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<Page<OfferResponse>> getMerchantOffers(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferResponse> offers = offerService.getMerchantOffers(merchantId, pageable);
        return ResponseEntity.ok(offers);
    }
    
    @PostMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> pauseOffer(@PathVariable Long id) {
        offerService.pauseOffer(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> resumeOffer(@PathVariable Long id) {
        offerService.resumeOffer(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.ok().build();
    }
    
    // Redemption endpoints
    
    @PostMapping("/redeem")
    public ResponseEntity<OfferRedemptionResponse> redeemOffer(@RequestBody RedeemOfferRequest request) {
        OfferRedemptionResponse redemption = offerService.redeemOffer(request);
        return ResponseEntity.ok(redemption);
    }
    
    @PostMapping("/verify/{verificationCode}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<OfferRedemptionResponse> verifyRedemption(
            @PathVariable String verificationCode,
            @RequestParam UUID verifierId) {
        OfferRedemptionResponse redemption = offerService.verifyRedemption(verificationCode, verifierId);
        return ResponseEntity.ok(redemption);
    }
    
    @GetMapping("/redemptions/user/{userId}")
    public ResponseEntity<Page<OfferRedemptionResponse>> getUserRedemptions(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferRedemptionResponse> redemptions = offerService.getUserRedemptions(userId, pageable);
        return ResponseEntity.ok(redemptions);
    }
    
    @GetMapping("/redemptions/merchant/{merchantId}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Page<OfferRedemptionResponse>> getMerchantRedemptions(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferRedemptionResponse> redemptions = offerService.getMerchantRedemptions(merchantId, pageable);
        return ResponseEntity.ok(redemptions);
    }

    // ==================== QR Code Endpoints ====================

    /**
     * Generate a unique QR code for the authenticated user to redeem an offer.
     * The QR code contains an HMAC-signed token that prevents forgery and enables abuse detection.
     *
     * Flow: Parent → Offers → Click Redeem → Shows QR Code → Merchant Scans
     */
    @PostMapping("/{offerId}/qr-code")
    @PreAuthorize("hasAnyRole('PARENT', 'SCOUT', 'UNIT_LEADER', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Generate QR code for offer redemption",
               description = "Generate a unique, signed QR code token for the logged-in user (Parent/Scout) " +
                           "to redeem a one-time offer. The token includes abuse detection tracking.")
    public ResponseEntity<QrCodeData> generateQrCode(@PathVariable Long offerId) {
        // Get the authenticated user's ID from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        org.bsa.campcard.domain.user.User user = (org.bsa.campcard.domain.user.User) authentication.getPrincipal();
        UUID userId = user.getId();

        QrCodeData qrData = offerQrService.generateQrCode(offerId, userId);
        return ResponseEntity.ok(qrData);
    }

    /**
     * Scan and validate a QR code for offer redemption.
     * This endpoint is called by merchants when scanning a customer's QR code.
     * It tracks scan attempts and detects potential abuse (screenshot sharing, multiple devices, etc.)
     */
    @PostMapping("/qr-code/scan")
    @Operation(summary = "Scan QR code for redemption",
               description = "Validate and process a QR code scan. Tracks scan attempts and detects abuse patterns " +
                           "like screenshot sharing, multiple device scans, and impossible travel.")
    public ResponseEntity<QrScanResponse> scanQrCode(
            @Valid @RequestBody QrScanRequest request,
            HttpServletRequest httpRequest) {

        // Auto-populate IP address if not provided
        if (request.getIpAddress() == null) {
            request.setIpAddress(getClientIpAddress(httpRequest));
        }

        // Auto-populate user agent if not provided
        if (request.getUserAgent() == null) {
            request.setUserAgent(httpRequest.getHeader("User-Agent"));
        }

        QrScanResponse response = offerQrService.processScan(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the client's real IP address, handling proxies and load balancers.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs; the first one is the client
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
