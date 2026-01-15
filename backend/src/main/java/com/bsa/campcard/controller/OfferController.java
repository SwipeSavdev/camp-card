package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {
    
    private final OfferService offerService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<OfferResponse> createOffer(@RequestBody CreateOfferRequest request) {
        OfferResponse offer = offerService.createOffer(request);
        return ResponseEntity.ok(offer);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
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
            // For admin dashboard, return all offers (not filtered by validity dates)
            offers = offerService.getAllOffers(pageable);
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
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> pauseOffer(@PathVariable Long id) {
        offerService.pauseOffer(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> resumeOffer(@PathVariable Long id) {
        offerService.resumeOffer(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
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
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
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
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Page<OfferRedemptionResponse>> getMerchantRedemptions(
            @PathVariable Long merchantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OfferRedemptionResponse> redemptions = offerService.getMerchantRedemptions(merchantId, pageable);
        return ResponseEntity.ok(redemptions);
    }
}
