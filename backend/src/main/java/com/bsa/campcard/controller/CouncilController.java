package com.bsa.campcard.controller;

import com.bsa.campcard.dto.CouncilRequest;
import com.bsa.campcard.dto.CouncilResponse;
import com.bsa.campcard.dto.CouncilStatsResponse;
import com.bsa.campcard.service.CouncilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;

/**
 * REST Controller for Council management
 *
 * Provides endpoints for:
 * - CRUD operations on councils
 * - Council search and filtering
 * - Council statistics
 *
 * Also mapped to /api/v1/organizations for frontend compatibility
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class CouncilController {

    private final CouncilService councilService;

    // ========================================================================
    // CREATE
    // ========================================================================

    @PostMapping({"/api/v1/councils", "/api/v1/organizations"})
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<CouncilResponse> createCouncil(@Valid @RequestBody CouncilRequest request) {
        log.info("POST /councils - Creating council: {}", request.getName());
        CouncilResponse council = councilService.createCouncil(request);
        return ResponseEntity.ok(council);
    }

    // ========================================================================
    // READ
    // ========================================================================

    @GetMapping({"/api/v1/councils", "/api/v1/organizations"})
    public ResponseEntity<Page<CouncilResponse>> getCouncils(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        log.info("GET /councils - search={}, status={}, region={}, page={}, size={}",
            search, status, region, page, size);

        // RBAC: Council Admins can only see their own council
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            if (user.getRole() == User.UserRole.COUNCIL_ADMIN && user.getCouncilId() != null) {
                log.info("Council Admin user {} - filtering to council {}", user.getEmail(), user.getCouncilId());
                CouncilResponse council = councilService.getCouncilByUuid(user.getCouncilId());
                Page<CouncilResponse> singleCouncilPage = new PageImpl<>(
                    Collections.singletonList(council),
                    PageRequest.of(0, 1),
                    1
                );
                return ResponseEntity.ok(singleCouncilPage);
            }
        }

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CouncilResponse> councils;

        if (search != null && !search.trim().isEmpty()) {
            councils = councilService.searchCouncils(search, pageable);
        } else if (status != null && !status.trim().isEmpty()) {
            councils = councilService.getCouncilsByStatus(status, pageable);
        } else if (region != null && !region.trim().isEmpty()) {
            councils = councilService.getCouncilsByRegion(region, pageable);
        } else {
            councils = councilService.getAllCouncils(pageable);
        }

        return ResponseEntity.ok(councils);
    }

    @GetMapping({"/api/v1/councils/{id}", "/api/v1/organizations/{id}"})
    public ResponseEntity<CouncilResponse> getCouncil(@PathVariable String id) {
        log.info("GET /councils/{}", id);

        CouncilResponse council;

        // Try to parse as Long first, then UUID
        try {
            Long numericId = Long.parseLong(id);
            council = councilService.getCouncil(numericId);
        } catch (NumberFormatException e) {
            try {
                UUID uuid = UUID.fromString(id);
                council = councilService.getCouncilByUuid(uuid);
            } catch (IllegalArgumentException ex) {
                // Try as council number
                council = councilService.getCouncilByNumber(id);
            }
        }

        return ResponseEntity.ok(council);
    }

    @GetMapping("/api/v1/councils/number/{councilNumber}")
    public ResponseEntity<CouncilResponse> getCouncilByNumber(@PathVariable String councilNumber) {
        log.info("GET /councils/number/{}", councilNumber);
        CouncilResponse council = councilService.getCouncilByNumber(councilNumber);
        return ResponseEntity.ok(council);
    }

    @GetMapping("/api/v1/councils/uuid/{uuid}")
    public ResponseEntity<CouncilResponse> getCouncilByUuid(@PathVariable UUID uuid) {
        log.info("GET /councils/uuid/{}", uuid);
        CouncilResponse council = councilService.getCouncilByUuid(uuid);
        return ResponseEntity.ok(council);
    }

    // ========================================================================
    // UPDATE
    // ========================================================================

    @PutMapping({"/api/v1/councils/{id}", "/api/v1/organizations/{id}"})
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<CouncilResponse> updateCouncil(
            @PathVariable Long id,
            @Valid @RequestBody CouncilRequest request) {
        log.info("PUT /councils/{}", id);
        CouncilResponse council = councilService.updateCouncil(id, request);
        return ResponseEntity.ok(council);
    }

    @PatchMapping({"/api/v1/councils/{id}/status", "/api/v1/organizations/{id}/status"})
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN')")
    public ResponseEntity<CouncilResponse> updateCouncilStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        log.info("PATCH /councils/{}/status - status={}", id, status);
        CouncilResponse council = councilService.updateStatus(id, status);
        return ResponseEntity.ok(council);
    }

    // ========================================================================
    // DELETE
    // ========================================================================

    @DeleteMapping({"/api/v1/councils/{id}", "/api/v1/organizations/{id}"})
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN')")
    public ResponseEntity<Void> deleteCouncil(@PathVariable Long id) {
        log.info("DELETE /councils/{}", id);
        councilService.deleteCouncil(id);
        return ResponseEntity.ok().build();
    }

    // ========================================================================
    // STATISTICS
    // ========================================================================

    @GetMapping({"/api/v1/councils/stats", "/api/v1/organizations/stats"})
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<CouncilStatsResponse> getCouncilStats() {
        log.info("GET /councils/stats");
        CouncilStatsResponse stats = councilService.getStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/api/v1/councils/{id}/update-stats")
    @PreAuthorize("hasAnyRole('GLOBAL_SYSTEM_ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN')")
    public ResponseEntity<CouncilResponse> updateCouncilStats(@PathVariable Long id) {
        log.info("POST /councils/{}/update-stats", id);
        CouncilResponse council = councilService.updateCouncilStats(id);
        return ResponseEntity.ok(council);
    }
}
