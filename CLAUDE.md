# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BSA Camp Card is a multi-repository platform for digitalizing Boy Scouts of America fundraising. The platform consists of three independent codebases with separate build systems:

- **Backend**: Java 21 / Spring Boot 3.2 REST API (port 7010)
- **Web Portal**: Next.js 14.1 admin/council dashboard (port 7020)
- **Mobile App**: React Native 0.81 / Expo 54

Supporting services: PostgreSQL 16, Redis 7, Apache Kafka 3.6, Firebase (push notifications), Stripe & Authorize.Net (payments).

## Repository Structure

```
camp-card/
├── backend/                                    # Java Spring Boot API
├── camp-card-mobile-app-v2-web-main/
│   └── repos/camp-card-web/                   # Next.js Web Portal
├── camp-card-mobile-app-v2-mobile-main/
│   └── mobile/                                # React Native App
├── camp-card-mobile-app-v2-infrastructure-main/
│   └── infrastructure/                        # Terraform AWS
├── docker-compose-local.yml                   # Full stack local
└── backend/docker-compose.yml                 # Services only
```

## Development Commands

### Backend (Java/Maven)

```bash
cd backend

# Start supporting services (PostgreSQL:7001, Redis:7002, Kafka:7004)
docker-compose up -d

# Run application (dev profile)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Build JAR
./mvnw clean package

# Run tests
./mvnw test
./mvnw test -Dtest=SubscriptionServiceTest    # Single test class

# Integration tests (requires Docker)
./mvnw verify -P integration-tests

# Code quality
./mvnw spotless:apply    # Format code
./mvnw checkstyle:check  # Style check

# Database migrations
./mvnw flyway:migrate
```

### Web Portal (Next.js)

```bash
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web

npm run dev          # Development server
npm run build        # Production build
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check
npm test             # Jest tests
npm run e2e          # Playwright E2E tests
npm run e2e:ui       # Playwright with UI
```

### Mobile App (React Native)

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile

npm start            # Metro bundler
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run lint:fix     # ESLint with auto-fix
npm run type-check   # TypeScript check
npm test             # Jest tests

# E2E tests (Detox)
npm run detox:build:ios && npm run detox:test:ios
npm run detox:build:android && npm run detox:test:android
```

### Docker (Full Stack)

```bash
# Start all services locally
docker-compose -f docker-compose-local.yml up -d

# Backend services only (from backend/)
cd backend && docker-compose up -d
```

## Local Development Ports

| Service     | Port |
|-------------|------|
| PostgreSQL  | 7001 |
| Redis       | 7002 |
| Zookeeper   | 7003 |
| Kafka       | 7004 |
| Kafka UI    | 7005 |
| Mailhog SMTP| 7006 |
| Mailhog UI  | 7007 |
| LocalStack  | 7008 |
| Backend API | 7010 |
| Web Portal  | 7020 |

## Architecture

### Backend API Structure

Entities exist in **two packages** (both scanned):
- `org.bsa.campcard.domain.user.User` - User entity
- `com.bsa.campcard.entity.*` - All other entities

```
src/main/java/
├── org/bsa/campcard/
│   ├── api/           # REST controllers
│   ├── domain/user/   # User entity and service
│   ├── config/        # Spring configs
│   └── security/      # JWT auth, TenantContext
└── com/bsa/campcard/
    ├── entity/        # JPA entities (Council, Merchant, Offer, etc.)
    ├── repository/    # Data access
    ├── service/       # Business logic
    └── dto/           # Request/response DTOs
