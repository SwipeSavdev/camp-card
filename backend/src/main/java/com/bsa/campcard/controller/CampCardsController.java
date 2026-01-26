package com.bsa.campcard.controller;

import com.bsa.campcard.entity.CampCard;
import com.bsa.campcard.entity.CampCard.CampCardStatus;
import com.bsa.campcard.repository.CampCardRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/camp-cards")
@RequiredArgsConstructor
@Tag(name = "Camp Cards", description = "Camp Card management for admin dashboard")
public class CampCardsController {

    private final CampCardRepository campCardRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get all camp cards",
               description = "List all issued camp cards with user information")
    public ResponseEntity<Map<String, Object>> getAllCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        log.info("Fetching all camp cards. Page: {}, Size: {}, Status: {}, Search: {}", page, size, status, search);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Get all camp cards from the camp_cards table
        Page<CampCard> campCards;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
            campCards = campCardRepository.findByStatus(
                CampCardStatus.valueOf(status.toUpperCase()),
                pageable
            );
        } else {
            campCards = campCardRepository.findAll(pageable);
        }

        // Map camp cards to response with user info
        List<Map<String, Object>> cards = new ArrayList<>();

        for (CampCard campCard : campCards.getContent()) {
            Map<String, Object> card = new HashMap<>();
            card.put("id", campCard.getUuid().toString());
            card.put("cardNumber", campCard.getCardNumber());
            card.put("status", campCard.getStatus().name());
            card.put("createdAt", campCard.getCreatedAt());
            card.put("expiresAt", campCard.getExpiresAt());
            card.put("activatedAt", campCard.getActivatedAt());
            card.put("issuanceMethod", campCard.getGiftedAt() != null ? "GIFT" : "PURCHASE");

            // Get user info from owner
            if (campCard.getOwnerUserId() != null) {
                Optional<User> userOpt = userRepository.findById(campCard.getOwnerUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    card.put("name", user.getFirstName() + " " + user.getLastName());
                    card.put("email", user.getEmail());
                    card.put("userId", user.getId().toString());
                } else {
                    card.put("name", "Unknown User");
                    card.put("email", "");
                    card.put("userId", campCard.getOwnerUserId().toString());
                }
            } else {
                card.put("name", "Unassigned");
                card.put("email", "");
                card.put("userId", null);
            }

            // Filter by search if provided
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                String name = (String) card.get("name");
                String cardNum = (String) card.get("cardNumber");
                String email = (String) card.get("email");

                if ((name != null && name.toLowerCase().contains(searchLower)) ||
                    (cardNum != null && cardNum.toLowerCase().contains(searchLower)) ||
                    (email != null && email.toLowerCase().contains(searchLower))) {
                    cards.add(card);
                }
            } else {
                cards.add(card);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", cards);
        response.put("totalElements", campCards.getTotalElements());
        response.put("totalPages", campCards.getTotalPages());
        response.put("currentPage", page);
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Get card by ID",
               description = "Get a specific camp card details")
    public ResponseEntity<Map<String, Object>> getCardById(@PathVariable String id) {
        log.info("Fetching camp card: {}", id);

        UUID uuid = UUID.fromString(id);
        Optional<CampCard> cardOpt = campCardRepository.findByUuid(uuid);

        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CampCard campCard = cardOpt.get();
        Map<String, Object> card = new HashMap<>();
        card.put("id", campCard.getUuid().toString());
        card.put("cardNumber", campCard.getCardNumber());
        card.put("status", campCard.getStatus().name());
        card.put("createdAt", campCard.getCreatedAt());
        card.put("expiresAt", campCard.getExpiresAt());
        card.put("activatedAt", campCard.getActivatedAt());
        card.put("issuanceMethod", campCard.getGiftedAt() != null ? "GIFT" : "PURCHASE");

        // Get user info from owner
        if (campCard.getOwnerUserId() != null) {
            Optional<User> userOpt = userRepository.findById(campCard.getOwnerUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                card.put("name", user.getFirstName() + " " + user.getLastName());
                card.put("email", user.getEmail());
                card.put("userId", user.getId().toString());
            }
        }

        return ResponseEntity.ok(card);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'GLOBAL_SYSTEM_ADMIN')")
    @Operation(summary = "Revoke/Delete a card",
               description = "Revoke a camp card")
    public ResponseEntity<Void> deleteCard(@PathVariable String id) {
        log.info("Revoking camp card: {}", id);

        UUID uuid = UUID.fromString(id);
        Optional<CampCard> cardOpt = campCardRepository.findByUuid(uuid);

        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CampCard campCard = cardOpt.get();
        campCard.revoke();
        campCardRepository.save(campCard);

        return ResponseEntity.noContent().build();
    }
}
