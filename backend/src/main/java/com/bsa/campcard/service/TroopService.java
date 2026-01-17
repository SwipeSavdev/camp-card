package com.bsa.campcard.service;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.entity.Troop.TroopStatus;
import com.bsa.campcard.entity.Troop.TroopType;
import com.bsa.campcard.repository.TroopRepository;
import com.bsa.campcard.repository.ScoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TroopService {
    
    private final TroopRepository troopRepository;
    private final ScoutRepository scoutRepository;
    
    @Transactional
    public TroopResponse createTroop(CreateTroopRequest request) {
        // Check if troop number already exists
        if (troopRepository.findByTroopNumber(request.getTroopNumber()).isPresent()) {
            throw new IllegalArgumentException("Troop number already exists");
        }
        
        Troop troop = new Troop();
        troop.setTroopNumber(request.getTroopNumber());
        troop.setCouncilId(request.getCouncilId());
        troop.setTroopName(request.getTroopName());
        troop.setTroopType(TroopType.valueOf(request.getTroopType()));
        troop.setCharterOrganization(request.getCharterOrganization());
        troop.setMeetingLocation(request.getMeetingLocation());
        troop.setMeetingDay(request.getMeetingDay());
        troop.setMeetingTime(request.getMeetingTime());
        troop.setScoutmasterId(request.getScoutmasterId());
        troop.setScoutmasterName(request.getScoutmasterName());
        troop.setScoutmasterEmail(request.getScoutmasterEmail());
        troop.setScoutmasterPhone(request.getScoutmasterPhone());
        troop.setGoalAmount(request.getGoalAmount());
        troop.setStatus(TroopStatus.ACTIVE);
        
        Troop savedTroop = troopRepository.save(troop);
        return TroopResponse.fromEntity(savedTroop);
    }
    
    @Transactional
    public TroopResponse updateTroop(Long troopId, CreateTroopRequest request) {
        Troop troop = troopRepository.findById(troopId)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        
        if (request.getTroopName() != null) troop.setTroopName(request.getTroopName());
        if (request.getCharterOrganization() != null) troop.setCharterOrganization(request.getCharterOrganization());
        if (request.getMeetingLocation() != null) troop.setMeetingLocation(request.getMeetingLocation());
        if (request.getMeetingDay() != null) troop.setMeetingDay(request.getMeetingDay());
        if (request.getMeetingTime() != null) troop.setMeetingTime(request.getMeetingTime());
        if (request.getScoutmasterId() != null) troop.setScoutmasterId(request.getScoutmasterId());
        if (request.getScoutmasterName() != null) troop.setScoutmasterName(request.getScoutmasterName());
        if (request.getScoutmasterEmail() != null) troop.setScoutmasterEmail(request.getScoutmasterEmail());
        if (request.getScoutmasterPhone() != null) troop.setScoutmasterPhone(request.getScoutmasterPhone());
        if (request.getGoalAmount() != null) troop.setGoalAmount(request.getGoalAmount());
        
        Troop updatedTroop = troopRepository.save(troop);
        return TroopResponse.fromEntity(updatedTroop);
    }
    
    public TroopResponse getTroop(Long troopId) {
        Troop troop = troopRepository.findById(troopId)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        return TroopResponse.fromEntity(troop);
    }
    
    public TroopResponse getTroopByNumber(String troopNumber) {
        Troop troop = troopRepository.findByTroopNumber(troopNumber)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        return TroopResponse.fromEntity(troop);
    }
    
    public Page<TroopResponse> getAllTroops(Pageable pageable) {
        return troopRepository.findAll(pageable)
            .map(TroopResponse::fromEntity);
    }
    
    public Page<TroopResponse> getTroopsByCouncil(Long councilId, Pageable pageable) {
        return troopRepository.findByCouncilId(councilId, pageable)
            .map(TroopResponse::fromEntity);
    }
    
    public Page<TroopResponse> searchTroops(String search, Pageable pageable) {
        return troopRepository.searchTroops(search, pageable)
            .map(TroopResponse::fromEntity);
    }
    
    public Page<TroopResponse> getTopPerformingTroops(Pageable pageable) {
        return troopRepository.findTopPerformingTroops(pageable)
            .map(TroopResponse::fromEntity);
    }
    
    public Page<TroopResponse> getTopPerformingTroopsByCouncil(Long councilId, Pageable pageable) {
        return troopRepository.findTopPerformingTroopsByCouncil(councilId, pageable)
            .map(TroopResponse::fromEntity);
    }
    
    @Transactional
    public void updateTroopStats(Long troopId) {
        Troop troop = troopRepository.findById(troopId)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        
        // Count active scouts
        long activeCount = scoutRepository.countByTroopIdAndStatus(
            troopId, 
            com.bsa.campcard.entity.Scout.ScoutStatus.ACTIVE
        );
        troop.setActiveScouts((int) activeCount);
        
        // Count total scouts (all statuses except DROPPED)
        long totalCount = scoutRepository.findByTroopId(troopId, Pageable.unpaged())
            .getTotalElements();
        troop.setTotalScouts((int) totalCount);
        
        // Sum sales
        BigDecimal totalSales = scoutRepository.sumSalesByTroop(troopId);
        troop.setTotalSales(totalSales != null ? totalSales : BigDecimal.ZERO);
        
        // Sum cards sold
        Integer cardsSold = scoutRepository.sumCardsSoldByTroop(troopId);
        troop.setCardsSold(cardsSold != null ? cardsSold : 0);
        
        troopRepository.save(troop);
    }
    
    @Transactional
    public void updateTroopStatus(Long troopId, String status) {
        Troop troop = troopRepository.findById(troopId)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        troop.setStatus(TroopStatus.valueOf(status));
        troopRepository.save(troop);
    }
    
    @Transactional
    public void deleteTroop(Long troopId) {
        Troop troop = troopRepository.findById(troopId)
            .orElseThrow(() -> new IllegalArgumentException("Troop not found"));
        
        // Check if troop has active scouts
        long activeScouts = scoutRepository.countByTroopIdAndStatus(
            troopId,
            com.bsa.campcard.entity.Scout.ScoutStatus.ACTIVE
        );
        
        if (activeScouts > 0) {
            throw new IllegalStateException("Cannot delete troop with active scouts");
        }
        
        troopRepository.delete(troop);
    }
}
