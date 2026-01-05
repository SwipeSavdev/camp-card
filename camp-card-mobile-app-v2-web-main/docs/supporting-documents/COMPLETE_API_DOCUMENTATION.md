# Complete API Documentation - CampCard Backend Controllers

**Last Updated:** December 27, 2025
**Backend Version:** 1.0.0
**API Base URL:** `http://localhost:8080`

---

## Table of Contents

1. [User Controller](#user-controller)
2. [Camp Card Controller](#camp-card-controller)
3. [Merchants Controller](#merchants-controller)
4. [Offers Controller](#offers-controller)
5. [Settings Controller](#settings-controller)
6. [Geolocation Features](#geolocation-features)
7. [Error Handling](#error-handling)

---

## User Controller

Manages user accounts, profiles, and authentication-related operations.

### List Users
- **Endpoint:** `GET /users`
- **Response:**
 ```json
 {
 "users": [
 {
 "id": "user-001",
 "first_name": "Sarah",
 "last_name": "Johnson",
 "email": "sarah.johnson@bsa.org",
 "phone_number": "+1-555-0100",
 "role": "COUNCIL_ADMIN",
 "council_id": "42",
 "is_active": true,
 "email_verified": true,
 "profile_image_url": null,
 "login_count": 5,
 "last_login_at": "2025-12-27T21:05:53Z",
 "created_at": "2025-12-27T21:05:53Z",
 "updated_at": "2025-12-27T21:05:53Z"
 }
 ],
 "total": 3
 }
 ```

### Get User by ID
- **Endpoint:** `GET /users/{id}`
- **Parameters:**
 - `id` (path): User ID
- **Response:** Single user object

### Create User
- **Endpoint:** `POST /users`
- **Request Body:**
 ```json
 {
 "first_name": "John",
 "last_name": "Doe",
 "email": "john.doe@example.com",
 "password": "SecurePassword123!",
 "phone_number": "+1-555-0123",
 "council_id": "42"
 }
 ```
- **Response:** Created user object with HTTP 201

### Update User
- **Endpoint:** `PUT /users/{id}`
- **Request Body:**
 ```json
 {
 "first_name": "John",
 "last_name": "Smith",
 "phone_number": "+1-555-0124",
 "profile_image_url": "https://example.com/avatar.png"
 }
 ```
- **Response:** Updated user object

### Delete User
- **Endpoint:** `DELETE /users/{id}`
- **Response:** HTTP 204 No Content

### Activate User
- **Endpoint:** `POST /users/{id}/activate`
- **Response:**
 ```json
 {
 "status": "activated",
 "user_id": "{id}"
 }
 ```

### Deactivate User
- **Endpoint:** `POST /users/{id}/deactivate`
- **Response:**
 ```json
 {
 "status": "deactivated",
 "user_id": "{id}"
 }
 ```

---

## Camp Card Controller

Manages camp card issuance, wallet display, and card operations.

### Get User Wallet
- **Endpoint:** `GET /users/{user_id}/wallet`
- **Description:** Retrieve all camp cards assigned to a user
- **Response:**
 ```json
 {
 "user_id": "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 "cards": [
 {
 "id": "561fc455-b515-4d95-be92-cdfe5f9cac77",
 "user_id": "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 "card_number": "4111111111111111",
 "card_member_number": "CARD-000001",
 "card_holder_name": "Jason Mayoral",
 "status": "ACTIVE",
 "is_primary": true,
 "card_type": "STANDARD",
 "subscription_type": "MONTHLY",
 "subscription_price": 9.99,
 "current_balance": 250.0,
 "loyalty_points": 1500,
 "issued_at": "2025-12-27T21:05:53Z",
 "expires_at": "2026-12-27T21:05:53Z",
 "activated_at": "2025-12-27T21:05:53Z",
 "metadata": {
 "tier": "gold",
 "features": ["unlimited_offers", "geo_notifications"]
 }
 }
 ],
 "total_balance": 250.0,
 "total_loyalty_points": 1500
 }
 ```

### List Camp Cards
- **Endpoint:** `GET /camp-cards`
- **Parameters:**
 - `user_id` (optional): Filter by user
 - `status` (optional, default: ACTIVE): Filter by status (ACTIVE, PENDING_CLAIM, EXPIRED, SUSPENDED)
- **Response:**
 ```json
 {
 "data": [...cards array],
 "total": 15
 }
 ```

### Get Camp Card Details
- **Endpoint:** `GET /camp-cards/{card_id}`
- **Response:** Single card object

### Issue Camp Card
- **Endpoint:** `POST /users/{user_id}/issue-card`
- **Description:** Issue a new camp card when customer subscribes
- **Request Body:**
 ```json
 {
 "card_holder_name": "Jason Mayoral",
 "card_type": "STANDARD",
 "subscription_type": "MONTHLY",
 "subscription_price": 9.99
 }
 ```
- **Response:**
 ```json
 {
 "status": "success",
 "message": "Camp card issued successfully. Card member number: CARD-238834",
 "card": {
 "id": "8c37393e-44cb-436f-b4c2-c0888ea52455",
 "user_id": "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 "card_number": "4111111111111111",
 "card_member_number": "CARD-238834",
 "card_holder_name": "Jason Mayoral",
 "status": "PENDING",
 "is_primary": true,
 "card_type": "STANDARD"
 }
 }
 ```

### Update Camp Card
- **Endpoint:** `PUT /camp-cards/{card_id}`
- **Request Body:**
 ```json
 {
 "card_holder_name": "Updated Name",
 "card_type": "PREMIUM",
 "subscription_type": "ANNUAL",
 "subscription_price": 99.99
 }
 ```
- **Response:** Updated card object

### Activate Camp Card
- **Endpoint:** `POST /camp-cards/{card_id}/activate`
- **Request Body (optional):**
 ```json
 {
 "card_member_number": "CARD-000001"
 }
 ```
- **Response:**
 ```json
 {
 "status": "activated",
 "card_id": "{card_id}",
 "card_member_number": "CARD-000001",
 "activated_at": "2025-12-27T21:08:46Z"
 }
 ```

### Suspend Camp Card
- **Endpoint:** `POST /camp-cards/{card_id}/suspend`
- **Response:**
 ```json
 {
 "status": "suspended",
 "card_id": "{card_id}",
 "message": "Card has been suspended"
 }
 ```

### Delete Camp Card
- **Endpoint:** `DELETE /camp-cards/{card_id}`
- **Response:** HTTP 204 No Content

### Add Card Balance
- **Endpoint:** `POST /camp-cards/{card_id}/add-balance`
- **Request Body:**
 ```json
 {
 "amount": 50.00
 }
 ```
- **Response:**
 ```json
 {
 "card_id": "{card_id}",
 "previous_balance": 250.0,
 "amount_added": 50.0,
 "new_balance": 300.0,
 "updated_at": "2025-12-27T21:08:46Z"
 }
 ```

### Add Loyalty Points
- **Endpoint:** `POST /camp-cards/{card_id}/add-points`
- **Request Body:**
 ```json
 {
 "points": 100
 }
 ```
- **Response:**
 ```json
 {
 "card_id": "{card_id}",
 "previous_points": 1500,
 "points_added": 100,
 "new_points": 1600,
 "updated_at": "2025-12-27T21:08:46Z"
 }
 ```

---

## Merchants Controller

Manages merchants, their locations, and geofencing capabilities.

### List Merchants
- **Endpoint:** `GET /merchants`
- **Parameters:**
 - `category` (optional): Filter by category (DINING, AUTO, ENTERTAINMENT, etc.)
 - `verified` (optional): Filter by verification status
 - `is_active` (optional): Filter by active status
- **Response:**
 ```json
 {
 "merchants": [
 {
 "id": "00000000-0000-0000-0000-000000000101",
 "business_name": "Pizza Palace",
 "category": "DINING",
 "description": "Best pizza in town since 2015",
 "website_url": "https://pizzapalace.com",
 "phone_number": "+1-555-0201",
 "email": "info@pizzapalace.com",
 "logo_url": "https://example.com/logo-pizza.png",
 "banner_url": "https://example.com/banner-pizza.png",
 "is_active": true,
 "verified": true,
 "locations": [...],
 "total_locations": 1,
 "total_offers": 5,
 "created_at": "2025-12-27T21:05:53Z",
 "updated_at": "2025-12-27T21:05:53Z"
 }
 ],
 "total": 3
 }
 ```

### Get Merchant Details
- **Endpoint:** `GET /merchants/{merchant_id}`
- **Response:** Single merchant object with all locations

### Create Merchant
- **Endpoint:** `POST /merchants`
- **Request Body:**
 ```json
 {
 "business_name": "New Merchant",
 "category": "DINING",
 "description": "Description of the merchant",
 "website_url": "https://example.com",
 "phone_number": "+1-555-1234",
 "email": "info@example.com",
 "logo_url": "https://example.com/logo.png"
 }
 ```
- **Response:** Created merchant object with HTTP 201

### Update Merchant
- **Endpoint:** `PUT /merchants/{merchant_id}`
- **Request Body:** Same as create
- **Response:** Updated merchant object

### Delete Merchant
- **Endpoint:** `DELETE /merchants/{merchant_id}`
- **Response:** HTTP 204 No Content

### Add Merchant Location
- **Endpoint:** `POST /merchants/{merchant_id}/locations`
- **Request Body:**
 ```json
 {
 "name": "Downtown Location",
 "address": "123 Main St",
 "city": "Orlando",
 "state": "FL",
 "postal_code": "32801",
 "country": "USA",
 "latitude": 28.5383,
 "longitude": -81.3792,
 "radius_km": 2.0,
 "hours_open": "10:00",
 "hours_close": "22:00",
 "days_open": "MON,TUE,WED,THU,FRI,SAT,SUN"
 }
 ```
- **Response:** Created location object with HTTP 201

### Get Merchant Locations
- **Endpoint:** `GET /merchants/{merchant_id}/locations`
- **Response:**
 ```json
 {
 "merchant_id": "{merchant_id}",
 "locations": [...],
 "total": 1
 }
 ```

### Find Nearby Offers (Geolocation)
- **Endpoint:** `GET /merchants/nearby`
- **Parameters:**
 - `latitude` (required): User latitude
 - `longitude` (required): User longitude
 - `radius_km` (optional, default: 5.0): Search radius in kilometers
 - `category` (optional): Filter by merchant category
- **Response:**
 ```json
 {
 "offers": [
 {
 "offer_id": "offer-00000000",
 "merchant_id": "00000000-0000-0000-0000-000000000101",
 "merchant_name": "Pizza Palace",
 "merchant_category": "DINING",
 "merchant_logo_url": "https://example.com/logo-pizza.png",
 "location_id": "00000000-0000-0000-0000-000000000201",
 "location_name": "Downtown Location",
 "location_address": "123 Main St",
 "distance_km": 0.2,
 "offer_title": "Special Offer at Pizza Palace",
 "offer_description": "Visit our location and claim your offer",
 "map_url": "https://maps.google.com/?q=28.538300,-81.379200"
 }
 ],
 "total": 1,
 "user_latitude": 28.54,
 "user_longitude": -81.38,
 "search_radius_km": 10.0
 }
 ```

### Verify Merchant
- **Endpoint:** `POST /merchants/verify/{merchant_id}`
- **Response:**
 ```json
 {
 "status": "verified",
 "merchant_id": "{merchant_id}",
 "verified_at": "2025-12-27T21:08:46Z"
 }
 ```

---

## Offers Controller

Complete CRUD operations for managing offers.

### List Offers
- **Endpoint:** `GET /offers`
- **Parameters:**
 - `category` (optional): Filter by category
 - `council_id` (optional): Filter by council
 - `latitude` (optional): For distance calculation
 - `longitude` (optional): For distance calculation
 - `radius_km` (optional): Geofence radius
 - `limit` (optional, default: 20): Results per page
 - `offset` (optional, default: 0): Pagination offset
- **Response:**
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
 "logo_url": null,
 "website_url": "https://example.com"
 },
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout. Excludes alcohol.",
 "category": "DINING",
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "locations": [
 {
 "id": 78,
 "name": "Downtown",
 "address": "123 Main St, Orlando, FL",
 "distance_km": 2.3,
 "latitude": 28.5383,
 "longitude": -81.3792
 }
 ],
 "can_redeem": true
 }
 ],
 "pagination": {
 "total": 3,
 "limit": 20,
 "offset": 0,
 "has_more": false
 }
 }
 ```

### Get Offer Details
- **Endpoint:** `GET /offers/{id}`
- **Response:**
 ```json
 {
 "offer": {
 "id": 123,
 "uuid": "offer-uuid-1",
 "merchant": {...},
 "title": "20% off entire purchase",
 ...
 }
 }
 ```

### Create Offer
- **Endpoint:** `POST /offers`
- **Request Body:**
 ```json
 {
 "title": "Summer Sale",
 "description": "Get 25% off all items",
 "category": "DINING",
 "merchant_id": 45,
 "valid_from": "2025-12-01",
 "valid_until": "2025-12-31",
 "usage_type": "UNLIMITED",
 "discount_description": "25% off",
 "discount_value": 25.0,
 "is_featured": true
 }
 ```
- **Response:** Created offer object with HTTP 201

### Update Offer
- **Endpoint:** `PUT /offers/{id}`
- **Request Body:** Same as create
- **Response:** Updated offer object

### Delete Offer
- **Endpoint:** `DELETE /offers/{id}`
- **Response:** HTTP 204 No Content

### Activate/Redeem Offer
- **Endpoint:** `POST /offers/{id}/activate`
- **Request Body (optional):**
 ```json
 {
 "location_id": 78
 }
 ```
- **Response:**
 ```json
 {
 "redemption_code": {
 "id": "rc_123",
 "code": "CC123-5678",
 "qr_code_data": "campcard://redeem?code=CC123-5678",
 "expires_at": "2025-12-27T21:18:46Z",
 "instructions": "Show this code to the merchant and confirm redemption.",
 "offer": {...},
 "location": {...}
 }
 }
 ```

### Debug Endpoint
- **Endpoint:** `GET /debug`
- **Response:**
 ```json
 {
 "offers": 3
 }
 ```

---

## Settings Controller

Manages user notification and geolocation preferences.

### Get User Settings
- **Endpoint:** `GET /users/{user_id}/settings`
- **Response:**
 ```json
 {
 "id": "baf211d3-3562-4438-958d-035482290de8",
 "user_id": "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 "notifications_enabled": true,
 "push_notifications_enabled": true,
 "email_notifications_enabled": true,
 "sms_notifications_enabled": false,
 "geolocation_enabled": true,
 "notification_radius_km": 5.0,
 "preferred_categories": "DINING,AUTO,ENTERTAINMENT",
 "min_discount_percentage": 15,
 "share_location": false,
 "marketing_consent": false,
 "data_sharing_consent": false,
 "quiet_hours_start": "22:00",
 "quiet_hours_end": "07:00",
 "quiet_hours_enabled": false,
 "created_at": "2025-12-27T21:05:53Z",
 "updated_at": "2025-12-27T21:05:53Z"
 }
 ```

### Update Notification Settings
- **Endpoint:** `PUT /users/{user_id}/settings/notifications`
- **Request Body:**
 ```json
 {
 "notifications_enabled": true,
 "push_notifications_enabled": true,
 "email_notifications_enabled": false,
 "sms_notifications_enabled": true,
 "quiet_hours_start": "22:00",
 "quiet_hours_end": "07:00",
 "quiet_hours_enabled": true
 }
 ```
- **Response:**
 ```json
 {
 "status": "success",
 "message": "Notification settings updated successfully",
 "settings": {...}
 }
 ```

### Update Geolocation Settings
- **Endpoint:** `PUT /users/{user_id}/settings/geolocation`
- **Request Body:**
 ```json
 {
 "geolocation_enabled": true,
 "notification_radius_km": 10.0,
 "preferred_categories": "DINING,AUTO",
 "min_discount_percentage": 10
 }
 ```
- **Response:** Updated settings object

### Update Privacy Settings
- **Endpoint:** `PUT /users/{user_id}/settings/privacy`
- **Request Body:**
 ```json
 {
 "share_location": true,
 "marketing_consent": true,
 "data_sharing_consent": false
 }
 ```
- **Response:** Updated settings object

### Update Notification Radius
- **Endpoint:** `POST /users/{user_id}/settings/radius`
- **Description:** Manage how far away offers can be to trigger notifications
- **Request Body:**
 ```json
 {
 "radius_km": 5.0
 }
 ```
- **Constraints:** Must be between 0.5 and 50 km
- **Response:**
 ```json
 {
 "status": "success",
 "message": "Notification radius updated",
 "previous_radius": 5.0,
 "new_radius": 10.0,
 "updated_at": "2025-12-27T21:08:46Z"
 }
 ```

### Toggle Notifications On/Off
- **Endpoint:** `POST /users/{user_id}/settings/toggle-notifications`
- **Request Body:**
 ```json
 {
 "enabled": true
 }
 ```
- **Response:**
 ```json
 {
 "status": "success",
 "notifications_enabled": true,
 "message": "Notifications enabled",
 "updated_at": "2025-12-27T21:08:46Z"
 }
 ```

### Set Category Preferences
- **Endpoint:** `POST /users/{user_id}/settings/category-preference`
- **Request Body:**
 ```json
 {
 "categories": "DINING,AUTO,ENTERTAINMENT"
 }
 ```
- **Response:**
 ```json
 {
 "status": "success",
 "message": "Category preferences updated",
 "preferred_categories": "DINING,AUTO,ENTERTAINMENT",
 "updated_at": "2025-12-27T21:08:46Z"
 }
 ```

### Reset Settings to Default
- **Endpoint:** `POST /users/{user_id}/settings/reset`
- **Response:**
 ```json
 {
 "status": "success",
 "message": "Settings reset to default values",
 "settings": {...}
 }
 ```

---

## Geolocation Features

### How Nearby Offers Work

1. **User Location Tracking**
 - Device sends periodic location updates (latitude/longitude)
 - Settings determine notification radius (0.5-50 km)

2. **Proximity Detection**
 - Backend calculates distance using Haversine formula
 - Merchants within radius are identified
 - Offers at those locations are retrieved

3. **Notification Trigger**
 - When user enters geofence  Entry notification
 - Push notification sent with offer details
 - Notification can be customized by category and discount

4. **Example Flow:**
 ```
 User Location: 28.54, -81.38
 Search Radius: 10 km

 GET /merchants/nearby?latitude=28.54&longitude=-81.38&radius_km=10

 Response includes all merchants/offers within 10 km
 ```

### Privacy & Control

Users can:
- Enable/disable geolocation completely
- Set custom notification radius
- Filter by merchant category
- Set minimum discount threshold
- Enable quiet hours (no notifications between X-Y time)
- Share location with merchants or not

---

## Error Handling

### Standard Error Response

```json
{
 "error": "Error message describing what went wrong",
 "status_code": 400,
 "timestamp": "2025-12-27T21:08:46Z"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

### Validation Rules

- **Phone Numbers:** Must be valid international format
- **Emails:** Must be valid email format
- **Radius:** Must be between 0.5 and 50 km
- **Card Numbers:** Must be 16 digits
- **Coordinates:** Latitude (-90 to 90), Longitude (-180 to 180)

---

## Testing Commands

### Test User Controller
```bash
# List users
curl http://localhost:8080/users

# Get specific user
curl http://localhost:8080/users/user-001

# Create user
curl -X POST http://localhost:8080/users \
 -H "Content-Type: application/json" \
 -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"Pass123!","council_id":"42"}'
```

### Test Camp Card Controller
```bash
# Get wallet
curl http://localhost:8080/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/wallet

# Issue card
curl -X POST http://localhost:8080/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/issue-card \
 -H "Content-Type: application/json" \
 -d '{"card_holder_name":"Jason Mayoral","card_type":"STANDARD","subscription_type":"MONTHLY","subscription_price":9.99}'
```

### Test Merchants & Geolocation
```bash
# List merchants
curl http://localhost:8080/merchants

# Find nearby offers
curl "http://localhost:8080/merchants/nearby?latitude=28.54&longitude=-81.38&radius_km=10"

# Filter by category
curl "http://localhost:8080/merchants/nearby?latitude=28.54&longitude=-81.38&radius_km=10&category=DINING"
```

### Test Settings
```bash
# Get settings
curl http://localhost:8080/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings

# Update notification radius
curl -X POST http://localhost:8080/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings/radius \
 -H "Content-Type: application/json" \
 -d '{"radius_km":10.0}'

# Toggle notifications
curl -X POST http://localhost:8080/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings/toggle-notifications \
 -H "Content-Type: application/json" \
 -d '{"enabled":false}'
```

---

## Database Schema Reference

### Key Tables Created

- `merchants` - Merchant information
- `merchant_locations` - Physical locations with geofencing data
- `camp_cards` - Issued cards with member numbers
- `user_camp_cards` - User-card associations
- `user_settings` - Notification and geolocation preferences
- `geofence_notifications` - Notification history
- `offer_redemptions` - Redemption tracking

All tables include proper indexes for geolocation and user queries.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-27 | Initial release with all 5 controllers |

---

