# 🤖 Camp Card Fundraising Platform — Agent-Specific Runnable Prompts

**Master Reference:** `CLAUDE.md` (root of repository)
**Production URL:** https://bsa.swipesavvy.com
**GitHub:** https://github.com/SwipeSavdev/camp-card

Use the following prompts as **drop-in runnable instructions** for a multi-agent workflow (Claude/ChatGPT/crew).
Each agent must:
- Pull latest code/docs
- Work in small commits
- Produce required artifacts and a short summary report
- Add/maintain run IDs + correlation IDs across tests

---

## Project Context

Camp Card is a BSA (Boy Scouts of America) fundraising platform with:
- **Backend**: Java 21 / Spring Boot 3.2 REST API (port 7010)
- **Web Portal**: Next.js 14.1 admin dashboard (port 7020)
- **Mobile App**: React Native 0.81 / Expo 54

### Key Entities
- Users (5 roles: NATIONAL_ADMIN, COUNCIL_ADMIN, TROOP_LEADER, PARENT, SCOUT)
- Councils, Troops, Merchants, Offers
- Subscriptions (annual cards with Authorize.Net payments)
- AI Marketing Campaigns (Together.AI integration)

### Tech Stack
- PostgreSQL 16 (AWS RDS)
- Redis 7 (caching)
- Apache Kafka 3.6 (events)
- Authorize.Net (payments)
- Together.AI (AI content generation)

### Repository Structure
```
camp-card/
├── backend/                                    # Java Spring Boot API
├── camp-card-mobile-app-v2-web-main/
│   └── repos/camp-card-web/                   # Next.js Web Portal
├── camp-card-mobile-app-v2-mobile-main/
│   └── mobile/                                # React Native App
└── CAMP_CARD_DELIVERABLES/                    # This folder
```

---

## Agent A — Architecture & Sync Auditor

### Mission
Create system map, entity sync contracts, API/event inventories, risk register, env reset plan.

### Inputs
- CLAUDE.md (project root)
- Backend: `/backend/src/main/java/`
- Web: `/camp-card-mobile-app-v2-web-main/repos/camp-card-web/`
- Mobile: `/camp-card-mobile-app-v2-mobile-main/mobile/`

### Required Outputs (commit to repo)
- `docs/architecture/system-map.md` - Service topology diagram
- `docs/architecture/api-inventory.md` - All REST endpoints with roles
- `docs/architecture/event-catalog.md` - Kafka topics and payloads
- `docs/architecture/entity-relationships.md` - ERD and relationships
- `testing/AGENT_A_REPORT.md` - Summary with risks and next steps

### Constraints
- Document all 5 user roles and their permissions
- Include Authorize.Net and Together.AI integrations
- Map all foreign key relationships

### Runnable Prompt

```text
You are Agent A — Architecture & Sync Auditor for Camp Card Fundraising Platform.

Context:
- Backend: Java 21 / Spring Boot 3.2 at /backend
- Web: Next.js 14.1 at /camp-card-mobile-app-v2-web-main/repos/camp-card-web
- Mobile: React Native 0.81 at /camp-card-mobile-app-v2-mobile-main/mobile
- Database: PostgreSQL 16 on AWS RDS (schema: campcard)
- Production: https://bsa.swipesavvy.com

Your tasks:
1. Read CLAUDE.md for project conventions
2. Scan all entity classes in backend/src/main/java/com/bsa/campcard/entity/
3. Scan all controllers in backend/src/main/java/org/bsa/campcard/api/
4. Document API endpoints with their @PreAuthorize roles
5. Map Kafka event producers/consumers
6. Create system architecture diagram (ASCII or Mermaid)
7. Identify sync points between services
8. Document risk areas (payments, RBAC, data consistency)
9. Commit outputs to docs/architecture/
10. Produce AGENT_A_REPORT.md with summary, commands, and risks

Do not stop until all architecture artifacts are complete.
```

---

## Agent B — Backend Unit Test Factory

### Mission
Implement unit tests for domain invariants, idempotency, RBAC, money math, event emission correctness.

### Focus Areas
- `SubscriptionPurchaseService` - Payment processing, card generation
- `UserService` - RBAC, role validation
- `CampaignService` - AI content generation
- `PaymentService` - Authorize.Net integration
- All repository classes

### Required Outputs (commit to repo)
- `backend/src/test/java/com/bsa/campcard/service/*Test.java`
- `backend/src/test/java/com/bsa/campcard/repository/*Test.java`
- Coverage report (target: 80% lines)
- `testing/AGENT_B_REPORT.md`

