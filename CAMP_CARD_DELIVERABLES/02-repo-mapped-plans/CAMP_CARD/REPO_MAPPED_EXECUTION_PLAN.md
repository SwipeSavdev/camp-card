# 🧭 Camp Card Fundraising Platform — Repo-Mapped Execution Plan

## 1) Repo Inventory

| Repo | Location | Description |
|------|----------|-------------|
| `backend` | `/backend` | Java 21 / Spring Boot 3.2 REST API |
| `camp-card-web` | `/camp-card-mobile-app-v2-web-main/repos/camp-card-web` | Next.js 14.1 Admin/Council Dashboard |
| `mobile` | `/camp-card-mobile-app-v2-mobile-main/mobile` | React Native 0.81 / Expo 54 Mobile App |
| `infrastructure` | `/camp-card-mobile-app-v2-infrastructure-main/infrastructure` | Terraform AWS IaC |

## 2) Mapping: Repo → Type → Primary Responsibilities → Test Gates

| Repo | Type | Responsibilities | Must-Pass Test Gates |
|------|------|------------------|---------------------|
| `backend` | backend/service | Auth, Users, Councils, Merchants, Offers, Subscriptions, Payments, Notifications, AI Campaigns | unit (JUnit), contract (OpenAPI), integration (Testcontainers), load (k6) |
| `camp-card-web` | frontend | Admin Portal - User/Council/Merchant/Offer CRUD, AI Marketing, Analytics, Cards Management | unit (Jest), e2e (Playwright), accessibility |
| `mobile` | frontend | Scout/Parent/TroopLeader apps, QR code scanning, Subscription checkout, Offer redemption | unit (Jest), e2e (Detox), accessibility |
| `infrastructure` | infra | AWS EC2, RDS, Redis, Kafka, Nginx reverse proxy, Docker containers | terraform validate, terraform plan |

## 3) Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS EC2 (18.190.69.205)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ campcard-   │  │ campcard-   │  │ campcard-   │             │
│  │ backend     │  │ web         │  │ mobile      │             │
│  │ :7010       │  │ :7020       │  │ :8081       │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│  ┌──────┴────────────────┴────────────────┴──────┐             │
│  │              Nginx Reverse Proxy              │             │
│  │         https://bsa.swipesavvy.com            │             │
│  └───────────────────────────────────────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ campcard-   │  │ campcard-   │  │ campcard-   │             │
│  │ redis       │  │ kafka       │  │ zookeeper   │             │
│  │ :6379       │  │ :9092       │  │ :2181       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS RDS PostgreSQL 16                              │
│     camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com      │
│     Database: campcard | Schema: campcard                       │
└─────────────────────────────────────────────────────────────────┘
```

## 4) API Endpoints Inventory

### Authentication
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/auth/login` | User login | Public |
| POST | `/api/v1/auth/register` | User registration | Public |
| POST | `/api/v1/auth/refresh` | Refresh token | Authenticated |
| GET | `/api/v1/auth/me` | Get current user | Authenticated |

### Users
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/users` | List users (paginated) | NATIONAL_ADMIN, COUNCIL_ADMIN |
| GET | `/api/v1/users/{id}` | Get user by ID | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/users` | Create user | NATIONAL_ADMIN, COUNCIL_ADMIN |
| PUT | `/api/v1/users/{id}` | Update user | NATIONAL_ADMIN, COUNCIL_ADMIN |
| DELETE | `/api/v1/users/{id}` | Delete user | NATIONAL_ADMIN |

### Councils
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/councils` | List councils | NATIONAL_ADMIN, COUNCIL_ADMIN |
| GET | `/api/v1/councils/{id}` | Get council | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/councils` | Create council | NATIONAL_ADMIN |
| PUT | `/api/v1/councils/{id}` | Update council | NATIONAL_ADMIN |

### Merchants
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/merchants` | List merchants | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/merchants` | Create merchant | NATIONAL_ADMIN, COUNCIL_ADMIN |
| PUT | `/api/v1/merchants/{id}` | Update merchant | NATIONAL_ADMIN, COUNCIL_ADMIN |

### Offers
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/offers` | List offers | Authenticated |
| POST | `/api/v1/offers` | Create offer | NATIONAL_ADMIN, COUNCIL_ADMIN |
| PUT | `/api/v1/offers/{id}` | Update offer | NATIONAL_ADMIN, COUNCIL_ADMIN |

### Subscriptions
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/subscriptions` | List subscriptions | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/subscriptions/purchase` | Purchase subscription | Public |
| GET | `/api/v1/subscriptions/{id}` | Get subscription | Authenticated |

### Camp Cards
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/camp-cards` | List camp cards | NATIONAL_ADMIN, COUNCIL_ADMIN |
| GET | `/api/v1/camp-cards/{cardNumber}` | Get card by number | Authenticated |

### AI Marketing Campaigns
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/campaigns` | List campaigns | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/campaigns` | Create campaign | NATIONAL_ADMIN, COUNCIL_ADMIN |
| POST | `/api/v1/campaigns/ai/generate` | Generate AI content | NATIONAL_ADMIN, COUNCIL_ADMIN |
| PUT | `/api/v1/campaigns/{id}` | Update campaign | NATIONAL_ADMIN, COUNCIL_ADMIN |

