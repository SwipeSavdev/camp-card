# Backend Implementation Guide: Database-Backed Offers

**Date:** December 28, 2025
**Status:** IMPLEMENTATION IN PROGRESS
**Objective:** Convert OffersController from in-memory mock data to PostgreSQL persistence

---

## Files Created for You

### 1. Database Migration (Flyway V003)
**File:** `src/main/resources/db/migration/V003__create_offers_table.sql`

**What it does:**
- Creates `offer_categories` table with 7 standard categories
- Creates `offers` table with all required fields
- Creates database indexes for performance
- Seeds 50 sample offers across the 3 merchants
- Adds foreign key from `offer_redemptions` to `offers` table

**When it runs:** Automatically on application startup via Flyway

**Validation command:**
```bash
psql -U postgres -h localhost -d campcard_db -c "SELECT COUNT(*) FROM offers;"
```

**Expected result:** Should return 50

---

### 2. Java Entity Classes

#### File: `src/main/java/com/bsa/campcard/model/Offer.java`
**What it provides:**
- JPA Entity mapping to `offers` table
- All fields with proper annotations
- UUID, timestamps, foreign keys
- `@PrePersist` and `@PreUpdate` hooks for automatic timestamp management
- Complete getters/setters
- Proper indexes defined

#### File: `src/main/java/com/bsa/campcard/model/OfferCategory.java`
**What it provides:**
- JPA Entity mapping to `offer_categories` table
- Fields for category name, description, icon, color
- Automatic timestamp management

---

### 3. Repository Interface

**File:** `src/main/java/com/bsa/campcard/repository/OffersRepository.java`

**What it provides:**
- Spring Data JPA repository for `Offer` entity
- 13 query methods for common database operations:
 - `findByMerchantId(UUID)` - Get all offers for a merchant
 - `findByIsActive(Boolean)` - Get active/inactive offers
 - `findByCategoryId(Integer)` - Get offers in a category
 - `findCurrentlyValidOffers()` - Get offers currently in validity period
 - `findCurrentValidOffersByMerchant(UUID)` - Get valid offers for a merchant
 - `findExpiringOffers()` - Get offers expiring within 7 days
 - Plus counting and UUID lookup methods

**How to use in your controller:**
```java
@Autowired
private OffersRepository offersRepository;

// Query database
List<Offer> offers = offersRepository.findByIsActive(true);
```

---

## Implementation Steps (For Backend Developer)

### Step 1: Update OffersController Constructor
**Replace this:**
```java
@RestController
public class OffersController {
 // REMOVE: private static final List<Offer> SAMPLE_OFFERS = ...
}
```

**With this:**
```java
@RestController
public class OffersController {
 @Autowired
 private OffersRepository offersRepository;

 // REMOVED: SAMPLE_OFFERS ArrayList
}
```

### Step 2: Update GET /offers Endpoint

**OLD CODE (Remove):**
```java
@GetMapping("/offers")
public OffersListResponse listOffers(...) {
 var filtered = SAMPLE_OFFERS.stream()
 .filter(o -> category == null || ... )
 .toList();
 // ...
}
```

**NEW CODE (Replace with):**
```java
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
 allOffers = allOffers.stream()
 .filter(o -> {
 try {
 Integer categoryId = Integer.parseInt(category);
 return o.getCategoryId().equals(categoryId);
 } catch (NumberFormatException e) {
 return false;
 }
 })
 .toList();
 }

 // Apply pagination
 List<OffersController.Offer> pageOffers = allOffers.stream()
 .skip(offset)
 .limit(limit)
 .map(this::convertToDTO)
 .toList();

 return new OffersListResponse(
 pageOffers,
 new Pagination(allOffers.size(), limit, offset, offset + limit < allOffers.size())
 );
}

// Helper method to convert JPA entity to DTO
private OffersController.Offer convertToDTO(com.bsa.campcard.model.Offer dbOffer) {
 return new OffersController.Offer(
 dbOffer.getId(),
 dbOffer.getUuid(),
 new Merchant(dbOffer.getMerchantId().toString(), "", "", null, ""),
 dbOffer.getTitle(),
 dbOffer.getDescription(),
 String.valueOf(dbOffer.getCategoryId()),
 dbOffer.getValidFrom().toString(),
 dbOffer.getValidUntil().toString(),
 dbOffer.getUsageType(),
 new ArrayList<>(), // locations would need separate query
 true
 );
}
```

### Step 3: Update GET /offers/{id} Endpoint

**OLD CODE (Remove):**
```java
@GetMapping("/offers/{id}")
public OfferDetailsResponse getOffer(@PathVariable Integer id) {
 var offer = SAMPLE_OFFERS.stream().filter(o -> o.id().equals(id)).findFirst().orElse(SAMPLE_OFFERS.get(0));
 return new OfferDetailsResponse(offer);
}
```

