# Environment Setup & Database Configuration

**Date:** December 29, 2025
**Status:** MOCK BACKEND ACTIVE (Web Portal running with fallback data)

---

## Current System Status

###  Running Services

#### Web Portal (Next.js)
- **URL:** http://localhost:3000
- **Status:** Running (port 3000)
- **Environment:** .env.local configured
- **Data Source:** Using mock data from `lib/mockData.ts` (575+ test records)
- **API Target:** http://localhost:8080/v1 (with fallback to mock)

#### Mobile App (Expo)
- **URL:** exp://192.168.1.216:8081
- **Status:** Metro bundler active
- **Modules:** 1521 compiled
- **Data Source:** Same fallback mock data as web

#### Backend API (Spring Boot)
- **Target Port:** 8080
- **Status:**  Not running (PostgreSQL database unavailable)
- **Requirements:** PostgreSQL 16, Redis, Kafka
- **Current:** Using mock API fallback

---

##  Current Blockers & Solutions

### Issue 1: PostgreSQL Database
**Problem:** Spring Boot backend requires PostgreSQL 16, which isn't available locally.

**Status:** Attempted installation via Homebrew - socket/permission issues encountered

**Workaround:** API fallback system active in frontend
- Frontend `lib/api.ts` automatically returns mock data when backend unavailable
- No database setup required for current development

**To Enable Live Backend:**
```bash
# 1. Restart PostgreSQL service
brew services start postgresql@16

# 2. Create development database
createdb -U postgres campcard_dev

# 3. Start backend
cd /repos/camp-card-backend
./mvnw spring-boot:run
```

### Issue 2: Redis & Kafka
**Problem:** Spring Boot includes Redis caching and Kafka event streaming.

**Status:** Not running (development can proceed without these services)

**Note:** These are optional for development - mock data path requires neither service.

---

##  Environment Configuration Files

### Web Portal Configuration
**File:** `/repos/camp-card-web/.env.local`

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=camp-card-dev-secret-key-32chars-...
```

**Status:** Configured and ready

### Backend Configuration
**File:** `/repos/camp-card-backend/.env`

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campcard_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=...
```

**Status:** Configured (ready when PostgreSQL available)

### Mobile App Configuration
**Location:** `/repos/camp-card-mobile/`

**Environment File:** `.env` (follows same API_URL pattern)

**Status:** Using backend API with fallback to web mock data

---

## Mock Data Overview

**Location:** `/repos/camp-card-web/lib/mockData.ts`

**Contains:**
- **mockUsers** - 100 users (ADMIN, COUNCIL_ADMIN, TROOP_LEADER, SCOUT)
- **mockCouncils** - 10 councils with 450-600 scouts each
- **mockTroops** - 300 troop units across councils
- **mockMerchants** - 100+ merchants with multi-location support
- **mockOffers** - 25 diverse offers (1X_USE and REUSABLE)
- **mockCards** - 100 camp cards with status filtering
- **Total Records:** 575+

**Fallback Mechanism:**
```typescript
// In lib/api.ts
async function apiCall<T>(...) {
 try {
 // Try to fetch from actual backend at http://localhost:8080
 const response = await fetch(`${API_BASE_URL}${endpoint}`, ...);
 } catch (error) {
 // Fallback to mock data if backend unavailable
 return mockUsers | mockCouncils | mockTroops | ...;
 }
}
```

---

## Development Workflow

### Current Setup (Mock Data)
```bash
# 1. Web portal is running on port 3000
npm run dev # Already running

# 2. Mobile app (optional)
cd /repos/camp-card-mobile
npm start

# 3. Navigate to councils and users pages
# - All data is mock data
# - Changes are not persisted (frontend state only)
# - New troop leaders search feature is active with mock data
```

### Switching to Live Backend (When PostgreSQL Available)

```bash
# Step 1: Ensure PostgreSQL is running
brew services start postgresql@16

# Step 2: Create database and schema
createdb -U postgres campcard_dev
cd /repos/camp-card-backend
./mvnw flyway:migrate # Runs Flyway migrations

# Step 3: Start Spring Boot backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Step 4: Verify backend is responding
curl http://localhost:8080/actuator/health

# Step 5: Web portal automatically connects
# - No code changes needed
# - API client redirects to live backend
# - Changes are persisted to database
```

