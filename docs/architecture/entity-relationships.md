# Camp Card Entity Relationships

**Version:** 1.0
**Last Updated:** January 2026
**Database:** PostgreSQL 16
**Schema:** `campcard`

## Overview

This document describes all database entities, their fields, relationships, and the Entity Relationship Diagram (ERD) for the Camp Card platform.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CAMP CARD ERD                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                     │
│                              ┌──────────────┐                                                       │
│                              │   COUNCIL    │                                                       │
│                              │──────────────│                                                       │
│                              │ id (PK)      │                                                       │
│                              │ uuid         │                                                       │
│                              │ councilNumber│                                                       │
│                              │ name         │                                                       │
│                              │ region       │                                                       │
│                              │ status       │                                                       │
│                              └──────┬───────┘                                                       │
│                    ┌────────────────┼────────────────┬────────────────────┐                         │
│                    │                │                │                    │                         │
│                    ▼                ▼                ▼                    ▼                         │
│           ┌──────────────┐  ┌──────────────┐ ┌──────────────┐   ┌──────────────────┐               │
│           │    TROOP     │  │   MERCHANT   │ │SUBSCRIPTION  │   │MARKETING_CAMPAIGN│               │
│           │──────────────│  │──────────────│ │    PLAN      │   │──────────────────│               │
│           │ id (PK)      │  │ id (PK)      │ │──────────────│   │ id (PK)          │               │
│           │ councilId(FK)│  │councilId(FK) │ │ id (PK)      │   │ councilId (FK)   │               │
│           │ troopNumber  │  │ businessName │ │councilId(FK) │   │ segmentId (FK)   │               │
│           │ status       │  │ status       │ │ priceCents   │   │ merchantId (FK)  │               │
│           └──────┬───────┘  └──────┬───────┘ │ status       │   │ offerId (FK)     │               │
│                  │                 │         └──────┬───────┘   │ status           │               │
│                  │                 │                │           └────────┬─────────┘               │
│                  │                 │                │                    │                         │
│                  ▼                 ▼                │                    ▼                         │
│           ┌──────────────┐  ┌──────────────┐       │           ┌──────────────────┐               │
│           │    SCOUT     │  │    OFFER     │       │           │CAMPAIGN_RECIPIENT│               │
│           │──────────────│  │──────────────│       │           │──────────────────│               │
│           │ id (PK)      │  │ id (PK)      │       │           │ id (PK)          │               │
│           │ troopId (FK) │  │merchantId(FK)│       │           │ campaignId (FK)  │               │
│           │ userId (FK)  │  │ title        │       │           │ userId (FK)      │               │
│           │ cardNumber   │  │ discountType │       │           │ channel          │               │
│           └──────┬───────┘  │ status       │       │           │ status           │               │
│                  │          └──────┬───────┘       │           └──────────────────┘               │
│                  │                 │               │                                               │
│                  │                 │               │                                               │
│                  │                 ▼               │                                               │
│                  │         ┌──────────────┐       │                                               │
│                  │         │ OFFER_       │       │                                               │
│                  │         │ REDEMPTION   │       │                                               │
│                  └────────▶│──────────────│       │                                               │
│                            │ id (PK)      │       │                                               │
│                            │ offerId (FK) │       │                                               │
│                            │ userId (FK)  │◀──────┼───────────────┐                               │
│                            │ merchantId   │       │               │                               │
│                            │ status       │       │               │                               │
│                            └──────────────┘       │               │                               │
│                                                   │               │                               │
│   ┌──────────────────────────────────────────────┘               │                               │
│   │                                                               │                               │
│   │     ┌──────────────┐                                         │                               │
│   │     │     USER     │                                         │                               │
│   │     │──────────────│◀────────────────────────────────────────┘                               │
│   │     │ id (PK)      │                                                                         │
│   │     │ email        │──────────────────────────────┐                                          │
│   │     │ role         │                              │                                          │
│   │     │ councilId    │                              │                                          │
│   │     │ troopId      │                              │                                          │
│   │     └──────┬───────┘                              │                                          │
│   │            │                                      │                                          │
│   │            │    ┌─────────────────────────────────┼───────────────┐                          │
│   │            │    │                                 │               │                          │
│   │            ▼    ▼                                 ▼               ▼                          │
│   │     ┌──────────────┐  ┌──────────────┐   ┌──────────────┐ ┌──────────────┐                  │
│   │     │ SUBSCRIPTION │  │   REFERRAL   │   │ NOTIFICATION │ │ DEVICE_TOKEN │                  │
│   │     │──────────────│  │──────────────│   │──────────────│ │──────────────│                  │
│   └────▶│ id (PK)      │  │ id (PK)      │   │ id (PK)      │ │ id (PK)      │                  │
│         │ userId (FK)  │  │referrerId(FK)│   │ userId (FK)  │ │ userId (FK)  │                  │
│         │ planId (FK)  │  │referredId(FK)│   │ type         │ │ token        │                  │
│         │ cardNumber   │  │ referralCode │   │ read         │ │ deviceType   │                  │
│         │ status       │  │ status       │   │ sent         │ │ active       │                  │
│         └──────────────┘  └──────────────┘   └──────────────┘ └──────────────┘                  │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Specifications

