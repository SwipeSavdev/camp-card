# Camp Card API Documentation

**Version:** 1.0.0  
**Base URL:** `http://18.118.82.111:7010`  
**API Docs:** [Swagger UI](http://18.118.82.111:7010/swagger-ui/)  
**OpenAPI Spec:** [JSON](http://18.118.82.111:7010/v3/api-docs)

---

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Code Examples](#code-examples)

---

## Authentication

### JWT Bearer Token

All API endpoints (except login/register) require a JWT bearer token in the `Authorization` header.

**Token Structure:**
```
Authorization: Bearer <access_token>
```

**Token Lifetime:**
- Access Token: 15 minutes (900 seconds)
- Refresh Token: 7 days (604800 seconds)

### Obtaining Tokens

#### 1. Register New User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "scout@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Scout"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "scout@example.com",
    "firstName": "John",
    "lastName": "Scout",
    "role": "SCOUT",
    "emailVerified": false,
    "profileImageUrl": null
  }
}
```

#### 2. Login Existing User
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "scout@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register (see above)

#### 3. Refresh Access Token
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
```
**Parameters:**
- `email` (string, required) - User email
- `password` (string, required) - Password (min 8 chars, 1 uppercase, 1 number, 1 special char)
- `firstName` (string, required) - First name
- `lastName` (string, required) - Last name

**Returns:** AuthResponse with tokens and user data

---

#### Login
```
POST /api/v1/auth/login
```
**Parameters:**
- `email` (string, required) - User email
- `password` (string, required) - User password

**Returns:** AuthResponse with tokens and user data

---

#### Get Current User Profile
```
GET /api/v1/auth/me
Authorization: Bearer <token>
```
**Returns:** User object with current profile

**Example:**
```bash
curl -X GET http://18.118.82.111:7010/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "scout@example.com",
  "firstName": "John",
  "lastName": "Scout",
  "phone": null,
  "role": "SCOUT",
  "emailVerified": false,
  "profileImageUrl": null,
  "createdAt": "2026-01-08T16:28:46.905Z",
  "lastLoginAt": "2026-01-08T16:29:18.608Z",
  "scoutProfile": null,
  "council": null
}
```

---

#### Verify Email
```
POST /api/v1/auth/verify-email
```
**Parameters:**
- `token` (string, required) - Email verification token

**Returns:** Success message

---

#### Forgot Password
```
POST /api/v1/auth/forgot-password
```
**Parameters:**
- `email` (string, required) - User email

**Returns:** Success message (email sent)

---

#### Reset Password
```
POST /api/v1/auth/reset-password
```
**Parameters:**
- `token` (string, required) - Password reset token
- `newPassword` (string, required) - New password

**Returns:** Success message

---

### User Management Endpoints

#### List Users (Admin Only)
```
GET /api/v1/users?page=0&size=10&search=john&role=SCOUT
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number) - Page number (0-based)
- `size` (number) - Records per page
- `search` (string) - Search by name/email
- `role` (string) - Filter by role (SCOUT, COUNCIL_ADMIN, NATIONAL_ADMIN)

**Returns:** Page of User objects

---

#### Create User (Admin Only)
```
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "User",
  "role": "SCOUT"
}
```

**Returns:** Created User object

---

#### Get User by ID
```
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

**Returns:** User object

---

#### Update User
```
PUT /api/v1/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "UserUpdated",
  "phone": "555-1234"
}
```

**Returns:** Updated User object

---

#### Delete User (Soft Delete)
```
DELETE /api/v1/users/{userId}
Authorization: Bearer <token>
```

**Returns:** Success message

---

### Merchant Endpoints

#### List Merchants
```
GET /api/v1/merchants?page=0&size=10&status=ACTIVE&search=pizza
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number) - Page number
- `size` (number) - Records per page
- `status` (string) - Filter by status (ACTIVE, SUSPENDED, INACTIVE)
- `search` (string) - Search by name
- `category` (string) - Filter by category

**Returns:** Page of Merchant objects

---

#### Create Merchant
```
POST /api/v1/merchants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pizza Palace",
  "email": "info@pizzapalace.com",
  "phone": "555-9999",
  "category": "DINING",
  "description": "Family-friendly pizza restaurant",
  "logoUrl": "https://example.com/logo.png"
}
```

**Returns:** Created Merchant object

---

#### Get Merchant Details
```
GET /api/v1/merchants/{merchantId}
Authorization: Bearer <token>
```

**Returns:** Merchant object with locations

---

#### Approve Merchant Application
```
PATCH /api/v1/merchants/{merchantId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "rejectionReason": null
}
```

**Returns:** Updated Merchant object

---

#### Add Merchant Location
```
POST /api/v1/merchants/{merchantId}/locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Branch",
  "address": "123 Main St",
  "city": "Orlando",
  "state": "FL",
  "zipCode": "32801",
  "latitude": 28.5383,
  "longitude": -81.3792,
  "phoneNumber": "555-0001"
}
```

**Returns:** Created Location object

---

#### Find Nearby Locations
```
GET /api/v1/merchants/locations/nearby?latitude=28.5383&longitude=-81.3792&radius=5
Authorization: Bearer <token>
```

**Query Parameters:**
- `latitude` (number, required) - User latitude
- `longitude` (number, required) - User longitude
- `radius` (number, default=5) - Search radius in miles

**Returns:** Array of nearby Location objects with Merchant info

---

### Offer Endpoints

#### List Offers
```
GET /api/offers?page=0&size=10&type=REUSABLE&status=ACTIVE
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number) - Page number
- `size` (number) - Records per page
- `type` (string) - Filter by type (ONE_TIME_USE, REUSABLE)
- `status` (string) - Filter by status (ACTIVE, PAUSED, EXPIRED)
- `merchantId` (string) - Filter by merchant
- `category` (string) - Filter by category

