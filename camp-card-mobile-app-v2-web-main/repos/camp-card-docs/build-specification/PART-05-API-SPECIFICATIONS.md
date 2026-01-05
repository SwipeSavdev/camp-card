# BSA Camp Card Digitalization Program
## Build Specification  Part 5: API Specifications

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. API OVERVIEW

### 1.1 Design Principles

1. **RESTful:** Resource-oriented URLs, HTTP verbs (GET, POST, PUT, PATCH, DELETE)
2. **Stateless:** No server-side sessions; JWT tokens for authentication
3. **Versioned:** URL versioning (`/api/v1/...`) for backward compatibility
4. **Tenant-Scoped:** All endpoints enforce council isolation via JWT `council_id`
5. **Paginated:** List endpoints return paginated results (cursor or offset-based)
6. **Idempotent:** POST/PUT/PATCH support idempotency keys for safety
7. **HATEOAS-Lite:** Include relevant resource links in responses (optional)

### 1.2 Base URL

**Production:** `https://api.campcard.app/v1`
**Staging:** `https://api-staging.campcard.app/v1`
**Development:** `http://localhost:8080/v1`

### 1.3 Authentication

**Method:** JWT (JSON Web Tokens)

**Request Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Payload:**
```json
{
 "sub": "user-uuid-here",
 "email": "admin@council.org",
 "role": "COUNCIL_ADMIN",
 "council_id": 42,
 "troop_id": 1337,
 "permissions": ["MANAGE_MERCHANTS", "MANAGE_OFFERS"],
 "iat": 1703347200,
 "exp": 1703348100
}
```

**Token Types:**
- **Access Token:** Short-lived (15 min), used for API requests
- **Refresh Token:** Long-lived (7 days), used to obtain new access tokens

**Endpoints:**
- `POST /auth/login`  Returns access + refresh tokens
- `POST /auth/refresh`  Returns new access token
- `POST /auth/logout`  Blacklists refresh token

---

### 1.4 Error Handling

**Standard Error Response:**
```json
{
 "error": {
 "code": "RESOURCE_NOT_FOUND",
 "message": "Merchant with ID 12345 not found",
 "details": {
 "resource_type": "Merchant",
 "resource_id": "12345"
 },
 "request_id": "req-a3f9x2b8",
 "timestamp": "2025-12-23T10:15:30.123Z"
 }
}
```

**HTTP Status Codes:**

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 422 | Unprocessable Entity | Semantic validation error (e.g., invalid date range) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Temporary maintenance or overload |

---

### 1.5 Pagination

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (offset-based) or `cursor` (cursor-based)

**Response:**
```json
{
 "data": [ /* array of resources */ ],
 "pagination": {
 "total": 487,
 "limit": 20,
 "offset": 40,
 "has_more": true,
 "next_cursor": "eyJpZCI6MTIzNDU2fQ=="
 }
}
```

---

### 1.6 Rate Limiting

**Limits (per user/IP):**
- Auth endpoints: 5 req/min
- Read endpoints (GET): 100 req/min
- Write endpoints (POST/PUT/DELETE): 50 req/min
- Admin endpoints: 50 req/min

**Response Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1703347260
```

**Exceeded:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
 "error": {
 "code": "RATE_LIMIT_EXCEEDED",
 "message": "Rate limit exceeded. Try again in 45 seconds."
 }
}
```

---

## 2. AUTHENTICATION & AUTHORIZATION

### 2.1 POST /auth/register
**Purpose:** Create new user account (customers only; admins invited separately)

**Request:**
```json
{
 "email": "customer@example.com",
 "password": "SecureP@ssw0rd",
 "first_name": "John",
 "last_name": "Doe",
 "zip_code": "32801",
 "date_of_birth": "1985-05-15",
 "referral_code": "SCOUT-A3F9X2",
 "consent": {
 "terms_of_service": true,
 "age_18_or_older": true,
 "marketing_emails": false
 }
}
```

**Response (201 Created):**
```json
{
 "user": {
 "id": "user-uuid",
 "email": "customer@example.com",
 "first_name": "John",
 "last_name": "Doe",
 "role": "CUSTOMER",
 "status": "ACTIVE",
 "email_verified": false
 },
 "tokens": {
 "access_token": "eyJhbGci...",
 "refresh_token": "eyJhbGci...",
 "expires_in": 900
 }
}
```

**Validations:**
- Email unique (409 if exists)
- Password min 8 chars, 1 uppercase, 1 number, 1 special
- Age 18+ (calculated from date_of_birth)
- Referral code valid (if provided)

---

### 2.2 POST /auth/login
**Purpose:** Authenticate user and issue tokens

**Request:**
```json
{
 "email": "admin@council.org",
 "password": "SecureP@ssw0rd"
}
```

**Response (200 OK):**
```json
{
 "user": {
 "id": "user-uuid",
 "email": "admin@council.org",
 "role": "COUNCIL_ADMIN",
 "council_id": 42
 },
 "tokens": {
 "access_token": "eyJhbGci...",
 "refresh_token": "eyJhbGci...",
 "expires_in": 900
 }
}
```

**Errors:**
- 401: Invalid credentials
- 403: Account suspended

