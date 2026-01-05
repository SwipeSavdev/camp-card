# PostgreSQL Database Schema Documentation
**Camp Card Mobile App v2 - Complete Database Structure**

**Database:** campcard_db
**PostgreSQL Version:** 15
**Hostname:** localhost:5432
**User:** postgres
**Date Generated:** December 28, 2025

---

## Schema Overview

### Total Tables: 17
### Total Columns: 187
### Primary Focus Areas:
- Merchants & Locations
- Camp Cards & Users
- **Offers Management (NEW - TO BE IMPLEMENTED)**
- Redemptions & Loyalty
- Audit Trails & Notifications

---

## Table Directory

| # | Table Name | Columns | Type | Status |
|---|---|---|---|---|
| 1 | `merchants` | 15 | Core | |
| 2 | `merchant_locations` | 17 | Core | |
| 3 | `offer_redemptions` | 14 | Core | Orphaned |
| 4 | `offers` | 15 | Core | MISSING |
| 5 | `offer_categories` | 5 | Lookup | MISSING |
| 6 | `camp_cards` | 20 | Core | |
| 7 | `user_camp_cards` | 7 | Junction | |
| 8 | `users` | 20 | Core | |
| 9 | `councils` | 24 | Core | |
| 10 | `troops` | 20 | Core | |
| 11 | `scout_users` | 11 | Junction | |
| 12 | `referral_codes` | 11 | Tracking | |
| 13 | `audit_log` | 11 | Tracking | |
| 14 | `notifications` | 12 | System | |
| 15 | `feature_flags` | 13 | Config | |
| 16 | `feature_flag_audit_log` | 9 | Audit | |
| 17 | `user_settings` | 19 | Config | |
| 18 | `geofence_notifications` | 14 | Location | |
| 19 | `flyway_schema_history` | 10 | System | |

---

## Core Tables (Detailed)

### 1. merchants (15 columns)

**Purpose:** Store merchant business information
**Records:** 3 (Pizza Palace, AutoCare, Fun Zone)
**Primary Key:** `id` (UUID)

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique merchant identifier |
| `business_name` | VARCHAR(255) | NOT NULL | Official business name |
| `category` | VARCHAR(50) | NOT NULL | Business category (DINING, AUTO, etc.) |
| `description` | TEXT | NULLABLE | Business description |
| `website_url` | VARCHAR(500) | NULLABLE | Official website |
| `phone_number` | VARCHAR(20) | NULLABLE | Contact phone |
| `email` | VARCHAR(255) | NULLABLE | Business email |
| `logo_url` | VARCHAR(500) | NULLABLE | Logo image path |
| `banner_url` | VARCHAR(500) | NULLABLE | Banner image path |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| `verified` | BOOLEAN | NOT NULL, DEFAULT false | BSA verification status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp |
| `created_by` | UUID | NULLABLE, FK  users.id | User who created record |
| `updated_by` | UUID | NULLABLE, FK  users.id | User who last updated record |

**Indexes:**
- `merchants_pkey` (PRIMARY KEY on id)
- `idx_merchants_category` (category)
- `idx_merchants_is_active` (is_active)
- `idx_merchants_verified` (verified)

**Current Records:**
```
id | business_name | category | is_active | verified
00000000-0000-0000-0000-000000000101 | Pizza Palace | DINING | TRUE | TRUE
00000000-0000-0000-0000-000000000102 | AutoCare | AUTO | TRUE | TRUE
00000000-0000-0000-0000-000000000103 | Fun Zone | ENTERTAINMENT | TRUE | TRUE
```

---

### 2. merchant_locations (17 columns)

**Purpose:** Store physical locations for merchants
**FK Relationship:** merchant_id  merchants.id (CASCADE on DELETE)

