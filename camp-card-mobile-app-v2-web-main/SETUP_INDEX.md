# Setup & Configuration Index

**Quick Reference for All Configuration**

---

## Documentation Files (Start Here)

### 1. **DATABASE_AND_API_CONFIGURATION.md** START HERE
 - Complete review of database & API setup
 - Current configuration status
 - Mock data overview
 - PostgreSQL setup instructions
 - How to switch between mock and live data

### 2. **ENVIRONMENT_SETUP.md**
 - Detailed environment configuration
 - Service status and blockers
 - Technology stack details
 - Mock data information
 - Development workflow guide

### 3. **SYSTEM_STATUS.md**
 - Current system status dashboard
 - Configuration review checklist
 - Feature implementation status
 - Testing scenarios
 - Verification steps

---

## Quick Start

### Already Running
```bash
# Web Portal
http://localhost:3000

# Data Source: Mock data (575+ test records)
# No database required
# Ready to test right now
```

### Environment Files
```
/repos/camp-card-web/.env.local [Web config]
/repos/camp-card-backend/.env [Backend config]
```

### Test the Feature
```bash
# 1. Open web portal
http://localhost:3000/councils

# 2. Expand council  Expand troop
# 3. Click "Add Leader" button
# 4. Expected: Search box for troop leaders appears
```

---

##  Two Modes of Operation

### Mode 1: Mock Data (Current - No Setup)
```bash
# Just run the web portal
cd /repos/camp-card-web
npm run dev

# Result: 575+ test records, instant performance
# No database needed
```

### Mode 2: PostgreSQL Live (Optional - 5 min setup)
```bash
# 1. Start PostgreSQL
brew services start postgresql@16

# 2. Create database
createdb -U postgres campcard_dev

# 3. Start backend
cd /repos/camp-card-backend
./mvnw spring-boot:run

# Result: Live data, persistent changes
# Automatic - no code changes needed
```

---

## Current Configuration

| Component | URL | Status | Data Source |
|-----------|-----|--------|-------------|
| Web Portal | http://localhost:3000 | Running | Mock Data |
| Backend API | http://localhost:8080 |  Ready | (when started) |
| Database | localhost:5432 |  Optional | PostgreSQL |
| Mobile | exp://192.168.1.216:8081 | Ready | Same fallback |

---

## Features Implemented

### Troop Leader Management
- **Council Page:** Search & add existing troop leaders
- **Users Page:** Create new troop leaders
- **Data Sync:** Bidirectional between pages
- **Search:** Real-time filtering by name/email
- **Status:** Fully working with mock data

---

## Configuration Files Locations

```
.env.local  /repos/camp-card-web/.env.local
.env  /repos/camp-card-backend/.env
mockData.ts  /repos/camp-card-web/lib/mockData.ts
API client  /repos/camp-card-web/lib/api.ts
Councils page  /repos/camp-card-web/app/councils/page.tsx
Users page  /repos/camp-card-web/app/users/page.tsx
```

---

## Verification Checklist

- Web portal running on port 3000
- Mock data available (575+ records)
- Troop leader search feature implemented
- Environment files configured
- API fallback system active
- Ready for feature testing

---

##  What's Configured

### Already Set Up
- Next.js web portal with mock data
- Expo mobile app ready
- Spring Boot backend configured
- Environment variables
- API fallback mechanism
- Troop leader feature implementation

### Ready When You Need It
-  PostgreSQL (optional)
-  Live backend API
-  Redis caching (optional)
-  Kafka streaming (optional)

---

## Common Commands

### Web Portal
```bash
# Start
cd /repos/camp-card-web
npm run dev

# Check status
lsof -i :3000

# Access
http://localhost:3000
```

### Backend (Optional)
```bash
# Start PostgreSQL
brew services start postgresql@16

# Create database
createdb -U postgres campcard_dev

# Start backend
cd /repos/camp-card-backend
./mvnw spring-boot:run

# Check status
curl http://localhost:8080/actuator/health
```

### Mobile (Optional)
```bash
# Start
cd /repos/camp-card-mobile
npm start

# Access
exp://192.168.1.216:8081
```

---

##  Need Help?

### Check Documentation
1. **Setup Questions:** See ENVIRONMENT_SETUP.md
2. **Database Questions:** See DATABASE_AND_API_CONFIGURATION.md
3. **Feature Status:** See SYSTEM_STATUS.md

### Troubleshooting
- Port in use? `lsof -i :3000`
- Clear cache? Hard refresh (Cmd+Shift+R)
- Restart server? `npm run dev`

---

## Status Summary

**Current State:** **DEVELOPMENT READY**

- Web portal running with mock data
- All features implemented
- Ready to test and develop
- Can switch to live database anytime

**No action required** - you can start testing now!

---

**Last Updated:** 2025-12-29
**Configuration Status:** Complete