---

### 2.3 POST /auth/refresh
**Purpose:** Obtain new access token using refresh token

**Request:**
```json
{
 "refresh_token": "eyJhbGci..."
}
```

**Response (200 OK):**
```json
{
 "access_token": "eyJhbGci...",
 "expires_in": 900
}
```

---

### 2.4 POST /auth/logout
**Purpose:** Invalidate refresh token

**Request:**
```json
{
 "refresh_token": "eyJhbGci..."
}
```

**Response (204 No Content)**

---

### 2.5 POST /auth/forgot-password
**Purpose:** Request password reset email

**Request:**
```json
{
 "email": "customer@example.com"
}
```

**Response (200 OK):**
```json
{
 "message": "If this email exists, a reset link has been sent."
}
```

---

### 2.6 POST /auth/reset-password
**Purpose:** Reset password using token from email

**Request:**
```json
{
 "token": "reset-token-from-email",
 "new_password": "NewSecureP@ssw0rd"
}
```

**Response (200 OK):**
```json
{
 "message": "Password reset successful. Please log in."
}
```

---

## 3. CUSTOMER SUBSCRIPTION FLOW

### 3.1 GET /subscription-plans
**Purpose:** List available subscription plans for council

**Auth:** Optional (public endpoint for landing page)

**Query Params:**
- `council_id` (required if not authenticated)

**Response (200 OK):**
```json
{
 "data": [
 {
 "id": 1,
 "uuid": "plan-uuid-1",
 "name": "Monthly",
 "description": "Pay month-to-month, cancel anytime",
 "price_cents": 599,
 "currency": "USD",
 "billing_interval": "MONTHLY",
 "trial_days": 7,
 "features": ["Unlimited offers", "Mobile wallet"]
 },
 {
 "id": 2,
 "uuid": "plan-uuid-2",
 "name": "Annual",
 "description": "Best value! Save 50% with annual billing",
 "price_cents": 2999,
 "currency": "USD",
 "billing_interval": "YEARLY",
 "trial_days": 0,
 "features": ["Unlimited offers", "Mobile wallet", "Family sharing"]
 }
 ]
}
```

---

### 3.2 POST /subscriptions
**Purpose:** Create new subscription (in-app purchase)

**Auth:** Required (CUSTOMER role)

**Request:**
```json
{
 "plan_id": 2,
 "payment_method": {
 "type": "STRIPE",
 "stripe_payment_method_id": "pm_1AbC2dEfGhIjKlMn"
 },
 "referral_code": "SCOUT-A3F9X2",
 "idempotency_key": "idem-a3f9x2b8"
}
```

**Response (201 Created):**
```json
{
 "subscription": {
 "id": "sub-uuid",
 "customer_id": "user-uuid",
 "plan": {
 "id": 2,
 "name": "Annual",
 "price_cents": 2999
 },
 "status": "ACTIVE",
 "current_period_start": "2025-12-23",
 "current_period_end": "2026-12-23",
 "cancel_at_period_end": false
 },
 "payment": {
 "id": "pay-uuid",
 "amount_cents": 2999,
 "status": "SUCCESS",
 "gateway_transaction_id": "ch_1AbC2dEfGhIjKlMn"
 },
 "attribution": {
 "scout": {
 "id": "scout-uuid",
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "attribution_type": "DIRECT"
 }
}
```

**Errors:**
- 400: Invalid payment method
- 402: Payment failed (card declined)
- 409: Customer already has active subscription

---

### 3.3 GET /subscriptions/me
**Purpose:** Get current user's subscription details

**Auth:** Required (CUSTOMER role)

**Response (200 OK):**
```json
{
 "subscription": {
 "id": "sub-uuid",
 "plan": {
 "name": "Annual",
 "price_cents": 2999,
 "billing_interval": "YEARLY"
 },
 "status": "ACTIVE",
 "current_period_start": "2025-12-23",
 "current_period_end": "2026-12-23",
 "next_billing_date": "2026-12-23",
 "cancel_at_period_end": false,
 "payment_method": {
 "type": "CARD",
 "last4": "4242",
 "brand": "VISA",
 "exp_month": 12,
 "exp_year": 2027
 }
 },
 "attribution": {
 "scout": {
 "first_name": "Emily",
 "troop_number": "Troop 101"
 }
 },
 "savings": {
 "total_redemptions": 23,
 "estimated_savings_cents": 18750
 }
}
```

---

### 3.4 PATCH /subscriptions/me
**Purpose:** Update subscription (change plan, update payment method)

**Auth:** Required (CUSTOMER role)

**Request (update payment method):**
```json
{
 "payment_method": {
 "stripe_payment_method_id": "pm_NewCardToken"
 }
}
```

**Request (cancel subscription):**
```json
{
 "cancel_at_period_end": true
}
```

**Response (200 OK):**
```json
{
 "subscription": {
 "id": "sub-uuid",
 "status": "ACTIVE",
 "cancel_at_period_end": true,
 "cancels_at": "2026-12-23"
 }
}
```

---

### 3.5 POST /subscriptions/me/reactivate
**Purpose:** Reactivate canceled or expired subscription

