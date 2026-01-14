# BSA Camp Card - Database Schema Documentation

## Overview

The Camp Card platform uses PostgreSQL 16 with Flyway for schema migrations. All tables reside in the `campcard` schema.

---

## Environment Comparison

| Property | Local Development | AWS Production |
|----------|-------------------|----------------|
| Host | localhost | camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com |
| Port | 7001 | 5432 |
| Database | campcard_dev | campcard |
| Schema | public | campcard |
| User | postgres | campcard_app |
| Password | postgres | CampCardApp2024Secure |
| Connection String | `jdbc:postgresql://localhost:7001/campcard_dev` | `jdbc:postgresql://camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com:5432/campcard` |

---

## Entity Relationship Diagram (Simplified)

```
                    ┌─────────────────┐
                    │     councils    │
                    │─────────────────│
                    │ id (BIGSERIAL)  │
                    │ uuid (UUID)     │
                    │ name            │
                    │ region          │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │     troops      │ │  user_councils  │ │  subscriptions  │
    │─────────────────│ │─────────────────│ │─────────────────│
    │ id (BIGSERIAL)  │ │ user_id (FK)    │ │ user_id (FK)    │
    │ uuid (UUID)     │ │ council_id (FK) │ │ council_id (FK) │
    │ council_id (FK) │ └─────────────────┘ │ plan_id (FK)    │
    └────────┬────────┘                     └─────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│     scouts      │ │     users       │
│─────────────────│ │─────────────────│
│ id (BIGSERIAL)  │ │ id (UUID) PK    │
│ user_id (FK)    │ │ email           │
│ troop_id (FK)   │ │ role            │
└─────────────────┘ │ council_id      │
                    │ troop_id        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   referrals     │ │  notifications  │ │ refresh_tokens  │
    │─────────────────│ │─────────────────│ │─────────────────│
    │ referrer_id(FK) │ │ user_id (FK)    │ │ user_id (FK)    │
    │ referred_id(FK) │ │ type            │ │ token           │
    └─────────────────┘ │ message         │ └─────────────────┘
                        └─────────────────┘

    ┌─────────────────┐
    │   merchants     │
    │─────────────────│
    │ id (BIGSERIAL)  │
    │ uuid (UUID)     │
    │ business_name   │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│merchant_locations│ │     offers      │
│─────────────────│ │─────────────────│
│ merchant_id(FK) │ │ merchant_id(FK) │
│ street_address  │ │ title           │
│ latitude/long   │ │ discount_type   │
└─────────────────┘ └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │offer_redemptions│
                    │─────────────────│
                    │ offer_id (FK)   │
                    │ user_id (FK)    │
                    │ merchant_id(FK) │
                    └─────────────────┘
```

---

## Core Tables

### users

Primary user table for all platform users.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'SCOUT',
    council_id UUID,
    troop_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    referral_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Valid roles
CONSTRAINT chk_user_role CHECK (role IN (
    'SCOUT', 'PARENT', 'TROOP_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN'
));
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique login email |
| password_hash | VARCHAR(255) | BCrypt hash (strength 12) |
| role | VARCHAR(50) | User role (see enum below) |
| council_id | UUID | Associated council (optional) |
| troop_id | UUID | Associated troop (optional) |
| is_active | BOOLEAN | Soft delete flag |
| referral_code | VARCHAR(20) | Unique referral code |

**User Roles:**
- `NATIONAL_ADMIN` - Full system access
- `COUNCIL_ADMIN` - Council-level management
- `TROOP_LEADER` - Troop management
- `PARENT` - Parent/guardian access
- `SCOUT` - Scout member (default)

---

### councils

BSA Council organizations.

