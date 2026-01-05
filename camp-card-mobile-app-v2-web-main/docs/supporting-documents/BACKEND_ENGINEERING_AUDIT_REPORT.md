# Backend Engineering Audit Report
**Camp Card Mobile App v2 - Production Readiness Assessment**

**Date:** December 28, 2025
**Engineer:** Principal Backend Architecture, API Routing & Database Engineer
**Status:** CRITICAL ISSUES IDENTIFIED - BLOCKS PRODUCTION

---

## Executive Summary

The Camp Card backend architecture contains **fundamental structural defects** that prevent core functionality from working. While the frontend systems (mobile and web) are running, the backend data layer is **non-functional**:

- **Only 3 hardcoded offers exist** (in-memory Java ArrayList, not persisted)
- **Offers table is missing from PostgreSQL** despite having `offer_redemptions` table that references it
- **API endpoints use mock data** instead of connecting to database
- **No database persistence layer** for offers, despite full schema elsewhere
- **Flyway migrations incomplete** - schema created but offer tables never added

**Result:** Any request to create, update, or delete offers will persist for only the current server lifetime. Redemptions can be created but will fail foreign key constraint on non-existent `offers` table.

---

## Database Validation Report

### Schema Inventory

**Total Tables:** 17
**Database:** campcard_db (PostgreSQL 15)
**Connection:** Verified working

#### Complete Table Structure

| Table Name | Columns | Purpose | Status |
|---|---|---|---|
| `merchants` | 15 | Merchant business info (Pizza Palace, AutoCare, Fun Zone) | Working |
| `merchant_locations` | 17 | Physical locations for merchants | Working |
| `offer_redemptions` | 14 | **INCOMPLETE** - References offer_id but offers table missing | Broken FK |
| `camp_cards` | 20 | Scout camp card accounts | Working |
| `user_camp_cards` | 7 | Many-to-many user-to-card mapping | Working |
| `users` | 20 | User accounts (scouts, merchants, admins) | Working |
| `councils` | 24 | Scout council entities | Working |
| `troops` | 20 | Scout troop organizations | Working |
| `scout_users` | 11 | Scout-to-user relationships | Working |
| `referral_codes` | 11 | Referral tracking system | Working |
| `audit_log` | 11 | Change audit trail | Working |
| `notifications` | 12 | System notifications | Working |
| `feature_flags` | 13 | Feature toggle configuration | Working |
| `feature_flag_audit_log` | 9 | Feature flag change history | Working |
| `user_settings` | 19 | User preferences | Working |
| `geofence_notifications` | 14 | Location-based alerts | Working |
| `flyway_schema_history` | 10 | Database migration tracking | Working |

### Critical Defect: Missing Offers Table

**Evidence:**

```sql
-- Current offer_redemptions schema
CREATE TABLE offer_redemptions (
 offer_id INTEGER NOT NULL, -- <-- REFERENCES NOTHING (no offers table)
 merchant_location_id UUID,
 redemption_code VARCHAR(50) NOT NULL UNIQUE,
 ...
);

-- Attempted query for offers table
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%offer%';

-- Result: ONLY offer_redemptions returned
-- Result: NO offers table found
```

**Impact:**
- Cannot persist offer definitions to database
- Any offer created via API will be lost on server restart
- Foreign key constraint violations possible if redemption attempts to link to offer_id
- No way to query offers from database - API serves only in-memory mock data

### Current Merchant Data

```
ID (UUID) | Business Name | Category | Active | Verified
00000000-0000-0000-0000-000000000101 | Pizza Palace | DINING | TRUE | TRUE
00000000-0000-0000-0000-000000000102 | AutoCare | AUTO | TRUE | TRUE
00000000-0000-0000-0000-000000000103 | Fun Zone | ENTERTAINMENT | TRUE | TRUE
```

**Status:** Database merchant records exist and are persistent

### Flyway Migration History

| Version | Description | Installed |
|---|---|---|
| V000 | Create base schema | 2025-12-27 15:38:28 |
| V001 | Create feature flags schema | 2025-12-27 15:38:29 |
| V002 | Create camp cards and merchant schema | 2025-12-27 16:05:53 |
| **MISSING** | **Create offers and offer_categories schema** | **NEVER RUN** |

