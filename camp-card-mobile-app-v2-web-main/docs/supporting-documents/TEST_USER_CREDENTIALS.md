# Test User Credentials & Camp Card Setup

**Created:** December 27, 2025

## User Account Created

### User Details
- **Name:** Jason Mayoral
- **Email:** jason.mayoral@me.com
- **Password:** Valipay2@23!$!
- **Role:** CUSTOMER
- **User ID:** 43f8ed30-fcef-4abc-bf79-67d57836e5d2
- **Council ID:** 42 (Default Council)
- **Status:** ACTIVE

## Available Offers

The user has access to the following offers that are available in the system:

### 1. Pizza Palace - 20% off entire purchase
- **Merchant ID:** 45
- **Business Name:** Pizza Palace
- **Category:** DINING
- **Discount:** 20% off entire purchase
- **Valid from:** 2025-12-01
- **Valid until:** 2025-12-31
- **Usage Type:** UNLIMITED
- **Locations:**
 - Downtown, Orlando, FL (123 Main St) - Distance: 2.3 km
- **Redeemable:** YES

### 2. AutoCare - $10 off oil change
- **Merchant ID:** 46
- **Business Name:** AutoCare
- **Category:** AUTO
- **Discount:** $10 off oil change
- **Valid from:** 2025-12-01
- **Valid until:** 2026-01-15
- **Usage Type:** UNLIMITED
- **Locations:**
 - Main Service Location (55 Service Rd) - Distance: 5.1 km
- **Redeemable:** YES

### 3. Fun Zone - Buy 1 get 1 50% off
- **Merchant ID:** 47
- **Business Name:** Fun Zone
- **Category:** ENTERTAINMENT
- **Discount:** Buy 1 get 1 50% off
- **Valid from:** 2025-12-01
- **Valid until:** 2026-02-01
- **Usage Type:** LIMITED (One-time use)
- **Locations:**
 - Front Gate (800 Park Ave) - Distance: 12.2 km
- **Redeemable:** NO (Limited availability for testing)

## Camp Card Assignment

A default camp card is available for this user. The mobile app will:
1. Load available camp cards on login
2. Display redeemable offers
3. Allow offer redemption with generated QR codes

## Testing Instructions

### Mobile App Login Flow
1. Open the Expo mobile app (Metro Bundler running on port 8081)
2. Navigate to the login screen
3. Enter credentials:
 - **Email:** jason.mayoral@me.com
 - **Password:** Valipay2@23!$!
4. App will authenticate and load:
 - User profile
 - Assigned camp cards
 - Available offers

### Testing Offers Page
1. After login, navigate to the Offers section
2. You should see 3 merchant offers grouped by merchant:
 - **Pizza Palace** (DINING) - 20% discount
 - **AutoCare** (AUTO) - $10 off service
 - **Fun Zone** (ENTERTAINMENT) - BOGO offer (limited)

### Testing Offer Redemption
1. Tap on any redeemable offer (Pizza Palace or AutoCare)
2. The app will:
 - Generate a redemption code
 - Display a QR code
 - Show merchant and offer details
3. QR code format: `campcard://redeem?code={GENERATED_CODE}`
4. Redemption codes are valid for 10 minutes

## API Endpoints Reference

### Authentication
- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **Refresh:** `POST /auth/refresh`

### Offers
- **Get All Offers:** `GET /offers`
- **Get Offer Details:** `GET /offers/{id}`
- **Activate/Redeem Offer:** `POST /offers/{id}/activate`

### Backend Services
- **API Base URL:** http://localhost:8080
- **Health Check:** http://localhost:8080/actuator/health
- **Offers Debug:** http://localhost:8080/debug

## Web Portal Access

The web portal can also be used to manage offers:
- **Web Portal:** http://localhost:3000
- **Offers Page:** http://localhost:3000/offers
- Currently displaying mock data with safe array handling

## Technical Notes

- All offers return sample/mock data from the backend
- Redemption codes are generated on-demand with 10-minute expiration
- No database persistence for redemptions yet (mock implementation)
- CORS enabled for localhost cross-origin requests
- Session timeout: 1 hour (3600 seconds)

## Next Steps

To enhance the test setup:
1. User account created
2. Offers available via API
3.  Create database tables for camp_cards and user_camp_cards associations
4.  Implement offer assignment to specific users
5.  Add redemption history tracking
6.  Implement actual payment processing for premium offers

## Testing Notes

**Date Created:** 2025-12-27
**Tested Endpoints:** Auth (register/login), Offers (list/details)
**Status:** Ready for mobile app testing
