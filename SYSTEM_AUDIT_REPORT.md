# BSA Camp Card - System Audit Report
**Date:** 2026-01-09
**Auditor Role:** Principal Backend Engineer + Database Engineer + AWS Solutions Architect
**SLO Target:** 99.9% Uptime

---

## IMPLEMENTATION STATUS

### Phase 0 Fixes - COMPLETED

| Issue | Status | File Changed |
|-------|--------|--------------|
| Mobile auth bypass | FIXED | `mobile/src/store/authStore.ts` - Changed to `__DEV__ && false` |
| Mobile API port mismatch | FIXED | `mobile/src/config/constants.ts` - Changed default to 7010 |
| CouncilRepository missing | FIXED | Created `backend/.../repository/CouncilRepository.java` |
| Token blacklist not distributed | FIXED | Created `TokenBlacklistService.java` using Redis, updated `JwtTokenProvider.java` |
| API version inconsistency | FIXED | Updated `OfferController`, `ScoutController`, `TroopController` to `/api/v1/` |
| Hot reload for dev | ADDED | Added `spring-boot-devtools` to pom.xml, configured in `application-dev.yml` |
| Prometheus metrics | ADDED | Added `micrometer-registry-prometheus` dependency |

### Files Modified/Created

```
CREATED:
  backend/src/main/java/com/bsa/campcard/repository/CouncilRepository.java
  backend/src/main/java/com/bsa/campcard/security/TokenBlacklistService.java
  SYSTEM_AUDIT_REPORT.md

MODIFIED:
  backend/pom.xml (devtools + micrometer-prometheus)
  backend/src/main/java/com/bsa/campcard/security/JwtTokenProvider.java
  backend/src/main/java/com/bsa/campcard/controller/OfferController.java
  backend/src/main/java/com/bsa/campcard/controller/ScoutController.java
  backend/src/main/java/com/bsa/campcard/controller/TroopController.java
  backend/src/main/resources/application-dev.yml
  camp-card-mobile-app-v2-mobile-main/mobile/src/store/authStore.ts
  camp-card-mobile-app-v2-mobile-main/mobile/src/config/constants.ts
```

---

## A) SYSTEM WIRING MAP

### 1. Authentication Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| Login (Web) | `POST /api/v1/auth/login` | `AuthController.login()` | `AuthService` | `users`, `refresh_tokens` | JWT issued, Redis session |
| Login (Mobile) | `POST /api/v1/auth/login` | `AuthController.login()` | `AuthService` | `users`, `refresh_tokens` | JWT issued |
| Register | `POST /api/v1/auth/register` | `AuthController.register()` | `AuthService` | `users` | Email verification queued |
| Refresh Token | `POST /api/v1/auth/refresh` | `AuthController.refresh()` | `AuthService` | `refresh_tokens` | Old token revoked |
| Logout | `POST /api/v1/auth/logout` | `AuthController.logout()` | `AuthService` | `refresh_tokens` | Token blacklisted (in-memory!) |
| Password Reset | `POST /api/v1/auth/reset-password` | `AuthController.resetPassword()` | `AuthService` | `users` | Email sent |

**ISSUES FOUND:**
- Token blacklist is in-memory (`Set<String>`) - not distributed across instances
- Mobile default port 8080 vs backend 7010 mismatch
- `DEV_BYPASS_AUTH = true` in mobile enables auth bypass

---

### 2. Council Management Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| List Councils (Web) | `GET /api/v1/councils` | `CouncilController.getAll()` | `CouncilService` | `councils` | - |
| Create Council | `POST /api/v1/councils` | `CouncilController.create()` | `CouncilService` | `councils` | Kafka: `council.created` |
| Update Council | `PUT /api/v1/councils/{id}` | `CouncilController.update()` | `CouncilService` | `councils` | Kafka: `council.updated` |
| Council Stats | `GET /api/v1/councils/{id}/stats` | `CouncilController.getStats()` | `CouncilService` | `councils`, `subscriptions`, `users` | - |

**ISSUES FOUND:**
- `CouncilRepository` is MISSING from backend - compile error waiting to happen
- Kafka producers configured but NO consumers implemented (dead letters)

---

### 3. User Management Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| List Users (Web) | `GET /api/v1/users` | `UserController.getAll()` | `UserService` | `users` | - |
| Get User | `GET /api/v1/users/{id}` | `UserController.getById()` | `UserService` | `users` | - |
| Create User | `POST /api/v1/users` | `UserController.create()` | `UserService` | `users` | Email verification |
| Update User | `PUT /api/v1/users/{id}` | `UserController.update()` | `UserService` | `users` | - |
| Delete User | `DELETE /api/v1/users/{id}` | `UserController.delete()` | `UserService` | `users` | Soft delete |
| User Profile | `GET /api/v1/users/me` | `UserController.getCurrentUser()` | `UserService` | `users` | - |

