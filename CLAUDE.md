# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BSA Camp Card is a multi-repository platform for digitalizing Boy Scouts of America fundraising. The platform consists of three independent codebases with separate build systems:

- **Backend**: Java 21 / Spring Boot 3.2 REST API (port 7010)
- **Web Portal**: Next.js 14.1 admin/council dashboard (port 7020)
- **Mobile App**: React Native 0.81 / Expo 54

Supporting services: PostgreSQL 16, Redis 7, Apache Kafka 3.6, Firebase (push notifications), Authorize.Net (payments).

## Payment Processing (IMPORTANT)

**This project uses Authorize.net exclusively for payment processing - NOT Stripe.**

- **Payment Gateway**: Authorize.net
- **Integration Method**: Accept Hosted / Accept.js for tokenization
- **Environment Variables**:
  - `AUTHORIZE_NET_API_LOGIN_ID` - Authorize.net API Login ID
  - `AUTHORIZE_NET_TRANSACTION_KEY` - Authorize.net Transaction Key
  - `AUTHORIZE_NET_ENVIRONMENT` - SANDBOX or PRODUCTION

- **Council-Specific Payment Configs**: Each council can have its own Authorize.net gateway credentials stored encrypted (AES-256-GCM) in the `council_payment_configs` table.

- **Backend Service**: `PaymentService.java` handles all Authorize.net API calls
- **Mobile Integration**: Uses Authorize.net Accept.js for card tokenization (not Stripe)
- **Web Portal Integration**: Uses Authorize.net Accept Hosted for PCI-compliant checkout

**DO NOT use Stripe APIs, SDKs, or payment method references in this codebase.**

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

### Production URLs (campcardapp.org)

| Service | URL | Description |
|---------|-----|-------------|
| **Static Website** | https://www.campcardapp.org | Marketing/landing page |
| **API** | https://api.campcardapp.org | Backend REST API for mobile app |
| **Admin Portal** | https://admin.campcardapp.org | Web portal for admins/councils |
| **Root Domain** | https://campcardapp.org | Redirects to www |

### EC2 Server Details
- **Instance ID**: i-059295c02fec401db
- **IP Address**: 3.137.164.102
- **SSH User**: ec2-user
- **SSH Key**: `~/.ssh/campcard-github-actions`
- **SSH Command**: `ssh -i ~/.ssh/campcard-github-actions ec2-user@3.137.164.102`

### DNS Configuration (Route 53)

| Record | Type | Value |
|--------|------|-------|
| campcardapp.org | A | 3.137.164.102 |
| www.campcardapp.org | A | 3.137.164.102 |
| api.campcardapp.org | A | 3.137.164.102 |
| admin.campcardapp.org | A | 3.137.164.102 |

### SSL Certificates (Let's Encrypt)
- Certificate for `campcardapp.org`, `www.campcardapp.org`, `admin.campcardapp.org`
- Separate certificate for `api.campcardapp.org`
- Auto-renewal configured via Certbot

### Docker Containers on EC2
| Container | Image | Ports | Network |
|-----------|-------|-------|---------|
| campcard-backend | campcard-backend:latest | 7010 | campcard_campcard-network |
| campcard-web | campcard-web:latest | 7020 | campcard_campcard-network |
| campcard-mobile | ghcr.io/swipesavdev/camp-card/mobile:latest | 8081, 19000-19002 | campcard_campcard-network |
| campcard-redis | redis:7-alpine | 6379 | campcard_campcard-network |
| campcard-kafka | confluentinc/cp-kafka:7.5.0 | 9092 | campcard_campcard-network |
| campcard-zookeeper | confluentinc/cp-zookeeper:7.5.0 | 2181 | campcard_campcard-network |

### Nginx Configuration

The Nginx configuration (`/etc/nginx/sites-available/campcardapp`) routes traffic:
- `www.campcardapp.org` → Static files at `/var/www/campcard`
- `api.campcardapp.org` → Backend at port 7010
- `admin.campcardapp.org` → Web portal at port 7020 (with `/api/v1/` proxied to backend)
- `campcardapp.org` → Redirects to `www.campcardapp.org`