### 1. User

**Package:** `org.bsa.campcard.domain.user`
**Table:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone_number | VARCHAR(20) | | Phone number |
| role | VARCHAR(50) | NOT NULL | User role enum |
| council_id | UUID | FK → Council | Council reference |
| troop_id | UUID | FK → Troop | Troop reference |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active |
| email_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verified |
| email_verification_token | VARCHAR(255) | | Verification token |
| email_verification_expires_at | TIMESTAMP | | Token expiry |
| password_reset_token | VARCHAR(255) | | Reset token |
| password_reset_expires_at | TIMESTAMP | | Token expiry |
| last_login_at | TIMESTAMP | | Last login time |
| referral_code | VARCHAR(20) | UNIQUE | Referral code |
| card_number | VARCHAR(20) | UNIQUE | Camp card number |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | | Soft delete |

**Enum - UserRole:**
- `NATIONAL_ADMIN` - System administrator
- `COUNCIL_ADMIN` - Council administrator
- `UNIT_LEADER` - Troop/unit leader
- `PARENT` - Parent/guardian
- `SCOUT` - Scout member

**Enum - UnitType:**
- `PACK` - Cub Scout Pack
- `BSA_TROOP_BOYS` - BSA Troop (Boys)
- `BSA_TROOP_GIRLS` - BSA Troop (Girls)
- `SHIP` - Sea Scout Ship
- `CREW` - Venturing Crew
- `FAMILY_SCOUTING` - Family Scouting Unit

---

### 2. Council

**Package:** `com.bsa.campcard.entity`
**Table:** `councils`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_number | VARCHAR(10) | UNIQUE, NOT NULL | Council number |
| name | VARCHAR(255) | NOT NULL | Council name |
| short_name | VARCHAR(50) | | Abbreviated name |
| region | VARCHAR(50) | NOT NULL | Geographic region |
| street_address | VARCHAR(255) | | Street address |
| city | VARCHAR(100) | | City |
| state | VARCHAR(2) | | State code |
| zip_code | VARCHAR(10) | | ZIP code |
| phone | VARCHAR(20) | | Phone number |
| email | VARCHAR(255) | | Email address |
| website_url | VARCHAR(500) | | Website URL |
| logo_url | VARCHAR(500) | | Logo image URL |
| scout_executive_name | VARCHAR(255) | | Scout Executive |
| scout_executive_email | VARCHAR(255) | | SE email |
| camp_card_coordinator_name | VARCHAR(255) | | Coordinator name |
| camp_card_coordinator_email | VARCHAR(255) | | Coordinator email |
| camp_card_coordinator_phone | VARCHAR(20) | | Coordinator phone |
| total_troops | INTEGER | DEFAULT 0 | Troop count |
| total_scouts | INTEGER | DEFAULT 0 | Scout count |
| total_sales | DECIMAL(12,2) | DEFAULT 0.00 | Total sales |
| cards_sold | INTEGER | DEFAULT 0 | Cards sold count |
| campaign_start_date | DATE | | Campaign start |
| campaign_end_date | DATE | | Campaign end |
| goal_amount | DECIMAL(12,2) | | Fundraising goal |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Council status |
| subscription_tier | VARCHAR(50) | DEFAULT 'BASIC' | Tier level |
| stripe_customer_id | VARCHAR(255) | | Stripe customer |
| stripe_subscription_id | VARCHAR(255) | | Stripe subscription |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - CouncilStatus:**
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `TRIAL`

