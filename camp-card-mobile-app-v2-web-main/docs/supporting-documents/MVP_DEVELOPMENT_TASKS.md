# MVP Implementation - Detailed Task Breakdown

**Status:** Ready for Sprint Planning
**Total Estimated Effort:** 120-140 hours (3-4 weeks with 3 FE engineers)
**Variant:** Variant B (Non-Payment Digital Card Only)

---

## PHASE 1: CORE MVP (Weeks 1-4)

### Sprint 1.1: Authentication & Navigation (Week 1)

#### Task 1.1.1: JWT Authentication System
- [x] Setup auth context/provider
- [x] Login endpoint integration
- [x] Register endpoint integration
- [x] Token storage (secure AsyncStorage)
- [x] Token refresh mechanism
- [x] Logout functionality
- [x] Session persistence
- [x] Error handling (invalid credentials, expired token)
- **Effort:** 8-10 hours
- **Owner:** Backend FE Lead
- **Dependencies:** Backend auth endpoints ready

#### Task 1.1.2: Role-Based Navigation
- [x] Customer tab navigation (Home, Offers, Settings)
- [x] Scout parent tab navigation
- [x] Troop leader tab navigation
- [x] Admin web portal (out of scope for mobile)
- [x] Deep linking setup
- [x] Route guards (protected routes)
- [x] Loading screen during role detection
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#2
- **Dependencies:** Auth system complete

#### Task 1.1.3: Design System Integration
- [x] Import color tokens
- [x] Import typography tokens
- [x] Import spacing tokens
- [x] Import component tokens
- [x] Create reusable Button component
- [x] Create reusable Card component
- [x] Create reusable Text component
- [x] Setup theme provider
- [x] Dark mode support (optional for MVP)
- **Effort:** 4-6 hours
- **Owner:** Design Lead + FE#1
- **Dependencies:** Design tokens.ts ready

#### Task 1.1.4: Login Screen UI
- [x] Email input field
- [x] Password input field
- [x] Remember me checkbox (optional)
- [x] Login button
- [x] Sign up link
- [x] Forgot password link (stub for MVP)
- [x] Error message display
- [x] Loading state
- [x] Responsive design (375px - 812px)
- [x] Accessibility labels & screen reader support
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#2
- **Dependencies:** Auth system, Design system

#### Task 1.1.5: Register Screen UI
- [x] Email input
- [x] Password input
- [x] First name input
- [x] Last name input
- [x] Confirm password
- [x] Terms acceptance checkbox
- [x] Register button
- [x] Login link
- [x] Form validation
- [x] Error handling
- [x] Success redirect to login
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3
- **Dependencies:** Auth system, Design system

**Sprint 1.1 Total Effort:** 26-34 hours

---

### Sprint 1.2: Offer Browsing & Display (Week 1-2)

#### Task 1.2.1: Offer List Screen
- [x] FlatList with offers
- [x] Pagination (infinite scroll or load more)
- [x] Offer card component
- [x] Merchant image + name
- [x] Discount amount display
- [x] Category badge
- [x] Responsive layout
- [x] Loading skeleton
- [x] Pull-to-refresh
- [x] Empty state
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#1
- **Dependencies:** Offers API ready

#### Task 1.2.2: Offer Search & Filters
- [x] Search input (debounced)
- [x] Category filter dropdown
- [x] Sort options (New, Popular, Distance)
- [x] Apply filters button
- [x] Clear filters
- [x] Filter UI modal/bottom sheet
- [x] Search results counter
- [x] No results state
- **Effort:** 5-7 hours
- **Owner:** Frontend FE#2
- **Dependencies:** Search API, Filter API

#### Task 1.2.3: Offer Details Screen
- [x] Offer card (larger view)
- [x] Merchant logo
- [x] Full description (up to 6 lines, truncated)
- [x] Valid date range
- [x] Terms & conditions (expandable)
- [x] Redemption code display
- [x] Manual code entry form
- [x] Redeem button
- [x] Save for later (optional MVP)
- [x] Share offer (optional MVP)
- **Effort:** 5-6 hours
- **Owner:** Frontend FE#3
- **Dependencies:** Offer details API

