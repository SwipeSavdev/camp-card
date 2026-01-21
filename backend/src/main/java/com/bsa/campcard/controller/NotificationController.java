package com.bsa.campcard.controller;

import com.bsa.campcard.dto.notification.*;
import com.bsa.campcard.service.SnsNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Push notification management endpoints")
public class NotificationController {

    private final SnsNotificationService notificationService;

    @PostMapping("/register-token")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Register device token", description = "Register device token for AWS SNS push notifications")
    public ResponseEntity<Void> registerDeviceToken(
            @Valid @RequestBody DeviceTokenRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Registering device token for user: {}", userId);
        notificationService.registerDeviceToken(userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unregister-token/{token}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unregister device token", description = "Unregister device token from push notifications")
    public ResponseEntity<Void> unregisterDeviceToken(@PathVariable String token) {
        log.info("Unregistering device token");
        notificationService.unregisterDeviceToken(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('COUNCIL_ADMIN', 'NATIONAL_ADMIN')")
    @Operation(summary = "Send notification", description = "Send push notification to specific users via AWS SNS")
    public ResponseEntity<Void> sendNotification(@Valid @RequestBody NotificationRequest request) {
        log.info("Sending notification to {} users", request.getUserIds().size());
        notificationService.sendNotification(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my notifications", description = "Get paginated list of user's notifications")
    public ResponseEntity<Page<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        Page<NotificationResponse> notifications = notificationService.getUserNotifications(
                userId,
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/me/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        log.info("Marking notification {} as read", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("Marking all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
