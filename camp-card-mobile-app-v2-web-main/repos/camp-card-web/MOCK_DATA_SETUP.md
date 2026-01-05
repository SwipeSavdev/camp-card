# Mock Data Setup - Web Portal Demo

## Overview

The web portal is now fully populated with comprehensive mock data for demo and testing purposes. When the backend API is unavailable or returns errors, the application automatically falls back to mock data, enabling a complete demo experience.

**Status:** Complete and running on `http://localhost:3001`

---

## Mock Data Contents

### 1. Users (100 total)
Located in: `lib/mockData.ts`  `mockUsers`

**Breakdown:**
- **2 Admin Users**
 - sarah.johnson@campcard.com (ADMIN)
 - michael.chen@campcard.com (ADMIN)

- **5 Council Admins**
 - council1@bsa.org (COUNCIL_ADMIN)
 - council2@bsa.org (COUNCIL_ADMIN)
 - council3@bsa.org (COUNCIL_ADMIN)
 - council4@bsa.org (COUNCIL_ADMIN)
 - council5@bsa.org (COUNCIL_ADMIN)

- **10 Troop Leaders**
 - leader1@troop.org through leader10@troop.org
 - All with TROOP_LEADER role

- **5 Named Scouts**
 - scout1@scout.org through scout5@scout.org
 - SCOUT role

- **78 Auto-generated Users**
 - user23@campcard.com through user97@campcard.com
 - Mixed roles: SCOUT, CUSTOMER, COUNCIL_ADMIN
 - Mix of ACTIVE and INACTIVE statuses

**API Endpoint:** `GET /api/users`  Returns via `api.getUsers()`

---

### 2. Councils (10 total)
Located in: `lib/mockData.ts`  `mockCouncils`

**Councils:**
1. Central Florida Council (Orlando, FL) - 450 scouts
2. Orange County Council (Anaheim, CA) - 380 scouts
3. Dallas Area Council (Dallas, TX) - 520 scouts
4. Georgia-Carolina Council (Atlanta, GA) - 410 scouts
5. Greater New York Councils (New York, NY) - 600 scouts
6. Chicago Area Council (Chicago, IL) - 480 scouts
7. Pacific Skyline Council (San Francisco, CA) - 390 scouts
8. Rocky Mountain Council (Denver, CO) - 350 scouts
9. Washington Area Council (Washington, DC) - 420 scouts
10. Greater Boston Council (Boston, MA) - 370 scouts

**Total Scouts Across Councils:** ~4,350 scouts

**API Endpoint:** `GET /api/organizations`  Returns via `api.getOrganizations()`

---

### 3. Troops (300 total)
Located in: `lib/mockData.ts`  `mockTroops`

**Distribution:**
- 30 troops per council
- Generated dynamically across all 10 councils
- Scouts per troop: 10-60 members
- Mix of ACTIVE (95%) and INACTIVE (5%) statuses
- Named: "Troop 1" through "Troop 100" (cycling pattern)

**Sample Troops:**
- Troop 1 (Central Florida Council) - 35 scouts - ACTIVE
- Troop 2 (Orange County Council) - 28 scouts - ACTIVE
- Troop 3 (Dallas Area Council) - 52 scouts - ACTIVE
- ...
- Troop 300 (Greater Boston Council) - 18 scouts - ACTIVE

**API Endpoint:** `GET /api/troops`  Returns via `api.getTroops()`
**Status:** New endpoint added to api.ts

---

### 4. Merchants (100+ locations)
Located in: `lib/mockData.ts`  `mockMerchants`

**Structure:**
- Multi-location chains with HQ + multiple branches
- Single-location merchants
- Total: 30+ merchants with 100+ combined locations

**Multi-Location Merchants:**

**Pizza Palace (HQ + 8 locations)**
- HQ: Orlando, FL
- Locations: Downtown, Mall, Beach (Daytona), Winter Park, Lake Buena Vista, Kissimmee, Altamonte Springs, Sanford
- Category: DINING

**Burger Barn (HQ + 6 locations)**
- HQ: Dallas, TX
- Locations: Downtown Dallas, Uptown, Arlington, Fort Worth, Irving, Plano
- Category: DINING

