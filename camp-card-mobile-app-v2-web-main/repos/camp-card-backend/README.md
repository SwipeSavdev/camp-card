# BSA Camp Card - Backend API

**Spring Boot REST API for the BSA Camp Card Platform**

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)

> **Note:** This is a standalone repository within a multi-repository architecture. Each component (backend, mobile, web) is an independent repository with its own dependencies and build process.

> **Dev Stub Included:** The original archive this repo was derived from did not contain backend source files. A minimal **stub API implementation** has been added under `src/main/java/...` so the redesigned mobile app can be run end-to-end during development. Replace the stub with your production API implementation when ready.

---

## Overview

Multi-tenant RESTful API providing:
- JWT-based authentication & RBAC authorization
- Scout referral attribution with viral chain tracking
- Stripe subscription management
- Merchant & offer CRUD operations
- Real-time event streaming via Kafka
- Redis caching for dashboard performance

**Tech Stack:**
- Java 21
- Spring Boot 3.2
- PostgreSQL 16 (Amazon RDS)
- Redis 7 (ElastiCache)
- Apache Kafka 3.6 (Amazon MSK)
- Flyway migrations

---

## Quick Start

### Prerequisites

- Java 21 JDK
- Maven 3.9+
- Docker & Docker Compose (for local services)

### 1. Start Local Services

```bash
# Start PostgreSQL, Redis, Kafka
docker-compose up -d

# Verify services
docker-compose ps
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
vim .env
```

### 3. Run Migrations

```bash
# Run Flyway migrations
./mvnw flyway:migrate

# Or run on startup (configured in application.yml)
```

### 4. Start Application

```bash
# Development mode (hot reload)
./mvnw spring-boot:run

# With specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Build and run JAR
./mvnw clean package
java -jar target/campcard-api-1.0.0.jar
```

### 5. Verify

```bash
# Health check
curl http://localhost:8080/actuator/health

# API documentation
open http://localhost:8080/swagger-ui.html
```

---

##  Project Structure

```
backend/
 src/
  main/
   java/org/bsa/campcard/
    CampCardApplication.java
    config/
     SecurityConfig.java
     JwtConfig.java
     KafkaConfig.java
     RedisConfig.java
     SwaggerConfig.java
    controller/
     AuthController.java
     SubscriptionController.java
     ScoutController.java
     MerchantController.java
     OfferController.java
     DashboardController.java
    dto/
     request/
     response/
    entity/
     Council.java
     Troop.java
     User.java
     Scout.java
     Subscription.java
     ...
    repository/
     CouncilRepository.java
     ScoutRepository.java
     ...
    service/
     AuthService.java
     SubscriptionService.java
     ReferralService.java
     StripeService.java
     ...
    security/
     JwtTokenProvider.java
     JwtAuthenticationFilter.java
     TenantContext.java
     RlsPolicyInterceptor.java
    kafka/
     producer/
     consumer/
    exception/
     GlobalExceptionHandler.java
     custom/
    util/
   resources/
   application.yml
   application-dev.yml
   application-staging.yml
   application-prod.yml
   db/migration/
   V001__initial_schema.sql
   V002__seed_data.sql
   V003__analytics_tables.sql
  test/
  java/org/bsa/campcard/
   integration/
   unit/
  resources/
  application-test.yml
 docker-compose.yml
 .env.example
 .gitignore
 pom.xml
 README.md
```

---

##  Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campcard_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Security
JWT_SECRET=your-secret-key-min-32-chars-use-secrets-manager-in-prod
JWT_EXPIRATION=900000

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS (Production)
AWS_REGION=us-east-1
S3_BUCKET=campcard-assets-prod

# Application
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
```

### Database Connection

**Development (Docker):**
```yaml
spring:
 datasource:
 url: jdbc:postgresql://localhost:5432/campcard_dev
 username: postgres
 password: postgres
```

**Production (RDS):**
```yaml
spring:
 datasource:
 url: jdbc:postgresql://${DB_HOST}:5432/campcard_prod
 username: ${DB_USERNAME}
 password: ${DB_PASSWORD}
```

---

## Testing

### Unit Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=SubscriptionServiceTest

# Run with coverage
./mvnw test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

**Coverage Target:** 80% line coverage, 70% branch coverage

### Integration Tests

```bash
# Run integration tests (requires Docker)
./mvnw verify -P integration-tests