**Enum - CouncilRegion:**
- `NORTHEAST`
- `SOUTHEAST`
- `CENTRAL`
- `SOUTHERN`
- `WESTERN`

---

### 3. Troop

**Package:** `com.bsa.campcard.entity`
**Table:** `troops`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| troop_number | VARCHAR(50) | NOT NULL | Troop number |
| council_id | BIGINT | FK → Council, NOT NULL | Parent council |
| troop_name | VARCHAR(255) | | Display name |
| troop_type | VARCHAR(50) | NOT NULL | Troop type enum |
| charter_organization | VARCHAR(255) | | Charter org |
| meeting_location | VARCHAR(255) | | Meeting place |
| meeting_day | VARCHAR(20) | | Meeting day |
| meeting_time | VARCHAR(20) | | Meeting time |
| scoutmaster_id | UUID | | Scoutmaster user |
| scoutmaster_name | VARCHAR(255) | | Scoutmaster name |
| scoutmaster_email | VARCHAR(255) | | Scoutmaster email |
| scoutmaster_phone | VARCHAR(20) | | Scoutmaster phone |
| assistant_scoutmaster_id | UUID | | Assistant SM |
| total_scouts | INTEGER | NOT NULL, DEFAULT 0 | Scout count |
| active_scouts | INTEGER | NOT NULL, DEFAULT 0 | Active scouts |
| total_sales | DECIMAL(10,2) | DEFAULT 0.00 | Total sales |
| cards_sold | INTEGER | NOT NULL, DEFAULT 0 | Cards sold |
| goal_amount | DECIMAL(10,2) | | Fundraising goal |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Troop status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - TroopType:**
- `SCOUTS_BSA`
- `CUB_SCOUTS`
- `VENTURING`
- `SEA_SCOUTS`
- `EXPLORING`

**Enum - TroopStatus:**
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `ARCHIVED`

---

### 4. Scout