**Auth:** Required (CUSTOMER role)

**Request:**
```json
{
 "payment_method": {
 "stripe_payment_method_id": "pm_1AbC2dEfGhIjKlMn"
 }
}
```

**Response (200 OK):**
```json
{
 "subscription": {
 "id": "sub-uuid",
 "status": "ACTIVE",
 "cancel_at_period_end": false,
 "current_period_end": "2026-12-23"
 }
}
```

---

## 4. OFFER BROWSING & REDEMPTION

### 4.1 GET /offers
**Purpose:** Browse available offers

**Auth:** Optional (public for browsing, subscription validated for redemption)

**Query Params:**
- `council_id` (required if not authenticated)
- `category` (filter: DINING, RETAIL, AUTO, ENTERTAINMENT, SERVICES)
- `latitude` (for proximity sort)
- `longitude` (for proximity sort)
- `radius_km` (default: 10)
- `limit`, `offset`

**Response (200 OK):**
```json
{
 "data": [
 {
 "id": 123,
 "uuid": "offer-uuid-1",
 "merchant": {
 "id": 45,
 "business_name": "Pizza Palace",
 "category": "DINING",
 "logo_url": "https://cdn.campcard.app/logos/45.png"
 },
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout. Excludes alcohol. Cannot be combined with other offers.",
 "category": "DINING",
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "locations": [
 {
 "id": 78,
 "name": "Downtown Location",
 "address": "123 Main St, Orlando, FL 32801",
 "distance_km": 2.3,
 "latitude": 28.5383,
 "longitude": -81.3792
 }
 ],
 "can_redeem": true
 }
 ],
 "pagination": {
 "total": 147,
 "limit": 20,
 "offset": 0,
 "has_more": true
 }
}
```

---

### 4.2 GET /offers/:id
**Purpose:** Get offer details

**Auth:** Optional

**Response (200 OK):**
```json
{
 "offer": {
 "id": 123,
 "uuid": "offer-uuid-1",
 "merchant": {
 "id": 45,
 "business_name": "Pizza Palace",
 "logo_url": "https://cdn.campcard.app/logos/45.png",
 "website_url": "https://pizzapalace.com"
 },
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout. Excludes alcohol. Cannot be combined with other offers.",
 "category": "DINING",
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "redemption_method": "SHOW_CODE",
 "locations": [
 {
 "id": 78,
 "name": "Downtown Location",
 "street_address": "123 Main St",
 "city": "Orlando",
 "state": "FL",
 "zip_code": "32801",
 "latitude": 28.5383,
 "longitude": -81.3792,
 "hours_of_operation": {
 "monday": "11am-10pm",
 "tuesday": "11am-10pm",
 "wednesday": "11am-10pm",
 "thursday": "11am-10pm",
 "friday": "11am-11pm",
 "saturday": "11am-11pm",
 "sunday": "12pm-9pm"
 }
 }
 ],
 "redemptions_count": 1247,
 "user_redemption_count": 3
 }
}
```

---

### 4.3 POST /offers/:id/activate
**Purpose:** Generate redemption code for offer

**Auth:** Required (CUSTOMER role, active subscription)

**Request:**
```json
{
 "location_id": 78
}
```

**Response (201 Created):**
```json
{
 "redemption_code": {
 "id": "code-uuid",
 "code": "1234-5678",
 "qr_code_data": "https://campcard.app/redeem/code-uuid",
 "qr_code_image_url": "https://cdn.campcard.app/qr/code-uuid.png",
 "offer": {
 "title": "20% off entire purchase",
 "merchant": "Pizza Palace"
 },
 "location": {
 "name": "Downtown Location",
 "address": "123 Main St, Orlando, FL 32801"
 },
 "expires_at": "2025-12-23T10:25:30Z",
 "instructions": "Show this code to cashier at checkout"
 }
}
```

**Errors:**
- 403: Subscription inactive or expired
- 409: One-time offer already redeemed
- 422: Offer expired or not yet valid

---

### 4.4 POST /redemptions/validate
**Purpose:** Merchant validates redemption code (merchant-facing)

**Auth:** Required (MERCHANT role or API key)

**Request:**
```json
{
 "code": "1234-5678"
}
```

**Response (200 OK):**
```json
{
 "valid": true,
 "redemption": {
 "offer": {
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout..."
 },
 "customer": {
 "first_name": "John",
 "subscription_status": "ACTIVE"
 }
 },
 "message": "Valid code. Apply discount."
}
```

**Errors:**
- 404: Code not found or expired
- 409: Code already redeemed (one-time offers)

---

### 4.5 POST /redemptions/confirm
**Purpose:** Merchant confirms redemption (marks code as used)

**Auth:** Required (MERCHANT role or API key)

**Request:**
```json
{
 "code": "1234-5678",
 "location_id": 78,
 "estimated_value_cents": 1200
}
```

**Response (201 Created):**
```json
{
 "redemption": {
 "id": "redemption-uuid",
 "code": "1234-5678",
 "offer": {
 "title": "20% off entire purchase"
 },
 "merchant": "Pizza Palace",
 "location": "Downtown Location",
 "estimated_value_cents": 1200,
 "redeemed_at": "2025-12-23T10:20:15Z"
 }
}
```

