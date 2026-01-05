#  BSA Camp Card Platform

**Digital discount subscription platform supporting Scout fundraising**

> "Pay a little. Get deals. Help Scouts."

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## Overview

The BSA Camp Card Platform transforms traditional plastic discount card fundraising into a modern, mobile-first digital subscription service. The platform enables Scouts (ages 5-14) to raise funds through referral-based subscriptions while customers access local merchant discounts.

**Key Features:**
- Mobile app (iOS/Android) for customers
-  Web portal for admins and council management
-  Stripe-powered subscriptions with auto-renewal
-  Scout referral attribution with viral customer-to-customer chains
-  Local merchant offer redemption with geo-proximity
- Real-time dashboards at all organizational levels
-  COPPA/GDPR/CCPA compliant with youth data protection

**Tech Stack:**
- **Backend:** Java 21 + Spring Boot + PostgreSQL + Kafka + Redis
- **Mobile:** React Native + TypeScript + Zustand
- **Web:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Infrastructure:** AWS EC2 + RDS + ElastiCache + MSK + S3 + CloudFront

---

## Quick Start

### Prerequisites

- Docker Desktop 24+ & Docker Compose
- Node.js 20 LTS
- Java 21 JDK
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/bsa/camp-card-platform.git
cd camp-card-platform

# Install dependencies
npm run install:all
```

### 2. Start Local Services (Docker)

```bash
# Start PostgreSQL, Redis, Kafka
docker-compose up -d

# Verify services
docker-compose ps
```

### 3. Initialize Database

```bash
# Run Flyway migrations
cd backend
./mvnw flyway:migrate

# Seed development data (optional)
./mvnw spring-boot:run -Dspring-boot.run.arguments=--seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend API
cd backend
./mvnw spring-boot:run

# Terminal 2: Web Portal
cd web
npm run dev

# Terminal 3: Mobile App (iOS)
cd mobile
npm run ios

# Terminal 4: Mobile App (Android)
cd mobile
npm run android
```

### 5. Access Applications

- **API:** http://localhost:8080
- **API Docs:** http://localhost:8080/swagger-ui.html
- **Web Portal:** http://localhost:3000
- **Mobile App:** iOS Simulator / Android Emulator

**Default Admin Credentials:**
- Email: `admin@campcard.org`
- Password: `DevPassword123!`

---

##  Project Structure

**Note:** This is a **multi-repository** project. Each component (backend, mobile, web) should be treated as an independent repository with its own dependencies and build process. This directory shows the local development structure when all repositories are checked out together.

```
camp-card-mobile-app-v2/
 backend/ # Spring Boot API (standalone repository)
  src/
   main/
    java/org/bsa/campcard/
     config/ # Spring configuration
     controller/ # REST controllers
     dto/ # Request/response DTOs
     entity/ # JPA entities
     repository/ # Data repositories
     service/ # Business logic
     security/ # JWT, RBAC
     kafka/ # Event producers/consumers
     exception/ # Error handling
    resources/
    application.yml # Configuration
    db/migration/ # Flyway migrations
   test/ # Unit & integration tests
  pom.xml

 mobile/ # React Native app (standalone repository)
  src/
   components/ # Reusable UI components
   screens/ # App screens
   navigation/ # React Navigation
   store/ # Zustand state management
   services/ # API clients
   hooks/ # Custom React hooks
   theme/ # Design tokens
   utils/ # Utilities
  ios/ # iOS native code
  android/ # Android native code
  e2e/ # Detox E2E tests
  package.json

 web/ # Next.js web portal (standalone repository)
  app/ # Next.js App Router
   (auth)/ # Authentication routes
   (dashboard)/ # Dashboard routes
   api/ # API routes (Next.js API)
   layout.tsx
  components/ # React components
  lib/ # Utilities & helpers
  public/ # Static assets
  styles/ # Global styles
  package.json

 infrastructure/ # Terraform IaC (standalone repository)
  vpc.tf # VPC, subnets, security groups
  ec2.tf # Auto Scaling Groups
  rds.tf # PostgreSQL database
  elasticache.tf # Redis cluster
  msk.tf # Kafka cluster
  alb.tf # Load balancer
  s3.tf # Storage buckets
  cloudfront.tf # CDN
  variables.tf

 migrations/ # Flyway SQL migrations
  V001__initial_schema.sql
  V002__seed_data.sql
  V003__analytics_tables.sql

 docs/ # Documentation
  build-specification/ # Complete build spec (10 parts)
  README.md
  PART-01-EXECUTIVE-SUMMARY.md
  PART-02-USER-JOURNEYS.md
  ...
  PART-10-MCP-ADMIN-OPEN-QUESTIONS.md

 docker-compose.yml # Local development services
 .env.example # Environment variables template
 .gitignore
 README.md # This file
