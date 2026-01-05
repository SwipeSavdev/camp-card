# BSA Camp Card Digitalization Program
## Build Specification  Part 1: Executive Summary & Stakeholder Model

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Program Overview

The **BSA Camp Card Digitalization Program** transforms the traditional plastic discount card fundraising model into a modern, mobile-first digital subscription platform. This system replaces physical cards with a compelling digital product that:

- **Increases conversion** through frictionless sharing (QR + link) and immediate activation
- **Drives renewals** via subscription auto-renew and continuous value delivery
- **Maximizes visibility** with real-time dashboards at every organizational level
- **Ensures youth safety** through minimal Scout data collection and adult-supervised workflows
- **Supports fundraising** via precise referral attribution and multi-tier reporting

**Target Market:**
- **Primary sellers:** Scouts ages 514 (with troop leader supervision)
- **Buyers/subscribers:** Adult customers (parents, community members, businesses)
- **Beneficiaries:** Local Scout troops and councils (fundraising revenue)

**Core Value Proposition:**
> "Pay a little. Get deals. Help Scouts."

Customers pay a small subscription fee ($15$35/year typical) to unlock local merchant discounts and online offers, while directly supporting Scout fundraising through transparent attribution to the Scout seller who referred them.

---

## 2. PROGRAM GOALS & SUCCESS METRICS

### 2.1 Business Goals

| Goal | Metric | Target (Year 1) |
|------|--------|-----------------|
| **Digitalize fundraising** | % of councils using digital vs. physical cards | 40% adoption |
| **Increase conversion** | Purchase rate from link/QR clicks | 15%+ (vs. ~5% physical) |
| **Boost renewals** | Subscription renewal rate | 60%+ |
| **Expand reach** | Customer referrals per Scout | 3+ indirect referrals |
| **Enhance visibility** | Dashboard usage by troop leaders | 80%+ weekly active |
| **Maintain youth safety** | Zero youth data incidents | 100% compliance |

### 2.2 Technical Goals

- **Performance:** Offer browsing < 500ms p95, redemption < 1s p95
- **Availability:** 99.5% uptime during fundraising campaigns
- **Scalability:** Support 500+ councils, 50K+ troops, 2M+ customers at launch
- **Security:** OWASP API Top 10 compliance, zero critical vulnerabilities
- **Privacy:** COPPA/GDPR-ready youth data handling, adult consent flows

---

## 3. STAKEHOLDER HIERARCHY & TENANT MODEL

### 3.1 Organizational Hierarchy

```
National Council (BSA / Scouting America)
  Local Council (e.g., Central Florida Council, Bay Area Council)
  District (optional organizational layer)
  Troop / Pack / Unit
  Troop Leader(s) (adult volunteers)
  Scouts (youth members, ages 518)
```

### 3.2 Tenant Boundaries

**Primary Tenant:** **Local Council**

- Each Local Council operates as an independent tenant with:
 - Isolated data (subscriptions, merchants, offers, campaigns)
 - Custom branding (logos, colors, messaging)
 - Independent merchant partnerships
 - Isolated billing/payment processing (optional)

**Cross-Tenant Access:**
- **National Council** has read-only cross-tenant visibility for:
 - Aggregate reporting and benchmarking
 - System health monitoring
 - Compliance audits
- **Strict isolation:** Council admins and users can ONLY access their tenant's data

### 3.3 Sub-Tenant Entities

Within each Council tenant:

| Entity | Relationship | Data Scope |
|--------|--------------|------------|
| **Troop/Unit** | Many per Council | Troop-specific scouts, leaders, performance |
| **Troop Leader** | Many per Troop | Adult volunteer managing troop roster |
| **Scout** | Many per Troop | Youth seller with referral tracking |
| **Customer** | Council-wide | Adult subscriber; may support multiple Scouts |

---

## 4. USER ROLES & PERMISSIONS (RBAC)

### 4.1 Role Definitions

| Role | User Type | Primary Tenant | Key Permissions |
|------|-----------|----------------|-----------------|
| **SYSTEM_ADMIN** | National Council staff | Cross-tenant (global) | All operations, cross-council reporting, system config |
| **COUNCIL_ADMIN** | Council staff | Single Council | Council-wide management, merchants, offers, campaigns, troop oversight |
| **TROOP_LEADER** | Adult volunteer | Single Troop (within Council) | Troop roster, Scout management, troop reporting, POS link generation |
| **SCOUT** | Youth member | Individual Scout | View own dashboard, generate affiliate link/QR, view attributed sales |
| **CUSTOMER** | Adult subscriber | N/A (not admin) | Browse offers, redeem, manage subscription, view savings |

### 4.2 Detailed Permission Matrix

