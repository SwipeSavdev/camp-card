# Agent A Report: Architecture & Sync Auditor

**Project:** Camp Card Fundraising Platform
**Agent:** Agent A - Architecture & Sync Auditor
**Date:** January 2026
**Status:** Complete

## Executive Summary

I have completed a comprehensive architecture audit of the Camp Card platform, documenting:
- System topology and service dependencies
- Complete API inventory (150+ endpoints across 18 controllers)
- Event/messaging catalog (Kafka topics, push notifications, email)
- Entity relationships and database schema (18 entities)
- Risk areas and sync points

## Artifacts Created

| Artifact | Location | Description |
|----------|----------|-------------|
| System Map | `docs/architecture/system-map.md` | Service topology, data flows, infrastructure |
| API Inventory | `docs/architecture/api-inventory.md` | All REST endpoints with roles and DTOs |
| Event Catalog | `docs/architecture/event-catalog.md` | Kafka topics, notifications, scheduled jobs |
| Entity Relationships | `docs/architecture/entity-relationships.md` | ERD, all entities, foreign keys |

## Architecture Overview

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend | Java / Spring Boot | 21 / 3.2 |
| Web Portal | Next.js | 14.1 |
| Mobile App | React Native / Expo | 0.81 / 54 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Event Streaming | Apache Kafka | 3.6 |
| Push Notifications | Firebase Cloud Messaging | - |
| Email | AWS SES | - |
| SMS | AWS SNS | - |
| Payments | Authorize.Net | Sandbox |
| AI Content | Together.AI | - |
| Geolocation | Mapbox | - |

### Production Infrastructure

| Service | Details |
|---------|---------|
| EC2 Instance | 18.190.69.205 |
| RDS PostgreSQL | camp-card-db.cn00u2kgkr3j.us-east-2.rds |
| Domain | https://bsa.swipesavvy.com |
| Schema | campcard |

## API Summary

### Controllers (18 total)

| Controller | Base Path | Endpoints | Key Features |
|------------|-----------|-----------|--------------|
| AuthController | /api/v1/auth | 11 | Registration, login, password reset |
| UserController | /api/v1/users | 12 | User CRUD, troop assignment |
| CouncilController | /api/v1/councils | 10 | Council management |
| TroopController | /api/v1/troops | 10 | Troop management |
| ScoutController | /api/v1/scouts | 13 | Scout management, sales |
| MerchantController | /api/v1/merchants | 12 | Merchant CRUD, locations |
| OfferController | /api/v1/offers | 17 | Offer CRUD, redemptions |
| SubscriptionController | /api/v1 | 7 | Subscription management |
| PaymentController | /api/v1/payments | 7 | Authorize.Net integration |
| CampaignController | /api/v1/campaigns | 19 | AI marketing campaigns |
| DashboardController | /api/v1/dashboard | 8 | Analytics dashboards |
| QRCodeController | /api/v1 | 5 | QR code generation |
| ReferralController | /api/v1/referrals | 4 | Referral tracking |
| NotificationController | /api/v1/notifications | 7 | Push notifications |
| LocationController | /api/v1/location | 16 | Geolocation services |
| CampCardsController | /api/v1/camp-cards | 3 | Card management |
| AnalyticsController | /api/v1/analytics | 1 | Wallet analytics |
| HealthController | /api/v1/public | 2 | Health checks |

### User Roles (RBAC)

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| NATIONAL_ADMIN | System administrator | Full access to all resources |
| COUNCIL_ADMIN | Council administrator | Council-level CRUD, user management |
| UNIT_LEADER | Troop/unit leader | Troop management, scout oversight |
| PARENT | Parent/guardian | View offers, manage subscription |
| SCOUT | Scout member | Personal QR code, referrals, offers |

## Entity Summary

### Core Entities (18 total)

| Entity | Table | Key Fields |
|--------|-------|------------|
| User | users | email, role, councilId, troopId, cardNumber |
| Council | councils | councilNumber, name, region, status |
| Troop | troops | troopNumber, councilId, troopType, status |
| Scout | scouts | userId, troopId, rank, cardsSold, totalSales |
| Merchant | merchants | councilId, businessName, status |
| MerchantLocation | merchant_locations | merchantId, address, lat/lng |
| Offer | offers | merchantId, discountType, status, validFrom/Until |
| OfferRedemption | offer_redemptions | offerId, userId, verificationCode |
| SubscriptionPlan | subscription_plans | councilId, priceCents, billingInterval |
| Subscription | subscriptions | userId, planId, cardNumber, status |
| Referral | referrals | referrerId, referredUserId, referralCode |
| ReferralClick | referral_clicks | referralId, ipAddress |
| Notification | notifications | userId, title, type, read |
| DeviceToken | device_tokens | userId, token, deviceType |
| MarketingCampaign | marketing_campaigns | campaignType, status, channels |
| MarketingSegment | marketing_segments | segmentType, rules |
| SavedCampaign | saved_campaigns | userId, campaignConfig |
| CampaignRecipient | campaign_recipients | campaignId, userId, channel, status |

