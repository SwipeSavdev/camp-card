# BSA Camp Card Digitalization Program
## Build Specification — Part 9: Implementation Plan & Rollout

**Document Version:** 1.0  
**Date:** December 23, 2025  
**Status:** Implementation-Ready

---

## 1. PROJECT OVERVIEW

### 1.1 Timeline Summary

**Total Duration:** 44 weeks (11 months)  
**Start Date:** January 6, 2026  
**MVP Launch:** April 28, 2026 (16 weeks)  
**V1 Launch:** July 14, 2026 (28 weeks)  
**V2 Launch:** November 2, 2026 (44 weeks)

### 1.2 Release Strategy

| Release | Scope | Target Audience | Goals |
|---------|-------|-----------------|-------|
| **MVP** | Core subscription + Scout referrals + basic dashboards | 1 pilot council (50 troops, ~500 Scouts) | Validate product-market fit, referral mechanics |
| **V1** | POS integration, geo offers, merchant portal | 5 beta councils (~2,500 Scouts) | Scale infrastructure, merchant onboarding |
| **V2** | Advanced analytics, customer referrals, mobile optimizations | National rollout (target 25 councils) | General availability, revenue growth |

### 1.3 Team Structure

**Core Team (Full-Time):**
- **Product Manager** (1) — Roadmap, requirements, stakeholder management
- **Backend Lead** (1) — Java/Spring Boot, PostgreSQL, Kafka
- **Mobile Lead** (1) — React Native (iOS + Android)
- **Web Lead** (1) — Next.js, admin portals
- **DevOps/SRE** (1) — AWS infrastructure, CI/CD, monitoring
- **UX/UI Designer** (1) — Design system, user flows, prototypes
- **QA Engineer** (1) — Test plans, automation, manual testing

**Extended Team (Part-Time/Contract):**
- **Security Engineer** (contract) — Penetration testing, audits
- **Technical Writer** (contract) — Documentation, help center
- **BSA Stakeholder Liaison** (internal) — Council onboarding, training

**Total: 7 FTE + 3 contractors**

---

## 2. PROJECT PHASES & MILESTONES

### 2.1 Phase 0: Foundation (Weeks 1-4)

**Duration:** January 6 – February 2, 2026 (4 weeks)

**Milestones:**
- [ ] M0.1: Development environment setup complete (Jan 13)
- [ ] M0.2: AWS infrastructure provisioned (dev + staging) (Jan 20)
- [ ] M0.3: CI/CD pipeline operational (Jan 27)
- [ ] M0.4: Design system + component library v1 (Feb 2)

**Deliverables:**
1. **Infrastructure**
   - VPC, subnets, security groups (dev + staging)
   - RDS PostgreSQL (dev instance)
   - ElastiCache Redis (dev cluster)
   - MSK Kafka (dev broker)
   - S3 buckets for artifacts, logs
   - IAM roles, Secrets Manager setup

2. **Codebase Setup**
   - Multi-repository structure: separate repos for `/backend`, `/mobile`, `/web`
   - Shared documentation in main repository: `/docs`
   - Spring Boot starter project (Java 21, Maven)
   - React Native starter (TypeScript, Zustand)
   - Next.js starter (TypeScript, Zustand)
   - Shared design tokens package

3. **CI/CD**
   - GitHub Actions workflows (linting, unit tests)
   - CodePipeline for backend (dev environment)
   - CodePipeline for web (dev environment)
   - Expo EAS for mobile builds (dev)

4. **Design**
   - Figma design system file
   - Core components designed (Button, Card, Input, Badge)
   - Scout dashboard mockups
   - Customer dashboard mockups

---

### 2.2 Phase 1: MVP Development (Weeks 5-16)

**Duration:** February 3 – April 28, 2026 (12 weeks)

**Milestones:**
- [ ] M1.1: Authentication + multi-tenancy backend (Feb 17)
- [ ] M1.2: Subscription APIs + Stripe integration (Mar 3)
- [ ] M1.3: Scout referral attribution logic (Mar 17)
- [ ] M1.4: Mobile app (customer + Scout dashboard) (Mar 31)
- [ ] M1.5: Admin portal (troop leader + council admin) (Apr 14)
- [ ] M1.6: MVP integration testing complete (Apr 21)
- [ ] M1.7: MVP LAUNCH (pilot council) (Apr 28)

**MVP Feature Set:**

**Customer Features:**
- [x] Account registration (email + password)
- [x] Subscription purchase (annual plan, $29.99)
- [x] Stripe payment integration
- [x] Referral link attribution (from Scout)
- [x] Customer dashboard (subscription status, savings placeholder)
- [x] Offer browsing (static list, no geo filtering yet)
- [x] Basic offer redemption (manual code entry, no validation)

**Scout Features:**
- [x] Troop leader creates Scout (minimal PII)
- [x] Parental consent email workflow
- [x] Scout dashboard (fundraising total, direct sign-ups, referral link)
- [x] QR code + shareable link generation
- [x] Print poster (basic PDF template)

**Troop Leader Features:**
- [x] Troop roster management (add/edit/delete Scouts)
- [x] Troop dashboard (aggregated metrics)
- [x] Scout performance table (sortable)
- [x] CSV export (Scout performance)

**Council Admin Features:**
- [x] Manage troops (CRUD)
- [x] Manage merchants (CRUD, manual entry)
- [x] Manage offers (CRUD, manual entry)
- [x] Council dashboard (executive summary)

**Backend/Infrastructure:**
- [x] JWT authentication (stateless)
- [x] Multi-tenant RLS (PostgreSQL)
- [x] Subscription creation + Stripe webhook
- [x] Referral attribution algorithm (depth 0 only for MVP)
- [x] Flyway migrations (initial schema)
- [x] CloudWatch logging
- [x] Basic monitoring (uptime, error rate)

**NOT in MVP:**
- ❌ POS integration (claim links)
- ❌ Geo-based offer filtering
- ❌ Merchant self-service portal
- ❌ Customer referral links (viral loop)
- ❌ Push notifications
- ❌ Advanced analytics (cohort retention, LTV)

---

### 2.3 Phase 2: V1 Development (Weeks 17-28)

**Duration:** April 29 – July 14, 2026 (12 weeks)

**Milestones:**
- [ ] M2.1: POS claim link flow complete (May 12)
- [ ] M2.2: Geolocation + proximity filtering (May 26)
- [ ] M2.3: Merchant portal (self-service) (Jun 9)
- [ ] M2.4: Enhanced redemption flow (merchant validation) (Jun 23)
- [ ] M2.5: V1 integration testing + load testing (Jun 30)
- [ ] M2.6: Beta expansion (5 councils onboarded) (Jul 7)
- [ ] M2.7: V1 LAUNCH (Jul 14)