### Deployment Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/campcard-github-actions ec2-user@3.137.164.102

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
  -e KAFKA_BOOTSTRAP_SERVERS=campcard-kafka:9092 \
  -e SMTP_HOST=email-smtp.us-east-2.amazonaws.com \
  -e SMTP_PORT=587 \
  -e SMTP_USERNAME=${SMTP_USERNAME} \
  -e SMTP_PASSWORD=${SMTP_PASSWORD} \
  -e CAMPCARD_BASE_URL=https://api.campcardapp.org \
  -e CAMPCARD_WEB_PORTAL_URL=https://admin.campcardapp.org \
  -e AUTHORIZE_NET_API_LOGIN_ID=${AUTHORIZE_NET_API_LOGIN_ID} \
  -e AUTHORIZE_NET_TRANSACTION_KEY=${AUTHORIZE_NET_TRANSACTION_KEY} \
  -e AUTHORIZE_NET_ENVIRONMENT=SANDBOX \
  --network campcard_campcard-network campcard-backend:latest

# NOTE: SMTP and Authorize.net credentials stored in AWS Secrets Manager or .env.aws (not in git)

# Frontend deployment
cd /home/ec2-user/camp-card/camp-card-mobile-app-v2-web-main/repos/camp-card-web
sudo git pull origin main
sudo docker build --no-cache --build-arg NEXT_PUBLIC_API_URL=https://api.campcardapp.org/api/v1 -t campcard-web:latest .
sudo docker stop campcard-web && sudo docker rm campcard-web
sudo docker run -d --name campcard-web --restart unless-stopped -p 7020:7020 \
  -e NEXTAUTH_URL=https://admin.campcardapp.org \
  -e NEXTAUTH_SECRET='bsa-campcard-nextauth-secret-key-2025-very-long' \
  -e NEXT_PUBLIC_API_URL=https://api.campcardapp.org/api/v1 \
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
  -e KAFKA_BOOTSTRAP_SERVERS=campcard-kafka:9092 \
  -e SMTP_HOST=email-smtp.us-east-2.amazonaws.com \
  -e SMTP_PORT=587 \
  -e SMTP_USERNAME=${SMTP_USERNAME} \
  -e SMTP_PASSWORD=${SMTP_PASSWORD} \
  -e CAMPCARD_BASE_URL=https://api.campcardapp.org \
  -e CAMPCARD_WEB_PORTAL_URL=https://admin.campcardapp.org \
  -e AUTHORIZE_NET_API_LOGIN_ID=${AUTHORIZE_NET_API_LOGIN_ID} \
  -e AUTHORIZE_NET_TRANSACTION_KEY=${AUTHORIZE_NET_TRANSACTION_KEY} \
  -e AUTHORIZE_NET_ENVIRONMENT=SANDBOX \
  --network campcard_campcard-network campcard-backend:latest
