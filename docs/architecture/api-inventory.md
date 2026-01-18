# Camp Card API Inventory

**Version:** 1.0
**Last Updated:** January 2026
**Base URL:** `https://bsa.swipesavvy.com/api/v1`
**Swagger UI:** `http://localhost:7010/swagger-ui.html`

## Overview

The Camp Card backend API consists of 18 REST controllers providing 150+ endpoints across authentication, user management, organizational hierarchy, merchants, offers, subscriptions, payments, campaigns, and notifications.

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `NATIONAL_ADMIN` | System administrator | Full access |
| `COUNCIL_ADMIN` | Council administrator | Council-level access |
| `UNIT_LEADER` | Troop/unit leader | Troop-level access |
| `PARENT` | Parent/guardian | Family subscription access |
| `SCOUT` | Scout member | Personal QR code, referrals |

---

## 1. Authentication Controller

**Base Path:** `/api/v1/auth`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/register` | No | - | Register new user |
| POST | `/login` | No | - | Login (returns JWT) |
| POST | `/mobile/login` | No | - | Mobile app login |
| POST | `/refresh` | No | - | Refresh JWT token |
| POST | `/logout` | No | - | Logout (invalidate token) |
| POST | `/forgot-password` | No | - | Request password reset |
| POST | `/reset-password` | No | - | Reset password with token |
| POST | `/verify-email` | No | - | Verify email with token |
| GET | `/me` | Yes | Any | Get current user profile |
| POST | `/change-password` | Yes | Any | Change password |
| PUT | `/profile` | Yes | Any | Update user profile |

### Request/Response DTOs

**RegisterRequest:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string?",
  "role": "SCOUT|PARENT|UNIT_LEADER",
  "unitType": "PACK|BSA_TROOP_BOYS|...",
  "unitNumber": "string?"
}
```

**LoginRequest:**
```json
{
  "email": "string",
  "password": "string"
}
```

**AuthResponse:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": { ... }
}
```

---

## 2. User Controller

**Base Path:** `/api/v1/users`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | NATIONAL_ADMIN | List all users (paginated) |
| GET | `/search` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Search users |
| GET | `/{id}` | No | - | Get user by ID |
| POST | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Create user |
| PUT | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, Self | Update user |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN | Delete user |
| GET | `/council/{councilId}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Users by council |
| GET | `/troop/{troopId}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Users by troop |
| GET | `/troop/{troopId}/scouts` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Scouts in troop |
| PATCH | `/{userId}/assign-troop/{troopId}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Assign user to troop |
| DELETE | `/{userId}/troop` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Remove from troop |
| GET | `/scouts/unassigned` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Unassigned scouts |

---

## 3. Council Controller

**Base Path:** `/api/v1/councils` or `/api/v1/organizations`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Create council |
| GET | `/` | No | - | List councils (paginated) |
| GET | `/{id}` | No | - | Get council by ID |
| GET | `/number/{councilNumber}` | No | - | Get by council number |
| GET | `/uuid/{uuid}` | No | - | Get by UUID |
| PUT | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Update council |
| PATCH | `/{id}/status` | Yes | NATIONAL_ADMIN | Change council status |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN | Delete council |
| GET | `/stats` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Council statistics |
| POST | `/{id}/update-stats` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Recalculate stats |

### Request/Response DTOs

**CouncilRequest:**
```json
{
  "councilNumber": "string",
  "name": "string",
  "shortName": "string?",
  "region": "NORTHEAST|SOUTHEAST|CENTRAL|SOUTHERN|WESTERN",
  "streetAddress": "string?",
  "city": "string?",
  "state": "string?",
  "zipCode": "string?",
  "phone": "string?",
  "email": "string?",
  "websiteUrl": "string?",
  "scoutExecutiveName": "string?",
  "scoutExecutiveEmail": "string?",
  "campCardCoordinatorName": "string?",
  "campCardCoordinatorEmail": "string?",
  "goalAmount": 0.00
}
```

---

## 4. Troop Controller

**Base Path:** `/api/v1/troops`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Create troop |
| PUT | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Update troop |
| GET | `/{id}` | No | - | Get troop by ID |
| GET | `/number/{troopNumber}` | No | - | Get by troop number |
| GET | `/` | No | - | List troops (paginated) |
| GET | `/council/{councilId}` | No | - | Troops by council |
| GET | `/top-performers` | No | - | Top performing troops |
| PATCH | `/{id}/status` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Change troop status |
| POST | `/{id}/update-stats` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Recalculate stats |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN | Delete troop |

---

## 5. Scout Controller