**Package:** `com.bsa.campcard.entity`
**Table:** `scouts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| user_id | UUID | FK → User, NOT NULL | User account |
| troop_id | BIGINT | FK → Troop, NOT NULL | Parent troop |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| birth_date | DATE | | Date of birth |
| bsa_member_id | VARCHAR(50) | | BSA member ID |
| rank | VARCHAR(50) | NOT NULL, DEFAULT 'SCOUT' | Current rank |
| join_date | DATE | | Troop join date |
| parent_name | VARCHAR(255) | | Parent name |
| parent_email | VARCHAR(255) | | Parent email |
| parent_phone | VARCHAR(20) | | Parent phone |
| emergency_contact_name | VARCHAR(255) | | Emergency contact |
| emergency_contact_phone | VARCHAR(20) | | Emergency phone |
| cards_sold | INTEGER | NOT NULL, DEFAULT 0 | Cards sold |
| total_sales | DECIMAL(10,2) | DEFAULT 0.00 | Total sales |
| sales_goal | DECIMAL(10,2) | | Personal goal |
| commission_earned | DECIMAL(10,2) | DEFAULT 0.00 | Commission |
| top_seller | BOOLEAN | DEFAULT FALSE | Top seller flag |
| awards_earned | INTEGER | DEFAULT 0 | Award count |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Scout status |
| profile_image_url | VARCHAR(500) | | Profile image |
| notes | TEXT | | Notes |
| card_number | VARCHAR(20) | UNIQUE | Camp card number |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - ScoutRank:**
- `SCOUT`, `TENDERFOOT`, `SECOND_CLASS`, `FIRST_CLASS`, `STAR`, `LIFE`, `EAGLE`
- `BOBCAT`, `TIGER`, `WOLF`, `BEAR`, `WEBELOS`, `ARROW_OF_LIGHT`

**Enum - ScoutStatus:**
- `ACTIVE`, `INACTIVE`, `TRANSFERRED`, `AGED_OUT`, `DROPPED`

---

### 5. Merchant

**Package:** `com.bsa.campcard.entity`
**Table:** `merchants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_id | BIGINT | FK → Council, NOT NULL | Council |
| business_name | VARCHAR(200) | NOT NULL | Business name |
| dba_name | VARCHAR(200) | | DBA name |
| description | TEXT | | Description |
| category | VARCHAR(100) | | Business category |
| tax_id | VARCHAR(20) | | Tax ID |
| contact_name | VARCHAR(200) | NOT NULL | Contact name |
| contact_email | VARCHAR(100) | NOT NULL | Contact email |
| contact_phone | VARCHAR(20) | | Contact phone |
| website_url | VARCHAR(500) | | Website URL |
| logo_url | VARCHAR(500) | | Logo URL |
| business_hours | TEXT | | Hours (JSON) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Status |
| approved_at | TIMESTAMP | | Approval time |
| approved_by | UUID | | Approver user |
| rejection_reason | TEXT | | Rejection reason |
| terms_accepted | BOOLEAN | DEFAULT FALSE | Terms accepted |
| terms_accepted_at | TIMESTAMP | | Terms time |
| total_offers | INTEGER | DEFAULT 0 | Offer count |
| active_offers | INTEGER | DEFAULT 0 | Active offers |
| total_redemptions | INTEGER | DEFAULT 0 | Redemptions |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | | Soft delete |

**Enum - MerchantStatus:**
- `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, `INACTIVE`

---

### 6. MerchantLocation

**Package:** `com.bsa.campcard.entity`
**Table:** `merchant_locations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| merchant_id | BIGINT | FK → Merchant, NOT NULL | Parent merchant |
| location_name | VARCHAR(200) | NOT NULL | Location name |
| street_address | VARCHAR(200) | NOT NULL | Street address |
| address_line_2 | VARCHAR(100) | | Address line 2 |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(50) | NOT NULL | State |
| zip_code | VARCHAR(20) | NOT NULL | ZIP code |
| country | VARCHAR(50) | DEFAULT 'USA' | Country |
| latitude | DECIMAL(10,7) | | Latitude |
| longitude | DECIMAL(10,7) | | Longitude |
| phone | VARCHAR(20) | | Phone |
| hours | TEXT | | Hours (JSON) |
| primary_location | BOOLEAN | DEFAULT FALSE | Primary flag |
| active | BOOLEAN | DEFAULT TRUE | Active flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | | Soft delete |

---

### 7. Offer