```sql
CREATE TABLE councils (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    region VARCHAR(50) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    scout_executive_name VARCHAR(255),
    scout_executive_email VARCHAR(255),
    camp_card_coordinator_name VARCHAR(255),
    camp_card_coordinator_email VARCHAR(255),
    camp_card_coordinator_phone VARCHAR(20),
    total_troops INTEGER NOT NULL DEFAULT 0,
    total_scouts INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cards_sold INTEGER NOT NULL DEFAULT 0,
    campaign_start_date DATE,
    campaign_end_date DATE,
    goal_amount DECIMAL(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    subscription_tier VARCHAR(50) DEFAULT 'BASIC',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:** `ACTIVE`, `INACTIVE`, `SUSPENDED`, `TRIAL`

**Subscription Tiers:** `BASIC`, `STANDARD`, `PREMIUM`, `ENTERPRISE`

**Regions:** `NORTHEAST`, `SOUTHEAST`, `CENTRAL`, `SOUTHERN`, `WESTERN`

---

### troops

Scout troop units within councils.

```sql
CREATE TABLE troops (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    troop_number VARCHAR(50) NOT NULL UNIQUE,
    council_id BIGINT NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
    troop_name VARCHAR(255),
    troop_type VARCHAR(50) NOT NULL,
    charter_organization VARCHAR(255),
    meeting_location VARCHAR(255),
    meeting_day VARCHAR(50),
    meeting_time VARCHAR(50),
    scoutmaster_id UUID REFERENCES users(id),
    scoutmaster_name VARCHAR(255),
    scoutmaster_email VARCHAR(255),
    scoutmaster_phone VARCHAR(20),
    assistant_scoutmaster_id UUID REFERENCES users(id),
    total_scouts INTEGER NOT NULL DEFAULT 0,
    active_scouts INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cards_sold INTEGER NOT NULL DEFAULT 0,
    goal_amount DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### scouts

Scout member profiles linked to users.

```sql
CREATE TABLE scouts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    troop_id BIGINT NOT NULL REFERENCES troops(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    bsa_member_id VARCHAR(50) UNIQUE,
    rank VARCHAR(50) NOT NULL DEFAULT 'SCOUT',
    join_date DATE,
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    cards_sold INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sales_goal DECIMAL(10, 2),
    commission_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
    top_seller BOOLEAN NOT NULL DEFAULT FALSE,
    awards_earned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    profile_image_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### merchants

Participating merchant businesses.

```sql
CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    dba_name VARCHAR(255),
    description TEXT,
    category VARCHAR(50) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by_user_id UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejected_by_user_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    total_offers INTEGER NOT NULL DEFAULT 0,
    active_offers INTEGER NOT NULL DEFAULT 0,
    total_redemptions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:** `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`

---

### merchant_locations

Physical locations for merchants.

```sql
CREATE TABLE merchant_locations (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    phone VARCHAR(20),
    hours TEXT,
    primary_location BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### offers

Discount offers from merchants.

```sql
CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2),
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    category VARCHAR(50),
    terms TEXT,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER,
    total_redemptions INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    scout_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
    requires_qr_verification BOOLEAN NOT NULL DEFAULT TRUE,
    location_specific BOOLEAN NOT NULL DEFAULT FALSE,
    merchant_location_id BIGINT REFERENCES merchant_locations(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Discount Types:** `PERCENTAGE`, `FIXED_AMOUNT`, `BOGO`, `FREE_ITEM`

---

### offer_redemptions

Tracking offer usage by users.

```sql
CREATE TABLE offer_redemptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    merchant_location_id BIGINT REFERENCES merchant_locations(id),
    purchase_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2) NOT NULL,
    final_amount DECIMAL(10, 2),
    verification_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    redeemed_at TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:** `PENDING`, `REDEEMED`, `VERIFIED`, `CANCELLED`, `EXPIRED`

---

### subscriptions

User/council subscription management.

```sql
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    council_id BIGINT REFERENCES councils(id) ON DELETE SET NULL,
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP,
    cancel_reason TEXT,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    referral_code VARCHAR(50),
    referred_by_user_id UUID REFERENCES users(id),
    root_scout_id UUID REFERENCES users(id),
    referral_depth INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:** `PENDING`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `SUSPENDED`, `TRIAL`, `EXPIRED`

---

### subscription_plans

Available subscription tiers.

```sql
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    stripe_price_id VARCHAR(255) UNIQUE,
    features JSONB,
    max_offers INTEGER,
    max_redemptions_per_month INTEGER,
    includes_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    includes_api_access BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Billing Periods:** `MONTHLY`, `QUARTERLY`, `ANNUAL`

---

### referrals

Referral tracking system.

```sql
CREATE TABLE referrals (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    click_count INTEGER NOT NULL DEFAULT 0,
    reward_amount DECIMAL(10, 2),
    reward_type VARCHAR(50),
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed_at TIMESTAMP,
    subscription_id BIGINT REFERENCES subscriptions(id),
    depth INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:** `PENDING`, `CLICKED`, `SIGNED_UP`, `SUBSCRIBED`, `REWARDED`, `EXPIRED`, `CANCELLED`

**Reward Types:** `CASH`, `CREDIT`, `DISCOUNT`, `FREE_MONTH`, `MERCHANDISE`

---

### notifications

User notification tracking.

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channel VARCHAR(20) NOT NULL DEFAULT 'PUSH',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Types:** `OFFER`, `REDEMPTION`, `SUBSCRIPTION`, `REFERRAL`, `ACHIEVEMENT`, `SYSTEM`, `REMINDER`, `PAYMENT`

**Channels:** `PUSH`, `EMAIL`, `SMS`, `IN_APP`

**Status Values:** `PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED`

---

## AI Marketing Tables

### marketing_campaigns

AI-powered marketing campaign management.

```sql
CREATE TABLE marketing_campaigns (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    subject_line VARCHAR(255),
    content_html TEXT,
    content_text TEXT,
    content_json JSONB,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ai_prompt TEXT,
    ai_model VARCHAR(100),
    ai_generation_metadata JSONB,
    segment_id BIGINT REFERENCES marketing_segments(id),
    target_audience JSONB,
    estimated_reach INTEGER,
    channels VARCHAR(100)[] NOT NULL DEFAULT ARRAY['PUSH'],
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    enable_geofencing BOOLEAN NOT NULL DEFAULT FALSE,
    enable_gamification BOOLEAN NOT NULL DEFAULT FALSE,
    enable_ai_optimization BOOLEAN NOT NULL DEFAULT TRUE,
    merchant_id BIGINT REFERENCES merchants(id),
    offer_id BIGINT REFERENCES offers(id),
    tags VARCHAR(50)[],
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Campaign Types:** `REACTIVATION`, `LOYALTY_BOOST`, `WEEKEND_SPECIAL`, `CATEGORY_PROMO`, `LOCATION_BASED`, `NEW_USER_WELCOME`, `SEASONAL`, `FLASH_SALE`, `REFERRAL_BOOST`, `CUSTOM`

**Status Values:** `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`, `SENDING`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`, `FAILED`

---

### marketing_segments

User segmentation for targeted campaigns.

```sql
CREATE TABLE marketing_segments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    segment_type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL DEFAULT '{}',
    user_count INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_computed_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Segment Types:** `BEHAVIORAL`, `DEMOGRAPHIC`, `GEOGRAPHIC`, `TRANSACTIONAL`, `CUSTOM`, `AI_GENERATED`

---

## Supporting Tables

### refresh_tokens

JWT refresh token storage.

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### device_tokens

Mobile push notification tokens.

```sql
CREATE TABLE device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);
```

**Platforms:** `IOS`, `ANDROID`, `WEB`

---

## Migration History

| Version | Description |
|---------|-------------|
| V001 | Initial schema (users, refresh_tokens, device_tokens) |
| V002 | Councils and user_councils |
| V003 | Subscriptions, subscription_plans, referrals, notifications |
| V004 | Merchants and merchant_locations |
| V005 | Offers and offer_redemptions |
| V006 | Scouts and troops |
| V007 | Seed test users |
| V008 | Create initial admin user |
| V009 | Baseline sync (RDS starting point) |
| V010 | Schema security setup (campcard schema, app user) |
| V011 | AI marketing campaigns |
| V012 | Seed merchants and offers |
| V013 | Campaign recipients enhancement |

---

## Useful Queries

### Count Users by Role

```sql
SELECT role, COUNT(*)
FROM users
WHERE deleted_at IS NULL
GROUP BY role;
```

### Active Offers by Merchant

```sql
SELECT m.business_name, COUNT(o.id) as offer_count
FROM merchants m
LEFT JOIN offers o ON m.id = o.merchant_id AND o.status = 'ACTIVE'
GROUP BY m.id, m.business_name
ORDER BY offer_count DESC;
```

### Council Sales Summary

```sql
SELECT
    c.name as council_name,
    c.total_troops,
    c.total_scouts,
    c.total_sales,
    c.cards_sold
FROM councils c
WHERE c.status = 'ACTIVE'
ORDER BY c.total_sales DESC;
```

### Recent Redemptions

```sql
SELECT
    u.email,
    o.title as offer,
    m.business_name as merchant,
    r.discount_amount,
    r.redeemed_at
FROM offer_redemptions r
JOIN users u ON r.user_id = u.id
JOIN offers o ON r.offer_id = o.id
JOIN merchants m ON r.merchant_id = m.id
WHERE r.redeemed_at > NOW() - INTERVAL '7 days'
ORDER BY r.redeemed_at DESC
LIMIT 50;
```

---

## Related Documentation

- [Local Development Guide](./QUICKSTART_LOCAL.md)
- [AWS Deployment Guide](./QUICKSTART_AWS.md)
- [Main Project Guide](../CLAUDE.md)
