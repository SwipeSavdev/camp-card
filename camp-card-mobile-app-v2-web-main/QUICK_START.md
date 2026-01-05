# Quick Start: Using Live Backend & APIs

## Current Status

 **Web Portal:** http://localhost:3000 (Running)
 **Backend API:** http://localhost:8080 (Ready to start)

---

## Authentication Configuration

The web portal is now configured with **smart backend detection**:

```
Login  Check for Live Backend
  If Backend Running (8080)  Use Live API + JWT
  If Backend Unavailable  Fallback to Mock Data
```

### Demo Credentials (Always Work)
```
Email: test@example.com
Password: password123
```

### Mock User Accounts (If Backend Unavailable)
```
admin@campcard.com / (any password)
leader1@troop.org / (any password)
scout1@scout.org / (any password)
council1@bsa.org / (any password)
```

---

## Start Live Backend (2 Simple Steps)

### Step 1: Start Backend
```bash
cd /repos/camp-card-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

This starts:
- Spring Boot on port 8080
- H2 in-memory database (no setup needed!)
- Full API endpoints

### Step 2: Use Web Portal
```bash
# Just refresh the page
http://localhost:3000/login

# Login with credentials above
# Web portal will automatically detect backend
# No code changes needed!
```

---

## Verify Backend is Working

### Check Backend Health
```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

### Check API Connectivity
```bash
# List all users
curl http://localhost:8080/api/v1/users

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"password123"}'
```

---

## What's Working

### With Backend Running
- Live user authentication
- Real API calls to backend
- JWT token management
- Database persistence
- Full admin portal features

### Fallback to Mock (Backend Down)
- Demo credentials: test@example.com / password123
- Mock user accounts available
- Full UI testing possible
- No database required

---

## Configuration Files

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campcard_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=...
```

### Web Portal (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

**Note:** Already configured correctly - no changes needed!

---

## Troubleshooting

### "Sign In Failed" Error
**Solution:** Ensure backend is responding:
```bash
curl http://localhost:8080/actuator/health
```

If error, the web portal will fallback to mock data. Try demo credentials:
- Email: test@example.com
- Password: password123

### Backend Won't Start
**Solution:** Check Java is installed:
```bash
java -version
mvn -version
```

### Port 8080 Already in Use
**Solution:** Kill the process:
```bash
lsof -i :8080 # Find process
kill -9 <PID> # Kill it
```

---

## Full Documentation

For detailed setup instructions, see:
- **LIVE_BACKEND_SETUP.md** - Complete backend configuration
- **DATABASE_AND_API_CONFIGURATION.md** - API architecture
- **ENVIRONMENT_SETUP.md** - Environment variables

---

## Summary

| Aspect | Status | Details |
|--------|--------|---------|
| Web Portal | Running | http://localhost:3000 |
| Authentication | Smart Detection | Live API + Fallback |
| Backend |  Ready | Start with: `mvn spring-boot:run -Dspring-boot.run.profiles=dev` |
| Database | H2 In-Memory | No setup needed! |
| Mock Data | Available | Fallback when backend down |

---

## Next Step

**Run this command to start backend:**
```bash
cd /repos/camp-card-backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Then visit:**
```
http://localhost:3000/login
```

**Login with:**
```
test@example.com / password123
```

 **Done!** You're now using the live backend with real APIs.
