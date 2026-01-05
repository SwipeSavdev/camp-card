package com.bsa.campcard.controller;

import java.time.Instant;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import org.springframework.beans.factory.annotation.Autowired;

import com.bsa.campcard.model.Merchant;
import com.bsa.campcard.repository.MerchantRepository;

@RestController
public class MerchantsController {

 @Autowired
 private MerchantRepository merchantRepository;

 public record Address(
 String street,
 String city,
 String state,
 String postal_code,
 String country
 ) {}

 public record GeoLocation(
 Double latitude,
 Double longitude,
 String map_url
 ) {}

 public record MerchantLocationRequest(
 String name,
 String address,
 String city,
 String state,
 String postal_code,
 String country,
 Double latitude,
 Double longitude,
 Double radius_km,
 String hours_open,
 String hours_close,
 String days_open
 ) {}

 public record MerchantLocation(
 String id,
 String merchant_id,
 String name,
 String address,
 String city,
 String state,
 String postal_code,
 String country,
 Double latitude,
 Double longitude,
 Double radius_km,
 String hours_open,
 String hours_close,
 String days_open,
 Boolean is_active,
 Integer nearby_offers_count,
 String created_at
 ) {}

 public record MerchantRequest(
 String business_name,
 String category,
 String description,
 String website_url,
 String phone_number,
 String email,
 String logo_url
 ) {}

 public record MerchantResponse(
 String id,
 String business_name,
 String category,
 String description,
 String website_url,
 String phone_number,
 String email,
 String logo_url,
 String banner_url,
 Boolean is_active,
 Boolean verified,
 List<MerchantLocation> locations,
 Integer total_locations,
 Integer total_offers,
 String created_at,
 String updated_at
 ) {}

 public record MerchantListResponse(
 List<MerchantResponse> merchants,
 Integer total
 ) {}

 public record NearbyOffersRequest(
 Double latitude,
 Double longitude,
 Double radius_km,
 String category
 ) {}

 public record NearbyOffer(
 String offer_id,
 String merchant_id,
 String merchant_name,
 String merchant_category,
 String merchant_logo_url,
 String location_id,
 String location_name,
 String location_address,
 Double distance_km,
 String offer_title,
 String offer_description,
 String map_url
 ) {}

 public record NearbyOffersResponse(
 List<NearbyOffer> offers,
 Integer total,
 Double user_latitude,
 Double user_longitude,
 Double search_radius_km
 ) {}

 // Database repository (injected above)

 @GetMapping("/merchants")
 public MerchantListResponse listMerchants(
 @RequestParam(required = false) String category,
 @RequestParam(required = false) Boolean verified,
 @RequestParam(required = false) Boolean is_active
 ) {
 List<Merchant> merchants = merchantRepository.findAll();

 var filtered = merchants.stream()
 .filter(m -> category == null || m.getCategory().equalsIgnoreCase(category))
 .filter(m -> is_active == null || m.getIsActive().equals(is_active))
 .map(this::convertToResponse)
 .toList();

 return new MerchantListResponse(filtered, filtered.size());
 }

 @GetMapping("/merchants/{merchant_id}")
 public MerchantResponse getMerchant(@PathVariable String merchant_id) {
 try {
 UUID id = UUID.fromString(merchant_id);
 return merchantRepository.findById(id)
 .map(this::convertToResponse)
 .orElse(null);
 } catch (IllegalArgumentException e) {
 return null;
 }
 }

 @PostMapping("/merchants")
 @ResponseStatus(HttpStatus.CREATED)
 public MerchantResponse createMerchant(@RequestBody MerchantRequest body) {
 Merchant merchant = new Merchant();
 merchant.setBusinessName(body.business_name());
 merchant.setCategory(body.category());
 merchant.setDescription(body.description());
 merchant.setWebsiteUrl(body.website_url());
 merchant.setPhoneNumber(body.phone_number());
 merchant.setEmail(body.email());
 merchant.setLogoUrl(body.logo_url());
 merchant.setIsActive(true);
 merchant.setVerified(false);

 Merchant saved = merchantRepository.save(merchant);
 return convertToResponse(saved);
 }