#### Task 1.2.4: Offer Redemption Flow
- [x] Code entry form
- [x] Code validation (format check)
- [x] Submit to backend
- [x] Success message
- [x] Error handling (invalid code, expired offer)
- [x] Redemption receipt/confirmation
- [x] Save redemption history
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#1
- **Dependencies:** Redemption API

**Sprint 1.2 Total Effort:** 20-26 hours

---

### Sprint 1.3: Customer Dashboard & Settings (Week 2)

#### Task 1.3.1: Customer Home Screen
- [x] Welcome message (personalized)
- [x] Council/tenant name display
- [x] Subscription status card
- [x] Quick action buttons (Browse Offers, View Settings)
- [x] Featured offers carousel (optional)
- [x] Recent activity section
- [x] Responsive layout
- [x] Loading state
- **Effort:** 5-7 hours
- **Owner:** Frontend FE#2
- **Dependencies:** User profile API, Subscription API

#### Task 1.3.2: Settings Screen
- [x] User profile section
- [x] Email (read-only)
- [x] First name (editable)
- [x] Last name (editable)
- [x] Phone (editable)
- [x] Subscription status
- [x] Notification preferences
- [x] Council/tenant selection (multi-tenant)
- [x] Privacy settings
- [x] Help & feedback
- [x] Logout button
- **Effort:** 5-6 hours
- **Owner:** Frontend FE#3
- **Dependencies:** User profile API, Multi-tenant config

#### Task 1.3.3: Multi-Tenant Switching
- [x] Council selector dropdown
- [x] Council list API
- [x] Switch tenant on selection
- [x] Refresh all data for new council
- [x] Update auth token with new council
- [x] Persist council selection
- **Effort:** 3-4 hours
- **Owner:** Frontend FE#1
- **Dependencies:** Multi-tenant backend support

**Sprint 1.3 Total Effort:** 13-17 hours

---

### Sprint 1.4: Testing, Accessibility & Polish (Week 3-4)

#### Task 1.4.1: Unit Tests
- [x] Auth reducer tests
- [x] API client tests
- [x] Navigation tests
- [x] Component snapshot tests
- [x] Utils function tests
- [x] Coverage: 70%
- **Effort:** 8-10 hours
- **Owner:** QA Engineer + FE#1

#### Task 1.4.2: Integration Tests
- [x] Login  Home flow
- [x] Register  Login flow
- [x] Browse Offers  Redeem flow
- [x] Settings  Update Profile flow
- [x] Council switching flow
- **Effort:** 6-8 hours
- **Owner:** QA Engineer + FE#2

#### Task 1.4.3: Accessibility Audit & Fixes
- [x] VoiceOver testing (iOS)
- [x] TalkBack testing (Android)
- [x] Color contrast check (4.5:1 minimum)
- [x] Touch target sizing (4444px minimum)
- [x] Semantic labels review
- [x] Keyboard navigation test
- [x] Fix identified issues
- **Effort:** 6-8 hours
- **Owner:** QA Engineer + Design Lead

#### Task 1.4.4: Device Testing
- [x] iPhone SE (375px)
- [x] iPhone 12 (390px)
- [x] iPhone 14 Pro (430px)
- [x] Galaxy S21 (360px)
- [x] Pixel 6 (412px)
- [x] Text overflow/truncation
- [x] Layout responsiveness
- **Effort:** 4-6 hours
- **Owner:** QA Engineer

#### Task 1.4.5: Bug Fixes & Polish
- [x] Fix reported issues
- [x] Performance optimization
- [x] Code cleanup
- [x] Documentation update
- **Effort:** 5-7 hours
- **Owner:** FE#1, FE#2, FE#3

**Sprint 1.4 Total Effort:** 29-39 hours

**Phase 1 Total Effort:** 88-116 hours (Ready for MVP Testing)

---

## PHASE 2: SCOUT & REFERRAL FEATURES (Weeks 5-8)

### Sprint 2.1: Scout Dashboard & Metrics (Week 5)

#### Task 2.1.1: Scout Home Screen
- [ ] Fundraising metrics display
 - [ ] Total cards sold
 - [ ] Total funds raised ($18  cards sold)
 - [ ] Progress bar (vs. goal)
 - [ ] Percentage complete
