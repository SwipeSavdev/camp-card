# Camp Card MVP - Complete Requirements Validation & Development Plan

**Status:** VARIANT B (Non-Payment Digital Card) - REQUIREMENTS EXTRACTION COMPLETE
**Date:** December 26, 2025
**Focus:** Mobile App Development (React Native + Expo)

---

## EXECUTIVE SUMMARY

### Program Overview
- **Mission:** "Pay a little. Get deals. Help Scouts."
- **Model:** Digital subscription platform (non-payment variant)
- **Users:** Customers, Scouts (ages 5-14), Troop Leaders, Council Admins
- **MVP Timeline:** 12 weeks (Feb 3 - Apr 28, 2026)
- **Tech Stack:** React Native, Expo, TypeScript, Zustand, React Query

### Variant B (Non-Payment) Focus
 Digital discount card only (no payment processing)
 Scout referral attribution system
 Offer browsing and redemption
 Multi-tenant (per-council) deployment
 Mobile-first design

---

## MOBILE APP SCREENS & NAVIGATION

### Navigation Structure by Role

#### 1. CUSTOMER (End Users)
```
Bottom Tabs:
  Home
 Offers
  Settings

Home Screen:
 Welcome message + council info
 Quick action buttons
 Featured offers carousel
 Recent activity

Offers Screen:
 Offer list (paginated)
 Filters: Category, Distance, New
 Search functionality
 Offer details modal

Settings Screen:
 Profile management
 Subscription status
 Notification preferences
 Council/Tenant selection
 Logout
```

#### 2. SCOUT (Ages 5-14, Parent Supervised)
```
Bottom Tabs:
  Home (Dashboard)
  Leaderboard
  Settings

Scout Home:
 Fundraising metrics
  Total cards sold
  Funds raised
  Progress to goal
 Referral link section
  QR code (scannable)
  Short link (copyable)
  Shareable link
 Actions
  Share link (SMS, Email, Social)
  Print poster
 Recent sign-ups

Leaderboard Screen:
 Troop rankings
 Personal rank/position
 Top performers
 Goals & achievements

Settings Screen:
 Profile (minimal - name only)
 Parental controls
 Logout
```

#### 3. TROOP LEADER (Scout Adults)
```
Bottom Tabs:
  Home (Dashboard)
  Scouts
  Settings

Leader Home:
 Troop metrics
  Total cards sold
  Funds raised
  Progress to goal
  Success rate
 Top performers
  Scout names
  Cards sold
  Funds raised
 Quick actions

Scouts Screen:
 Scout roster (sortable)
 Per-scout metrics
  Cards sold
  Funds raised
  Sign-ups
 Create new scout
 Send scout invitation
 Scout management

Settings Screen:
 Troop info
 Troop admin (add/remove leaders)
 Payment info (if applicable)
 Logout
```

#### 4. COUNCIL ADMIN
```
Web Portal Only (Not Mobile MVP)
- Merchant management
- Offer creation
- Reporting dashboards
- Campaign management
```

---

## MVP FEATURE CHECKLIST

### Phase 1: Core Functionality (Weeks 5-16)

#### Customer Features
- [x] Email + password registration
- [x] Login/logout
- [x] Subscription purchase ($29.99 annual, via Stripe)
- [x] Offer browsing (paginated list)
- [x] Offer details (description, merchant, terms)
- [x] Manual offer redemption (code entry)
- [x] Subscription status dashboard
- [x] Savings tracker (placeholder)
- [x] Settings (profile, notifications, council switch)
- [x] Multi-tenant support (per-council login)

#### Scout Features
- [x] Scout creation by Troop Leader
- [x] Minimal PII collection (first name, last name only)
- [x] Parental consent email workflow
- [x] Scout dashboard (metrics: cards sold, funds raised)
- [x] Unique referral link generation
- [x] QR code generation (scannable)
- [x] Share link functionality (SMS, Email, Social)
- [x] Print poster (PDF template)
- [x] Troop leaderboard (rankings, first name only)
- [x] Parent-supervised login only

#### Troop Leader Features
- [x] Create/manage scouts in troop
- [x] View scout roster with metrics
- [x] Troop dashboard (total metrics)
- [x] Send parental consent emails
- [x] Track performance metrics
- [x] Admin management (add/remove leaders)
- [x] Troop settings

#### Shared Features
- [x] Authentication (JWT + session)
- [x] Multi-tenancy (council isolation)
- [x] Responsive design (mobile-first)
- [x] Offline support (cached data)
- [x] Loading states & error handling
- [x] WCAG 2.1 AA accessibility
- [x] Deep linking (referral URLs)

