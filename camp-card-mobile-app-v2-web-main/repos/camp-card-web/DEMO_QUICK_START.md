# Web Portal Demo - Quick Start Guide

## Current Status
- Web portal running at `http://localhost:3001`
- 575+ mock records fully populated
- All pages compiled and functional
- API fallback system active (no backend needed)

---

## Quick Demo Walkthrough

### 1. Dashboard Overview
**URL:** `http://localhost:3001/dashboard`

**What to see:**
- Overview cards showing key metrics
- 100 users across system
- 10 councils with 300 troops
- Scout enrollment numbers
- Subscription metrics
- Active camp cards

---

### 2. Users Management
**URL:** `http://localhost:3001/users`

**Features to test:**
- View all 100 users
- Search by name or email
- Filter by role: Admin, Council Admin, Troop Leader, Scout
- Sort by status (Active/Inactive)
- See user creation dates

**Sample accounts to find:**
- `admin@campcard.com` (Admin)
- `council1@bsa.org` (Council Admin)
- `leader1@troop.org` (Troop Leader)
- `scout1@scout.org` (Scout)

---

### 3. Councils & Troops
**URL:** `http://localhost:3001/councils`

**Features to test:**
- View 10 councils with scout counts
- Expand councils to see 300 troops
- Each troop shows leader name and status
- View 10-60 scouts per troop
- See ACTIVE/INACTIVE status

**Key councils:**
- Central Florida Council - 450 scouts
- Dallas Area Council - 520 scouts
- Greater New York Councils - 600 scouts

---

### 4. Merchants Management
**URL:** `http://localhost:3001/merchants`

**Features to test:**
- View 100+ merchant locations
- Multi-location merchants show HQ + branches:
 - **Pizza Palace**: 8 locations (Orlando HQ)
 - **Burger Barn**: 6 locations (Dallas HQ)
 - **CinemaMax**: 5 locations (LA HQ)
 - **QuickLube Express**: 4 locations (Houston HQ)
 - Plus 70+ single-location merchants
- Filter by category: DINING, RETAIL, AUTO, ENTERTAINMENT, SERVICES
- Search by merchant name
- View location details (city, state, status)

---

### 5. Offers Management
**URL:** `http://localhost:3001/offers`

**Features to test:**
- View all 25 offers
- Filter by type:
 - 12 One-Time Use (1X_USE) offers
 - 13 Reusable (REUSABLE) offers
- See offer details:
 - Title and description
 - Merchant name
 - Discount amount
 - Barcode (e.g., 5901234123457)
 - Redemption count
 - Expiry date
- Search offers by title

**Sample offers:**
- "20% off Pizza" (Pizza Palace) - 1X_USE - 342 redemptions
- "10% off Total Bill" (Pizza Palace) - REUSABLE - 892 redemptions
- "$10 off Movie Tickets" (CinemaMax) - 1X_USE - 156 redemptions
- "Free Upgrade to Large" (CinemaMax) - REUSABLE - 834 redemptions

---

### 6. Camp Cards Management
**URL:** `http://localhost:3001/camp-cards`

**Features to test:**
- View 100 camp cards
- Cards show:
 - Cardholder name
 - Masked card number (4XXX format)
 - Status: ACTIVE, PENDING_CLAIM, or EXPIRED
 - Issuance method: GATEWAY_PURCHASE or CLAIM_LINK
 - Issue date and expiry date
 - Claim token (for pending claims)
- Filter by Status: ACTIVE, PENDING_CLAIM, EXPIRED
- Filter by Method: GATEWAY_PURCHASE, CLAIM_LINK
- Search by cardholder name
- "Add Card" button disabled (business rule enforced)

**Card statuses:**
- 70 ACTIVE cards
- 15 PENDING_CLAIM (awaiting cardholder claim via link)
- 15 EXPIRED (past expiration date)

**Issuance methods:**
- 65 GATEWAY_PURCHASE (customer paid via payment gateway)
- 35 CLAIM_LINK (issued via unique troop leader links)

---

### 7. Analytics Dashboard
**URL:** `http://localhost:3001/analytics`

