# BSA Camp Card Digitalization Program
## Complete Build Specification

**Version:** 1.0 Final  
**Date:** December 23, 2025  
**Status:** Implementation-Ready  
**Author:** Virtual Product + Engineering Team

> **Repository Architecture:** This specification describes a **multi-repository architecture** where backend, mobile, web, and infrastructure are separate repositories, each with independent dependencies and deployment pipelines.

---

## 📋 SPECIFICATION OVERVIEW

This comprehensive build specification provides a complete, implementation-ready blueprint for transforming BSA's traditional plastic Camp Card fundraising program into a modern, mobile-first digital subscription platform.

**Program Mission:**
> "Pay a little. Get deals. Help Scouts."

Digitalize Scout fundraising with a subscription platform that unlocks local merchant discounts while supporting Scouts through transparent referral attribution.

---

## 📁 DOCUMENT STRUCTURE

This specification is organized into 10 comprehensive parts, totaling **~50,000 words** of implementation-ready documentation:

### **Part 1: [Executive Summary & Stakeholder Model](PART-01-EXECUTIVE-SUMMARY.md)**
- Program goals and success metrics
- 5-tier organizational hierarchy (National → Council → Troop → Scout → Customer)
- Stakeholder roles and permissions (RBAC matrix)
- Multi-tenant isolation strategy (council-level tenancy)
- Youth safety constraints (COPPA compliance, minimal PII)
- MVP/V1/V2 phasing strategy

### **Part 2: [User Journeys & Functional Requirements](PART-02-USER-JOURNEYS.md)**
- End-to-end flows for all 5 stakeholder roles
- 110 functional requirements (FR-001 to FR-110) prioritized P0/P1/P2
- Critical POS purchase + claim link flow
- Customer in-app purchase journey
- Scout sharing and dashboard flows
- Troop leader roster management and POS operations
- Council/National admin merchant and campaign management
- Edge cases and acceptance criteria

### **Part 3: [Architecture & Deployment](PART-03-ARCHITECTURE.md)** *(EC2-Based)*
- Complete AWS infrastructure specification (VPC, subnets, security groups)
- EC2 compute architecture (Auto Scaling Groups, instance types)
- Data layer (RDS PostgreSQL Multi-AZ, ElastiCache Redis, MSK Kafka)
- Networking (ALB, Route 53, CloudFront CDN)
- CI/CD pipeline (CodePipeline, CodeBuild, CodeDeploy blue/green)
- Secrets management (Secrets Manager, IAM roles)
- Monitoring and alerting (CloudWatch Logs/Metrics/Dashboards)
- Cost estimation (~$4,700/month production infrastructure)

### **Part 4: [Data Model & Attribution Logic](PART-04-DATA-MODEL.md)**
- 39 production tables with complete DDL (PostgreSQL)
- Row-Level Security (RLS) policies for multi-tenant isolation
- Referral attribution algorithm (preserves root Scout across viral chains)
- Anti-fraud safeguards (depth limits, rate limiting, self-referral blocking)
- Audit tables (90-day retention)
- Analytics pre-aggregation tables
- Flyway migration strategy
- Complete entity relationship diagrams

### **Part 5: [API Specifications](PART-05-API-SPECIFICATIONS.md)**
- 41 REST API endpoints with complete request/response schemas
- 6 Kafka topics with event schemas
- Third-party POS integration APIs (claim link generation, activation, webhooks)
- Authentication (JWT access + refresh tokens)
- Authorization (RBAC enforcement, tenant scoping)
- Rate limiting (Redis token bucket)
- Error handling (standardized JSON format)
- Idempotency and webhook signatures

### **Part 6: [Reporting & Dashboards](PART-06-DASHBOARDS.md)**
- Dashboard specifications for all 5 user roles
- Scout dashboard (ages 5-14 UX, gamification, leaderboard)
- Troop Leader dashboard (roster, POS claim links, performance table)
- Council Admin dashboard (KPIs, revenue trends, merchant tracking)
- National Admin dashboard (cross-council benchmarking, system health)
- Customer dashboard (savings total, redemption history)
- Metrics definitions with SQL/API mappings
- UI wireframes and sample code
- Export/print functionality (CSV, PDF)
- Real-time update strategy (polling intervals, caching TTLs)

### **Part 7: [UX/UI & Design System Integration](PART-07-UX-DESIGN-SYSTEM.md)**
- Complete design token specification (colors, spacing, typography, shadows)
- Token-based architecture (JSON/CSS → Platform themes → Components)
- Camp Card brand palette (Navy/Blue/Red, gradients)
- Component library (Button, Card, Input, Badge, ProgressBar)
- React Native + Web implementations
- Age-appropriate UX patterns (ages 5-14: large text, simple language, gamification)
- Parent/guardian oversight (Scout has no login)
- Responsive design (5 breakpoints, mobile-first)
- WCAG 2.1 AA accessibility compliance
- Animation patterns and icon system