- [ ] Goal amount display
- [ ] Motivational messaging
- [ ] Refresh metrics button
- **Effort:** 5-6 hours
- **Owner:** Frontend FE#2

#### Task 2.1.2: Referral Link Generation
- [ ] Generate unique referral code
- [ ] Create short URL (campcard.app/s/{CODE})
- [ ] Display link in UI
- [ ] Copy to clipboard button
- [ ] QR code generation
- [ ] Link validation
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#1
- **Dependencies:** Scout referral API

#### Task 2.1.3: Share Functionality
- [ ] Share link via SMS
- [ ] Share link via Email
- [ ] Share link via Social Media (Facebook, TikTok)
- [ ] Share QR code as image
- [ ] Track share events (optional)
- [ ] Fallback to native share (iOS/Android)
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3

**Sprint 2.1 Total Effort:** 15-19 hours

---

### Sprint 2.2: QR Code & Print Poster (Week 5-6)

#### Task 2.2.1: QR Code Component
- [ ] Generate QR code from link
- [ ] Display QR code in UI
- [ ] Scale QR code for clarity
- [ ] Tap to enlarge
- [ ] Save QR code as image
- [ ] Share QR code
- **Effort:** 3-4 hours
- **Owner:** Frontend FE#1

#### Task 2.2.2: Print Poster
- [ ] PDF template generation
- [ ] Include scout name
- [ ] Include QR code
- [ ] Include short link
- [ ] Include motivational text
- [ ] Print to device printer
- [ ] Save PDF to device
- [ ] Email PDF
- **Effort:** 5-7 hours
- **Owner:** Frontend FE#2
- **Dependencies:** React-PDF or similar library

**Sprint 2.2 Total Effort:** 8-11 hours

---

### Sprint 2.3: Leaderboard & Rankings (Week 6)

#### Task 2.3.1: Leaderboard Screen
- [ ] Fetch troop leaderboard data
- [ ] Display ranked list
 - [ ] Rank number (1, 2, 3, ...)
 - [ ] Scout name (first name only, no last name)
 - [ ] Cards sold count
 - [ ] Funds raised amount
- [ ] Highlight own rank/position
- [ ] Scroll to own position
- [ ] Refresh button
- [ ] Responsive scrolling
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3
- **Dependencies:** Leaderboard API

#### Task 2.3.2: Gamification Elements
- [ ] Bronze/Silver/Gold badges
- [ ] Achievement notifications
- [ ] Milestone celebrations (50 cards, 100 cards, etc.)
- [ ] Personal best display
- [ ] Streak tracking (optional)
- **Effort:** 3-4 hours
- **Owner:** Frontend FE#2

**Sprint 2.3 Total Effort:** 7-9 hours

---

### Sprint 2.4: Troop Leader Features (Week 7)

#### Task 2.4.1: Troop Leader Home Screen
- [ ] Troop metrics dashboard
 - [ ] Total cards sold (all scouts)
 - [ ] Total funds raised
 - [ ] Goal & progress
 - [ ] Average per scout
- [ ] Top scouts list (3-5)
- [ ] Recent sign-ups
- [ ] Quick actions
- **Effort:** 5-6 hours
- **Owner:** Frontend FE#1

#### Task 2.4.2: Scouts Management
- [ ] View scout roster (list)
- [ ] Scout detail view (metrics, links)
- [ ] Create new scout form
 - [ ] Scout first name
 - [ ] Scout last name
 - [ ] Parent email
- [ ] Resend parental consent email
- [ ] Delete scout (mark inactive)
- [ ] Edit scout info
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#2
- **Dependencies:** Scout management API

#### Task 2.4.3: Parental Consent Workflow
- [ ] Generate consent email link
- [ ] Track parent acceptance
- [ ] Show consent status in UI
- [ ] Resend consent email
- [ ] Consent expiry handling (30 days)
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3
- **Dependencies:** Consent API

**Sprint 2.4 Total Effort:** 15-19 hours

**Phase 2 Total Effort:** 45-58 hours (Scout features complete)

---

## PHASE 3: SUBSCRIPTION & PAYMENT (Weeks 9-12)

### Sprint 3.1: Stripe Payment Integration (Week 9)