| Capability | SYSTEM_ADMIN | COUNCIL_ADMIN | TROOP_LEADER | SCOUT | CUSTOMER |
|------------|--------------|---------------|--------------|-------|----------|
| **Cross-Council Reporting** |  |  |  |  |  |
| **Council Configuration** |  |  |  |  |  |
| **Merchant CRUD** |  |  |  |  |  |
| **Offer CRUD** |  |  |  |  |  |
| **Campaign Management** |  |  |  |  |  |
| **Troop Roster Management** |  |  |  |  |  |
| **Scout Management** |  |  |  |  |  |
| **Generate POS Claim Links** |  |  |  |  |  |
| **View Troop Fundraising Report** |  |  |  |  |  |
| **View Scout Dashboard** |  |  |  |  |  |
| **Generate Scout Affiliate Link/QR** |  |  |  |  |  |
| **Print Marketing Materials** |  |  |  |  |  |
| **Browse Offers** |  |  |  |  |  |
| **Redeem Offers** |  |  |  |  |  (if subscribed) |
| **Manage Subscription** |  |  |  |  |  |
| **View Personal Savings** |  |  |  |  |  |

### 4.3 Youth Safety & Minimal Data Collection

**Scout Role Constraints:**
- **Age:** Typically 518 years old (minors)
- **PII Collection (MINIMAL):**
 - First name (for dashboard personalization)
 - Troop ID (for attribution)
 - Unique Scout ID (system-generated)
 - Parent/guardian email (for notification consent, stored separately)
- **Prohibited Data:**
 - No Scout email addresses used for marketing
 - No Scout phone numbers
 - No Scout physical addresses
 - No direct payment/financial data
- **Access Controls:**
 - Scout accounts created and managed by Troop Leaders
 - Scout dashboards are read-only (view metrics, generate links)
 - No Scout access to customer PII or payment data
 - All Scout actions logged for audit

**Customer Role (Adult):**
- Customers are always **adults** (18+) who create their own accounts
- Customers provide payment, subscription management, and offer redemption
- Customers may be prompted to select a Scout to support (optional attribution)

---

## 5. TENANT ISOLATION STRATEGY

### 5.1 Database Isolation (Shared Schema with Tenant ID)

**Approach:** Single PostgreSQL database with tenant context enforced via `council_id` column + Row-Level Security (RLS) policies.

**Rationale:**
- **Simplicity:** Easier schema migrations, backups, and cross-tenant analytics (for National)
- **Cost-efficiency:** Single database instance vs. per-tenant databases
- **Performance:** Indexed tenant columns + RLS provide strong isolation with minimal overhead

**Implementation:**
- Every multi-tenant table includes `council_id BIGINT NOT NULL`
- Foreign key constraints enforce referential integrity within tenant
- PostgreSQL RLS policies filter rows based on session tenant context
- Application sets `SET LOCAL app.current_council_id = ?` at transaction start

**Example RLS Policy:**
```sql
CREATE POLICY council_isolation_policy ON merchants
 USING (council_id = current_setting('app.current_council_id')::BIGINT);
```

### 5.2 API Tenant Context Propagation

**JWT Claims:**
- All authenticated requests include JWT with:
 ```json
 {
 "sub": "user-uuid",
 "role": "TROOP_LEADER",
 "council_id": 42,
 "troop_id": 1337,
 "permissions": ["MANAGE_SCOUTS", "VIEW_TROOP_REPORTS"]
 }
 ```

**Request Flow:**
1. Client sends JWT in `Authorization: Bearer <token>` header
2. API Gateway / Spring Security validates JWT signature
3. Extract `council_id` from claims
4. Store in thread-local context (Spring Security `SecurityContext`)
5. Before each DB query, set session variable: `SET LOCAL app.current_council_id = ?`
6. RLS policies enforce tenant filtering

**Cross-Tenant Requests (SYSTEM_ADMIN only):**
- `SYSTEM_ADMIN` role bypasses RLS for read-only aggregate queries
- Write operations still scoped to single tenant for safety
- All cross-tenant access logged in audit trail

---

## 6. KEY ASSUMPTIONS & CONSTRAINTS

### 6.1 Technical Constraints

| Constraint | Rationale | Impact |
|------------|-----------|--------|
| **AWS EC2 instances** (not ECS/Fargate) | Preferred deployment model | Requires explicit ALB + ASG + CodeDeploy configuration |
| **Spring Boot (Java)** backend | Preferred stack | Leverages Java ecosystem, strong typing, mature tooling |
| **PostgreSQL** primary database | Relational data with ACID guarantees | Tenant isolation via RLS, strong consistency |
| **Kafka** for event streaming | Decoupled async processing | Requires topic design, consumer groups, tenant metadata in events |
| **React Native** mobile app | Cross-platform (iOS + Android) | Shared codebase, native performance |
| **Next.js** web portal | SSR + SEO for landing pages, admin portal | Node.js runtime on EC2 |
| **Zustand** state management | Lightweight, simple API | Easier for Scout-facing mobile UX |