---

## 5. SCOUT & REFERRAL TRACKING

### 5.1 GET /scouts/:id/dashboard
**Purpose:** Get Scout performance metrics

**Auth:** Required (SCOUT, TROOP_LEADER, COUNCIL_ADMIN roles)

**Response (200 OK):**
```json
{
 "scout": {
 "id": "scout-uuid",
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "metrics": {
 "link_clicks": 47,
 "qr_scans": 23,
 "subscriptions_direct": 12,
 "subscriptions_indirect": 8,
 "subscriptions_total": 20,
 "conversion_rate": 0.255,
 "estimated_fundraising_cents": 24000
 },
 "referral_link": {
 "code": "SCOUT-A3F9X2",
 "url": "https://campcard.app/s/SCOUT-A3F9X2",
 "qr_code_url": "https://cdn.campcard.app/qr/SCOUT-A3F9X2.png"
 },
 "recent_activity": [
 {
 "type": "subscription_created",
 "customer_name": "Sarah P.",
 "attribution_type": "INDIRECT",
 "created_at": "2025-12-22T14:30:00Z"
 },
 {
 "type": "link_clicked",
 "created_at": "2025-12-22T10:15:00Z"
 }
 ],
 "top_referrers": [
 {
 "customer_name": "John D.",
 "indirect_referrals": 3
 }
 ]
}
```

---

### 5.2 POST /scouts/:id/marketing-materials
**Purpose:** Generate printable marketing materials (posters, flyers)

**Auth:** Required (SCOUT, TROOP_LEADER roles)

**Request:**
```json
{
 "template": "POSTER_8x11",
 "quantity": 10
}
```

**Response (200 OK):**
```json
{
 "pdf_url": "https://cdn.campcard.app/posters/scout-uuid/poster-2025-12-23.pdf",
 "expires_at": "2025-12-24T10:15:30Z"
}
```

---

### 5.3 POST /referrals/track-click
**Purpose:** Track referral link click (analytics)

**Auth:** Optional (public endpoint, called from landing page)

**Request:**
```json
{
 "referral_code": "SCOUT-A3F9X2",
 "event_type": "CLICK",
 "metadata": {
 "ip_address": "203.0.113.42",
 "user_agent": "Mozilla/5.0...",
 "referer": "https://facebook.com"
 }
}
```

**Response (204 No Content)**

---

### 5.4 GET /referrals/me/link
**Purpose:** Get or create customer's referral link (viral loop)

**Auth:** Required (CUSTOMER role)

**Response (200 OK):**
```json
{
 "referral_link": {
 "code": "CUST-X7Y9",
 "url": "https://campcard.app/r/CUST-X7Y9",
 "qr_code_url": "https://cdn.campcard.app/qr/CUST-X7Y9.png",
 "root_scout": {
 "first_name": "Emily",
 "troop_number": "Troop 101"
 }
 },
 "stats": {
 "clicks": 5,
 "conversions": 2
 },
 "share_message": "Save money locally and support Scouts! Get Camp Card: https://campcard.app/r/CUST-X7Y9"
}
```

---

## 6. POS INTEGRATION (CRITICAL)

### 6.1 POST /pos/entitlements
**Purpose:** Create POS claim token (troop leader generates)

**Auth:** Required (TROOP_LEADER, COUNCIL_ADMIN roles)

**Request:**
```json
{
 "scout_id": "scout-uuid",
 "plan_id": 2,
 "customer_name": "Amy Thompson",
 "delivery": {
 "method": "SMS",
 "target": "+14075551234"
 },
 "idempotency_key": "pos-sale-123456"
}
```

**Response (201 Created):**
```json
{
 "entitlement": {
 "id": "entitlement-uuid",
 "claim_token": "CLM-A3F9X2B8",
 "claim_url": "https://campcard.app/claim/CLM-A3F9X2B8",
 "qr_code_url": "https://cdn.campcard.app/qr/CLM-A3F9X2B8.png",
 "scout": {
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "plan": {
 "name": "Annual",
 "price_cents": 2999
 },
 "customer_name": "Amy Thompson",
 "expires_at": "2026-01-22T10:15:30Z",
 "status": "PENDING_CLAIM"
 },
 "delivery": {
 "method": "SMS",
 "target": "+14075551234",
 "sent_at": "2025-12-23T10:15:30Z"
 }
}
```

**Errors:**
- 404: Scout not found
- 403: Insufficient permissions (not troop leader for this scout)

---

### 6.2 GET /pos/entitlements/:claim_token
**Purpose:** Lookup claim token details (customer uses this to claim)

**Auth:** Optional (public endpoint)

**Response (200 OK):**
```json
{
 "entitlement": {
 "claim_token": "CLM-A3F9X2B8",
 "scout": {
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "plan": {
 "name": "Annual",
 "price_cents": 2999,
 "billing_interval": "YEARLY"
 },
 "customer_name": "Amy Thompson",
 "expires_at": "2026-01-22T10:15:30Z",
 "status": "PENDING_CLAIM"
 }
}
```