#### Task 3.1.1: Subscription Purchase Flow
- [ ] Display pricing ($29.99/year)
- [ ] Create Stripe checkout session
- [ ] Redirect to Stripe-hosted page
- [ ] Handle payment success
- [ ] Handle payment cancellation
- [ ] Webhook for subscription creation
- [ ] Subscription status validation
- **Effort:** 8-10 hours
- **Owner:** Frontend FE#1 + Backend
- **Dependencies:** Stripe API setup, Backend webhooks

#### Task 3.1.2: Subscription Status Display
- [ ] Show active/cancelled/expired status
- [ ] Display renewal date
- [ ] Display amount paid
- [ ] Subscription history (renewals)
- [ ] Cancel subscription button
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#2

#### Task 3.1.3: Renewal & Auto-Pay
- [ ] Pre-renewal notifications (7 days before)
- [ ] Renewal confirmation
- [ ] Failure notifications
- [ ] Retry logic for failed payments
- [ ] Update payment method
- **Effort:** 4-6 hours
- **Owner:** Frontend FE#3

**Sprint 3.1 Total Effort:** 16-21 hours

---

### Sprint 3.2: Savings & Analytics (Week 10)

#### Task 3.2.1: Actual Savings Calculation
- [ ] Track redemptions per user
- [ ] Calculate discount value per offer
- [ ] Sum total savings
- [ ] Display in home screen
- [ ] Show redemption history
- [ ] Breakdown by category (optional)
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#1
- **Dependencies:** Redemption history API

#### Task 3.2.2: Savings Dashboard
- [ ] Total savings card
- [ ] Savings by month (optional)
- [ ] Most valuable offers
- [ ] Recent redemptions
- [ ] Projection to year-end
- **Effort:** 3-4 hours
- **Owner:** Frontend FE#2

**Sprint 3.2 Total Effort:** 7-9 hours

**Phase 3 Total Effort:** 23-30 hours (Payment integration complete)

---

## PHASE 4: OPTIMIZATIONS & REFINEMENTS (Weeks 13-16)

### Sprint 4.1: Offline Mode & Caching (Week 13)

#### Task 4.1.1: Data Persistence
- [ ] Cache offers locally (AsyncStorage)
- [ ] Cache user profile
- [ ] Cache subscription status
- [ ] Cache leaderboard
- [ ] 1-hour cache TTL
- [ ] Cache invalidation on login
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#1

#### Task 4.1.2: Offline Mode
- [ ] Detect network connectivity
- [ ] Show offline indicator
- [ ] Queue pending redemptions
- [ ] Sync when online
- [ ] Handle sync failures
- [ ] Fallback to cached data
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#2

**Sprint 4.1 Total Effort:** 10-13 hours

---

### Sprint 4.2: Deep Linking & Referral Tracking (Week 14)

#### Task 4.2.1: Deep Linking Setup
- [ ] Configure universal links (iOS)
- [ ] Configure app links (Android)
- [ ] Generate referral deep links
- [ ] Handle scout link taps
- [ ] Redirect to sign-up
- [ ] Capture referral attribution
- **Effort:** 6-8 hours
- **Owner:** Frontend FE#1 + DevOps

#### Task 4.2.2: Referral Attribution
- [ ] Parse referral code from URL
- [ ] Store in user session
- [ ] Pass to subscription API
- [ ] Validate referral
- [ ] Record in database
- [ ] Update scout metrics
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3 + Backend

**Sprint 4.2 Total Effort:** 10-13 hours

---

### Sprint 4.3: Performance & Optimization (Week 14-15)

#### Task 4.3.1: Image Optimization
- [ ] Resize images on upload
- [ ] Use appropriate formats (WebP)
- [ ] Implement lazy loading
- [ ] Cache images locally
- [ ] CDN integration
- **Effort:** 4-6 hours
- **Owner:** Frontend FE#2

#### Task 4.3.2: Performance Profiling
- [ ] Measure app startup time
- [ ] Profile screen transitions
- [ ] Identify slow API calls
- [ ] Optimize React renders
- [ ] Reduce bundle size
- [ ] Measure improvements
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#1

#### Task 4.3.3: Biometric Authentication
- [ ] Face ID integration (iOS)
- [ ] Touch ID integration (iOS)
- [ ] Fingerprint authentication (Android)
- [ ] Fallback to password
- [ ] Security best practices
- **Effort:** 4-5 hours
- **Owner:** Frontend FE#3

