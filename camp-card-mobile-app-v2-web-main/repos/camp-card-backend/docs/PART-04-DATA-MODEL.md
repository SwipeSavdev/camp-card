# BSA Camp Card Digitalization Program
## Build Specification  Part 4: Data Model & Attribution Logic

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. DATA MODEL OVERVIEW

### 1.1 Design Principles

1. **Tenant Isolation:** Every multi-tenant table includes `council_id` with enforced Row-Level Security (RLS)
2. **Soft Deletes:** Use `deleted_at` timestamp instead of hard deletes for audit trail
3. **Audit Columns:** All tables include `created_at`, `updated_at`, `created_by`, `updated_by`
4. **UUIDs:** Primary keys use UUIDs for security (no sequential ID enumeration)
5. **Immutability:** Historical records (payments, redemptions, referrals) are append-only
6. **Denormalization:** Selective denormalization for dashboard performance (pre-aggregated tables)

### 1.2 Schema Organization

**Schemas:**
- `public`  Core application tables
- `audit`  Audit log tables (separate for compliance, retention policies)
- `analytics`  Pre-aggregated tables for dashboards (materialized views)

---

## 2. CORE ENTITIES

### 2.1 Tenant & Organization Hierarchy

#### Table: `councils`
**Purpose:** Top-level tenant boundary (Local Council)

```sql
CREATE TABLE councils (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 name VARCHAR(255) NOT NULL, -- "Central Florida Council"
 slug VARCHAR(100) NOT NULL UNIQUE, -- "central-florida" (subdomain)
 region VARCHAR(100), -- "Southeast", "West Coast"

 -- Contact Info
 primary_contact VARCHAR(255),
 email VARCHAR(255),
 phone VARCHAR(20),
 website_url VARCHAR(500),

 -- Branding (optional white-label)
 logo_url VARCHAR(500), -- S3/CloudFront URL
 primary_color VARCHAR(7), -- Hex color override (e.g., "#D9012C")
 secondary_color VARCHAR(7),

 -- Configuration
 config JSONB, -- Flexible config: { "geofence_default_radius": 250, ... }

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, INACTIVE

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_councils_slug ON councils(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_councils_status ON councils(status) WHERE deleted_at IS NULL;
```

---

#### Table: `troops`
**Purpose:** Scout troop/pack/unit (sub-entity within Council)

```sql
CREATE TABLE troops (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Identity
 troop_number VARCHAR(50) NOT NULL, -- "Troop 101", "Pack 42"
 troop_type VARCHAR(20) NOT NULL, -- TROOP, PACK, CREW, SHIP
 name VARCHAR(255), -- Optional friendly name

 -- Contact
 meeting_location VARCHAR(500),
 meeting_time VARCHAR(255), -- "Tuesdays 7pm"

 -- Fundraising
 fundraising_goal DECIMAL(10,2), -- Optional annual goal

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP,

 UNIQUE(council_id, troop_number)
);

CREATE INDEX idx_troops_council ON troops(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_troops_status ON troops(council_id, status) WHERE deleted_at IS NULL;

-- Row-Level Security
ALTER TABLE troops ENABLE ROW LEVEL SECURITY;
CREATE POLICY troops_isolation_policy ON troops
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.2 Users & Roles

#### Table: `users`
**Purpose:** All human users (admins, troop leaders, customers, parents)

```sql
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 council_id BIGINT REFERENCES councils(id), -- NULL for SYSTEM_ADMIN, CUSTOMER

 -- Identity
 email VARCHAR(255) NOT NULL UNIQUE,
 email_verified BOOLEAN NOT NULL DEFAULT FALSE,
 phone VARCHAR(20),
 phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

 -- Auth
 password_hash VARCHAR(255), -- bcrypt hash (NULL if social login only)
 password_reset_token VARCHAR(255),
 password_reset_expires TIMESTAMP,

 -- Profile
 first_name VARCHAR(100) NOT NULL,
 last_name VARCHAR(100) NOT NULL,
 date_of_birth DATE, -- For age verification (18+ for customers)
 zip_code VARCHAR(10), -- For offer proximity

 -- Role
 role VARCHAR(50) NOT NULL, -- SYSTEM_ADMIN, COUNCIL_ADMIN, TROOP_LEADER, CUSTOMER

 -- Security
 mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
 mfa_secret VARCHAR(255), -- TOTP secret (encrypted)

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, INACTIVE
 last_login_at TIMESTAMP,

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_council ON users(council_id) WHERE deleted_at IS NULL AND council_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- RLS: Users can only see users in their council (except SYSTEM_ADMIN)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_isolation_policy ON users
 USING (
 council_id = current_setting('app.current_council_id')::BIGINT
 OR current_setting('app.current_role', TRUE) = 'SYSTEM_ADMIN'
 OR id = current_setting('app.current_user_id')::UUID -- Users can see themselves
 );