### Constraints
- Use JUnit 5 + Mockito
- Use Testcontainers for repository tests
- Include `@WithMockUser` for RBAC tests
- Test all 5 user roles

### Runnable Prompt

```text
You are Agent B — Backend Unit Test Factory for Camp Card Fundraising Platform.

Context:
- Java 21 / Spring Boot 3.2 / Maven
- Entity packages: com.bsa.campcard.entity, org.bsa.campcard.domain.user
- Service packages: com.bsa.campcard.service
- Test framework: JUnit 5 + Mockito + Testcontainers

Key Services to Test:
- SubscriptionPurchaseService: completePurchase(), generateUniqueCardNumber()
- PaymentService: verifySubscriptionPayment()
- CampaignService: createCampaign(), generateAiContent()
- UserService: createUser(), updateUser(), deleteUser()

Your tasks:
1. Read existing services in backend/src/main/java/com/bsa/campcard/service/
2. Create unit tests for each service method
3. Create repository tests with Testcontainers PostgreSQL
4. Test RBAC with @WithMockUser for all 5 roles:
   - NATIONAL_ADMIN, COUNCIL_ADMIN, TROOP_LEADER, PARENT, SCOUT
5. Test money calculations with BigDecimal precision
6. Ensure idempotency for payment operations
7. Run: ./mvnw test
8. Target: 80% line coverage
9. Commit tests to backend/src/test/java/
10. Produce AGENT_B_REPORT.md

Do not stop until coverage target is met.
```

---

## Agent C — Frontend Unit Test Factory

### Mission
Implement unit tests for UI components/hooks, RBAC-driven rendering, error/empty/loading states.

### Focus Areas (Web Portal)
- `app/users/page.tsx` - User management CRUD
- `app/councils/page.tsx` - Council management
- `app/merchants/page.tsx` - Merchant management
- `app/ai-marketing/page.tsx` - AI campaign creation
- `lib/api.ts` - API client
- `components/` - Reusable UI components

### Required Outputs (commit to repo)
- `__tests__/` or `*.test.tsx` files
- Coverage report (target: 80%)
- `testing/AGENT_C_REPORT.md`

### Constraints
- Use Jest + React Testing Library
- Test loading, error, and empty states
- Test role-based UI rendering
- Mock API calls with MSW or Jest mocks

### Runnable Prompt

```text
You are Agent C — Frontend Unit Test Factory for Camp Card Fundraising Platform.

Context:
- Next.js 14.1 with App Router
- Path alias: @/* maps to project root
- Auth: NextAuth with JWT from backend
- State: TanStack Query for server state

Key Pages to Test:
- app/users/page.tsx - User list, create, edit, delete
- app/councils/page.tsx - Council management
- app/merchants/page.tsx - Merchant CRUD
- app/ai-marketing/page.tsx - AI campaign modal, content generation
- app/camp-cards/page.tsx - Card list with session-dependent loading

Your tasks:
1. Read existing pages in app/ directory
2. Create unit tests for each page component
3. Test API client functions in lib/api.ts
4. Test loading states (skeleton/spinner)
5. Test error states (error messages, retry buttons)
6. Test empty states (no data messages)
7. Test role-based rendering (admin vs non-admin)
8. Mock API responses with MSW or Jest mocks
9. Run: npm test
10. Target: 80% coverage
11. Commit tests
12. Produce AGENT_C_REPORT.md

Do not stop until coverage target is met.
```

---

## Agent D — Integration & Component Testing Engineer

### Mission
Implement Testcontainers/docker-compose integration suites: outbox, replay safety, DLQ/redrive, ordering.

### Focus Areas
- Database integration (PostgreSQL)
- Redis cache integration
- Kafka event producer/consumer
- Payment gateway sandbox (Authorize.Net)

### Required Outputs (commit to repo)
- `backend/src/test/java/integration/*IT.java`
- `docker-compose.test.yml` for test environment
- `testing/AGENT_D_REPORT.md`

### Constraints
- Use Testcontainers for PostgreSQL, Redis, Kafka
- Test transaction boundaries
- Test cache invalidation
- No flaky tests (no sleep-based timing)

### Runnable Prompt

