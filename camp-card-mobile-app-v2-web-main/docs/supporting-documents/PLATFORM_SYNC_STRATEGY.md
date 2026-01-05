# Platform Synchronization & Integration Strategy

## Overview
Complete integration of Camp Card platform across:
- **Web Admin Portal** (Next.js)
- **Mobile App** (React Native/Expo)
- **Backend API** (Spring Boot Java)
- **Database** (PostgreSQL)

---

## 1. API ENDPOINT CHECKLIST

### Users Endpoints
- [ ] `GET /users` - List all users
- [ ] `POST /users` - Create new user
- [ ] `GET /users/{id}` - Get user by ID
- [ ] `PUT /users/{id}` - Update user
- [ ] `DELETE /users/{id}` - Delete user
- [ ] `GET /users/{id}/activity` - Get user activity

### Organizations Endpoints
- [ ] `GET /organizations` - List all organizations
- [ ] `POST /organizations` - Create organization
- [ ] `GET /organizations/{id}` - Get by ID
- [ ] `PUT /organizations/{id}` - Update organization
- [ ] `DELETE /organizations/{id}` - Delete organization
- [ ] `GET /organizations/{id}/users` - List org users

### Merchants Endpoints
- [ ] `GET /merchants` - List merchants
- [ ] `POST /merchants` - Create merchant
- [ ] `GET /merchants/{id}` - Get merchant
- [ ] `PUT /merchants/{id}` - Update merchant
- [ ] `DELETE /merchants/{id}` - Delete merchant
- [ ] `GET /merchants/{id}/offers` - List merchant offers

### Offers Endpoints
- [ ] `GET /offers` - List offers
- [ ] `POST /offers` - Create offer
- [ ] `GET /offers/{id}` - Get offer
- [ ] `PUT /offers/{id}` - Update offer
- [ ] `DELETE /offers/{id}` - Delete offer
- [ ] `POST /offers/{id}/activate` - Activate offer
- [ ] `GET /offers/{id}/redemptions` - Get redemptions

### Camp Cards Endpoints
- [ ] `GET /camp-cards` - List cards
- [ ] `POST /camp-cards` - Create card
- [ ] `GET /camp-cards/{id}` - Get card
- [ ] `PUT /camp-cards/{id}` - Update card
- [ ] `DELETE /camp-cards/{id}` - Delete card
- [ ] `POST /camp-cards/{id}/activate` - Activate card

### Authentication
- [ ] `POST /auth/login` - Login
- [ ] `POST /auth/register` - Register
- [ ] `POST /auth/refresh` - Refresh token
- [ ] `POST /auth/logout` - Logout

### Analytics
- [ ] `GET /analytics/dashboard` - Dashboard stats
- [ ] `GET /analytics/users` - User analytics
- [ ] `GET /analytics/offers` - Offer analytics
- [ ] `GET /analytics/merchants` - Merchant analytics

---

## 2. DATA SYNC ARCHITECTURE

### Real-Time Synchronization Options

#### Option A: WebSocket (Recommended)
```typescript
// Mobile & Web Both Connected
- Event: 'user:created', 'offer:updated', 'card:redeemed'
- Bidirectional communication
- Low latency
- Reduces polling overhead
```

#### Option B: Polling (Fallback)
```typescript
// Mobile: Poll every 30-60 seconds
// Web: Poll on focus + interval
- Simple implementation
- Higher latency
- More API calls
```

#### Option C: Hybrid (Best Approach)
```typescript
// WebSocket for real-time when available
// Fallback to polling for mobile
// Cache with background sync
```

---

## 3. WEB ADMIN PORTAL PAGES

### Already Created:
- Dashboard (`/dashboard`)
 - Stats cards
 - Recent activity
 - Quick actions
 - System status

### Need to Create:
- [ ] Users Management (`/users`)
 - List with pagination
 - Add/Edit/Delete forms
 - Bulk import
 - Activity tracking

- [ ] Organizations (`/organizations`)
 - Full CRUD
 - User assignment
 - Settings

- [ ] Merchants (`/merchants`)
 - Directory
 - Onboarding form
 - Performance metrics

- [ ] Offers (`/offers`)
 - Campaign management
 - Activation workflow
 - Analytics

- [ ] Cards (`/camp-cards`)
 - Card management
 - Distribution
 - Redemption tracking

- [ ] Analytics (`/analytics`)
 - Charts & metrics
 - Custom reports
 - Export functionality

- [ ] Settings (`/settings`)
 - System configuration
 - User roles
 - Integrations

---

## 4. MOBILE APP INTEGRATION

### API Client Setup (COMPLETE)
```typescript
// File: src/services/apiClient.ts
- Axios interceptors for auth
- Token refresh logic
- Tenant ID headers
- Error handling
```

### Services to Implement:
- [ ] UserService
- [ ] OrganizationService
- [ ] MerchantService
- [ ] OfferService
- [ ] CardService
- [ ] SyncService

### Store Modules (Zustand):
- [ ] authStore (JWT, refresh logic)
- [ ] userStore (Current user + profile)
- [ ] offerStore (Offers cache)
- [ ] cardStore (Card data)
- [ ] syncStore (Sync status)

### Screens to Update:
- [ ] Home (Dashboard)
- [ ] Browse Offers
- [ ] My Cards
- [ ] Redemptions
- [ ] Profile

---

## 5. DATABASE SYNCHRONIZATION