## 5) User Roles (RBAC)

```java
public enum UserRole {
    NATIONAL_ADMIN,  // Full system access
    COUNCIL_ADMIN,   // Council-scoped access
    TROOP_LEADER,    // Troop management
    PARENT,          // Card holder/subscription user
    SCOUT            // Affiliate/fundraiser
}
```

## 6) Database Schema (Key Tables)

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `users` | User accounts | → councils, subscriptions |
| `councils` | BSA councils | → users, troops |
| `troops` | Scout troops | → councils, users |
| `merchants` | Business partners | → offers |
| `offers` | Merchant discounts | → merchants |
| `subscriptions` | Annual card subscriptions | → users |
| `marketing_campaigns` | AI marketing campaigns | → segments |
| `redemptions` | Offer redemption history | → users, offers |

## 7) Milestones

### Phase 1: Architecture Baselining (Agent A)
- [ ] Document complete API inventory with OpenAPI spec
- [ ] Map all event flows (Kafka topics)
- [ ] Create system architecture diagram
- [ ] Document database schema with ERD
- [ ] Identify sync points and data consistency requirements

### Phase 2: Unit Test Wave (Agents B/C)
- [ ] Backend: Service layer tests (80% coverage)
- [ ] Backend: Repository tests with Testcontainers
- [ ] Frontend Web: Component tests (Jest + RTL)
- [ ] Frontend Mobile: Component tests (Jest)
- [ ] Money math validation (BigDecimal precision)
- [ ] RBAC authorization tests

### Phase 3: Integration & Contract Testing (Agents D/E)
- [ ] API contract tests (OpenAPI validation)
- [ ] Database integration tests (Testcontainers PostgreSQL)
- [ ] Redis cache integration tests
- [ ] Kafka event producer/consumer tests
- [ ] Payment gateway integration tests (Authorize.Net sandbox)

### Phase 4: E2E Golden Flows (Agent F)
- [ ] Login/logout flow
- [ ] User CRUD workflow
- [ ] Council/Troop management
- [ ] Merchant/Offer creation
- [ ] Subscription purchase (Authorize.Net)
- [ ] AI Campaign creation and launch
- [ ] Mobile: Scout QR code scanning
- [ ] Mobile: Subscription checkout

### Phase 5: Load & Performance Testing (Agent G)
- [ ] 200 concurrent users baseline
- [ ] API endpoint response time (p95 < 1500ms)
- [ ] Database query optimization
- [ ] Redis cache hit rate validation
- [ ] Peak load simulation (1000 concurrent)

### Phase 6: CI/CD Gating (Agent H)
- [ ] GitHub Actions workflow for all test suites
- [ ] Quality gates: coverage > 80%, no critical vulnerabilities
- [ ] Docker build and push automation
- [ ] Deployment pipeline to EC2

## 8) Environment Variables

### Backend
```bash
SPRING_PROFILES_ACTIVE=aws
DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=campcard
DB_USERNAME=campcard_app
DB_PASSWORD=<secret>
JWT_SECRET=<secret>
JWT_EXPIRATION=86400000
REDIS_HOST=campcard-redis
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
REDIS_SSL=false
TOGETHER_AI_API_KEY=<secret>
```

### Frontend Web
```bash
NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1
NEXTAUTH_URL=https://bsa.swipesavvy.com
NEXTAUTH_SECRET=<secret>
```

### Testing
```bash
CAMP_CARD_BASE_URL=https://bsa.swipesavvy.com
E2E_BASE_URL=https://bsa.swipesavvy.com
TEST_RUN_ID=<generated>
```

## 9) Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment processing failures | High | Authorize.Net sandbox testing, idempotency keys |
| JWT token expiration | Medium | 24hr expiration, refresh token rotation |
| Database connection pool exhaustion | High | HikariCP tuning, connection limits |
| Redis cache invalidation | Medium | TTL policies, explicit cache eviction |
| Kafka message ordering | Medium | Partition keys, exactly-once semantics |
| RBAC bypass | Critical | PreAuthorize annotations, integration tests |
| SQL injection | Critical | Parameterized queries, input validation |

## 10) Commands

```bash
# Backend
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev  # Local dev
./mvnw test                                              # Unit tests
./mvnw verify -P integration-tests                       # Integration tests

# Frontend Web
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm run dev                                              # Local dev
npm test                                                 # Jest tests
npm run e2e                                              # Playwright E2E

# Mobile
cd camp-card-mobile-app-v2-mobile-main/mobile
npm start                                                # Metro bundler
npm test                                                 # Jest tests
npm run detox:test:ios                                   # Detox E2E

# Load Testing
export BASE_URL=https://bsa.swipesavvy.com/api/v1
k6 run testing/load/k6/scenarios.js

# E2E Testing
export E2E_BASE_URL=https://bsa.swipesavvy.com
npx playwright test
```

## 11) Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Test | test@campcard.org | Password123 | SCOUT |

## 12) Deployment Checklist

- [ ] Docker images built and pushed
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache cleared
- [ ] Nginx configuration updated
- [ ] SSL certificates valid
- [ ] Health checks passing
- [ ] Smoke tests passing