### **Part 8: [Security, Privacy & Youth Protections](PART-08-SECURITY-PRIVACY.md)**
- OWASP Top 10 mitigation strategies (A01-A10 detailed implementations)
- COPPA compliance (data minimization, parental consent, deletion rights)
- GDPR compliance (data export, right to erasure, rectification)
- CCPA compliance (privacy disclosures, deletion requests)
- PCI DSS payment security (SAQ A via Stripe, no card data storage)
- Multi-tenant isolation testing
- Penetration testing schedule (pre-launch, quarterly, annual third-party)
- Vulnerability remediation SLA (Critical 24h, High 7d, Medium 30d, Low 90d)
- Incident response plan (P0/P1 procedures, breach notification)
- Security training and pre-launch checklist (45+ items)

### **Part 9: [Implementation Plan & Rollout](PART-09-IMPLEMENTATION-PLAN.md)**
- 44-week timeline (MVP 16 weeks, V1 28 weeks, V2 44 weeks)
- Release strategy (MVP: 1 pilot council, V1: 5 beta councils, V2: 25 councils)
- Team structure (7 FTE core team + 3 contractors)
- Project phases and milestones (Phase 0-3)
- Epic breakdown (7 epics, 389 total story points)
- Comprehensive testing strategy (unit, integration, E2E, load, security, accessibility)
- Rollout plan (pilot → beta → GA with success criteria)
- Risk management (technical, product, operational)
- Success metrics and KPIs (per phase)
- Budget ($1,127,500 development + $726,500/year operational)
- Documentation deliverables (technical, user, training)
- Pre-launch checklist and launch day runbook

### **Part 10: [MCP Admin Server & Open Questions](PART-10-MCP-ADMIN-OPEN-QUESTIONS.md)**
- Model Context Protocol (MCP) integration architecture
- 20+ AI-powered admin tools (council summaries, subscription search, Scout performance, merchant management, system health monitoring)
- Security framework (JWT auth, RBAC, rate limiting, audit logging, PII redaction)
- Implementation samples (TypeScript MCP server, tool definitions)
- AI assistant integration (Claude Desktop configuration)
- Custom admin dashboard concept (Next.js chat UI)
- **19 open questions with recommendations** across:
  - Product & business model (Q1-Q4)
  - Technical architecture (Q5-Q8)
  - Security & privacy (Q9-Q11)
  - User experience (Q12-Q14)
  - Operational (Q15-Q17)
  - MCP-specific (Q18-Q19)
- MCP implementation roadmap (4 phases, weeks 29-44)
- Success metrics for AI operations

---

## 🎯 CRITICAL DESIGN DECISIONS

### Technology Stack

**Backend:**
- Language: Java 21
- Framework: Spring Boot 3.x
- Database: PostgreSQL 16.x (Amazon RDS Multi-AZ)
- Event Streaming: Apache Kafka 3.6 (Amazon MSK)
- Caching: Redis 7.x (ElastiCache cluster mode)
- Migrations: Flyway

**Frontend (Mobile):**
- Framework: React Native
- Language: TypeScript 5.x
- State Management: Zustand
- Navigation: React Navigation
- Platforms: iOS 15+ / Android 10+

**Frontend (Web Portal):**
- Framework: Next.js 14+ (React)
- Language: TypeScript 5.x
- State Management: Zustand
- UI Components: Custom (design system)
- SSR/SSG: Next.js App Router

**Infrastructure:**
- Cloud: AWS
- Compute: EC2 instances (NOT ECS/Fargate per requirements)
- Load Balancing: Application Load Balancer (ALB)
- CDN: CloudFront
- Monitoring: CloudWatch
- CI/CD: CodePipeline + CodeBuild + CodeDeploy

### Multi-Tenant Strategy

**Tenant Boundary:** Council (Local Scout Council)

**Isolation Method:**
- Shared schema with Row-Level Security (RLS)
- All tables include `council_id` foreign key
- PostgreSQL RLS policies enforce `council_id = current_setting('app.council_id')`
- JWT tokens include `council_id` claim
- Application sets session variable on every request

**Why Not Separate Schemas/Databases?**
- Cost-effective (single RDS instance for MVP/V1)
- Simplified migrations (one schema version)
- Cross-council analytics enabled (National Admin queries)
- RLS provides strong isolation + performance

### Referral Attribution Model

**Core Principle:** Preserve root Scout attribution across infinite customer-to-customer referral chains

**Algorithm:**
```
IF customer referred by Scout directly:
  root_scout_id = Scout
  depth = 0
  
ELSE IF customer referred by another customer:
  root_scout_id = referring_customer.root_scout_id
  depth = referring_customer.depth + 1
  
  IF depth > 5:
    STOP attribution (prevent abuse)
```