**Package:** `com.bsa.campcard.entity`
**Table:** `offers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| merchant_id | BIGINT | FK → Merchant, NOT NULL | Merchant |
| title | VARCHAR(255) | NOT NULL | Offer title |
| description | TEXT | | Description |
| discount_type | VARCHAR(50) | NOT NULL | Discount type |
| discount_value | DECIMAL(10,2) | | Discount value |
| min_purchase_amount | DECIMAL(10,2) | | Min purchase |
| max_discount_amount | DECIMAL(10,2) | | Max discount |
| category | VARCHAR(100) | | Category |
| terms | TEXT | | Terms & conditions |
| image_url | VARCHAR(500) | | Image URL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Status |
| valid_from | TIMESTAMP | NOT NULL | Start date |
| valid_until | TIMESTAMP | NOT NULL | End date |
| usage_limit | INTEGER | | Total usage limit |
| usage_limit_per_user | INTEGER | | Per-user limit |
| total_redemptions | INTEGER | NOT NULL, DEFAULT 0 | Redemptions |
| featured | BOOLEAN | DEFAULT FALSE | Featured flag |
| scout_exclusive | BOOLEAN | DEFAULT FALSE | Scout only |
| requires_qr_verification | BOOLEAN | DEFAULT TRUE | QR required |
| location_specific | BOOLEAN | DEFAULT FALSE | Location specific |
| merchant_location_id | BIGINT | FK → MerchantLocation | Location |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - DiscountType:**
- `PERCENTAGE`, `FIXED_AMOUNT`, `BUY_ONE_GET_ONE`, `FREE_ITEM`, `SPECIAL_PRICE`

**Enum - OfferStatus:**
- `DRAFT`, `ACTIVE`, `PAUSED`, `EXPIRED`, `SUSPENDED`

---

### 8. OfferRedemption

**Package:** `com.bsa.campcard.entity`
**Table:** `offer_redemptions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| offer_id | BIGINT | FK → Offer, NOT NULL | Offer |
| user_id | UUID | FK → User, NOT NULL | User |
| merchant_id | BIGINT | FK → Merchant, NOT NULL | Merchant |
| merchant_location_id | BIGINT | FK → MerchantLocation | Location |
| purchase_amount | DECIMAL(10,2) | | Purchase amount |
| discount_amount | DECIMAL(10,2) | NOT NULL | Discount given |
| final_amount | DECIMAL(10,2) | | Final amount |
| verification_code | VARCHAR(50) | UNIQUE | QR code |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Status |
| redeemed_at | TIMESTAMP | | Redemption time |
| verified_at | TIMESTAMP | | Verification time |
| verified_by_user_id | UUID | | Verifier user |
| notes | TEXT | | Notes |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Enum - RedemptionStatus:**
- `PENDING`, `VERIFIED`, `COMPLETED`, `CANCELLED`, `EXPIRED`

---

### 9. SubscriptionPlan

**Package:** `com.bsa.campcard.entity`
**Table:** `subscription_plans`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_id | BIGINT | FK → Council, NOT NULL | Council |
| name | VARCHAR(100) | NOT NULL | Plan name |
| description | TEXT | | Description |
| price_cents | INTEGER | NOT NULL | Price in cents |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency |
| billing_interval | VARCHAR(20) | NOT NULL | Interval |
| trial_days | INTEGER | DEFAULT 0 | Trial period |
| max_members | INTEGER | DEFAULT 1 | Max members |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | Status |
| stripe_product_id | VARCHAR(255) | | Stripe product |
| stripe_price_id | VARCHAR(255) | | Stripe price |
| features | TEXT[] | | Features list |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | | Soft delete |

**Enum - BillingInterval:**
- `MONTHLY`, `ANNUAL`

**Enum - PlanStatus:**
- `ACTIVE`, `INACTIVE`

---

### 10. Subscription

**Package:** `com.bsa.campcard.entity`
**Table:** `subscriptions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_id | BIGINT | FK → Council, NOT NULL | Council |
| user_id | UUID | FK → User, NOT NULL | User |
| plan_id | BIGINT | FK → SubscriptionPlan, NOT NULL | Plan |
| referral_code | VARCHAR(50) | | Applied referral |
| root_scout_id | UUID | | Referral root |
| referral_depth | INTEGER | DEFAULT 0 | Referral level |
| stripe_subscription_id | VARCHAR(255) | | Stripe sub |
| stripe_customer_id | VARCHAR(255) | | Stripe customer |
| current_period_start | TIMESTAMP | | Period start |
| current_period_end | TIMESTAMP | | Period end |
| cancel_at_period_end | BOOLEAN | DEFAULT FALSE | Cancel pending |
| canceled_at | TIMESTAMP | | Cancellation time |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Status |
| card_number | VARCHAR(20) | UNIQUE | Camp card number |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | | Soft delete |

**Enum - SubscriptionStatus:**
- `PENDING`, `ACTIVE`, `SUSPENDED`, `CANCELED`

---

### 11. Referral

**Package:** `com.bsa.campcard.entity`
**Table:** `referrals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| referrer_id | UUID | FK → User, NOT NULL | Referrer user |
| referred_user_id | UUID | FK → User, NOT NULL | Referred user |
| referral_code | VARCHAR(20) | NOT NULL, UNIQUE | Code used |
| status | VARCHAR(20) | NOT NULL | Status |
| reward_amount | DECIMAL(10,2) | | Reward amount |
| reward_claimed | BOOLEAN | NOT NULL, DEFAULT FALSE | Claimed flag |
| reward_claimed_at | TIMESTAMP | | Claim time |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| completed_at | TIMESTAMP | | Completion time |
| notes | TEXT | | Notes |