**V1 Feature Additions:**

**POS Integration:**
- [x] Troop leader generates claim link (select Scout, delivery method)
- [x] Customer claims entitlement (public endpoint, captcha)
- [x] Claim token expiry (7 days)
- [x] One-time use enforcement
- [x] Third-party POS webhook (create entitlement)
- [x] HMAC signature verification

**Geo & Proximity:**
- [x] Customer location opt-in (permissions)
- [x] Offer proximity filtering (radius search)
- [x] Geofence notifications (background location)
- [x] Nearest merchant map view

**Merchant Features:**
- [x] Merchant self-service portal (Next.js)
- [x] Merchant registration + council approval workflow
- [x] Merchant dashboard (redemptions, analytics)
- [x] Offer creation + editing (self-service)
- [x] Redemption validation (merchant confirms code)

**Enhanced Redemption:**
- [x] Generate temporary redemption code (10-min expiry)
- [x] Merchant scans/enters code
- [x] Real-time validation API
- [x] Fraud detection (duplicate redemptions within 24h)

**Infrastructure:**
- [x] Production AWS environment provisioned
- [x] Blue/green deployment (CodeDeploy)
- [x] Auto-scaling policies tuned (load testing results)
- [x] Kafka topic partitioning optimized
- [x] Redis cluster mode enabled

---

### 2.4 Phase 3: V2 Development (Weeks 29-44)

**Duration:** July 15 – November 2, 2026 (16 weeks)

**Milestones:**
- [ ] M3.1: Customer referral links (viral loop) (Aug 5)
- [ ] M3.2: Advanced analytics dashboards (Aug 26)
- [ ] M3.3: Push notifications + email campaigns (Sep 16)
- [ ] M3.4: Mobile app optimizations (offline mode, performance) (Oct 7)
- [ ] M3.5: National admin dashboard (Oct 21)
- [ ] M3.6: V2 integration testing + security audit (Oct 28)
- [ ] M3.7: V2 LAUNCH (general availability) (Nov 2)

**V2 Feature Additions:**

**Customer Referral Loop:**
- [x] Customer generates referral link (preserves root Scout)
- [x] Customer dashboard shows referral stats
- [x] Referral attribution depth tracking (up to 5 levels)
- [x] Customer referral rewards (optional: discount on renewal)

**Advanced Analytics:**
- [x] Scout performance trends (weekly/monthly charts)
- [x] Cohort retention curves
- [x] Subscriber lifetime value (LTV) calculations
- [x] Churn prediction model (basic ML)
- [x] Campaign ROI tracking

**Engagement Features:**
- [x] Push notifications (offer nearby, Scout milestone)
- [x] Email campaigns (renewal reminders, new offers)
- [x] In-app messaging (announcements, tips)
- [x] Gamification (Scout badges, leaderboard opt-in)

**Mobile Optimizations:**
- [x] Offline mode (cached offers, pending redemptions)
- [x] Performance improvements (lazy loading, image optimization)
- [x] Deep linking (universal links for referral URLs)
- [x] Biometric authentication (Face ID, Touch ID)

**National Admin:**
- [x] Cross-council dashboard (system health, benchmarking)
- [x] Council comparison table
- [x] System health monitoring (API uptime, error rate, DB connections)
- [x] Audit log viewer (filterable by council, user, action)

**Infrastructure:**
- [x] Production scaling (handle 25 councils, ~12,500 Scouts)
- [x] Read replicas for reporting queries
- [x] CloudWatch custom dashboards (business metrics)
- [x] AWS X-Ray distributed tracing
- [x] Automated backup verification

---

## 3. EPIC BREAKDOWN & USER STORIES

### 3.1 Epic 1: Authentication & User Management

**Target Phase:** MVP (Weeks 5-8)  
**Story Points:** 34

**User Stories:**

**US-1.1:** As a customer, I want to register with email/password so I can create an account  
**Acceptance Criteria:**
- Email validation (format + uniqueness check)
- Password strength requirements (12+ chars, complexity)
- Verify email flow (confirmation link sent)
- Account activated after email verification
**Story Points:** 5

**US-1.2:** As a customer, I want to log in with email/password so I can access my account  
**Acceptance Criteria:**
- JWT issued on successful login (15-min access, 7-day refresh)
- Failed login attempts tracked (lockout after 5 attempts)
- "Remember me" option (refresh token stored securely)
**Story Points:** 3

**US-1.3:** As a troop leader, I want to invite other leaders to join my troop so we can collaborate  
**Acceptance Criteria:**
- Send invitation email with unique token
- Recipient creates account via invitation link
- Automatically added to troop with TROOP_LEADER role
**Story Points:** 5

**US-1.4:** As a council admin, I want to manage user roles so I can control access  
**Acceptance Criteria:**
- View all users in my council (paginated table)
- Assign/revoke roles (COUNCIL_ADMIN, TROOP_LEADER)
- Disable/enable user accounts
**Story Points:** 5

**US-1.5:** As a backend service, I want to enforce multi-tenant isolation so councils cannot access each other's data  
**Acceptance Criteria:**
- RLS policies on all tenant tables
- JWT council_id propagated to database session
- Cross-tenant access attempts logged + blocked (403)
**Story Points:** 8

**US-1.6:** As a user, I want to reset my password if I forget it  
**Acceptance Criteria:**
- "Forgot password" link on login page
- Email with reset token (expires in 1 hour)
- Set new password via reset link
**Story Points:** 3

**US-1.7:** As a user, I want to update my profile (name, email, phone) so my info is current  
**Acceptance Criteria:**
- Profile edit form (validation on all fields)
- Email change requires re-verification
- Success confirmation message
**Story Points:** 5

---

### 3.2 Epic 2: Subscription Management

**Target Phase:** MVP (Weeks 9-12)  
**Story Points:** 55

**US-2.1:** As a customer, I want to browse subscription plans so I can choose the best option  
**Acceptance Criteria:**
- Display annual ($29.99) and monthly ($3.99) plans
- Show features comparison (same features, different billing)
- Highlight recommended plan (annual)
**Story Points:** 3

**US-2.2:** As a customer, I want to purchase a subscription with credit card so I can access offers  
**Acceptance Criteria:**
- Stripe Checkout integration
- Payment confirmation screen
- Subscription activated immediately
- Confirmation email sent
**Story Points:** 8

**US-2.3:** As a customer, I want to use a Scout's referral link so they get credit for my purchase  
**Acceptance Criteria:**
- Referral code embedded in link (query param or path)
- Referral code validated before purchase
- Attribution recorded in `referral_attributions` table
- Scout's dashboard updates with new sign-up
**Story Points:** 8