```

---

## Development Setup

### Backend (Spring Boot)

```bash
cd backend

# Install dependencies
./mvnw clean install

# Run tests
./mvnw test

# Run with hot reload
./mvnw spring-boot:run

# Build JAR
./mvnw clean package
```

**Environment Variables:**
```bash
# Copy template
cp .env.example .env

# Edit configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campcard_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
JWT_SECRET=your-secret-key-here
STRIPE_API_KEY=sk_test_...
```

### Mobile (React Native)

```bash
cd mobile

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# E2E tests (iOS)
npm run detox:build:ios
npm run detox:test:ios
```

**Environment Variables:**
```bash
# Create .env file
API_BASE_URL=http://localhost:8080/v1
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENTRY_DSN=https://...
```

### Web (Next.js)

```bash
cd web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# E2E tests
npm run e2e
```

**Environment Variables:**
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
```

---

##  Architecture

### High-Level System Architecture

```

 Internet Users 
 (Mobile App + Web Portal + POS Systems) 

 
 
 
  CloudFront  CDN (Static Assets)
  + Route 53  DNS
 
 
 
 
  ALB  Load Balancer (SSL/TLS)
 
 
 
  
  
  
  Next.js   Spring Boot 
  Web Portal   API (EC2) 
  
 
 
   
   
   
  PostgreSQL   Redis   Kafka 
  (RDS)   (ElastiCache)  (MSK) 
   
```

### Multi-Tenant Data Isolation

**Strategy:** Shared schema with Row-Level Security (RLS)

- All tables include `council_id` foreign key
- PostgreSQL RLS policies enforce `council_id` filtering
- JWT tokens contain `council_id` claim
- Application sets session variable on every request

### Referral Attribution Algorithm

**Preserves root Scout across infinite customer-to-customer chains:**

```
Customer A (referred by Scout 123)
  Customer B (referred by Customer A)  Scout 123 credited
  Customer C (referred by Customer B)  Scout 123 credited
  Customer D (referred by Customer C)  Scout 123 credited
```

**Anti-fraud safeguards:**
- Max depth: 5 levels
- Self-referral blocking
- Click spam rate limiting (10/hour per IP per Scout)
- One-time claim tokens for POS sales

---

## Documentation

### Build Specification

Complete implementation-ready specification in [docs/build-specification/](docs/build-specification/):

1. **[Executive Summary](docs/build-specification/PART-01-EXECUTIVE-SUMMARY.md)** - Goals, stakeholders, tenant model
2. **[User Journeys](docs/build-specification/PART-02-USER-JOURNEYS.md)** - Flows, 110 functional requirements
3. **[Architecture](docs/build-specification/PART-03-ARCHITECTURE.md)** - EC2 infrastructure, $4.7K/mo cost
4. **[Data Model](docs/build-specification/PART-04-DATA-MODEL.md)** - 39 tables, referral attribution
5. **[API Specs](docs/build-specification/PART-05-API-SPECIFICATIONS.md)** - 41 endpoints, 6 Kafka topics
6. **[Dashboards](docs/build-specification/PART-06-DASHBOARDS.md)** - 5 stakeholder dashboards
7. **[UX/UI](docs/build-specification/PART-07-UX-DESIGN-SYSTEM.md)** - Design system, age 5-14 UX
8. **[Security](docs/build-specification/PART-08-SECURITY-PRIVACY.md)** - OWASP, COPPA, GDPR, CCPA
9. **[Implementation](docs/build-specification/PART-09-IMPLEMENTATION-PLAN.md)** - 44-week plan, $1.13M budget
10. **[MCP Admin](docs/build-specification/PART-10-MCP-ADMIN-OPEN-QUESTIONS.md)** - AI ops, 19 open questions

### API Documentation

- **Swagger UI:** http://localhost:8080/swagger-ui.html (when backend running)
- **OpenAPI Spec:** http://localhost:8080/v3/api-docs

### Additional Resources

- [Database Schema Diagram](docs/diagrams/database-schema.pdf)
- [Security Checklist](docs/security/pre-launch-checklist.md)
- [Deployment Guide](docs/deployment/README.md)
- [Runbooks](docs/runbooks/)