---

## DATA MODEL & ENTITIES

### Core Entities
```
User
 id (UUID)
 email
 password_hash
 role (customer, scout, leader, admin)
 council_id
 first_name
 last_name
 phone
 date_of_birth (age verification)
 created_at
 updated_at

Scout
 id (UUID)
 first_name
 last_name (last initial only for leaderboard)
 troop_id
 parent_email
 parent_consent (boolean, timestamp)
 referral_code (unique)
 total_cards_sold (integer)
 total_funds_raised (decimal)
 goal_amount (decimal)
 created_at
 updated_at

Subscription
 id (UUID)
 user_id
 council_id
 plan_id (annual)
 stripe_subscription_id
 status (active, cancelled, expired)
 start_date
 end_date
 amount_paid (decimal)
 created_at
 updated_at

Offer
 id (UUID)
 merchant_id
 council_id
 title
 description (up to 6 lines)
 category
 discount_amount
 terms
 image_url
 valid_from
 valid_until
 created_at
 updated_at

Merchant
 id (UUID)
 council_id
 name
 logo_url
 location (address)
 latitude
 longitude
 created_at
 updated_at

Redemption
 id (UUID)
 offer_id
 user_id
 code (unique per redemption)
 status (pending, redeemed, expired)
 redeemed_at
 created_at
 updated_at

Referral
 id (UUID)
 scout_id
 referred_user_id
 status (pending, confirmed)
 created_at
 updated_at

Council
 id (UUID)
 name (e.g., "Central Florida Council")
 abbreviation
 region
 logo_url
 created_at
 updated_at
```

---

##  API ENDPOINTS (Mobile-Specific)

### Authentication
```
POST /api/v1/auth/register
 Email, password, first name, last name
 Returns: User + JWT token
 Rate limit: 5/min

POST /api/v1/auth/login
 Email + password
 Returns: JWT token + refresh token
 Rate limit: 10/min

POST /api/v1/auth/logout
 Invalidate refresh token
 Rate limit: Unlimited

POST /api/v1/auth/refresh
 Refresh JWT using refresh token
 Rate limit: 20/min
```

### Offers
```
GET /api/v1/offers
 Query: council_id, page, limit, category
 Returns: Paginated list
 Caching: 5 minutes

GET /api/v1/offers/{id}
 Returns: Full offer details
 Caching: 5 minutes

GET /api/v1/offers/search
 Query: q (search term), category
 Returns: Filtered list
```

### Subscriptions
```
GET /api/v1/subscriptions/me
 Current user's subscription
 Returns: Status, expiry, amount paid

POST /api/v1/subscriptions
 Create subscription (redirect to Stripe)
 Returns: Stripe session URL

GET /api/v1/subscriptions/{id}/status
 Check subscription status
 Returns: Active/cancelled/expired
```

### Scout Management
```
POST /api/v1/scouts
 Troop leader creates scout
 Requires: first_name, last_name, parent_email
 Returns: Scout ID + referral link

GET /api/v1/scouts/{id}
 Get scout details
 Returns: Full scout profile + metrics

GET /api/v1/scouts/{id}/leaderboard
 Troop leaderboard
 Returns: Ranked list (first name + metrics only)

GET /api/v1/scouts/{id}/referrals
 Scout's referral conversions
 Returns: Count, list, dates

POST /api/v1/scouts/{id}/share-link
 Generate shareable link
 Returns: QR code + short URL
```

### Redemptions
```
POST /api/v1/redemptions
 Submit offer code
 Requires: offer_id, code
 Returns: Validation result

GET /api/v1/redemptions/me
 User's redemption history
 Returns: List with status

GET /api/v1/redemptions/{id}/verify
 Merchant verifies code
 Returns: Offer details for cashier
```

### Dashboard/Metrics
```
GET /api/v1/users/me/dashboard
 Personalized dashboard
 Returns: Subscription status, savings, recent activity

GET /api/v1/troops/{id}/dashboard
 Troop leader dashboard
 Returns: Team metrics, scout rankings

GET /api/v1/scouts/{id}/dashboard
 Scout fundraising dashboard
 Returns: Cards sold, funds raised, progress
```

### Misc
```
GET /api/v1/councils
 List available councils
 Returns: Council names, logos

GET /api/v1/users/me
 Current user profile
 Returns: User info

PUT /api/v1/users/me
 Update user profile
 Allows: first_name, last_name, phone, preferences

POST /api/v1/invitations/resend
 Troop leader resends parental consent
 Requires: scout_id
 Returns: Email confirmation
```