## Event Architecture

### Active Messaging

| Channel | Technology | Status |
|---------|-----------|--------|
| Push Notifications | Firebase FCM | Active |
| Email | AWS SES | Active |
| SMS | AWS SNS | Active |
| WebSocket | STOMP | Active |
| Scheduled Jobs | Spring @Scheduled | Active |

### Kafka Topics (Configured, Not Yet Implemented)

| Topic | Purpose |
|-------|---------|
| subscription-events | Subscription lifecycle |
| payment-events | Payment transactions |
| referral-events | Referral tracking |
| redemption-events | Offer redemptions |
| notification-events | Notification dispatch |
| audit-events | System audit log |

## Risk Areas

### High Priority

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Payment Processing** | Authorize.Net integration handles real money | Comprehensive payment service tests, sandbox testing |
| **RBAC Enforcement** | 5 roles with different permissions | Unit tests for all @PreAuthorize annotations |
| **Data Consistency** | User↔Scout↔Subscription relationships | Database constraints, transaction management |
| **JWT Security** | Token-based authentication | Token expiration, refresh mechanism, secure storage |

### Medium Priority

| Risk | Description | Mitigation |
|------|-------------|------------|
| **AI Content** | Together.AI generates marketing content | Content validation, human review for campaigns |
| **Geofencing** | Location-triggered notifications | Permission handling, battery impact testing |
| **Email Deliverability** | SES email delivery | Proper SPF/DKIM, bounce handling |
| **Kafka Ready** | Configured but not implemented | Document expected behavior for future implementation |

### Low Priority

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Dashboard Performance** | Real-time WebSocket updates | Rate limiting, caching strategy |
| **Image Storage** | Logo/profile images | Use CDN, validate file types |
| **Soft Deletes** | Several entities use soft delete | Ensure queries filter deleted records |

## Sync Points

### Critical Data Relationships

1. **User → Council/Troop Assignment**
   - User.councilId must reference valid Council
   - User.troopId must reference valid Troop within same Council

2. **Subscription → Payment → User**
   - Payment must complete before subscription activation
   - Card number generated only after payment success
   - Referral attribution tied to subscription completion

3. **Campaign → Recipients → Delivery**
   - Campaign status tracks delivery progress
   - Recipients track individual delivery status per channel
   - Metrics aggregated from recipient data

4. **Scout → Troop → Council Hierarchy**
   - Scout belongs to Troop, Troop belongs to Council
   - Sales/statistics roll up through hierarchy
   - Transfers must update all relationships

## Test Commands

```bash
# Backend
cd backend
./mvnw test                              # Unit tests
./mvnw verify -P integration-tests       # Integration tests
./mvnw spotless:apply                    # Format code

# Web Portal
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm test                                 # Jest tests
npm run type-check                       # TypeScript check
npm run e2e                              # Playwright E2E

# Mobile App
cd camp-card-mobile-app-v2-mobile-main/mobile
npm test                                 # Jest tests
npm run type-check                       # TypeScript check
```

## Test Credentials

| Environment | Email | Password | Role |
|-------------|-------|----------|------|
| Production | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Production | test@campcard.org | Password123 | SCOUT |

## Next Steps (Agent B-H)

### Agent B - Backend Unit Tests
- Service layer tests with Mockito
- Repository tests with Testcontainers
- RBAC tests with @WithMockUser
- Payment service idempotency tests

### Agent C - Frontend Unit Tests
- Component tests with React Testing Library
- API client tests with MSW
- Role-based rendering tests
- Loading/error/empty state tests

### Agent D - Integration Tests
- Database integration with Testcontainers
- Redis cache tests
- Kafka producer/consumer tests (when implemented)

### Agent E - Contract Tests
- OpenAPI spec generation
- Request/response schema validation
- Enum value validation

### Agent F - E2E Tests
- Golden flows with Playwright
- User management workflow
- Subscription purchase workflow
- AI campaign creation workflow

### Agent G - Load Tests
- k6 scenarios for all major endpoints
- SLA validation (p95 < 1500ms, error rate < 1%)
- Idempotency validation

### Agent H - CI/CD Gating
- GitHub Actions CI workflow
- Coverage thresholds (80%)
- Security scanning
- Deployment automation

## Conclusion

The Camp Card platform has a well-structured architecture with clear separation of concerns:
- Backend provides comprehensive REST API with proper RBAC
- Web portal provides admin/council management UI
- Mobile app provides scout/parent functionality
- Supporting services (Kafka, Redis) configured for scaling

Key areas requiring focused testing:
1. Payment processing (Authorize.Net)
2. RBAC enforcement across all endpoints
3. Subscription lifecycle management
4. Referral attribution
5. Campaign delivery tracking

All architecture documentation has been created and committed to the repository.
