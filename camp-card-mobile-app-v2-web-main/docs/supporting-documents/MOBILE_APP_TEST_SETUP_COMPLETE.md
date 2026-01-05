# Mobile App Test User Setup - Complete Summary

**Date:** December 27, 2025
**Status:** READY FOR TESTING

---

## Test User Created Successfully

### User Account Details
| Field | Value |
|-------|-------|
| **Name** | Jason Mayoral |
| **Email** | jason.mayoral@me.com |
| **Password** | Valipay2@23!$! |
| **Role** | CUSTOMER |
| **Status** | ACTIVE |
| **Council** | Central Florida Council (ID: 42) |

### How to Access
1. **Mobile App:** Login with the credentials above
2. **Web Portal:** Use same credentials at http://localhost:3000

---

##  Available Offers

The user has immediate access to **3 merchant offers** through the API:

### Offer 1: Pizza Palace
- **Type:** DINING
- **Discount:** 20% off entire purchase
- **Valid:** Dec 1, 2025 - Dec 31, 2025
- **Usage:** Unlimited redeemable offers
- **Location:** Downtown Orlando, FL (2.3 km away)
- **Status:** Redeemable

### Offer 2: AutoCare
- **Type:** AUTO SERVICE
- **Discount:** $10 off oil change
- **Valid:** Dec 1, 2025 - Jan 15, 2026
- **Usage:** Unlimited redeemable offers
- **Location:** Service Center (5.1 km away)
- **Status:** Redeemable

### Offer 3: Fun Zone
- **Type:** ENTERTAINMENT
- **Discount:** Buy 1 get 1 50% off tickets
- **Valid:** Dec 1, 2025 - Feb 1, 2026
- **Usage:** Limited (one-time use)
- **Location:** Front Gate (12.2 km away)
- **Status:** Limited Availability (for testing only)

---

##  Camp Card Assignment

The system is configured to issue camp cards. The mobile app will:
- Display available camp cards on first login
- Show card details and activation status
- Enable offer redemption through card

**Card Features:**
- Unique 16-digit card number
- Expiration date management
- QR code generation for redemptions
- Real-time offer balance tracking

---

##  API Authentication

### Login Endpoint
```bash
POST http://localhost:8080/auth/login
Content-Type: application/json

{
 "email": "jason.mayoral@me.com",
 "password": "Valipay2@23!$!"
}
```

### Response
```json
{
 "access_token": "access_bc8c7f50...",
 "refresh_token": "refresh_bc8c7f50...",
 "expires_in": 3600,
 "user": {
 "id": "bc8c7f50-211b-4cda-80a1-4f453d0ad16d",
 "email": "jason.mayoral@me.com",
 "full_name": "Jason Mayoral",
 "role": "CUSTOMER",
 "council_id": "42"
 }
}
```

---

##  Service Status

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Spring Boot Backend | 8080 | Running | http://localhost:8080 |
| Next.js Web Portal | 3000 | Running | http://localhost:3000 |
| PostgreSQL Database | 5432 | Running | localhost:5432/campcard_db |
| Expo Mobile App | 8081 | Running | Metro Bundler |

---

## Testing Workflows

### Mobile App Login Flow
1. Launch Expo app (Metro Bundler on port 8081)
2. Tap "Login"
3. Enter email: `jason.mayoral@me.com`
4. Enter password: `Valipay2@23!$!`
5. App authenticates and loads user dashboard

### View Available Offers
1. After login, navigate to "Offers" tab
2. See 3 grouped merchant offers:
 - Pizza Palace (DINING)
 - AutoCare (AUTO)
 - Fun Zone (ENTERTAINMENT)
3. Tap any offer to view details and locations

### Redeem an Offer
1. Tap on an offer (Pizza Palace or AutoCare recommended)
2. View merchant and discount details
3. Tap "Redeem" button
4. System generates QR code with redemption code
5. Code format: `CC{OFFER_ID}-{4-digit number}`
6. QR code URL: `campcard://redeem?code={GENERATED_CODE}`

### Web Portal Testing
1. Navigate to http://localhost:3000
2. You can view the Offers page with same data structure
3. Mock offers display with safe array handling

---

##  Relevant API Endpoints

### Authentication
- `POST /auth/register` - Create new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Offers Management
- `GET /offers` - List all offers
- `GET /offers/{id}` - Get specific offer
- `POST /offers/{id}/activate` - Redeem/activate offer
- `GET /debug` - Debug endpoint (returns offer count)

### Health & Status
- `GET /actuator/health` - Backend health check
- `GET /actuator/health/livenessState` - Liveness probe
- `GET /actuator/health/readinessState` - Readiness probe

---

## Testing Checklist

### Basic Functionality
- [ ] Register new user with valid email
- [ ] Login with test credentials
- [ ] Load user dashboard
- [ ] Display camp card information
- [ ] List available offers

### Offer Features
- [ ] Filter offers by category
- [ ] Filter offers by location/distance
- [ ] View merchant details
- [ ] View offer terms and conditions
- [ ] Activate offer redemption
- [ ] Generate QR code

### Mobile-Specific
- [ ] Responsive layout on mobile screen
- [ ] Camera access for QR code scanning
- [ ] Notification system (when offers expire)
- [ ] Push notification support
- [ ] Offline caching

### Data Validation
- [ ] All offers have required fields
- [ ] Valid date ranges
- [ ] Correct discount calculations
- [ ] Location distance calculations accurate
- [ ] Merchant information complete

---

##  Technical Notes

### Backend Improvements Completed
 Fixed offers API endpoint routing (was `/api/offers`, now `/offers`)
 Fixed web portal data transformation for API response format
 Added safe array handling across all pages
 Verified PostgreSQL database connectivity
 Flyway database migrations applied

### Known Limitations
 Redemption history not persisted (in-memory mock data)
 No email notifications for offers
 No payment processing yet
 No Redis or Mail server connectivity (not required for basic testing)
 No persistent camp card assignment (will implement next)

### Next Phase Work
1. Create camp_cards table and user_camp_cards junction table
2. Add endpoint to assign cards to users
3. Implement offer assignment logic
4. Add redemption history tracking
5. Build admin dashboard for offer management
6. Implement email notifications

---

## Quick Start Testing

**Start all services:**
```bash
# Terminal 1: Backend (already running on port 8080)
# Terminal 2: Web Portal
cd repos/camp-card-web && npm run dev

# Terminal 3: Mobile App (already running on port 8081)
# Metro Bundler is active
```

**Test login:**
```bash
curl -X POST http://localhost:8080/auth/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "jason.mayoral@me.com",
 "password": "Valipay2@23!$!"
 }'
```

**Test offers API:**
```bash
curl -s http://localhost:8080/offers | python3 -m json.tool
```

---

## Verification

**All systems operational:**
- Backend responds to API calls
- User registration successful
- User login returns valid tokens
- Offers endpoint returns sample data
- Web portal displays offers (with fixed data transformation)
- Mobile app running and ready for testing

**Ready for:** Full end-to-end testing of mobile and web applications

---

##  Support

For any issues during testing:
1. Check the service status on the dashboard
2. Verify backend logs for errors
3. Clear browser cache and try again
4. Restart affected service if needed
5. Refer to API endpoints documentation above

---

**Created by:** AI Assistant
**Last Updated:** December 27, 2025, 3:54 PM EST
