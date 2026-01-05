# Camp Card - Quick Access Guide

## Running Now

### Web Portal
**URL:** http://localhost:3003
**Status:** Running with all data visible

---

##  Pages & What You'll See

### Dashboard
**URL:** http://localhost:3003/dashboard
- Overview metrics
- Scout counts
- Card statistics
- Subscription info

### Users Management
**URL:** http://localhost:3003/users
- 100 users with photos/details
- Search & filter by role
- Admin, Council Admin, Troop Leader, Scout roles
- Status indicators (Active/Inactive)

### Merchants
**URL:** http://localhost:3003/merchants
- **100+ locations from 30+ merchants**
 - Pizza Palace: 8 locations
 - Burger Barn: 6 locations
 - CinemaMax: 5 locations
 - QuickLube Express: 4 locations
 - Plus 70 single-location merchants
- Search by name
- Filter by category (DINING, RETAIL, AUTO, ENTERTAINMENT)
- Multi-location hierarchy visible

### Councils & Troops
**URL:** http://localhost:3003/councils
- **10 major BSA councils**
 - Central Florida, Orange County, Dallas Area, Georgia-Carolina, Greater New York, Chicago Area, Pacific Skyline, Rocky Mountain, Washington Area, Greater Boston
- **300 troops** (30 per council)
- Scout counts per troop
- Expandable details
- Status indicators

### Offers Management
**URL:** http://localhost:3003/offers
- **25 total offers**
 - **12 One-Time Use** (1X_USE)
 - Examples: "20% off Pizza", "Free Large Drink", "$10 off Movie Tickets"
 - **13 Reusable** (REUSABLE)
 - Examples: "10% off Total Bill", "Free Upgrade to Large", "$5 off Any Purchase"
- Each offer includes:
 - Unique barcode (e.g., 5901234123457)
 - Placeholder image
 - Redemption count
 - Expiry date
 - Merchant association
- Search & filter by type
- Merchant association visible

### Camp Cards
**URL:** http://localhost:3003/camp-cards
- **100 camp cards**
 - 70 ACTIVE
 - 15 PENDING_CLAIM
 - 15 EXPIRED
- Issued via:
 - Gateway Purchase (customer paid)
 - Claim Link (troop leader issued)
- Details:
 - Cardholder name
 - Masked card number
 - Status badges
 - Issue/expiry dates
 - Claim tokens for pending

### Analytics
**URL:** http://localhost:3003/analytics
- Metrics dashboard
- Customizable metric selection
- Trends and data visualization

### Subscriptions
**URL:** http://localhost:3003/subscriptions
- Subscription metrics
- Plan distribution
- Revenue tracking
- Churn analysis

---

## Data Summary

### Users (100 total)
```
 2 Admins
 5 Council Admins
 10 Troop Leaders
 5 Named Scouts
 78 Additional users
```

### Geographic Coverage
```
 10 Councils
 300 Troops
 4,350+ Scouts
```

### Merchants & Offers
```
 100+ Merchant Locations
 30+ Unique Merchants
 25 Promotions
 - 12 Single-use
 - 13 Reusable
```

### Cards Issued
```
 100 Camp Cards
 65 Gateway Purchases
 35 Claim Link Issued
```

---

## Demo Highlights

### Show Multi-Location Merchant Support
Go to: http://localhost:3003/merchants
- Click on "Pizza Palace HQ"
- Show 8 locations across Florida
- Explain HQ + branch structure

### Show Diverse Offers
Go to: http://localhost:3003/offers
- Scroll through 25 offers
- Show mix of 1x-use vs reusable
- Show barcodes (e.g., 5901234123457)
- Show redemption counts

### Show Organizational Scale
Go to: http://localhost:3003/councils
- Expand a council
- Show 30 troops per council
- Show scout distribution
- Demonstrate 300 troops total

### Show User Management
Go to: http://localhost:3003/users
- Filter by Admin role
- Filter by Troop Leader
- Show 100 total users
- Demonstrate search capability

### Show Card Issuance Rules
Go to: http://localhost:3003/camp-cards
- Show ACTIVE cards (gateway purchase)
- Show PENDING_CLAIM (from claim links)
- Explain business rules

---

##  Technical Info

### Shared Mock Data
**File:** `/shared-mock-data.ts`
```
- Available to both web and mobile
- Single source of truth
- Includes images and barcodes
```

### Web App Mock Services
**Files:**
- `/repos/camp-card-web/lib/mockData.ts` - Web-specific mock data
- `/repos/camp-card-web/lib/api.ts` - API with fallback

### Mobile App Mock Services
**Files:**
- `/repos/camp-card-mobile/src/services/mockDataService.ts` - NEW
- `/repos/camp-card-mobile/src/services/offerService.ts` - Updated with fallback

---

## What Works Without Backend

All pages work completely without a backend server:
- [x] Merchants (100+ with hierarchy)
- [x] Councils & Troops (10 + 300)
- [x] Offers (25 with barcodes)
- [x] Users (100 with roles)
- [x] Cards (100 with statuses)
- [x] Search & filtering
- [x] Multi-location support
- [x] Image display

---

##  Quick Commands

### To Stop Server
```bash
pkill -f "npm run dev"
```

### To Restart Server
```bash
cd repos/camp-card-web
npm run dev
```

### To Check Port
```bash
lsof -i :3003
```

---

##  Ready For

- Executive demos
- Stakeholder presentations
- User acceptance testing
- Mobile app development
- Backend integration (when ready)
- Performance testing

---

##  Start Here

**Main URL:** http://localhost:3003

Begin at Dashboard or Merchants page for best visual impact.

All data is visible, realistic, and professional. No backend needed!

---

**Status:** Everything Working
**Last Updated:** December 27, 2025
**All Pages:** Visible & Functional
