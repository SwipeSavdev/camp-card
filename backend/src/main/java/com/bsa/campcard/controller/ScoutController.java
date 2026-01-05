package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.service.ScoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/scouts")
@RequiredArgsConstructor
public class ScoutController {
    
    private final ScoutService scoutService;
    
    @PostMapping
    public ResponseEntity<ScoutResponse> createScout(@RequestBody CreateScoutRequest request) {
        ScoutResponse scout = scoutService.createScout(request);
        return ResponseEntity.ok(scout);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ScoutResponse> updateScout(
            @PathVariable Long id,
            @RequestBody CreateScoutRequest request) {
        ScoutResponse scout = scoutService.updateScout(id, request);
        return ResponseEntity.ok(scout);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ScoutResponse> getScout(@PathVariable Long id) {
        ScoutResponse scout = scoutService.getScout(id);
        return ResponseEntity.ok(scout);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ScoutResponse> getScoutByUserId(@PathVariable UUID userId) {
        ScoutResponse scout = scoutService.getScoutByUserId(userId);
        return ResponseEntity.ok(scout);
    }
    
    @GetMapping("/troop/{troopId}/roster")
    public ResponseEntity<Page<ScoutResponse>> getTroopRoster(
            @PathVariable Long troopId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ScoutResponse> scouts;
        if (activeOnly) {
            scouts = scoutService.getActiveTroopRoster(troopId, pageable);
        } else {
            scouts = scoutService.getTroopRoster(troopId, pageable);
        }
        
        return ResponseEntity.ok(scouts);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ScoutResponse>> searchScouts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastName"));
        Page<ScoutResponse> scouts = scoutService.searchScouts(query, pageable);
        return ResponseEntity.ok(scouts);
    }
    
    @GetMapping("/top-sellers")
    public ResponseEntity<Page<ScoutResponse>> getTopSellers(
            @RequestParam(required = false) Long troopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        Page<ScoutResponse> scouts;
        if (troopId != null) {
            scouts = scoutService.getTopSellersByTroop(troopId, pageable);
        } else {
            scouts = scoutService.getTopSellers(pageable);
        }
        
        return ResponseEntity.ok(scouts);
    }
    
    @PostMapping("/{id}/record-sale")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCOUTMASTER', 'SCOUT')")
    public ResponseEntity<Void> recordSale(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam int cardsCount) {
        scoutService.recordSale(id, amount, cardsCount);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/rank")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCOUTMASTER')")
    public ResponseEntity<Void> updateScoutRank(
            @PathVariable Long id,
            @RequestParam String rank) {
        scoutService.updateScoutRank(id, rank);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCOUTMASTER')")
    public ResponseEntity<Void> updateScoutStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        scoutService.updateScoutStatus(id, status);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> transferScout(
            @PathVariable Long id,
            @RequestParam Long newTroopId) {
        scoutService.transferScout(id, newTroopId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/mark-top-sellers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markTopSellers(@RequestParam int topCount) {
        scoutService.markTopSellers(topCount);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> deleteScout(@PathVariable Long id) {
        scoutService.deleteScout(id);
        return ResponseEntity.ok().build();
    }
}
