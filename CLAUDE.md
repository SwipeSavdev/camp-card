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