**US-2.4:** As a backend service, I want to handle Stripe webhooks so subscriptions update based on payment events  
**Acceptance Criteria:**
- `payment_intent.succeeded` → Activate subscription
- `invoice.payment_failed` → Suspend subscription
- `customer.subscription.deleted` → Cancel subscription
- Webhook signature verified (HMAC)
**Story Points:** 8

**US-2.5:** As a customer, I want to view my subscription status on my dashboard  
**Acceptance Criteria:**
- Display plan name, price, next billing date
- Show status badge (Active, Suspended, Canceled)
- Link to update payment method
**Story Points:** 5

**US-2.6:** As a customer, I want to update my payment method so my subscription doesn't lapse  
**Acceptance Criteria:**
- Stripe payment method update flow
- Update confirmed with toast notification
- Email confirmation sent
**Story Points:** 5

**US-2.7:** As a customer, I want to cancel my subscription if I no longer want it  
**Acceptance Criteria:**
- Cancellation confirmation modal (retention screen)
- Set `cancel_at_period_end = true` (remains active until renewal date)
- Confirmation email sent
**Story Points:** 5

**US-2.8:** As a customer, I want to reactivate a canceled subscription before it expires  
**Acceptance Criteria:**
- "Reactivate" button visible if canceled
- Remove cancellation flag
- Success message shown
**Story Points:** 3

**US-2.9:** As a backend service, I want to auto-renew subscriptions on billing date  
**Acceptance Criteria:**
- Stripe handles renewal automatically
- `invoice.paid` webhook → Extend subscription period
- `invoice.payment_failed` → Retry 3 times, then suspend
**Story Points:** 5

**US-2.10:** As a backend service, I want to send renewal reminder emails 7 days before billing  
**Acceptance Criteria:**
- Scheduled job queries subscriptions expiring in 7 days
- Send email via SES/SendGrid
- Track email sent (prevent duplicates)
**Story Points:** 5

---

### 3.3 Epic 3: Scout Fundraising & Referrals

**Target Phase:** MVP (Weeks 9-14)  
**Story Points:** 89

**US-3.1:** As a troop leader, I want to add Scouts to my roster so they can participate  
**Acceptance Criteria:**
- Form: First name, last initial, grade, parent email
- Generate unique referral code (8 chars, alphanumeric)
- Send parental consent email
- Scout status = PENDING until consent received
**Story Points:** 8

**US-3.2:** As a parent, I want to consent to my Scout's participation so they can fundraise  
**Acceptance Criteria:**
- Email with consent link (unique token)
- Consent page explains data collection
- Click "I Consent" → Scout status = ACTIVE
- Redirect to Scout dashboard (view-only for parent)
**Story Points:** 8

**US-3.3:** As a Scout (via parent), I want to view my fundraising dashboard so I see my progress  
**Acceptance Criteria:**
- Display total raised, direct sign-ups, indirect sign-ups
- Progress bar toward troop goal
- Recent activity feed (last 5 events)
- Leaderboard (top 5 in troop + my rank)
**Story Points:** 13

**US-3.4:** As a Scout, I want to generate a shareable referral link so I can promote it  
**Acceptance Criteria:**
- Display referral URL (short, memorable)
- Generate QR code (PNG image)
- "Copy Link" button (clipboard API)
- "Share" button (native share sheet on mobile)
**Story Points:** 8

**US-3.5:** As a Scout, I want to print marketing materials (posters, flyers) so I can distribute them  
**Acceptance Criteria:**
- "Print Posters" button on dashboard
- Generate PDF with Scout name + QR code + troop info
- Templates: 8.5x11 flyer, door hanger, business card
- Download PDF or open print dialog
**Story Points:** 13

**US-3.6:** As a backend service, I want to track referral link clicks so Scouts see engagement  
**Acceptance Criteria:**
- `POST /referrals/track-click` endpoint
- Record IP, user agent, timestamp
- Deduplicate clicks (same IP within 24h)
- Increment click count on Scout dashboard
**Story Points:** 5

**US-3.7:** As a backend service, I want to attribute subscriptions to Scouts so they get fundraising credit  
**Acceptance Criteria:**
- On subscription creation, lookup referral_code
- Create `referral_attributions` record (root_scout_id, depth = 0)
- Update Scout's `total_raised_cents`
- Publish `referral-events` Kafka message
**Story Points:** 8

**US-3.8:** As a troop leader, I want to view my troop's performance dashboard so I see overall progress  
**Acceptance Criteria:**
- Aggregate metrics: Total raised, total sign-ups, active Scouts
- Progress bar toward troop fundraising goal
- Scout performance table (sortable by name, sign-ups, revenue)
**Story Points:** 13

**US-3.9:** As a troop leader, I want to export Scout performance to CSV so I can analyze offline  
**Acceptance Criteria:**
- "Export CSV" button on troop dashboard
- CSV includes: Scout name, direct, indirect, total, revenue, conversion rate
- Filename: `troop-{id}-performance-{date}.csv`
**Story Points:** 5

**US-3.10:** As a Scout, I want to see my rank in the troop leaderboard so I stay motivated  
**Acceptance Criteria:**
- Leaderboard sorted by total sign-ups DESC
- Show top 5 + current Scout if outside top 5
- Highlight current Scout's row
- Display medal emojis for top 3 (🥇🥈🥉)
**Story Points:** 8

---

### 3.4 Epic 4: POS Integration (Claim Links)

**Target Phase:** V1 (Weeks 17-21)  
**Story Points:** 55

**US-4.1:** As a troop leader, I want to generate a claim link for a Scout after a POS sale  
**Acceptance Criteria:**
- Modal: Select Scout (dropdown), select plan, enter customer name (optional)
- Choose delivery: SMS, Email, or Print
- Generate unique claim token (CLM-XXXXXXXX, expires in 7 days)
- Send via selected method
**Story Points:** 13

**US-4.2:** As a customer, I want to claim my entitlement via the link I received  
**Acceptance Criteria:**
- Navigate to `/claim/{token}` (public endpoint)
- Display Scout name, plan details, expiry date
- Form: Enter email, password (if new user)
- Captcha verification (reCAPTCHA v3)
- One-time use: Token marked as claimed
**Story Points:** 13

**US-4.3:** As a backend service, I want to validate claim tokens securely  
**Acceptance Criteria:**
- Check token exists and status = PENDING
- Check expiry (< 7 days old)
- Check not already claimed
- Return 400 if invalid/expired/claimed
**Story Points:** 5

