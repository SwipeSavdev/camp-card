# Complete Platform Deployment & Testing Guide

## PHASE 1: Backend Verification & Setup

### Step 1: Verify All Endpoints Exist

```bash
cd repos/camp-card-backend

# Start backend
mvn spring-boot:run

# Test endpoints (in another terminal)
curl -X GET http://localhost:8080/health
curl -X GET http://localhost:8080/users
curl -X GET http://localhost:8080/merchants
curl -X GET http://localhost:8080/offers
curl -X GET http://localhost:8080/camp-cards
curl -X GET http://localhost:8080/organizations
```

### Step 2: Database Setup

```bash
# Run migrations
cd repos/camp-card-backend
bash setup_database.sh

# Verify tables created
# Connect to PostgreSQL and check:
# - users table
# - organizations table
# - merchants table
# - offers table
# - camp_cards table
```

### Step 3: Environment Configuration

Create/update `.env` files:

**Backend** (`camp-card-backend/application.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/campcard
spring.datasource.username=postgres
spring.datasource.password=your-password
spring.jpa.hibernate.ddl-auto=validate
server.port=8080
jwt.secret=your-secret-key-min-32-chars
redis.host=localhost
redis.port=6379
```

**Web Portal** (`camp-card-web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars
```

**Mobile** (`camp-card-mobile/.env`):
```env
API_BASE_URL=http://localhost:8080
API_TIMEOUT_MS=30000
ENABLE_MOCK_DATA=false
```

---

## PHASE 2: Web Portal Setup & Testing

### Step 1: Start Web Dev Server

```bash
cd repos/camp-card-web

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev

# Should be at http://localhost:3000
```

### Step 2: Test Login Flow

```
1. Open http://localhost:3000/login
2. Enter backend-provided credentials
3. Should redirect to /dashboard
4. Verify session is active
```

### Step 3: Test Dashboard

```
Verify these sections load:
- Welcome message with user name
- Stats cards (Users, Merchants, Offers, Redemptions)
- System status alert
- Recent activity timeline
- Quick action buttons
```

### Step 4: Test Data Pages (Create Based on Guide)

For each page below, create using `WEB_PAGES_IMPLEMENTATION_GUIDE.md`:

```bash
# Create page files:
touch app/users/page.tsx
touch app/organizations/page.tsx
touch app/merchants/page.tsx
touch app/offers/page.tsx
touch app/camp-cards/page.tsx
touch app/analytics/page.tsx
touch app/settings/page.tsx
```

Test each with:
```
1. Navigate to page
2. Verify data loads from API
3. Test search/filter
4. Test add/edit/delete buttons
5. Verify error messages on failure
```

### Step 5: API Integration Testing

```typescript
// Quick test in browser console or test file
fetch('http://localhost:8080/users', {
 headers: {
 'Authorization': 'Bearer {token}',
 'Content-Type': 'application/json'
 }
})
.then(r => r.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## PHASE 3: Mobile App Integration

### Step 1: Configure Mobile Environment

```bash
cd repos/camp-card-mobile

# Update API URL in .env or config
# Make sure NEXT_PUBLIC_API_URL points to backend
```

### Step 2: Verify API Client

```bash
# Check that apiClient.ts has:
# - Correct baseURL
# - Auth interceptors
# - Token refresh logic
# - Error handling
npm test -- apiClient.test.ts
```

### Step 3: Initialize Sync Manager

```typescript
// In App.tsx or Root component
import { initializeSyncManager } from '@/services/syncManager';

useEffect(() => {
 initializeSyncManager(
 window.localStorage,
 apiClient,
 console
 );
}, []);
```

### Step 4: Test Data Fetching

```typescript
// In test or development console
import { platformServices } from '@/services/platformServices';

// Test each service
const users = await platformServices.users.list();
const merchants = await platformServices.merchants.list();
const offers = await platformServices.offers.list();

console.log('Users:', users);
console.log('Merchants:', merchants);
console.log('Offers:', offers);
```

### Step 5: Test Offline Functionality

```typescript
// Simulate offline
window.dispatchEvent(new Event('offline'));

// Queue an operation
const syncManager = getSyncManager();
await syncManager?.queueOperation('create', 'user', {
 email: 'test@example.com',
 fullName: 'Test User'
});

// Check queue
console.log(syncManager?.getStatus());
// Should show: { pending: 1, syncing: 0, ... }

// Go back online
window.dispatchEvent(new Event('online'));

// Wait for sync
await new Promise(r => setTimeout(r, 2000));

// Check status again - should be synced
console.log(syncManager?.getStatus());
```

---

## PHASE 4: End-to-End Testing

### Test 1: Create User via Web, Verify on Mobile

```
1. Open web portal  Users page
2. Click "Add User"
3. Fill form and submit
4. In mobile: Pull to refresh  Should see new user
5. Verify timestamp matches
```

### Test 2: Edit on Mobile, Verify on Web

```
1. Open mobile app  Users list
2. Edit a user (change name)
3. Go back and sync
4. Open web portal  Users page
5. Should see updated user
```

### Test 3: Offline Create, Sync When Online

```
1. In mobile: Toggle offline mode
2. Create a new user
3. App should show "offline" indicator
4. Go back online
5. Auto-sync should trigger
6. Verify on web portal
```

### Test 4: Conflict Resolution

```
1. Edit same user on both web and mobile
2. Trigger save on both within 2 seconds
3. One should fail with conflict
4. User should see conflict resolution modal
5. Choose to use local or remote version
6. Verify resolution reflected in database
```

### Test 5: Bulk Operations

```
1. Web: Bulk import 100 users
2. Mobile: Navigate to users while importing
3. Should see progressive sync
4. All 100 should eventually appear
5. No data loss or duplication
```

---

## PHASE 5: Performance & Load Testing

### Test API Response Times

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8080/users

# Should complete in < 10 seconds
# No errors
# Consistent response times
```

### Test Database Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Verify indexes on frequently queried columns
SELECT * FROM pg_indexes
WHERE tablename IN ('users', 'organizations', 'merchants', 'offers');
```

### Test Mobile App Performance

```bash
# Monitor memory usage
adb shell dumpsys meminfo com.campcard.mobile | grep TOTAL

# Monitor network usage
adb shell dumpsys netstats

# Check CPU usage
adb shell top -n 1 | grep campcard
```

---

## PHASE 6: Deployment to Production

### Step 1: Backend Deployment

```bash
# Build JAR
cd repos/camp-card-backend
mvn clean package -DskipTests

# Deploy to server
scp target/campcard-1.0.0-SNAPSHOT.jar user@server:/opt/campcard/
ssh user@server
cd /opt/campcard
java -jar campcard-1.0.0-SNAPSHOT.jar --server.port=8080
```

### Step 2: Web Portal Deployment

```bash
cd repos/camp-card-web

# Build for production
npm run build

# Test production build locally
npm start

# Deploy to hosting (Vercel, AWS, etc)
vercel --prod # If using Vercel
# Or build and deploy Docker container
```

### Step 3: Mobile App Deployment

```bash
cd repos/camp-card-mobile

# Build for iOS
eas build --platform ios --auto-submit

# Build for Android
eas build --platform android --auto-submit

# Alternative: Local builds
# iOS: `cd ios && xcodebuild -workspace CampCard.xcworkspace`
# Android: `./gradlew assembleRelease`
```

### Step 4: Monitoring Setup

```bash
# Backend: Add logging and monitoring
# - Log all API calls
# - Monitor error rates
# - Track response times
# - Alert on failures

# Web: Add error tracking
# - Sentry integration
# - User event tracking
# - Performance monitoring

# Mobile: Add crash tracking
# - Firebase Crashlytics
# - Event tracking
# - Performance monitoring
```

---

## PHASE 7: Verification Checklist

### Backend
- [ ] All endpoints return correct data
- [ ] Authentication working (JWT)
- [ ] Database synced with models
- [ ] Error handling returns proper codes
- [ ] Rate limiting enabled
- [ ] CORS configured for web + mobile domains
- [ ] Logging captures all operations
- [ ] Health check endpoint works
- [ ] Database backups configured
- [ ] Monitoring alerts set up

### Web Portal
- [ ] All pages load and display data
- [ ] CRUD operations work for all entities
- [ ] Search and filter functional
- [ ] Responsive design works on mobile browser
- [ ] Error messages display clearly
- [ ] Loading states show
- [ ] Session refresh works
- [ ] Logout clears session
- [ ] Performance > 2 second page load
- [ ] No console errors

### Mobile App
- [ ] Login works
- [ ] Data displays from API
- [ ] Offline mode queues operations
- [ ] Online mode syncs immediately
- [ ] No app crashes
- [ ] Permissions requested properly
- [ ] Network timeout handling
- [ ] Token refresh automatic
- [ ] Sync status shows to user
- [ ] Conflict resolution works

### Database
- [ ] All tables have proper indexes
- [ ] Foreign keys enforced
- [ ] Cascade deletes work
- [ ] Data consistency maintained
- [ ] Backups run daily
- [ ] Restore tested monthly
- [ ] Query performance adequate
- [ ] Disk space monitored
- [ ] Log tables managed
- [ ] Audit trail maintained

---

## Troubleshooting

### Issue: CORS Errors

```
Solution: Update backend CORS configuration
application.properties:
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:8081
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE
spring.web.cors.allow-credentials=true
```

### Issue: Auth Tokens Failing

```
Solution: Check token expiry and refresh logic
1. Verify JWT secret matches web and backend
2. Check token expiry time (default 1 hour)
3. Verify refresh token is stored
4. Test token refresh endpoint
```

### Issue: Data Not Syncing

```
Solution: Debug sync process
1. Check network connection
2. Verify API endpoint URL correct
3. Check token in headers
4. Look at sync manager queue
5. Check for 401 errors
6. Verify data format matches API spec
```

### Issue: Offline Queue Not Working

```
Solution: Verify sync manager initialization
1. Check syncManager initialized in root
2. Verify localStorage available
3. Check sync queue items in storage
4. Verify apiClient used by syncManager
5. Test manual syncAll() call
```

---

## Success Criteria

 **Platform is ready for production when:**
- All 3 systems (backend, web, mobile) communicate
- Users can create, read, update, delete data
- Mobile can work offline and sync online
- Data consistency maintained across platforms
- No errors in production logs
- Load tests pass (1000 concurrent users)
- All security measures in place
- Documentation complete
- Team trained on deployment

