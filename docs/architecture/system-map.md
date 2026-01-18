# Camp Card System Architecture Map

**Version:** 1.0
**Last Updated:** January 2026
**Production URL:** https://bsa.swipesavvy.com

## Overview

Camp Card is a BSA (Boy Scouts of America) fundraising platform that digitalizes the traditional camp card fundraising process. The system consists of three main components: a Java Spring Boot backend API, a Next.js web portal for administration, and a React Native mobile app for scouts and parents.

## System Architecture Diagram

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                    AWS Cloud (us-east-2)                     │
                                    │  ┌─────────────────────────────────────────────────────────┐│
                                    │  │                     EC2 Instance                        ││
                                    │  │                   (18.190.69.205)                       ││
┌─────────────────┐                 │  │  ┌─────────────────────────────────────────────────┐   ││
│   Mobile App    │                 │  │  │              Docker Network                      │   ││
│  (React Native  │◄────────────────┼──┼──┤  ┌─────────────┐    ┌─────────────┐            │   ││
│    Expo 54)     │     HTTPS       │  │  │  │  Backend    │    │   Web       │            │   ││
│                 │                 │  │  │  │  (Spring    │    │  (Next.js   │            │   ││
└─────────────────┘                 │  │  │  │   Boot)     │    │   14.1)     │            │   ││
                                    │  │  │  │  Port 7010  │    │  Port 7020  │            │   ││
┌─────────────────┐                 │  │  │  └──────┬──────┘    └──────┬──────┘            │   ││
│   Web Portal    │◄────────────────┼──┼──┼─────────┘                  │                   │   ││
│   (Next.js      │     HTTPS       │  │  │                            │                   │   ││
│    Admin)       │                 │  │  │  ┌─────────────┐    ┌──────┴──────┐            │   ││
└─────────────────┘                 │  │  │  │   Redis     │    │   Kafka     │            │   ││
                                    │  │  │  │  (Cache)    │    │  (Events)   │            │   ││
                                    │  │  │  │  Port 6379  │    │  Port 9092  │            │   ││
                                    │  │  │  └─────────────┘    └─────────────┘            │   ││
                                    │  │  └─────────────────────────────────────────────────┘   ││
                                    │  └─────────────────────────────────────────────────────────┘│
                                    │                                                             │
                                    │  ┌─────────────────────────────────────────────────────────┐│
                                    │  │                  AWS RDS PostgreSQL 16                  ││
                                    │  │        camp-card-db.cn00u2kgkr3j.us-east-2.rds          ││
                                    │  │                    Schema: campcard                      ││
                                    │  └─────────────────────────────────────────────────────────┘│
                                    │                                                             │
                                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
                                    │  │   AWS SES    │  │   AWS SNS    │  │  Firebase    │      │
                                    │  │   (Email)    │  │    (SMS)     │  │    (FCM)     │      │
                                    │  └──────────────┘  └──────────────┘  └──────────────┘      │
                                    └─────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                    External Services                         │
                                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
                                    │  │ Authorize.Net│  │  Together.AI │  │    Mapbox    │      │
                                    │  │  (Payments)  │  │ (AI Content) │  │  (Location)  │      │
                                    │  └──────────────┘  └──────────────┘  └──────────────┘      │
                                    └─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Backend API (Java Spring Boot 3.2)

**Port:** 7010
**Base Path:** `/api/v1/`

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Spring Boot 3.2 | REST API framework |
| Language | Java 21 | Backend programming language |
| ORM | Spring Data JPA / Hibernate | Database access |
| Security | Spring Security + JWT | Authentication & authorization |
| Migrations | Flyway | Database schema versioning |
| API Docs | SpringDoc OpenAPI | Swagger documentation |

### 2. Web Portal (Next.js 14.1)

**Port:** 7020
**Base URL:** https://bsa.swipesavvy.com

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 14.1 | React meta-framework |
| Auth | NextAuth.js | Session management |
| State | TanStack Query + Zustand | Server & client state |
| Styling | TailwindCSS + Radix UI | UI components |
| Validation | Zod | Schema validation |

### 3. Mobile App (React Native / Expo 54)

**Expo SDK:** 54
**React Native:** 0.81

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React Native 0.81 | Cross-platform mobile |
| Build | Expo 54 | Development & deployment |
| Navigation | React Navigation 6 | Screen routing |
| State | TanStack Query + Zustand | Server & client state |
| Push | Firebase Cloud Messaging | Push notifications |

### 4. Database (PostgreSQL 16)

**Endpoint:** `camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com`
**Schema:** `campcard`
**App User:** `campcard_app`

### 5. Caching (Redis 7)

**Purpose:** Session caching, rate limiting, temporary data storage

### 6. Event Streaming (Apache Kafka 3.6)

**Purpose:** Asynchronous event processing (configured, not yet active)

**Configured Topics:**
- `subscription-events`
- `referral-events`
- `redemption-events`
- `notification-events`
- `audit-events`
- `payment-events`

## Service Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend Services                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  AuthService    │───▶│   UserService   │───▶│  CouncilService │         │
│  │  (JWT Auth)     │    │   (User CRUD)   │    │  (Org Mgmt)     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Subscription    │    │   TroopService  │    │  ScoutService   │         │
│  │   Service       │    │  (Troop Mgmt)   │    │  (Scout Mgmt)   │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ PaymentService  │    │ MerchantService │    │  OfferService   │         │
│  │ (Authorize.Net) │    │  (Business)     │    │  (Discounts)    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ CampaignService │    │ ReferralService │    │NotificationSvc  │         │
│  │ (AI Marketing)  │    │  (Tracking)     │    │  (FCM/Email)    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Authentication Flow