**Enum - ReferralStatus:**
- `PENDING`, `COMPLETED`, `REWARDED`, `EXPIRED`, `CANCELLED`

---

### 12. ReferralClick

**Package:** `com.bsa.campcard.entity`
**Table:** `referral_clicks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| referral_id | BIGINT | FK → Referral, NOT NULL | Referral |
| ip_address | VARCHAR(45) | | IP address |
| user_agent | TEXT | | User agent |
| referer | VARCHAR(500) | | Referer URL |
| created_at | TIMESTAMP | NOT NULL | Click time |

---

### 13. Notification

**Package:** `com.bsa.campcard.entity`
**Table:** `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| user_id | BIGINT | FK → User, NOT NULL | User |
| title | VARCHAR(100) | NOT NULL | Title |
| body | TEXT | NOT NULL | Message body |
| type | VARCHAR(50) | | Notification type |
| data | TEXT | | JSON deep link data |
| image_url | VARCHAR(500) | | Image URL |
| sent | BOOLEAN | NOT NULL, DEFAULT FALSE | Sent flag |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read flag |
| sent_at | TIMESTAMP | | Sent time |
| read_at | TIMESTAMP | | Read time |
| created_at | TIMESTAMP | NOT NULL | Creation time |

**Enum - NotificationType:**
- `NEW_OFFER`, `OFFER_EXPIRING`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`
- `SUBSCRIPTION_EXPIRING`, `SUBSCRIPTION_RENEWED`, `REFERRAL_REWARD`
- `TROOP_ANNOUNCEMENT`, `SYSTEM_ALERT`, `MARKETING`

---

### 14. DeviceToken

**Package:** `com.bsa.campcard.entity`
**Table:** `device_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| user_id | BIGINT | FK → User, NOT NULL | User |
| token | VARCHAR(512) | NOT NULL, UNIQUE | Device token |
| device_type | VARCHAR(20) | NOT NULL | Device type |
| device_model | VARCHAR(50) | | Device model |
| os_version | VARCHAR(20) | | OS version |
| app_version | VARCHAR(20) | | App version |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| last_used_at | TIMESTAMP | | Last used time |

**Enum - DeviceType:**
- `IOS`, `ANDROID`, `WEB`

---

### 15. MarketingCampaign