**US-4.4:** As a third-party POS system, I want to create entitlements via webhook so sales are automated  
**Acceptance Criteria:**
- `POST /pos/webhooks` endpoint
- Payload: transaction_id, scout_id, plan_id, customer_email
- Idempotency: Check transaction_id not already processed
- HMAC signature verification
- Create entitlement + send claim link
**Story Points:** 13

**US-4.5:** As a troop leader, I want to view pending claim links so I can follow up  
**Acceptance Criteria:**
- "Pending Claims" table on troop dashboard
- Columns: Code, Scout, Customer, Sent Date, Status
- Status badges: Pending, Claimed, Expired
- Action: Resend email/SMS
**Story Points:** 8

**US-4.6:** As a backend service, I want to expire unclaimed tokens after 7 days  
**Acceptance Criteria:**
- Scheduled job (daily at 2 AM)
- Query entitlements with status = PENDING and expires_at < now
- Update status = EXPIRED
- Send notification to troop leader (optional)
**Story Points:** 3

---

### 3.5 Epic 5: Offers & Redemptions

**Target Phase:** MVP (basic), V1 (enhanced)  
**Story Points:** 89

**US-5.1:** As a council admin, I want to add merchants to my council so they can provide offers  
**Acceptance Criteria:**
- Form: Business name, contact, address, category
- Add multiple locations (with lat/lng)
- Upload logo (S3)
- Status: Pending approval (council admin review)
**Story Points:** 8

**US-5.2:** As a council admin, I want to create offers for merchants  
**Acceptance Criteria:**
- Form: Title, description, discount type (%, $), value, category
- Select merchant + location(s)
- Set valid date range
- Upload offer image (optional)
**Story Points:** 8

**US-5.3:** As a customer, I want to browse available offers so I can find deals  
**Acceptance Criteria:**
- List view with offer cards (merchant logo, title, discount)
- Filter by category (Dining, Auto, Shopping, etc.)
- Sort by: Nearest, Highest Value, Newest
**Story Points:** 8

**US-5.4:** As a customer, I want to filter offers by proximity so I see nearby deals (V1)  
**Acceptance Criteria:**
- Request location permission (one-time)
- Display distance on offer cards (e.g., "0.8 mi away")
- Default sort: Nearest first
- Map view showing merchant pins
**Story Points:** 13

**US-5.5:** As a customer, I want to redeem an offer by showing it to the merchant  
**Acceptance Criteria:**
- Tap "Use Offer" → Generate temporary code (10-min expiry)
- Full-screen code display (large font, QR code)
- Merchant validates code (see US-5.7)
**Story Points:** 8

**US-5.6:** As a customer, I want to receive notifications when near an offer (V1)  
**Acceptance Criteria:**
- Background location tracking (opt-in)
- Geofence radius defined per merchant location
- Push notification: "You're near [Merchant]! [Offer Title]"
- Tap notification → Opens offer detail
**Story Points:** 13

**US-5.7:** As a merchant, I want to validate redemption codes so I prevent fraud  
**Acceptance Criteria:**
- Merchant portal: Enter/scan code
- API validates: Code exists, not expired, not already used, belongs to active subscription
- Display customer name, offer details
- "Confirm Redemption" button → Marks code as used
**Story Points:** 13

**US-5.8:** As a backend service, I want to prevent duplicate redemptions within 24 hours  
**Acceptance Criteria:**
- Check if customer redeemed same offer at same location < 24h ago
- Return 409 Conflict if duplicate
- Log fraud attempt
**Story Points:** 5

**US-5.9:** As a customer, I want to see my redemption history so I track my savings  
**Acceptance Criteria:**
- Dashboard: "Your Savings" card (total estimated value saved)
- "View History" → List of redemptions (date, merchant, offer, value)
- Filter by date range
**Story Points:** 8

**US-5.10:** As a merchant, I want to view my redemption analytics so I see ROI  
**Acceptance Criteria:**
- Dashboard: Total redemptions, unique customers, avg customer value
- Chart: Redemptions over time (daily/weekly)
- Top offers table (by redemption count)
**Story Points:** 5

---

### 3.6 Epic 6: Dashboards & Reporting

**Target Phase:** MVP (basic), V2 (advanced)  
**Story Points:** 144

**US-6.1:** As a Scout, I want to see my fundraising metrics on my dashboard (covered in Epic 3)  
**Story Points:** 0 (already counted)

**US-6.2:** As a troop leader, I want to see my troop's performance dashboard (covered in Epic 3)  
**Story Points:** 0 (already counted)

**US-6.3:** As a council admin, I want to see an executive summary dashboard  
**Acceptance Criteria:**
- KPI cards: Active customers, total revenue, active troops, active merchants, active offers
- Revenue trend chart (last 30 days)
- Top troops table (by revenue, top 10)
- Top merchants table (by redemptions, top 10)
- Offer performance (category distribution pie chart)
**Story Points:** 21

**US-6.4:** As a council admin, I want to view subscriber analytics (V2)  
**Acceptance Criteria:**
- Cohort retention curve (monthly cohorts, 12-month retention)
- Subscription plan distribution (pie chart: annual vs. monthly)
- Churn rate trend (last 12 months)
- Avg lifetime value (LTV) by cohort
**Story Points:** 21

**US-6.5:** As a council admin, I want to view geo analytics (V2)  
**Acceptance Criteria:**
- Customer density heatmap (by ZIP code)
- Merchant density map
- Offer redemptions by location
- Distance traveled per redemption (avg)
**Story Points:** 21

**US-6.6:** As a national admin, I want to view cross-council performance (V2)  
**Acceptance Criteria:**
- Council comparison table (sortable by revenue, customers, troops)
- Benchmark metrics (avg revenue per Scout, conversion rate, churn)
- Growth trends (new councils, new customers by month)
**Story Points:** 21

**US-6.7:** As a national admin, I want to view system health metrics (V2)  
**Acceptance Criteria:**
- API uptime, error rate, avg latency
- Database metrics (connections, CPU, storage)
- Kafka consumer lag
- CloudWatch alarm status (all green/red indicators)
**Story Points:** 13

**US-6.8:** As any user, I want to export dashboard data to CSV/PDF  
**Acceptance Criteria:**
- "Export" button on all dashboards
- Format options: CSV (data), PDF (report with charts)
- Downloaded file named with timestamp
**Story Points:** 13

**US-6.9:** As a council admin, I want to schedule automated reports (V2)  
**Acceptance Criteria:**
- Settings: Choose report type, frequency (weekly/monthly), recipients
- Email report as PDF attachment
- Unsubscribe link in email
**Story Points:** 13