| Column | Type | Key Relationship |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `merchant_id` | UUID | FOREIGN KEY  merchants.id |
| `name` | VARCHAR(255) | Location name (e.g., "Downtown") |
| `address` | VARCHAR(500) | Full address |
| `city` | VARCHAR(100) | City |
| `state` | VARCHAR(2) | State code (e.g., "FL") |
| `postal_code` | VARCHAR(10) | ZIP code |
| `latitude` | NUMERIC(10,8) | GPS latitude |
| `longitude` | NUMERIC(11,8) | GPS longitude |
| `phone_number` | VARCHAR(20) | Location-specific phone |
| `hours_of_operation` | JSONB | Operating hours (JSON) |
| `is_open` | BOOLEAN | Currently open status |
| `has_parking` | BOOLEAN | Parking availability |
| `wheelchair_accessible` | BOOLEAN | ADA compliance |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Update timestamp |
| `notes` | TEXT | Additional notes |

---

### 3. offer_redemptions (14 columns) - **ORPHANED**

**Purpose:** Track offer redemptions by users
**Status:** **BROKEN** - References non-existent offers table!

| Column | Type | Issue |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | FOREIGN KEY  users.id |
| `offer_id` | INTEGER | **NO FOREIGN KEY CONSTRAINT** |
| `camp_card_id` | UUID | FOREIGN KEY  camp_cards.id |
| `merchant_location_id` | UUID | FOREIGN KEY  merchant_locations.id |
| `redemption_code` | VARCHAR(50) | Unique redemption code |
| `qr_code_data` | TEXT | QR code data |
| `redemption_amount` | NUMERIC(10,2) | Amount redeemed |
| `status` | VARCHAR(50) | Status (PENDING, REDEEMED, EXPIRED) |
| `redeemed_at` | TIMESTAMP | Redemption timestamp |
| `expires_at` | TIMESTAMP | Expiration timestamp |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Update timestamp |

**Problem:**
```sql
-- Current (BROKEN)
offer_id INTEGER NOT NULL
-- References: NOTHING (table doesn't exist)

-- Should be:
offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE
```

---

### 4. camp_cards (20 columns)

**Purpose:** Scout camp card accounts and balances
**Records:** Multiple (one per user typically)

| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | FK  users.id |
| `card_number` | VARCHAR(255) | Card number |
| `card_member_number` | VARCHAR(255) | Member ID |
| `card_holder_name` | VARCHAR(255) | Cardholder name |
| `status` | VARCHAR(50) | Card status |
| `is_primary` | BOOLEAN | Primary card flag |
| `card_type` | VARCHAR(50) | Type (STANDARD, PREMIUM, etc.) |
| `subscription_type` | VARCHAR(50) | Subscription plan |
| `subscription_price` | NUMERIC(10,2) | Annual price |
| `issued_at` | TIMESTAMP | Issue date |
| `expires_at` | TIMESTAMP | Expiration date |
| `activated_at` | TIMESTAMP | Activation date |
| `current_balance` | NUMERIC(10,2) | Account balance |
| `loyalty_points` | INTEGER | Points earned |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Update timestamp |
| `created_by` | UUID | FK  users.id |
| `updated_by` | UUID | FK  users.id |

---

### 5. users (20 columns)

**Purpose:** All system users (scouts, admins, merchants)

**User Types:** Scout, Admin, Merchant
**Key Fields:**
- `id` (UUID, PRIMARY KEY)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `first_name`, `last_name` (VARCHAR)
- `date_of_birth` (DATE)
- `user_type` (VARCHAR) - SCOUT, ADMIN, MERCHANT
- `is_active` (BOOLEAN)
- `email_verified` (BOOLEAN)
- `profile_picture_url` (VARCHAR)
- `phone_number` (VARCHAR)
- `address`, `city`, `state`, `postal_code` (VARCHAR)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMP)

---

### 6. councils (24 columns)

**Purpose:** Scout council organizations

**Fields Include:**
- Council identification (id, name, code)
- Geographic region (state, region, territory)
- Contact info (phone, email, address)
- Metadata and timestamps

---

### 7. troops (20 columns)

**Purpose:** Scout troop organizations