**ISSUES FOUND:**
- Hardcoded `userId = 1L` placeholder in some controller methods
- No pagination in mobile app user list calls

---

### 4. Merchant Management Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| List Merchants (Web) | `GET /api/v1/merchants` | `MerchantController.getAll()` | `MerchantService` | `merchants` | - |
| Create Merchant | `POST /api/v1/merchants` | `MerchantController.create()` | `MerchantService` | `merchants` | - |
| Approve Merchant | `PUT /api/v1/merchants/{id}/approve` | `MerchantController.approve()` | `MerchantService` | `merchants` | Email notification |
| Merchant Locations | `GET /api/v1/merchants/{id}/locations` | `MerchantController.getLocations()` | `MerchantService` | `merchant_locations` | - |
| Nearby Merchants (Mobile) | `GET /api/v1/merchants/nearby` | `MerchantController.getNearby()` | `MerchantService` | `merchants`, `merchant_locations` | - |

**ISSUES FOUND:**
- Mobile calls `/api/merchants` (missing `/v1` prefix)
- Web portal calls `/api/v1/categories` - endpoint doesn't exist

---

### 5. Offer Management Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| List Offers (Web) | `GET /api/offers` | `OfferController.getAll()` | `OfferService` | `offers` | - |
| Create Offer | `POST /api/offers` | `OfferController.create()` | `OfferService` | `offers` | - |
| Redeem Offer (Mobile) | `POST /api/offers/{id}/redeem` | `OfferController.redeem()` | `OfferService` | `offers`, `redemptions` | Kafka: `offer.redeemed` |
| Featured Offers | `GET /api/offers/featured` | `OfferController.getFeatured()` | `OfferService` | `offers` | - |

**ISSUES FOUND:**
- Offers API missing `/v1` prefix (inconsistent with other endpoints)
- Mobile calls wrong path `/api/v1/offers` vs actual `/api/offers`

---

### 6. Subscription Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| Get Plans | `GET /api/v1/subscriptions/plans` | `SubscriptionController.getPlans()` | `SubscriptionService` | `subscription_plans` | - |
| Subscribe | `POST /api/v1/subscriptions` | `SubscriptionController.subscribe()` | `SubscriptionService` | `subscriptions` | Stripe/AuthNet charge |
| My Subscription | `GET /api/v1/subscriptions/me` | `SubscriptionController.getMy()` | `SubscriptionService` | `subscriptions` | - |
| Cancel | `DELETE /api/v1/subscriptions/{id}` | `SubscriptionController.cancel()` | `SubscriptionService` | `subscriptions` | Refund if applicable |

**ISSUES FOUND:**
- Payment gateway credentials use placeholder values in docker-compose
- No webhook handlers for Stripe payment events

---

### 7. Scout & Troop Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| List Scouts | `GET /api/scouts` | `ScoutController.getAll()` | `ScoutService` | `scouts` | - |
| Scout Dashboard | `GET /api/scouts/me/dashboard` | `ScoutController.getDashboard()` | `ScoutService` | `scouts`, `redemptions`, `referrals` | - |
| Create Troop | `POST /api/troops` | `TroopController.create()` | `TroopService` | `troops` | - |
| Troop Members | `GET /api/troops/{id}/members` | `TroopController.getMembers()` | `TroopService` | `troops`, `users` | - |

**ISSUES FOUND:**
- Missing `/v1` prefix on scouts and troops endpoints
- Mobile calls `/api/v1/scouts` but backend serves `/api/scouts`

---

### 8. Analytics & Dashboard Flow

| UI Action | Endpoint | Handler | Service | DB Table | Side Effects |
|-----------|----------|---------|---------|----------|--------------|
| Dashboard Stats (Web) | `GET /api/v1/analytics/dashboard` | `AnalyticsController.getDashboard()` | `AnalyticsService` | Multiple tables | - |
| Revenue Report | `GET /api/v1/analytics/revenue` | `AnalyticsController.getRevenue()` | `AnalyticsService` | `subscriptions`, `redemptions` | - |
| Council Report | `GET /api/v1/analytics/councils/{id}` | `AnalyticsController.getCouncilReport()` | `AnalyticsService` | Multiple tables | - |

**ISSUES FOUND:**
- Web portal calls `/api/v1/organizations` - endpoint doesn't exist
- Web portal calls `/api/v1/feature-flags` - endpoint doesn't exist

---

## B) DISCONNECT REPORT

### SEVERITY LEVELS:
- **P0 (Critical):** System broken, data loss risk, security vulnerability
- **P1 (High):** Feature completely broken for users
- **P2 (Medium):** Feature degraded, workaround exists
- **P3 (Low):** Cosmetic, minor inconvenience

---

### P0 - CRITICAL ISSUES

