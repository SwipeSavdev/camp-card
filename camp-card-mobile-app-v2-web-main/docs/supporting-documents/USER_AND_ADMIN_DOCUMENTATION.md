# Camp Card Offers System - User & Admin Documentation

**Version**: 1.0.0
**Last Updated**: December 28, 2025
**Status**: Production-Ready

---

## Table of Contents

1. [Admin User Guide](#admin-user-guide)
2. [End User Guide](#end-user-guide)
3. [API Documentation](#api-documentation)
4. [Troubleshooting](#troubleshooting)

---

# ADMIN USER GUIDE

## Introduction

Welcome to the Camp Card Offers Management System. This guide will walk you through creating, managing, and optimizing offers for your merchants.

## Dashboard Overview

The admin dashboard (`http://localhost:3000`) provides a centralized interface for:
- Creating new offers
- Managing existing offers
- Viewing analytics
- Managing merchants
- Monitoring system health

## Getting Started

### 1. Login to Dashboard

```
URL: http://localhost:3000
Username: admin@campcard.com
Password: [Your secure password]
```

### 2. Navigate to Offers Management

```
Dashboard  Offers  List
```

## Creating a New Offer

### Step 1: Click "Create New Offer"

Button Location: Top-right of offers list page

### Step 2: Fill in Offer Details

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| **Title** | Offer name displayed to users | "20% Off Pizza" | Yes |
| **Description** | Full offer details | "Dine-in or takeout. Valid Tue-Thu only." | Yes |
| **Merchant** | Which business offers this | "Pizza Palace" | Yes |
| **Category** | Offer type | DINING, AUTO, ENTERTAINMENT, etc. | Yes |
| **Discount Type** | Amount or percentage | "Percentage" | Yes |
| **Discount Value** | Amount of discount | "20" | Yes |
| **Valid From** | Start date | "2025-12-28" | Yes |
| **Valid Until** | End date | "2026-01-31" | Yes |
| **Featured** | Show on homepage | Yes / No |  No |
| **Active** | Currently available | Yes / No |  No |

### Step 3: Review & Submit

```
1. Review all fields
2. Click "Preview" to see how users will see it
3. Click "Create Offer" to submit
```

### Step 4: Confirmation

You'll see a success message:
```
 Offer created successfully!
Offer ID: 60
Offer UUID: 550e8400-e29b-41d4-a716-446655440060
```

## Editing an Existing Offer

### Method 1: List View

1. Navigate to: Offers  List
2. Find the offer in the table
3. Click the "Edit" button (pencil icon)
4. Make changes
5. Click "Save Changes"

### Method 2: Detail View

1. Click on an offer in the list to open details
2. Click "Edit" button
3. Modify fields
4. Click "Save"

## Activating/Deactivating Offers

### Activate an Offer

```
1. Find the offer
2. Click the "Activate" button
3. Confirm action
4. Offer becomes available to users immediately
```

### Deactivate an Offer

```
1. Find the offer
2. Click the "Deactivate" button
3. Offer is hidden from users
4. Data is preserved (can be re-activated)
```

## Deleting an Offer

 **Warning**: Deletion is permanent and cannot be undone

```
1. Find the offer
2. Click the "Delete" button (trash icon)
3. Confirm deletion
4. Offer is permanently removed from system
```

## Viewing Analytics

### Offer Performance

Navigate to: Analytics  Offers

```
Metrics Displayed:
- Total offers: 59
- Active offers: 59
- Featured offers: 15
- Total categories: 7
- Offers by merchant breakdown
```

### Redemption Stats

Navigate to: Analytics  Redemptions

```
Data Shown:
- Offers redeemed by users
- Popular offers
- Redemption by category
- Trends over time
```

## Best Practices for Offer Management

### Do's

1. **Use Clear Titles**
 - "20% Off Entire Purchase"
 - "Nice Deal"

2. **Be Specific in Description**
 - "Valid on dine-in or takeout. Excludes alcohol and delivery."
 - "Special discount"

3. **Set Realistic Dates**
 - Start tomorrow, end 30 days from now
 - Offer that already expired

4. **Use Categories Correctly**
 - Pizza restaurant  DINING category
 - Pizza restaurant  ENTERTAINMENT category

5. **Feature Top Offers**
 - Feature your 15-20% offers
 - Feature every offer

### Don'ts

1. Use ALL CAPS in descriptions
2. Set offers with no description
3. Feature more than 20% of offers
4. Use outdated dates
5. Duplicate offers without reason

## Merchant Management

### View Merchant Details

Navigate to: Merchants  List

### Add New Merchant

1. Click "Add Merchant"
2. Enter business name
3. Enter category (DINING, AUTO, RETAIL, etc.)
4. Add logo URL (optional)
5. Click "Create"

### Link Offers to Merchant

When creating an offer, select the merchant from the dropdown. All future offers for that merchant will be associated automatically.

---

# END USER GUIDE

## For Mobile App Users

### Finding Offers

1. **Open Camp Card App**
2. **Navigate to "Offers" Tab**
3. **Browse available offers**

### Filtering Offers

```
Tap the filter icon to see offers by:
- Category (Dining, Auto, Entertainment, etc.)
- Merchant
- Discount level
- Distance (if location enabled)
```

### Viewing Offer Details

1. Tap an offer card
2. See full description
3. View validity dates
4. See merchant information
5. Tap "Redeem" to use the offer

### Redeeming an Offer

#### Online Redemption
```
1. Tap the offer
2. Click "Redeem Online"
3. Show code to merchant
4. Merchant scans code
5. Redemption complete
```

#### In-Store Redemption
```
1. Show offer on your phone at checkout
2. Merchant scans barcode
3. Discount applied automatically
4. Redemption tracked in app
```

### Managing Your Offers

**Saved Offers**
```
1. Tap the heart icon to save
2. Access from "Saved Offers" tab
3. Quick access to favorites
```

**Redemption History**
```
1. Go to "My Offers" section
2. View all redeemed offers
3. See savings total
4. Share achievements with friends
```

---

# API DOCUMENTATION

## Base URL

```
Production: https://api.campcard.com
Development: http://localhost:8080
```

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### GET /offers

**Description**: Retrieve all active offers

**Query Parameters**:
```
- category: string (optional) - Filter by category
- merchant_id: UUID (optional) - Filter by merchant
- limit: integer (default: 20) - Items per page
- offset: integer (default: 0) - Pagination offset
```

**Example Request**:
```bash
curl -X GET "http://localhost:8080/offers?category=DINING&limit=10" \
 -H "Authorization: Bearer TOKEN"
```

**Example Response**:
```json
{
 "data": [
 {
 "id": 1,
 "uuid": "550e8400-e29b-41d4-a716-446655440001",
 "title": "20% off entire purchase",
 "description": "Valid on dine-in or takeout",
 "merchantId": "550e8400-e29b-41d4-a716-446655440000",
 "categoryId": 1,
 "discountValue": 20,
 "validFrom": "2025-12-28T00:00:00Z",
 "validUntil": "2026-01-31T23:59:59Z",
 "isActive": true
 }
 ],
 "pagination": {
 "total": 59,
 "limit": 20,
 "offset": 0,
 "hasMore": true
 }
}
```

### GET /offers/{id}

**Description**: Get a single offer by ID

**Example Request**:
```bash
curl -X GET "http://localhost:8080/offers/1" \
 -H "Authorization: Bearer TOKEN"
```

**Response**: Single offer object (see above)

### POST /offers

**Description**: Create a new offer

**Request Body**:
```json
{
 "title": "25% Off Brake Service",
 "description": "Complete brake inspection and pads replacement",
 "discountValue": 25,
 "merchantId": "550e8400-e29b-41d4-a716-446655440000",
 "categoryId": 2,
 "validFrom": "2025-12-28T00:00:00Z",
 "validUntil": "2026-02-28T23:59:59Z"
}
```

**Response**: Created offer with ID

### PUT /offers/{id}

**Description**: Update an existing offer

**Request Body**: Any fields to update (all optional)
```json
{
 "title": "30% Off Brake Service",
 "discountValue": 30
}
```

### DELETE /offers/{id}

**Description**: Delete an offer (permanent)

**Example Request**:
```bash
curl -X DELETE "http://localhost:8080/offers/1" \
 -H "Authorization: Bearer TOKEN"
```

### POST /offers/{id}/activate

**Description**: Activate an offer

**Example Request**:
```bash
curl -X POST "http://localhost:8080/offers/1/activate" \
 -H "Authorization: Bearer TOKEN"
```

## Error Responses

### 400 Bad Request
```json
{
 "error": "VALIDATION_ERROR",
 "message": "Invalid offer data",
 "details": {
 "title": "Title is required",
 "discountValue": "Must be greater than 0"
 }
}
```

### 404 Not Found
```json
{
 "error": "NOT_FOUND",
 "message": "Offer not found",
 "offerId": 999
}
```

### 429 Too Many Requests
```json
{
 "error": "RATE_LIMITED",
 "message": "Too many requests. Limit: 100 per minute",
 "retryAfter": 45
}
```

---

# TROUBLESHOOTING

## Common Issues & Solutions

### Issue 1: Can't Login to Dashboard

**Symptom**: Login page keeps reloading

**Solutions**:
1. Clear browser cache: `Ctrl+Shift+Delete` (Chrome) or `Cmd+Shift+Delete` (Mac)
2. Try incognito/private mode
3. Check browser cookies are enabled
4. Verify API is responding: `curl http://localhost:8080/health`
5. Restart web dashboard: `pkill -f "next dev"` then `npm run dev`

### Issue 2: Offers Not Loading

**Symptom**: Blank offers list in dashboard or mobile app

**Solutions**:
```bash
# 1. Check API is running
curl http://localhost:8080/offers

# 2. Check database has data
psql -U postgres -d campcard_db -c "SELECT COUNT(*) FROM offers;"

# 3. Restart backend
pkill -f "java.*campcard"
cd repos/camp-card-backend && java -jar target/campcard.jar &

# 4. Clear cache (if using Redis)
redis-cli FLUSHDB
```

### Issue 3: API Returns 429 (Rate Limited)

**Symptom**: Getting "Too Many Requests" error

**Solutions**:
1. **Wait 1 minute** - Rate limit resets every minute
2. **Reduce request frequency** - Don't make multiple identical requests
3. **Contact admin** - If legitimate heavy use, increase rate limit in config
4. **Check for loops** - Verify app isn't making infinite requests

### Issue 4: Offer Creation Fails

**Symptom**: "Error creating offer" message

**Solutions**:
```
Check required fields:
 Title: Not empty
 Description: Not empty
 Discount Value: > 0
 Merchant ID: Valid UUID
 Valid From: Before Valid Until
 Valid Until: Date in future
```

### Issue 5: Mobile App Won't Connect

**Symptom**: Mobile app shows mock data instead of real offers

**Solutions**:
1. Verify API URL in app:
 ```
 Android: Check API_BASE_URL in env.ts
 iOS: Check EXPO_PUBLIC_API_BASE_URL
 ```

2. Check network connectivity:
 ```bash
 ping localhost
 curl http://localhost:8080/offers
 ```

3. Restart Expo:
 ```bash
 cd repos/camp-card-mobile
 npm start -- --clear
 ```

### Issue 6: Database Connection Failed

**Symptom**: Backend won't start, "connection refused" error

**Solutions**:
```bash
# 1. Check PostgreSQL is running
psql -U postgres -h localhost

# 2. Check connection string in application.properties
# Should be: jdbc:postgresql://localhost:5432/campcard_db

# 3. Verify credentials
psql -U campcard_user -d campcard_db -h localhost

# 4. Restart PostgreSQL
brew services restart postgresql@15
```

## Performance Issues

### Slow API Responses (> 100ms)

**Diagnosis**:
```bash
# Check database query time
psql -U postgres -d campcard_db -c "EXPLAIN ANALYZE SELECT * FROM offers LIMIT 10;"

# Check cache hits
redis-cli INFO stats | grep hits
```

**Solutions**:
1. Enable Redis caching
2. Check for missing indexes
3. Review slow query logs
4. Scale database vertically

### High Memory Usage

**Diagnosis**:
```bash
# Java process memory
ps aux | grep java

# Redis memory
redis-cli INFO memory
```

**Solutions**:
1. Increase JVM heap: `-Xmx4G`
2. Reduce cache TTL
3. Implement pagination
4. Archive old data

## Getting Help

### Check System Status

```bash
# Backend health
curl http://localhost:8080/health | jq '.'

# Database
psql -U postgres -c "SELECT datname, (pg_database_size(datname)/1024/1024)::int as size_mb FROM pg_database WHERE datname='campcard_db';"

# Web dashboard
curl http://localhost:3000 -I | head -5
```

### View Logs

```bash
# Backend
tail -f /tmp/backend.log

# Web Dashboard
tail -f /tmp/web-dashboard.log

# Mobile App
tail -f /tmp/mobile-app.log
```

### Contact Support

**Email**: support@campcard.com
**Phone**: 1-800-CAMP-CARD
**Hours**: Mon-Fri 9AM-5PM EST

---

## Appendix

### Supported Categories

| Category | Code | Description |
|----------|------|-------------|
| DINING | 1 | Restaurants & food |
| AUTO | 2 | Automotive services |
| ENTERTAINMENT | 3 | Movies, activities |
| RETAIL | 4 | Shopping discounts |
| SERVICES | 5 | Professional services |
| HEALTH | 6 | Healthcare & wellness |
| TRAVEL | 7 | Travel & lodging |

### Supported Discount Types

| Type | Example |
|------|---------|
| Percentage | "20% off" |
| Fixed Amount | "$10 off" |
| BOGO | "Buy one get one free" |
| Free Item | "Free appetizer" |

### Date/Time Format

```
Format: ISO 8601
Example: 2026-01-31T23:59:59Z
Timezone: UTC (Z)
```

---

**Documentation Version**: 1.0.0
**Last Updated**: December 28, 2025
**Status**: Production-Ready