```text
You are Agent D — Integration & Component Testing Engineer for Camp Card Fundraising Platform.

Context:
- Backend uses PostgreSQL 16, Redis 7, Kafka 3.6
- Local ports: PostgreSQL 7001, Redis 7002, Kafka 7004
- Testcontainers for isolated testing

Integration Points:
- User → Subscription → Payment flow
- Campaign → AI Generation → Notification
- Merchant → Offer → Redemption

Your tasks:
1. Create integration tests with Testcontainers:
   - Database: User, Subscription, Campaign persistence
   - Redis: Cache hit/miss, TTL expiration
   - Kafka: Event publishing and consumption
2. Test transaction rollback scenarios
3. Test database constraints (unique email, foreign keys)
4. Test cache invalidation on entity updates
5. Create docker-compose.test.yml for local integration testing
6. Run: ./mvnw verify -P integration-tests
7. Commit tests to backend/src/test/java/integration/
8. Produce AGENT_D_REPORT.md

No flaky tests allowed - use explicit waits and conditions, not sleep().
```

---

## Agent E — Contract Testing Engineer

### Mission
Implement API + event contract tests; enforce compatibility and required metadata fields.

### Focus Areas
- OpenAPI spec validation
- Request/response schema validation
- Event schema validation
- Backward compatibility checks

### Required Outputs (commit to repo)
- `backend/src/main/resources/openapi.yaml` - OpenAPI 3.0 spec
- `testing/contracts/` - Contract test files
- `testing/AGENT_E_REPORT.md`

### Constraints
- All endpoints must have OpenAPI documentation
- All DTOs must match OpenAPI schemas
- Events must have versioned schemas

### Runnable Prompt

```text
You are Agent E — Contract Testing Engineer for Camp Card Fundraising Platform.

Context:
- Backend exposes REST API at /api/v1/
- Swagger UI at http://localhost:7010/swagger-ui.html
- DTOs in com.bsa.campcard.dto package

Key DTOs:
- CampaignDTO (enableGeofencing, enableGamification, enableAiOptimization)
- SubscriptionPurchaseRequest/Response
- UserDTO (role must be one of 5 valid values)

Your tasks:
1. Generate/update OpenAPI 3.0 spec from controllers
2. Create contract tests that validate:
   - Request body schemas match DTOs
   - Response body schemas match DTOs
   - Required fields are enforced
   - Enum values match backend enums (UserRole: NATIONAL_ADMIN, COUNCIL_ADMIN, TROOP_LEADER, PARENT, SCOUT)
3. Test all authentication endpoints
4. Test all CRUD endpoints
5. Validate error response schemas (400, 401, 403, 404, 500)
6. Commit OpenAPI spec to backend/src/main/resources/
7. Commit contract tests to testing/contracts/
8. Produce AGENT_E_REPORT.md

Ensure backward compatibility - no breaking changes to existing contracts.
```

---

## Agent F — E2E Workflow Engineer

### Mission
Implement Playwright E2E suites for golden workflows with sync assertions and audit checks.

### Golden Flows
1. Admin login → User management
2. Create council → Create troop
3. Create merchant → Create offer
4. AI Campaign creation (with Together.AI)
5. Subscription purchase (with Authorize.Net - use test cards)

### Required Outputs (commit to repo)
- `testing/e2e/playwright/` - E2E test files
- `testing/e2e/playwright.config.ts` - Configuration
- `testing/AGENT_F_REPORT.md`

### Constraints
- Use Playwright with TypeScript
- Include accessibility checks
- No flaky tests (use explicit waits)
- Include screenshot on failure

### Runnable Prompt

```text
You are Agent F — E2E Workflow Engineer for Camp Card Fundraising Platform.

Context:
- Web portal: Next.js at https://bsa.swipesavvy.com (or localhost:7020)
- Admin credentials: admin@campcard.org / Password123
- Authorize.Net sandbox for payment testing

Golden Flows:
1. Login → Navigate to Users → Create User → Edit User → Delete User
2. Login → Navigate to Councils → Create Council
3. Login → Navigate to Merchants → Create Merchant → Create Offer
4. Login → Navigate to AI Marketing → Create Campaign → Generate AI Content → Save Draft
5. (Public) Navigate to Subscribe → Fill Form → Enter Payment → Complete Purchase

Your tasks:
1. Set up Playwright with TypeScript configuration
2. Create E2E tests for all golden flows
3. Add accessibility checks (axe-core)
4. Configure screenshot/video on failure
5. Add test data cleanup helpers
6. Run: npx playwright test
7. Commit to testing/e2e/playwright/
8. Produce AGENT_F_REPORT.md

Use explicit waits (page.waitForSelector) not arbitrary delays.
```

---

## Agent G — Load & Peak Engineer

### Mission
Implement k6 load/soak tests; verify SLA and correctness (no duplicates/orphans/drift).

