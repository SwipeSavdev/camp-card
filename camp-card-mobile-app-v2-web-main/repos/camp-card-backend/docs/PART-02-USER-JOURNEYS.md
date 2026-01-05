# BSA Camp Card Digitalization Program
## Build Specification  Part 2: User Journeys & Functional Requirements

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. USER JOURNEYS OVERVIEW

This section details end-to-end user flows for all five stakeholder roles:

1. **Customer Journey** (adult subscriber)
2. **Scout Journey** (youth seller, ages 514)
3. **Troop Leader Journey** (adult volunteer)
4. **Council Admin Journey** (council staff)
5. **National Admin Journey** (cross-council operations)

Each journey includes:
- Entry points and discovery
- Step-by-step interaction flows
- Decision points and error states
- Success criteria and metrics

---

## 2. CUSTOMER JOURNEY

### 2.1 Discovery & Entry Points

**Entry Point Matrix:**

| Source | Mechanism | Attribution | Typical Scenario |
|--------|-----------|-------------|------------------|
| **Scout Direct** | Scout's unique QR code on printed poster | Direct referral to Scout | Scout hands poster to parent at school pickup |
| **Scout Direct** | Scout's unique short link (SMS, email) | Direct referral to Scout | Scout texts link to family friend |
| **Troop Event** | Generic troop QR on banner at fundraiser | Prompted to select Scout during sign-up | Customer scans at popcorn booth, picks Scout from roster |
| **Council Marketing** | Council-branded ad (social, print, web) | No initial Scout attribution | Customer sees Facebook ad, can add Scout later |
| **Customer Referral** | Existing customer shares their link | Indirect referral (root Scout preserved) | Customer shares with neighbor, original Scout gets credit |
| **POS Purchase** | Troop leader generates claim link | Direct referral to Scout (pre-attributed) | Customer pays cash at in-person sale, gets texted link |

### 2.2 Journey Flow: In-App Purchase (Primary Path)

**Step 1: Discover & Land**
- Customer scans Scout's QR code or clicks link
- Lands on mobile-optimized landing page with:
 - Hero: "Pay a little. Get deals. Help Scouts."
 - Value props: Browse local offers, instant savings, support [Scout First Name]
 - CTA: "Download App" or "Get Started" (if already installed, deep links to sign-up)
- **Attribution captured:** `referral_token` in URL  stored in cookie/local storage

**Step 2: Install & Open App**
- Customer downloads from App Store / Google Play
- Opens app, sees onboarding carousel:
 - Screen 1: "Welcome to Camp Card" (logo, tagline)
 - Screen 2: "Local deals in your pocket" (offer examples)
 - Screen 3: "Support [Scout First Name] and [Troop Name]" (if attributed)
 - CTA: "Sign Up" or "Sign In"

**Step 3: Create Account**
- **Required fields:**
 - Email address (primary identifier)
 - Password (min 8 chars, or social login)
 - First name, Last name
 - ZIP code (for offer proximity)
- **Optional:**
 - Phone (for SMS notifications)
- **Consent checkboxes:**
 - "I agree to Terms of Service" (required)
 - "I'm 18+ years old" (required)
 - "Send me offer notifications" (optional, default off)
- **Scout attribution:**
 - If `referral_token` present: "You were referred by Scout [First Name] from [Troop Name]. Your purchase will support their fundraising."
 - Allow customer to change or remove Scout (edge case: wrong Scout)
- **Submit:** Creates account, issues JWT, proceeds to plan selection

**Step 4: Select Subscription Plan**
- Display available plans (e.g., from Council config):
 - **Monthly:** $5.99/month, cancel anytime
 - **Annual:** $29.99/year (save 50%!)
 - **Family Plan:** $49.99/year, up to 5 members
- Show example savings: "Average customer saves $200/year"
- Highlight auto-renew (can disable later)
- CTA: "Subscribe Now"

**Step 5: Payment**
- Enter payment method:
 - Credit/debit card (Stripe or similar)
 - Apple Pay / Google Pay (if available)
- Review order:
 - Plan: Annual  $29.99
 - Supporting: Scout [Name], Troop [Number]
 - Next billing date: Dec 23, 2026
- **Submit payment**
- On success:
 - Create `Subscription` record (status: ACTIVE)
 - Create `Payment` record
 - Create `ReferralAttribution` record (if Scout present)
 - Publish `subscription_created` Kafka event
 - Send confirmation email

**Step 6: Welcome & Browse Offers**
- Show success screen: "You're all set! Start saving now."
- Navigate to Offers screen (default view)
- Customer browses, filters, redeems (see Offer Redemption flow)

---

### 2.3 Journey Flow: Third-Party POS Purchase (Critical Alternative Path)

**Context:** Troop sells cards in-person (e.g., at a community event, door-to-door) and collects cash/check. Customer needs to activate their subscription digitally afterward.

**Step 1: Troop Leader Generates Claim Link (Admin Portal)**
- Troop leader logs into web portal
- Navigates to "Sell a Card" or "Generate Claim Link"
- Selects:
 - Scout seller (from troop roster dropdown)
 - Subscription plan (Annual, Monthly, etc.)
 - Optionally: Customer first name (for personalization)