**US-6.10:** As a troop leader, I want to print Scout performance posters for display  
**Acceptance Criteria:**
- "Print All Posters" button
- Generate PDF with 1 page per Scout (name, photo placeholder, stats)
- Formatted for 8.5x11 printing
**Story Points:** 8

**US-6.11:** As a backend service, I want to pre-aggregate analytics data for performance  
**Acceptance Criteria:**
- Scheduled job (hourly) populates `analytics.scout_performance_daily`
- Materialized views for council/troop aggregations
- Dashboard queries hit pre-aggregated tables (< 500ms response)
**Story Points:** 13

---

### 3.7 Epic 7: Admin & Configuration

**Target Phase:** MVP  
**Story Points:** 55

**US-7.1:** As a council admin, I want to configure my council settings  
**Acceptance Criteria:**
- Edit council name, logo, contact email
- Set fundraising goal (per troop or council-wide)
- Configure subscription plan pricing (if custom pricing allowed)
**Story Points:** 8

**US-7.2:** As a system admin, I want to manage councils (create, edit, disable)  
**Acceptance Criteria:**
- National admin dashboard: Council list
- Create council: Name, region, primary contact
- Disable council: Sets status = INACTIVE, users cannot log in
**Story Points:** 8

**US-7.3:** As a council admin, I want to approve merchant registrations  
**Acceptance Criteria:**
- Merchant list with filter: Pending Approval
- View merchant details (business info, contact, locations)
- "Approve" or "Reject" buttons
- Email sent to merchant on approval/rejection
**Story Points:** 8

**US-7.4:** As a system admin, I want to manage subscription plans globally  
**Acceptance Criteria:**
- Plan list (Annual, Monthly)
- Edit price, features, billing interval
- Set plan as active/inactive
**Story Points:** 5

**US-7.5:** As a council admin, I want to manage campaigns  
**Acceptance Criteria:**
- Create campaign: Name, start date, end date, goal
- Associate troops with campaign
- Campaign dashboard shows progress
**Story Points:** 8

**US-7.6:** As a system admin, I want to view audit logs for compliance  
**Acceptance Criteria:**
- Searchable audit log table (user, action, resource, timestamp)
- Filters: Date range, user, action type, council
- Export to CSV
**Story Points:** 8

**US-7.7:** As a system admin, I want to manage feature flags so I can toggle features  
**Acceptance Criteria:**
- Feature flag list (e.g., "geo_offers", "customer_referrals")
- Toggle on/off globally or per council
- Changes take effect within 1 minute (Redis cache)
**Story Points:** 5

**US-7.8:** As a council admin, I want to customize email templates  
**Acceptance Criteria:**
- Template editor for: Welcome email, receipt, renewal reminder
- Variables: {{customer_name}}, {{subscription_plan}}, etc.
- Preview before saving
**Story Points:** 5

---

## 4. TESTING STRATEGY

### 4.1 Unit Testing

**Coverage Target:** 80% code coverage

**Backend (Java/Spring Boot):**
- **Framework:** JUnit 5, Mockito
- **Scope:** Service layer, utility functions, validation logic
- **Example:**
  ```java
  @Test
  void testReferralAttribution_DepthZero() {
      Scout scout = createScout();
      Subscription sub = createSubscription(scout.getReferralCode());
      
      ReferralAttribution attr = referralService.createAttribution(sub);
      
      assertEquals(scout.getId(), attr.getRootScoutId());
      assertEquals(0, attr.getAttributionDepth());
  }
  ```

**Frontend (React Native / Next.js):**
- **Framework:** Jest, React Testing Library
- **Scope:** Component logic, utility functions, state management (Zustand)
- **Example:**
  ```javascript
  test('Button renders with correct variant styles', () => {
      const { getByText } = render(<Button title="Click Me" variant="primary" />);
      const button = getByText('Click Me');
      
      expect(button).toHaveStyle({ backgroundColor: theme.colors.red500 });
  });
  ```

**Continuous Integration:**
- Run on every commit (GitHub Actions)
- Block merge if tests fail or coverage < 80%

---

### 4.2 Integration Testing

**Scope:** API endpoints, database interactions, external service integrations

**Backend API Tests:**
- **Framework:** Spring Boot Test, RestAssured, Testcontainers (PostgreSQL)
- **Scope:** All REST endpoints, Kafka producers/consumers
- **Example:**
  ```java
  @SpringBootTest
  @AutoConfigureMockMvc
  @Testcontainers
  class SubscriptionControllerIntegrationTest {
      
      @Container
      static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16");
      
      @Autowired
      private MockMvc mockMvc;
      
      @Test
      void testCreateSubscription_WithValidReferral() throws Exception {
          String jwt = getTestJwt();
          
          mockMvc.perform(post("/subscriptions")
              .header("Authorization", "Bearer " + jwt)
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                      "plan_id": 1,
                      "referral_code": "SCOUT123"
                  }
                  """))
              .andExpect(status().isOk())
              .andExpect(jsonPath("$.status").value("ACTIVE"));
      }
  }
  ```

**Database Integration:**
- Test Flyway migrations (up/down)
- Test RLS policies (attempt cross-tenant access)
- Test triggers (audit log insertion)

**External Services (Mocked in Tests):**
- Stripe API (use Stripe test mode)
- AWS SES (mock email sending)
- reCAPTCHA (mock verification)

---

### 4.3 End-to-End (E2E) Testing

**Scope:** Critical user flows (full stack, including UI)

**Mobile (React Native):**
- **Framework:** Detox (iOS + Android)
- **Flows:**
  1. Customer registration → Subscription purchase → Offer redemption
  2. Troop leader adds Scout → Scout dashboard loads
  3. POS claim link generation → Customer claims → Subscription activated

**Web (Next.js):**
- **Framework:** Playwright or Cypress
- **Flows:**
  1. Council admin creates merchant → Creates offer → Offer visible to customers
  2. Troop leader generates claim link → Sends via email → Customer claims
  3. Merchant validates redemption code → Code marked as used

**Example (Detox):**
```javascript
describe('Customer Subscription Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete subscription purchase', async () => {
    // Register
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('register-button')).tap();
    
    // Select plan
    await element(by.id('annual-plan')).tap();
    
    // Enter payment (Stripe test card)
    await element(by.id('card-number')).typeText('4242424242424242');
    await element(by.id('submit-payment')).tap();
    
    // Verify success
    await expect(element(by.id('subscription-active'))).toBeVisible();
  });
});
```

---

### 4.4 Load & Performance Testing

**Tools:** JMeter, k6, Artillery

**Scenarios:**

