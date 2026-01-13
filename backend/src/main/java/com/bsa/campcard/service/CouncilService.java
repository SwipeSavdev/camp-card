package com.bsa.campcard.service;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Council.CouncilStatus;
import com.bsa.campcard.repository.CouncilRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouncilService {
    
    private final CouncilRepository councilRepository;
    
    @Transactional
    public Council createCouncil(Council council) {
        log.info("Creating new council: {}", council.getName());
        
        // Auto-generate council number if not provided
        if (council.getCouncilNumber() == null || council.getCouncilNumber().trim().isEmpty()) {
            council.setCouncilNumber(generateCouncilNumber());
            log.info("Auto-generated council number: {}", council.getCouncilNumber());
        }
        
        // Validate council number is unique
        if (councilRepository.existsByCouncilNumber(council.getCouncilNumber())) {
            throw new IllegalArgumentException("Council number already exists: " + council.getCouncilNumber());
        }
        
        // Set default region if not provided (region is required)
        // Valid regions: NORTHEAST, SOUTHEAST, CENTRAL, SOUTHERN, WESTERN
        if (council.getRegion() == null || council.getRegion().trim().isEmpty()) {
            council.setRegion("CENTRAL");
            log.info("Set default region: CENTRAL");
        }
        
        // Set default status if not provided
        if (council.getStatus() == null) {
            council.setStatus(CouncilStatus.ACTIVE);
        }
        
        Council savedCouncil = councilRepository.save(council);
        log.info("Council created successfully with ID: {}", savedCouncil.getId());
        return savedCouncil;
    }
    
    private String generateCouncilNumber() {
        // Generate a unique council number in format CNL-XXXXX
        String prefix = "CNL-";
        int maxAttempts = 100;
        
        for (int i = 0; i < maxAttempts; i++) {
            // Generate a random 5-digit number
            int randomNum = (int) (Math.random() * 90000) + 10000;
            String councilNumber = prefix + randomNum;
            
            if (!councilRepository.existsByCouncilNumber(councilNumber)) {
                return councilNumber;
            }
        }
        
        // Fallback to timestamp-based number if random generation fails
        long timestamp = System.currentTimeMillis() % 100000;
        return prefix + String.format("%05d", timestamp);
    }
    
    public Optional<Council> getCouncilById(Long id) {
        return councilRepository.findById(id);
    }
    
    public Optional<Council> getCouncilByUuid(UUID uuid) {
        return councilRepository.findByUuid(uuid);
    }
    
    public Optional<Council> getCouncilByCouncilNumber(String councilNumber) {
        return councilRepository.findByCouncilNumber(councilNumber);
    }
    
    public Page<Council> getAllCouncils(Pageable pageable) {
        return councilRepository.findAll(pageable);
    }
    
    public Page<Council> getCouncilsByStatus(CouncilStatus status, Pageable pageable) {
        return councilRepository.findByStatus(status, pageable);
    }
    
    public Page<Council> getCouncilsByRegion(String region, Pageable pageable) {
        return councilRepository.findByRegion(region, pageable);
    }
    
    public Page<Council> searchCouncils(String search, Pageable pageable) {
        return councilRepository.searchCouncils(search, pageable);
    }
    
    public Page<Council> getTopPerformingCouncils(Pageable pageable) {
        return councilRepository.findTopPerformingCouncils(pageable);
    }
    
    public List<Council> getCouncilsByState(String state) {
        return councilRepository.findByState(state);
    }
    
    @Transactional
    public Council updateCouncil(Long id, Council councilUpdates) {
        log.info("Updating council with ID: {}", id);
        
        Council existingCouncil = councilRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Council not found with ID: " + id));
        
        // Update fields
        if (councilUpdates.getName() != null) {
            existingCouncil.setName(councilUpdates.getName());
        }
        if (councilUpdates.getShortName() != null) {
            existingCouncil.setShortName(councilUpdates.getShortName());
        }
        if (councilUpdates.getRegion() != null) {
            existingCouncil.setRegion(councilUpdates.getRegion());
        }
        if (councilUpdates.getStreetAddress() != null) {
            existingCouncil.setStreetAddress(councilUpdates.getStreetAddress());
        }
        if (councilUpdates.getCity() != null) {
            existingCouncil.setCity(councilUpdates.getCity());
        }
        if (councilUpdates.getState() != null) {
            existingCouncil.setState(councilUpdates.getState());
        }
        if (councilUpdates.getZipCode() != null) {
            existingCouncil.setZipCode(councilUpdates.getZipCode());
        }
        if (councilUpdates.getPhone() != null) {
            existingCouncil.setPhone(councilUpdates.getPhone());
        }
        if (councilUpdates.getEmail() != null) {
            existingCouncil.setEmail(councilUpdates.getEmail());
        }
        if (councilUpdates.getWebsiteUrl() != null) {
            existingCouncil.setWebsiteUrl(councilUpdates.getWebsiteUrl());
        }
        if (councilUpdates.getLogoUrl() != null) {
            existingCouncil.setLogoUrl(councilUpdates.getLogoUrl());
        }
        if (councilUpdates.getScoutExecutiveName() != null) {
            existingCouncil.setScoutExecutiveName(councilUpdates.getScoutExecutiveName());
        }
        if (councilUpdates.getScoutExecutiveEmail() != null) {
            existingCouncil.setScoutExecutiveEmail(councilUpdates.getScoutExecutiveEmail());
        }
        if (councilUpdates.getCampCardCoordinatorName() != null) {
            existingCouncil.setCampCardCoordinatorName(councilUpdates.getCampCardCoordinatorName());
        }
        if (councilUpdates.getCampCardCoordinatorEmail() != null) {
            existingCouncil.setCampCardCoordinatorEmail(councilUpdates.getCampCardCoordinatorEmail());
        }
        if (councilUpdates.getCampCardCoordinatorPhone() != null) {
            existingCouncil.setCampCardCoordinatorPhone(councilUpdates.getCampCardCoordinatorPhone());
        }
        if (councilUpdates.getCampaignStartDate() != null) {
            existingCouncil.setCampaignStartDate(councilUpdates.getCampaignStartDate());
        }
        if (councilUpdates.getCampaignEndDate() != null) {
            existingCouncil.setCampaignEndDate(councilUpdates.getCampaignEndDate());
        }
        if (councilUpdates.getGoalAmount() != null) {
            existingCouncil.setGoalAmount(councilUpdates.getGoalAmount());
        }
        if (councilUpdates.getStatus() != null) {
            existingCouncil.setStatus(councilUpdates.getStatus());
        }
        if (councilUpdates.getSubscriptionTier() != null) {
            existingCouncil.setSubscriptionTier(councilUpdates.getSubscriptionTier());
        }
        
        Council updatedCouncil = councilRepository.save(existingCouncil);
        log.info("Council updated successfully: {}", updatedCouncil.getId());
        return updatedCouncil;
    }
    
    @Transactional
    public void deleteCouncil(Long id) {
        log.info("Deleting council with ID: {}", id);
        
        if (!councilRepository.existsById(id)) {
            throw new IllegalArgumentException("Council not found with ID: " + id);
        }
        
        councilRepository.deleteById(id);
        log.info("Council deleted successfully: {}", id);
    }
    
    @Transactional
    public Council updateCouncilStatus(Long id, CouncilStatus status) {
        log.info("Updating council {} status to {}", id, status);
        
        Council council = councilRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Council not found with ID: " + id));
        
        council.setStatus(status);
        return councilRepository.save(council);
    }
}
