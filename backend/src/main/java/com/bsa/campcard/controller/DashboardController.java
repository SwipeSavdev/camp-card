package com.bsa.campcard.controller;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.dto.DashboardResponse.*;
import com.bsa.campcard.entity.Troop;
import com.bsa.campcard.repository.TroopRepository;
import com.bsa.campcard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard and analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;
    private final TroopRepository troopRepository;

    /**
     * Helper to get the troop's Long ID from a Unit Leader's UUID troopId
     */
    private Long getTroopIdForUnitLeader(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            if (user.getRole() == User.UserRole.UNIT_LEADER && user.getTroopId() != null) {
                return troopRepository.findByUuid(user.getTroopId())
                    .map(Troop::getId)
                    .orElse(null);
            }
        }
        return null;
    }

    /**
     * Filter dashboard response to only include data for a specific troop
     */
    private DashboardResponse filterForTroop(DashboardResponse response, Long troopId) {
        if (troopId == null) return response;

        // Filter troop sales to only include the user's troop
        if (response.getTroopSales() != null) {
            List<TroopSalesData> filteredTroopSales = response.getTroopSales().stream()
                .filter(ts -> ts.getId().equals(troopId))
                .collect(Collectors.toList());
            response.setTroopSales(filteredTroopSales);
        }

        // Filter troop recruiting to only include the user's troop
        if (response.getTroopRecruiting() != null) {
            List<TroopRecruitingData> filteredTroopRecruiting = response.getTroopRecruiting().stream()
                .filter(tr -> tr.getId().equals(troopId))
                .collect(Collectors.toList());
            response.setTroopRecruiting(filteredTroopRecruiting);
        }

        // Filter scout sales to only include scouts from the user's troop
        if (response.getScoutSales() != null) {
            // Note: ScoutSalesData has troop name, we need to match by troop ID
            // For now, filter by troop name pattern
            Troop troop = troopRepository.findById(troopId).orElse(null);
            if (troop != null) {
                String troopName = "Troop " + troop.getTroopNumber();
                List<ScoutSalesData> filteredScoutSales = response.getScoutSales().stream()
                    .filter(ss -> troopName.equals(ss.getTroop()))
                    .collect(Collectors.toList());
                response.setScoutSales(filteredScoutSales);
            }
        }

        // Filter scout referrals to only include scouts from the user's troop
        if (response.getScoutReferrals() != null) {
            Troop troop = troopRepository.findById(troopId).orElse(null);
            if (troop != null) {
                String troopName = "Troop " + troop.getTroopNumber();
                List<ScoutReferralData> filteredScoutReferrals = response.getScoutReferrals().stream()
                    .filter(sr -> troopName.equals(sr.getTroop()))
                    .collect(Collectors.toList());
                response.setScoutReferrals(filteredScoutReferrals);
            }
        }

        // Clear customer referrals for Unit Leaders (they shouldn't see this)
        response.setCustomerReferrals(null);

        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get dashboard data", description = "Returns comprehensive dashboard data including BSA reporting metrics")
    public ResponseEntity<DashboardResponse> getDashboard() {
        log.info("Dashboard data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get dashboard summary", description = "Returns summary metrics only")
    public ResponseEntity<DashboardResponse> getDashboardSummary() {
        log.info("Dashboard summary requested");
        DashboardResponse response = dashboardService.getDashboardData();
        // Clear detailed data for summary view
        response.setTroopSales(null);
        response.setTroopRecruiting(null);
        response.setScoutSales(null);
        response.setScoutReferrals(null);
        response.setCustomerReferrals(null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/troop-sales")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get troop sales data", description = "Returns troop sales breakdown for analytics")
    public ResponseEntity<?> getTroopSales(Authentication authentication) {
        log.info("Troop sales data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        Long troopId = getTroopIdForUnitLeader(authentication);
        if (troopId != null) {
            response = filterForTroop(response, troopId);
        }
        return ResponseEntity.ok(response.getTroopSales());
    }

    @GetMapping("/troop-recruiting")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get troop recruiting data", description = "Returns scout recruiting numbers by troop")
    public ResponseEntity<?> getTroopRecruiting(Authentication authentication) {
        log.info("Troop recruiting data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        Long troopId = getTroopIdForUnitLeader(authentication);
        if (troopId != null) {
            response = filterForTroop(response, troopId);
        }
        return ResponseEntity.ok(response.getTroopRecruiting());
    }

    @GetMapping("/scout-sales")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get individual scout sales", description = "Returns sales data for individual scouts")
    public ResponseEntity<?> getScoutSales(Authentication authentication) {
        log.info("Scout sales data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        Long troopId = getTroopIdForUnitLeader(authentication);
        if (troopId != null) {
            response = filterForTroop(response, troopId);
        }
        return ResponseEntity.ok(response.getScoutSales());
    }

    @GetMapping("/scout-referrals")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get scout referrals", description = "Returns referral data for scouts")
    public ResponseEntity<?> getScoutReferrals(Authentication authentication) {
        log.info("Scout referrals data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        Long troopId = getTroopIdForUnitLeader(authentication);
        if (troopId != null) {
            response = filterForTroop(response, troopId);
        }
        return ResponseEntity.ok(response.getScoutReferrals());
    }

    @GetMapping("/customer-referrals")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get customer referrals", description = "Returns customer referral data with drill-down")
    public ResponseEntity<?> getCustomerReferrals() {
        log.info("Customer referrals data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response.getCustomerReferrals());
    }

    @GetMapping("/sales-trend")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get sales trend data", description = "Returns 30-day sales trend for charts")
    public ResponseEntity<?> getSalesTrend() {
        log.info("Sales trend data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response.getSalesTrend30Days());
    }
}