- Clicks "Generate Link"
- System:
 - Creates `Entitlement` record (status: PENDING_CLAIM, expiry: 30 days)
 - Generates unique claim token (e.g., `CLM-A3F9X2B8`)
 - Creates claim URL: `https://campcard.app/claim/CLM-A3F9X2B8`
 - Generates QR code for URL
- Troop leader receives:
 - Printable ticket/receipt with QR + short code
 - SMS/email option to send directly to customer
 - Link copied to clipboard

**Step 2: Customer Receives Claim Link**
- **In-Person:** Troop leader hands printed receipt with QR
- **Digital:** Customer receives SMS/email: "Thanks for supporting [Troop Name]! Activate your Camp Card: [link]"

**Step 3: Customer Clicks Claim Link**
- Opens URL in mobile browser
- Detects if app installed:
 - **Installed:** Deep link to app  claim flow
 - **Not installed:** Show interstitial:
 - "Download the Camp Card app to activate"
 - App Store / Google Play buttons
 - After install, deep link resumes claim flow

**Step 4: Claim Activation (In-App)**
- Customer opens app (or is deep-linked)
- If not signed in:
 - Show "Create Account" or "Sign In"
 - After account creation, resume claim
- If signed in:
 - Show claim confirmation screen:
 - "You purchased a [Plan Name] from [Scout Name]"
 - "Activate now to start saving"
 - CTA: "Activate"
- On activation:
 - Validate claim token (not expired, not already used)
 - Create/update `Subscription` record (status: ACTIVE, no payment record if POS-paid)
 - Mark `Entitlement` status: CLAIMED
 - Create `ReferralAttribution` (direct to Scout)
 - Publish `subscription_claimed` Kafka event
 - Show success + navigate to Offers

**Step 5: POS Reconciliation (Backend)**
- Troop leader marks POS sale as "collected" with cash/check amount
- System reconciles:
 - Entitlement claimed  Subscription active  Payment recorded as OFFLINE
 - Fundraising attributed to Scout
 - Council receives revenue notification

**Error Handling:**
- **Token expired:** "This claim link expired. Please contact [Troop Leader] for assistance."
- **Token already used:** "This card was already activated. If you didn't activate it, contact support."
- **Invalid token:** "Invalid claim link. Please check the QR/URL."

---

### 2.4 Journey Flow: Offer Redemption

**Step 1: Browse Offers**
- Customer opens app  Offers tab (default screen)
- Sees list/grid of offers with:
 - Merchant logo
 - Offer title: "20% off entire purchase"
 - Category badge: "Dining"
 - Distance: "0.8 mi"
 - Expiration: "Valid until Dec 31"
- Filters available:
 - Category (Dining, Retail, Auto, Entertainment, etc.)
 - Distance (0.5mi, 1mi, 5mi, 10mi+)
 - Sort: Nearest, Newest, Ending Soon

**Step 2: View Offer Details**
- Customer taps offer  Details screen:
 - **Top:** Merchant name, logo, offer headline
 - **Offer terms:** Full description, restrictions (e.g., "Excludes alcohol, not valid with other offers")
 - **Usage:** "Redeemable once per visit" or "Unlimited use"
 - **Valid dates:** "Dec 1, 2025  Dec 31, 2025"
 - **Locations:** List of participating merchant locations with addresses, distances
 - **Map view:** Pin markers for each location
 - **CTA:** "Use This Offer"

**Step 3: Activate Offer (Pre-Redemption)**
- Customer taps "Use This Offer"
- System checks:
 - Subscription status: ACTIVE? (if not  "Renew to continue redeeming")
 - Offer usage limits: exceeded? (e.g., one-time offer already used)
- If valid:
 - Generate redemption code (8-digit numeric or QR)
 - Show redemption screen:
 - Large QR code
 - 8-digit code: `1234-5678`
 - Timer: "Valid for 10 minutes" (anti-fraud: prevents screenshot sharing)
 - Instructions: "Show this code to cashier at checkout"

**Step 4: Merchant Confirms Redemption**

**Option A: Customer Shows Code (Low-Tech)**
- Customer shows QR or reads code to cashier
- Cashier applies discount manually
- **No automatic tracking** (relies on merchant self-reporting or monthly reconciliation)

**Option B: Merchant Scans/Enters Code (High-Tech)**
- Merchant has tablet/POS integration
- Scans QR or enters code
- System validates:
 - Code exists and not expired
 - Code not already redeemed (if one-time)
 - Subscription active
- On success:
 - Mark code as REDEEMED
 - Create `Redemption` record (timestamp, merchant, offer, customer)
 - Publish `redemption_recorded` Kafka event
 - Show merchant: "Valid  apply discount"
 - Show customer: "Offer redeemed! You saved $X"

**Step 5: Post-Redemption**
- Customer sees success message in app
- Redemption added to history (Savings tab)
- Offer availability updates:
 - One-time: marked as "Used" (grayed out)
 - Unlimited: remains available for future use

**Error Scenarios:**
- **Already redeemed (one-time offer):** "You've already used this offer. Browse more deals!"
- **Expired subscription:** "Renew your subscription to keep redeeming offers."
- **Code expired (timer):** "This code expired. Generate a new one."
- **Invalid code (merchant entry):** "Invalid code. Please check and try again."

---