**Anti-Fraud Safeguards:**
- Depth limit: Max 5 levels
- Self-referral blocking: Cannot use own referral code
- Click spam rate limiting: Max 10 clicks/hour per IP per Scout
- One-time claim tokens: POS claim links expire after 7 days

### Youth Safety Constraints (COPPA Compliance)

**Scouts Under 13 (Ages 5-12):**
- **Minimal PII:** First name only, NO last name, DOB, address, photo
- **No Login:** Scouts cannot log in; parent accesses via linked account
- **Parental Consent:** Email consent required before Scout activation
- **Dashboard Access:** Parent/guardian views Scout dashboard (read-only for Scout)

**Scouts 13-14:**
- **Optional Login:** Can have read-only dashboard access
- **Still Minimal PII:** First name, last initial only

**Data Deletion:**
- Parents can request Scout data deletion at any time
- Anonymize PII, retain aggregated troop totals
- 30-day grace period (soft delete) for undo

---

## 📊 PROJECT METRICS

### Timeline

| Phase | Duration | Deliverable | Launch Date |
|-------|----------|-------------|-------------|
| **Phase 0: Foundation** | Weeks 1-4 | Infrastructure, design system | Feb 3, 2026 |
| **Phase 1: MVP** | Weeks 5-16 | Pilot (1 council, 500 Scouts) | May 5, 2026 |
| **Phase 2: V1** | Weeks 17-28 | Beta (5 councils, 2,500 Scouts) | Aug 17, 2026 |
| **Phase 3: V2** | Weeks 29-44 | GA (25 councils, 12,500 Scouts) | Dec 7, 2026 |

**Total Duration:** 44 weeks (Jan 6, 2026 → Dec 7, 2026)

### Budget

| Category | MVP (16 wks) | V1 (12 wks) | V2 (16 wks) | **Total** |
|----------|--------------|-------------|-------------|-----------|
| **Personnel** | $280,000 | $210,000 | $280,000 | **$770,000** |
| **Contractors** | $48,000 | $36,000 | $36,000 | **$120,000** |
| **AWS** | $24,000 | $18,000 | $33,000 | **$75,000** |
| **Security** | $25,000 | $0 | $37,500 | **$62,500** |
| **Contingency (15%)** | $15,000 | $11,250 | $15,000 | **$100,000** |
| **Total** | **$392,000** | **$275,250** | **$401,500** | **$1,127,500** |

**Annual Operational:** $726,500/year (post-V2 launch)

### Success Metrics

**MVP (Pilot - 1 council):**
- 80% troop onboarding rate
- 60% Scout activation (parental consent)
- 15% conversion rate (clicks → purchases)
- <5% churn rate (first 90 days)
- 99.5% uptime

**V1 (Beta - 5 councils):**
- 10,000 active customers
- 50+ merchant partners
- 150+ live offers
- 5,000+ monthly redemptions
- <8% churn rate

**V2 (GA - 25 councils):**
- 50,000 active customers
- $1.5M ARR (annual recurring revenue)
- <6% churn rate
- $90+ customer LTV (lifetime value)
- $75/Scout average fundraising
- 99.9% uptime
- 4.5/5.0 customer satisfaction

---

## 🔐 SECURITY & COMPLIANCE

### Frameworks