**Package:** `com.bsa.campcard.entity`
**Table:** `marketing_campaigns`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_id | BIGINT | FK → Council | Council |
| name | VARCHAR(255) | NOT NULL | Campaign name |
| description | TEXT | | Description |
| campaign_type | VARCHAR(50) | NOT NULL | Campaign type |
| status | VARCHAR(20) | NOT NULL | Status |
| subject_line | VARCHAR(255) | | Email subject |
| content_html | TEXT | | HTML content |
| content_text | TEXT | | Text content |
| content_json | JSONB | | JSON content |
| ai_generated | BOOLEAN | | AI generated flag |
| ai_prompt | TEXT | | AI prompt used |
| ai_model | VARCHAR(100) | | AI model |
| ai_generation_metadata | JSONB | | AI metadata |
| segment_id | BIGINT | FK → MarketingSegment | Segment |
| target_audience | JSONB | | Audience config |
| estimated_reach | INTEGER | | Estimated reach |
| channels | TEXT[] | | Channels array |
| scheduled_at | TIMESTAMP | | Scheduled time |
| started_at | TIMESTAMP | | Start time |
| completed_at | TIMESTAMP | | Completion time |
| enable_geofencing | BOOLEAN | | Geofencing flag |
| enable_gamification | BOOLEAN | | Gamification flag |
| enable_ai_optimization | BOOLEAN | DEFAULT TRUE | AI opt flag |
| merchant_id | BIGINT | FK → Merchant | Merchant |
| offer_id | BIGINT | FK → Offer | Offer |
| tags | TEXT[] | | Tags array |
| metadata | JSONB | | Metadata |
| created_by | UUID | FK → User | Creator |
| updated_by | UUID | FK → User | Updater |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - CampaignType:**
- `REACTIVATION`, `LOYALTY_BOOST`, `WEEKEND_SPECIAL`, `CATEGORY_PROMO`
- `LOCATION_BASED`, `NEW_USER_WELCOME`, `SEASONAL`, `FLASH_SALE`
- `REFERRAL_BOOST`, `CUSTOM`

**Enum - CampaignStatus:**
- `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`, `SENDING`
- `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`, `FAILED`

---

### 16. MarketingSegment

**Package:** `com.bsa.campcard.entity`
**Table:** `marketing_segments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| council_id | BIGINT | FK → Council | Council |
| name | VARCHAR(100) | NOT NULL | Segment name |
| description | TEXT | | Description |
| segment_type | VARCHAR(50) | NOT NULL | Segment type |
| rules | JSONB | NOT NULL | Segment rules |
| user_count | INTEGER | | User count |
| is_system | BOOLEAN | | System segment |
| is_active | BOOLEAN | | Active flag |
| last_computed_at | TIMESTAMP | | Last computed |
| created_by | UUID | FK → User | Creator |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - SegmentType:**
- `BEHAVIORAL`, `DEMOGRAPHIC`, `GEOGRAPHIC`, `TRANSACTIONAL`, `CUSTOM`
- `AI_GENERATED`, `ALL_USERS`, `ACTIVE_SUBSCRIBERS`, `SCOUTS`, `PARENTS`, `UNIT_LEADERS`

---

### 17. SavedCampaign

**Package:** `com.bsa.campcard.entity`
**Table:** `saved_campaigns`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| user_id | UUID | FK → User, NOT NULL | Owner user |
| council_id | BIGINT | FK → Council | Council |
| name | VARCHAR(255) | NOT NULL | Name |
| description | TEXT | | Description |
| campaign_config | JSONB | NOT NULL | Configuration |
| save_type | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | Save type |
| source_campaign_id | BIGINT | FK → MarketingCampaign | Source |
| is_favorite | BOOLEAN | DEFAULT FALSE | Favorite flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Enum - SaveType:**
- `DRAFT`, `TEMPLATE`, `FAVORITE`, `ARCHIVED`

---

### 18. CampaignRecipient

**Package:** `com.bsa.campcard.entity`
**Table:** `campaign_recipients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, auto-increment | Primary key |
| uuid | UUID | UNIQUE | UUID identifier |
| campaign_id | BIGINT | FK → MarketingCampaign, NOT NULL | Campaign |
| user_id | UUID | FK → User, NOT NULL | Recipient |
| channel | VARCHAR(20) | NOT NULL | Delivery channel |
| status | VARCHAR(20) | NOT NULL | Delivery status |
| contact_info | VARCHAR(500) | | Contact info |
| scheduled_at | TIMESTAMP | | Scheduled time |
| sent_at | TIMESTAMP | | Sent time |
| delivered_at | TIMESTAMP | | Delivery time |
| opened_at | TIMESTAMP | | Open time |
| clicked_at | TIMESTAMP | | Click time |
| converted_at | TIMESTAMP | | Conversion time |
| failed_at | TIMESTAMP | | Failure time |
| error_message | TEXT | | Error message |
| retry_count | INTEGER | DEFAULT 0 | Retry count |
| last_retry_at | TIMESTAMP | | Last retry |
| open_count | INTEGER | DEFAULT 0 | Opens count |
| click_count | INTEGER | DEFAULT 0 | Clicks count |
| metadata | JSONB | | Metadata |
| triggered_by_geofence | BOOLEAN | DEFAULT FALSE | Geofence flag |
| geofence_id | VARCHAR(100) | | Geofence ID |
| trigger_latitude | DOUBLE | | Latitude |
| trigger_longitude | DOUBLE | | Longitude |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