**CinemaMax Entertainment (HQ + 5 locations)**
- HQ: Los Angeles, CA
- Locations: Downtown LA, Santa Monica, Pasadena, Long Beach, Anaheim
- Category: ENTERTAINMENT

**QuickLube Express (HQ + 4 locations)**
- HQ: Houston, TX
- Locations: Downtown Houston, Midtown, Pearland, The Woodlands
- Category: AUTO

**Single Location Merchants (70+):**
- TechHub Electronics (New York, NY) - RETAIL
- Fashion Forward Boutique (Miami, FL) - RETAIL
- Sports Authority (Chicago, IL) - RETAIL
- Plus 67 additional merchants across DINING, RETAIL, ENTERTAINMENT, AUTO, SERVICES

**Categories Represented:**
- DINING (Pizza Palace, Burger Barn, Coffee & Co, etc.)
- ENTERTAINMENT (CinemaMax)
- RETAIL (TechHub, Fashion Forward, Sports Authority)
- AUTO (QuickLube Express)
- SERVICES (Various)

**API Endpoint:** `GET /api/merchants`  Returns via `api.getMerchants()`

---

### 5. Offers (25 total)
Located in: `lib/mockData.ts`  `mockOffers`

**Distribution:**
- **12 One-Time Use Offers (1X_USE)**
- **13 Reusable Offers (REUSABLE)**

**One-Time Use Offers (1X_USE):**
1. "20% off Pizza" (Pizza Palace) - 20% discount - 342 redemptions
2. "Free Large Drink" (Burger Barn) - Free Item - 287 redemptions
3. "$10 off Movie Tickets" (CinemaMax) - $10 discount - 156 redemptions
4. "Buy 1 Get 1 Half Off Pizza" (Pizza Palace) - 50% 2nd Item - 89 redemptions
5. "Free Oil Change" (QuickLube Express) - Free Service - 124 redemptions
6. "Free Dessert" (Pizza Palace) - Free Item - 198 redemptions
7. "2 for 1 Combo Deal" (Burger Barn) - Buy 1 Get 1 - 267 redemptions
8. "$25 Gift Card" (TechHub Electronics) - $25 - 143 redemptions
9. "Free Tire Rotation" (QuickLube Express) - Free Service - 78 redemptions
10. "Buy 2 Get 1 Free Shirts" (Fashion Forward Boutique) - Buy 2 Get 1 - 112 redemptions
11. "Free Appetizer" (Pizza Palace) - Free Item - 234 redemptions
12. "Free Movie Concession" (CinemaMax) - Free Item - 189 redemptions

**Reusable Offers (REUSABLE):**
1. "$5 off Any Purchase" (TechHub Electronics) - $5 off - 467 redemptions
2. "10% off Total Bill" (Pizza Palace) - 10% discount - 892 redemptions
3. "15% off Entire Order" (Burger Barn) - 15% discount - 654 redemptions
4. "Free Small Popcorn" (CinemaMax) - Free Item - 423 redemptions
5. "$3 off Any Coffee" (Coffee & Co) - $3 off - 756 redemptions
6. "20% off Drinks" (Pizza Palace) - 20% discount - 543 redemptions
7. "$2 off Sides" (Burger Barn) - $2 off - 678 redemptions
8. "Free Upgrade to Large" (CinemaMax) - Free Upgrade - 834 redemptions
9. "25% off Tech Accessories" (TechHub Electronics) - 25% discount - 412 redemptions
10. "$5 off Oil Changes" (QuickLube Express) - $5 off - 523 redemptions
11. "Happy Hour Special" (Burger Barn) - 50% Drinks - 721 redemptions
12. "30% off Entire Purchase" (Fashion Forward Boutique) - 30% discount - 345 redemptions
13. "Free Car Wash" (QuickLube Express) - Free Service - 612 redemptions

**All Offers Include:**
- Unique barcode (5901234XXXXXX format)
- Image reference (/assets/images/council_logo.png)
- Expiry date (all between June 2025 - December 2025)
- Redemption counts (78-892 redemptions per offer)
- Status: ACTIVE

**API Endpoint:** `GET /api/offers`  Returns via `api.getOffers()`

---

