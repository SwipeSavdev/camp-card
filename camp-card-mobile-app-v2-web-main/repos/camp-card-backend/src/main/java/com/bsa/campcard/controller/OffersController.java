package com.bsa.campcard.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import com.bsa.campcard.repository.OffersRepository;
import com.bsa.campcard.model.Offer;

@RestController
public class OffersController {

 @Autowired
 private OffersRepository offersRepository;

 public record Merchant(
 Integer id,
 String business_name,
 String category,
 String logo_url,
 String website_url
 ) {}

 public record Location(
 Integer id,
 String name,
 String address,
 Double distance_km,
 Double latitude,
 Double longitude
 ) {}

 public record OfferDTO(
 Integer id,
 String uuid,
 Merchant merchant,
 String title,
 String description,
 String category,
 String valid_from,
 String valid_until,
 String usage_type,
 List<Location> locations,
 Boolean can_redeem
 ) {}

 public record Pagination(Integer total, Integer limit, Integer offset, Boolean has_more) {}

 public record OffersListResponse(List<OfferDTO> data, Pagination pagination) {}

 public record OfferDetailsResponse(OfferDTO offer) {}

 public record OfferCreateRequest(
 String title,
 String description,
 String category,
 Integer merchant_id,
 String valid_from,
 String valid_until,
 String usage_type,
 String discount_description,
 Double discount_value,
 Boolean is_featured
 ) {}

 public record ActivateOfferRequest(Integer location_id) {}

 public record RedemptionCode(
 String id,
 String code,
 String qr_code_data,
 String expires_at,
 String instructions,
 OfferDTO offer,
 Location location
 ) {}

 public record ActivateOfferResponse(RedemptionCode redemption_code) {}

 // Helper method to convert JPA entity to DTO
 private OfferDTO convertToDTO(Offer dbOffer) {
 return new OfferDTO(
 dbOffer.getId(),
 dbOffer.getUuid(),
 new Merchant(0, "Merchant", getCategoryName(dbOffer.getCategoryId()), null, ""),
 dbOffer.getTitle(),
 dbOffer.getDescription(),
 getCategoryName(dbOffer.getCategoryId()),
 dbOffer.getValidFrom().toString(),
 dbOffer.getValidUntil().toString(),
 dbOffer.getUsageType(),
 new ArrayList<>(),
 dbOffer.getIsActive()
 );
 }

 // Helper method to map category ID to name
 private String getCategoryName(Integer categoryId) {
 switch (categoryId) {
 case 1: return "DINING";
 case 2: return "AUTO";
 case 3: return "ENTERTAINMENT";
 case 4: return "RETAIL";
 case 5: return "SERVICES";
 case 6: return "HEALTH";
 case 7: return "TRAVEL";
 default: return "OTHER";
 }
 }

 // Helper method to map category name to ID
 private Integer parseCategoryId(String category) {
 if (category == null) return 3;
 switch (category.toUpperCase()) {
 case "DINING": return 1;
 case "AUTO": return 2;
 case "ENTERTAINMENT": return 3;
 case "RETAIL": return 4;
 case "SERVICES": return 5;
 case "HEALTH": return 6;
 case "TRAVEL": return 7;
 default: return 3;
 }
 }

 @GetMapping("/offers")
 public OffersListResponse listOffers(
 @RequestParam(required = false) String council_id,
 @RequestParam(required = false) String category,
 @RequestParam(required = false) Double latitude,
 @RequestParam(required = false) Double longitude,
 @RequestParam(required = false) Double radius_km,
 @RequestParam(required = false, defaultValue = "20") Integer limit,
 @RequestParam(required = false, defaultValue = "0") Integer offset
 ) {
 // Get all active offers from database
 List<Offer> allOffers = offersRepository.findByIsActive(true);

 // Filter by category if provided
 if (category != null && !category.isBlank()) {
 Integer categoryId = parseCategoryId(category);
 final Integer finalCategoryId = categoryId;
 allOffers = allOffers.stream()
 .filter(o -> o.getCategoryId().equals(finalCategoryId))
 .toList();
 }

 // Convert to DTOs and apply pagination
 List<OfferDTO> pageOffers = allOffers.stream()
 .skip(offset)
 .limit(limit)
 .map(this::convertToDTO)
 .toList();

 return new OffersListResponse(
 pageOffers,
 new Pagination(allOffers.size(), limit, offset, offset + limit < allOffers.size())
 );
 }