| # | Symptom | Root Cause | Blast Radius | Fix |
|---|---------|------------|--------------|-----|
| 1 | **Mobile auth bypass in dev** | `DEV_BYPASS_AUTH = true` in `authStore.ts` | All mobile users can bypass auth | Set to `false`, use proper dev env detection |
| 2 | **Token blacklist not distributed** | In-memory `Set<String>` for blacklist | Logout ineffective in multi-instance | Use Redis for token blacklist |
| 3 | **CouncilRepository missing** | No `CouncilRepository.java` interface | Council CRUD will fail at runtime | Create repository interface |
| 4 | **Kafka consumers not implemented** | Topics configured, no `@KafkaListener` | Events published but never processed | Implement consumer classes |

---

### P1 - HIGH PRIORITY ISSUES

| # | Symptom | Root Cause | Blast Radius | Fix |
|---|---------|------------|--------------|-----|
| 5 | **Mobile API port wrong** | Default `8080` vs backend `7010` | All mobile API calls fail | Update `constants.ts` default |
| 6 | **Mobile paths missing /api/v1** | 15+ screens use `/api/` prefix | 404 errors on all requests | Add `/v1` to all endpoint paths |
| 7 | **4 missing backend endpoints** | Web calls non-existent endpoints | Features broken: orgs, cards, categories, flags | Implement or remove from frontend |
| 8 | **Offer API version mismatch** | Backend: `/api/offers`, Mobile: `/api/v1/offers` | Offer features broken on mobile | Standardize to `/api/v1/` |
| 9 | **Scout/Troop API mismatch** | Backend: `/api/scouts`, Mobile: `/api/v1/scouts` | Scout features broken | Standardize to `/api/v1/` |

---

### P2 - MEDIUM PRIORITY ISSUES

| # | Symptom | Root Cause | Blast Radius | Fix |
|---|---------|------------|--------------|-----|
| 10 | **No token refresh in web** | NextAuth session 24h, JWT 15min | Users logged out unexpectedly | Implement refresh token rotation |
| 11 | **Hardcoded user IDs** | `userId = 1L` placeholders in controllers | Wrong user data returned | Use `TenantContext.getCurrentUser()` |
| 12 | **Payment placeholders** | `AUTHORIZE_NET_*=placeholder` | Payments fail silently | Configure real credentials |
| 13 | **HTTPS listener commented** | ALB only HTTP, no SSL | Traffic unencrypted | Provision ACM cert, enable HTTPS |
| 14 | **No Stripe webhooks** | Payment events not captured | Subscription status inconsistent | Implement webhook handlers |

---

### P3 - LOW PRIORITY ISSUES

| # | Symptom | Root Cause | Blast Radius | Fix |
|---|---------|------------|--------------|-----|
| 15 | **Case mismatch** | API returns `snake_case`, frontend expects `camelCase` | Data mapping issues | Configure Jackson/DTO mappers |
| 16 | **No request logging** | Missing request/response interceptor | Debug difficulty | Add logging interceptor |
| 17 | **Schema in public** | V009 checks public, V010 expects campcard | Migration confusion | Consolidate schema strategy |

---

## C) PRIORITIZED FIX PLAN

### Phase 0: Stop-the-Bleeding (Immediate - Day 1)

```
Priority: Security & Data Integrity
```

1. **Disable mobile auth bypass**
   - File: `mobile/src/store/authStore.ts`
   - Change: `DEV_BYPASS_AUTH = __DEV__` (use proper detection)

2. **Fix mobile API base URL**
   - File: `mobile/src/config/constants.ts`
   - Change: Default port from `8080` to `7010`

3. **Create CouncilRepository**
   - File: `backend/src/main/java/com/bsa/campcard/repository/CouncilRepository.java`
   - Create interface extending JpaRepository

4. **Implement Redis token blacklist**
   - File: `backend/src/main/java/org/bsa/campcard/security/TokenBlacklistService.java`
   - Use Redis SET with TTL matching token expiry

---

### Phase 1: API Consistency (Days 2-3)

```
Priority: Make mobile app functional
```

1. **Standardize API versioning**
   - Move all endpoints to `/api/v1/` prefix
   - Update `OfferController`, `ScoutController`, `TroopController`

2. **Fix mobile API paths**
   - Update all 15+ screens to use correct paths
   - Create API path constants file

3. **Implement missing endpoints OR remove calls**
   - `/api/v1/organizations` - Implement or remove
   - `/api/v1/camp-cards` - Implement or remove
   - `/api/v1/categories` - Implement or remove
   - `/api/v1/feature-flags` - Implement or remove

---

### Phase 2: Event Processing (Days 4-5)

```
Priority: Enable async processing
```

1. **Implement Kafka consumers**
   - `CouncilEventConsumer`
   - `OfferEventConsumer`
   - `SubscriptionEventConsumer`
   - `NotificationEventConsumer`