```

**NOTE**: Credentials (SMTP_USERNAME, SMTP_PASSWORD, AUTHORIZE_NET_*) are stored in `.env.aws` file on EC2 server, NOT in version control.

**Important**: `REDIS_SSL=false` is required because the local Redis container on EC2 doesn't use TLS (the AWS profile defaults to SSL enabled).

### RDS Database Details (Updated January 2026)

- **Endpoint**: `camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com`
- **Port**: `5432`
- **Database**: `campcard`
- **Schema**: `campcard`
- **App User**: `campcard_app` / `CampCardApp2024Secure`
- **Master User**: `postgres` (password in AWS)

### Test Credentials

- **Admin User**: `admin@campcard.org` / `Password123` (role: NATIONAL_ADMIN)
- **Test User**: `test@campcard.org` / `Password123` (role: SCOUT)

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

### Email Service Configuration (January 2026)

**Problem**: Password reset emails were not being sent. Backend health check showed mail service DOWN with authentication error.

**Root Cause**:
- AWS SES SMTP credentials were not configured in environment variables
- Backend expected `SMTP_USERNAME` and `SMTP_PASSWORD` but they were missing

**Solution**:
1. **Created AWS SES SMTP credentials**:
   - IAM User: Created dedicated SES SMTP user
   - Access Key: Stored in `.env.aws` on EC2 (NOT in version control)
   - Converted IAM secret key to SES SMTP password using AWS algorithm

2. **Updated environment variables** (`.env.aws` on EC2):
   ```bash
   SMTP_HOST=email-smtp.us-east-2.amazonaws.com
   SMTP_PORT=587
   SMTP_USERNAME=<stored in .env.aws>
   SMTP_PASSWORD=<stored in .env.aws>
   ```

3. **Verified domain and sender**:
   - Domain: `campcardapp.org` (verified in SES with DKIM)
   - Sender: `no-reply@campcardapp.org` (verified)

**Test Results**:
- Backend health check: Mail service UP ✓
- Forgot password endpoint: Returns 200 OK ✓
- Email delivery: Confirmed in backend logs ✓

**Files Modified**:
- `.env.aws` - Added SMTP configuration
- Backend container command updated with SMTP environment variables

### Domain Migration to campcardapp.org (January 2026)

**Migrated from**: `bsa.swipesavvy.com` → **To**: `campcardapp.org`

**New Domain Structure**:
| URL | Service |
|-----|---------|
| https://www.campcardapp.org | Static marketing website |
| https://api.campcardapp.org | Backend REST API |
| https://admin.campcardapp.org | Admin portal (Next.js) |

**Configuration Changes**:
1. **Route 53**: Created hosted zone for `campcardapp.org` with A records for all subdomains
2. **Nginx**: Updated `/etc/nginx/sites-available/campcardapp` with routing for all subdomains
3. **SSL**: Let's Encrypt certificates for all domains via Certbot
4. **AWS SES**: Domain verified with DKIM for email sending from `campcardapp.org`

**Files Updated**:
- `mobile/src/config/constants.ts`: `API_BASE_URL` → `https://api.campcardapp.org`
- `.env.aws`: Updated `PUBLIC_API_URL`, `CAMPCARD_BASE_URL`, `CAMPCARD_WEB_PORTAL_URL`
- Docker containers rebuilt with new environment variables

### Expo Go Mobile Testing

The mobile container runs Expo in tunnel mode:
- **Current Tunnel URL**: `https://easl_4o-anonymous-8081.exp.direct`
- Check for current URL: `sudo docker logs campcard-mobile | grep "Tunnel URL"`
- Install Expo Go on your phone and enter the tunnel URL to test the app

### Mobile App Role-Based Navigation (January 2026)

The mobile app implements role-based access control (RBAC) with different navigation structures for each user role.

#### User Roles and Navigation