**Errors:**
- 404: Token not found or expired
- 410: Token already claimed

---

### 6.3 POST /pos/entitlements/:claim_token/claim
**Purpose:** Customer claims entitlement and activates subscription

**Auth:** Required (CUSTOMER role, must be logged in)

**Request:**
```json
{
 "user_id": "user-uuid"
}
```

**Response (200 OK):**
```json
{
 "subscription": {
 "id": "sub-uuid",
 "plan": {
 "name": "Annual",
 "price_cents": 2999
 },
 "status": "ACTIVE",
 "current_period_start": "2025-12-23",
 "current_period_end": "2026-12-23",
 "is_pos_purchase": true
 },
 "attribution": {
 "scout": {
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "attribution_type": "DIRECT",
 "attribution_method": "POS_CLAIM"
 }
}
```

**Errors:**
- 404: Token not found
- 409: Token already claimed
- 410: Token expired

---

### 6.4 POST /pos/webhooks (Third-Party POS)
**Purpose:** External POS system creates entitlement via webhook

**Auth:** API Key (in header: `X-API-Key: pos-api-key-here`)

**Request:**
```json
{
 "transaction_id": "pos-txn-abc123",
 "council_id": 42,
 "scout_id": "scout-uuid",
 "plan_id": 2,
 "customer": {
 "name": "Amy Thompson",
 "email": "amy@example.com",
 "phone": "+14075551234"
 },
 "payment": {
 "amount_cents": 3000,
 "method": "CASH"
 },
 "timestamp": "2025-12-23T10:15:30Z"
}
```

**Response (201 Created):**
```json
{
 "entitlement": {
 "id": "entitlement-uuid",
 "claim_token": "CLM-A3F9X2B8",
 "claim_url": "https://campcard.app/claim/CLM-A3F9X2B8",
 "qr_code_url": "https://cdn.campcard.app/qr/CLM-A3F9X2B8.png"
 },
 "webhook_response": {
 "transaction_id": "pos-txn-abc123",
 "status": "SUCCESS",
 "message": "Entitlement created. Customer can claim via URL."
 }
}
```

**Webhook Retry Logic:**
- POS system should retry on 5xx errors (exponential backoff)
- Idempotency: Use `transaction_id` as idempotency key (prevent duplicates)

---

## 7. ADMIN: MERCHANTS & OFFERS

### 7.1 POST /merchants
**Purpose:** Create merchant

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "business_name": "Pizza Palace",
 "category": "DINING",
 "logo_url": "https://cdn.campcard.app/logos/uploaded-logo.png",
 "website_url": "https://pizzapalace.com",
 "contact": {
 "name": "John Smith",
 "email": "john@pizzapalace.com",
 "phone": "+14075555678"
 },
 "status": "DRAFT"
}
```

**Response (201 Created):**
```json
{
 "merchant": {
 "id": 45,
 "uuid": "merchant-uuid",
 "council_id": 42,
 "business_name": "Pizza Palace",
 "category": "DINING",
 "logo_url": "https://cdn.campcard.app/logos/uploaded-logo.png",
 "status": "DRAFT",
 "created_at": "2025-12-23T10:15:30Z"
 }
}
```

---

### 7.2 POST /merchants/:id/locations
**Purpose:** Add merchant location

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "name": "Downtown Location",
 "street_address": "123 Main St",
 "city": "Orlando",
 "state": "FL",
 "zip_code": "32801",
 "latitude": 28.5383,
 "longitude": -81.3792,
 "geofence_radius_meters": 250,
 "hours_of_operation": {
 "monday": "11am-10pm",
 "tuesday": "11am-10pm",
 "wednesday": "11am-10pm",
 "thursday": "11am-10pm",
 "friday": "11am-11pm",
 "saturday": "11am-11pm",
 "sunday": "12pm-9pm"
 }
}
```

**Response (201 Created):**
```json
{
 "location": {
 "id": 78,
 "uuid": "location-uuid",
 "merchant_id": 45,
 "name": "Downtown Location",
 "address": "123 Main St, Orlando, FL 32801",
 "latitude": 28.5383,
 "longitude": -81.3792,
 "status": "ACTIVE"
 }
}
```

---

### 7.3 POST /offers
**Purpose:** Create offer

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "merchant_id": 45,
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout. Excludes alcohol. Cannot be combined with other offers.",
 "category": "DINING",
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "redemption_method": "SHOW_CODE",
 "location_ids": [78, 79],
 "status": "DRAFT"
}
```

**Response (201 Created):**
```json
{
 "offer": {
 "id": 123,
 "uuid": "offer-uuid",
 "merchant_id": 45,
 "title": "20% off entire purchase",
 "status": "DRAFT",
 "created_at": "2025-12-23T10:15:30Z"
 }
}
```

---

### 7.4 PATCH /offers/:id
**Purpose:** Update offer (e.g., activate, extend dates)

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "status": "ACTIVE",
 "valid_until": "2026-01-31"
}
```

**Response (200 OK):**
```json
{
 "offer": {
 "id": 123,
 "status": "ACTIVE",
 "valid_until": "2026-01-31",
 "updated_at": "2025-12-23T10:20:00Z"
 }
}
```

