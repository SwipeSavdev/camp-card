package com.bsa.campcard.controller;

import com.bsa.campcard.dto.merchant.*;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.service.MerchantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/merchants")
@RequiredArgsConstructor
@Tag(name = "Merchants", description = "Merchant management endpoints")
public class MerchantController {
    
    private final MerchantService merchantService;
    
    @PostMapping
    @Operation(summary = "Create merchant", description = "Submit merchant application")
    public ResponseEntity<MerchantResponse> createMerchant(
            @Valid @RequestBody CreateMerchantRequest request,
            Authentication authentication) {
        // In production, extract council ID from authenticated merchant user
        Long councilId = 1L; // Placeholder
        
        log.info("Creating merchant: {}", request.getBusinessName());
        
        MerchantResponse merchant = merchantService.createMerchant(request, councilId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(merchant);
    }
    
    @GetMapping
    @Operation(summary = "Get merchants", description = "List merchants with optional filters")
    public ResponseEntity<Page<MerchantResponse>> getMerchants(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Merchant.MerchantStatus merchantStatus = status != null 
                ? Merchant.MerchantStatus.valueOf(status.toUpperCase()) 
                : null;
        
        Page<MerchantResponse> merchants = merchantService.getMerchants(
                merchantStatus, search, pageable
        );
        
        return ResponseEntity.ok(merchants);
    }
    
    @GetMapping("/{merchantId}")
    @Operation(summary = "Get merchant", description = "Get merchant details by ID")
    public ResponseEntity<MerchantResponse> getMerchant(@PathVariable Long merchantId) {
        log.info("Fetching merchant: {}", merchantId);
        
        MerchantResponse merchant = merchantService.getMerchant(merchantId);
        
        return ResponseEntity.ok(merchant);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get merchants by category", description = "List approved merchants in category")
    public ResponseEntity<List<MerchantResponse>> getMerchantsByCategory(
            @PathVariable String category) {
        log.info("Fetching merchants in category: {}", category);
        
        List<MerchantResponse> merchants = merchantService.getMerchantsByCategory(category);
        
        return ResponseEntity.ok(merchants);
    }
    
    @PutMapping("/{merchantId}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Update merchant", description = "Update merchant information")
    public ResponseEntity<MerchantResponse> updateMerchant(
            @PathVariable Long merchantId,
            @Valid @RequestBody CreateMerchantRequest request,
            Authentication authentication) {
        log.info("Updating merchant: {}", merchantId);
        
        MerchantResponse merchant = merchantService.updateMerchant(merchantId, request);
        
        return ResponseEntity.ok(merchant);
    }
    
    @PostMapping("/{merchantId}/approve")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Approve/Reject merchant", description = "Process merchant application")
    public ResponseEntity<MerchantResponse> approveMerchant(
            @PathVariable Long merchantId,
            @Valid @RequestBody ApproveMerchantRequest request,
            Authentication authentication) {
        // In production, extract admin user ID from authentication
        UUID adminUserId = UUID.randomUUID(); // Placeholder
        
        log.info("Processing merchant approval: {}", merchantId);
        
        MerchantResponse merchant = merchantService.approveMerchant(
                merchantId, request, adminUserId
        );
        
        return ResponseEntity.ok(merchant);
    }
    
    @PatchMapping("/{merchantId}/status")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Update merchant status", description = "Suspend or reactivate merchant")
    public ResponseEntity<MerchantResponse> updateMerchantStatus(
            @PathVariable Long merchantId,
            @RequestParam String status) {
        log.info("Updating merchant status: {} to {}", merchantId, status);
        
        Merchant.MerchantStatus merchantStatus = Merchant.MerchantStatus.valueOf(status.toUpperCase());
        
        MerchantResponse merchant = merchantService.updateMerchantStatus(merchantId, merchantStatus);
        
        return ResponseEntity.ok(merchant);
    }
    
    @DeleteMapping("/{merchantId}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Delete merchant", description = "Soft delete merchant")
    public ResponseEntity<Void> deleteMerchant(@PathVariable Long merchantId) {
        log.info("Deleting merchant: {}", merchantId);
        
        merchantService.deleteMerchant(merchantId);
        
        return ResponseEntity.noContent().build();
    }
    
    // Location endpoints
    
    @PostMapping("/{merchantId}/locations")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Add location", description = "Add location to merchant")
    public ResponseEntity<MerchantLocationResponse> createLocation(
            @PathVariable Long merchantId,
            @Valid @RequestBody CreateLocationRequest request) {
        log.info("Creating location for merchant: {}", merchantId);
        
        MerchantLocationResponse location = merchantService.createLocation(merchantId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(location);
    }
    
    @GetMapping("/{merchantId}/locations")
    @Operation(summary = "Get merchant locations", description = "List all locations for merchant")
    public ResponseEntity<List<MerchantLocationResponse>> getMerchantLocations(
            @PathVariable Long merchantId) {
        log.info("Fetching locations for merchant: {}", merchantId);
        
        List<MerchantLocationResponse> locations = merchantService.getMerchantLocations(merchantId);
        
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/locations/nearby")
    @Operation(summary = "Find nearby locations", description = "Find merchant locations near coordinates")
    public ResponseEntity<List<MerchantLocationResponse>> findNearbyLocations(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "25.0") Double radiusKm) {
        log.info("Finding locations near: {}, {} within {} km", latitude, longitude, radiusKm);
        
        List<MerchantLocationResponse> locations = merchantService.findNearbyLocations(
                latitude, longitude, radiusKm
        );
        
        return ResponseEntity.ok(locations);
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get merchant statistics", description = "Get aggregate merchant stats")
    public ResponseEntity<MerchantService.MerchantStats> getMerchantStats() {
        log.info("Fetching merchant statistics");
        
        MerchantService.MerchantStats stats = merchantService.getMerchantStats();
        
        return ResponseEntity.ok(stats);
    }
}