```

Database migrations: `src/main/resources/db/migration/V*.sql` (Flyway)

**Database Security**:
- All tables in dedicated `campcard` schema (not `public`)
- Application uses `campcard_app` user (not `postgres` superuser)
- Schema managed exclusively by Flyway migrations with `ddl-auto: validate`
- RDS database baselined at V9

### Web Portal Structure

Next.js App Router with path alias `@/*` mapping to `src/`. Uses TanStack Query for data fetching, Zustand for state, Zod for validation, and Radix UI components with TailwindCSS.

### Mobile App Structure

React Native with Expo, React Navigation for routing, TanStack Query for data fetching, Zustand for state, and Firebase for push notifications.

## Authentication & Multi-Tenancy

- JWT-based auth with claims: `user_id`, `council_id`, `role`
- RBAC (Role-Based Access Control)
- Row-Level Security (RLS) via PostgreSQL policies and `TenantContext`
- API base path: `/api/v1/`

## Testing Requirements

- Coverage targets: 80% lines, 70% branches
- Backend: JUnit + Testcontainers for isolated PostgreSQL
- Web: Jest (jsdom) + Playwright (E2E)
- Mobile: Jest (react-native preset) + Detox (E2E)

## API Documentation

- Swagger UI: `http://localhost:7010/swagger-ui.html`
- OpenAPI spec: `http://localhost:7010/v3/api-docs`

## Commit Convention

```
feat(subscriptions): add POS claim link generation

Implements FR-045 for troop leaders to generate one-time claim links.

Closes #123
```

## AWS Deployment

### EC2 Server Details
- **IP Address**: 18.190.69.205
- **SSH User**: ubuntu
- **SSH Key**: `~/.ssh/campcard-ec2`
- **Domain**: https://bsa.swipesavvy.com

### Docker Containers on EC2
| Container | Image | Ports | Network |
|-----------|-------|-------|---------|
| campcard-backend | campcard-backend:latest | 7010 | campcard_campcard-network |
| campcard-web | campcard-web:latest | 7020 | campcard_campcard-network |
| campcard-mobile | ghcr.io/swipesavdev/camp-card/mobile:latest | 8081, 19000-19002 | campcard_campcard-network |
| campcard-redis | redis:7-alpine | 6379 | campcard_campcard-network |
| campcard-kafka | confluentinc/cp-kafka:7.5.0 | 9092 | campcard_campcard-network |
| campcard-zookeeper | confluentinc/cp-zookeeper:7.5.0 | 2181 | campcard_campcard-network |

### Deployment Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/campcard-ec2 ubuntu@18.190.69.205

# Backend deployment
cd /home/ec2-user/camp-card/backend
sudo git pull origin main
sudo docker build -t campcard-backend:latest .
sudo docker stop campcard-backend && sudo docker rm campcard-backend
sudo docker run -d --name campcard-backend --restart unless-stopped -p 7010:7010 \
  -e SPRING_PROFILES_ACTIVE=aws \
  -e DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com \
  -e DB_PORT=5432 -e DB_NAME=campcard \
  -e DB_USERNAME=campcard_app -e DB_PASSWORD=CampCardApp2024Secure \
  -e JWT_SECRET='bsa-camp-card-super-secret-jwt-key-2025-that-is-very-long-and-secure' \
  -e JWT_EXPIRATION=86400000 \
  -e REDIS_HOST=campcard-redis -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=campcard123 \
  -e REDIS_SSL=false \
  --network campcard_campcard-network campcard-backend:latest

# Frontend deployment
cd /home/ec2-user/camp-card/camp-card-mobile-app-v2-web-main/repos/camp-card-web
sudo git pull origin main
sudo docker build --no-cache --build-arg NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1 -t campcard-web:latest .
sudo docker stop campcard-web && sudo docker rm campcard-web
sudo docker run -d --name campcard-web --restart unless-stopped -p 7020:7020 \
  -e NEXTAUTH_URL=https://bsa.swipesavvy.com \
  -e NEXTAUTH_SECRET='<nextauth-secret>' \
  -e NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1 \
  --network campcard_campcard-network campcard-web:latest

# Check container status
sudo docker ps -a

# View logs
sudo docker logs --tail 50 campcard-backend
sudo docker logs --tail 50 campcard-web

# Clean up disk space
sudo docker system prune -a --volumes -f
```

### Expo Go Mobile Testing
- **Tunnel URL**: Check with `sudo docker logs campcard-mobile | grep "Tunnel URL"`
- The mobile container runs Expo in tunnel mode for testing via Expo Go app

## User Roles (IMPORTANT)

The backend `UserRole` enum defines exactly 5 valid roles:

```java
public enum UserRole {
    NATIONAL_ADMIN,
    COUNCIL_ADMIN,
    TROOP_LEADER,
    PARENT,
    SCOUT
}
```

**All role references must use these exact uppercase values.** The frontend must match:
- Type definition: `type UserRole = 'NATIONAL_ADMIN' | 'COUNCIL_ADMIN' | 'TROOP_LEADER' | 'PARENT' | 'SCOUT'`
- Default values: `useState<UserRole>('SCOUT')`
- Comparisons: `item.role === 'TROOP_LEADER'`

Backend `@PreAuthorize` annotations must also use these exact role names with `ROLE_` prefix:
- `@PreAuthorize("hasRole('NATIONAL_ADMIN')")`
- `@PreAuthorize("hasAnyRole('NATIONAL_ADMIN', 'COUNCIL_ADMIN')")`

## Recent Fixes (January 2026)

### API Integration Fix - Role Mismatch Resolution

**Problem**: Users could not create Users, councils, merchants, offers, or save profile edits. The root cause was a mismatch between frontend role values and backend UserRole enum.

**Files Modified**:

1. **Frontend - Users Page** (`camp-card-mobile-app-v2-web-main/repos/camp-card-web/app/users/page.tsx`)
   - Changed `UserRole` type to use uppercase values
   - Updated `roleOptions` array to use uppercase values
   - Fixed all `setEditUserRole()` and `setNewUserRole()` calls to use `'SCOUT'`
   - Fixed troop leader filter: `item.role === 'TROOP_LEADER'`

2. **Frontend - Profile Page** (`camp-card-mobile-app-v2-web-main/repos/camp-card-web/app/profile/page.tsx`)
   - Added `import { api } from '@/lib/api'`
   - Modified `handleSave` to call `api.updateUser()` instead of just setting local state

3. **Backend Controllers** (all use valid role names now):
   - `MerchantController.java`: ADMIN → NATIONAL_ADMIN, MERCHANT → NATIONAL_ADMIN/COUNCIL_ADMIN
   - `OfferController.java`: ADMIN → NATIONAL_ADMIN, MERCHANT → NATIONAL_ADMIN/COUNCIL_ADMIN
   - `ScoutController.java`: ADMIN → NATIONAL_ADMIN, SCOUTMASTER → TROOP_LEADER
   - `NotificationController.java`: SUPER_ADMIN → NATIONAL_ADMIN
   - `PaymentController.java`: SUPER_ADMIN → NATIONAL_ADMIN
   - `QRCodeController.java`: SUPER_ADMIN → NATIONAL_ADMIN

**Commits**:
- `0c59056` - fix: Use uppercase role constants consistently throughout Users page
- `917e5f0` - fix: Use uppercase SCOUT role in setters to match UserRole type
- `3f2fc7c` - fix: Align backend role names with UserRole enum and fix frontend API integration

### Backend Container Configuration (January 2026)

The backend container requires specific environment variables for Redis:

```bash
sudo docker run -d --name campcard-backend --restart unless-stopped -p 7010:7010 \
  -e SPRING_PROFILES_ACTIVE=aws \
  -e DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com \
  -e DB_PORT=5432 -e DB_NAME=campcard \
  -e DB_USERNAME=campcard_app -e DB_PASSWORD=CampCardApp2024Secure \
  -e JWT_SECRET='bsa-camp-card-super-secret-jwt-key-2025-that-is-very-long-and-secure' \
  -e JWT_EXPIRATION=86400000 \
  -e REDIS_HOST=campcard-redis -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=campcard123 \
  -e REDIS_SSL=false \
  --network campcard_campcard-network campcard-backend:latest
```

**Important**: `REDIS_SSL=false` is required because the local Redis container on EC2 doesn't use TLS (the AWS profile defaults to SSL enabled).

### RDS Database Details (Updated January 2026)

- **Endpoint**: `camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com`
- **Port**: `5432`
- **Database**: `campcard`
- **Schema**: `campcard`
- **App User**: `campcard_app` / `CampCardApp2024Secure`
- **Master User**: `postgres` (password in AWS)

### Test Credentials

- **Admin User**: `admin@campcard.org` / `Test1234` (role: NATIONAL_ADMIN)
- **Test User**: `test@campcard.org` / `Test1234` (role: SCOUT)

### Password Hashing Notes

- Backend uses `BCryptPasswordEncoder` with strength 12
- Password hashes must start with `$2a$12$` (Java BCrypt format)
- Python bcrypt generates `$2b$` which is compatible but different prefix
- To create a valid hash, register a new user and copy the password_hash from the database

### JWT Token Expiration Fix (January 2026)

**Problem**: Council/Troop creation failed with "Failed to create council" error after ~15 minutes of being logged in. Backend logs showed: `Invalid JWT token: JWT expired`.

**Root Cause**:
- Backend JWT expiration was 15 minutes (900000ms)
- NextAuth session was 24 hours
- Frontend had no token refresh mechanism

**Solution**:
1. **Backend** (`application-aws.yml`): Changed JWT expiration from 15 minutes to 24 hours
   ```yaml
   security:
     jwt:
       expiration: ${JWT_EXPIRATION:86400000}  # 24 hours
   ```

2. **Frontend** (`app/api/auth/[...nextauth]/route.ts`): Added automatic token refresh
   - Added `refreshAccessToken()` helper function
   - Updated `jwt` callback to track `accessTokenExpires` and call refresh when needed
   - Updated `session` callback to pass refresh errors to client

**Files Modified**:
- `backend/src/main/resources/application-aws.yml` - JWT expiration from 900000 to 86400000
- `camp-card-web/app/api/auth/[...nextauth]/route.ts` - Added token refresh logic

### Expo Go Mobile Testing

The mobile container runs Expo in tunnel mode:
- **Current Tunnel URL**: `https://easl_4o-anonymous-8081.exp.direct`
- Check for current URL: `sudo docker logs campcard-mobile | grep "Tunnel URL"`
- Install Expo Go on your phone and enter the tunnel URL to test the app