| Role | Theme | Bottom Tabs | Features |
|------|-------|-------------|----------|
| **SCOUT** | Red (#CE1126) | Home, My Cards, Profile | QR code for affiliate tracking, view-only offers, referrals |
| **TROOP_LEADER** | Blue (#003F87) | Home, Offers*, Troop, Scouts, Profile | Troop management, scout metrics, conditional offers access |
| **PARENT** | Gold (#FFD700) | Home, Offers, Merchants, Profile | Browse offers, view merchants |

*Offers tab only visible for Troop Leaders with `subscriptionStatus === 'active'`

#### Key Navigation Files

- **RootNavigator.tsx** (`mobile/src/navigation/RootNavigator.tsx`)
  - Entry point that routes to role-specific navigators
  - `ScoutMainNavigator`, `TroopLeaderMainNavigator`, `CustomerMainNavigator`
  - Conditional tab rendering based on subscription status

- **Navigation Types** (`mobile/src/types/navigation.ts`)
  - `ScoutStackParamList`, `ScoutTabParamList`
  - `TroopLeaderStackParamList`, `TroopLeaderTabParamList`
  - `CustomerStackParamList`, `CustomerTabParamList`

#### Troop Leader Screens

| Screen | File | Description |
|--------|------|-------------|
| TroopLeaderDashboard | `screens/troopLeader/TroopLeaderDashboardScreen.tsx` | Troop metrics and fundraising progress |
| ManageScouts | `screens/troopLeader/ManageScoutsScreen.tsx` | Add/remove/view scouts in troop |
| TroopStats | `screens/troopLeader/TroopStatsScreen.tsx` | Detailed troop statistics |
| InviteScouts | `screens/troopLeader/InviteScoutsScreen.tsx` | Send invitations to scouts |
| SelectScoutForSubscription | `screens/troopLeader/SelectScoutForSubscriptionScreen.tsx` | Select scout before subscription checkout |

#### Scout Screens

| Screen | File | Description |
|--------|------|-------------|
| ScoutDashboard | `screens/scout/ScoutDashboardScreen.tsx` | My Cards with QR code and affiliate stats (FR-16, FR-18, FR-19) |
| Subscription | `screens/scout/SubscriptionScreen.tsx` | Manage subscription plans |
| Referral | `screens/scout/ReferralScreen.tsx` | Referral tracking and sharing |

#### Subscription-Based Access Control

Troop Leaders have conditional access to the Offers tab based on their subscription status:

```typescript
// In TroopLeaderTabNavigator
const { user } = useAuthStore();
const hasActiveSubscription = user?.subscriptionStatus === 'active';

// Offers tab only shown if subscriptionStatus === 'active'
{hasActiveSubscription && (
  <TroopLeaderTab.Screen name="Offers" component={OffersNavigator} />
)}
```

The `subscriptionStatus` field must be returned by the backend `/api/v1/auth/login` or `/api/v1/auth/me` endpoints.

#### Profile Menu Items by Role

| Menu Item | Scout | Parent | Troop Leader |
|-----------|-------|--------|--------------|
| Subscription | ✓ | ✓ | ✓ |
| Referrals | ✓ | ✓ | ✗ |
| My QR Code | ✓ | ✓ | ✗ |
| Notifications | ✓ | ✓ | ✓ |

#### Test Credentials for Mobile

- **Scout**: Create via web portal with role `SCOUT`
- **Troop Leader**: Create via web portal with role `TROOP_LEADER`
- **Parent**: Create via web portal with role `PARENT`

Use the web admin portal (`/users` page) to create test users with specific roles.

### Mobile App Store Deployment (January 2026)

The mobile app is configured for deployment to iOS App Store and Google Play Store using Expo Application Services (EAS).

#### App Identifiers
- **iOS Bundle ID**: `org.bsa.campcard`
- **Android Package**: `org.bsa.campcard`
- **App Name**: Camp Card

#### Build Profiles (eas.json)

| Profile | Purpose | iOS Output | Android Output |
|---------|---------|------------|----------------|
| development | Testing with simulators | Simulator build | APK |
| preview | Internal testing (TestFlight/Internal) | IPA | APK |
| production | App Store/Play Store submission | IPA | AAB |

#### Build Commands

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile

# Development builds
npm run eas:build:dev

# Production builds for both platforms
npm run eas:build:prod

# iOS only
npm run eas:build:ios

# Android only
npm run eas:build:android

# Submit to stores
npm run eas:submit:ios      # App Store
npm run eas:submit:android  # Play Store
npm run eas:submit:all      # Both stores
```

#### Required Setup Before First Build

1. **EAS Login**: `eas login`
2. **Initialize Project**: `eas init` (updates app.json with projectId)
3. **Firebase Config Files**:
   - `GoogleService-Info.plist` (iOS) - from Firebase Console
   - `google-services.json` (Android) - from Firebase Console
4. **App Store Listings**:
   - Apple App Store Connect: Create app with bundle ID `org.bsa.campcard`
   - Google Play Console: Create app with package name `org.bsa.campcard`

#### Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo app configuration (icons, permissions, deep linking) |
| `eas.json` | EAS Build profiles and submit configuration |
| `APP_STORE_DEPLOYMENT.md` | Detailed deployment guide |
| `store-assets/app-store-metadata.json` | App store listing metadata |

#### Secrets Required (not in git)

- `google-services.json` - Android Firebase config
- `GoogleService-Info.plist` - iOS Firebase config
- `google-service-account.json` - Google Play upload credentials

#### Deep Linking

The app is configured for deep linking with the following URLs:
- `campcard://` - Custom URL scheme
- `https://campcardapp.org/app/*` - Universal links (iOS)
- `https://www.campcardapp.org/app/*` - App links (Android)