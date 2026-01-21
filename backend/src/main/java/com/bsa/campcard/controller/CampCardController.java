package com.bsa.campcard.controller;

import com.bsa.campcard.dto.card.*;
import com.bsa.campcard.entity.CampCard.CampCardStatus;
import com.bsa.campcard.service.CampCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Camp Cards", description = "Multi-card purchase, gift, and management endpoints")
public class CampCardController {

    private final CampCardService campCardService;

    // ==================== PURCHASE ENDPOINTS ====================

    @PostMapping("/purchase")
    @Operation(summary = "Purchase camp cards", description = "Purchase 1-10 camp cards in a single transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Cards purchased successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "404", description = "Subscription plan not found")
    })
    public ResponseEntity<PurchaseCardsResponse> purchaseCards(
            Authentication authentication,
            @Valid @RequestBody PurchaseCardsRequest request) {

        UUID userId = getUserId(authentication);
        log.info("Purchase cards request from user: {}, quantity: {}", userId, request.getQuantity());

        PurchaseCardsResponse response = campCardService.purchaseCards(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== CARD RETRIEVAL ENDPOINTS ====================

    @GetMapping("/my-cards")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my cards", description = "Get all cards owned by the authenticated user")
    public ResponseEntity<MyCardsResponse> getMyCards(Authentication authentication) {
        UUID userId = getUserId(authentication);
        log.info("Getting cards for user: {}", userId);

        MyCardsResponse response = campCardService.getMyCards(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cardId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get card by ID", description = "Get a single card by its ID")
    public ResponseEntity<CampCardResponse> getCard(
            Authentication authentication,
            @PathVariable Long cardId) {

        UUID userId = getUserId(authentication);
        CampCardResponse response = campCardService.getCard(userId, cardId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/uuid/{cardUuid}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get card by UUID", description = "Get a single card by its UUID")
    public ResponseEntity<CampCardResponse> getCardByUuid(
            Authentication authentication,
            @PathVariable UUID cardUuid) {

        UUID userId = getUserId(authentication);
        CampCardResponse response = campCardService.getCardByUuid(userId, cardUuid);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiry-status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get card expiry status", description = "Get expiry alert information for user's cards")
    public ResponseEntity<CardExpiryStatusResponse> getExpiryStatus(Authentication authentication) {
        UUID userId = getUserId(authentication);
        log.info("Getting expiry status for user: {}", userId);

        CardExpiryStatusResponse response = campCardService.getExpiryStatus(userId);
        return ResponseEntity.ok(response);
    }

    // ==================== CARD ACTIVATION (REPLENISHMENT) ====================

    @PostMapping("/{cardId}/activate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Activate card", description = "Activate an unused card to replenish offers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card activated successfully"),
        @ApiResponse(responseCode = "400", description = "Card cannot be activated"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<CampCardResponse> activateCard(
            Authentication authentication,
            @PathVariable Long cardId) {

        UUID userId = getUserId(authentication);
        log.info("Activating card {} for user {}", cardId, userId);

        CampCardResponse response = campCardService.activateCard(userId, cardId);
        return ResponseEntity.ok(response);
    }

    // ==================== GIFT ENDPOINTS ====================

    @PostMapping("/{cardId}/gift")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gift a card", description = "Send an unused card as a gift to someone via email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card gifted successfully"),
        @ApiResponse(responseCode = "400", description = "Card cannot be gifted"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<CampCardResponse> giftCard(
            Authentication authentication,
            @PathVariable Long cardId,
            @Valid @RequestBody GiftCardRequest request) {

        UUID userId = getUserId(authentication);
        log.info("Gifting card {} from user {} to {}", cardId, userId, request.getRecipientEmail());

        CampCardResponse response = campCardService.giftCard(userId, cardId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{cardId}/cancel-gift")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel gift", description = "Cancel a pending gift and return the card to the owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Gift canceled successfully"),
        @ApiResponse(responseCode = "400", description = "Gift cannot be canceled"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<CampCardResponse> cancelGift(
            Authentication authentication,
            @PathVariable Long cardId) {

        UUID userId = getUserId(authentication);
        log.info("Canceling gift for card {} by user {}", cardId, userId);

        CampCardResponse response = campCardService.cancelGift(userId, cardId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{cardId}/resend-gift")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Resend gift email", description = "Resend the gift notification email to the recipient")
    public ResponseEntity<CampCardResponse> resendGiftEmail(
            Authentication authentication,
            @PathVariable Long cardId) {

        UUID userId = getUserId(authentication);
        log.info("Resending gift email for card {} by user {}", cardId, userId);

        CampCardResponse response = campCardService.resendGiftEmail(userId, cardId);
        return ResponseEntity.ok(response);
    }

    // ==================== GIFT CLAIM ENDPOINTS (PUBLIC) ====================

    @GetMapping("/claim/{token}")
    @Operation(summary = "Get gift details", description = "Get details of a gifted card by claim token (public endpoint)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Gift details retrieved"),
        @ApiResponse(responseCode = "404", description = "Gift not found or already claimed")
    })
    public ResponseEntity<GiftDetailsResponse> getGiftDetails(
            @PathVariable String token) {

        log.info("Getting gift details for token: {}", token);
        GiftDetailsResponse response = campCardService.getGiftDetails(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/claim/{token}")
    @Operation(summary = "Claim gift", description = "Claim a gifted card (authenticated user) or create account and claim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Gift claimed successfully"),
        @ApiResponse(responseCode = "400", description = "Gift already claimed or expired"),
        @ApiResponse(responseCode = "404", description = "Gift not found")
    })
    public ResponseEntity<CampCardResponse> claimGift(
            Authentication authentication,
            @PathVariable String token,
            @RequestBody(required = false) ClaimGiftRequest request) {

        UUID userId;
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            userId = user.getId();
            log.info("Claiming gift with token {} for authenticated user {}", token, userId);
        } else {
            // TODO: Create user from request and get userId
            throw new IllegalStateException("User must be authenticated to claim gift");
        }

        CampCardResponse response = campCardService.claimGift(token, userId);
        return ResponseEntity.ok(response);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get all cards (admin)", description = "Get all cards in the system with pagination")
    public ResponseEntity<Page<CampCardResponse>> getAllCards(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CampCardResponse> response = campCardService.getAllCards(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get cards by status (admin)", description = "Get cards filtered by status")
    public ResponseEntity<Page<CampCardResponse>> getCardsByStatus(
            @PathVariable CampCardStatus status,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CampCardResponse> response = campCardService.getCardsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/{cardId}/revoke")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Revoke card (admin)", description = "Administratively revoke a card")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Card revoked successfully"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<CampCardResponse> revokeCard(@PathVariable Long cardId) {
        log.info("Admin revoking card {}", cardId);
        CampCardResponse response = campCardService.revokeCard(cardId);
        return ResponseEntity.ok(response);
    }

    // ==================== HELPER METHODS ====================

    private UUID getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("User not authenticated");
    }
}