### 2.5 Journey Flow: Customer Referral (Viral Loop)

**Step 1: Customer Shares**
- Customer navigates to "Refer a Friend" or "Share" in app
- System generates customer's unique referral link:
 - URL: `https://campcard.app/r/CUST-X7Y9` (contains customer ID + root Scout ID)
 - QR code also generated
- Customer shares via:
 - SMS, email (native share sheet)
 - Social media (pre-filled message: "Save money locally and support Scouts! Get Camp Card: [link]")
 - In-person QR code display

**Step 2: Referred Customer Clicks**
- New customer (recipient) clicks link
- Lands on same landing page as Step 2.1
- Sees: "Referred by [Customer First Name]"
- Proceeds through sign-up flow (same as 2.2)

**Step 3: Attribution Chain**
- System tracks:
 - `direct_referrer_id` = sharing customer ID
 - `root_referrer_scout_id` = original Scout ID (from sharing customer's attribution)
- On subscription creation:
 - Scout gets credit for indirect referral
 - Sharing customer may get bonus (e.g., "$5 credit after 3 referrals"  optional incentive)

**Viral Loop Metrics:**
- Track referral depth (1st degree, 2nd degree, etc.)
- Cap attribution chain at configurable depth (e.g., 5 levels max to prevent abuse)

---

### 2.6 Journey Flow: Geo-Targeted Notifications (Opt-In)

**Step 1: Enable Location Notifications**
- Customer navigates to Settings  Notifications
- Sees toggle: "Notify me about nearby offers"
- Taps toggle  OS permission prompt: "Allow Camp Card to use your location?"
- Customer grants "While Using" or "Always" permission
- System:
 - Stores consent in `CustomerPreferences` (location_notifications: true)
 - Registers device for geofence monitoring

**Step 2: Geofence Configuration (Backend)**
- For each merchant location with active offers:
 - Create circular geofence (lat/lng, radius from merchant config)
 - Register with notification service (AWS SNS, OneSignal, etc.)

**Step 3: Customer Enters Geofence**
- Customer drives/walks within radius (e.g., 0.25 mi of merchant)
- Device detects geofence entry  triggers event
- Backend receives geofence event:
 - Check throttling rules:
 - Max 3 notifications per customer per day
 - Min 4 hours since last notification from this merchant
 - Customer hasn't redeemed this offer today
 - If allowed:
 - Send push notification: "You're near [Merchant Name]! 20% off in-store today."
 - Create `NotificationEvent` record (for analytics)

**Step 4: Customer Engages**
- Customer taps notification  deep link to offer details
- Proceeds to redemption flow (2.4)

**Analytics Tracked:**
- Geofence entries (total, per merchant)
- Notifications sent (count, throttled count)
- Notification open rate
- Redemptions within X minutes of notification (conversion)

---

### 2.7 Journey Flow: Subscription Management

**View Subscription Status**
- Customer navigates to Account  Subscription
- Sees:
 - Plan name and price
 - Next billing date
 - Payment method (last 4 digits)
 - Auto-renew status
 - Total savings to date (calculated from redemptions)
 - Scout attribution: "Supporting [Scout Name], Troop [Number]"

**Update Payment Method**
- Customer taps "Update Payment"
- Enters new card or selects alternate method
- System updates via payment gateway

**Cancel Subscription**
- Customer taps "Cancel Subscription"
- Show retention screen:
 - "You've saved $X this year!"
 - "Your support helps [Scout Name] attend summer camp"
 - Offer downgrade: "Switch to monthly instead?"
- If customer confirms:
 - Set `cancel_at_period_end = true` (subscription active until current period ends)
 - Send confirmation email
 - Notify Scout (via troop leader) of cancellation (for follow-up outreach)

**Reactivate Subscription**
- If canceled/expired, show "Reactivate" button
- Customer selects plan  payment  reactivated
- Attribution to original Scout preserved if within grace period (e.g., 90 days)

---

## 3. SCOUT JOURNEY

### 3.1 Scout Account Setup (Troop Leader Action)

**Context:** Scouts do NOT self-register. Troop leaders create Scout accounts.

**Step 1: Troop Leader Adds Scout**
- Troop leader logs into web portal  Troop Roster
- Clicks "Add Scout"
- Enters:
 - Scout first name (required)
 - Scout last initial (optional, for disambiguation)
 - Parent/guardian email (required for notifications)
 - Grade or age (optional, for reporting)
- System:
 - Generates unique Scout ID (UUID)
 - Creates Scout record (linked to troop + council)
 - Sends email to parent: "Your Scout is enrolled in the Camp Card program. View dashboard: [link]"

**Step 2: Parent/Guardian Access**
- Parent receives email, clicks link
- Creates parent account (or signs in if existing customer)
- Gains view-only access to Scout dashboard (see 3.2)

---

### 3.2 Scout Dashboard (View-Only Metrics)

**Access:**
- Scout (via parent login) or troop leader can view
- URL: `/scouts/{scout_id}/dashboard`

**Dashboard Sections:**

**A. Referral Performance**
| Metric | Value | Description |
|--------|-------|-------------|
| **Link Clicks** | 47 | Total clicks on Scout's unique link/QR |
| **Direct Subscribers** | 12 | Customers who subscribed directly via Scout's link |
| **Indirect Subscribers** | 8 | Customers referred by Scout's direct customers (viral) |
| **Total Subscribers** | 20 | Sum of direct + indirect |
| **Conversion Rate** | 25.5% | Direct subscribers / link clicks |
| **Estimated Fundraising** | $240 | Total revenue attributed (council share varies) |

**B. Referral Link & QR Code**
- Display Scout's unique URL: `https://campcard.app/s/SCOUT-A3F9X2`
- QR code image (downloadable)
- CTA: "Share Your Link" (native share sheet)

**C. Marketing Materials**
- "Print Posters" button:
 - Generates PDF with Scout's QR + name + troop
 - Templates: 8.5x11 flyer, door hanger, business card size
 - Bulk print option: "Print all posters for troop" (troop leader only)

**D. Recent Activity Feed**
- "Sarah P. subscribed! +$30 fundraising" (2 hours ago)
- "John shared your link" (1 day ago)
- "Amy R. redeemed an offer" (3 days ago)

**E. Leaderboard (Optional, Gamification)**
- "Top Sellers in [Troop Name]"
- Rank, Scout name, subscriber count
- Scout's rank highlighted

---

### 3.3 Scout Sharing Flow (Simple, Age-Appropriate)

**Step 1: Scout Opens App/Dashboard**
- (Via parent login on mobile or tablet)
- Big button: "Share My Link"

**Step 2: Choose Share Method**
- SMS to contacts (parent approval required for minors)
- Email
- Copy link (to paste in text/social)
- Show QR code full-screen (for in-person sharing)

**Step 3: Pre-Filled Message**
- "Hi! I'm raising money for my Scout troop. Get local deals and help me go to camp! [link]"
- Parent can edit before sending

**Step 4: Track Click**
- When recipient clicks, system logs click event
- Updates Scout dashboard "Link Clicks" metric

---

## 4. TROOP LEADER JOURNEY

### 4.1 Troop Leader Onboarding

**Step 1: Council Admin Invites Troop Leader**
- Council admin navigates to Troops  Add Troop Leader
- Enters email, assigns to troop
- System sends invitation email

**Step 2: Troop Leader Accepts Invitation**
- Clicks link, creates account (sets password)
- Reviews onboarding checklist:
 - Add Scouts to roster
 - Configure troop info (meeting times, contact)
 - Review fundraising goals

---

### 4.2 Troop Roster Management

**View Roster**
- List of all Scouts in troop:
 - Name, parent email, subscriber count, fundraising total
 - Actions: Edit, View Dashboard, Deactivate

**Add/Edit/Remove Scouts**
- Add: see 3.1
- Edit: update name, parent email
- Deactivate: Scout leaves troop  preserves historical data, stops new attributions

---

### 4.3 POS Claim Link Generation (Critical Workflow)

**Step 1: Navigate to "Sell a Card"**
- Troop leader portal  Tools  Sell a Card (or prominent CTA on dashboard)

**Step 2: Enter Sale Details**
- Form fields:
 - **Scout seller:** Dropdown (troop roster)
 - **Subscription plan:** Dropdown (Annual $30, Monthly $5, etc.)
 - **Customer name (optional):** First name for personalization
 - **Delivery method:**
 - Generate link only (copy to clipboard)
 - Send SMS (enter phone number)
 - Send email (enter email address)
 - Print receipt (PDF with QR)

**Step 3: Generate Claim Link**
- System:
 - Creates `Entitlement` record:
 - `id`: UUID
 - `council_id`, `troop_id`, `scout_id`
 - `plan_id`
 - `claim_token`: unique code (e.g., `CLM-A3F9X2B8`)
 - `status`: PENDING_CLAIM
 - `expires_at`: NOW + 30 days
 - `created_by`: troop leader ID
 - Generates URL: `https://campcard.app/claim/CLM-A3F9X2B8`
 - Generates QR code PNG

**Step 4: Deliver to Customer**
- **Copy link:** Clipboard notification, leader shares manually
- **SMS:** System sends: "Thanks for supporting [Troop Name]! Activate: [link]"
- **Email:** System sends formatted email with CTA button
- **Print:** PDF receipt:
 ```
 
  BSA CAMP CARD 
  Central Florida Council 
  
  [QR CODE] 
  
  Claim Code: CLM-A3F9X2B8 
  Scan or visit: 
  campcard.app/claim/... 
  
  Sold by: [Scout Name] 
  Troop: [Number] 
  Plan: Annual - $30 
 
 ```

**Step 5: Track POS Sales**
- Troop leader dashboard shows:
 - "Pending Claims" table: Scout, Plan, Claim Code, Sent Date, Status
 - Status: Pending (not claimed), Claimed (activated), Expired

---

### 4.4 Troop Dashboard & Reporting

**Dashboard Sections:**

**A. Troop Performance Summary**
- Total subscribers (all Scouts): 87
- Total fundraising: $2,610
- Active campaigns: 2
- Top seller: Emily R. (23 subscribers)

**B. Scout Performance Table**
| Scout Name | Direct | Indirect | Total | Fundraising | Actions |
|------------|--------|----------|-------|-------------|---------|
| Emily R. | 18 | 5 | 23 | $690 | View Dashboard |
| Jake M. | 14 | 3 | 17 | $510 | View Dashboard |
| Sarah P. | 11 | 2 | 13 | $390 | View Dashboard |
| ... | ... | ... | ... | ... | ... |

**C. Recent Activity**
- Real-time feed of subscriptions, redemptions, claims

**D. Export & Print**
- "Export Roster CSV" (for offline tracking)
- "Print All Posters" (bulk PDF generation for all Scouts)

---

## 5. COUNCIL ADMIN JOURNEY

### 5.1 Initial Setup

**Step 1: System Admin Creates Council Tenant**
- National admin provisions new council:
 - Council name, region, contact info
 - Subdomain: `centralflorida.campcard.app`
 - Branding: logo upload, color overrides (optional)

**Step 2: Council Admin Account**
- System admin invites first council admin
- Council admin signs in, completes profile

---

### 5.2 Merchant Onboarding

**Step 1: Add Merchant**
- Navigate to Merchants  Add Merchant
- Form:
 - Business name
 - Category (Dining, Retail, etc.)
 - Logo upload
 - Website URL
 - Contact: name, email, phone

**Step 2: Add Merchant Locations**
- For each physical location:
 - Address (street, city, state, ZIP)
 - Latitude/longitude (auto-geocoded or manual)
 - Geofence radius (meters, default 250m)
 - Hours of operation

**Step 3: Merchant Status**
- Save as Draft or Publish
- Published merchants appear in app

---

### 5.3 Offer Management

**Step 1: Create Offer**
- Navigate to Offers  Create Offer
- Form:
 - Merchant (dropdown)
 - Offer title: "20% off entire purchase"
 - Description: Full terms and conditions
 - Category (maps to merchant category)
 - Valid dates: start and end
 - Usage limit: One-time per customer OR Unlimited
 - Participating locations: Select subset or "All locations"
 - Redemption method: Show-to-cashier OR Code validation

**Step 2: Offer Lifecycle**
- States: Draft  Active  Expired
- Active offers appear in customer app
- Expired offers auto-hide after end date

---

### 5.4 Campaign Management

**Step 1: Create Campaign**
- Campaigns group offers for seasonal pushes (e.g., "Fall Fundraiser 2025")
- Form:
 - Campaign name
 - Start and end dates
 - Associated offers (multi-select)
 - Active/Inactive toggle

**Step 2: Activate Campaign**
- Toggle to Active  all associated offers become visible
- Deactivate  offers hidden (without deleting)

---

### 5.5 Subscription Plan Configuration

**Step 1: Define Plans**
- Navigate to Settings  Subscription Plans
- Add/edit plans:
 - Plan name: "Annual"
 - Price: $29.99
 - Billing interval: Year
 - Trial period: 7 days (optional)
 - Auto-renew: Default ON

**Step 2: Pricing Tiers (Optional)**
- Family plan: up to 5 members
- Student discount: 20% off with verification

---

### 5.6 Council Dashboard & Reporting

**A. Executive Summary**
- Total active subscribers: 1,243
- Total fundraising (current period): $37,290
- Active troops: 52
- Active merchants: 38
- Active offers: 147

**B. Troop Performance**
- Table: Troop, Scouts, Subscribers, Fundraising
- Sort/filter by region or performance

**C. Merchant & Offer Analytics**
- Redemptions per merchant
- Top offers by usage
- Offer expiration warnings

**D. Subscriber Analytics**
- New vs. returning
- Churn rate
- Cohort retention curves

**E. Geo Analytics (if enabled)**
- Geofence events by location
- Notification  redemption conversion

**F. Campaign Performance**
- Campaign, Date Range, Subscribers Gained, Revenue

---

## 6. NATIONAL ADMIN JOURNEY

### 6.1 Cross-Council Dashboard

**Access:** SYSTEM_ADMIN role only

**A. Multi-Council Rollup**
- Total councils: 25
- Total subscribers: 31,450
- Total fundraising: $943,500
- System health: API uptime, error rates

**B. Council Comparison Table**
| Council | Troops | Scouts | Subscribers | Fundraising | Avg per Scout |
|---------|--------|--------|-------------|-------------|---------------|
| Central FL | 52 | 487 | 1,243 | $37,290 | $76.54 |
| Bay Area | 38 | 312 | 891 | $26,730 | $85.67 |
| ... | ... | ... | ... | ... | ... |

**C. Benchmarking**
- Top performing councils (by subscribers per Scout)
- Offer redemption rates by category
- Customer lifetime value by council

---

### 6.2 System Configuration

**Tenant Management:**
- Provision new councils
- Deactivate councils
- Assign council admins

**Global Settings:**
- Feature flags (enable/disable geo-notifications, POS integration)
- Default subscription plans (councils can override)
- Branding templates

---

### 6.3 Audit & Compliance

**Audit Log Viewer:**
- Filter by council, user, action type, date range
- Download CSV for compliance reports

**Youth Data Review:**
- Report on Scout PII collected (should be minimal)
- Parent consent status

---

## 7. FUNCTIONAL REQUIREMENTS MAPPING

### 7.1 Customer Acquisition & Onboarding (FR-001 to FR-015)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-001 | Scout QR code entry point | 2.1, 2.2 | P0 (MVP) |
| FR-002 | Short website link entry | 2.1, 2.2 | P0 (MVP) |
| FR-003 | Scout unique affiliate link | 2.2, 3.3 | P0 (MVP) |
| FR-004 | "How it works" messaging | 2.2 onboarding | P0 (MVP) |
| FR-005 | In-app purchase flow | 2.2 | P0 (MVP) |
| FR-006 | Third-party POS purchase | 2.3, 4.3 | P1 (V1) |
| FR-007 | POS claim link generation | 4.3 | P1 (V1) |
| FR-008 | POS API for entitlement creation | 2.3, Part 5 API | P1 (V1) |
| FR-009 | Claim token redemption | 2.3 Step 4 | P1 (V1) |
| FR-010 | Multiple subscription plans | 2.2 Step 4, 5.5 | P0 (MVP) |
| FR-011 | Auto-renew with opt-out | 2.7 | P0 (MVP) |
| FR-012 | Payment method management | 2.7 | P0 (MVP) |
| FR-013 | Account creation (email/password) | 2.2 Step 3 | P0 (MVP) |
| FR-014 | Social login (Google, Apple) | 2.2 Step 3 | P2 (V2) |
| FR-015 | Account recovery (forgot password) | 2.2 (implicit) | P0 (MVP) |

### 7.2 Offer Browsing & Redemption (FR-016 to FR-030)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-016 | Offer list/grid view | 2.4 Step 1 | P0 (MVP) |
| FR-017 | Filter by category | 2.4 Step 1 | P0 (MVP) |
| FR-018 | Filter by proximity | 2.4 Step 1 | P0 (MVP) |
| FR-019 | Offer details screen | 2.4 Step 2 | P0 (MVP) |
| FR-020 | Show usage limits (one-time/unlimited) | 2.4 Step 2 | P0 (MVP) |
| FR-021 | Display valid dates | 2.4 Step 2 | P0 (MVP) |
| FR-022 | Multiple merchant locations | 2.4 Step 2 | P0 (MVP) |
| FR-023 | Map view of locations | 2.4 Step 2 | P1 (V1) |
| FR-024 | Activate offer (generate code) | 2.4 Step 3 | P0 (MVP) |
| FR-025 | Show-to-cashier redemption | 2.4 Step 4 Option A | P0 (MVP) |
| FR-026 | Merchant scan/entry validation | 2.4 Step 4 Option B | P1 (V1) |
| FR-027 | Enforce one-time usage | 2.4 Step 4 | P0 (MVP) |
| FR-028 | Redemption history | 2.4 Step 5, 2.7 | P0 (MVP) |
| FR-029 | Estimated savings calculation | 2.7 | P0 (MVP) |
| FR-030 | Expired subscription blocking | 2.4 Step 3 | P0 (MVP) |

### 7.3 Referral & Attribution (FR-031 to FR-045)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-031 | Scout affiliate link generation | 3.2 Section B | P0 (MVP) |
| FR-032 | Scout QR code generation | 3.2 Section B | P0 (MVP) |
| FR-033 | Referral token in URL | 2.2 Step 1 | P0 (MVP) |
| FR-034 | Direct referral attribution | 2.2 Step 3 | P0 (MVP) |
| FR-035 | Customer referral link generation | 2.5 Step 1 | P1 (V1) |
| FR-036 | Indirect referral attribution | 2.5 Step 3 | P1 (V1) |
| FR-037 | Root Scout preservation | 2.5 Step 3, Part 4 | P1 (V1) |
| FR-038 | Click tracking | 3.3 Step 4 | P1 (V1) |
| FR-039 | Conversion rate calculation | 3.2 Section A | P0 (MVP) |
| FR-040 | Referral chain depth limit | 2.5 (5 levels) | P1 (V1) |
| FR-041 | Scout change during sign-up | 2.2 Step 3 | P1 (V1) |
| FR-042 | Attribution expiry (90-day grace) | 2.7 | P1 (V1) |
| FR-043 | Anti-fraud click spam detection | Part 4 | P2 (V2) |
| FR-044 | POS sale attribution to Scout | 2.3, 4.3 | P1 (V1) |
| FR-045 | Bulk poster generation | 3.2 Section C | P0 (MVP) |

### 7.4 Dashboards & Reporting (FR-046 to FR-070)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-046 | Scout dashboard: direct subscribers | 3.2 Section A | P0 (MVP) |
| FR-047 | Scout dashboard: indirect subscribers | 3.2 Section A | P1 (V1) |
| FR-048 | Scout dashboard: link clicks | 3.2 Section A | P1 (V1) |
| FR-049 | Scout dashboard: conversion rate | 3.2 Section A | P0 (MVP) |
| FR-050 | Scout dashboard: fundraising total | 3.2 Section A | P0 (MVP) |
| FR-051 | Scout dashboard: recent activity | 3.2 Section D | P0 (MVP) |
| FR-052 | Scout dashboard: print posters | 3.2 Section C | P0 (MVP) |
| FR-053 | Troop leader: roster performance | 4.4 Section B | P0 (MVP) |
| FR-054 | Troop leader: troop totals | 4.4 Section A | P0 (MVP) |
| FR-055 | Troop leader: pending claims | 4.3 Step 5 | P1 (V1) |
| FR-056 | Troop leader: export CSV | 4.4 Section D | P0 (MVP) |
| FR-057 | Troop leader: bulk print | 4.4 Section D | P0 (MVP) |
| FR-058 | Council: executive summary | 5.6 Section A | P0 (MVP) |
| FR-059 | Council: troop performance table | 5.6 Section B | P0 (MVP) |
| FR-060 | Council: merchant analytics | 5.6 Section C | P1 (V1) |
| FR-061 | Council: subscriber analytics | 5.6 Section D | P1 (V1) |
| FR-062 | Council: geo analytics | 5.6 Section E | P2 (V2) |
| FR-063 | Council: campaign performance | 5.6 Section F | P1 (V1) |
| FR-064 | National: cross-council rollup | 6.1 Section A | P2 (V2) |
| FR-065 | National: council comparison | 6.1 Section B | P2 (V2) |
| FR-066 | National: benchmarking | 6.1 Section C | P2 (V2) |
| FR-067 | Customer: subscription status | 2.7 | P0 (MVP) |
| FR-068 | Customer: next billing date | 2.7 | P0 (MVP) |
| FR-069 | Customer: total savings | 2.7 | P0 (MVP) |
| FR-070 | Customer: redemption history | 2.4 Step 5 | P0 (MVP) |

### 7.5 Admin & Configuration (FR-071 to FR-090)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-071 | Merchant CRUD | 5.2 | P0 (MVP) |
| FR-072 | Merchant location management | 5.2 Step 2 | P0 (MVP) |
| FR-073 | Merchant logo upload | 5.2 Step 1 | P0 (MVP) |
| FR-074 | Offer CRUD | 5.3 | P0 (MVP) |
| FR-075 | Offer state: Draft/Active/Expired | 5.3 Step 2 | P0 (MVP) |
| FR-076 | Campaign CRUD | 5.4 | P1 (V1) |
| FR-077 | Campaign activation toggle | 5.4 Step 2 | P1 (V1) |
| FR-078 | Subscription plan configuration | 5.5 | P0 (MVP) |
| FR-079 | Plan pricing tiers | 5.5 Step 2 | P1 (V1) |
| FR-080 | Council branding (logo, colors) | 5.1 Step 1 | P2 (V2) |
| FR-081 | Troop roster management | 4.2 | P0 (MVP) |
| FR-082 | Scout account creation (leader) | 3.1 | P0 (MVP) |
| FR-083 | Parent/guardian email storage | 3.1 Step 1 | P0 (MVP) |
| FR-084 | Troop leader invitation | 4.1 | P0 (MVP) |
| FR-085 | Council tenant provisioning | 6.2 | P2 (V2) |
| FR-086 | Feature flags (global) | 6.2 | P2 (V2) |
| FR-087 | Audit log viewer | 6.3 | P1 (V1) |
| FR-088 | Youth data compliance report | 6.3 | P1 (V1) |
| FR-089 | Failed payment retry logic | 2.7 (implicit) | P0 (MVP) |
| FR-090 | Past due  inactive status | 2.7 (implicit) | P0 (MVP) |

### 7.6 Geo-Notifications (FR-091 to FR-100)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-091 | Location permission request | 2.6 Step 1 | P1 (V1) |
| FR-092 | Opt-in toggle | 2.6 Step 1 | P1 (V1) |
| FR-093 | Geofence radius configuration | 5.2 Step 2 | P1 (V1) |
| FR-094 | Geofence entry detection | 2.6 Step 3 | P1 (V1) |
| FR-095 | Throttling: max per day | 2.6 Step 3 | P1 (V1) |
| FR-096 | Throttling: merchant cooldown | 2.6 Step 3 | P1 (V1) |
| FR-097 | Push notification delivery | 2.6 Step 3 | P1 (V1) |
| FR-098 | Notification deep link | 2.6 Step 4 | P1 (V1) |
| FR-099 | Geofence analytics: events | 2.6 Analytics | P1 (V1) |
| FR-100 | Geofence analytics: conversion | 2.6 Analytics | P1 (V1) |

### 7.7 Privacy & Accessibility (FR-101 to FR-110)

| FR ID | Requirement | Journey Reference | Priority |
|-------|-------------|-------------------|----------|
| FR-101 | Minimal Scout PII collection | 3.1, Part 1 | P0 (MVP) |
| FR-102 | Adult customer accounts only | 2.2 Step 3 | P0 (MVP) |
| FR-103 | Parent consent for Scout notifications | 3.1 Step 2 | P0 (MVP) |
| FR-104 | WCAG AA contrast compliance | Part 7 | P0 (MVP) |
| FR-105 | Simple language (age 514) | Part 7 | P0 (MVP) |
| FR-106 | Large tap targets (mobile) | Part 7 | P0 (MVP) |
| FR-107 | Clear error messages | All journeys | P0 (MVP) |
| FR-108 | Accessible focus states | Part 7 | P0 (MVP) |
| FR-109 | Screen reader support | Part 7 | P1 (V1) |
| FR-110 | Terms of Service consent | 2.2 Step 3 | P0 (MVP) |

---

## 8. EDGE CASES & ERROR HANDLING

### 8.1 Scout Attribution Edge Cases

| Scenario | Handling |
|----------|----------|
| Customer changes mind about Scout | Allow Scout change during sign-up; log change in audit trail |
| Scout leaves troop mid-season | Preserve attribution for existing subscribers; stop new attributions |
| Scout transfers to new troop | Admin can reassign Scout; historical data follows Scout |
| Customer subscribes twice (different emails) | Treat as separate accounts; both attributed to same Scout |
| Claim link expired | Show error + contact info for troop leader to regenerate |
| Claim link already used | Block reuse; show error; log potential fraud attempt |

### 8.2 Payment & Subscription Errors

| Scenario | Handling |
|----------|----------|
| Payment declined during sign-up | Show error; allow retry or alternate payment method |
| Payment fails on renewal | Retry 3 times over 7 days; email customer; mark PAST_DUE; deactivate after 7 days |
| Customer disputes charge | Admin can refund; subscription canceled; notify Scout/troop |
| Subscription canceled mid-period | Remains active until period end; no refund; offers still accessible |

### 8.3 Redemption Errors

| Scenario | Handling |
|----------|----------|
| Subscription inactive during redemption | Block redemption; prompt to renew |
| Offer expired | Hide from browse; block redemption if code generated before expiry |
| One-time offer already used | Show "Used" badge; block code generation |
| Merchant location closed | Display "Temporarily unavailable" if hours API integrated |
| Network offline during redemption | Show cached offers; queue redemption for sync (V2 feature) |

---

## 9. ACCEPTANCE CRITERIA EXAMPLES

### 9.1 Customer In-App Purchase (FR-005)

**Given:** Customer scans Scout's QR code and lands on landing page
**When:** Customer completes sign-up and payment flow
**Then:**
- Subscription record created with status ACTIVE
- Payment record created with transaction ID
- ReferralAttribution record links customer to Scout
- Scout dashboard updates with +1 direct subscriber
- Customer receives confirmation email within 1 minute
- Customer can immediately browse and redeem offers

### 9.2 POS Claim Link Generation (FR-007)

**Given:** Troop leader is logged in with TROOP_LEADER role
**When:** Leader generates claim link for Scout "Emily R." with Annual plan
**Then:**
- Entitlement record created with unique claim token
- Claim URL contains token: `https://campcard.app/claim/CLM-XXXXXX`
- QR code generated and downloadable as PNG
- Leader can send SMS/email or print receipt
- Claim token expires in 30 days (configurable)

### 9.3 Scout Dashboard Metrics (FR-046, FR-050)

**Given:** Scout "Jake M." has 5 direct subscribers and 2 indirect subscribers
**When:** Parent views Jake's dashboard
**Then:**
- Direct subscribers displays: 5
- Indirect subscribers displays: 2
- Total subscribers displays: 7
- Fundraising total displays: $210 (7 * $30)
- Conversion rate calculated from link clicks (if tracked)

---

## 10. OPEN QUESTIONS & DECISIONS NEEDED

### 10.1 POS Integration

| Question | Options | Recommendation |
|----------|---------|----------------|
| Should we integrate with specific POS systems? | A) Generic API only, B) Pre-built integrations (Square, Clover) | **A** for MVP; **B** for V2 |
| How to reconcile offline POS sales? | A) Manual entry, B) CSV upload, C) Real-time API | **A** for MVP; **C** for V1 |
| Who tracks cash/check payments? | A) Troop leader, B) Council admin | **A** (troop leader responsibility) |