**Analysis:** The migration history shows schema creation completed but **offer tables were never migrated**. The `offer_redemptions` table was added (likely in V002) but its parent `offers` table is completely absent.

---

## API Contract Validation Report

### Offers Endpoints

**File:** `/camp-card-backend/src/main/java/com/bsa/campcard/controller/OffersController.java`

#### Endpoint 1: List Offers
```
GET /offers
```

| Aspect | Status | Notes |
|---|---|---|
| **Data Source** | In-Memory | Uses SAMPLE_OFFERS ArrayList (lines 89-128) |
| **Database Query** | Missing | No SQL query to offers table |
| **Persistence** | NO | Any created offers lost on restart |
| **Filtering** | Partial | Category filter implemented in-memory |
| **Pagination** | Working | Limit/offset pagination functional |
| **Production Ready** | NO | Mock data only |

**Current Response (line 123-140):**
```java
@GetMapping("/offers")
public OffersListResponse listOffers(...) {
 var filtered = SAMPLE_OFFERS.stream()
 .filter(o -> category == null || ... )
 .toList();
 // Returns 3 hardcoded offers only
}
```

#### Endpoint 2: Get Single Offer
```
GET /offers/{id}
```

| Aspect | Status | Notes |
|---|---|---|
| **Data Source** | In-Memory | Searches SAMPLE_OFFERS |
| **Database Query** | Missing | No SQL prepared statement |
| **Error Handling** | Fallback | Returns first offer if ID not found |
| **Production Ready** | NO | Falls back to hardcoded offer |

#### Endpoint 3: Create Offer
```
POST /offers
```

**Request Body Example:**
```json
{
 "title": "20% off",
 "description": "dine-in or takeout",
 "category": "DINING",
 "merchant_id": 1,
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "discount_description": "20% discount",
 "discount_value": 0.20,
 "is_featured": true
}
```

| Aspect | Status | Notes |
|---|---|---|
| **Data Source** | In-Memory | Appends to SAMPLE_OFFERS ArrayList (line 165-185) |
| **Persistence** | NO | Not saved to database |
| **Data Loss** | YES | Lost on server restart |
| **ID Generation** | Integer | Sequential in-memory, will reset |
| **Response** | Valid | Returns created offer object |
| **Production Ready** | NO | Changes ephemeral |

#### Endpoint 4: Update Offer
```
PUT /offers/{id}
```

| Aspect | Status | Notes |
|---|---|---|
| **Data Source** | In-Memory | Updates SAMPLE_OFFERS ArrayList (line 188-213) |
| **Persistence** | NO | Changes lost on restart |
| **Production Ready** | NO | Non-persistent update only |

#### Endpoint 5: Delete Offer
```
DELETE /offers/{id}
```

| Aspect | Status | Notes |
|---|---|---|
| **Data Source** | In-Memory | Removes from SAMPLE_OFFERS (line 216-219) |
| **Persistence** | NO | Deletion lost on restart |
| **Production Ready** | NO | Ephemeral deletion only |

#### Endpoint 6: Activate Offer (Generate Redemption Code)
```
POST /offers/{id}/activate
```

| Aspect | Status | Notes |
|---|---|---|
| **Offer Lookup** | In-Memory | Gets offer from SAMPLE_OFFERS |
| **Redemption Persistence** | Missing | No database INSERT to offer_redemptions |
| **QR Code Generation** | Partial | Generates code but doesn't persist |
| **Production Ready** | NO | Redemption not saved to database |

### Debug Endpoint
```
GET /debug
```

**Response:** `{"offers": 3}`
**Purpose:** Health check - returns count of in-memory offers

---

## Client Routing & Integration Validation

### Mobile App Integration

**File:** `camp-card-mobile/src/screens/OffersScreen.tsx`

