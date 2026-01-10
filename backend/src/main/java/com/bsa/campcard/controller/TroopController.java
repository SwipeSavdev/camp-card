package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.service.TroopService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/troops")
@RequiredArgsConstructor
public class TroopController {
    
    private final TroopService troopService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<TroopResponse> createTroop(@RequestBody CreateTroopRequest request) {
        TroopResponse troop = troopService.createTroop(request);
        return ResponseEntity.ok(troop);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN', 'SCOUTMASTER')")
    public ResponseEntity<TroopResponse> updateTroop(
            @PathVariable Long id,
            @RequestBody CreateTroopRequest request) {
        TroopResponse troop = troopService.updateTroop(id, request);
        return ResponseEntity.ok(troop);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TroopResponse> getTroop(@PathVariable Long id) {
        TroopResponse troop = troopService.getTroop(id);
        return ResponseEntity.ok(troop);
    }
    
    @GetMapping("/number/{troopNumber}")
    public ResponseEntity<TroopResponse> getTroopByNumber(@PathVariable String troopNumber) {
        TroopResponse troop = troopService.getTroopByNumber(troopNumber);
        return ResponseEntity.ok(troop);
    }
    
    @GetMapping
    public ResponseEntity<Page<TroopResponse>> getTroops(
            @RequestParam(required = false) Long councilId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean topPerformers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "troopNumber") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<TroopResponse> troops;
        
        if (search != null && !search.trim().isEmpty()) {
            troops = troopService.searchTroops(search, pageable);
        } else if (topPerformers) {
            if (councilId != null) {
                troops = troopService.getTopPerformingTroopsByCouncil(councilId, pageable);
            } else {
                troops = troopService.getTopPerformingTroops(pageable);
            }
        } else if (councilId != null) {
            troops = troopService.getTroopsByCouncil(councilId, pageable);
        } else {
            troops = troopService.getAllTroops(pageable);
        }
        
        return ResponseEntity.ok(troops);
    }
    
    @GetMapping("/council/{councilId}")
    public ResponseEntity<Page<TroopResponse>> getTroopsByCouncil(
            @PathVariable Long councilId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("troopNumber"));
        Page<TroopResponse> troops = troopService.getTroopsByCouncil(councilId, pageable);
        return ResponseEntity.ok(troops);
    }
    
    @GetMapping("/top-performers")
    public ResponseEntity<Page<TroopResponse>> getTopPerformingTroops(
            @RequestParam(required = false) Long councilId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        Page<TroopResponse> troops;
        if (councilId != null) {
            troops = troopService.getTopPerformingTroopsByCouncil(councilId, pageable);
        } else {
            troops = troopService.getTopPerformingTroops(pageable);
        }
        
        return ResponseEntity.ok(troops);
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> updateTroopStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        troopService.updateTroopStatus(id, status);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/update-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<Void> updateTroopStats(@PathVariable Long id) {
        troopService.updateTroopStats(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTroop(@PathVariable Long id) {
        troopService.deleteTroop(id);
        return ResponseEntity.ok().build();
    }
}