 @PutMapping("/merchants/{merchant_id}")
 public MerchantResponse updateMerchant(@PathVariable String merchant_id, @RequestBody MerchantRequest body) {
 try {
 UUID id = UUID.fromString(merchant_id);
 var merchant = merchantRepository.findById(id).orElse(null);
 if (merchant == null) {
 return null;
 }

 if (body.business_name() != null) merchant.setBusinessName(body.business_name());
 if (body.category() != null) merchant.setCategory(body.category());
 if (body.description() != null) merchant.setDescription(body.description());
 if (body.website_url() != null) merchant.setWebsiteUrl(body.website_url());
 if (body.phone_number() != null) merchant.setPhoneNumber(body.phone_number());
 if (body.email() != null) merchant.setEmail(body.email());
 if (body.logo_url() != null) merchant.setLogoUrl(body.logo_url());

 Merchant updated = merchantRepository.save(merchant);
 return convertToResponse(updated);
 } catch (IllegalArgumentException e) {
 return null;
 }
 }

 @DeleteMapping("/merchants/{merchant_id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 public void deleteMerchant(@PathVariable String merchant_id) {
 try {
 UUID id = UUID.fromString(merchant_id);
 merchantRepository.deleteById(id);
 } catch (IllegalArgumentException e) {
 // Invalid UUID format, do nothing
 }
 }

 @PostMapping("/merchants/{merchant_id}/locations")
 @ResponseStatus(HttpStatus.CREATED)
 public MerchantLocation addMerchantLocation(@PathVariable String merchant_id, @RequestBody MerchantLocationRequest body) {
 return new MerchantLocation(
 UUID.randomUUID().toString(),
 merchant_id,
 body.name(),
 body.address(),
 body.city(),
 body.state(),
 body.postal_code(),
 body.country(),
 body.latitude(),
 body.longitude(),
 body.radius_km() != null ? body.radius_km() : 2.0,
 body.hours_open(),
 body.hours_close(),
 body.days_open(),
 true,
 0,
 Instant.now().toString()
 );
 }

 @GetMapping("/merchants/{merchant_id}/locations")
 public Map<String, Object> getMerchantLocations(@PathVariable String merchant_id) {
 var merchant = getMerchant(merchant_id);
 if (merchant == null) {
 return Map.of("error", "Merchant not found");
 }

 return Map.of(
 "merchant_id", merchant_id,
 "locations", merchant.locations(),
 "total", merchant.total_locations()
 );
 }

 @GetMapping("/merchants/nearby")
 public NearbyOffersResponse getNearbyOffers(
 @RequestParam Double latitude,
 @RequestParam Double longitude,
 @RequestParam(required = false, defaultValue = "5.0") Double radius_km,
 @RequestParam(required = false) String category
 ) {
 // Calculate distance for each merchant location
 List<NearbyOffer> nearbyOffers = new ArrayList<>();
 List<Merchant> merchants = merchantRepository.findAll();

 for (var merchant : merchants) {
 if (category != null && !merchant.getCategory().equalsIgnoreCase(category)) {
 continue;
 }

 // For now, we're not querying merchant locations from the database
 // This would require a separate MerchantLocation entity and repository
 // For demo purposes, returning empty locations list
 }

 return new NearbyOffersResponse(
 nearbyOffers,
 nearbyOffers.size(),
 latitude,
 longitude,
 radius_km
 );
 }

 @PostMapping("/merchants/verify/{merchant_id}")
 public Map<String, Object> verifyMerchant(@PathVariable String merchant_id) {
 var merchant = getMerchant(merchant_id);
 if (merchant == null) {
 return Map.of("error", "Merchant not found");
 }

 return Map.of(
 "status", "verified",
 "merchant_id", merchant_id,
 "verified_at", Instant.now().toString()
 );
 }

 // Helper method to convert JPA entity to response DTO
 private MerchantResponse convertToResponse(Merchant merchant) {
 return new MerchantResponse(
 merchant.getId().toString(),
 merchant.getBusinessName(),
 merchant.getCategory(),
 merchant.getDescription(),
 merchant.getWebsiteUrl(),
 merchant.getPhoneNumber(),
 merchant.getEmail(),
 merchant.getLogoUrl(),
 merchant.getBannerUrl(),
 merchant.getIsActive(),
 merchant.getVerified(),
 new ArrayList<>(), // Locations would be fetched separately if needed
 0, // Total locations
 0, // Total offers
 merchant.getCreatedAt().toString(),
 merchant.getUpdatedAt().toString()
 );
 }
}