**NEW CODE (Replace with):**
```java
@GetMapping("/offers/{id}")
public OfferDetailsResponse getOffer(@PathVariable Integer id) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
 return new OfferDetailsResponse(convertToDTO(offer));
}
```

### Step 4: Update POST /offers Endpoint

**OLD CODE (Remove):**
```java
@PostMapping("/offers")
@ResponseStatus(HttpStatus.CREATED)
public OfferDetailsResponse createOffer(@RequestBody OfferCreateRequest body) {
 var nextId = SAMPLE_OFFERS.stream().mapToInt(Offer::id).max().orElse(0) + 1;
 // ... create and add to SAMPLE_OFFERS
}
```

**NEW CODE (Replace with):**
```java
@PostMapping("/offers")
@ResponseStatus(HttpStatus.CREATED)
public OfferDetailsResponse createOffer(@RequestBody OfferCreateRequest body) {
 var newOffer = new com.bsa.campcard.model.Offer();
 newOffer.setUuid("offer-uuid-" + UUID.randomUUID().toString().substring(0, 8));
 newOffer.setMerchantId(UUID.fromString(body.merchant_id()));
 newOffer.setCategoryId(parseCategoryId(body.category()));
 newOffer.setTitle(body.title());
 newOffer.setDescription(body.description());
 newOffer.setDiscountDescription(body.discount_description());
 newOffer.setDiscountValue(java.math.BigDecimal.valueOf(body.discount_value()));
 newOffer.setUsageType(body.usage_type());
 newOffer.setIsFeatured(body.is_featured());
 newOffer.setValidFrom(java.time.LocalDateTime.parse(body.valid_from()));
 newOffer.setValidUntil(java.time.LocalDateTime.parse(body.valid_until()));
 newOffer.setIsActive(true);

 var saved = offersRepository.save(newOffer);
 return new OfferDetailsResponse(convertToDTO(saved));
}

private Integer parseCategoryId(String category) {
 // Map category string to category ID
 // For now, use a simple mapping; consider moving to a service
 switch (category.toUpperCase()) {
 case "DINING": return 1;
 case "AUTO": return 2;
 case "ENTERTAINMENT": return 3;
 case "RETAIL": return 4;
 case "SERVICES": return 5;
 case "HEALTH": return 6;
 case "TRAVEL": return 7;
 default: return 3; // Default to ENTERTAINMENT
 }
}
```

### Step 5: Update PUT /offers/{id} Endpoint

**OLD CODE (Remove):**
```java
@PutMapping("/offers/{id}")
public OfferDetailsResponse updateOffer(@PathVariable Integer id, @RequestBody OfferCreateRequest body) {
 var existing = SAMPLE_OFFERS.stream().filter(o -> o.id().equals(id)).findFirst();
 // ... update SAMPLE_OFFERS
}
```

**NEW CODE (Replace with):**
```java
@PutMapping("/offers/{id}")
public OfferDetailsResponse updateOffer(@PathVariable Integer id, @RequestBody OfferCreateRequest body) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));

 if (body.title() != null) offer.setTitle(body.title());
 if (body.description() != null) offer.setDescription(body.description());
 if (body.category() != null) offer.setCategoryId(parseCategoryId(body.category()));
 if (body.discount_description() != null) offer.setDiscountDescription(body.discount_description());
 if (body.discount_value() != null) offer.setDiscountValue(java.math.BigDecimal.valueOf(body.discount_value()));
 if (body.usage_type() != null) offer.setUsageType(body.usage_type());
 if (body.is_featured() != null) offer.setIsFeatured(body.is_featured());
 if (body.valid_from() != null) offer.setValidFrom(java.time.LocalDateTime.parse(body.valid_from()));
 if (body.valid_until() != null) offer.setValidUntil(java.time.LocalDateTime.parse(body.valid_until()));

 var updated = offersRepository.save(offer);
 return new OfferDetailsResponse(convertToDTO(updated));
}
```

### Step 6: Update DELETE /offers/{id} Endpoint

**OLD CODE (Remove):**
```java
@DeleteMapping("/offers/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteOffer(@PathVariable Integer id) {
 SAMPLE_OFFERS.removeIf(o -> o.id().equals(id));
}
```

**NEW CODE (Replace with):**
```java
@DeleteMapping("/offers/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteOffer(@PathVariable Integer id) {
 offersRepository.deleteById(id);
}
```

### Step 7: Update POST /offers/{id}/activate Endpoint

**Note:** This endpoint should also save the redemption to `offer_redemptions` table