---

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
./mvnw test

# Integration tests
./mvnw verify -P integration-tests

# Test coverage report
./mvnw jacoco:report
# Open: target/site/jacoco/index.html
```

**Coverage Targets:** 80% lines, 70% branches

### Mobile Tests

```bash
cd mobile

# Unit tests
npm test

# E2E tests (iOS)
npm run detox:build:ios
npm run detox:test:ios

# E2E tests (Android)
npm run detox:build:android
npm run detox:test:android
```

### Web Tests

```bash
cd web

# Unit tests
npm test

# E2E tests
npm run e2e

# E2E tests (UI mode)
npm run e2e:ui
```

---

##  Deployment

### Infrastructure Provisioning (Terraform)

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Plan changes
terraform plan -var-file=prod.tfvars

# Apply infrastructure
terraform apply -var-file=prod.tfvars

# Outputs
terraform output
```

### Backend Deployment

```bash
cd backend

# Build production JAR
./mvnw clean package -P production

# Deploy to EC2 (via CodeDeploy)
aws deploy create-deployment \
 --application-name campcard-api \
 --deployment-group-name production \
 --s3-location bucket=campcard-deploy,key=api-v1.0.0.jar
```

### Mobile Deployment

**iOS:**
```bash
cd mobile/ios
fastlane beta # TestFlight
fastlane release # App Store
```

**Android:**
```bash
cd mobile/android
fastlane beta # Google Play Internal Testing
fastlane release # Google Play Production
```

### Web Deployment

```bash
cd web

# Build for production
npm run build

# Deploy to S3 + CloudFront
aws s3 sync out/ s3://campcard-web-prod
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

---

##  Security

**Compliance:**
- COPPA (Children's Online Privacy Protection Act)
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- PCI DSS SAQ A (via Stripe)
- OWASP Top 10 (2021)

**Security Measures:**
- JWT authentication with 15-min access tokens
- Row-Level Security (RLS) for multi-tenant isolation
- TLS 1.3 everywhere
- Secrets rotation (90 days)
- Rate limiting (100 req/min)
- Penetration testing (quarterly)

**Reporting Security Issues:**
- Email: security@campcard.org
- PGP Key: [Download](docs/security/pgp-key.asc)

---

##  Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/FR-123-description`
2. Make changes with commits following [Conventional Commits](https://www.conventionalcommits.org/)
3. Write tests (maintain 80% coverage)
4. Run linters: `npm run lint` / `./mvnw checkstyle:check`
5. Push and create Pull Request
6. Wait for CI/CD checks + code review
7. Merge to `main` after approval

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**
```
feat(api): add POS claim link generation endpoint

Implements FR-045 for troop leaders to generate one-time claim links
for offline cash/check sales. Links expire after 7 days.

Closes #123
```

### Code Style

- **Java:** Google Java Style Guide
- **TypeScript:** Airbnb TypeScript Style Guide
- **Formatting:** Prettier (auto-format on save)
- **Linting:** ESLint + Checkstyle

---

## Project Status

**Current Phase:** Phase 0 - Foundation (Weeks 1-4)

| Milestone | Status | Target Date |
|-----------|--------|-------------|
| Infrastructure Setup |  Complete | Jan 20, 2026 |
| CI/CD Pipeline |  In Progress | Jan 27, 2026 |
| Design System |  In Progress | Feb 3, 2026 |
| **MVP Launch (Pilot)** |  Not Started | May 5, 2026 |
| **V1 Launch (Beta)** |  Not Started | Aug 17, 2026 |
| **V2 Launch (GA)** |  Not Started | Dec 7, 2026 |

**Next Sprint:**
- [ ] Complete VPC provisioning (Terraform)
- [ ] Deploy RDS PostgreSQL Multi-AZ
- [ ] Implement authentication endpoints (JWT)
- [ ] Build Scout registration flow (mobile)
- [ ] Create troop leader dashboard (web)

---

##  Support

**Documentation:** [docs/](docs/)
**Issue Tracker:** [GitHub Issues](https://github.com/bsa/camp-card-platform/issues)
**Slack:** #camp-card-dev
**Email:** dev-team@campcard.org

---

##  License

**UNLICENSED** - Proprietary and Confidential

Copyright  2025 Boy Scouts of America. All rights reserved.

This software is the property of Boy Scouts of America and is intended solely for internal use. Unauthorized distribution, reproduction, or use is prohibited.

---

**Built with  by the BSA Digital Team**