**Returns:** Page of Offer objects

---

#### Create Offer (Admin/Merchant Only)
```
POST /api/offers
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "20% Off Pizza",
  "description": "Get 20% off any pizza purchase",
  "merchantId": "merchant-id-123",
  "discount": 20,
  "discountType": "PERCENTAGE",
  "maxRedemptions": 100,
  "expiryDate": "2025-06-30T23:59:59Z",
  "type": "REUSABLE",
  "category": "DINING"
}
```

**Returns:** Created Offer object

---

#### Get Offer Details
```
GET /api/offers/{offerId}
Authorization: Bearer <token>
```

**Returns:** Offer object with merchant and redemption details

---

#### Redeem Offer
```
POST /api/offers/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "offerId": "offer-id-123",
  "scoutId": "scout-id-456",
  "purchaseAmount": 25.99
}
```

**Returns:** Redemption object with validation code

**Example Response:**
```json
{
  "id": "redemption-id-789",
  "offerId": "offer-id-123",
  "scoutId": "scout-id-456",
  "verificationCode": "VERIFY-ABC123XYZ",
  "status": "PENDING",
  "redemptionDate": "2026-01-08T16:30:00Z",
  "expiresAt": "2026-01-08T17:30:00Z"
}
```

---

#### Verify Redemption (QR Code)
```
POST /api/offers/verify/{verificationCode}
Authorization: Bearer <token>
Content-Type: application/json

{
  "merchantId": "merchant-id-123"
}
```

**Returns:** Updated Redemption object with verified status

---

#### Pause Offer
```
POST /api/offers/{offerId}/pause
Authorization: Bearer <token>
```

**Returns:** Updated Offer object

---

#### Resume Offer
```
POST /api/offers/{offerId}/resume
Authorization: Bearer <token>
```

**Returns:** Updated Offer object

---

### Subscription Endpoints

#### List Subscription Plans
```
GET /api/v1/subscription-plans?councilId=council-123
Authorization: Bearer <token>
```

**Query Parameters:**
- `councilId` (string, optional) - Filter plans by council

**Returns:** Array of SubscriptionPlan objects

---

#### Create Subscription
```
POST /api/v1/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan-id-123",
  "paymentMethodId": "pm_stripe_id_123",
  "scoutCount": 5
}
```

**Returns:** Created Subscription object

---

#### Get My Subscription
```
GET /api/v1/subscriptions/me
Authorization: Bearer <token>
```

**Returns:** Current user's Subscription object

---

#### Update Subscription
```
PATCH /api/v1/subscriptions/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan-id-456",
  "paymentMethodId": "pm_stripe_id_456"
}
```

**Returns:** Updated Subscription object

---

#### Reactivate Subscription
```
POST /api/v1/subscriptions/me/reactivate
Authorization: Bearer <token>
```

**Returns:** Reactivated Subscription object

---

### Scout/Troop Endpoints

#### List Troops
```
GET /api/troops?page=0&size=10&councilId=council-123
Authorization: Bearer <token>
```

**Returns:** Page of Troop objects

---

#### Create Troop
```
POST /api/troops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Troop 123",
  "troopNumber": 123,
  "councilId": "council-123",
  "scoutCount": 15,
  "status": "ACTIVE"
}
```

**Returns:** Created Troop object

---

#### Get Scout Roster
```
GET /api/scouts/troop/{troopId}/roster?page=0&size=20
Authorization: Bearer <token>
```

**Returns:** Page of Scout objects

---

#### Record Scout Sale
```
POST /api/scouts/{scoutId}/record-sale
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "offerIds": ["offer-123", "offer-456"],
  "date": "2026-01-08T12:00:00Z"
}
```

**Returns:** Updated Scout object with sales tracking

---

### Payment Endpoints

#### Process Payment
```
POST /api/v1/payments/charge
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 29.99,
  "currency": "USD",
  "paymentMethodId": "pm_authorize_net_123",
  "orderId": "order-123",
  "description": "Subscription renewal"
}
```

**Returns:** Transaction object

---

#### Process Refund
```
POST /api/v1/payments/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionId": "txn-123",
  "amount": 29.99,
  "reason": "Customer request"
}
```

**Returns:** Refund object

---

### Referral Endpoints

