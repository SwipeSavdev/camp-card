package com.bsa.campcard.controller;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "Dashboard and analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

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
    public ResponseEntity<?> getTroopSales() {
        log.info("Troop sales data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response.getTroopSales());
    }

    @GetMapping("/troop-recruiting")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get troop recruiting data", description = "Returns scout recruiting numbers by troop")
    public ResponseEntity<?> getTroopRecruiting() {
        log.info("Troop recruiting data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response.getTroopRecruiting());
    }

    @GetMapping("/scout-sales")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get individual scout sales", description = "Returns sales data for individual scouts")
    public ResponseEntity<?> getScoutSales() {
        log.info("Scout sales data requested");
        DashboardResponse response = dashboardService.getDashboardData();
        return ResponseEntity.ok(response.getScoutSales());
    }

    @GetMapping("/scout-referrals")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN', 'UNIT_LEADER')")
    @Operation(summary = "Get scout referrals", description = "Returns referral data for scouts")
    public ResponseEntity<?> getScoutReferrals() {
        log.info("Scout referrals data requested");
        DashboardResponse response = dashboardService.getDashboardData();
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