---

### 7.5 GET /merchants
**Purpose:** List merchants (admin)

**Auth:** Required (COUNCIL_ADMIN role)

**Query Params:**
- `status` (filter: DRAFT, ACTIVE, INACTIVE)
- `category`
- `limit`, `offset`

**Response (200 OK):**
```json
{
 "data": [
 {
 "id": 45,
 "business_name": "Pizza Palace",
 "category": "DINING",
 "status": "ACTIVE",
 "locations_count": 2,
 "offers_count": 3
 }
 ],
 "pagination": { /* ... */ }
}
```

---

## 8. ADMIN: TROOPS & SCOUTS

### 8.1 POST /troops
**Purpose:** Create troop

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "troop_number": "Troop 101",
 "troop_type": "TROOP",
 "name": "Orlando Troop 101",
 "meeting_location": "Community Center",
 "meeting_time": "Tuesdays 7pm",
 "fundraising_goal_cents": 500000
}
```

**Response (201 Created):**
```json
{
 "troop": {
 "id": 1337,
 "uuid": "troop-uuid",
 "council_id": 42,
 "troop_number": "Troop 101",
 "troop_type": "TROOP",
 "status": "ACTIVE",
 "created_at": "2025-12-23T10:15:30Z"
 }
}
```

---

### 8.2 POST /troops/:id/scouts
**Purpose:** Add scout to troop (troop leader creates scout account)

**Auth:** Required (TROOP_LEADER, COUNCIL_ADMIN roles)

**Request:**
```json
{
 "first_name": "Emily",
 "last_initial": "R",
 "parent_email": "parent@example.com",
 "parent_phone": "+14075551234",
 "grade_level": 7
}
```

**Response (201 Created):**
```json
{
 "scout": {
 "id": "scout-uuid",
 "troop_id": 1337,
 "first_name": "Emily",
 "last_initial": "R",
 "referral_code": "SCOUT-A3F9X2",
 "referral_url": "https://campcard.app/s/SCOUT-A3F9X2",
 "qr_code_url": "https://cdn.campcard.app/qr/SCOUT-A3F9X2.png",
 "status": "ACTIVE",
 "created_at": "2025-12-23T10:15:30Z"
 },
 "parent_notification": {
 "sent_to": "parent@example.com",
 "message": "Your Scout has been enrolled in the Camp Card program."
 }
}
```

---

### 8.3 GET /troops/:id/scouts
**Purpose:** List scouts in troop

**Auth:** Required (TROOP_LEADER, COUNCIL_ADMIN roles)

**Response (200 OK):**
```json
{
 "data": [
 {
 "id": "scout-uuid",
 "first_name": "Emily",
 "last_initial": "R",
 "referral_code": "SCOUT-A3F9X2",
 "status": "ACTIVE",
 "metrics": {
 "subscriptions_direct": 12,
 "subscriptions_indirect": 8,
 "subscriptions_total": 20,
 "fundraising_cents": 24000
 }
 }
 ]
}
```

---

### 8.4 POST /troops/:id/leaders
**Purpose:** Invite troop leader

**Auth:** Required (COUNCIL_ADMIN role)

**Request:**
```json
{
 "email": "leader@example.com",
 "role": "LEADER"
}
```

**Response (201 Created):**
```json
{
 "invitation": {
 "email": "leader@example.com",
 "troop_id": 1337,
 "status": "PENDING",
 "expires_at": "2026-01-22T10:15:30Z"
 },
 "message": "Invitation email sent to leader@example.com"
}
```

---

## 9. REPORTING & ANALYTICS

### 9.1 GET /reports/scouts/:id/performance
**Purpose:** Detailed Scout performance report

**Auth:** Required (SCOUT, TROOP_LEADER, COUNCIL_ADMIN roles)

**Query Params:**
- `start_date`, `end_date` (date range)

**Response (200 OK):**
```json
{
 "scout": {
 "id": "scout-uuid",
 "first_name": "Emily",
 "troop_number": "Troop 101"
 },
 "period": {
 "start_date": "2025-12-01",
 "end_date": "2025-12-31"
 },
 "metrics": {
 "link_clicks": 47,
 "qr_scans": 23,
 "conversions": 20,
 "conversion_rate": 0.286,
 "subscriptions_direct": 12,
 "subscriptions_indirect": 8,
 "revenue_cents": 24000
 },
 "daily_breakdown": [
 {
 "date": "2025-12-01",
 "clicks": 5,
 "conversions": 2,
 "revenue_cents": 2400
 }
 ]
}
```

---

### 9.2 GET /reports/troops/:id/performance
**Purpose:** Troop-level performance report

**Auth:** Required (TROOP_LEADER, COUNCIL_ADMIN roles)

**Response (200 OK):**
```json
{
 "troop": {
 "id": 1337,
 "troop_number": "Troop 101"
 },
 "summary": {
 "scouts_count": 15,
 "subscriptions_total": 87,
 "revenue_total_cents": 261000,
 "fundraising_goal_cents": 500000,
 "goal_progress_pct": 52.2
 },
 "top_performers": [
 {
 "scout_id": "scout-uuid-1",
 "first_name": "Emily",
 "subscriptions": 20,
 "revenue_cents": 24000
 }
 ],
 "scouts": [
 {
 "scout_id": "scout-uuid-1",
 "first_name": "Emily",
 "subscriptions_direct": 12,
 "subscriptions_indirect": 8,
 "subscriptions_total": 20,
 "revenue_cents": 24000
 }
 ]
}
```

---

### 9.3 GET /reports/council/dashboard
**Purpose:** Council-wide executive dashboard

**Auth:** Required (COUNCIL_ADMIN role)

**Response (200 OK):**
```json
{
 "council": {
 "id": 42,
 "name": "Central Florida Council"
 },
 "summary": {
 "troops_count": 52,
 "scouts_count": 487,
 "customers_count": 1243,
 "subscriptions_active": 1180,
 "revenue_total_cents": 3729000,
 "merchants_count": 38,
 "offers_active": 147
 },
 "growth": {
 "new_customers_last_30_days": 87,
 "churn_rate_pct": 5.2,
 "avg_revenue_per_customer_cents": 3160
 },
 "top_troops": [
 {
 "troop_id": 1337,
 "troop_number": "Troop 101",
 "subscriptions": 87,
 "revenue_cents": 261000
 }
 ],
 "top_offers": [
 {
 "offer_id": 123,
 "merchant_name": "Pizza Palace",
 "title": "20% off entire purchase",
 "redemptions_count": 1247
 }
 ]
}
```

---

### 9.4 GET /reports/national/cross-council
**Purpose:** Cross-council comparison (National admin)

**Auth:** Required (SYSTEM_ADMIN role)

**Response (200 OK):**
```json
{
 "councils": [
 {
 "council_id": 42,
 "name": "Central Florida Council",
 "troops": 52,
 "scouts": 487,
 "customers": 1243,
 "revenue_cents": 3729000,
 "avg_revenue_per_scout_cents": 7654
 },
 {
 "council_id": 43,
 "name": "Bay Area Council",
 "troops": 38,
 "scouts": 312,
 "customers": 891,
 "revenue_cents": 2673000,
 "avg_revenue_per_scout_cents": 8567
 }
 ],
 "totals": {
 "councils": 25,
 "troops": 1247,
 "scouts": 12450,
 "customers": 31450,
 "revenue_cents": 94350000
 }
}
```

---

## 10. NOTIFICATIONS

### 10.1 PATCH /users/me/preferences
**Purpose:** Update notification preferences

**Auth:** Required (any authenticated user)

**Request:**
```json
{
 "email_enabled": true,
 "sms_enabled": false,
 "push_enabled": true,
 "offer_notifications": true,
 "location_consent": true
}
```

**Response (200 OK):**
```json
{
 "preferences": {
 "email_enabled": true,
 "sms_enabled": false,
 "push_enabled": true,
 "offer_notifications": true,
 "location_consent": true
 }
}
```

---

### 10.2 POST /geofence/events
**Purpose:** Report geofence entry (mobile app  backend)

**Auth:** Required (CUSTOMER role)

**Request:**
```json
{
 "location_id": 78,
 "event_type": "ENTER",
 "user_latitude": 28.5385,
 "user_longitude": -81.3790,
 "timestamp": "2025-12-23T10:15:30Z"
}
```

**Response (204 No Content)**

**Side Effect:** If throttling allows, triggers push notification

---

## 11. KAFKA EVENT SCHEMAS

### 11.1 Topic: `subscription-events`

#### Event: `subscription_created`
```json
{
 "event_id": "event-uuid",
 "event_type": "subscription_created",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "subscription": {
 "id": "sub-uuid",
 "customer_id": "user-uuid",
 "plan_id": 2,
 "status": "ACTIVE",
 "current_period_start": "2025-12-23",
 "current_period_end": "2026-12-23"
 },
 "attribution": {
 "root_scout_id": "scout-uuid",
 "direct_referrer_id": "scout-uuid",
 "attribution_depth": 0,
 "attribution_method": "LINK_CLICK"
 },
 "payment": {
 "amount_cents": 2999,
 "status": "SUCCESS",
 "gateway": "STRIPE"
 }
}
```

#### Event: `subscription_canceled`
```json
{
 "event_id": "event-uuid",
 "event_type": "subscription_canceled",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "subscription": {
 "id": "sub-uuid",
 "customer_id": "user-uuid",
 "cancel_at_period_end": true,
 "cancels_at": "2026-12-23"
 }
}
```

---

### 11.2 Topic: `referral-events`

#### Event: `referral_attributed`
```json
{
 "event_id": "event-uuid",
 "event_type": "referral_attributed",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "subscription_id": "sub-uuid",
 "customer_id": "user-uuid",
 "root_scout_id": "scout-uuid",
 "attribution_depth": 1,
 "attribution_method": "LINK_CLICK"
}
```

---

### 11.3 Topic: `redemption-events`

#### Event: `redemption_recorded`
```json
{
 "event_id": "event-uuid",
 "event_type": "redemption_recorded",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "redemption": {
 "id": "redemption-uuid",
 "customer_id": "user-uuid",
 "subscription_id": "sub-uuid",
 "offer_id": 123,
 "merchant_id": 45,
 "location_id": 78,
 "estimated_value_cents": 1200,
 "redemption_method": "SHOW_CODE"
 }
}
```

---

### 11.4 Topic: `notification-events`

#### Event: `notification_sent`
```json
{
 "event_id": "event-uuid",
 "event_type": "notification_sent",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "notification": {
 "id": "notification-uuid",
 "user_id": "user-uuid",
 "type": "GEOFENCE_OFFER",
 "channel": "PUSH",
 "message": "You're near Pizza Palace! 20% off in-store today.",
 "metadata": {
 "offer_id": 123,
 "location_id": 78
 }
 }
}
```

---

### 11.5 Topic: `audit-events`

#### Event: `pii_accessed`
```json
{
 "event_id": "event-uuid",
 "event_type": "pii_accessed",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "actor": {
 "user_id": "admin-uuid",
 "email": "admin@council.org",
 "role": "COUNCIL_ADMIN",
 "ip_address": "203.0.113.42"
 },
 "resource": {
 "type": "SCOUT",
 "id": "scout-uuid",
 "action": "VIEW_PARENT_EMAIL"
 }
}
```

---

## 12. WEBHOOKS (OUTBOUND)

### 12.1 Webhook: Subscription Created
**Purpose:** Notify external systems when subscription created

**Endpoint:** Configured by council (e.g., `https://council.org/webhooks/subscription-created`)

