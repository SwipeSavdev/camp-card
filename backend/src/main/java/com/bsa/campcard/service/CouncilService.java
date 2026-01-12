package com.bsa.campcard.service;

import com.bsa.campcard.dto.CouncilRequest;
import com.bsa.campcard.dto.CouncilResponse;
import com.bsa.campcard.dto.CouncilStatsResponse;
import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Council.CouncilStatus;
import com.bsa.campcard.repository.CouncilRepository;
import com.bsa.campcard.repository.TroopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouncilService {

    private final CouncilRepository councilRepository;
    private final TroopRepository troopRepository;

    // ========================================================================
    // CRUD OPERATIONS
    // ========================================================================

    /**
     * Create a new council
     */
    @Transactional
    public CouncilResponse createCouncil(CouncilRequest request) {
        log.info("Creating council: {}", request.getName());

        // Check if council number already exists
        if (councilRepository.findByCouncilNumber(request.getCouncilNumber()).isPresent()) {
            throw new RuntimeException("Council number already exists: " + request.getCouncilNumber());
        }

        Council council = Council.builder()
            .councilNumber(request.getCouncilNumber())
            .name(request.getName())
            .shortName(request.getShortName())
            .region(request.getRegion())
            .streetAddress(request.getStreetAddress())
            .city(request.getCity())
            .state(request.getState())
            .zipCode(request.getZipCode())
            .phone(request.getPhone())
            .email(request.getEmail())
            .websiteUrl(request.getWebsiteUrl())
            .logoUrl(request.getLogoUrl())
            .scoutExecutiveName(request.getScoutExecutiveName())
            .scoutExecutiveEmail(request.getScoutExecutiveEmail())
            .campCardCoordinatorName(request.getCampCardCoordinatorName())
            .campCardCoordinatorEmail(request.getCampCardCoordinatorEmail())
            .campCardCoordinatorPhone(request.getCampCardCoordinatorPhone())
            .campaignStartDate(request.getCampaignStartDate())
            .campaignEndDate(request.getCampaignEndDate())
            .goalAmount(request.getGoalAmount())
            .status(request.getStatus() != null ? CouncilStatus.valueOf(request.getStatus()) : CouncilStatus.ACTIVE)
            .subscriptionTier(request.getSubscriptionTier() != null ? request.getSubscriptionTier() : "BASIC")
            .build();

        Council saved = councilRepository.save(council);
        log.info("Council created with ID: {}", saved.getId());

        return CouncilResponse.fromEntity(saved);
    }

    /**
     * Update an existing council
     */
    @Transactional
    public CouncilResponse updateCouncil(Long id, CouncilRequest request) {
        log.info("Updating council ID: {}", id);

        Council council = councilRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Council not found: " + id));

        // Check if council number changed and is unique
        if (request.getCouncilNumber() != null &&
            !request.getCouncilNumber().equals(council.getCouncilNumber())) {
            if (councilRepository.findByCouncilNumber(request.getCouncilNumber()).isPresent()) {
                throw new RuntimeException("Council number already exists: " + request.getCouncilNumber());
            }
            council.setCouncilNumber(request.getCouncilNumber());
        }

        // Update fields if provided
        if (request.getName() != null) council.setName(request.getName());
        if (request.getShortName() != null) council.setShortName(request.getShortName());
        if (request.getRegion() != null) council.setRegion(request.getRegion());
        if (request.getStreetAddress() != null) council.setStreetAddress(request.getStreetAddress());
        if (request.getCity() != null) council.setCity(request.getCity());
        if (request.getState() != null) council.setState(request.getState());
        if (request.getZipCode() != null) council.setZipCode(request.getZipCode());
        if (request.getPhone() != null) council.setPhone(request.getPhone());
        if (request.getEmail() != null) council.setEmail(request.getEmail());
        if (request.getWebsiteUrl() != null) council.setWebsiteUrl(request.getWebsiteUrl());
        if (request.getLogoUrl() != null) council.setLogoUrl(request.getLogoUrl());
        if (request.getScoutExecutiveName() != null) council.setScoutExecutiveName(request.getScoutExecutiveName());
        if (request.getScoutExecutiveEmail() != null) council.setScoutExecutiveEmail(request.getScoutExecutiveEmail());
        if (request.getCampCardCoordinatorName() != null) council.setCampCardCoordinatorName(request.getCampCardCoordinatorName());
        if (request.getCampCardCoordinatorEmail() != null) council.setCampCardCoordinatorEmail(request.getCampCardCoordinatorEmail());
        if (request.getCampCardCoordinatorPhone() != null) council.setCampCardCoordinatorPhone(request.getCampCardCoordinatorPhone());
        if (request.getCampaignStartDate() != null) council.setCampaignStartDate(request.getCampaignStartDate());
        if (request.getCampaignEndDate() != null) council.setCampaignEndDate(request.getCampaignEndDate());
        if (request.getGoalAmount() != null) council.setGoalAmount(request.getGoalAmount());
        if (request.getStatus() != null) council.setStatus(CouncilStatus.valueOf(request.getStatus()));
        if (request.getSubscriptionTier() != null) council.setSubscriptionTier(request.getSubscriptionTier());

        Council saved = councilRepository.save(council);
        log.info("Council updated: {}", saved.getId());

        return CouncilResponse.fromEntity(saved);
    }

    /**
     * Get council by ID
     */
    @Transactional(readOnly = true)
    public CouncilResponse getCouncil(Long id) {
        Council council = councilRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Council not found: " + id));
        return CouncilResponse.fromEntity(council);
    }

    /**
     * Get council by UUID
     */
    @Transactional(readOnly = true)
    public CouncilResponse getCouncilByUuid(UUID uuid) {
        Council council = councilRepository.findByUuid(uuid)
            .orElseThrow(() -> new RuntimeException("Council not found: " + uuid));
        return CouncilResponse.fromEntity(council);
    }

    /**
     * Get council by council number
     */
    @Transactional(readOnly = true)
    public CouncilResponse getCouncilByNumber(String councilNumber) {
        Council council = councilRepository.findByCouncilNumber(councilNumber)
            .orElseThrow(() -> new RuntimeException("Council not found: " + councilNumber));
        return CouncilResponse.fromEntity(council);
    }

    /**
     * Get all councils with pagination
     */
    @Transactional(readOnly = true)
    public Page<CouncilResponse> getAllCouncils(Pageable pageable) {
        return councilRepository.findAll(pageable)
            .map(CouncilResponse::fromEntity);
    }

    /**
     * Get councils by status
     */
    @Transactional(readOnly = true)
    public Page<CouncilResponse> getCouncilsByStatus(String status, Pageable pageable) {
        CouncilStatus councilStatus = CouncilStatus.valueOf(status.toUpperCase());
        return councilRepository.findByStatus(councilStatus, pageable)
            .map(CouncilResponse::fromEntity);
    }

    /**
     * Get councils by region
     */
    @Transactional(readOnly = true)
    public Page<CouncilResponse> getCouncilsByRegion(String region, Pageable pageable) {
        return councilRepository.findByRegion(region, pageable)
            .map(CouncilResponse::fromEntity);
    }

    /**
     * Search councils by name, shortName, or councilNumber
     */
    @Transactional(readOnly = true)
    public Page<CouncilResponse> searchCouncils(String searchTerm, Pageable pageable) {
        return councilRepository.searchCouncils(searchTerm, pageable)
            .map(CouncilResponse::fromEntity);
    }

    /**
     * Delete a council
     */
    @Transactional
    public void deleteCouncil(Long id) {
        log.info("Deleting council ID: {}", id);

        Council council = councilRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Council not found: " + id));

        // Check if council has troops
        Long troopCount = troopRepository.countByCouncilId(id);
        if (troopCount > 0) {
            throw new RuntimeException("Cannot delete council with " + troopCount + " troops. Remove troops first.");
        }

        councilRepository.delete(council);
        log.info("Council deleted: {}", id);
    }

    /**
     * Update council status
     */
    @Transactional
    public CouncilResponse updateStatus(Long id, String status) {
        log.info("Updating council {} status to: {}", id, status);

        Council council = councilRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Council not found: " + id));

        council.setStatus(CouncilStatus.valueOf(status.toUpperCase()));
        Council saved = councilRepository.save(council);

        return CouncilResponse.fromEntity(saved);
    }

    // ========================================================================
    // STATISTICS
    // ========================================================================

    /**
     * Get council statistics
     */
    @Transactional(readOnly = true)
    public CouncilStatsResponse getStats() {
        log.info("Fetching council statistics");

        Long totalCouncils = councilRepository.count();
        Long activeCouncils = councilRepository.countByStatus(CouncilStatus.ACTIVE);
        Long inactiveCouncils = councilRepository.countByStatus(CouncilStatus.INACTIVE);
        Long trialCouncils = councilRepository.countByStatus(CouncilStatus.TRIAL);

        Long totalScouts = councilRepository.getTotalActiveScouts();
        BigDecimal totalSales = councilRepository.getTotalActiveSales();

        // Get councils by region
        Map<String, Long> councilsByRegion = new HashMap<>();
        List<Object[]> regionCounts = councilRepository.countByRegionGrouped();
        for (Object[] row : regionCounts) {
            String region = (String) row[0];
            Long count = (Long) row[1];
            councilsByRegion.put(region, count);
        }

        // Count active campaigns (councils with active campaign dates)
        LocalDate now = LocalDate.now();
        List<Council> activeCouncilsList = councilRepository.findByStatus(CouncilStatus.ACTIVE);
        long activeCampaigns = activeCouncilsList.stream()
            .filter(c -> c.getCampaignStartDate() != null && c.getCampaignEndDate() != null)
            .filter(c -> !now.isBefore(c.getCampaignStartDate()) && !now.isAfter(c.getCampaignEndDate()))
            .count();

        // Calculate total goals and overall progress
        BigDecimal totalGoals = activeCouncilsList.stream()
            .filter(c -> c.getGoalAmount() != null)
            .map(Council::getGoalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double overallProgress = null;
        if (totalGoals.compareTo(BigDecimal.ZERO) > 0 && totalSales != null) {
            overallProgress = totalSales
                .divide(totalGoals, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        }

        // Count total troops
        Long totalTroops = activeCouncilsList.stream()
            .mapToLong(c -> c.getTotalTroops() != null ? c.getTotalTroops() : 0)
            .sum();

        // Count total cards sold
        Long totalCardsSold = activeCouncilsList.stream()
            .mapToLong(c -> c.getCardsSold() != null ? c.getCardsSold() : 0)
            .sum();

        return CouncilStatsResponse.builder()
            .totalCouncils(totalCouncils)
            .activeCouncils(activeCouncils)
            .inactiveCouncils(inactiveCouncils)
            .trialCouncils(trialCouncils)
            .totalScouts(totalScouts != null ? totalScouts : 0L)
            .totalTroops(totalTroops)
            .totalSales(totalSales != null ? totalSales : BigDecimal.ZERO)
            .totalCardsSold(totalCardsSold)
            .councilsByRegion(councilsByRegion)
            .activeCampaigns(activeCampaigns)
            .totalGoalAmount(totalGoals)
            .overallProgress(overallProgress)
            .build();
    }

    /**
     * Update council statistics (recalculate from troops)
     */
    @Transactional
    public CouncilResponse updateCouncilStats(Long councilId) {
        log.info("Updating stats for council: {}", councilId);

        Council council = councilRepository.findById(councilId)
            .orElseThrow(() -> new RuntimeException("Council not found: " + councilId));

        // Get troop counts and stats
        Long troopCount = troopRepository.countByCouncilId(councilId);
        BigDecimal totalSales = troopRepository.sumSalesByCouncil(councilId);
        Integer cardsSold = troopRepository.sumCardsSoldByCouncil(councilId);

        council.setTotalTroops(troopCount != null ? troopCount.intValue() : 0);
        council.setTotalSales(totalSales != null ? totalSales : BigDecimal.ZERO);
        council.setCardsSold(cardsSold != null ? cardsSold : 0);

        Council saved = councilRepository.save(council);
        log.info("Council stats updated: troops={}, sales={}, cards={}",
            council.getTotalTroops(), council.getTotalSales(), council.getCardsSold());

        return CouncilResponse.fromEntity(saved);
    }
}