**1. Baseline Load (MVP):**
- **Target:** 1 council, 500 Scouts, ~2,000 customers
- **Traffic:**
  - 50 req/sec (avg), 200 req/sec (peak)
  - 10,000 daily active users
- **Metrics:**
  - p50 latency < 200ms
  - p95 latency < 500ms
  - Error rate < 0.1%

**2. V1 Load (5 councils):**
- **Target:** 5 councils, 2,500 Scouts, ~10,000 customers
- **Traffic:**
  - 250 req/sec (avg), 1,000 req/sec (peak)
  - 50,000 daily active users
- **Metrics:** Same as baseline

**3. V2 Load (25 councils):**
- **Target:** 25 councils, 12,500 Scouts, ~50,000 customers
- **Traffic:**
  - 1,000 req/sec (avg), 5,000 req/sec (peak)
  - 250,000 daily active users
- **Metrics:** Same as baseline

**Load Test Script (k6):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 VUs
    { duration: '5m', target: 100 },  // Stay at 100 VUs
    { duration: '2m', target: 500 },  // Ramp up to 500 VUs (peak)
    { duration: '5m', target: 500 },  // Stay at 500 VUs
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  let response = http.get('https://api.campcard.org/offers');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

### 4.5 Security Testing

**Automated Scans:**
- **OWASP ZAP:** Weekly automated scans (XSS, SQL injection, etc.)
- **Dependency Check:** Daily scans for vulnerable libraries
- **SonarQube:** Static code analysis (security hotspots)

**Manual Testing:**
- **Pre-MVP:** Internal security review by team
- **Pre-V1:** External penetration test by certified firm
- **Pre-V2:** Follow-up penetration test

**Test Cases (Security):**
- SQL injection on all input fields
- XSS in offer descriptions, Scout names
- CSRF token validation on state-changing operations
- Multi-tenant isolation (attempt cross-council access)
- JWT tampering (modify claims, expired tokens)
- Rate limiting (brute force login attempts)
- POS claim token replay attacks

---

### 4.6 Accessibility Testing

**Automated Tools:**
- **axe DevTools:** Browser extension for WCAG violations
- **Lighthouse:** Automated accessibility audits (CI integration)
- **Pa11y:** Command-line tool for CI pipeline

**Manual Testing:**
- Screen reader testing (VoiceOver on iOS, TalkBack on Android)
- Keyboard navigation (web admin portals)
- Color contrast verification (WebAIM contrast checker)
- Font scaling (test at 200% zoom)

**Test Cases:**
- All buttons/links keyboard accessible
- Form inputs have associated labels
- Images have alt text
- Color contrast ≥ 4.5:1 for text
- Focus indicators visible

---

## 5. ROLLOUT STRATEGY

### 5.1 Pilot Phase (MVP)

**Timeline:** April 28 – June 30, 2026 (9 weeks)

**Target:**
- 1 pilot council (Central Florida Council)
- 50 troops
- ~500 Scouts
- Target: 2,000 customers (4:1 customer-to-Scout ratio)

**Onboarding:**
1. **Week 1:** Kickoff meeting with council leadership
2. **Week 2:** Troop leader training (webinar + documentation)
3. **Week 3:** Scout registration (troop leaders add Scouts, parental consent)
4. **Week 4:** Launch campaign (email, social media, troop meetings)
5. **Weeks 5-9:** Monitor metrics, gather feedback, fix bugs

**Success Criteria:**
- [ ] 80% of troops onboarded (40/50)
- [ ] 60% of Scouts activated (300/500 with parental consent)
- [ ] 15% conversion rate (2,000 customers from 13,000 link clicks)
- [ ] < 5% churn in first 60 days
- [ ] p95 API latency < 500ms
- [ ] 0 critical security incidents
- [ ] Customer satisfaction score ≥ 4/5 (survey)

**Feedback Mechanisms:**
- Weekly stakeholder calls (council admin, 2-3 troop leaders)
- In-app feedback widget (NPS + free-form comments)
- Intercom chat support (live chat during business hours)
- Google Forms survey (sent to all customers after 30 days)

**Go/No-Go Decision (Week 9):**
- **Go:** Proceed to beta expansion (V1) if ≥4 success criteria met
- **No-Go:** Iterate on MVP, delay V1 launch by 4 weeks

---

### 5.2 Beta Expansion (V1)

**Timeline:** July 14 – September 30, 2026 (11 weeks)

**Target:**
- 5 beta councils (add 4 more to pilot council)
- ~250 troops total
- ~2,500 Scouts
- Target: 10,000 customers

**Council Selection Criteria:**
- Geographic diversity (East, West, Midwest, South)
- Council size variety (small: 20 troops, medium: 50 troops, large: 80 troops)
- Tech-savvy leadership (willing to provide detailed feedback)

**Onboarding Process:**
1. **Council Setup (Week 1):** Create council tenant, assign admin, configure settings
2. **Admin Training (Week 2):** Virtual training for council admins (merchant onboarding, offer creation)
3. **Merchant Onboarding (Weeks 3-4):** Council admins recruit 10-20 local merchants
4. **Troop Leader Training (Week 5):** Same as pilot phase
5. **Scout Registration (Week 6):** Troop leaders add Scouts
6. **Campaign Launch (Week 7):** Go-live with customer acquisition push
7. **Monitoring & Support (Weeks 8-11):** Daily monitoring, bi-weekly check-ins

**Success Criteria:**
- [ ] All 5 councils onboarded (5/5)
- [ ] 70% troop onboarding rate (175/250)
- [ ] 10,000 customers acquired (target met)
- [ ] 50+ merchants onboarded (avg 10 per council)
- [ ] 150+ active offers
- [ ] < 3% API error rate
- [ ] < 8% churn rate (first 60 days)
- [ ] p95 API latency < 500ms (at 5x pilot traffic)

**Go/No-Go Decision (Week 11):**
- **Go:** Proceed to V2 development + national rollout if ≥6 criteria met
- **No-Go:** Pause expansion, address infrastructure/product issues

---

### 5.3 General Availability (V2)

**Timeline:** November 2, 2026 – March 31, 2027 (21 weeks)

**Target:**
- 25 councils (add 20 more to beta councils)
- ~1,250 troops
- ~12,500 Scouts
- Target: 50,000 customers

**Rollout Approach:**
- **Cohorts:** Onboard 5 councils every 3 weeks (4 cohorts total)
- **Self-Service:** Council admins can self-register (approval required)
- **Automated Onboarding:** Guided setup wizard, video tutorials, knowledge base

**Marketing:**
- National BSA announcement (press release, blog post)
- Council outreach (email campaign to all BSA councils)
- Webinars (bi-weekly, open to all councils)
- Case studies (pilot + beta success stories)