- ✅ **OWASP Top 10** (2021) - All 10 risks mitigated
- ✅ **COPPA** (Children's Online Privacy Protection Act)
- ✅ **GDPR** (General Data Protection Regulation)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ **PCI DSS SAQ A** (via Stripe payment processing)

### Testing Schedule

- **Pre-Launch:** Internal security audit + penetration test
- **Post-Launch:** Quarterly automated scans (OWASP ZAP, Dependency Check)
- **Annual:** Third-party penetration test (external firm)

### Incident Response

| Severity | Response Time | Containment | Resolution | Notification |
|----------|---------------|-------------|------------|--------------|
| **P0 (Critical)** | 5 minutes | 30 minutes | 4 hours | 24 hours |
| **P1 (High)** | 30 minutes | 2 hours | 24 hours | 72 hours |

---

## 🚀 QUICK START FOR ENGINEERS

### Prerequisites

- AWS account with EC2, RDS, S3, CloudFront access
- GitHub repository access
- Docker Desktop (for local development)
- Node.js 20 LTS + Java 21 JDK

### Repository Structure (Recommended)

```
camp-card-platform/
├── backend/              # Spring Boot API
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── mobile/               # React Native app
│   ├── src/
│   ├── ios/
│   ├── android/
│   └── package.json
├── web/                  # Next.js web portal
│   ├── app/
│   ├── components/
│   └── package.json
├── infrastructure/       # Terraform/CloudFormation
│   ├── vpc.tf
│   ├── ec2.tf
│   └── rds.tf
├── migrations/           # Flyway SQL migrations
│   └── V001__initial_schema.sql
└── docs/                 # This specification
    └── build-specification/
```

### Getting Started

1. **Review Specification**
   - Read [Part 1: Executive Summary](PART-01-EXECUTIVE-SUMMARY.md) first
   - Review [Part 9: Implementation Plan](PART-09-IMPLEMENTATION-PLAN.md) for timeline

2. **Provision Infrastructure**
   - Follow [Part 3: Architecture](PART-03-ARCHITECTURE.md)
   - Use provided Terraform configs (infrastructure/)

3. **Set Up Database**
   - Deploy PostgreSQL RDS instance
   - Run Flyway migrations from [Part 4: Data Model](PART-04-DATA-MODEL.md)

4. **Implement Backend**
   - Build REST APIs per [Part 5: API Specifications](PART-05-API-SPECIFICATIONS.md)
   - Implement security controls from [Part 8: Security](PART-08-SECURITY-PRIVACY.md)

5. **Build Frontend**
   - Implement design system from [Part 7: UX/UI](PART-07-UX-DESIGN-SYSTEM.md)
   - Build dashboards per [Part 6: Dashboards](PART-06-DASHBOARDS.md)

6. **Test & Deploy**
   - Follow testing strategy in [Part 9: Implementation Plan](PART-09-IMPLEMENTATION-PLAN.md)
   - Deploy to staging, then production

---

## ❓ OPEN QUESTIONS

**19 decisions needed** before full implementation. See [Part 10: Open Questions](PART-10-MCP-ADMIN-OPEN-QUESTIONS.md) for complete list.

**Top 5 Priority Questions:**

1. **Q1 (Product):** Fixed vs. council-configurable pricing?
   - **Recommendation:** Fixed national pricing for MVP
   - **Decision Needed By:** Week 4

2. **Q9 (Security):** How to verify Scout age for COPPA?
   - **Recommendation:** Grade level as proxy (K-8 = under 13)
   - **Decision Needed By:** Week 6

3. **Q12 (UX):** How do Scouts access dashboard?
   - **Recommendation:** Parent logs in, views Scout dashboard
   - **Decision Needed By:** Week 9

4. **Q13 (UX):** Merchant validates redemptions or customer self-reports?
   - **Recommendation:** Merchant validates (prevents fraud)
   - **Decision Needed By:** Week 21

5. **Q15 (Operations):** In-house or outsourced customer support?
   - **Recommendation:** Hybrid (Tier 1 outsourced, Tier 2+ in-house)
   - **Decision Needed By:** Week 24

---

## 📞 STAKEHOLDER CONTACTS

**BSA National Council:**
- Program Owner: [TBD]
- Technical Liaison: [TBD]

**Pilot Council (MVP):**
- Council: [TBD - Select 1 council with 20+ troops]
- Council Executive: [TBD]
- Primary Contact: [TBD]

**Engineering Team:**
- Product Manager: [TBD]
- Backend Lead: [TBD]
- Mobile Lead: [TBD]
- Web Lead: [TBD]
- DevOps/SRE: [TBD]
- UX/UI Designer: [TBD]
- QA Engineer: [TBD]

**Contractors:**
- Security Engineer: [TBD]
- Technical Writer: [TBD]
- BSA Liaison: [TBD]

---

## 📝 CHANGE LOG

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 23, 2025 | Initial release (all 10 parts complete) | Virtual Team |

---

## 📄 LICENSE & USAGE

**Confidential and Proprietary**

This specification is the property of Boy Scouts of America (BSA) / Scouting America and is intended solely for internal use in developing the Camp Card Digitalization Program. Unauthorized distribution, reproduction, or use is prohibited.

**Copyright © 2025 Boy Scouts of America. All rights reserved.**

---

## 🏁 READY TO BUILD

This specification provides **everything needed** to begin engineering immediately:

✅ Complete product requirements (110 functional requirements)  
✅ Production-ready architecture (EC2 infrastructure, cost estimates)  
✅ Detailed data model (39 tables with DDL, RLS policies)  
✅ Full API contracts (41 endpoints, 6 Kafka topics)  
✅ Implementation-ready UX (design system, component library)  
✅ Security compliance (OWASP, COPPA, GDPR, CCPA, PCI DSS)  
✅ 44-week project plan (epics, stories, testing, rollout)  
✅ AI operations roadmap (MCP admin server)  

**Next Step:** Assemble team and begin Phase 0 (Infrastructure Setup) on January 6, 2026.

---

**Questions?** Review [Part 10: Open Questions](PART-10-MCP-ADMIN-OPEN-QUESTIONS.md) or contact the product team.