```java
@PostMapping("/offers/{id}/activate")
public ActivateOfferResponse activateOffer(@PathVariable Integer id,
 @RequestBody(required = false) ActivateOfferRequest body) {
 var offer = offersRepository.findById(id)
 .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));

 // TODO: Get merchant locations from database
 // var locations = merchantLocationsRepository.findByMerchantId(offer.getMerchantId());
 var location = new Location(0, "TBD", "TBD", null, null, null);

 var code = "CC" + id + "-" + (int)(Math.random() * 9000 + 1000);
 var redemption = new RedemptionCode(
 "rc_" + id,
 code,
 "campcard://redeem?code=" + code,
 java.time.Instant.now().plusSeconds(10 * 60).toString(),
 "Show this code to the merchant and confirm redemption.",
 convertToDTO(offer),
 location
 );

 // TODO: Save to offer_redemptions table
 // offerRedemptionsRepository.save(redemption);

 return new ActivateOfferResponse(redemption);
}
```

---

## Testing the Implementation

### Test 1: Application Startup
```bash
cd /Users/macbookpro/Documents/camp-card-mobile-app-v2/repos/camp-card-backend
mvn spring-boot:run
```

**Expected output:**
```
... Flyway migration running ...
... Executing migration: V003__create_offers_table.sql ...
... SUCCESS ...
```

### Test 2: Verify Database Has Offers
```bash
psql -U postgres -h localhost -d campcard_db -c "SELECT COUNT(*) FROM offers;"
```

**Expected:** `50`

### Test 3: Test GET /offers Endpoint
```bash
curl http://localhost:8080/offers
```

**Expected response:**
```json
{
 "data": [
 {
 "id": 1,
 "title": "20% off entire purchase",
 "merchant": {
 "id": "...",
 "business_name": "Pizza Palace"
 }
 },
 ...
 ],
 "pagination": {
 "total": 50,
 "limit": 20,
 "offset": 0,
 "has_more": true
 }
}
```

### Test 4: Test POST /offers (Create New Offer)
```bash
curl -X POST http://localhost:8080/offers \
 -H "Content-Type: application/json" \
 -d '{
 "title": "Test Offer",
 "description": "Test Description",
 "category": "DINING",
 "merchant_id": "00000000-0000-0000-0000-000000000101",
 "valid_from": "2025-12-01",
 "valid_until": "2026-01-01",
 "usage_type": "UNLIMITED",
 "discount_description": "10% off",
 "discount_value": 10.0,
 "is_featured": false
 }'
```

**Expected:** 201 Created with offer data

### Test 5: Verify Persistence
```bash
# Stop and restart server
# Then query database
psql -U postgres -h localhost -d campcard_db -c "SELECT * FROM offers WHERE title = 'Test Offer';"
```

**Expected:** Row should still exist ( Data persisted!)

---

## Summary of Changes

| Old Implementation | New Implementation |
|---|---|
| `static List<Offer> SAMPLE_OFFERS` | `@Autowired OffersRepository offersRepository` |
| In-memory CRUD | Database persistence |
| Lost on restart | Persisted permanently |
| 3 hardcoded offers | 50 seeded offers |
| No foreign keys | Proper FK constraints |
| No validation | Database constraints |
| Mock data only | Real production data |

---

## Migration Checklist

- [ ] Deploy Flyway migration V003 (SQL file created)
- [ ] Add `Offer.java` entity to codebase
- [ ] Add `OfferCategory.java` entity to codebase
- [ ] Add `OffersRepository.java` interface to codebase
- [ ] Update `OffersController.java` with database queries
- [ ] Remove `SAMPLE_OFFERS` ArrayList from controller
- [ ] Add `@Autowired OffersRepository` to controller
- [ ] Test GET /offers endpoint
- [ ] Test POST /offers endpoint
- [ ] Test PUT /offers/{id} endpoint
- [ ] Test DELETE /offers/{id} endpoint
- [ ] Verify 50 offers in database
- [ ] Test server restart preserves offers
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Run integration tests with mobile app
- [ ] Deploy to production

---

## Next Steps

1. **Implement the code changes** in OffersController as outlined above
2. **Run Flyway migration** by starting the Spring Boot application
3. **Test all endpoints** using curl or Postman
4. **Verify mobile app** can fetch and display the 50 offers
5. **Test complete offer lifecycle** (Create  Activate  Redeem)
6. **Monitor database** for proper constraint enforcement

---

## Troubleshooting

### Issue: Flyway migration not running
**Solution:** Ensure `spring.jpa.hibernate.ddl-auto=validate` in application.properties (not `create` or `create-drop`)

### Issue: Foreign key constraint error
**Solution:** Ensure merchant UUIDs in POST request match existing merchants in database

### Issue: ClassNotFoundException for Offer entity
**Solution:** Ensure Java files are in correct package: `com.bsa.campcard.model`

### Issue: Database still shows 0 offers
**Solution:**
1. Check Flyway migration table: `SELECT * FROM flyway_schema_history;`
2. Manually run migration: `psql -U postgres -d campcard_db -f V003__create_offers_table.sql`
3. Restart Spring Boot application

---

**Status:** All files created - Ready for developer implementation
**Blockers:** None - Can begin implementation immediately
**Time Estimate:** 30 minutes to implement and test