**Key Fields:**
- Troop identification
- Council relationship
- Meeting location and schedule
- Leader information
- Activity tracking

---

### 8. scout_users (11 columns)

**Purpose:** Junction table linking scouts to users

**Relationship:** Many-to-many scout and user associations

---

## Feature-Specific Modules

### Referral System

**Table:** `referral_codes` (11 columns)
- Tracks referral codes for users
- Links referrer to new users
- Tracks referral status and rewards
- Timestamp tracking

### Audit & Compliance

**Table:** `audit_log` (11 columns)
- Records all entity changes
- Tracks: entity_type, entity_id, action, old_values, new_values
- JSONB fields for flexible value storage
- User and timestamp tracking

**Table:** `feature_flag_audit_log` (9 columns)
- Tracks feature flag configuration changes
- Version control for feature toggles

### Notifications

**Table:** `notifications` (12 columns)
- System notifications
- User notification preferences
- Read/unread status
- Timestamp tracking

### Feature Management

**Table:** `feature_flags` (13 columns)
- Feature toggle configuration
- Enable/disable features per user or globally
- Timestamp and owner tracking

**Table:** `user_settings` (19 columns)
- User preferences
- Notification settings
- Theme preferences
- Privacy settings

### Location-Based Features

**Table:** `geofence_notifications` (14 columns)
- Geofence setup and management
- Location-based alert configuration
- Merchant location associations

---

## Proposed NEW Tables (For Implementation)

### offers (15 columns) - **TO CREATE**

```sql
CREATE TABLE offers (
 id SERIAL PRIMARY KEY,
 uuid VARCHAR(36) UNIQUE NOT NULL,
 merchant_id UUID NOT NULL REFERENCES merchants(id),
 category_id INTEGER NOT NULL REFERENCES offer_categories(id),
 title VARCHAR(255) NOT NULL,
 description TEXT,
 discount_description VARCHAR(255),
 discount_value NUMERIC(10,2),
 usage_type VARCHAR(50) NOT NULL DEFAULT 'UNLIMITED',
 is_featured BOOLEAN DEFAULT FALSE,
 valid_from TIMESTAMP NOT NULL,
 valid_until TIMESTAMP NOT NULL,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 created_by UUID REFERENCES users(id),
 updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_offers_merchant_id ON offers(merchant_id);
CREATE INDEX idx_offers_category_id ON offers(category_id);
CREATE INDEX idx_offers_valid_from ON offers(valid_from);
CREATE INDEX idx_offers_valid_until ON offers(valid_until);
CREATE INDEX idx_offers_is_active ON offers(is_active);
CREATE INDEX idx_offers_uuid ON offers(uuid);
CREATE INDEX idx_offers_created_at ON offers(created_at);
```

### offer_categories (5 columns) - **TO CREATE**

```sql
CREATE TABLE offer_categories (
 id SERIAL PRIMARY KEY,
 name VARCHAR(50) UNIQUE NOT NULL,
 description TEXT,
 icon_url VARCHAR(500),
 color_code VARCHAR(7),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO offer_categories VALUES
 (1, 'DINING', 'Restaurant and food offers', ...),
 (2, 'AUTO', 'Automotive services', ...),
 (3, 'ENTERTAINMENT', 'Entertainment and activities', ...),
 (4, 'RETAIL', 'Retail shopping discounts', ...),
 (5, 'SERVICES', 'Professional services', ...),
 (6, 'HEALTH', 'Health and wellness', ...),
 (7, 'TRAVEL', 'Travel and accommodation', ...);
```

---

## Migration Tracking

**Table:** `flyway_schema_history` (10 columns)

**Completed Migrations:**
| Version | Description | Installed | Checksum |
|---|---|---|---|
| 000 | Create base schema | 2025-12-27 15:38:28 | |
| 001 | Create feature flags schema | 2025-12-27 15:38:29 | |
| 002 | Create camp cards and merchant schema | 2025-12-27 16:05:53 | |
| **003** | **Create offers table (PENDING)** | **Not yet run** | **New** |