```
┌─────────┐    POST /auth/login    ┌─────────────┐    Validate    ┌──────────┐
│ Client  │─────────────────────▶│   Backend    │───────────────▶│ Database │
│         │                       │              │                │          │
│         │◀─────────────────────│              │◀───────────────│          │
└─────────┘    JWT Token +        └─────────────┘    User Data    └──────────┘
               Refresh Token
```

### Subscription Purchase Flow

```
┌─────────┐                ┌─────────────┐               ┌─────────────┐
│ Mobile  │                │   Backend   │               │Authorize.Net│
│  App    │                │             │               │             │
└────┬────┘                └──────┬──────┘               └──────┬──────┘
     │                            │                             │
     │ 1. Get subscription plans  │                             │
     │───────────────────────────▶│                             │
     │                            │                             │
     │ 2. Select plan, enter card │                             │
     │───────────────────────────▶│                             │
     │                            │  3. Charge card             │
     │                            │────────────────────────────▶│
     │                            │                             │
     │                            │  4. Transaction response    │
     │                            │◀────────────────────────────│
     │                            │                             │
     │ 5. Subscription created    │                             │
     │◀───────────────────────────│                             │
     │                            │                             │
     │                      ┌─────┴─────┐                       │
     │                      │  Async    │                       │
     │                      │  Email    │                       │
     │                      │  + Push   │                       │
     │                      └───────────┘                       │
```

### AI Campaign Generation Flow

```
┌─────────┐                ┌─────────────┐               ┌─────────────┐
│  Web    │                │   Backend   │               │ Together.AI │
│ Portal  │                │             │               │             │
└────┬────┘                └──────┬──────┘               └──────┬──────┘
     │                            │                             │
     │ 1. Create campaign draft   │                             │
     │───────────────────────────▶│                             │
     │                            │                             │
     │ 2. Generate AI content     │                             │
     │───────────────────────────▶│  3. Send prompt + context   │
     │                            │────────────────────────────▶│
     │                            │                             │
     │                            │  4. AI-generated content    │
     │                            │◀────────────────────────────│
     │                            │                             │
     │ 5. Preview generated content                             │
     │◀───────────────────────────│                             │
     │                            │                             │
     │ 6. Approve & schedule      │                             │
     │───────────────────────────▶│                             │
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   JWT       │    │   Spring    │    │   RBAC      │         │
│  │   Token     │───▶│  Security   │───▶│  Filters    │         │
│  │   Auth      │    │   Filter    │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                │                 │
│                                                ▼                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    User Roles                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  NATIONAL_ADMIN  │ Full system access                    │   │
│  │  COUNCIL_ADMIN   │ Council-level administration          │   │
│  │  UNIT_LEADER     │ Troop management (formerly TROOP_LEADER)│ │
│  │  PARENT          │ Family subscription & offers          │   │
│  │  SCOUT           │ QR code, referrals, offers            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Infrastructure

### Local Development

| Service | Port | Container Name |
|---------|------|----------------|
| PostgreSQL | 7001 | campcard-postgres |
| Redis | 7002 | campcard-redis |
| Zookeeper | 7003 | campcard-zookeeper |
| Kafka | 7004 | campcard-kafka |
| Kafka UI | 7005 | campcard-kafka-ui |
| Mailhog SMTP | 7006 | campcard-mailhog |
| Mailhog UI | 7007 | campcard-mailhog |
| LocalStack | 7008 | campcard-localstack |
| Backend API | 7010 | - |
| Web Portal | 7020 | - |

### Production (AWS)

| Component | Service | Details |
|-----------|---------|---------|
| Compute | EC2 | 18.190.69.205 |
| Database | RDS PostgreSQL 16 | camp-card-db.cn00u2kgkr3j.us-east-2.rds |
| Email | AWS SES | us-east-2 |
| SMS | AWS SNS | us-east-2 |
| Push | Firebase FCM | Project: bsa-camp-card |
| Domain | Route 53 | bsa.swipesavvy.com |
| SSL | ACM | AWS Certificate Manager |

## Monitoring & Observability

### Health Checks

- **Backend:** `GET /api/v1/public/health`
- **Web:** Built-in Next.js health checks
- **Database:** Connection pool monitoring via Spring Actuator

### Logging

- **Backend:** SLF4J + Logback
- **Web:** Next.js server logs
- **Mobile:** Expo dev tools + Firebase Crashlytics

## Sync Points & Data Consistency

### Critical Sync Points

1. **User ↔ Scout:** User.id references Scout.userId
2. **Subscription ↔ Payment:** Transaction must complete before subscription activation
3. **Campaign ↔ Recipients:** Campaign delivery status must be tracked
4. **Referral ↔ Subscription:** Referral completion tied to subscription activation

### Eventual Consistency Areas

- Push notification delivery (async)
- Email delivery (async)
- Campaign metrics aggregation
- Dashboard statistics (30-second refresh)

## Related Documentation

- [API Inventory](./api-inventory.md)
- [Entity Relationships](./entity-relationships.md)
- [Event Catalog](./event-catalog.md)