```

---

#### Table: `troop_leaders`
**Purpose:** Links users with TROOP_LEADER role to their troop(s)

```sql
CREATE TABLE troop_leaders (
 id BIGSERIAL PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES users(id),
 troop_id BIGINT NOT NULL REFERENCES troops(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Role within troop
 role VARCHAR(50) NOT NULL DEFAULT 'LEADER', -- LEADER, ASSISTANT, TREASURER

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 deleted_at TIMESTAMP,

 UNIQUE(user_id, troop_id)
);

CREATE INDEX idx_troop_leaders_user ON troop_leaders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_troop_leaders_troop ON troop_leaders(troop_id) WHERE deleted_at IS NULL;

ALTER TABLE troop_leaders ENABLE ROW LEVEL SECURITY;
CREATE POLICY troop_leaders_isolation_policy ON troop_leaders
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `scouts`
**Purpose:** Youth members (sellers)  MINIMAL PII

```sql
CREATE TABLE scouts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 troop_id BIGINT NOT NULL REFERENCES troops(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Identity (MINIMAL)
 first_name VARCHAR(100) NOT NULL, -- For dashboard personalization
 last_initial VARCHAR(1), -- Optional, for disambiguation

 -- Parent/Guardian (for consent)
 parent_email VARCHAR(255) NOT NULL, -- Stored separately, not used for marketing
 parent_phone VARCHAR(20),

 -- Metadata
 grade_level INTEGER, -- Optional
 join_date DATE,

 -- Referral Tracking
 referral_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., "SCOUT-A3F9X2"
 referral_qr_url VARCHAR(500), -- S3 URL to QR code image

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE (left troop)

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_scouts_troop ON scouts(troop_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scouts_council ON scouts(council_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_scouts_referral_code ON scouts(referral_code) WHERE deleted_at IS NULL;

ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY scouts_isolation_policy ON scouts
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.3 Merchants & Offers

#### Table: `merchants`
**Purpose:** Businesses providing offers

```sql
CREATE TABLE merchants (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Identity
 business_name VARCHAR(255) NOT NULL,
 category VARCHAR(50) NOT NULL, -- DINING, RETAIL, AUTO, ENTERTAINMENT, SERVICES, OTHER
 logo_url VARCHAR(500), -- S3/CloudFront URL
 website_url VARCHAR(500),

 -- Contact
 contact_name VARCHAR(255),
 contact_email VARCHAR(255),
 contact_phone VARCHAR(20),

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, INACTIVE

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_merchants_council ON merchants(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_merchants_category ON merchants(council_id, category) WHERE deleted_at IS NULL AND status = 'ACTIVE';
CREATE INDEX idx_merchants_status ON merchants(council_id, status) WHERE deleted_at IS NULL;

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchants_isolation_policy ON merchants
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `merchant_locations`
**Purpose:** Physical locations for each merchant

```sql
CREATE TABLE merchant_locations (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 merchant_id BIGINT NOT NULL REFERENCES merchants(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Address
 name VARCHAR(255), -- "Main Street Location"
 street_address VARCHAR(255) NOT NULL,
 city VARCHAR(100) NOT NULL,
 state VARCHAR(2) NOT NULL, -- US state code
 zip_code VARCHAR(10) NOT NULL,

 -- Geo
 latitude DECIMAL(10, 7), -- e.g., 28.5383355
 longitude DECIMAL(10, 7), -- e.g., -81.3792365
 geofence_radius_meters INTEGER DEFAULT 250, -- For proximity notifications

 -- Hours (optional, JSON)
 hours_of_operation JSONB, -- { "monday": "9am-5pm", ... }

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 deleted_at TIMESTAMP
);

CREATE INDEX idx_merchant_locations_merchant ON merchant_locations(merchant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_merchant_locations_council ON merchant_locations(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_merchant_locations_geo ON merchant_locations USING GIST(ll_to_earth(latitude, longitude)) WHERE deleted_at IS NULL AND status = 'ACTIVE';

ALTER TABLE merchant_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY merchant_locations_isolation_policy ON merchant_locations
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `offers`
**Purpose:** Discounts/promotions from merchants

```sql
CREATE TABLE offers (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 merchant_id BIGINT NOT NULL REFERENCES merchants(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Offer Details
 title VARCHAR(255) NOT NULL, -- "20% off entire purchase"
 description TEXT NOT NULL, -- Full terms and conditions
 category VARCHAR(50) NOT NULL, -- Inherited from merchant or custom

 -- Validity
 valid_from DATE NOT NULL,
 valid_until DATE NOT NULL,

 -- Usage
 usage_type VARCHAR(20) NOT NULL DEFAULT 'UNLIMITED', -- ONE_TIME_PER_CUSTOMER, UNLIMITED, DAILY
 max_redemptions INTEGER, -- Global cap (optional)

 -- Redemption Method
 redemption_method VARCHAR(20) NOT NULL DEFAULT 'SHOW_CODE', -- SHOW_CODE, SCAN_CODE

 -- Participating Locations (NULL = all locations)
 location_ids BIGINT[], -- Array of merchant_location IDs, NULL means all

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, EXPIRED

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_offers_merchant ON offers(merchant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_offers_council ON offers(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_offers_status ON offers(council_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_offers_valid_dates ON offers(council_id, valid_from, valid_until) WHERE deleted_at IS NULL AND status = 'ACTIVE';

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY offers_isolation_policy ON offers
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `campaigns`
**Purpose:** Time-bound fundraising initiatives grouping offers

```sql
CREATE TABLE campaigns (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Identity
 name VARCHAR(255) NOT NULL, -- "Fall Fundraiser 2025"
 description TEXT,

 -- Dates
 start_date DATE NOT NULL,
 end_date DATE NOT NULL,

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_campaigns_council ON campaigns(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON campaigns(council_id, start_date, end_date) WHERE deleted_at IS NULL;

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_isolation_policy ON campaigns
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `campaign_offers`
**Purpose:** Many-to-many linking campaigns and offers

```sql
CREATE TABLE campaign_offers (
 id BIGSERIAL PRIMARY KEY,
 campaign_id BIGINT NOT NULL REFERENCES campaigns(id),
 offer_id BIGINT NOT NULL REFERENCES offers(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 created_at TIMESTAMP NOT NULL DEFAULT NOW(),

 UNIQUE(campaign_id, offer_id)
);

CREATE INDEX idx_campaign_offers_campaign ON campaign_offers(campaign_id);
CREATE INDEX idx_campaign_offers_offer ON campaign_offers(offer_id);

ALTER TABLE campaign_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaign_offers_isolation_policy ON campaign_offers
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.4 Subscriptions & Payments

#### Table: `subscription_plans`
**Purpose:** Available plan types (configured per council)

```sql
CREATE TABLE subscription_plans (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Plan Details
 name VARCHAR(100) NOT NULL, -- "Annual", "Monthly", "Family"
 description TEXT,

 -- Pricing
 price_cents INTEGER NOT NULL, -- 2999 for $29.99
 currency VARCHAR(3) NOT NULL DEFAULT 'USD',
 billing_interval VARCHAR(20) NOT NULL, -- MONTHLY, YEARLY
 trial_days INTEGER DEFAULT 0,

 -- Features
 max_members INTEGER DEFAULT 1, -- For family plans

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID,
 updated_by UUID,
 deleted_at TIMESTAMP
);

CREATE INDEX idx_subscription_plans_council ON subscription_plans(council_id) WHERE deleted_at IS NULL;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_plans_isolation_policy ON subscription_plans
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `subscriptions`
**Purpose:** Active/inactive customer subscriptions

```sql
CREATE TABLE subscriptions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id UUID NOT NULL REFERENCES users(id),
 plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAST_DUE, CANCELED, EXPIRED

 -- Billing
 current_period_start DATE NOT NULL,
 current_period_end DATE NOT NULL,
 cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
 canceled_at TIMESTAMP,

 -- Payment Gateway
 stripe_subscription_id VARCHAR(255), -- Stripe subscription ID (if in-app purchase)
 payment_method_id VARCHAR(255), -- Stripe payment method ID

 -- POS Purchase (if offline)
 is_pos_purchase BOOLEAN NOT NULL DEFAULT FALSE,
 pos_transaction_id VARCHAR(255), -- External POS system transaction ID

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 deleted_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_council ON subscriptions(council_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(council_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end) WHERE status = 'ACTIVE';

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_isolation_policy ON subscriptions
 USING (
 council_id = current_setting('app.current_council_id')::BIGINT
 OR customer_id = current_setting('app.current_user_id')::UUID -- Customers see their own
 );
```

---

#### Table: `payments`
**Purpose:** Payment transaction history (append-only)

```sql
CREATE TABLE payments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 subscription_id UUID NOT NULL REFERENCES subscriptions(id),
 customer_id UUID NOT NULL REFERENCES users(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Payment Details
 amount_cents INTEGER NOT NULL,
 currency VARCHAR(3) NOT NULL DEFAULT 'USD',

 -- Status
 status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, REFUNDED, PENDING

 -- Gateway
 payment_gateway VARCHAR(20) NOT NULL, -- STRIPE, POS_OFFLINE, CASH, CHECK
 gateway_transaction_id VARCHAR(255), -- Stripe charge ID or external reference

 -- Failure Details
 failure_code VARCHAR(100),
 failure_message TEXT,

 -- Refund
 refunded_at TIMESTAMP,
 refund_amount_cents INTEGER,

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_council ON payments(council_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_isolation_policy ON payments
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `entitlements`
**Purpose:** POS claim tokens (one-time activation codes)

```sql
CREATE TABLE entitlements (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 council_id BIGINT NOT NULL REFERENCES councils(id),
 troop_id BIGINT NOT NULL REFERENCES troops(id),
 scout_id UUID NOT NULL REFERENCES scouts(id),
 plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),

 -- Claim Token
 claim_token VARCHAR(50) NOT NULL UNIQUE, -- "CLM-A3F9X2B8"
 claim_url VARCHAR(500) NOT NULL, -- "https://campcard.app/claim/CLM-A3F9X2B8"

 -- Claim Status
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING_CLAIM', -- PENDING_CLAIM, CLAIMED, EXPIRED
 claimed_by UUID REFERENCES users(id),
 claimed_at TIMESTAMP,

 -- Expiry
 expires_at TIMESTAMP NOT NULL, -- 30 days from creation

 -- Delivery (optional)
 customer_name VARCHAR(255), -- For personalization
 delivery_method VARCHAR(20), -- SMS, EMAIL, PRINT, MANUAL
 delivery_target VARCHAR(255), -- Phone or email address

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 created_by UUID NOT NULL, -- Troop leader who generated
 updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entitlements_claim_token ON entitlements(claim_token) WHERE status = 'PENDING_CLAIM';
CREATE INDEX idx_entitlements_scout ON entitlements(scout_id);
CREATE INDEX idx_entitlements_status ON entitlements(council_id, status);
CREATE INDEX idx_entitlements_expires ON entitlements(expires_at) WHERE status = 'PENDING_CLAIM';

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY entitlements_isolation_policy ON entitlements
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.5 Referrals & Attribution

#### Table: `referral_links`
**Purpose:** Unique referral URLs for Scouts and Customers

```sql
CREATE TABLE referral_links (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Owner
 owner_type VARCHAR(20) NOT NULL, -- SCOUT, CUSTOMER
 owner_id UUID NOT NULL, -- Scout ID or Customer ID (users.id)

 -- Root Scout (for chain attribution)
 root_scout_id UUID NOT NULL REFERENCES scouts(id),

 -- Link Details
 referral_code VARCHAR(50) NOT NULL UNIQUE, -- "SCOUT-A3F9X2" or "CUST-X7Y9"
 referral_url VARCHAR(500) NOT NULL,
 qr_code_url VARCHAR(500), -- S3 URL to QR image

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_referral_links_code ON referral_links(referral_code) WHERE status = 'ACTIVE';
CREATE INDEX idx_referral_links_owner ON referral_links(owner_type, owner_id);
CREATE INDEX idx_referral_links_root_scout ON referral_links(root_scout_id);

ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_links_isolation_policy ON referral_links
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `referral_events`
**Purpose:** Click/scan tracking (append-only)

```sql
CREATE TABLE referral_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 referral_link_id UUID NOT NULL REFERENCES referral_links(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Event Type
 event_type VARCHAR(20) NOT NULL, -- CLICK, QR_SCAN

 -- Source
 ip_address INET,
 user_agent TEXT,
 referer_url VARCHAR(500),

 -- Geo (if available)
 geo_city VARCHAR(100),
 geo_region VARCHAR(100),
 geo_country VARCHAR(2),

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_events_link ON referral_events(referral_link_id);
CREATE INDEX idx_referral_events_created ON referral_events(created_at DESC);

ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_events_isolation_policy ON referral_events
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `referral_attributions`
**Purpose:** Links subscriptions to Scouts (direct or indirect)

```sql
CREATE TABLE referral_attributions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 subscription_id UUID NOT NULL REFERENCES subscriptions(id),
 customer_id UUID NOT NULL REFERENCES users(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Attribution Chain
 root_scout_id UUID NOT NULL REFERENCES scouts(id), -- Original Scout (always gets credit)
 direct_referrer_id UUID, -- User ID of immediate referrer (Scout or Customer)
 direct_referrer_type VARCHAR(20), -- SCOUT, CUSTOMER

 -- Depth (for analytics)
 attribution_depth INTEGER NOT NULL DEFAULT 0, -- 0 = direct, 1 = 1st degree indirect, etc.

 -- Source
 referral_link_id UUID REFERENCES referral_links(id),
 entitlement_id UUID REFERENCES entitlements(id), -- If POS purchase

 -- Metadata
 attribution_method VARCHAR(20) NOT NULL, -- LINK_CLICK, QR_SCAN, POS_CLAIM, MANUAL

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),

 UNIQUE(subscription_id) -- One attribution per subscription
);

CREATE INDEX idx_referral_attributions_root_scout ON referral_attributions(root_scout_id);
CREATE INDEX idx_referral_attributions_subscription ON referral_attributions(subscription_id);
CREATE INDEX idx_referral_attributions_customer ON referral_attributions(customer_id);
CREATE INDEX idx_referral_attributions_depth ON referral_attributions(attribution_depth);

ALTER TABLE referral_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY referral_attributions_isolation_policy ON referral_attributions
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.6 Redemptions

#### Table: `redemption_codes`
**Purpose:** Temporary codes generated for offer redemption

```sql
CREATE TABLE redemption_codes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id UUID NOT NULL REFERENCES users(id),
 offer_id BIGINT NOT NULL REFERENCES offers(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Code
 code VARCHAR(20) NOT NULL UNIQUE, -- "1234-5678" (8 digits)
 qr_code_data VARCHAR(500), -- QR payload (URL or code)

 -- Validity
 expires_at TIMESTAMP NOT NULL, -- NOW + 10 minutes (anti-fraud)

 -- Status
 status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REDEEMED, EXPIRED

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_redemption_codes_code ON redemption_codes(code) WHERE status = 'ACTIVE';
CREATE INDEX idx_redemption_codes_customer ON redemption_codes(customer_id);
CREATE INDEX idx_redemption_codes_offer ON redemption_codes(offer_id);
CREATE INDEX idx_redemption_codes_expires ON redemption_codes(expires_at) WHERE status = 'ACTIVE';

ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY redemption_codes_isolation_policy ON redemption_codes
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

#### Table: `redemptions`
**Purpose:** Historical record of offer usage (append-only)

```sql
CREATE TABLE redemptions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id UUID NOT NULL REFERENCES users(id),
 subscription_id UUID NOT NULL REFERENCES subscriptions(id),
 offer_id BIGINT NOT NULL REFERENCES offers(id),
 merchant_id BIGINT NOT NULL REFERENCES merchants(id),
 location_id BIGINT REFERENCES merchant_locations(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Redemption Details
 redemption_code_id UUID REFERENCES redemption_codes(id),
 redemption_method VARCHAR(20) NOT NULL, -- SHOW_CODE, SCAN_CODE, MANUAL

 -- Value (optional, estimated savings)
 estimated_value_cents INTEGER,

 -- Merchant Confirmation (if validated)
 confirmed_by_merchant BOOLEAN NOT NULL DEFAULT FALSE,
 merchant_validation_timestamp TIMESTAMP,

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_customer ON redemptions(customer_id);
CREATE INDEX idx_redemptions_subscription ON redemptions(subscription_id);
CREATE INDEX idx_redemptions_offer ON redemptions(offer_id);
CREATE INDEX idx_redemptions_merchant ON redemptions(merchant_id);
CREATE INDEX idx_redemptions_location ON redemptions(location_id);
CREATE INDEX idx_redemptions_created ON redemptions(created_at DESC);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY redemptions_isolation_policy ON redemptions
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.7 Notifications & Geofencing

#### Table: `notification_preferences`
**Purpose:** Per-user notification settings

```sql
CREATE TABLE notification_preferences (
 user_id UUID PRIMARY KEY REFERENCES users(id),

 -- Channels
 email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
 sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
 push_enabled BOOLEAN NOT NULL DEFAULT TRUE,

 -- Types
 offer_notifications BOOLEAN NOT NULL DEFAULT FALSE, -- Geo-based offers
 fundraising_updates BOOLEAN NOT NULL DEFAULT TRUE, -- Scout performance updates
 subscription_reminders BOOLEAN NOT NULL DEFAULT TRUE, -- Renewal reminders

 -- Geo
 location_consent BOOLEAN NOT NULL DEFAULT FALSE, -- Explicit geo-tracking consent

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

#### Table: `notification_events`
**Purpose:** Log of notifications sent (append-only)

```sql
CREATE TABLE notification_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES users(id),
 council_id BIGINT REFERENCES councils(id),

 -- Notification Details
 notification_type VARCHAR(50) NOT NULL, -- GEOFENCE_OFFER, SUBSCRIPTION_RENEWAL, PAYMENT_FAILED
 channel VARCHAR(20) NOT NULL, -- EMAIL, SMS, PUSH

 -- Content
 subject VARCHAR(255),
 message TEXT,

 -- Metadata
 metadata JSONB, -- { "offer_id": 123, "merchant_id": 456 }

 -- Delivery Status
 status VARCHAR(20) NOT NULL, -- SENT, DELIVERED, FAILED, OPENED, CLICKED

 -- Geofence Context (if applicable)
 geofence_event_id UUID,

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_events_user ON notification_events(user_id);
CREATE INDEX idx_notification_events_type ON notification_events(notification_type);
CREATE INDEX idx_notification_events_created ON notification_events(created_at DESC);

ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_events_isolation_policy ON notification_events
 USING (
 council_id = current_setting('app.current_council_id')::BIGINT
 OR user_id = current_setting('app.current_user_id')::UUID
 );
```

---

#### Table: `geofence_events`
**Purpose:** Track geofence entry/exit (append-only)

```sql
CREATE TABLE geofence_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES users(id),
 location_id BIGINT NOT NULL REFERENCES merchant_locations(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),

 -- Event
 event_type VARCHAR(20) NOT NULL, -- ENTER, EXIT

 -- Geo
 user_latitude DECIMAL(10, 7),
 user_longitude DECIMAL(10, 7),
 distance_meters INTEGER, -- Distance from location center

 -- Notification Triggered
 notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
 notification_id UUID REFERENCES notification_events(id),

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_geofence_events_user ON geofence_events(user_id);
CREATE INDEX idx_geofence_events_location ON geofence_events(location_id);
CREATE INDEX idx_geofence_events_created ON geofence_events(created_at DESC);

ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY geofence_events_isolation_policy ON geofence_events
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

---

### 2.8 Audit Logs

#### Schema: `audit`

#### Table: `audit.audit_log`
**Purpose:** Comprehensive audit trail for compliance (90-day retention)

```sql
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.audit_log (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 -- Actor
 user_id UUID REFERENCES users(id),
 user_email VARCHAR(255),
 user_role VARCHAR(50),
 council_id BIGINT,

 -- Action
 action VARCHAR(100) NOT NULL, -- CREATE_MERCHANT, UPDATE_OFFER, DELETE_SCOUT, VIEW_PII
 resource_type VARCHAR(50) NOT NULL, -- MERCHANT, OFFER, SCOUT, USER, SUBSCRIPTION
 resource_id VARCHAR(255), -- UUID or ID of resource

 -- Context
 ip_address INET,
 user_agent TEXT,
 request_id UUID, -- Correlation ID

 -- Changes
 changes JSONB, -- { "before": {...}, "after": {...} }

 -- Metadata
 metadata JSONB, -- Additional context

 -- Audit (immutable)
 created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit.audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON audit.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_council ON audit.audit_log(council_id);

-- Audit logs are cross-tenant for SYSTEM_ADMIN, scoped for others
ALTER TABLE audit.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_policy ON audit.audit_log
 USING (
 current_setting('app.current_role', TRUE) = 'SYSTEM_ADMIN'
 OR council_id = current_setting('app.current_council_id')::BIGINT
 );
```

---

### 2.9 Analytics & Pre-Aggregated Tables

#### Schema: `analytics`

#### Table: `analytics.scout_performance_daily`
**Purpose:** Daily rollup of Scout metrics (for fast dashboard queries)

```sql
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.scout_performance_daily (
 id BIGSERIAL PRIMARY KEY,
 scout_id UUID NOT NULL REFERENCES scouts(id),
 troop_id BIGINT NOT NULL REFERENCES troops(id),
 council_id BIGINT NOT NULL REFERENCES councils(id),
 date DATE NOT NULL,

 -- Metrics
 link_clicks INTEGER NOT NULL DEFAULT 0,
 qr_scans INTEGER NOT NULL DEFAULT 0,
 subscriptions_direct INTEGER NOT NULL DEFAULT 0,
 subscriptions_indirect INTEGER NOT NULL DEFAULT 0,
 revenue_cents INTEGER NOT NULL DEFAULT 0, -- Estimated attributed revenue

 -- Audit
 created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

 UNIQUE(scout_id, date)
);

CREATE INDEX idx_scout_performance_scout ON analytics.scout_performance_daily(scout_id, date DESC);
CREATE INDEX idx_scout_performance_troop ON analytics.scout_performance_daily(troop_id, date DESC);

ALTER TABLE analytics.scout_performance_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY scout_performance_isolation_policy ON analytics.scout_performance_daily
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

**Materialization Strategy:**
- Nightly batch job (cron) aggregates previous day's data
- Real-time metrics query live tables, fall back to aggregated for historical

---

## 3. REFERRAL CHAIN ATTRIBUTION ALGORITHM

### 3.1 Attribution Logic (Pseudocode)

**Scenario:** New customer signs up via referral link

```python
def attribute_subscription(subscription_id, referral_code):
 """
 Attributes a subscription to a Scout (root referrer) and immediate referrer.

 Args:
 subscription_id: UUID of newly created subscription
 referral_code: Referral code from URL (e.g., "SCOUT-A3F9X2" or "CUST-X7Y9")

 Returns:
 referral_attribution: Created attribution record
 """

 # Step 1: Lookup referral link
 referral_link = db.query(ReferralLink).filter_by(referral_code=referral_code).first()

 if not referral_link:
 # No referral link found  no attribution (organic sign-up)
 log.warn(f"Invalid referral code: {referral_code}")
 return None

 # Step 2: Determine root Scout
 root_scout_id = referral_link.root_scout_id # Always present (even for customer links)

 # Step 3: Determine direct referrer
 direct_referrer_id = referral_link.owner_id
 direct_referrer_type = referral_link.owner_type # SCOUT or CUSTOMER

 # Step 4: Calculate attribution depth
 if referral_link.owner_type == 'SCOUT':
 # Direct Scout referral
 attribution_depth = 0
 elif referral_link.owner_type == 'CUSTOMER':
 # Indirect referral (customer sharing)
 # Lookup the customer's own attribution to calculate depth
 customer_attribution = db.query(ReferralAttribution).filter_by(
 customer_id=referral_link.owner_id
 ).first()

 if customer_attribution:
 attribution_depth = customer_attribution.attribution_depth + 1
 else:
 # Edge case: customer signed up organically, now referring others
 # Still attribute to Scout if they have one, else no root Scout
 attribution_depth = 1

 # Step 5: Check depth limit (prevent infinite chains)
 MAX_ATTRIBUTION_DEPTH = 5

 if attribution_depth > MAX_ATTRIBUTION_DEPTH:
 log.warn(f"Attribution depth exceeded for subscription {subscription_id}")
 # Still create attribution but flag for review
 attribution_depth = MAX_ATTRIBUTION_DEPTH

 # Step 6: Create attribution record
 subscription = db.query(Subscription).filter_by(id=subscription_id).first()

 attribution = ReferralAttribution(
 id=uuid4(),
 subscription_id=subscription_id,
 customer_id=subscription.customer_id,
 council_id=subscription.council_id,
 root_scout_id=root_scout_id,
 direct_referrer_id=direct_referrer_id,
 direct_referrer_type=direct_referrer_type,
 attribution_depth=attribution_depth,
 referral_link_id=referral_link.id,
 attribution_method='LINK_CLICK', # or QR_SCAN
 created_at=now()
 )

 db.add(attribution)
 db.commit()

 # Step 7: Publish event to Kafka
 kafka.publish('referral-events', {
 'event_type': 'referral_attributed',
 'subscription_id': subscription_id,
 'root_scout_id': root_scout_id,
 'attribution_depth': attribution_depth,
 'timestamp': now().isoformat()
 })

 # Step 8: Update Scout dashboard (async via Kafka consumer or cache invalidation)
 cache.delete(f"scout_dashboard:{root_scout_id}")

 return attribution


def attribute_pos_purchase(entitlement_id, customer_id):
 """
 Attributes a POS-purchased subscription to the Scout from the entitlement.

 Args:
 entitlement_id: UUID of claimed entitlement
 customer_id: UUID of customer who claimed

 Returns:
 referral_attribution: Created attribution record
 """

 # Step 1: Lookup entitlement
 entitlement = db.query(Entitlement).filter_by(id=entitlement_id).first()

 if not entitlement or entitlement.status != 'CLAIMED':
 raise ValueError("Invalid or unclaimed entitlement")

 # Step 2: Lookup subscription created from claim
 subscription = db.query(Subscription).filter_by(customer_id=customer_id).order_by(
 Subscription.created_at.desc()
 ).first()

 # Step 3: Create attribution (always direct for POS)
 attribution = ReferralAttribution(
 id=uuid4(),
 subscription_id=subscription.id,
 customer_id=customer_id,
 council_id=entitlement.council_id,
 root_scout_id=entitlement.scout_id,
 direct_referrer_id=entitlement.scout_id,
 direct_referrer_type='SCOUT',
 attribution_depth=0, # Always direct for POS
 entitlement_id=entitlement_id,
 attribution_method='POS_CLAIM',
 created_at=now()
 )

 db.add(attribution)
 db.commit()

 # Publish event
 kafka.publish('referral-events', {
 'event_type': 'pos_referral_attributed',
 'subscription_id': subscription.id,
 'scout_id': entitlement.scout_id,
 'timestamp': now().isoformat()
 })

 return attribution


def create_customer_referral_link(customer_id):
 """
 Generates a unique referral link for a customer (for viral loop).
 Preserves the root Scout from customer's original attribution.

 Args:
 customer_id: UUID of customer

 Returns:
 referral_link: New referral link
 """

 # Step 1: Lookup customer's own attribution (to find root Scout)
 customer_attribution = db.query(ReferralAttribution).filter_by(
 customer_id=customer_id
 ).first()

 if not customer_attribution:
 # Customer signed up organically (no Scout attribution)
 # Option A: Don't allow referral link creation (requires Scout attribution)
 # Option B: Allow but no Scout credit (set root_scout_id = NULL)
 # **Recommendation: Option A** (align with fundraising mission)
 raise ValueError("Customer must be attributed to a Scout to generate referral link")

 root_scout_id = customer_attribution.root_scout_id

 # Step 2: Generate unique referral code
 referral_code = generate_unique_code(prefix='CUST') # e.g., "CUST-X7Y9"
 referral_url = f"https://campcard.app/r/{referral_code}"

 # Step 3: Create referral link
 referral_link = ReferralLink(
 id=uuid4(),
 council_id=customer_attribution.council_id,
 owner_type='CUSTOMER',
 owner_id=customer_id,
 root_scout_id=root_scout_id, # PRESERVE original Scout
 referral_code=referral_code,
 referral_url=referral_url,
 qr_code_url=generate_qr_code(referral_url), # S3 upload
 status='ACTIVE',
 created_at=now()
 )

 db.add(referral_link)
 db.commit()

 return referral_link


def generate_unique_code(prefix='SCOUT', length=8):
 """Generates a unique alphanumeric code with prefix."""
 import random, string

 while True:
 code = prefix + '-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

 # Check uniqueness
 existing = db.query(ReferralLink).filter_by(referral_code=code).first()
 if not existing:
 return code
```

---

### 3.2 Attribution Scenarios (Illustrated)

#### Scenario A: Direct Scout Referral

```
Scout "Emily R."  generates link  Customer "John D." subscribes

Attribution:
 root_scout_id: Emily R.
 direct_referrer_id: Emily R.
 direct_referrer_type: SCOUT
 attribution_depth: 0

Emily's Dashboard:
 Direct Subscribers: +1
 Total Subscribers: +1
```

---

#### Scenario B: Indirect Customer Referral (1 Level)

```
Scout "Emily R."  Customer "John D."  Customer "Sarah P."

1. John D. subscribes via Emily's link:
 Attribution (John):
 root_scout_id: Emily R.
 direct_referrer_id: Emily R.
 attribution_depth: 0

2. John D. generates customer referral link (preserves Emily as root)

3. Sarah P. subscribes via John's link:
 Attribution (Sarah):
 root_scout_id: Emily R. (PRESERVED)
 direct_referrer_id: John D.
 direct_referrer_type: CUSTOMER
 attribution_depth: 1

Emily's Dashboard:
 Direct Subscribers: 1 (John)
 Indirect Subscribers: 1 (Sarah)
 Total Subscribers: 2
```

---

#### Scenario C: Deep Referral Chain (5 Levels Max)

```
Scout  C1  C2  C3  C4  C5  C6 (DEPTH EXCEEDED)

C6 attribution:
 root_scout_id: Original Scout (preserved)
 attribution_depth: 5 (capped at max)
 flagged_for_review: true (unusual depth, check for fraud)
```

---

#### Scenario D: POS Purchase

```
Troop Leader generates claim link for Scout "Jake M."  Customer "Amy T." claims

Attribution:
 root_scout_id: Jake M.
 direct_referrer_id: Jake M.
 direct_referrer_type: SCOUT
 attribution_depth: 0
 attribution_method: POS_CLAIM
 entitlement_id: <claim token ID>

Jake's Dashboard:
 Direct Subscribers: +1
```

---

### 3.3 Anti-Fraud Safeguards

| Risk | Mitigation |
|------|------------|
| **Click spam** | Rate limit referral link clicks (100/hour per IP), track IP + user agent |
| **Self-referral** | Block if customer email matches Scout parent email |
| **Fake accounts** | Email verification required, CAPTCHA on sign-up |
| **Depth abuse** | Cap at 5 levels, flag chains > 3 for manual review |
| **Expired claim reuse** | One-time claim tokens, validate expiry on claim |
| **Multiple claims** | One entitlement per subscription, check uniqueness constraint |

---

## 4. DATABASE INDEXES & PERFORMANCE

### 4.1 Critical Indexes (Already Defined Above)

**Query Pattern:** Browse active offers for council

```sql
-- Index: idx_offers_status (council_id, status, deleted_at)
SELECT * FROM offers
WHERE council_id = 42 AND status = 'ACTIVE' AND deleted_at IS NULL;
```

**Query Pattern:** Scout dashboard metrics

```sql
-- Index: idx_referral_attributions_root_scout
SELECT
 COUNT(*) FILTER (WHERE attribution_depth = 0) AS direct_count,
 COUNT(*) FILTER (WHERE attribution_depth > 0) AS indirect_count,
 SUM(price_cents) AS total_revenue_cents
FROM referral_attributions ra
JOIN subscriptions s ON ra.subscription_id = s.id
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE ra.root_scout_id = 'scout-uuid'
 AND s.status = 'ACTIVE';
```

**Query Pattern:** Nearby offers (geo search)

```sql
-- Index: idx_merchant_locations_geo (GIST index on lat/lng)
SELECT ml.*, m.business_name, o.title
FROM merchant_locations ml
JOIN merchants m ON ml.merchant_id = m.id
JOIN offers o ON o.merchant_id = m.id
WHERE ml.council_id = 42
 AND ml.status = 'ACTIVE'
 AND o.status = 'ACTIVE'
 AND earth_distance(
 ll_to_earth(ml.latitude, ml.longitude),
 ll_to_earth(28.5383, -81.3792) -- User location
 ) < 8000 -- 8km radius
ORDER BY earth_distance(...) ASC
LIMIT 20;
```

---

### 4.2 Query Optimization Strategies

**Caching (Redis):**
- Cache council offers list (TTL 5 min)
- Cache Scout dashboard (TTL 1 min, invalidate on new subscription)
- Cache subscription status (TTL 1 min)

**Materialized Views:**
- `analytics.scout_performance_daily` (daily aggregates)
- Refresh nightly via cron job

**Read Replicas:**
- Route dashboard queries to read replicas
- Route admin reports to read replicas
- Write operations to primary only

**Partitioning (Future):**
- Partition `referral_events`, `notification_events`, `audit_log` by date (monthly partitions)
- Auto-drop old partitions for retention (e.g., > 90 days)

---

## 5. DATA MIGRATION & FLYWAY

### 5.1 Flyway Migration Example

**File:** `V1__initial_schema.sql`

```sql
-- Create councils table
CREATE TABLE councils (
 id BIGSERIAL PRIMARY KEY,
 uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 name VARCHAR(255) NOT NULL,
 -- ... (full schema as above)
);

-- ... (all other tables)

-- Enable RLS
ALTER TABLE councils ENABLE ROW LEVEL SECURITY;
-- ... (all RLS policies)
```

**File:** `V2__add_geofence_support.sql`

```sql
-- Add geofence_radius_meters to merchant_locations
ALTER TABLE merchant_locations
ADD COLUMN geofence_radius_meters INTEGER DEFAULT 250;

-- Create geofence_events table
CREATE TABLE geofence_events (
 -- ... (full schema)
);

-- Create indexes
CREATE INDEX idx_geofence_events_user ON geofence_events(user_id);
-- ...
```

---

### 5.2 Data Seeding (Development)

**File:** `V999__seed_dev_data.sql` (only runs in dev environment)

```sql
-- Insert test council
INSERT INTO councils (name, slug, status) VALUES
 ('Central Florida Council', 'central-florida', 'ACTIVE');

-- Insert test troop
INSERT INTO troops (council_id, troop_number, troop_type, status) VALUES
 (1, 'Troop 101', 'TROOP', 'ACTIVE');

-- Insert test scout
INSERT INTO scouts (troop_id, council_id, first_name, parent_email, referral_code) VALUES
 (1, 1, 'Emily', 'parent@example.com', 'SCOUT-DEV001');

-- ... (more seed data)
```

---

## 6. DATA RETENTION & ARCHIVAL

### 6.1 Retention Policies

| Table | Retention | Strategy |
|-------|-----------|----------|
| `subscriptions` | Indefinite | Soft delete (deleted_at) |
| `payments` | 7 years | Legal requirement (financial records) |
| `redemptions` | 2 years | Archive to S3 Glacier after 1 year |
| `referral_events` | 1 year | Archive to S3 Glacier after 6 months |
| `notification_events` | 90 days | Hard delete after 90 days |
| `geofence_events` | 90 days | Hard delete after 90 days |
| `audit.audit_log` | 7 years | Archive to S3 Glacier after 1 year |

### 6.2 Archival Process (Automated)

**Tool:** AWS Glue or custom cron job

**Process:**
1. Nightly job queries records > retention period
2. Export to Parquet files in S3: `s3://campcard-archives/table=redemptions/year=2024/month=01/`
3. Delete from PostgreSQL
4. Glacier lifecycle policy moves S3 files to Glacier after 30 days

---

## 7. SUMMARY & NEXT STEPS

### 7.1 Data Model Highlights

- **39 tables** across 3 schemas (public, audit, analytics)
- **Multi-tenant isolation** via Row-Level Security on 25+ tables
- **Referral chain attribution** with root Scout preservation and depth tracking
- **Immutable audit trail** (payments, redemptions, events)
- **Pre-aggregated analytics** for fast dashboards
- **Geo-spatial indexing** for proximity searches
- **GDPR-ready** (soft deletes, data export capability)

### 7.2 Key Algorithms Implemented

1. **Referral Attribution:** Preserves root Scout across infinite customer-to-customer chains (depth-limited)
2. **POS Claim Flow:** One-time tokens with expiry and uniqueness enforcement
3. **Geo-fence Proximity:** Earth distance calculation with GIST indexes
4. **Usage Enforcement:** One-time offer redemption via unique constraint + status check

---

**END OF PART 4**

**Next:** Part 5  API Specifications (REST + Kafka Events)