---

## Security & Compliance Requirements

### Authentication
- JWT-based authentication (access + refresh tokens)
- Refresh token rotation
- Secure password hashing (bcrypt)
- Rate limiting (login, register endpoints)
- Multi-tenancy isolation (council data separation)

### Data Protection
- HTTPS/TLS for all API calls
- Minimal PII for Scouts (first name + last initial on leaderboard)
- No direct Scout login (parent/leader only)
- Parental consent email verification
- GDPR-compliant data deletion

### Youth Safety (COPPA/FERPA)
- Age verification (birth date stored, not displayed)
- Parent email verification
- Parent consent workflow
- Leaderboard anonymization (first name only)
- No direct messaging between users
- No location tracking of Scouts

### Payment Security
- Stripe PCI compliance (redirect-based, no stored card data)
- Webhook signature verification
- Subscription state validation
- Fraud detection (prevent duplicate subscriptions)

### Audit & Compliance
- Audit logging (all data changes)
- API rate limiting
- DDoS protection (CloudFlare/AWS Shield)
- Regular security audits

---

##  Performance & UX Requirements

### Performance Targets
- App startup: < 2 seconds
- Offer list load: < 1 second
- API response (P95): < 100ms
- Offer search: < 500ms
- Offline support: Full cached data

### Mobile UX
- Responsive design (375px - 812px screens)
- Touch targets 4444px (accessibility)
- Text truncation with ellipsis (no overflow)
- Loading states + skeletons
- Error states with retry
- Offline mode with cached data
- Deep linking (QR codes, referral URLs)
- Biometric auth (Face ID, Touch ID) - Phase 3

### Caching Strategy
- React Query: Server-side cache (5 min TTL for offers, 1 hour for user data)
- AsyncStorage: Local device cache (1 hour TTL)
- Redis (backend): 1-minute TTL for frequently accessed data
- Image caching: Built-in React Native caching

### Accessibility
- WCAG 2.1 AA compliant
- VoiceOver support (iOS)
- TalkBack support (Android)
- Color contrast 4.5:1
- Semantic labels on all buttons/inputs
- Keyboard navigation support

---

## Current Implementation Status

### Completed
- Authentication & login system
- Multi-role navigation (Customer, Scout, Leader)
- Offer browsing & details screens
- Design system & tokens
- Accessibility compliance (WCAG 2.1 AA)
- Text truncation fixes
- Testing suite (Phase 1)
- Feature flag system (ready for deployment)

###  Pending (Phase 2+)
- Payment integration (Stripe)
- Scout referral link generation
- QR code generation & sharing
- Leaderboard UI
- Parental consent workflow
- Subscription status tracking
- Deep linking implementation
- Offline mode (cached offers)
- Geo-proximity features (V1)
- Biometric authentication (V2)

---

## IMPLEMENTATION ROADMAP

### PHASE 1: MVP (Weeks 1-4)
**Priority:** P0 (Blocking, must complete)

**Features:**
1. Authentication system
2. Offer browsing & search
3. Manual redemption
4. Dashboard (customer view)
5. Settings & profile
6. Multi-tenancy
7. Design system + accessibility

**Deliverables:**
- 5 main screens
- 6 components
- 3 custom hooks
- Test suite
- Documentation

---

### PHASE 2: Scout Features (Weeks 5-8)
**Priority:** P1 (High impact, required for MVP launch)

**Features:**
1. Scout dashboard (metrics)
2. Referral link generation
3. QR code generator
4. Share link UI (SMS, Email, Social)
5. Print poster
6. Leaderboard (troop rankings)
7. Parental consent workflow
8. Troop leader dashboard

**Deliverables:**
- 4 new screens
- Scout API integration
- Referral tracking
- Leaderboard ranking logic

---

### PHASE 3: Subscription & Payment (Weeks 9-12)
**Priority:** P1 (Revenue critical)

**Features:**
1. Stripe payment integration
2. Subscription status tracking
3. Annual renewal workflow
4. Cancel subscription
5. Receipt management
6. Savings dashboard (actual calculation)

**Deliverables:**
- Payment flow
- Subscription management
- Refund handling

---

### PHASE 4: Optimizations (Weeks 13-16)
**Priority:** P2 (Performance & reliability)

**Features:**
1. Offline mode (cached offers)
2. Deep linking (QR codes, referral URLs)
3. Image optimization
4. Push notifications (basic)
5. Biometric authentication
6. Performance profiling