2. **Add dead letter queues**
   - Configure DLQ for failed messages
   - Add retry logic with exponential backoff

3. **Implement payment webhooks**
   - Stripe webhook handler
   - Authorize.Net webhook handler

---

### Phase 3: Production Hardening (Days 6-10)

```
Priority: 99.9% uptime infrastructure
```

1. **Enable HTTPS**
   - Provision ACM certificate
   - Uncomment ALB HTTPS listener
   - Force HTTP->HTTPS redirect

2. **Add health checks**
   - Kubernetes-style liveness/readiness probes
   - Database connection health
   - Redis connection health
   - Kafka connection health

3. **Implement observability**
   - Structured logging (JSON)
   - Distributed tracing (OpenTelemetry)
   - Metrics export (Prometheus)
   - CloudWatch dashboards

4. **Configure auto-scaling**
   - ECS service auto-scaling
   - RDS read replicas
   - ElastiCache multi-AZ (already configured)

---

## D) HOT RELOAD SETUP

### Backend (Spring Boot DevTools)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

```yaml
# application-dev.yml
spring:
  devtools:
    restart:
      enabled: true
      poll-interval: 2s
    livereload:
      enabled: true
```

### Web Portal (Next.js - Already Enabled)

```bash
npm run dev  # Fast Refresh enabled by default
```

### Mobile (Expo - Already Enabled)

```bash
npx expo start  # Hot reload via Metro bundler
```

### Docker Development Mode

```yaml
# docker-compose-dev.yml
services:
  backend:
    volumes:
      - ./backend/src:/app/src:ro
      - ./backend/target/classes:/app/classes
    environment:
      - SPRING_DEVTOOLS_RESTART_ENABLED=true
```

---

## E) 99.9% UPTIME ARCHITECTURE

### Current State: ~99.0% (Single EC2, no redundancy)

### Target Architecture:

```
                                   ┌──────────────┐
                                   │  CloudFront  │
                                   │    (CDN)     │
                                   └──────┬───────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                     ┌────────▼────────┐    ┌────────▼────────┐
                     │   ALB (us-east-2a)   │   ALB (us-east-2b)
                     └────────┬────────┘    └────────┬────────┘
                              │                       │
              ┌───────────────┼───────────────┐      │
              │               │               │      │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────▼──────┐
       │ ECS Task 1  │ │ ECS Task 2  │ │    ECS Task 3      │
       │ (Backend)   │ │ (Backend)   │ │    (Backend)       │
       └──────┬──────┘ └──────┬──────┘ └──────┬─────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │ RDS Primary │ │ RDS Standby │ │ ElastiCache │
       │ (Multi-AZ)  │ │ (Auto-fail) │ │  (Cluster)  │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### Required Changes:

1. **ECS Cluster** (replace single EC2)
   - Min 2 tasks across AZs
   - Auto-scaling: 2-10 tasks based on CPU/memory

2. **RDS Multi-AZ** (already in Terraform)
   - Verify `multi_az = true` for prod

3. **ElastiCache Cluster** (already configured)
   - Verify `automatic_failover_enabled = true`

4. **CloudFront** (add)
   - Cache static assets
   - Shield against DDoS

5. **Route 53 Health Checks**
   - Failover routing policy
   - DNS-based health monitoring

---

## F) VERIFICATION CHECKLIST

### Pre-Deployment
- [ ] All P0 issues resolved
- [ ] Mobile app connects to correct API
- [ ] Authentication flow works end-to-end
- [ ] Council CRUD operations work
- [ ] Offer redemption works

### Post-Deployment
- [ ] Health checks passing (backend, web, mobile)
- [ ] Logs flowing to CloudWatch
- [ ] Metrics visible in dashboards
- [ ] Alerts configured and tested
- [ ] Rollback tested and documented

### Weekly Maintenance
- [ ] Review error rates
- [ ] Check slow query logs
- [ ] Verify backup completion
- [ ] Update dependencies (security patches)

---

## G) TOP 5 HIDDEN CAUSES OF "DATA DOESN'T MOVE"

1. **API Version Mismatch**
   - Backend serves `/api/offers`, client calls `/api/v1/offers`
   - Results in 404, client shows empty state

2. **CORS Blocking Requests**
   - Browser blocks cross-origin requests
   - Check `Access-Control-Allow-Origin` headers

3. **JWT Expired, No Refresh**
   - 15-minute token expires, 401 returned
   - Client doesn't refresh, user sees "no data"

4. **Kafka Events Not Consumed**
   - Producer publishes, consumer doesn't exist
   - Side effects (emails, notifications) never happen

5. **Database Schema Mismatch**
   - Entity expects column, Flyway didn't create it
   - Query fails silently, returns empty

---

**Next Step:** Begin implementing Phase 0 fixes starting with the mobile auth bypass and API URL configuration.