| Integration Point | Status | Notes |
|---|---|---|
| **API Base URL** | Configured | Points to backend (verify configuration) |
| **GET /offers endpoint** | Callable | Will receive 3 hardcoded offers |
| **Offer Details View** | Functional | UI ready to display |
| **Offer Activation** | Partial | Calls /activate endpoint but redemption not persisted |
| **Data Refresh** | Working | Can refresh, but always gets same 3 offers |

### Web Portal Integration

**File:** `camp-card-web/src/pages/admin/offers.tsx`

| Integration Point | Status | Notes |
|---|---|---|
| **Merchant Selection** | Working | Shows 3 database merchants |
| **Offer Creation Form** | UI Ready | Form present, backend will save in-memory only |
| **Data Persistence** | NO | Form submissions not persisted to DB |
| **Admin Dashboard** | Partial | Can view mock offers, cannot manage them |

---

## End-to-End Data Flow Verification

### Scenario: Create 50 New Offers (User Request)

**Current Flow:**

```
1. Admin UI Form Submission
 
2. POST /offers endpoint receives data
 
3. OffersController.createOffer()
  Generates new ID from SAMPLE_OFFERS.max() + 1
  Creates Offer object
  Appends to SAMPLE_OFFERS ArrayList  NO DATABASE CALL
 
4. Returns 201 Created with offer data
 
5. UI shows "Offer Created Successfully"
 
6. [SERVER RESTARTS]
 
7. SAMPLE_OFFERS ArrayList re-initialized with only 3 hardcoded offers
 
8. All 50 created offers are LOST
```

**Result:** User sees success message but data is not persisted.

### Scenario: User Redeems Offer (Mobile App)

**Expected Flow (Not Implemented):**

```
1. Mobile app calls POST /offers/{id}/activate
 
2. OffersController.activateOffer() generates redemption code
 
3. [MISSING: INSERT INTO offer_redemptions]  SHOULD SAVE HERE
 
4. Redemption code returned to mobile app
 
5. [MISSING: When merchant scans QR code, UPDATE offer_redemptions.status = 'REDEEMED']
 
6. Offer credit applied to user's camp card balance
```

**Current Flow (Broken):**

```
1. POST /offers/{id}/activate called
 
2. Gets offer from SAMPLE_OFFERS (works for 3 offers only)
 
3. Generates RedemptionCode object with hardcoded values
 
4. Returns code WITHOUT saving to offer_redemptions table
 
5. If redemption merchant tries to insert redemption code:
 FOREIGN KEY VIOLATION - offer_id doesn't exist in offers table
```

---

## Architecture Analysis

### Current Architecture (Broken)

```

 Mobile App / Web 
 (React/RN) 

  HTTP REST
 

 Java Spring Boot Backend 
 OffersController.java 

 In-Memory SAMPLE_OFFERS [] 
 - 3 hardcoded offers 
 - Lost on server restart 
 - No database connection 

  [NO SQL QUERIES]
 

 PostgreSQL campcard_db 

  merchants table (3 records) 
  merchant_locations 
  offer_redemptions (orphaned) 
  [MISSING] offers table 
  [MISSING] offer_categories 

```

### Required Architecture (Production-Ready)

```

 Mobile App / Web 
 (React/RN) 

  HTTP REST
 

 Java Spring Boot Backend 
 OffersController  OfferRepository 

 @Repository OfferRepository 
  findById(id) 
  findByMerchantId(merchantId) 
  findByCategory(category) 
  save(offer) 
  delete(id) 
  [DATABASE QUERIES] 

  SQL

 PostgreSQL campcard_db 

 merchants (3 records) 
 merchant_locations 
 offer_categories (to be created) 
 offers (to be created) 
 offer_redemptions (ready) 

```

---

## Missing Components (Required for Production)

### 1. Database Schema: `offers` Table

**Required SQL Migration (V003):**