**Deliverables:**
- 30% faster load times
- 100% offline support
- Deep linking working

---

## MVP LAUNCH REQUIREMENTS CHECKLIST

### Code Quality
- [ ] Unit tests (80% coverage)
- [ ] Integration tests (critical paths)
- [ ] E2E tests (user journeys)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance profiling (< targets)
- [ ] Security audit (OWASP Top 10)
- [ ] Code review (all PRs)

### Documentation
- [ ] README (setup, deployment)
- [ ] Component library (Storybook)
- [ ] API documentation (Swagger)
- [ ] Architecture diagram
- [ ] Deployment guide
- [ ] Troubleshooting guide

### Deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment
- [ ] Production environment
- [ ] Monitoring & alerting
- [ ] Rollback procedures

### Data & Infrastructure
- [ ] Database backups
- [ ] Read replicas (for scaling)
- [ ] Redis cluster
- [ ] CDN for images
- [ ] Load testing (handle 10K+ users)

### Support & Operations
- [ ] On-call runbook
- [ ] Incident response plan
- [ ] User support playbook
- [ ] Release notes
- [ ] Feedback mechanism

---

## SUCCESS METRICS

### Mobile App KPIs
- Daily Active Users (DAU): 1,000+
- Installation rate: 80%+ of referred users
- Subscription conversion: 30%+
- Redemption rate: 50%+ of customers
- Scout sign-up completion: 90%+
- App retention (30-day): 40%+
- NPS: 50

### Technical KPIs
- Crash rate: < 0.1%
- API uptime: 99.9%
- P95 latency: < 100ms
- Cache hit rate: > 95%
- Test coverage: 80%

---

##  TEAM COMPOSITION

### Mobile Development Team
- 2 React Native Engineers (48 hours each = 96 hours total)
- 1 Mobile QA Engineer (16 hours)
- 1 Product Manager (12 hours review/planning)
- 1 Design Lead (8 hours design review)

### Backend Support (Shared)
- 2 Backend Engineers (integrating APIs)
- 1 DevOps Engineer (infrastructure)

### Total: ~5-6 people, 3-4 weeks for MVP

---

##  TIMELINE

```
Week 1-2: Phase 1 Core (Auth, Offers, Design System)
Week 3-4: Phase 1 Testing & Polish
Week 5-6: Phase 2 Scout Features (Referrals, QR, Leaderboard)
Week 7-8: Phase 2 Testing & Integration
Week 9-10: Phase 3 Stripe Payment Integration
Week 11-12: Phase 3 Testing & Launch Prep
Week 13-16: Phase 4 Optimizations & Scaling
```

---

## VALIDATION AGAINST SPECIFICATION

### Program Requirements
- Non-payment digital card (Variant B)
- Scout referral attribution
- Offer browsing & redemption
- Multi-tenant (per-council)
- Mobile-first design
- Youth safety (COPPA compliant)
- Parent supervision workflows
- Leaderboard gamification

### MVP Feature Alignment
- Customer acquisition via Scout link
- In-app subscription purchase (Stripe)
- Offer browsing & manual redemption
- Scout dashboard (metrics)
- Troop leader dashboard
- Council admin portal (web-only)
- Multi-role navigation

### Technical Alignment
- React Native + TypeScript
- Zustand state management
- React Query data fetching
- AsyncStorage caching
- JWT authentication
- PostgreSQL data model
- Spring Boot backend APIs
- Redis caching layer

### Security Alignment
- HTTPS/TLS encryption
- JWT-based auth
- Multi-tenancy isolation
- COPPA compliance
- GDPR compliance
- Youth data protection
- Parental consent workflows
- PCI compliance (Stripe)

---

##  NEXT STEPS

1. **Review & Approve MVP Requirements** (1 hour)
 - Validate against Variant B specification
 - Confirm all features in scope
 - Approve timeline

2. **Create Sprint Planning** (2 hours)
 - Break down into 2-week sprints
 - Assign team members
 - Define daily standups

3. **Set up Development Environment** (4 hours)
 - Configure local environment
 - Set up CI/CD pipeline
 - Create staging deployment

4. **Begin Phase 1 Development** (Week 1)
 - Start with authentication
 - Implement core navigation
 - Build offer listing

---

**Status:** REQUIREMENTS VALIDATED
**Variant:** VARIANT B (Non-Payment) ONLY
**Ready for Development:** YES
**Document Version:** 1.0 Final
**Last Updated:** December 26, 2025
