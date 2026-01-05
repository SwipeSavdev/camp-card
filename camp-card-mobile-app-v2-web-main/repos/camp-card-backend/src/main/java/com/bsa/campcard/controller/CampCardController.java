package com.bsa.campcard.controller;

import java.time.Instant;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
public class CampCardController {

 // --- Mutable CampCard class for storage ---
 public static class CampCard {
 public String id;
 public String user_id;
 public String card_number;
 public String card_member_number;
 public String card_holder_name;
 public String status;
 public Boolean is_primary;
 public String card_type;
 public String subscription_type;
 public Double subscription_price;
 public Double current_balance;
 public Integer loyalty_points;
 public String issued_at;
 public String expires_at;
 public String activated_at;
 public Map<String, Object> metadata;

 public CampCard(String id, String user_id, String card_number, String card_member_number,
 String card_holder_name, String status, Boolean is_primary, String card_type,
 String subscription_type, Double subscription_price, Double current_balance,
 Integer loyalty_points, String issued_at, String expires_at, String activated_at,
 Map<String, Object> metadata) {
 this.id = id;
 this.user_id = user_id;
 this.card_number = card_number;
 this.card_member_number = card_member_number;
 this.card_holder_name = card_holder_name;
 this.status = status;
 this.is_primary = is_primary;
 this.card_type = card_type;
 this.subscription_type = subscription_type;
 this.subscription_price = subscription_price;
 this.current_balance = current_balance;
 this.loyalty_points = loyalty_points;
 this.issued_at = issued_at;
 this.expires_at = expires_at;
 this.activated_at = activated_at;
 this.metadata = metadata;
 }
 }

 // --- DTOs ---

 public record CampCardRequest(
 String user_id,
 String card_holder_name,
 String card_type,
 String subscription_type,
 Double subscription_price
 ) {}

 public record CampCardResponse(
 String id,
 String user_id,
 String card_number,
 String card_member_number,
 String card_holder_name,
 String status,
 Boolean is_primary,
 String card_type,
 String subscription_type,
 Double subscription_price,
 Double current_balance,
 Integer loyalty_points,
 String issued_at,
 String expires_at,
 String activated_at,
 Map<String, Object> metadata
 ) {}

 public record WalletResponse(
 String user_id,
 List<CampCardResponse> cards,
 Double total_balance,
 Integer total_loyalty_points
 ) {}

 public record IssuanceResponse(
 String status,
 String message,
 CampCardResponse card
 ) {}

 public record CardActivationRequest(
 String card_member_number
 ) {}

 // Mock storage for demo - using mutable CampCard class
 private static final List<CampCard> SAMPLE_CARDS = new ArrayList<>();
 private static final Random RANDOM = new Random();

 static {
 // Create sample cards for test user
 SAMPLE_CARDS.add(
 new CampCard(
 UUID.randomUUID().toString(),
 "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 "4111111111111111",
 "CARD-000001",
 "Jason Mayoral",
 "ACTIVE",
 true,
 "STANDARD",
 "MONTHLY",
 9.99,
 250.0,
 1500,
 Instant.now().toString(),
 Instant.now().plusSeconds(365 * 24 * 60 * 60).toString(),
 Instant.now().toString(),
 Map.of("tier", "gold", "features", List.of("unlimited_offers", "geo_notifications"))
 )
 );
 }

 private CampCardResponse toResponse(CampCard card) {
 return new CampCardResponse(
 card.id, card.user_id, card.card_number, card.card_member_number,
 card.card_holder_name, card.status, card.is_primary, card.card_type,
 card.subscription_type, card.subscription_price, card.current_balance,
 card.loyalty_points, card.issued_at, card.expires_at, card.activated_at,
 card.metadata
 );
 }

 private CampCard getCampCardMutable(String card_id) {
 return SAMPLE_CARDS.stream()
 .filter(c -> c.id.equals(card_id))
 .findFirst()
 .orElse(null);
 }

 @GetMapping("/users/{user_id}/wallet")
 public WalletResponse getWallet(@PathVariable String user_id) {
 var userCards = SAMPLE_CARDS.stream()
 .filter(c -> c.user_id.equals(user_id))
 .map(this::toResponse)
 .toList();

 var totalBalance = SAMPLE_CARDS.stream()
 .filter(c -> c.user_id.equals(user_id))
 .mapToDouble(c -> c.current_balance)
 .sum();

 var totalPoints = SAMPLE_CARDS.stream()
 .filter(c -> c.user_id.equals(user_id))
 .mapToInt(c -> c.loyalty_points)
 .sum();

 return new WalletResponse(
 user_id,
 new ArrayList<>(userCards),
 totalBalance,
 totalPoints
 );
 }