```sql
-- File: src/main/resources/db/migration/V003__create_offers_table.sql

CREATE TABLE offer_categories (
 id SERIAL PRIMARY KEY,
 name VARCHAR(50) UNIQUE NOT NULL,
 description TEXT,
 icon_url VARCHAR(500),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offers (
 id SERIAL PRIMARY KEY,
 uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
 merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
 category_id INTEGER NOT NULL REFERENCES offer_categories(id),
 title VARCHAR(255) NOT NULL,
 description TEXT,
 discount_description VARCHAR(255),
 discount_value NUMERIC(10, 2),
 usage_type VARCHAR(50) NOT NULL DEFAULT 'UNLIMITED',
 -- UNLIMITED or LIMITED
 is_featured BOOLEAN DEFAULT FALSE,
 valid_from TIMESTAMP NOT NULL,
 valid_until TIMESTAMP NOT NULL,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 created_by UUID REFERENCES users(id),
 updated_by UUID REFERENCES users(id),

 INDEX idx_offers_merchant_id (merchant_id),
 INDEX idx_offers_category_id (category_id),
 INDEX idx_offers_valid_from (valid_from),
 INDEX idx_offers_valid_until (valid_until),
 INDEX idx_offers_is_active (is_active)
);

-- Add foreign key to offer_redemptions
ALTER TABLE offer_redemptions
ADD CONSTRAINT fk_offer_redemptions_offer
FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;
```

### 2. Java Repository Interface

**Required File:** `OffersRepository.java`

```java
package com.bsa.campcard.repository;

import com.bsa.campcard.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OffersRepository extends JpaRepository<Offer, Integer> {
 List<Offer> findByMerchantId(UUID merchantId);
 List<Offer> findByCategory(String category);
 List<Offer> findByIsActive(Boolean isActive);
 List<Offer> findByMerchantIdAndIsActive(UUID merchantId, Boolean isActive);
}
```

### 3. Java Entity Class

**Required File:** `Offer.java`

```java
package com.bsa.campcard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "offers")
public class Offer {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Integer id;

 @Column(unique = true, nullable = false)
 private String uuid;

 @Column(name = "merchant_id", nullable = false)
 private UUID merchantId;

 @Column(nullable = false)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "category_id", nullable = false)
 private Integer categoryId;

 @Column(name = "discount_description")
 private String discountDescription;

 @Column(name = "discount_value")
 private java.math.BigDecimal discountValue;

 @Column(name = "usage_type", nullable = false)
 private String usageType; // UNLIMITED or LIMITED

 @Column(name = "is_featured")
 private Boolean isFeatured = false;

 @Column(name = "valid_from", nullable = false)
 private LocalDateTime validFrom;

 @Column(name = "valid_until", nullable = false)
 private LocalDateTime validUntil;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Column(name = "created_at", nullable = false)
 private LocalDateTime createdAt = LocalDateTime.now();

 @Column(name = "updated_at")
 private LocalDateTime updatedAt = LocalDateTime.now();

 @Column(name = "created_by")
 private UUID createdBy;

 @Column(name = "updated_by")
 private UUID updatedBy;

 // Getters, setters, constructors...
}
```

### 4. Updated OffersController (Database-Backed)

**Key Changes:**

```java
@RestController
public class OffersController {
 @Autowired
 private OffersRepository offersRepository;

 @GetMapping("/offers")
 public OffersListResponse listOffers(...) {
 // OLD: return SAMPLE_OFFERS.stream()...
 // NEW:
 var offers = offersRepository.findByIsActive(true);
 // Filter by category, apply pagination
 // Return from database
 }

 @PostMapping("/offers")
 @ResponseStatus(HttpStatus.CREATED)
 public OfferDetailsResponse createOffer(@RequestBody OfferCreateRequest body) {
 // OLD: SAMPLE_OFFERS.add(newOffer)
 // NEW:
 var offer = new Offer();
 offer.setTitle(body.title());
 offer.setMerchantId(UUID.fromString(body.merchant_id));
 // ... set other fields
 var saved = offersRepository.save(offer); // Persists to database
 return new OfferDetailsResponse(saved);
 }
}
```

---

## Validation Checklist

### Database Layer
- [ ] Create `offers` table via Flyway V003 migration
- [ ] Create `offer_categories` table
- [ ] Add foreign key from `offer_redemptions.offer_id`  `offers.id`
- [ ] Verify schema with `\d offers` in psql
- [ ] Confirm Flyway runs migration on application startup
- [ ] Test: INSERT INTO offers works without errors
- [ ] Test: SELECT * FROM offers returns persisted data