**Payload:**
```json
{
 "event_type": "subscription.created",
 "timestamp": "2025-12-23T10:15:30.123Z",
 "council_id": 42,
 "data": {
 "subscription_id": "sub-uuid",
 "customer_email": "customer@example.com",
 "plan_name": "Annual",
 "amount_cents": 2999,
 "scout_id": "scout-uuid"
 }
}
```

**Security:** HMAC signature in header: `X-CampCard-Signature`

---

## 13. FILE UPLOADS

### 13.1 POST /uploads/logo
**Purpose:** Upload merchant logo

**Auth:** Required (COUNCIL_ADMIN role)

**Request:** `multipart/form-data`
```
Content-Type: multipart/form-data

file=<binary data>
```

**Response (201 Created):**
```json
{
 "upload": {
 "file_name": "logo-45.png",
 "file_size_bytes": 24567,
 "url": "https://cdn.campcard.app/logos/45.png",
 "uploaded_at": "2025-12-23T10:15:30Z"
 }
}
```

**Validations:**
- Max file size: 2 MB
- Allowed types: PNG, JPG, SVG
- Image dimensions: min 200x200px, max 2000x2000px

---

## 14. HEALTH & MONITORING

### 14.1 GET /health
**Purpose:** Health check endpoint

**Auth:** None (public)