**Support Scaling:**
- **Tier 1:** Help center (self-service articles, FAQs)
- **Tier 2:** Email support (support@campcard.org, 24h SLA)
- **Tier 3:** Live chat (business hours, Intercom)
- **Tier 4:** Dedicated account managers (for councils with >100 troops)

**Success Criteria:**
- [ ] 25 councils onboarded (100% of target)
- [ ] 50,000 customers acquired
- [ ] $1.5M annual recurring revenue (ARR)
- [ ] < 6% monthly churn rate
- [ ] 4.5/5 customer satisfaction score
- [ ] 99.5% API uptime
- [ ] p95 API latency < 500ms (at scale)

---

## 6. RISK MANAGEMENT

### 6.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Database performance degrades at scale** | Medium | High | Load testing before V1/V2, add read replicas, optimize queries |
| **Third-party API downtime (Stripe)** | Low | High | Implement retry logic, queue failed payments, status page monitoring |
| **Multi-tenant isolation breach** | Low | Critical | Penetration testing, RLS audits, automated tests for cross-tenant access |
| **Mobile app rejection (App Store/Play Store)** | Medium | Medium | Early submission to review, follow guidelines strictly, appeal process ready |
| **Data loss (accidental deletion)** | Low | Critical | Automated backups (daily), point-in-time recovery enabled, soft deletes |

**Mitigation Actions:**
- [ ] Load testing completed 2 weeks before each launch
- [ ] Penetration testing completed 4 weeks before V1 launch
- [ ] Backup restoration tested monthly
- [ ] Stripe webhook failure alerts configured

---

### 6.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Low conversion rate (< 10%)** | Medium | High | A/B testing on landing pages, referral incentives, simplified checkout |
| **High churn rate (> 10%/month)** | Medium | High | Engagement campaigns (email, push), offer quality monitoring, exit surveys |
| **Merchants don't join (< 5 per council)** | Medium | Medium | Council admin incentives, merchant marketing materials, onboarding support |
| **Scouts don't engage (< 50% activation)** | Low | Medium | Gamification, parent communication, troop leader training on motivation |
| **Referral fraud (click farms, fake sign-ups)** | Low | Medium | Rate limiting, CAPTCHA, IP tracking, anomaly detection |

**Mitigation Actions:**
- [ ] Weekly conversion rate monitoring (alert if < 10%)
- [ ] Monthly churn analysis (cohort retention curves)
- [ ] Merchant recruitment playbook created
- [ ] Anti-fraud rules implemented (IP deduplication, depth limits)

---

### 6.3 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Key team member departure** | Medium | Medium | Knowledge sharing (documentation, pair programming), cross-training |
| **AWS outage (regional failure)** | Low | High | Multi-AZ deployment, disaster recovery plan, failover procedures |
| **Budget overrun (infrastructure costs)** | Medium | Medium | Monthly cost monitoring, cost alerts (CloudWatch), rightsizing instances |
| **Support overwhelmed (too many tickets)** | Medium | Medium | Knowledge base, chatbot, tiered support, hiring plan |
| **Delayed feature delivery** | High | Medium | Agile sprints (2-week), weekly sprint reviews, feature prioritization |

**Mitigation Actions:**
- [ ] Documentation wiki maintained (architecture, runbooks, APIs)
- [ ] Monthly AWS cost review meetings
- [ ] Support SLA dashboard (track response times)
- [ ] Sprint retrospectives every 2 weeks

---

## 7. SUCCESS METRICS & KPIs

### 7.1 MVP Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Troop Onboarding Rate** | 80% (40/50 troops) | Count of troops with ≥1 active Scout |
| **Scout Activation Rate** | 60% (300/500 Scouts) | Count of Scouts with status = ACTIVE (parental consent) |
| **Customer Conversion Rate** | 15% (2,000 customers from 13,000 clicks) | (Subscriptions / Referral Clicks) * 100 |
| **Churn Rate (60-day)** | < 5% | (Canceled Subs / Total Subs) * 100 |
| **API Uptime** | 99.5% | CloudWatch metrics |
| **p95 API Latency** | < 500ms | CloudWatch metrics |
| **Customer Satisfaction** | ≥ 4.0/5.0 | NPS survey (30-day post-signup) |

---

### 7.2 V1 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Councils Onboarded** | 5/5 (100%) | Count of active councils |
| **Customers Acquired** | 10,000 | Count of subscriptions with status = ACTIVE |
| **Merchants Onboarded** | 50+ | Count of merchants with status = APPROVED |
| **Active Offers** | 150+ | Count of offers with valid_until >= today |
| **Redemptions** | 5,000+ | Count of redemptions (avg 0.5 per customer) |
| **API Error Rate** | < 3% | (Error responses / Total requests) * 100 |
| **Churn Rate (60-day)** | < 8% | (Canceled Subs / Total Subs) * 100 |

---

### 7.3 V2 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Councils Onboarded** | 25 | Count of active councils |
| **Customers Acquired** | 50,000 | Count of active subscriptions |
| **Annual Recurring Revenue** | $1.5M | Sum of annual subscription values |
| **Monthly Churn Rate** | < 6% | (Churned / Total) * 100 |
| **Customer Lifetime Value (LTV)** | $90+ | (Avg subscription value * avg lifespan) |
| **API Uptime** | 99.9% | CloudWatch metrics (99.9% = 43 min downtime/month) |
| **Customer Satisfaction** | 4.5/5.0 | NPS survey |
| **Scout Fundraising (Avg)** | $75/Scout | Total revenue / Total Scouts |

---

## 8. POST-LAUNCH ACTIVITIES

### 8.1 Continuous Improvement

**Weekly:**
- Review product analytics (Google Analytics, Mixpanel)
- Monitor key metrics dashboard (conversions, churn, errors)
- Triage new bugs (prioritize P0/P1)

**Monthly:**
- Sprint retrospectives (what went well, what to improve)
- Customer feedback review (NPS responses, support tickets)
- Feature prioritization (update roadmap based on feedback)

**Quarterly:**
- Roadmap review with stakeholders
- Infrastructure cost optimization
- Security audit (external penetration test annually, internal quarterly)

---

### 8.2 Feature Roadmap (Post-V2)

**Q1 2027:**
- **Mobile wallet integration** (Apple Pay, Google Pay for subscriptions)
- **Offline mode** (cache offers, queue redemptions)
- **Advanced gamification** (Scout badges, achievements, streaks)

**Q2 2027:**
- **AI-powered offer recommendations** (personalized based on redemption history)
- **Merchant analytics dashboard** (customer demographics, ROI tracking)
- **White-label option** (councils can customize branding)