### Sync Flags:
```typescript
// Each table tracks:
- created_at: Timestamp
- updated_at: Timestamp
- is_synced: Boolean (mobile)
- sync_version: Integer
- last_synced: Timestamp
```

### Conflict Resolution:
```
Last-Write-Wins (LWW) Strategy:
- Compare timestamps
- Newer version wins
- Log conflicts
- Admin review queue
```

### Offline-First Pattern (Mobile):
```typescript
// Local SQLite cache  Network Queue  Backend
1. Write to local DB
2. Add to sync queue
3. Attempt sync when online
4. Merge conflicts if needed
5. Confirm to user
```

---

## 6. REQUEST/RESPONSE STANDARDS

### Request Format:
```json
{
 "method": "POST",
 "endpoint": "/users",
 "headers": {
 "Authorization": "Bearer {token}",
 "Content-Type": "application/json",
 "X-Tenant-Id": "tenant-123"
 },
 "body": {
 "email": "user@example.com",
 "fullName": "John Doe",
 "role": "SCOUT"
 }
}
```

### Response Format:
```json
{
 "success": true,
 "data": {
 "id": "user-123",
 "email": "user@example.com",
 "fullName": "John Doe",
 "createdAt": "2025-01-15T10:30:00Z"
 },
 "metadata": {
 "timestamp": "2025-01-15T10:30:00Z",
 "version": "1.0"
 }
}
```

### Error Format:
```json
{
 "success": false,
 "error": {
 "code": "USER_NOT_FOUND",
 "message": "User with ID 123 does not exist",
 "details": {}
 },
 "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 7. AUTHENTICATION FLOW

### Web Portal:
```
1. NextAuth.js with Credentials Provider
2. Backend validates email + password
3. Returns JWT access + refresh tokens
4. Store in session (secure http-only cookie)
5. Auto-refresh before expiry
```

### Mobile App:
```
1. Login request  Backend
2. Store tokens in secure storage (Expo SecureStore)
3. axios interceptor adds token to requests
4. On 401: Attempt refresh
5. On refresh failure: Logout + redirect to login
```

---

## 8. DATA CONSISTENCY RULES

### Before Mobile Sync:
```typescript
1. Validate auth token
2. Check version numbers
3. Compare timestamps
4. Merge local changes
5. Upload to backend
6. Confirm success
7. Update local cache
```

### Conflict Scenarios:
```
Scenario 1: User edited on web, mobile offline
- Mobile: Has local copy with old timestamp
- Web: Has new version with new timestamp
- Resolution: Web version wins, mobile notified to refresh

Scenario 2: Both edited simultaneously
- Compare timestamps (more recent wins)
- Or: Admin review flag for conflicts
- Log both versions for audit

Scenario 3: Network intermittent
- Queue sync requests locally
- Retry with exponential backoff
- Show offline indicator
```

---

## 9. DEPLOYMENT CHECKLIST

### Backend (Java/Spring):
- [ ] All endpoints implemented
- [ ] Database migrations ready
- [ ] Error handling standardized
- [ ] Rate limiting enabled
- [ ] CORS configured for web + mobile
- [ ] JWT secret configured
- [ ] Redis cache configured
- [ ] Logging configured
- [ ] Health check working

### Web Admin:
- [ ] All pages created
- [ ] API client methods complete
- [ ] Auth flow working
- [ ] Error handling in place
- [ ] Loading states
- [ ] Form validation
- [ ] Mobile responsive
- [ ] Built & tested

### Mobile:
- [ ] API client working
- [ ] Auth interceptors active
- [ ] Stores configured
- [ ] Services implemented
- [ ] Screens updated
- [ ] Offline queue ready
- [ ] Built for iOS & Android
- [ ] Tested on devices

### Database:
- [ ] Tables created
- [ ] Indexes on frequently queried columns
- [ ] Foreign keys set up
- [ ] Constraints enforced
- [ ] Backup configured
- [ ] Audit logging enabled

---

## 10. TESTING STRATEGY

### Unit Tests:
- API client methods
- Store reducers
- Validation functions
- Sync logic

### Integration Tests:
- Web  Backend
- Mobile  Backend
- Database operations
- Auth flows

### End-to-End Tests:
- Create user (web)  See on mobile
- Edit offer (mobile)  Reflect on web
- Delete card (web)  Sync to mobile
- Offline  Online transition

### Load Tests:
- 1000 concurrent users
- Sync 10,000 records
- Handle bulk operations

---

## 11. MONITORING & ALERTS

### Metrics to Track:
- API response times
- Error rates
- Sync success rate
- Mobile app crashes
- Database query performance
- JWT token refresh rate

### Alerts:
- API down > 1 minute
- Error rate > 5%
- Sync failure > 10%
- Database query > 5s
- Mobile crash rate > 2%

---

## 12. NEXT STEPS (Execution Order)

1. **API Endpoints**: Verify all backend endpoints exist
2.  **Web Pages**: Finish all management pages
3.  **API Integration**: Complete web  backend sync
4.  **Mobile Services**: Implement all service layers
5.  **Sync Logic**: Implement real-time + offline-first
6.  **Testing**: Comprehensive test suite
7.  **Deployment**: Deploy to staging  production
8.  **Monitoring**: Set up alerting + dashboards
9.  **Documentation**: Complete API + mobile docs
10.  **Training**: Team onboarding + knowledge transfer