### Application Layer
- [ ] Create `OffersRepository.java` interface
- [ ] Create `Offer.java` JPA entity
- [ ] Inject repository into `OffersController`
- [ ] Replace SAMPLE_OFFERS with database queries
- [ ] Implement all CRUD operations with database
- [ ] Test: POST /offers creates record in database
- [ ] Test: GET /offers returns database records
- [ ] Test: PUT /offers/{id} updates database
- [ ] Test: DELETE /offers/{id} removes from database
- [ ] Test: Server restart preserves created offers

### Integration Testing
- [ ] Mobile app fetch offers from /offers endpoint
- [ ] Web portal admin create/edit/delete offers
- [ ] Offer activation generates redeemable code
- [ ] Redemption code saved to offer_redemptions table
- [ ] End-to-end: Create  Activate  Redeem flow

### Production Readiness
- [ ] All 17 database tables documented
- [ ] All API endpoints mapped to database queries
- [ ] Logging added to controller methods
- [ ] Error handling for database failures
- [ ] Database connection pooling configured
- [ ] Transaction management implemented
- [ ] No hardcoded mock data in production code

---

## Implementation Roadmap

### Phase 1: Database Schema (30 minutes)
1. Create Flyway V003 migration with offers table
2. Create offer_categories table
3. Create indexes on frequently queried columns
4. Run migration and verify with psql

### Phase 2: Java Entity Layer (30 minutes)
1. Create `Offer.java` JPA entity
2. Create `OfferCategory.java` JPA entity
3. Create `OffersRepository.java` interface
4. Add Spring Data JPA dependency (if not already present)

### Phase 3: Controller Implementation (45 minutes)
1. Inject OffersRepository into controller
2. Replace SAMPLE_OFFERS with database queries
3. Implement all 6 endpoints with database
4. Add error handling and validation

### Phase 4: Testing (30 minutes)
1. Test each endpoint with Postman/API client
2. Verify data persists across server restarts
3. Test filtering and pagination with database
4. Test foreign key constraints

### Phase 5: Client Integration (15 minutes)
1. Verify mobile app displays database offers
2. Verify web portal admin panel works
3. Test complete offer lifecycle

**Total Estimated Time:** 2.5 hours

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Data loss on server restart |  CRITICAL | Add database persistence  REQUIRED |
| Orphaned offer_redemptions records |  CRITICAL | Create offers table and FK |
| Foreign key constraint failures |  CRITICAL | Complete schema migration |
| No offer audit trail |  HIGH | Add created_by, updated_by fields |
| Performance with 1000+ offers |  MEDIUM | Add database indexes (already in migration) |
| API version mismatch |  MEDIUM | Document API contract thoroughly |

---

## Recommendations

1. **IMMEDIATE (Critical):** Implement Flyway V003 migration to create offers table
2. **URGENT (Day 1):** Convert OffersController to database-backed implementation
3. **HIGH PRIORITY (Day 1):** Seed database with 50 sample offers across 3 merchants
4. **TESTING (Day 1):** Run complete end-to-end tests for offer lifecycle
5. **DOCUMENTATION:** Update API specification with database schema details
6. **MONITORING:** Add database query logging and performance metrics

---

## Conclusion

The Camp Card backend is **architecturally incomplete**. While the frontend systems are functional and the majority of the database schema exists, the offer management subsystem lacks the database persistence layer, making it unsuitable for production use.

The identified defects are **remediable** with the implementation of the provided schema and code templates (estimated 2.5 hours of development and testing). Once completed, the system will be production-ready.

**Current Status:**  **BLOCKS PRODUCTION** - Cannot fulfill user request to "create 50 offers and persist to database"

**Next Status (Post-Implementation):**  **PRODUCTION READY**

---

**Report Prepared By:** Backend Engineering Team
**Date:** December 28, 2025
**Approval Required For:** Production deployment