**Sprint 4.3 Total Effort:** 12-16 hours

---

### Sprint 4.4: Final Testing & Launch Prep (Week 15-16)

#### Task 4.4.1: E2E Testing
- [ ] User journey: Guest  Register  Subscribe
- [ ] User journey: Scout creation  Referral  Sign-up
- [ ] User journey: Offer browsing  Redemption
- [ ] User journey: Leadership dashboard usage
- [ ] Multiple device types
- [ ] Multiple network speeds
- **Effort:** 8-10 hours
- **Owner:** QA Engineer

#### Task 4.4.2: Load Testing
- [ ] Simulate 1,000+ concurrent users
- [ ] Monitor API response times
- [ ] Check database performance
- [ ] Identify bottlenecks
- [ ] Optimize queries
- **Effort:** 4-6 hours
- **Owner:** Backend + DevOps

#### Task 4.4.3: Security Audit
- [ ] OWASP Top 10 review
- [ ] Input validation audit
- [ ] Authentication/authorization check
- [ ] Data protection review
- [ ] API rate limiting test
- **Effort:** 4-5 hours
- **Owner:** Security specialist

#### Task 4.4.4: Release & Deployment
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Release notes preparation
- [ ] Marketing materials
- [ ] User support setup
- [ ] Monitoring & alerting
- **Effort:** 4-6 hours
- **Owner:** DevOps + Product

**Sprint 4.4 Total Effort:** 20-27 hours

**Phase 4 Total Effort:** 52-69 hours (Production ready)

---

## SUMMARY

| Phase | Sprint | Focus | Effort | Duration |
|-------|--------|-------|--------|----------|
| 1 | 1.1 | Auth & Navigation | 26-34h | Wk 1 |
| 1 | 1.2 | Offer Browsing | 20-26h | Wk 1-2 |
| 1 | 1.3 | Customer Dashboard | 13-17h | Wk 2 |
| 1 | 1.4 | Testing & Polish | 29-39h | Wk 3-4 |
| **Phase 1 Total** | | **Core MVP** | **88-116h** | **Wk 1-4** |
| 2 | 2.1 | Scout Dashboard | 15-19h | Wk 5 |
| 2 | 2.2 | QR & Poster | 8-11h | Wk 5-6 |
| 2 | 2.3 | Leaderboard | 7-9h | Wk 6 |
| 2 | 2.4 | Troop Leader | 15-19h | Wk 7 |
| **Phase 2 Total** | | **Scout Features** | **45-58h** | **Wk 5-8** |
| 3 | 3.1 | Stripe Payment | 16-21h | Wk 9 |
| 3 | 3.2 | Savings & Analytics | 7-9h | Wk 10 |
| **Phase 3 Total** | | **Payment** | **23-30h** | **Wk 9-12** |
| 4 | 4.1 | Offline Mode | 10-13h | Wk 13 |
| 4 | 4.2 | Deep Linking | 10-13h | Wk 14 |
| 4 | 4.3 | Performance | 12-16h | Wk 14-15 |
| 4 | 4.4 | Launch Prep | 20-27h | Wk 15-16 |
| **Phase 4 Total** | | **Optimizations** | **52-69h** | **Wk 13-16** |
| **TOTAL** | | **Full MVP** | **208-273h** | **16 weeks** |

---

## TEAM ALLOCATION

### Team Capacity: 3 Full-Time Frontend Engineers
- **Total capacity:** 3  40 hours/week = 120 hours/week
- **Estimated effort:** 208-273 hours
- **Timeline:** 2-3 weeks (with focused effort)

### Recommended Distribution
- **FE#1:** Auth, Offers, Scout Referral, Offline Mode
- **FE#2:** Navigation, Dashboard, Leaderboard, Performance
- **FE#3:** Settings, Print Poster, Troop Leader, Payment
- **QA:** Testing all phases, accessibility, device testing

---

**Status:** Tasks Defined & Estimated
**Ready for Sprint Planning:** YES
**Estimated Timeline:** 3-4 weeks (MVP), 16 weeks (Full Featured)
**Next Step:** Create sprint boards in Jira/GitHub Projects