#### Get My Referral Code
```
GET /api/v1/referrals/my-code
Authorization: Bearer <token>
```

**Returns:** Referral code object

---

#### Apply Referral Code
```
POST /api/v1/referrals/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "referralCode": "REF-ABC123"
}
```

**Returns:** Applied referral object with rewards

---

### Notification Endpoints

#### Register Device Token
```
POST /api/v1/notifications/register-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "ExponentPushToken[fcm_token_here]",
  "platform": "ios"
}
```

**Returns:** Device registration object

---

#### Send Notification
```
POST /api/v1/notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-123",
  "title": "New Offer Available",
  "body": "Check out the new pizza discount!",
  "data": {
    "offerId": "offer-456"
  }
}
```

**Returns:** Notification object

---

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string|null",
  "role": "SCOUT|COUNCIL_ADMIN|NATIONAL_ADMIN",
  "emailVerified": "boolean",
  "profileImageUrl": "string|null",
  "createdAt": "ISO 8601 timestamp",
  "lastLoginAt": "ISO 8601 timestamp|null",
  "scoutProfile": "ScoutProfile|null",
  "council": "Council|null"
}
```

### Merchant
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "category": "DINING|ENTERTAINMENT|RETAIL|AUTO|SERVICES",
  "description": "string",
  "logoUrl": "string",
  "status": "ACTIVE|SUSPENDED|INACTIVE",
  "locations": ["Location"],
  "createdAt": "ISO 8601 timestamp"
}
```

### Offer
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "merchantId": "uuid",
  "discount": "number",
  "discountType": "PERCENTAGE|FIXED_AMOUNT",
  "type": "ONE_TIME_USE|REUSABLE",
  "status": "ACTIVE|PAUSED|EXPIRED",
  "maxRedemptions": "number",
  "currentRedemptions": "number",
  "expiryDate": "ISO 8601 timestamp",
  "barcode": "string",
  "imageUrl": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

### Scout
```json
{
  "id": "uuid",
  "userId": "uuid",
  "troopId": "uuid",
  "rank": "LION|TIGER|WOLF|BEAR|WEBELOS_1|WEBELOS_2|SCOUT",
  "totalSales": "number",
  "salesThisMonth": "number",
  "offerRedemptions": "number",
  "status": "ACTIVE|INACTIVE",
  "dateOfBirth": "date",
  "createdAt": "ISO 8601 timestamp"
}
```

### Subscription
```json
{
  "id": "uuid",
  "userId": "uuid",
  "planId": "uuid",
  "status": "ACTIVE|CANCELED|EXPIRED",
  "startDate": "ISO 8601 timestamp",
  "renewalDate": "ISO 8601 timestamp",
  "endDate": "ISO 8601 timestamp|null",
  "scoutCount": "number",
  "monthlyPrice": "number",
  "createdAt": "ISO 8601 timestamp"
}
```

---

## Error Handling

All errors return a standard format:

```json
{
  "timestamp": "2026-01-08T16:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/register"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email |
| 500 | Server Error | Unexpected error |

### Common Errors

**401 Unauthorized - Missing Token**
```json
{
  "timestamp": "2026-01-08T16:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Missing or invalid JWT token"
}
```

**409 Conflict - Duplicate Email**
```json
{
  "timestamp": "2026-01-08T16:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered"
}
```

---

## Code Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://18.118.82.111:7010';
let accessToken = '';

// Login
async function login(email: string, password: string) {
  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
    email,
    password
  });
  accessToken = response.data.accessToken;
  return response.data;
}

// Get current user with token
async function getCurrentUser() {
  return await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

// Create merchant
async function createMerchant(merchantData: any) {
  return await axios.post(`${API_BASE_URL}/api/v1/merchants`, merchantData, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
```

### Curl Examples

**Login:**
```bash
curl -X POST http://18.118.82.111:7010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "scout@example.com",
    "password": "SecurePassword123!"
  }'
```

**List Offers:**
```bash
curl -X GET 'http://18.118.82.111:7010/api/offers?page=0&size=10' \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Redeem Offer:**
```bash
curl -X POST http://18.118.82.111:7010/api/offers/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "offerId": "offer-id-123",
    "scoutId": "scout-id-456",
    "purchaseAmount": 25.99
  }'
```

---

## Pagination

List endpoints support pagination with these query parameters:

- `page` - Zero-based page number (default: 0)
- `size` - Records per page (default: 10, max: 100)
- `sort` - Sort field and direction, e.g., `sort=createdAt,desc`

**Paginated Response:**
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalPages": 5,
  "totalElements": 45,
  "last": false,
  "numberOfElements": 10,
  "first": true,
  "size": 10,
  "number": 0,
  "empty": false
}
```

---

## Rate Limiting

Currently no rate limiting is enforced, but production deployments should implement:
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints

---

## Support

For API support and questions:
- 📧 Email: api-support@campcard.org
- 📖 OpenAPI Docs: http://18.118.82.111:7010/swagger-ui/
- 🐛 Report Issues: https://github.com/SwipeSavdev/camp-card/issues
