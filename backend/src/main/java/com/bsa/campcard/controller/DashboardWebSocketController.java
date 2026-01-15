package com.bsa.campcard.controller;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class DashboardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DashboardService dashboardService;

    /**
     * Handle client request for dashboard refresh
     * Client sends to /app/dashboard/refresh
     * Response is broadcast to /topic/dashboard
     */
    @MessageMapping("/dashboard/refresh")
    @SendTo("/topic/dashboard")
    public DashboardResponse refreshDashboard() {
        log.info("WebSocket: Dashboard refresh requested");
        return dashboardService.getDashboardData();
    }

    /**
     * Broadcast dashboard updates every 30 seconds
     * All subscribed clients receive updates automatically
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void broadcastDashboardUpdate() {
        try {
            DashboardResponse data = dashboardService.getDashboardData();
            messagingTemplate.convertAndSend("/topic/dashboard", data);
            log.debug("WebSocket: Broadcast dashboard update to /topic/dashboard");
        } catch (Exception e) {
            log.error("WebSocket: Failed to broadcast dashboard update", e);
        }
    }

    /**
     * Handle subscription to specific data channels
     * Client sends to /app/subscribe/{channel}
     */
    @MessageMapping("/subscribe/troop-sales")
    @SendTo("/topic/troop-sales")
    public Object subscribeTroopSales() {
        log.info("WebSocket: Troop sales subscription");
        return dashboardService.getDashboardData().getTroopSales();
    }

    @MessageMapping("/subscribe/scout-sales")
    @SendTo("/topic/scout-sales")
    public Object subscribeScoutSales() {
        log.info("WebSocket: Scout sales subscription");
        return dashboardService.getDashboardData().getScoutSales();
    }

    @MessageMapping("/subscribe/referrals")
    @SendTo("/topic/referrals")
    public Object subscribeReferrals() {
        log.info("WebSocket: Referrals subscription");
        DashboardResponse data = dashboardService.getDashboardData();
        return java.util.Map.of(
                "scoutReferrals", data.getScoutReferrals(),
                "customerReferrals", data.getCustomerReferrals()
        );
    }

    /**
     * Broadcast specific updates when data changes
     * Called programmatically when sales/referrals are recorded
     */
    public void notifySaleRecorded(Long scoutId, java.math.BigDecimal amount) {
        log.info("WebSocket: Broadcasting sale notification for scout {}", scoutId);
        messagingTemplate.convertAndSend("/topic/notifications", java.util.Map.of(
                "type", "SALE_RECORDED",
                "scoutId", scoutId,
                "amount", amount,
                "timestamp", java.time.Instant.now().toString()
        ));
        // Also broadcast updated dashboard
        broadcastDashboardUpdate();
    }

    public void notifyReferralCompleted(String referrerId, String referredUserId) {
        log.info("WebSocket: Broadcasting referral notification");
        messagingTemplate.convertAndSend("/topic/notifications", java.util.Map.of(
                "type", "REFERRAL_COMPLETED",
                "referrerId", referrerId,
                "referredUserId", referredUserId,
                "timestamp", java.time.Instant.now().toString()
        ));
        // Also broadcast updated dashboard
        broadcastDashboardUpdate();
    }
}