**Base Path:** `/api/v1/scouts`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | No | - | Create scout |
| PUT | `/{id}` | No | - | Update scout |
| GET | `/{id}` | No | - | Get scout by ID |
| GET | `/user/{userId}` | No | - | Get scout by user ID |
| GET | `/troop/{troopId}/roster` | No | - | Troop roster |
| GET | `/search` | No | - | Search scouts |
| GET | `/top-sellers` | No | - | Top selling scouts |
| POST | `/{id}/record-sale` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER, SCOUT | Record sale |
| PATCH | `/{id}/rank` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Update rank |
| PATCH | `/{id}/status` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Change status |
| POST | `/{id}/transfer` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Transfer to troop |
| POST | `/mark-top-sellers` | Yes | NATIONAL_ADMIN | Mark top sellers |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Delete scout |

---

## 6. Merchant Controller

**Base Path:** `/api/v1/merchants`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | No | - | Create merchant |
| GET | `/` | No | - | List merchants |
| GET | `/{merchantId}` | No | - | Get merchant by ID |
| GET | `/category/{category}` | No | - | Merchants by category |
| PUT | `/{merchantId}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Update merchant |
| POST | `/{merchantId}/approve` | Yes | NATIONAL_ADMIN | Approve merchant |
| PATCH | `/{merchantId}/status` | Yes | NATIONAL_ADMIN | Change status |
| DELETE | `/{merchantId}` | Yes | NATIONAL_ADMIN | Delete merchant |
| POST | `/{merchantId}/locations` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Add location |
| GET | `/{merchantId}/locations` | No | - | List locations |
| GET | `/locations/nearby` | No | - | Nearby locations |
| GET | `/stats` | Yes | NATIONAL_ADMIN | Merchant statistics |

---

## 7. Offer Controller

**Base Path:** `/api/v1/offers`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Create offer |
| PUT | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Update offer |
| GET | `/{id}` | No | - | Get offer by ID |
| GET | `/` | No | - | List offers |
| GET | `/active` | No | - | Active offers |
| GET | `/active/user/{userId}` | No | - | Active offers for user |
| GET | `/featured` | No | - | Featured offers |
| GET | `/category/{category}` | No | - | Offers by category |
| GET | `/merchant/{merchantId}` | No | - | Offers by merchant |
| POST | `/{id}/pause` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Pause offer |
| POST | `/{id}/resume` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Resume offer |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Delete offer |
| POST | `/redeem` | Yes | Any | Redeem offer |
| POST | `/verify/{verificationCode}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Verify redemption |
| GET | `/redemptions/user/{userId}` | No | - | User redemptions |
| GET | `/redemptions/merchant/{merchantId}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Merchant redemptions |

---

## 8. Subscription Controller

**Base Path:** `/api/v1`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/subscription-plans` | No | - | List subscription plans |
| POST | `/subscriptions` | Yes | Any | Create subscription |
| GET | `/subscriptions/me` | Yes | Any | Get my subscription |
| PATCH | `/subscriptions/me` | Yes | Any | Update subscription |
| POST | `/subscriptions/me/reactivate` | Yes | Any | Reactivate subscription |
| POST | `/subscriptions/me/renew` | Yes | Any | Renew subscription |
| DELETE | `/subscriptions/me` | Yes | Any | Cancel subscription |

---

## 9. Payment Controller

**Base Path:** `/api/v1/payments`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/charge` | Yes | SCOUT, PARENT, UNIT_LEADER, COUNCIL_ADMIN | Process payment |
| POST | `/refund` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Process refund |
| POST | `/transaction/details` | Yes | Any | Get transaction details |
| POST | `/subscribe/charge` | No | - | Subscription charge |
| POST | `/subscribe/token` | No | - | Get payment token |
| POST | `/subscribe/complete` | No | - | Complete subscription |
| GET | `/subscribe/verify/{transactionId}` | No | - | Verify payment |

### Request/Response DTOs

**ChargeRequest:**
```json
{
  "amount": 25.00,
  "cardNumber": "4111111111111111",
  "expirationDate": "12/25",
  "cardCode": "123",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "description": "string?"
}
```

**SubscriptionPurchaseRequest:**
```json
{
  "planId": 1,
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "transactionId": "string",
  "referralCode": "string?"
}
```

---

## 10. Campaign Controller

**Base Path:** `/api/v1/campaigns`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/` | No | - | Create campaign |
| GET | `/` | No | - | List campaigns |
| GET | `/{id}` | No | - | Get campaign by ID |
| GET | `/uuid/{uuid}` | No | - | Get by UUID |
| PUT | `/{id}` | No | - | Update campaign |
| PATCH | `/{id}/status` | No | - | Change status |
| DELETE | `/{id}` | No | - | Delete campaign |
| POST | `/saved` | No | - | Save campaign draft |
| GET | `/saved` | No | - | List saved campaigns |
| GET | `/saved/{id}` | No | - | Get saved campaign |
| GET | `/saved/favorites` | No | - | Favorite campaigns |
| PUT | `/saved/{id}` | No | - | Update saved campaign |
| DELETE | `/saved/{id}` | No | - | Delete saved campaign |
| POST | `/saved/{id}/create` | No | - | Create from saved |
| GET | `/segments` | No | - | Marketing segments |
| POST | `/ai/generate` | No | - | Generate AI content |
| POST | `/ai/generate/variations` | No | - | Generate variations |
| POST | `/ai/modify` | No | - | Modify AI content |
| POST | `/ai/optimize` | No | - | Optimize content |
| POST | `/ai/suggest` | No | - | Get suggestions |
| GET | `/ai/analyze/segment/{segmentId}` | No | - | Analyze segment |
| GET | `/{id}/ai/predict` | No | - | Predict performance |
| POST | `/ai/agent/task` | No | - | AI agent task |

