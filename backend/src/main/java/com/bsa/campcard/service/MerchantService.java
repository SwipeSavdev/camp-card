package com.bsa.campcard.service;

import com.bsa.campcard.dto.merchant.*;
import com.bsa.campcard.entity.Merchant;
import com.bsa.campcard.entity.MerchantLocation;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.MerchantLocationRepository;
import com.bsa.campcard.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;
    private final MerchantLocationRepository locationRepository;
    private final EmailService emailService;
    
    /**
     * Create new merchant application
     */
    @Transactional
    public MerchantResponse createMerchant(CreateMerchantRequest request, Long councilId) {
        log.info("Creating merchant: {}", request.getBusinessName());
        
        // Validate terms accepted
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new IllegalArgumentException("Terms must be accepted");
        }
        
        // Create merchant
        Merchant merchant = Merchant.builder()
                .councilId(councilId)
                .businessName(request.getBusinessName())
                .dbaName(request.getDbaName())
                .description(request.getDescription())
                .category(request.getCategory())
                .taxId(request.getTaxId())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .websiteUrl(request.getWebsiteUrl())
                .logoUrl(request.getLogoUrl())
                .businessHours(request.getBusinessHours())
                .status(Merchant.MerchantStatus.PENDING)
                .termsAccepted(true)
                .termsAcceptedAt(LocalDateTime.now())
                .build();
        
        merchant = merchantRepository.save(merchant);
        
        // Create primary location if provided
        if (request.getPrimaryLocation() != null) {
            createLocation(merchant.getId(), request.getPrimaryLocation());
        }
        
        log.info("Merchant created with ID: {}", merchant.getId());

        // Send welcome email to merchant
        emailService.sendMerchantWelcomeEmail(
                merchant.getContactEmail(),
                merchant.getBusinessName(),
                merchant.getContactName()
        );

        return toMerchantResponse(merchant);
    }
    
    /**
     * Get merchant by ID
     */
    public MerchantResponse getMerchant(Long merchantId) {
        log.info("Fetching merchant: {}", merchantId);
        
        Merchant merchant = merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        
        return toMerchantResponse(merchant);
    }
    
    /**
     * Get all merchants with filters
     */
    public Page<MerchantResponse> getMerchants(
            Merchant.MerchantStatus status,
            String searchTerm,
            Pageable pageable) {
        log.info("Fetching merchants with status: {}, search: {}", status, searchTerm);
        
        Page<Merchant> merchants;
        
        if (searchTerm != null && !searchTerm.isEmpty()) {
            merchants = merchantRepository.searchMerchants(searchTerm, pageable);
        } else if (status != null) {
            merchants = merchantRepository.findByStatusAndDeletedAtIsNull(status, pageable);
        } else {
            // Exclude soft-deleted merchants
            merchants = merchantRepository.findByDeletedAtIsNull(pageable);
        }
        
        return merchants.map(this::toMerchantResponse);
    }
    
    /**
     * Get merchants by category
     */
    public List<MerchantResponse> getMerchantsByCategory(String category) {
        log.info("Fetching merchants in category: {}", category);
        
        List<Merchant> merchants = merchantRepository.findByCategory(category);
        
        return merchants.stream()
                .map(this::toMerchantResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Approve or reject merchant application
     */
    @Transactional
    public MerchantResponse approveMerchant(Long merchantId, ApproveMerchantRequest request, UUID adminUserId) {
        log.info("Processing merchant approval: {} - {}", merchantId, request.getAction());
        
        Merchant merchant = merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        
        if (merchant.getStatus() != Merchant.MerchantStatus.PENDING) {
            throw new IllegalStateException("Merchant has already been processed");
        }
        
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            merchant.setStatus(Merchant.MerchantStatus.APPROVED);
            merchant.setApprovedAt(LocalDateTime.now());
            merchant.setApprovedBy(adminUserId);

            log.info("Merchant approved: {}", merchantId);

            // Send approval email to merchant
            emailService.sendMerchantApprovalEmail(
                    merchant.getContactEmail(),
                    merchant.getBusinessName(),
                    merchant.getContactName()
            );
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            merchant.setStatus(Merchant.MerchantStatus.REJECTED);
            merchant.setRejectionReason(request.getRejectionReason());

            log.info("Merchant rejected: {}", merchantId);

            // Send rejection email with reason
            emailService.sendMerchantRejectionEmail(
                    merchant.getContactEmail(),
                    merchant.getBusinessName(),
                    merchant.getContactName(),
                    request.getRejectionReason() != null ? request.getRejectionReason() : "Your application did not meet our requirements at this time."
            );
        } else {
            throw new IllegalArgumentException("Invalid action. Must be APPROVE or REJECT");
        }
        
        merchant = merchantRepository.save(merchant);
        
        return toMerchantResponse(merchant);
    }
    
    /**
     * Update merchant
     */
    @Transactional
    public MerchantResponse updateMerchant(Long merchantId, CreateMerchantRequest request) {
        log.info("Updating merchant: {}", merchantId);
        
        Merchant merchant = merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        
        // Update fields
        merchant.setBusinessName(request.getBusinessName());
        merchant.setDbaName(request.getDbaName());
        merchant.setDescription(request.getDescription());
        merchant.setCategory(request.getCategory());
        merchant.setContactName(request.getContactName());
        merchant.setContactEmail(request.getContactEmail());
        merchant.setContactPhone(request.getContactPhone());
        merchant.setWebsiteUrl(request.getWebsiteUrl());
        merchant.setLogoUrl(request.getLogoUrl());
        merchant.setBusinessHours(request.getBusinessHours());
        
        merchant = merchantRepository.save(merchant);
        
        return toMerchantResponse(merchant);
    }
    
    /**
     * Suspend or reactivate merchant
     */
    @Transactional
    public MerchantResponse updateMerchantStatus(Long merchantId, Merchant.MerchantStatus status) {
        log.info("Updating merchant status: {} to {}", merchantId, status);
        
        Merchant merchant = merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        
        merchant.setStatus(status);
        merchant = merchantRepository.save(merchant);
        
        return toMerchantResponse(merchant);
    }
    
    /**
     * Delete merchant (soft delete)
     */
    @Transactional
    public void deleteMerchant(Long merchantId) {
        log.info("Deleting merchant: {}", merchantId);
        
        Merchant merchant = merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        
        merchant.setDeletedAt(LocalDateTime.now());
        merchant.setStatus(Merchant.MerchantStatus.INACTIVE);
        merchantRepository.save(merchant);
    }
    
    /**
     * Add location to merchant
     */
    @Transactional
    public MerchantLocationResponse createLocation(Long merchantId, CreateLocationRequest request) {
        log.info("Creating location for merchant: {}", merchantId);

        // Validate merchant exists
        merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        MerchantLocation location = MerchantLocation.builder()
                .merchantId(merchantId)
                .locationName(request.getLocationName())
                .streetAddress(request.getStreetAddress())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .hours(request.getHours())
                .primaryLocation(request.getPrimaryLocation())
                .active(true)
                .build();
        
        location = locationRepository.save(location);
        
        log.info("Location created: {}", location.getId());
        
        return toLocationResponse(location);
    }
    
    /**
     * Get merchant locations
     */
    public List<MerchantLocationResponse> getMerchantLocations(Long merchantId) {
        log.info("Fetching locations for merchant: {}", merchantId);
        
        List<MerchantLocation> locations = locationRepository.findByMerchantIdAndDeletedAtIsNull(merchantId);
        
        return locations.stream()
                .map(this::toLocationResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete location (soft delete)
     */
    @Transactional
    public void deleteLocation(Long merchantId, Long locationId) {
        log.info("Deleting location {} for merchant: {}", locationId, merchantId);

        // Validate merchant exists
        merchantRepository.findByIdAndDeletedAtIsNull(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));

        MerchantLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        // Verify location belongs to this merchant
        if (!location.getMerchantId().equals(merchantId)) {
            throw new IllegalArgumentException("Location does not belong to this merchant");
        }

        // Soft delete the location
        location.setDeletedAt(LocalDateTime.now());
        location.setActive(false);
        locationRepository.save(location);

        log.info("Location deleted: {}", locationId);
    }

    /**
     * Find nearby merchant locations
     */
    public List<MerchantLocationResponse> findNearbyLocations(
            BigDecimal latitude, 
            BigDecimal longitude, 
            Double radiusKm) {
        log.info("Finding locations near: {}, {} within {} km", latitude, longitude, radiusKm);
        
        List<MerchantLocation> locations = locationRepository.findNearby(
                latitude, longitude, radiusKm
        );
        
        return locations.stream()
                .map(this::toLocationResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get merchant statistics
     */
    public MerchantStats getMerchantStats() {
        Long pending = merchantRepository.countByStatusAndDeletedAtIsNull(Merchant.MerchantStatus.PENDING);
        Long approved = merchantRepository.countByStatusAndDeletedAtIsNull(Merchant.MerchantStatus.APPROVED);
        Long rejected = merchantRepository.countByStatusAndDeletedAtIsNull(Merchant.MerchantStatus.REJECTED);
        
        return MerchantStats.builder()
                .totalPending(pending)
                .totalApproved(approved)
                .totalRejected(rejected)
                .build();
    }
    
    // Helper methods
    
    private MerchantResponse toMerchantResponse(Merchant merchant) {
        List<MerchantLocation> locations = locationRepository.findByMerchantIdAndDeletedAtIsNull(merchant.getId());
        
        return MerchantResponse.builder()
                .id(merchant.getId())
                .uuid(merchant.getUuid())
                .businessName(merchant.getBusinessName())
                .dbaName(merchant.getDbaName())
                .description(merchant.getDescription())
                .category(merchant.getCategory())
                .contactName(merchant.getContactName())
                .contactEmail(merchant.getContactEmail())
                .contactPhone(merchant.getContactPhone())
                .websiteUrl(merchant.getWebsiteUrl())
                .logoUrl(merchant.getLogoUrl())
                .status(merchant.getStatus().name())
                .totalOffers(merchant.getTotalOffers())
                .activeOffers(merchant.getActiveOffers())
                .totalRedemptions(merchant.getTotalRedemptions())
                .locations(locations.stream()
                        .map(this::toLocationResponse)
                        .collect(Collectors.toList()))
                .build();
    }
    
    private MerchantLocationResponse toLocationResponse(MerchantLocation location) {
        return MerchantLocationResponse.builder()
                .id(location.getId())
                .uuid(location.getUuid())
                .locationName(location.getLocationName())
                .streetAddress(location.getStreetAddress())
                .addressLine2(location.getAddressLine2())
                .city(location.getCity())
                .state(location.getState())
                .zipCode(location.getZipCode())
                .country(location.getCountry())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .phone(location.getPhone())
                .hours(location.getHours())
                .primaryLocation(location.getPrimaryLocation())
                .active(location.getActive())
                .build();
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MerchantStats {
        private Long totalPending;
        private Long totalApproved;
        private Long totalRejected;
    }
}