---

## Data Relationships (ER Diagram)

```
merchants
 has many  merchant_locations
 has many  offers (to be created)
 created_by  users
 updated_by  users

offers (to be created)
 belongs_to  merchants
 belongs_to  offer_categories (to be created)
 has many  offer_redemptions
 created_by  users
 updated_by  users

offer_redemptions
 belongs_to  offers (foreign key - currently broken)
 belongs_to  users
 belongs_to  camp_cards
 belongs_to  merchant_locations
 timestamps: created_at, updated_at, redeemed_at

camp_cards
 belongs_to  users
 belongs_to_many  users (via user_camp_cards)
 has_many  offer_redemptions
 tracks: balance, loyalty_points, subscription

users
 has many  camp_cards
 has many  scout_users
 has many  offers (created_by)
 has many  offer_redemptions
 has_one  user_settings
 has_one  audit_log (changed_by)

councils
 has many  troops
 has many  scout_users

troops
 belongs_to  councils
 has many  scout_users

scout_users
 belongs_to  scouts
 belongs_to  users
```

---

## Query Performance Optimization

### Current Indexes (GOOD)
```sql
-- Merchants table
idx_merchants_category -- Filter by business type
idx_merchants_is_active -- Filter active merchants
idx_merchants_verified -- Filter verified merchants

-- Other tables have appropriate indexes
```

### Proposed NEW Indexes (For offers table)
```sql
idx_offers_merchant_id -- Join offers to merchants
idx_offers_category_id -- Filter by category
idx_offers_valid_from -- Time-range queries
idx_offers_valid_until -- Time-range queries
idx_offers_is_active -- Filter active offers
idx_offers_uuid -- UUID lookup
idx_offers_created_at -- Sort by creation date
```

**Rationale:** These indexes support the most common queries:
1. Get all offers for a merchant
2. Get offers by category
3. Get currently valid offers (between valid_from and valid_until)
4. Filter active/inactive offers
5. Find offer by UUID

---

## Connection Information

**Connect to Database:**
```bash
# Using psql CLI
psql -U postgres -h localhost -d campcard_db

# Or full path:
/opt/homebrew/opt/postgresql@15/bin/psql -U postgres -h localhost -d campcard_db
```

**View All Tables:**
```sql
\dt -- list all tables
\d [table_name] -- describe specific table
```

**View Schema for Specific Table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'merchants'
ORDER BY ordinal_position;
```

---

## Data Validation Summary

### Records by Table

| Table | Record Count | Status |
|---|---|---|
| merchants | 3 | Ready |
| merchant_locations | ? | Ready |
| users | ? | Ready |
| camp_cards | ? | Ready |
| councils | ? | Ready |
| troops | ? | Ready |
| offers | **0** | Table missing |
| offer_redemptions | ? | Orphaned FKs |

---

## Implementation Checklist

- [ ] Run Flyway V003 migration (creates offers + offer_categories)
- [ ] Verify 50 offers inserted into database
- [ ] Add foreign key constraint to offer_redemptions.offer_id
- [ ] Deploy Java entity classes (Offer.java, OfferCategory.java)
- [ ] Deploy repository (OffersRepository.java)
- [ ] Update controller to use database
- [ ] Test all CRUD operations
- [ ] Verify data persistence across server restarts
- [ ] Test mobile app integration
- [ ] Test web portal admin interface
- [ ] Load test with 50 offers
- [ ] Production deployment

---

## Next Steps

1. **Review** this schema documentation
2. **Approve** proposed V003 migration
3. **Deploy** Flyway migration (automatic on app startup)
4. **Implement** Java code changes per BACKEND_IMPLEMENTATION_GUIDE.md
5. **Test** using provided test cases
6. **Validate** 50 offers in production database
7. **Monitor** performance and constraints

---

**Schema Documentation Version:** 1.0
**Last Updated:** December 28, 2025
**Database Version:** PostgreSQL 15
**Prepared By:** Backend Engineering Team