---

## 11. Dashboard Controller

**Base Path:** `/api/v1/dashboard`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Dashboard data |
| GET | `/summary` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Dashboard summary |
| GET | `/troop-sales` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Troop sales data |
| GET | `/troop-recruiting` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Recruiting data |
| GET | `/scout-sales` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Scout sales |
| GET | `/scout-referrals` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Scout referrals |
| GET | `/customer-referrals` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Customer referrals |
| GET | `/sales-trend` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER | Sales trends |

---

## 12. QR Code Controller

**Base Path:** `/api/v1`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/users/me/qr-code` | Yes | Any | Get my QR code |
| GET | `/users/{userId}/qr-code` | Yes | COUNCIL_ADMIN, NATIONAL_ADMIN | Get user QR code |
| POST | `/offers/generate-link` | Yes | Any | Generate shareable link |
| GET | `/offers/link/{uniqueCode}` | No | - | Resolve shareable link |
| GET | `/qr/validate/{uniqueCode}` | No | - | Validate QR code |

---

## 13. Referral Controller

**Base Path:** `/api/v1/referrals`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/my-code` | Yes | Any | Get my referral code |
| POST | `/apply` | No | - | Apply referral code |
| GET | `/my-referrals` | Yes | Any | List my referrals |
| POST | `/{referralId}/claim` | Yes | Any | Claim referral reward |

---

## 14. Notification Controller

**Base Path:** `/api/v1/notifications`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/register-token` | Yes | Any | Register device token |
| DELETE | `/unregister-token/{token}` | Yes | Any | Unregister token |
| POST | `/send` | Yes | COUNCIL_ADMIN, NATIONAL_ADMIN | Send notification |
| GET | `/me` | Yes | Any | Get my notifications |
| GET | `/me/unread-count` | Yes | Any | Unread count |
| PUT | `/{id}/read` | Yes | Any | Mark as read |
| PUT | `/mark-all-read` | Yes | Any | Mark all read |

---

## 15. Location Controller

**Base Path:** `/api/v1/location`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/geocode` | No | - | Geocode address |
| GET | `/reverse-geocode` | No | - | Reverse geocode |
| GET | `/search` | No | - | Search places |
| GET | `/search/merchants` | No | - | Search merchants |
| GET | `/suggestions` | No | - | Place suggestions |
| GET | `/place/{placeId}` | No | - | Get place details |
| GET | `/route` | No | - | Get route |
| GET | `/route/driving` | No | - | Driving route |
| GET | `/route/walking` | No | - | Walking route |
| GET | `/distance` | No | - | Calculate distance |
| POST | `/distances` | No | - | Batch distances |
| POST | `/device/{deviceId}/position` | No | - | Update device position |
| GET | `/device/{deviceId}/position` | No | - | Get device position |
| POST | `/geofence/merchant/{merchantId}` | No | - | Create geofence |
| DELETE | `/geofence/merchant/{merchantId}` | No | - | Remove geofence |
| GET | `/geofences` | No | - | List geofences |

---

## 16. Camp Cards Controller

**Base Path:** `/api/v1/camp-cards`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | List camp cards |
| GET | `/{id}` | Yes | NATIONAL_ADMIN, COUNCIL_ADMIN | Get camp card |
| DELETE | `/{id}` | Yes | NATIONAL_ADMIN | Delete camp card |

---

## 17. Analytics Controller

**Base Path:** `/api/v1/analytics`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/wallet` | Yes | Any | Wallet analytics |

---

## 18. Health Controller

**Base Path:** `/api/v1/public`

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/health` | No | - | Health check |
| GET | `/ping` | No | - | Ping |

---

## Error Response Format

All API errors follow a consistent format:

```json
{
  "timestamp": "2026-01-17T12:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'",
  "path": "/api/v1/users"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Test Credentials

| Environment | Email | Password | Role |
|-------------|-------|----------|------|
| Production | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Production | test@campcard.org | Password123 | SCOUT |

## Authorize.Net Test Cards

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111111111111111 | 12/25 | 123 | Approved |
| 4222222222222 | 12/25 | 123 | Declined |
