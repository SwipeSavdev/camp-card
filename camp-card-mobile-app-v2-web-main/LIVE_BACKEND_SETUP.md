# Live Backend Setup Guide

**Status:** Web Portal running with fallback authentication
**Date:** December 29, 2025

## Current State

The system is currently configured to:
1. Use mock authentication in `NextAuth` (fallback mode)
2. Attempt to connect to backend at `http://localhost:8080/v1`
3. Fallback to mock data if backend unavailable

## To Use Live Backend & APIs

Follow these steps to enable the live Spring Boot backend with real database:

### Option 1: Using H2 In-Memory Database (Recommended for Dev)

**No setup required beyond Java!**

```bash
# 1. Navigate to backend directory
cd /repos/camp-card-backend

# 2. Start Spring Boot with dev profile (H2 in-memory DB)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Verify backend is running
curl http://localhost:8080/actuator/health

# Expected output:
# {"status":"UP"}

# 4. Backend is now live and web portal will automatically connect
# - No code changes needed
# - Web portal detects backend and uses live APIs
# - Mock data fallback still available if needed
```

**What happens:**
- Spring Boot starts with H2 in-memory database
- API endpoints available at `http://localhost:8080/v1`
- Web portal automatically connects
- Data persists during session (lost on restart)

### Option 2: Using PostgreSQL (Full Production Setup)

**Prerequisites:** PostgreSQL running locally

```bash
# 1. Ensure PostgreSQL is running
brew services start postgresql

# 2. Create database
createdb -U postgres campcard_dev

# 3. Update .env file with database credentials
nano /repos/camp-card-backend/.env
# Ensure these are set:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=campcard_dev
# DB_USERNAME=postgres
# DB_PASSWORD=postgres

# 4. Start Spring Boot (will use PostgreSQL)
cd /repos/camp-card-backend
mvn spring-boot:run

# 5. Verify backend
curl http://localhost:8080/actuator/health
```

---

## Web Portal Configuration

### Current Setup (.env.local)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=camp-card-dev-secret-key-32chars-...
```

### How Authentication Works

```
User Login  NextAuth CredentialsProvider
 
Tries Backend Auth:
 POST http://localhost:8080/v1/auth/login
 
  SUCCESS  Use live user data + JWT token
  FAIL  Fallback to mock authentication
```

### Fallback Authentication

If backend unavailable:
- Demo account: `test@example.com` / `password123`
- Or any user from mock data with any password
- Users from mock data: admin@campcard.com, leader1@troop.org, etc.

---

## API Endpoints

When backend is running, these endpoints are available:

### Users API
```
GET /api/v1/users - List all users
POST /api/v1/users - Create user
GET /api/v1/users/{id} - Get user by ID
PUT /api/v1/users/{id} - Update user
DELETE /api/v1/users/{id} - Delete user
```

### Councils API
```
GET /api/v1/councils - List councils
POST /api/v1/councils - Create council
GET /api/v1/councils/{id} - Get council
PUT /api/v1/councils/{id} - Update council
```

### Authentication
```
POST /api/v1/auth/login - Login with credentials
POST /api/v1/auth/logout - Logout
GET /api/v1/auth/me - Get current user
```

### Admin Operations
```
GET /api/v1/dashboard - Get dashboard data
GET /api/v1/reports - Get reports
POST /api/v1/export - Export data
```

---

## Testing the Live Backend

### 1. Start Backend
```bash
cd /repos/camp-card-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 2. Test Backend Health
```bash
curl http://localhost:8080/actuator/health
```

### 3. Open Web Portal
```bash
# Already running at:
http://localhost:3000/login
```

### 4. Login with Demo Credentials
```
Email: test@example.com
Password: password123
```

### 5. Verify Connection
- Check browser console (F12)
- Should see successful API calls to `http://localhost:8080/v1/...`
- No "fetch failed" errors

---

## Troubleshooting

### Backend Connection Issues

**Problem:** "Sign In Failed - fetch failed"
**Solution:**
1. Ensure backend is running: `curl http://localhost:8080/actuator/health`
2. Check .env file has `NEXT_PUBLIC_API_URL=http://localhost:8080/v1`
3. Restart web server: `npm run dev`

### H2 Database Issues

**Problem:** Backend won't start with H2
**Solution:**
```bash
# Ensure H2 dependency is in pom.xml
# Restart backend:
cd /repos/camp-card-backend
mvn clean spring-boot:run -Dspring-boot.run.profiles=dev
```

### PostgreSQL Connection

**Problem:** "Connection to server refused"
**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql

# Verify it's running
pg_isready

# Create database
createdb -U postgres campcard_dev
```

---

## Development Workflow

### Quick Start (Mock Data)
```bash
# Just use what's already running
http://localhost:3000/login
# No backend setup needed
```

### Live Development (With Backend)
```bash
# Terminal 1: Backend
cd /repos/camp-card-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2: Web Portal (already running)
# Just refresh browser - it will detect backend automatically
http://localhost:3000
```

---

## Key Files

### Backend
- Main config: `src/main/resources/application.yml`
- Dev profile: `src/main/resources/application-dev.yml` (uses H2)
- Environment: `.env`

### Web Portal
- API client: `lib/api.ts` (handles fallback)
- Auth: `app/api/auth/[...nextauth]/route.ts`
- Login page: `app/login/page.tsx`
- Config: `.env.local`

### Mock Data (Fallback)
- Location: `lib/mockData.ts`
- Users: 100+ mock users
- Credentials: Any user in mock data + any password

---

## Next Steps

1. **Option A - Use Mock Data (Current)**
 - Just login at http://localhost:3000/login
 - Demo: test@example.com / password123

2. **Option B - Start Live Backend (Recommended)**
 ```bash
 cd /repos/camp-card-backend
 mvn spring-boot:run -Dspring-boot.run.profiles=dev
 ```
 - Then refresh web portal
 - Automatic connection, no code changes

3. **Option C - Full PostgreSQL Setup**
 - Follow Option 2 above
 - All data persists to database
 - Production-ready setup

---

## Architecture

```

 Web Browser 
 (localhost:3000) 

 
  TRY  http://localhost:8080/v1 (Live Backend)
   Spring Boot running
   H2/PostgreSQL Database
   Full API functionality
 
  FALLBACK  Mock Data (lib/mockData.ts)
  100+ test users
  10+ councils
  Full demo functionality
```

**Smart Detection:** Web portal automatically uses whichever is available.

---

## Support

For issues or questions:
1. Check backend logs: Terminal where mvn spring-boot:run is running
2. Check web logs: F12 browser console
3. Check .env files are correct
4. Ensure ports 3000 (web) and 8080 (backend) are available

**Status:** Ready for development with live APIs