 @GetMapping("/camp-cards")
 public Map<String, Object> listCampCards(
 @RequestParam(required = false) String user_id,
 @RequestParam(required = false, defaultValue = "ACTIVE") String status
 ) {
 var cards = SAMPLE_CARDS.stream()
 .filter(c -> user_id == null || c.user_id.equals(user_id))
 .filter(c -> c.status.equals(status))
 .map(this::toResponse)
 .toList();

 return Map.of(
 "data", cards,
 "total", cards.size()
 );
 }

 @GetMapping("/camp-cards/{card_id}")
 public CampCardResponse getCampCard(@PathVariable String card_id) {
 var card = getCampCardMutable(card_id);
 return card != null ? toResponse(card) : null;
 }

 @PostMapping("/users/{user_id}/issue-card")
 @ResponseStatus(HttpStatus.CREATED)
 public IssuanceResponse issueCard(@PathVariable String user_id, @RequestBody CampCardRequest body) {
 // Generate unique card member number
 String cardMemberNumber = String.format("CARD-%06d", RANDOM.nextInt(1000000));
 String cardNumber = String.format("%016d", RANDOM.nextLong() & 0x7FFFFFFFL);

 var newCard = new CampCard(
 UUID.randomUUID().toString(),
 user_id,
 cardNumber,
 cardMemberNumber,
 body.card_holder_name(),
 "PENDING",
 true,
 body.card_type() != null ? body.card_type() : "STANDARD",
 body.subscription_type(),
 body.subscription_price(),
 0.0,
 0,
 Instant.now().toString(),
 Instant.now().plusSeconds(365 * 24 * 60 * 60).toString(),
 null,
 Map.of("tier", "standard", "subscription_status", "active")
 );

 SAMPLE_CARDS.add(newCard);

 return new IssuanceResponse(
 "success",
 "Camp card issued successfully. Card member number: " + cardMemberNumber,
 toResponse(newCard)
 );
 }

 @PutMapping("/camp-cards/{card_id}")
 public CampCardResponse updateCampCard(@PathVariable String card_id, @RequestBody CampCardRequest body) {
 var card = getCampCardMutable(card_id);

 if (card == null) {
 return null;
 }

 if (body.card_holder_name() != null) card.card_holder_name = body.card_holder_name();
 if (body.card_type() != null) card.card_type = body.card_type();
 if (body.subscription_type() != null) card.subscription_type = body.subscription_type();
 if (body.subscription_price() != null) card.subscription_price = body.subscription_price();

 return toResponse(card);
 }

 @PostMapping("/camp-cards/{card_id}/activate")
 public Map<String, Object> activateCampCard(@PathVariable String card_id, @RequestBody(required = false) CardActivationRequest body) {
 var card = getCampCardMutable(card_id);
 if (card == null) {
 return Map.of("error", "Card not found");
 }

 card.status = "ACTIVE";
 card.activated_at = Instant.now().toString();

 return Map.of(
 "status", "activated",
 "card_id", card_id,
 "card_member_number", card.card_member_number,
 "activated_at", card.activated_at
 );
 }

 @PostMapping("/camp-cards/{card_id}/suspend")
 public Map<String, Object> suspendCampCard(@PathVariable String card_id) {
 var card = getCampCardMutable(card_id);
 if (card == null) {
 return Map.of("error", "Card not found");
 }

 card.status = "SUSPENDED";

 return Map.of(
 "status", "suspended",
 "card_id", card_id,
 "message", "Card has been suspended"
 );
 }

 @DeleteMapping("/camp-cards/{card_id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 public void deleteCampCard(@PathVariable String card_id) {
 SAMPLE_CARDS.removeIf(c -> c.id.equals(card_id));
 }

 @PostMapping("/camp-cards/{card_id}/add-balance")
 public Map<String, Object> addBalance(@PathVariable String card_id, @RequestBody Map<String, Double> body) {
 var card = getCampCardMutable(card_id);
 if (card == null) {
 return Map.of("error", "Card not found");
 }

 Double amount = body.get("amount");
 Double previousBalance = card.current_balance;
 card.current_balance += amount;

 return Map.of(
 "card_id", card_id,
 "previous_balance", previousBalance,
 "amount_added", amount,
 "new_balance", card.current_balance,
 "updated_at", Instant.now().toString()
 );
 }

 @PostMapping("/camp-cards/{card_id}/add-points")
 public Map<String, Object> addLoyaltyPoints(@PathVariable String card_id, @RequestBody Map<String, Integer> body) {
 var card = getCampCardMutable(card_id);
 if (card == null) {
 return Map.of("error", "Card not found");
 }

 Integer points = body.get("points");
 Integer previousPoints = card.loyalty_points;
 card.loyalty_points += points;

 return Map.of(
 "card_id", card_id,
 "previous_points", previousPoints,
 "points_added", points,
 "new_points", card.loyalty_points,
 "updated_at", Instant.now().toString()
 );
 }
}