**Unique Constraint:** (campaign_id, user_id, channel)

**Enum - Channel:**
- `EMAIL`, `SMS`, `PUSH`, `IN_APP`

**Enum - DeliveryStatus:**
- `PENDING`, `SCHEDULED`, `SENDING`, `SENT`, `DELIVERED`
- `OPENED`, `CLICKED`, `CONVERTED`, `FAILED`, `BOUNCED`, `UNSUBSCRIBED`, `SKIPPED`

---

## Relationship Summary

### One-to-Many Relationships

| Parent | Child | Foreign Key |
|--------|-------|-------------|
| Council | User | user.council_id |
| Council | Troop | troop.council_id |
| Council | Merchant | merchant.council_id |
| Council | SubscriptionPlan | subscription_plan.council_id |
| Council | Subscription | subscription.council_id |
| Council | MarketingCampaign | marketing_campaign.council_id |
| Council | MarketingSegment | marketing_segment.council_id |
| Troop | User | user.troop_id |
| Troop | Scout | scout.troop_id |
| User | Scout | scout.user_id |
| User | Subscription | subscription.user_id |
| User | OfferRedemption | offer_redemption.user_id |
| User | Notification | notification.user_id |
| User | DeviceToken | device_token.user_id |
| User | SavedCampaign | saved_campaign.user_id |
| User | CampaignRecipient | campaign_recipient.user_id |
| User | Referral (referrer) | referral.referrer_id |
| User | Referral (referred) | referral.referred_user_id |
| Merchant | Offer | offer.merchant_id |
| Merchant | MerchantLocation | merchant_location.merchant_id |
| Merchant | OfferRedemption | offer_redemption.merchant_id |
| Offer | OfferRedemption | offer_redemption.offer_id |
| SubscriptionPlan | Subscription | subscription.plan_id |
| Referral | ReferralClick | referral_click.referral_id |
| MarketingCampaign | CampaignRecipient | campaign_recipient.campaign_id |
| MarketingSegment | MarketingCampaign | marketing_campaign.segment_id |

---

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_council_id ON users(council_id);
CREATE INDEX idx_users_troop_id ON users(troop_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Troop lookups
CREATE INDEX idx_troops_council_id ON troops(council_id);
CREATE INDEX idx_troops_troop_number ON troops(troop_number);

-- Scout lookups
CREATE INDEX idx_scouts_user_id ON scouts(user_id);
CREATE INDEX idx_scouts_troop_id ON scouts(troop_id);
CREATE INDEX idx_scouts_card_number ON scouts(card_number);

-- Offer lookups
CREATE INDEX idx_offers_merchant_id ON offers(merchant_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_valid_dates ON offers(valid_from, valid_until);

-- Redemption lookups
CREATE INDEX idx_redemptions_user_id ON offer_redemptions(user_id);
CREATE INDEX idx_redemptions_offer_id ON offer_redemptions(offer_id);
CREATE INDEX idx_redemptions_verification_code ON offer_redemptions(verification_code);

-- Campaign recipient tracking
CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
```

---

## Related Documentation

- [System Map](./system-map.md)
- [API Inventory](./api-inventory.md)
- [Event Catalog](./event-catalog.md)