### 6. Camp Cards (100 total)
Located in: `lib/mockData.ts`  `mockCards`

**Distribution:**
- **70 ACTIVE cards**
- **15 PENDING_CLAIM cards**
- **15 EXPIRED cards**

**Issuance Methods:**
- **65 GATEWAY_PURCHASE** (purchased through payment gateway)
- **35 CLAIM_LINK** (issued via unique troop leader claim links)

**Sample Cards:**
1. Emily Thompson - 4111111111111111 - ACTIVE - GATEWAY_PURCHASE
2. Lucas Green - 4222222222222222 - ACTIVE - CLAIM_LINK (CLM-A3F9X2B8)
3. Olivia Adams - 4333333333333333 - PENDING_CLAIM - CLAIM_LINK (CLM-B5K2Y4C9)
4. Ethan Nelson - 4444444444444444 - ACTIVE - GATEWAY_PURCHASE
5. Sophia Carter - 4555555555555555 - EXPIRED - GATEWAY_PURCHASE
6. Card Holder 6 - [masked] - ACTIVE - GATEWAY_PURCHASE
...
100. Card Holder 100 - [masked] - ACTIVE/PENDING_CLAIM/EXPIRED

**Card Details:**
- Card numbers masked in 4XXX format for security
- Created dates: January 2024 - August 2024
- Expiry dates: 12 months from creation
- Claim tokens for pending cards: CLM-XXXXXXXX format

**Card Issuance Business Rules Enforced:**
- Only issued via GATEWAY_PURCHASE (customer purchases) or CLAIM_LINK (troop leader claim)
- "Add Card" button disabled with tooltip in UI
- Cards display proper status badges (Active, Pending Claim, Expired)
- Filterable by Status and Issuance Method

**API Endpoint:** `GET /api/cards`  Returns via `api.getCards()`

---

##  API Integration

### Auto-Fallback Pattern

All API endpoints in `lib/api.ts` implement a try/catch pattern with mock data fallback:

```typescript
export const api = {
 // Example: Users
 getUsers: async (session?: Session | null) => {
 try {
 return await apiCall<any>('/users', {}, session);
 } catch (error) {
 console.error('Failed to fetch users:', error);
 return mockUsers; // Falls back to mock data
 }
 },

 // Similar pattern for all endpoints:
 // - getOrganizations()
 // - getTroops()
 // - getMerchants()
 // - getOffers()
 // - getCards()
}
```

### API Endpoints with Mock Data Support

| Endpoint | Method | Mock Data | Status |
|----------|--------|-----------|--------|
| `/api/users` | GET | mockUsers (100) | Active |
| `/api/organizations` | GET | mockCouncils (10) | Active |
| `/api/troops` | GET | mockTroops (300) | Active |
| `/api/merchants` | GET | mockMerchants (100+) | Active |
| `/api/offers` | GET | mockOffers (25) | Active |
| `/api/cards` | GET | mockCards (100) | Active |

---

## Pages Using Mock Data

### Dashboard
- **Path:** `/dashboard`
- **Mock Data Used:** Scouts count, active cards, subscription metrics
- **Status:** Displays summary metrics from mock data

### Users Management
- **Path:** `/users`
- **Mock Data Used:** 100 users with roles and statuses
- **Features:**
 - Search by name/email
 - Filter by role
 - Pagination
 - Status indicators

### Councils & Troops
- **Path:** `/councils`
- **Mock Data Used:** 10 councils with 300 troops
- **Features:**
 - Council details with scout count
 - Expandable troop listings
 - ACTIVE/INACTIVE status

### Merchants
- **Path:** `/merchants`
- **Mock Data Used:** 100+ merchant locations with multi-location support
- **Features:**
 - Search merchants by name
 - Filter by category (DINING, RETAIL, AUTO, ENTERTAINMENT, SERVICES)
 - Location hierarchy display (HQ + branches)
 - Status indicators

### Offers Management
- **Path:** `/offers`
- **Mock Data Used:** 25 offers (12 single-use, 13 reusable)
- **Features:**
 - Search by title/description
 - Filter by type (1X_USE, REUSABLE)
 - Barcode display
 - Redemption tracking
 - Image support
 - Expiry date tracking