# Or run specific integration test
./mvnw verify -Dit.test=SubscriptionControllerIT
```

### Test Database

Tests use Testcontainers for isolated PostgreSQL instances:

```java
@Testcontainers
@SpringBootTest
class SubscriptionServiceIT {
 @Container
 static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

---

## API Documentation

### Swagger UI

**Development:** http://localhost:8080/swagger-ui.html
**Staging:** https://api-staging.campcard.org/swagger-ui.html

### OpenAPI Spec

**JSON:** http://localhost:8080/v3/api-docs
**YAML:** http://localhost:8080/v3/api-docs.yaml

### Example Endpoints

```bash
# Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

# Subscriptions
GET /api/v1/subscriptions
POST /api/v1/subscriptions
GET /api/v1/subscriptions/{id}
PATCH /api/v1/subscriptions/{id}/cancel

# Scouts
GET /api/v1/scouts
POST /api/v1/scouts
GET /api/v1/scouts/{id}/dashboard

# Merchants & Offers
GET /api/v1/offers
GET /api/v1/offers/nearby?lat=28.5383&lng=-81.3792

# POS Integration
POST /api/v1/pos/claim-links
POST /api/v1/pos/claim/{token}

# Dashboards
GET /api/v1/dashboards/scout/{scoutId}
GET /api/v1/dashboards/troop/{troopId}
GET /api/v1/dashboards/council/{councilId}
```

---

##  Deployment

### Build Production JAR

```bash
# Clean build
./mvnw clean package -P production

# Skip tests (not recommended)
./mvnw clean package -DskipTests

# Output: target/campcard-api-1.0.0.jar
```

### Docker Image

```bash
# Build image
docker build -t campcard-api:1.0.0 .

# Run container
docker run -d \
 -p 8080:8080 \
 -e SPRING_PROFILES_ACTIVE=prod \
 -e DB_HOST=production-db.example.com \
 --name campcard-api \
 campcard-api:1.0.0
```

### AWS EC2 Deployment

```bash
# Using AWS CodeDeploy
aws deploy create-deployment \
 --application-name campcard-api \
 --deployment-group-name production \
 --s3-location bucket=campcard-deploy,key=api-1.0.0.jar,bundleType=zip

# Using systemd service
sudo systemctl restart campcard-api
sudo systemctl status campcard-api
```

---

##  Security

### Authentication Flow

1. Client sends credentials to `POST /api/v1/auth/login`
2. Server validates credentials
3. Server generates JWT with claims: `user_id`, `council_id`, `role`
4. Client stores JWT and sends in `Authorization: Bearer {token}` header
5. Server validates JWT on each request

### Multi-Tenant Isolation

**Row-Level Security (RLS):**
```java
// Set session variable on each request
@Aspect
public class TenantAspect {
 @Before("@annotation(RequiresTenant)")
 public void setTenantContext(JoinPoint joinPoint) {
 Long councilId = SecurityContextHolder.getContext().getCouncilId();
 entityManager.createNativeQuery("SET app.council_id = :councilId")
 .setParameter("councilId", councilId)
 .executeUpdate();
 }
}
```

### OWASP Top 10 Protections

- A01: Broken Access Control  RBAC + RLS
- A02: Cryptographic Failures  TLS 1.3, bcrypt passwords
- A03: Injection  Parameterized queries, input validation
- A04: Insecure Design  Rate limiting, idempotency keys
- A05: Security Misconfiguration  Secrets Manager, HTTP headers
- A06: Vulnerable Components  Dependency scanning
- A07: Authentication Failures  JWT, MFA support
- A08: Software Integrity  Code signing
- A09: Logging Failures  CloudWatch, audit table
- A10: SSRF  URL validation

---

## Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Detailed health (auth required)
curl -H "Authorization: Bearer {token}" \
 http://localhost:8080/actuator/health/details
```

### Metrics

```bash
# Prometheus metrics
curl http://localhost:8080/actuator/prometheus

# Custom metrics
curl http://localhost:8080/actuator/metrics/campcard.subscriptions.created
```

### Logging

**Development:** Console output
**Production:** CloudWatch Logs

```java
// Structured JSON logging
log.info("Subscription created",
 kv("subscription_id", subscription.getId()),
 kv("user_id", user.getId()),
 kv("plan_id", plan.getId())
);
```

---

##  Contributing

### Code Style

- **Style Guide:** Google Java Style Guide
- **Formatter:** `./mvnw spotless:apply`
- **Checkstyle:** `./mvnw checkstyle:check`

### Commit Convention

```
feat(subscriptions): add POS claim link generation

Implements FR-045 for troop leaders to generate one-time claim links.

Closes #123
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/FR-123-description`
2. Write tests (maintain 80% coverage)
3. Run checks: `./mvnw verify`
4. Push and create PR
5. Wait for CI/CD checks + code review
6. Merge after approval

---

##  Support

**Documentation:** See `/docs` in main repository
**Issues:** GitHub Issues
**Slack:** #backend-dev
**Email:** backend-team@campcard.org

---

##  License

**UNLICENSED** - Proprietary
Copyright  2025 Boy Scouts of America