**Features to test:**
- View multiple metrics categories
- Select from available metrics
- See historical trends
- Metrics include:
 - Total users
 - Active subscriptions
 - Monthly recurring revenue (MRR)
 - Annual recurring revenue (ARR)
 - Card issuances
 - Offer redemptions

---

### 8. Subscriptions Management
**URL:** `http://localhost:3001/subscriptions`

**Features to test:**
- See subscription summary stats
- Plan distribution breakdown
 - Monthly plans
 - Annual plans
- Churn & retention metrics
 - Churn rate
 - Retention rate
 - Trend indicators
- Revenue metrics
 - Monthly recurring revenue (MRR)
 - Annual recurring revenue (ARR)
 - Customer lifetime value (CLV)

---

##  Testing Checklist

Use this checklist to verify the demo is working perfectly:

### Basic Functionality
- [ ] Dashboard loads with summary data
- [ ] All navigation links work
- [ ] Pages load without errors
- [ ] Mock data displays on all pages

### Users Page
- [ ] 100 users visible
- [ ] Search functionality works
- [ ] Role filtering works (Admin, Council, Troop Leader, Scout)
- [ ] Status column shows Active/Inactive

### Councils & Troops
- [ ] 10 councils display
- [ ] Scout counts show per council
- [ ] Councils are expandable
- [ ] 300 troops visible when expanded
- [ ] Troop details show correctly

### Merchants
- [ ] 100+ merchants visible
- [ ] Multi-location merchants show hierarchy
- [ ] Category filtering works (DINING, RETAIL, etc.)
- [ ] Search works by merchant name
- [ ] Status column shows correctly

### Offers
- [ ] 25 offers display
- [ ] Type filtering works (1X_USE vs REUSABLE)
- [ ] Barcodes visible for all offers
- [ ] Redemption counts show
- [ ] Expiry dates display correctly

### Camp Cards
- [ ] 100 cards visible
- [ ] Status filtering works (ACTIVE, PENDING_CLAIM, EXPIRED)
- [ ] Method filtering works (GATEWAY_PURCHASE, CLAIM_LINK)
- [ ] Card numbers properly masked
- [ ] "Add Card" button is disabled with tooltip
- [ ] Dates formatted correctly

### Analytics & Subscriptions
- [ ] Analytics page loads metrics
- [ ] Subscriptions page shows summary stats
- [ ] All metrics have data populated
- [ ] Charts/graphs render properly

---

## Demo Script

### For stakeholders/management:
1. Start at Dashboard - show overview metrics
2. Navigate to Merchants - show multi-location support
3. Go to Offers - show 25 diverse offers with barcodes
4. Show Camp Cards - explain issuance methods and business rules
5. Show Users - demonstrate 100 users with proper roles
6. Show Councils & Troops - demonstrate organizational hierarchy
7. Highlight Analytics & Subscriptions for reporting

**Talking points:**
- "The system manages 10 councils with 300 troops across the country"
- "We have 100+ merchant partners with multi-location support"
- "Card issuance is controlled - only through purchases or claim links"
- "25 diverse offers available for scouts - mix of single-use and reusable"
- "Full role-based access control: Admin, Council, Troop Leader, Scout"
- "Comprehensive analytics and subscription management"

---

##  Troubleshooting

### Page not loading?
1. Verify server is running: `npm run dev` in `/repos/camp-card-web`
2. Check URL is `http://localhost:3001` (not 3000)
3. Open browser DevTools console (F12) for error messages

### Data not showing?
1. Hard refresh page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Check console for API errors
3. Mock data should display automatically if backend unavailable

### Need to restart server?
```bash
# Stop current process (Ctrl+C)
# Then run:
cd ../../repos/camp-card-web
npm run dev
```

---

## Device Testing

The portal is responsive and works on:
- Desktop (Chrome, Safari, Firefox)
- Tablet (iPad, Android tablets)
- Mobile (iPhone, Android phones)

Test by resizing browser window or viewing on actual devices.

---

##  You're Ready!

The web portal demo is fully populated with realistic data and ready for presentation. All 575+ records are available for testing and demonstration.

**Start at:** `http://localhost:3001`
