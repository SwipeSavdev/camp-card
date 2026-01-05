# Database Connection Testing Guide

## Overview
This document explains how to test the database connections between the mobile app, backend API, and database.

## Prerequisites
1. **Java 17 and Maven** installed
 ```bash
 brew install openjdk@17 maven
 ```

2. **Add Java to PATH**
 ```bash
 export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
 ```

## Backend Server

### Configuration
- **Profile**: dev (uses H2 in-memory database)
- **Port**: 8080
- **API Base URL**: http://localhost:8080/api/v1
- **Health Endpoint**: http://localhost:8080/api/v1/health

### Start Backend Server
```bash
cd backend
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait for the message: `Started CampcardApplication in X seconds`

### Verify Backend is Running
```bash
curl http://localhost:8080/api/v1/health
```

Expected response:
```json
{
 "status": "UP",
 "database": "connected"
}
```

## Mobile App

### Start Mobile App
```bash
cd mobile
npx expo start
```

### Test Connection from App

**Option 1: Use Login Screen Test Button**
1. Open the app on your device/simulator
2. On the Login screen, tap the "Test Database Connection" button
3. Check the console for detailed results

**Option 2: Test Signup Flow**
1. Open the app
2. Navigate to Signup screen
3. Fill in the form:
 - First Name: Test
 - Last Name: User
 - Email: test@example.com
 - Phone: 555-1234567
 - Password: password123
 - Confirm Password: password123
4. Tap "Sign Up"
5. If successful, you'll be logged in automatically

**Option 3: Programmatic Testing**
Add to `App.tsx` or any component:
```typescript
import { runAllTests } from './src/utils/testConnection';

// Run on app load
useEffect(() => {
 runAllTests().then(results => {
 console.log('Test Results:', results);
 });
}, []);
```

## Test Functions

### 1. testDatabaseConnection()
Tests the health endpoint to verify backend is running.

### 2. testUserRegistration()
Creates a test user with timestamp-based email to avoid duplicates.

### 3. testUserLogin()
Tests authentication with provided credentials.

### 4. runAllTests()
Runs all three tests sequentially and returns summary.

## Expected Results

### Successful Test Output
```
==============================================
 TESTING DATABASE CONNECTION
==============================================

 Test 1: Database Connection
Endpoint: http://localhost:8080/api/v1/health
 Database connection successful
Response: { status: 'UP' }

 Test 2: User Registration
Endpoint: http://localhost:8080/api/v1/auth/signup
 User registration successful
User ID: 1
Email: testuser_1703...<@example.com>

 Test 3: User Login
Endpoint: http://localhost:8080/api/v1/auth/login
 User login successful
Access Token: eyJhbGciOiJIUzI1N...

==============================================
 ALL TESTS PASSED (3/3)
==============================================
```

### Failed Test Output
```
 Database connection failed
Error: Network Error
Details: Make sure backend server is running on http://localhost:8080
```

## Troubleshooting

### Backend Not Responding
1. Ensure backend is running: `ps aux | grep java`
2. Check logs in backend terminal
3. Verify port 8080 is not in use: `lsof -i :8080`

### Network Errors in Mobile App
1. Check API_BASE_URL in `/mobile/.env`
2. For iOS Simulator: Use `http://localhost:8080`
3. For Android Emulator: Use `http://10.0.2.2:8080`
4. For physical device: Use your computer's IP address (e.g., `http://192.168.1.100:8080`)

### CORS Errors
Backend should allow requests from all origins in dev mode. Check backend configuration.

### Database Errors
- H2 in-memory database resets on restart
- Check backend logs for Hibernate/JPA errors
- Verify schema migrations ran successfully

## Environment Variables

### Mobile App (.env)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Backend (application-dev.yml)
```yaml
spring:
 datasource:
 url: jdbc:h2:mem:campcard
 username: sa
 password:
```

## H2 Console

Access the H2 database console to view data:
```
http://localhost:8080/h2-console
```

Connection settings:
- JDBC URL: `jdbc:h2:mem:campcard`
- Username: `sa`
- Password: (empty)

## Production Database

For production, switch to PostgreSQL:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Ensure PostgreSQL is running and connection details are configured in `application.yml`.