 @GetMapping("/offers/{id}")
 public OfferDetailsResponse getOffer(@PathVariable Integer id) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
 return new OfferDetailsResponse(convertToDTO(offer));
 }

 @PostMapping("/offers")
 @ResponseStatus(HttpStatus.CREATED)
 public OfferDetailsResponse createOffer(@RequestBody OfferCreateRequest body) {
 var newOffer = new Offer();
 newOffer.setUuid("offer-uuid-" + UUID.randomUUID().toString().substring(0, 8));
 newOffer.setMerchantId(java.util.UUID.fromString(String.valueOf(body.merchant_id())));
 newOffer.setCategoryId(parseCategoryId(body.category()));
 newOffer.setTitle(body.title());
 newOffer.setDescription(body.description());
 newOffer.setDiscountDescription(body.discount_description());
 if (body.discount_value() != null) {
 newOffer.setDiscountValue(BigDecimal.valueOf(body.discount_value()));
 }
 newOffer.setUsageType(body.usage_type());
 newOffer.setIsFeatured(body.is_featured() != null ? body.is_featured() : false);
 newOffer.setValidFrom(LocalDateTime.parse(body.valid_from() + "T00:00:00"));
 newOffer.setValidUntil(LocalDateTime.parse(body.valid_until() + "T23:59:59"));
 newOffer.setIsActive(true);

 var saved = offersRepository.save(newOffer);
 return new OfferDetailsResponse(convertToDTO(saved));
 }

 @PutMapping("/offers/{id}")
 public OfferDetailsResponse updateOffer(@PathVariable Integer id, @RequestBody OfferCreateRequest body) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));

 if (body.title() != null) offer.setTitle(body.title());
 if (body.description() != null) offer.setDescription(body.description());
 if (body.category() != null) offer.setCategoryId(parseCategoryId(body.category()));
 if (body.discount_description() != null) offer.setDiscountDescription(body.discount_description());
 if (body.discount_value() != null) offer.setDiscountValue(BigDecimal.valueOf(body.discount_value()));
 if (body.usage_type() != null) offer.setUsageType(body.usage_type());
 if (body.is_featured() != null) offer.setIsFeatured(body.is_featured());
 if (body.valid_from() != null) offer.setValidFrom(LocalDateTime.parse(body.valid_from() + "T00:00:00"));
 if (body.valid_until() != null) offer.setValidUntil(LocalDateTime.parse(body.valid_until() + "T23:59:59"));

 var updated = offersRepository.save(offer);
 return new OfferDetailsResponse(convertToDTO(updated));
 }

 @DeleteMapping("/offers/{id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 public void deleteOffer(@PathVariable Integer id) {
 offersRepository.deleteById(id);
 }

 @PostMapping("/offers/{id}/activate")
 public ActivateOfferResponse activateOffer(@PathVariable Integer id, @RequestBody(required = false) ActivateOfferRequest body) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
 var location = new Location(0, "TBD Location", "TBD Address", null, null, null);

 var code = "CC" + id + "-" + (int)(Math.random() * 9000 + 1000);
 var redemption = new RedemptionCode(
 "rc_" + id,
 code,
 "campcard://redeem?code=" + code,
 Instant.now().plusSeconds(10 * 60).toString(),
 "Show this code to the merchant and confirm redemption.",
 convertToDTO(offer),
 location
 );

 return new ActivateOfferResponse(redemption);
 }

 // Convenience endpoint for testing connectivity
 @GetMapping("/debug")
 public Map<String, Object> debug() {
 long offerCount = offersRepository.countByIsActive(true);
 return Map.of("offers", offerCount, "status", "Database-backed offers active");
 }
}