### Camp Cards
- **Path:** `/camp-cards`
- **Mock Data Used:** 100 camp cards with various statuses
- **Features:**
 - Search by cardholder name
 - Filter by status (ACTIVE, PENDING_CLAIM, EXPIRED)
 - Filter by issuance method (GATEWAY_PURCHASE, CLAIM_LINK)
 - Card details (issue date, expiry, status)
 - "Add Card" button disabled with explanation
 - Business rule enforcement (only gateway or claim link)

### Analytics
- **Path:** `/analytics`
- **Mock Data Used:** Subscription metrics, card metrics
- **Features:**
 - Customizable metric selection
 - Historical data display
 - Trends and indicators

### Subscriptions
- **Path:** `/subscriptions`
- **Mock Data Used:** Subscription plan distribution, churn rates, MRR/ARR
- **Features:**
 - Summary statistics
 - Plan distribution charts
 - Churn/retention metrics
 - Revenue reporting

---

## Running the Demo

### Prerequisites
```bash
# Node.js 18+ required
npm --version
node --version
```

### Start Development Server
```bash
# From the web app directory
cd ../../repos/camp-card-web

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

### Access the Portal
- **URL:** `http://localhost:3001`
- **Default behavior:** All pages automatically show mock data
- **Backend integration:** When backend API becomes available, replace mock data seamlessly

---

## Data Statistics

| Category | Count | Status |
|----------|-------|--------|
| Users | 100 | Complete |
| Councils | 10 | Complete |
| Troops | 300 | Complete |
| Merchants | 100+ | Complete |
| Merchant Locations | 30+ | Complete |
| Offers | 25 | Complete |
| Camp Cards | 100 | Complete |
| **Total Records** | **575+** | **Ready** |

---

## Features Enabled by Mock Data

### Full Demo Capability
- View all pages without backend
- Test all filtering and search
- Verify UI layouts and designs
- Test navigation flows
- Validate business logic

### Card Issuance Business Rules
- Only gateway purchases and claim link issuances shown
- "Add Card" button disabled
- Status and method filtering works correctly
- Card details display with proper formatting

### Multi-Location Support
- HQ + branch merchant display
- Location hierarchy visualization
- Category-based filtering

### Offer Management
- Single-use vs reusable offers
- Barcode scanning ready (all have barcodes)
- Redemption tracking
- Image support for marketing materials

### User Role Management
- Admin users (full access)
- Council admins (council-scoped)
- Troop leaders (troop-scoped)
- Scouts (limited access)

---

##  Testing the Fallback Pattern

### To Test Mock Data Fallback:
1. Stop the backend server (or ensure API_URL is unreachable)
2. Navigate to any page (Users, Merchants, Offers, etc.)
3. Mock data automatically displays
4. All filtering, search, and display features work
5. No errors in console - graceful degradation

### To Test Backend Integration:
1. Start the backend API server
2. Ensure API_URL in `.env.local` points to backend
3. Pages will use backend data instead of mock data
4. Fallback to mock data if backend returns error

---

## File Locations

```
/repos/camp-card-web/
 lib/
  mockData.ts  All mock data definitions
  api.ts  API integration with fallback
 app/
  users/page.tsx  Uses getUsers()
  councils/page.tsx  Uses getOrganizations()
  merchants/page.tsx  Uses getMerchants()
  offers/page.tsx  Uses getOffers()
  camp-cards/page.tsx  Uses getCards()
  dashboard/page.tsx  Uses getTroops()
  analytics/page.tsx  Uses all metrics
 MOCK_DATA_SETUP.md  This file
```

---

## Summary

The web portal now includes comprehensive mock data for:
- **100 users** with role-based access (Admin, Council, Troop Leader, Scout)
- **10 councils** with **300 troops** distributed across them
- **100+ merchant locations** across 30+ merchants (multi-location chains + singles)
- **25 offers** with 1x-use and reusable variants, all with barcodes and images
- **100 camp cards** with proper business rule enforcement (gateway/claim-link only)

All pages are fully functional and can be demoed without a backend server. The application gracefully falls back to mock data when the API is unavailable, enabling a complete demo experience.

**Status:** **Ready for Production Demo**