---

## Data Flow Architecture

```

 Web Portal 
 (Next.js) 
 Port: 3000 

 
  [TRY] http://localhost:8080/v1 (Backend API)
 
  [FALLBACK] lib/mockData.ts (Mock Data)



 Backend API  ( Not running - PostgreSQL unavailable)
 (Spring Boot 3.2) 
 Port: 8080 

 
  PostgreSQL (Port 5432) [UNAVAILABLE]
 campcard_dev database



 Mobile App  ( Running)
 (Expo / React Native)
 Port: 8081 

 
  Same API fallback as web portal
```

---

##  Technology Stack

### Web Portal
- **Framework:** Next.js 14.1.0
- **Language:** TypeScript
- **Auth:** NextAuth.js
- **State Management:** React hooks (useState, useEffect)
- **UI Styling:** Tailwind CSS
- **API Client:** Custom fetch wrapper with fallback

### Backend
- **Framework:** Spring Boot 3.2
- **Language:** Java 21
- **Database:** PostgreSQL 16
- **ORM:** JPA/Hibernate
- **Security:** JWT + Spring Security
- **Caching:** Redis (optional)
- **Event Streaming:** Kafka (optional)
- **Build:** Maven 3.9+

### Mobile
- **Framework:** React Native (Expo)
- **Build System:** Expo CLI
- **Package Manager:** npm/yarn
- **Platform Support:** iOS, Android

---

## Feature Implementation Status

### Troop Leader Management (Implemented)
**Status:** Code implemented and running

**Council Page** (`/councils`)
- Search for existing troop leaders by name/email
- Select from dropdown to add to troop unit
- Real-time filtering of leader list
- Lines: 669-750

**Users Page** (`/users`)
- Create new troop leader users
- Assign TROOP_LEADER role
- Sync to API/database
- Lines: 130+

**Data Flow:**
1. Users page: Create new TROOP_LEADER  API call
2. Council page: Fetch users  Filter by TROOP_LEADER role  Show in dropdown
3. Council page: Select leader  Add to troop unit

---

## Known Issues & Workarounds

| Issue | Status | Workaround |
|-------|--------|-----------|
| PostgreSQL not installed | Blocker | Using mock data fallback |
| Redis not running |  Optional | Not needed for basic dev |
| Kafka not running |  Optional | Not needed for basic dev |
| Docker unavailable |  Note | Local Homebrew installation used |
| Port 8080 in use |  Check | Verify with `lsof -i :8080` |

---

##  Documentation References

- **Backend Setup:** `/repos/camp-card-backend/README.md`
- **Web Portal Setup:** `/repos/camp-card-web/README.md`
- **Mobile Setup:** `/repos/camp-card-mobile/README.md`
- **API Documentation:** `http://localhost:8080/swagger-ui.html` (when backend running)

---

## Next Steps

1. **Web portal is running** - accessing at http://localhost:3000
2. **Mock data is active** - 575+ test records available
3. **Troop leader feature implemented** - search/add working with mock data
4.  **Optional: Set up PostgreSQL** - for live data persistence
5.  **Optional: Configure Redis/Kafka** - for advanced features (not needed for core dev)

---

##  Quick Reference

### Start Development
```bash
# Web Portal (if not already running)
cd /repos/camp-card-web
npm run dev

# Mobile (optional)
cd /repos/camp-card-mobile
npm start
```

### Check Service Status
```bash
# Web Portal
curl http://localhost:3000

# Backend
curl http://localhost:8080/actuator/health

# PostgreSQL
pg_isready -h localhost -p 5432
```

### View Logs
```bash
# Web Portal dev server
# (displayed in terminal where npm run dev was executed)

# Backend (when running)
# (displayed in terminal where ./mvnw spring-boot:run was executed)
```

---

**Last Updated:** 2025-12-29
**Configuration Status:** Development Ready (Mock Backend)
