package com.bsa.campcard.controller;

import com.bsa.campcard.dto.*;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.repository.TroopRepository;
import com.bsa.campcard.service.ScoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/scouts")
@RequiredArgsConstructor
public class ScoutController {

    private final ScoutService scoutService;
    private final TroopRepository troopRepository;
    
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
            Authentication authentication,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("lastName"));

        // RBAC: Unit Leaders can only search scouts in their own troop
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            if (user.getRole() == User.UserRole.UNIT_LEADER && user.getTroopId() != null) {
                log.info("Unit Leader user {} - filtering scouts search to troop {}", user.getEmail(), user.getTroopId());
                // Get the Troop's Long id from its UUID
                Troop troop = troopRepository.findByUuid(user.getTroopId())
                    .orElseThrow(() -> new IllegalArgumentException("Troop not found for Unit Leader"));
                Page<ScoutResponse> scouts = scoutService.searchScoutsInTroop(query, troop.getId(), pageable);
                return ResponseEntity.ok(scouts);
            }
        }

        Page<ScoutResponse> scouts = scoutService.searchScouts(query, pageable);
        return ResponseEntity.ok(scouts);
    }
    
    @GetMapping("/top-sellers")
    public ResponseEntity<Page<ScoutResponse>> getTopSellers(
            Authentication authentication,
            @RequestParam(required = false) Long troopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        // RBAC: Unit Leaders can only see top sellers in their own troop
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            if (user.getRole() == User.UserRole.UNIT_LEADER && user.getTroopId() != null) {
                log.info("Unit Leader user {} - filtering top sellers to troop {}", user.getEmail(), user.getTroopId());
                Troop troop = troopRepository.findByUuid(user.getTroopId())
                    .orElseThrow(() -> new IllegalArgumentException("Troop not found for Unit Leader"));
                Page<ScoutResponse> scouts = scoutService.getTopSellersByTroop(troop.getId(), pageable);
                return ResponseEntity.ok(scouts);
            }
        }

        Page<ScoutResponse> scouts;
        if (troopId != null) {
            scouts = scoutService.getTopSellersByTroop(troopId, pageable);
        } else {
            scouts = scoutService.getTopSellers(pageable);
        }

        return ResponseEntity.ok(scouts);
    }
    
    @PostMapping("/{id}/record-sale")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER', 'SCOUT')")
    public ResponseEntity<Void> recordSale(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam int cardsCount) {
        scoutService.recordSale(id, amount, cardsCount);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/rank")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Void> updateScoutRank(
            @PathVariable Long id,
            @RequestParam String rank) {
        scoutService.updateScoutRank(id, rank);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Void> updateScoutStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        scoutService.updateScoutStatus(id, status);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> transferScout(
            @PathVariable Long id,
            @RequestParam Long newTroopId) {
        scoutService.transferScout(id, newTroopId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/mark-top-sellers")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> markTopSellers(@RequestParam int topCount) {
        scoutService.markTopSellers(topCount);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteScout(@PathVariable Long id) {
        scoutService.deleteScout(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    public ResponseEntity<Void> inviteScout(
            @RequestBody InviteScoutRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String inviterName = user.getFirstName() + " " + user.getLastName();

        // Resolve troop number from the authenticated user's troopId
        String troopNumber = "Unknown";
        if (user.getTroopId() != null) {
            troopNumber = troopRepository.findByUuid(user.getTroopId())
                .map(Troop::getTroopNumber)
                .orElse("Unknown");
        }

        scoutService.inviteScout(
                request.getEmail(),
                request.getScoutName(),
                troopNumber,
                inviterName);

        return ResponseEntity.ok().build();
    }
}