### 6.2 Operational Assumptions

- **CI/CD:** GitHub Actions or AWS CodePipeline + CodeBuild + CodeDeploy
- **Secrets Management:** AWS Secrets Manager + IAM instance profiles (no static keys)
- **Monitoring:** CloudWatch Logs/Metrics + optional Datadog/New Relic
- **Logging:** Structured JSON logs with tenant context, correlation IDs
- **Backups:** Automated PostgreSQL snapshots, Kafka replication factor 3+

---

## 7. SUCCESS CRITERIA (DEFINITION OF DONE)

### 7.1 MVP (Minimum Viable Product)

**Timeline:** 16 weeks (4 months)

**In-Scope:**
- Single pilot council deployment (e.g., Central Florida Council)
- Customer sign-up via Scout affiliate link/QR (in-app purchase only)
- Offer browsing and show-to-cashier redemption
- Scout dashboard (basic metrics: direct referrals, link clicks, conversions)
- Troop leader dashboard (roster, troop totals)
- Council admin portal (merchants, offers, campaigns, basic reporting)
- Manual merchant onboarding (CSV upload)
- Token-based design system (web + mobile)

**Out-of-Scope (MVP):**
- Third-party POS integration (postponed to V1)
- Geo-targeted notifications (postponed to V1)
- Indirect referral chain attribution (simplified: direct only for MVP)
- Multi-council deployment
- Merchant self-service portal

### 7.2 V1 (Full Feature Release)

**Timeline:** +12 weeks after MVP (7 months total)

**Added Features:**
- Third-party POS purchase + claim link flow
- Full referral chain attribution (root Scout credit for indirect referrals)
- Geo-targeted notifications (opt-in, configurable geofences)
- Enhanced dashboards (conversion funnels, cohort analysis, geo analytics)
- Merchant self-service portal (offer management, redemption analytics)
- Multi-council deployment (35 councils)
- Subscription plan variations (monthly, annual, family plans)

### 7.3 V2 (Scale & Optimization)

**Timeline:** +16 weeks after V1 (11 months total)

**Added Features:**
- National dashboard (cross-council benchmarking)
- Advanced fraud detection (click spam, redemption abuse)
- White-label configuration (per-council branding via admin UI)
- Mobile wallet integration (Apple Wallet, Google Pay passes)
- Offline redemption support (sync when online)
- API marketplace for third-party integrations

---

## 8. GLOSSARY

| Term | Definition |
|------|------------|
| **Camp Card** | Traditional plastic discount card sold by Scouts for fundraising |
| **Council** | Local BSA governing body (tenant boundary in this system) |
| **Troop / Pack / Unit** | Local Scout group (sub-entity within Council) |
| **Scout** | Youth member (seller) who generates referrals |
| **Troop Leader** | Adult volunteer managing a troop roster |
| **Customer** | Adult subscriber who purchases and redeems offers |
| **Offer** | Discount or promotion from a merchant (e.g., "20% off purchase") |
| **Merchant** | Business providing offers |
| **Campaign** | Time-bound fundraising initiative with active offers |
| **Referral Link** | Unique URL or QR code tied to a Scout for attribution |
| **Root Referrer** | Original Scout who generated the first referral in a chain |
| **Direct Referral** | Customer purchased directly via Scout's link |
| **Indirect Referral** | Customer purchased via another customer's share, attributed to original Scout |
| **Redemption** | Customer using an offer at a merchant location |
| **POS** | Point-of-Sale system used by troops for offline card sales |
| **Claim Link** | One-time URL to activate subscription from POS purchase |
| **Entitlement** | Active subscription granting access to offers |

---

## 9. NEXT STEPS

**Immediate Actions:**
1. **Stakeholder Review:** Share Part 1 with National Council, pilot council staff, and troop leader focus group
2. **Role Confirmation:** Validate permission matrix with legal/compliance (especially Scout data handling)
3. **Tenant Model Sign-Off:** Confirm council as primary tenant boundary
4. **Proceed to Part 2:** User journeys and detailed functional requirements

**Key Questions to Resolve Before Part 2:**
- Are there districts or regions between Council and Troop that need representation?
- Should customers be able to switch their supported Scout after initial purchase?
- What happens to attributed sales if a Scout leaves the troop or ages out?

---

**END OF PART 1**

**Next:** Part 2  User Journeys & Functional Requirements
