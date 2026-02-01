package com.bsa.campcard.service;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.entity.Scout;
import com.bsa.campcard.entity.Scout.ScoutStatus;
import com.bsa.campcard.entity.Scout.ScoutRank;
import com.bsa.campcard.repository.ReferralRepository;
import com.bsa.campcard.repository.ScoutRepository;
import com.bsa.campcard.repository.TroopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoutService {
    
    private final ScoutRepository scoutRepository;
    private final TroopRepository troopRepository;
    private final TroopService troopService;
    private final ReferralRepository referralRepository;
    private final EmailService emailService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Transactional
    public ScoutResponse createScout(CreateScoutRequest request) {
        // Validate troop exists
        if (!troopRepository.existsById(request.getTroopId())) {
            throw new IllegalArgumentException("Troop not found");
        }
        
        // Check if user already registered as scout
        if (scoutRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("User is already registered as a scout");
        }
        
        // Check if BSA member ID is unique (if provided)
        if (request.getBsaMemberId() != null && 
            scoutRepository.findByBsaMemberId(request.getBsaMemberId()).isPresent()) {
            throw new IllegalArgumentException("BSA Member ID already exists");
        }
        
        Scout scout = new Scout();
        scout.setUserId(request.getUserId());
        scout.setTroopId(request.getTroopId());
        scout.setFirstName(request.getFirstName());
        scout.setLastName(request.getLastName());
        scout.setBirthDate(request.getBirthDate());
        scout.setBsaMemberId(request.getBsaMemberId());
        scout.setRank(request.getRank() != null ? ScoutRank.valueOf(request.getRank()) : ScoutRank.SCOUT);
        scout.setJoinDate(request.getJoinDate());
        scout.setParentName(request.getParentName());
        scout.setParentEmail(request.getParentEmail());
        scout.setParentPhone(request.getParentPhone());
        scout.setEmergencyContactName(request.getEmergencyContactName());
        scout.setEmergencyContactPhone(request.getEmergencyContactPhone());
        scout.setSalesGoal(request.getSalesGoal());
        scout.setStatus(ScoutStatus.ACTIVE);
        
        Scout savedScout = scoutRepository.save(scout);
        
        // Update troop stats
        troopService.updateTroopStats(request.getTroopId());
        
        return ScoutResponse.fromEntity(savedScout);
    }
    
    @Transactional
    public ScoutResponse updateScout(Long scoutId, CreateScoutRequest request) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        
        if (request.getFirstName() != null) scout.setFirstName(request.getFirstName());
        if (request.getLastName() != null) scout.setLastName(request.getLastName());
        if (request.getBirthDate() != null) scout.setBirthDate(request.getBirthDate());
        if (request.getRank() != null) scout.setRank(ScoutRank.valueOf(request.getRank()));
        if (request.getParentName() != null) scout.setParentName(request.getParentName());
        if (request.getParentEmail() != null) scout.setParentEmail(request.getParentEmail());
        if (request.getParentPhone() != null) scout.setParentPhone(request.getParentPhone());
        if (request.getEmergencyContactName() != null) scout.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) scout.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getSalesGoal() != null) scout.setSalesGoal(request.getSalesGoal());
        
        Scout updatedScout = scoutRepository.save(scout);
        return ScoutResponse.fromEntity(updatedScout);
    }
    
    public ScoutResponse getScout(Long scoutId) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        return ScoutResponse.fromEntity(scout);
    }
    
    public ScoutResponse getScoutByUserId(UUID userId) {
        Scout scout = scoutRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found for user"));
        return ScoutResponse.fromEntity(scout);
    }
    
    public Page<ScoutResponse> getTroopRoster(Long troopId, Pageable pageable) {
        Page<ScoutResponse> page = scoutRepository.findByTroopId(troopId, pageable)
            .map(ScoutResponse::fromEntity);
        enrichWithReferralCounts(page.getContent());
        return page;
    }
    
    public Page<ScoutResponse> getActiveTroopRoster(Long troopId, Pageable pageable) {
        Page<ScoutResponse> page = scoutRepository.findByTroopIdAndStatus(troopId, ScoutStatus.ACTIVE, pageable)
            .map(ScoutResponse::fromEntity);
        enrichWithReferralCounts(page.getContent());
        return page;
    }
    
    public Page<ScoutResponse> searchScouts(String search, Pageable pageable) {
        return scoutRepository.searchScouts(search, pageable)
            .map(ScoutResponse::fromEntity);
    }

    public Page<ScoutResponse> searchScoutsInTroop(String search, Long troopId, Pageable pageable) {
        return scoutRepository.searchScoutsInTroop(search, troopId, pageable)
            .map(ScoutResponse::fromEntity);
    }
    
    public Page<ScoutResponse> getTopSellers(Pageable pageable) {
        return scoutRepository.findTopSellersGlobal(pageable)
            .map(ScoutResponse::fromEntity);
    }
    
    public Page<ScoutResponse> getTopSellersByTroop(Long troopId, Pageable pageable) {
        return scoutRepository.findTopSellersByTroop(troopId, pageable)
            .map(ScoutResponse::fromEntity);
    }
    
    @Transactional
    public void recordSale(Long scoutId, BigDecimal amount, int cardsCount) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        
        scout.setTotalSales(scout.getTotalSales().add(amount));
        scout.setCardsSold(scout.getCardsSold() + cardsCount);
        
        // Calculate commission (example: 10% of sales)
        BigDecimal commission = amount.multiply(new BigDecimal("0.10"));
        scout.setCommissionEarned(scout.getCommissionEarned().add(commission));
        
        // Check if scout met goal
        if (scout.getSalesGoal() != null && scout.hasMetGoal()) {
            scout.setAwardsEarned(scout.getAwardsEarned() + 1);
        }
        
        scoutRepository.save(scout);
        
        // Update troop stats
        troopService.updateTroopStats(scout.getTroopId());
    }
    
    @Transactional
    public void updateScoutRank(Long scoutId, String rank) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        scout.setRank(ScoutRank.valueOf(rank));
        scoutRepository.save(scout);
    }
    
    @Transactional
    public void updateScoutStatus(Long scoutId, String status) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        scout.setStatus(ScoutStatus.valueOf(status));
        scoutRepository.save(scout);
        
        // Update troop stats
        troopService.updateTroopStats(scout.getTroopId());
    }
    
    @Transactional
    public void transferScout(Long scoutId, Long newTroopId) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));
        
        if (!troopRepository.existsById(newTroopId)) {
            throw new IllegalArgumentException("New troop not found");
        }
        
        Long oldTroopId = scout.getTroopId();
        scout.setTroopId(newTroopId);
        scout.setStatus(ScoutStatus.TRANSFERRED);
        scoutRepository.save(scout);
        
        // Update both troop stats
        troopService.updateTroopStats(oldTroopId);
        troopService.updateTroopStats(newTroopId);
    }
    
    @Transactional
    public void markTopSellers(int topCount) {
        // Reset all top seller flags
        List<Scout> allScouts = scoutRepository.findAll();
        allScouts.forEach(scout -> scout.setTopSeller(false));
        scoutRepository.saveAll(allScouts);
        
        // Mark top sellers
        List<Scout> topSellers = scoutRepository.findTopSellersGlobal(
            Pageable.ofSize(topCount)
        ).getContent();
        
        topSellers.forEach(scout -> scout.setTopSeller(true));
        scoutRepository.saveAll(topSellers);
    }
    
    @Transactional
    public void deleteScout(Long scoutId) {
        Scout scout = scoutRepository.findById(scoutId)
            .orElseThrow(() -> new IllegalArgumentException("Scout not found"));

        Long troopId = scout.getTroopId();
        scoutRepository.delete(scout);

        // Update troop stats
        troopService.updateTroopStats(troopId);
    }

    /**
     * Send a scout invitation email and store the invite token in Redis (7-day TTL).
     */
    public void inviteScout(String email, String scoutName, String troopNumber, String inviterName) {
        log.info("Sending scout invitation to {} for troop {}", email, troopNumber);

        String inviteToken = UUID.randomUUID().toString();
        String redisKey = "invite:scout:" + inviteToken;
        Map<String, String> tokenData = new HashMap<>();
        tokenData.put("email", email);
        tokenData.put("scoutName", scoutName);
        tokenData.put("troopNumber", troopNumber);
        redisTemplate.opsForHash().putAll(redisKey, tokenData);
        redisTemplate.expire(redisKey, Duration.ofDays(7));

        emailService.sendScoutInvitationEmail(email, scoutName, troopNumber, inviterName, inviteToken);
    }

    /**
     * Batch-enrich a list of ScoutResponse objects with referral and conversion counts.
     */
    private void enrichWithReferralCounts(List<ScoutResponse> scouts) {
        List<UUID> userIds = scouts.stream()
            .map(ScoutResponse::getUserId)
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toList());

        if (userIds.isEmpty()) return;

        Map<UUID, Integer> referralCounts = new HashMap<>();
        for (Object[] row : referralRepository.countReferralsByReferrerIds(userIds)) {
            referralCounts.put((UUID) row[0], ((Number) row[1]).intValue());
        }

        Map<UUID, Integer> conversionCounts = new HashMap<>();
        for (Object[] row : referralRepository.countConversionsByReferrerIds(userIds)) {
            conversionCounts.put((UUID) row[0], ((Number) row[1]).intValue());
        }

        for (ScoutResponse scout : scouts) {
            if (scout.getUserId() != null) {
                scout.setReferralCount(referralCounts.getOrDefault(scout.getUserId(), 0));
                scout.setConversionCount(conversionCounts.getOrDefault(scout.getUserId(), 0));
            }
        }
    }
}