**Q3 2027:**
- **International expansion** (Canadian councils)
- **Multi-language support** (Spanish, French)
- **Corporate partnership program** (national merchants join all councils)

---

## 9. DOCUMENTATION DELIVERABLES

### 9.1 Technical Documentation

- [ ] **API Documentation** (OpenAPI/Swagger)
- [ ] **Architecture Decision Records (ADRs)** (key design decisions)
- [ ] **Database Schema Docs** (ERD diagrams, table descriptions)
- [ ] **Deployment Runbooks** (step-by-step deployment, rollback)
- [ ] **Incident Response Playbooks** (P0/P1/P2 procedures)
- [ ] **Developer Onboarding Guide** (local setup, coding standards)

### 9.2 User Documentation

- [ ] **Help Center** (Zendesk or similar, 50+ articles)
- [ ] **Video Tutorials** (YouTube playlist, 10+ videos)
- [ ] **Troop Leader Guide** (PDF, Scout setup, POS sales)
- [ ] **Council Admin Guide** (PDF, merchant onboarding, offer creation)
- [ ] **Customer FAQ** (website, top 20 questions)

### 9.3 Training Materials

- [ ] **Troop Leader Webinar Deck** (Google Slides, 30-min presentation)
- [ ] **Council Admin Webinar Deck** (45-min presentation)
- [ ] **Scout Parent Guide** (PDF, how to support your Scout)
- [ ] **Merchant Onboarding Guide** (PDF, benefits, setup steps)

---

## 10. BUDGET & RESOURCE ALLOCATION

### 10.1 Development Budget (44 weeks)

| Category | Cost | Notes |
|----------|------|-------|
| **Personnel (7 FTE)** | $770,000 | Avg $110k/year per FTE (salaries + benefits) |
| **Contractors (3 PT)** | $120,000 | Security engineer, tech writer, BSA liaison |
| **AWS Infrastructure** | $75,000 | Dev + staging + prod (avg $1,700/month over 44 weeks) |
| **Third-Party Services** | $20,000 | Stripe fees (~2.9%), SendGrid, Intercom, etc. |
| **Tools & Licenses** | $15,000 | Figma, GitHub, JetBrains, monitoring tools |
| **Penetration Testing** | $25,000 | 2 external tests (pre-V1, pre-V2) |
| **Contingency (10%)** | $102,500 | Buffer for overruns |
| **TOTAL** | **$1,127,500** | ~$1.13M for 11-month development |

### 10.2 Ongoing Operational Budget (Annual)

| Category | Annual Cost | Notes |
|----------|------------|-------|
| **AWS Infrastructure** | $56,500 | $4,700/month at scale (25 councils) |
| **Personnel (5 FTE)** | $550,000 | Post-launch: 2 engineers, 1 PM, 1 support, 1 DevOps |
| **Third-Party Services** | $40,000 | Stripe, email, monitoring, support tools |
| **Customer Support** | $30,000 | Intercom, Zendesk licenses |
| **Marketing** | $50,000 | Council outreach, webinars, case studies |
| **TOTAL** | **$726,500** | Ongoing annual operational cost |

---

## 11. SUMMARY & GO-LIVE CHECKLIST

### 11.1 Pre-Launch Checklist (MVP)

**Infrastructure:**
- [ ] Production AWS environment provisioned (VPC, RDS, Redis, Kafka, EC2)
- [ ] TLS certificates issued (ACM)
- [ ] DNS configured (Route 53: api.campcard.org, app.campcard.org, admin.campcard.org)
- [ ] Secrets rotated (database, Redis, JWT signing key)
- [ ] Backups enabled (RDS automated backups, 7-day retention)
- [ ] Monitoring configured (CloudWatch alarms, PagerDuty integration)

**Application:**
- [ ] All MVP user stories completed + tested
- [ ] Unit test coverage ≥ 80%
- [ ] Integration tests passing
- [ ] E2E tests passing (critical flows)
- [ ] Security scan (OWASP ZAP) no High/Critical issues
- [ ] Accessibility audit (WCAG AA compliant)
- [ ] Load testing completed (baseline load successful)

**Data:**
- [ ] Production database initialized (Flyway migrations applied)
- [ ] Seed data loaded (subscription plans, pilot council)
- [ ] RLS policies verified (cross-tenant access blocked)

**Mobile:**
- [ ] iOS app submitted to App Store (approved)
- [ ] Android app submitted to Play Store (approved)
- [ ] Deep linking configured (universal links)
- [ ] Push notification certificates uploaded

**Documentation:**
- [ ] Help center articles published (50+ articles)
- [ ] API documentation published (Swagger UI)
- [ ] Troop leader guide PDF finalized
- [ ] Video tutorials uploaded (YouTube)

**Training:**
- [ ] Council admin trained (1:1 session completed)
- [ ] Troop leader webinar scheduled (week before launch)
- [ ] Support team trained (internal runbooks reviewed)

**Legal/Compliance:**
- [ ] Privacy policy published (COPPA, GDPR, CCPA compliant)
- [ ] Terms of service published
- [ ] Parental consent email template legal-reviewed
- [ ] PCI DSS SAQ A completed (Stripe integration)

**Communications:**
- [ ] Launch announcement email drafted (send to pilot council)
- [ ] Social media posts scheduled (Twitter, Facebook)
- [ ] Press release drafted (optional)

---

### 11.2 Launch Day Runbook

**T-24 hours:**
- [ ] Final smoke tests (production environment)
- [ ] Verify all alarms configured correctly
- [ ] On-call rotation confirmed (24/7 coverage for first 7 days)

**T-4 hours:**
- [ ] Deploy final release to production (blue/green)
- [ ] Verify deployment successful (health checks green)
- [ ] Test critical flows manually (registration, subscription, offer redemption)

**T-0 (Launch Time):**
- [ ] Send launch announcement email
- [ ] Publish social media posts
- [ ] Enable app in App Store/Play Store (make public)
- [ ] Monitor dashboards (real-time metrics)

**T+1 hour:**
- [ ] Check error logs (any critical errors?)
- [ ] Monitor API latency (within SLA?)
- [ ] Check first customer sign-ups (attribution working?)

**T+24 hours:**
- [ ] Review metrics (sign-ups, conversions, errors)
- [ ] Gather initial feedback (chat logs, emails)
- [ ] Triage any bugs (prioritize P0/P1)

**T+7 days:**
- [ ] Publish post-launch report (metrics, feedback, next steps)
- [ ] Go/No-Go decision for beta expansion

---

**END OF PART 9**

**Next:** Part 10 — MCP Admin Server & Open Questions