### 10.2 Referral Attribution

| Question | Options | Recommendation |
|----------|---------|----------------|
| Max referral chain depth? | 3 levels, 5 levels, unlimited | **5 levels** (balance viral growth and fraud) |
| Attribution window after link click? | 7 days, 30 days, 90 days | **30 days** (industry standard) |
| Can customer change Scout after purchase? | Yes (anytime), Yes (within 7 days), No | **Yes (within 7 days)** for errors only |

### 10.3 Geo-Notifications

| Question | Options | Recommendation |
|----------|---------|----------------|
| Default geofence radius? | 0.1 mi, 0.25 mi, 0.5 mi | **0.25 mi** (2-3 minute walk) |
| Throttling: max notifications per day? | 3, 5, 10 | **3** (avoid spam) |
| Merchant cooldown period? | 2 hours, 4 hours, 24 hours | **4 hours** |

### 10.4 Subscription Plans

| Question | Options | Recommendation |
|----------|---------|----------------|
| Default plan pricing? | $19.99, $29.99, $39.99 | **Council configurable** (varies by region) |
| Family plan: how to share? | Single account, multiple sub-accounts | **Multiple sub-accounts** (each with own email) |
| Student discount verification? | Honor system, Email verification, ID upload | **Email verification** (.edu address) |

### 10.5 Youth Safety

| Question | Options | Recommendation |
|----------|---------|----------------|
| Min age for Scout account? | 5, 10, 13 | **5** (Cub Scouts), but parent-supervised |
| Should Scouts have login credentials? | Yes (supervised), No (parent login only) | **No** (parent login only for security) |
| Public Scout leaderboard? | Yes (first name + last initial), No (anonymous ranks) | **Yes** (first name only, no last name) |

---

**END OF PART 2**

**Next:** Part 3  Architecture & Deployment (EC2-Based)