**Response (200 OK):**
```json
{
 "status": "UP",
 "timestamp": "2025-12-23T10:15:30Z",
 "services": {
 "database": "UP",
 "redis": "UP",
 "kafka": "UP"
 }
}
```

---

### 14.2 GET /actuator/health (Spring Boot)
**Purpose:** Detailed health check for monitoring

**Auth:** None (restricted to internal network)

**Response (200 OK):**
```json
{
 "status": "UP",
 "components": {
 "db": {
 "status": "UP",
 "details": {
 "database": "PostgreSQL",
 "validationQuery": "isValid()"
 }
 },
 "diskSpace": {
 "status": "UP",
 "details": {
 "total": 499963174912,
 "free": 412345678901,
 "threshold": 10485760
 }
 }
 }
}
```

---

## 15. SUMMARY

### 15.1 API Endpoint Count

| Category | Endpoints |
|----------|-----------|
| **Auth** | 6 (register, login, refresh, logout, forgot, reset) |
| **Subscriptions** | 4 (plans, create, get, update, reactivate) |
| **Offers** | 4 (list, details, activate, validate, confirm) |
| **Scouts/Referrals** | 4 (dashboard, materials, track, customer link) |
| **POS Integration** | 4 (create entitlement, lookup, claim, webhook) |
| **Admin: Merchants/Offers** | 6 (CRUD merchants, locations, offers) |
| **Admin: Troops/Scouts** | 4 (CRUD troops, scouts, leaders) |
| **Reporting** | 4 (scout, troop, council, national) |
| **Notifications** | 2 (preferences, geofence) |
| **Uploads** | 1 (logo upload) |
| **Health** | 2 (health, actuator) |
| **Total** | **41 endpoints** |

### 15.2 Kafka Topics

| Topic | Events | Purpose |
|-------|--------|---------|
| `subscription-events` | created, canceled, renewed | Subscription lifecycle |
| `referral-events` | attributed, clicked | Referral tracking |
| `redemption-events` | recorded, validated | Offer redemptions |
| `notification-events` | sent, opened, clicked | Notification delivery |
| `audit-events` | pii_accessed, admin_action | Compliance audit trail |
| `payment-events` | success, failed, refunded | Payment transactions |

---

**END OF PART 5**

**Next:** Part 6  Reporting & Dashboards (UI Specifications)