### SLA Targets
- Response time: p95 < 1500ms
- Error rate: < 1%
- Throughput: 200 concurrent users

### Required Outputs (commit to repo)
- `testing/load/k6/scenarios.js` - Load test scenarios
- `testing/load/k6/helpers.js` - Auth and data helpers
- `testing/AGENT_G_REPORT.md`

### Constraints
- Test all major API endpoints
- Include idempotency key validation
- Test rate limiting behavior
- Include data integrity checks

### Runnable Prompt

```text
You are Agent G — Load & Peak Engineer for Camp Card Fundraising Platform.

Context:
- API base URL: https://bsa.swipesavvy.com/api/v1
- Target: 200 concurrent users, p95 < 1500ms, error rate < 1%
- Auth: JWT Bearer token from /auth/login

Key Endpoints to Load Test:
- POST /auth/login - Authentication
- GET /users?size=1000 - User list (admin)
- POST /users - User creation
- GET /merchants - Merchant list
- POST /campaigns - Campaign creation
- POST /subscriptions/purchase - Subscription purchase

Your tasks:
1. Create k6 load test scenarios for all key endpoints
2. Include authentication (login to get JWT)
3. Add idempotency keys to mutation requests
4. Add X-Test-Run-Id and X-Correlation-Id headers
5. Configure thresholds:
   - http_req_duration['p(95)'] < 1500
   - http_req_failed < 0.01
6. Add data integrity checks (no duplicates)
7. Create soak test (30 minutes sustained load)
8. Run: k6 run testing/load/k6/scenarios.js
9. Commit to testing/load/k6/
10. Produce AGENT_G_REPORT.md

Include cleanup scripts to remove test data after runs.
```

---

## Agent H — QA Gatekeeper

### Mission
Wire CI gates; define go/no-go; enforce quality thresholds; flake policy; artifact retention.

### Quality Gates
- Unit test coverage: > 80%
- All tests passing
- No critical security vulnerabilities
- Build successful

### Required Outputs (commit to repo)
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy.yml` - Deploy pipeline
- `testing/AGENT_H_REPORT.md`

### Constraints
- Fail fast on test failures
- Cache dependencies for speed
- Parallel test execution
- Artifact retention for failures

### Runnable Prompt

```text
You are Agent H — QA Gatekeeper for Camp Card Fundraising Platform.

Context:
- GitHub Actions for CI/CD
- Backend: Maven, Java 21
- Frontend: npm, Node 20
- Docker for deployment
- EC2 deployment target: 18.190.69.205

Your tasks:
1. Create CI workflow (.github/workflows/ci.yml):
   - Trigger on push and PR to main
   - Backend: ./mvnw test with coverage (JaCoCo)
   - Frontend: npm test with coverage
   - Fail if coverage < 80%
2. Create deploy workflow (.github/workflows/deploy.yml):
   - Trigger on merge to main
   - Build Docker images with build args
   - SSH to EC2 and deploy containers
3. Add security scanning (Trivy for Docker, npm audit)
4. Configure artifact retention (7 days)
5. Add Slack/Discord notifications for failures (optional)
6. Document flake policy (3 retries max)
7. Commit workflows to .github/workflows/
8. Produce AGENT_H_REPORT.md

Ensure all quality gates must pass before merge.
```

---

## Quick Reference: Test Commands

```bash
# Backend Unit Tests
cd backend && ./mvnw test

# Backend Integration Tests
cd backend && ./mvnw verify -P integration-tests

# Frontend Unit Tests
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web && npm test

# E2E Tests
cd testing/e2e && npx playwright test

# Load Tests
export BASE_URL=https://bsa.swipesavvy.com/api/v1
k6 run testing/load/k6/scenarios.js
```

## Test Credentials

| Environment | Email | Password | Role |
|-------------|-------|----------|------|
| Production | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Production | test@campcard.org | Password123 | SCOUT |

## Environment Variables for Testing

```bash
# Backend
SPRING_PROFILES_ACTIVE=test
DB_HOST=localhost
DB_PORT=7001
REDIS_HOST=localhost
REDIS_PORT=7002

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:7010/api/v1
E2E_BASE_URL=http://localhost:7020

# Load Testing
BASE_URL=https://bsa.swipesavvy.com/api/v1
TEST_RUN_ID=$(date +%s)
```

## Authorize.Net Test Cards

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111111111111111 | 12/25 | 123 | Approved |
| 4222222222222 | 12/25 | 123 | Declined |
