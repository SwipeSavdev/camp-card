# Sprint 1.1 - Authentication & Navigation Development Guide

**Duration:** Week 1 (26-34 hours)
**Status:** IN PROGRESS
**Objective:** Complete authentication system, role-based navigation, and design system foundation

---

## Deliverables

### 1. Enhanced Authentication System
**Status:** In Progress

#### Components Completed:
- [x] JWT token storage with Keychain integration (SecureStore)
- [x] Fallback AsyncStorage for tokens if Keychain unavailable
- [x] Token refresh mechanism with queue system
- [x] Logout functionality with secure token cleanup
- [x] API client with automatic Bearer token injection
- [x] Multi-tenant header support (X-Tenant-Id)
- [x] 401 response interceptor with auto-refresh
- [x] Login form with email/password validation
- [x] Signup form with full validation
- [x] Error state management

#### Files Modified/Created:
- `src/store/authStore.ts` - Enhanced with SecureStore, improved token refresh
- `src/screens/auth/LoginScreen.tsx` - Existing (good)
- `src/screens/auth/SignupScreen.tsx` - Existing (good)
- `src/services/apiClient.ts` - Existing (has proper interceptors)
- `src/__tests__/store/authStore.test.ts` - New: 6 test suites, 16 test cases
- `src/__tests__/screens/auth.test.tsx` - New: 11 test cases
- `src/__tests__/services/apiClient.test.ts` - New: 6 test suites

#### Test Coverage:
- authStore: 16 test cases (initialize, login, signup, logout, refresh)
- auth screens: 11 test cases (validation, navigation, error display)
- apiClient: 7 test cases (request/response interceptors)

**Time Estimate:** 12-16 hours (3-4 sprint days)
**Owner:** Frontend Engineer #1

---

### 2. Role-Based Navigation
**Status:** Complete

#### Implementation Details:

**Navigation Stack Structure:**
```
RootNavigator (root entry point)
 AuthNavigator (when not authenticated)
  Login Screen
  Signup Screen
 AppNavigator (when authenticated)
  RoleTabs (dynamically switches based on user.role)
  CustomerTabs
   Home (subscription status, quick actions)
   Offers (browse, search, filter)
   Settings (profile, preferences)
  LeaderTabs
   Dashboard (troop metrics)
   Scouts (roster, manage)
   Share (QR, link, poster)
   Settings
  ScoutTabs
  Dashboard (metrics, referral link)
  Share (QR, link, poster)
  Settings
```

#### Key Features:
- Dynamic role detection from `useAuthStore.getState().user.role`
- Smooth navigation transitions between roles (no full app reload)
- Consistent tab bar styling across all roles
- Icon mappings via Ionicons for visual consistency
- Safe fallback to Customer tabs if role not recognized

#### Files:
- `src/navigation/RootNavigator.tsx` - Complete (7 tab navigator configs)
- `src/types/roles.ts` - Role type definitions
- `src/theme/index.ts` - Color/spacing tokens

**Implementation Status:** 100% Complete
**Time Estimate:** 4-6 hours (already done)
**Owner:** Frontend Engineer #2

---

### 3. Design System Integration
**Status:** In Progress

#### Design Tokens (Defined in `src/theme/index.ts`):

**Colors:**
```typescript
- navy900: '#000C2F' // Primary dark
- navy800: '#01153A' // Secondary dark
- blue500: '#0A4384' // Primary blue
- red500: '#D9012C' // Action/CTA
- white: '#FFFFFF' // Background
- gray50: '#F4F6FA' // Light background
- gray200: '#D8E0EC' // Borders
- text: '#000C2F' // Primary text
- muted: 'rgba(0,12,47,0.65)' // Secondary text
```

**Spacing (8px base unit):**
```typescript
- xs: 8px
- sm: 12px
- md: 16px
- lg: 24px
- xl: 32px
```

**Border Radius:**
```typescript
- button: 14px
- card: 24px
- small: 12px
```

**Shadows:**
```typescript
- card: elevation 6 (Android), custom shadows (iOS)
```

**Gradients:**
```typescript
- hero: [highlight  navy900]
```

#### Components to Verify/Update:

1. **Button.tsx**
 - Primary (red background, white text)
 - Secondary (white background, navy text, border)
 - Loading state (spinner)
 - Disabled state

2. **Input.tsx**
 - Text field with label
 - Placeholder styling
 - Error state (red border)
 - Focus state (blue border)
 - secureTextEntry for passwords

3. **Card.tsx**
 - White background with shadow
 - Border radius 24px
 - Padding 16px
 - Optional border

4. **Typography.tsx** (create if missing)
 - Heading1 (28pt, bold)
 - Heading2 (20pt, semibold)
 - Body (16pt, regular)
 - Caption (12pt, regular, muted)

**Files:**
- `src/theme/index.ts` - Complete
- `src/components/Button.tsx` - Verify exists
- `src/components/Input.tsx` - Verify exists
- `src/components/Card.tsx` - Create if missing
- `src/components/Typography.tsx` - Create if missing

**Implementation Status:** 80% (verify existing components)
**Time Estimate:** 4-6 hours
**Owner:** Frontend Engineer #3 + Designer review

---

### 4. Polished Auth Screens
**Status:** Complete (needs validation)

#### LoginScreen (`src/screens/auth/LoginScreen.tsx`):
- [x] Logo and branding centered at top
- [x] Email input with validation
- [x] Password input (secureTextEntry)
- [x] Form validation (email format, password required)
- [x] Error display (local + store errors)
- [x] Loading state on button
- [x] "Create account" link
- [x] Mock mode hint text
- [x] Accessibility labels

#### SignupScreen (`src/screens/auth/SignupScreen.tsx`):
- [x] Full name input
- [x] Email input with validation
- [x] Password input with 8-char minimum
- [x] Optional invitation/referral code
- [x] Form validation
- [x] Error display
- [x] Loading state
- [x] "Back to sign in" button
- [x] Accessibility labels

#### Enhancements (if time):
- [ ] Keyboard aware scrolling
- [ ] Better error messages
- [ ] Password strength indicator
- [ ] "Forgot password?" link
- [ ] Social login buttons (Phase 2)

**Implementation Status:** 100% Complete
**Time Estimate:** 0 hours (already done well)
**Owner:** N/A

---

## Testing Checklist

### Unit Tests (Target: 70% coverage)
- [x] authStore: initialize, login, signup, logout, refresh
- [x] auth screens: form validation, navigation, error display
- [x] apiClient: interceptors, token refresh, logout on 401

### Integration Tests
- [ ] Full login flow (form  auth  navigation)
- [ ] Full signup flow (form  auth  login  navigation)
- [ ] Token refresh flow (401 response  refresh  retry)
- [ ] Logout flow (clear state  navigation to login)

### Manual Testing
- [ ] Login with valid credentials  user dashboard
- [ ] Login with invalid credentials  error message
- [ ] Signup new account  auto-login  user dashboard
- [ ] Role detection:
 - [ ] email with "leader"  LeaderTabs
 - [ ] email with "scout"  ScoutTabs
 - [ ] other email  CustomerTabs
- [ ] Token refresh:
 - [ ] Make authenticated request
 - [ ] Simulate 401 response
 - [ ] Verify token refresh occurs
 - [ ] Verify request retried with new token
- [ ] Logout  navigation to LoginScreen
- [ ] App kill  restore auth state on launch

### Device Testing Matrix
- [ ] iPhone 12 (375pt width)
- [ ] iPhone 14 Pro (393pt width)
- [ ] iPhone 14 Pro Max (430pt width)
- [ ] Android device (375pt+ width)
- [ ] Landscape orientation

### Accessibility Testing
- [ ] Tab order correct on forms
- [ ] Labels associated with inputs
- [ ] Error messages visible and announced
- [ ] Color contrast ratios  4.5:1 for text
- [ ] Touch targets  44pt

---

## Acceptance Criteria

### Core Auth Functionality
- User can register with email/password
- User can login with email/password
- Tokens stored securely (Keychain when available)
- API requests include Bearer token
- Token refresh on 401 response
- User logged out on refresh failure
- App restores auth state on cold launch

### Navigation
- Unauthenticated users see LoginScreen
- Authenticated users see role-based tabs
- Navigation smooth, no flickering
- Switching roles updates tab layout
- Logout returns to LoginScreen

### UI/UX
- Forms validate in real-time
- Errors displayed clearly (red text, bottom of form)
- Loading states show during API calls
- Design tokens applied consistently
- Responsive on 375pt-430pt widths

### Performance
- Login screen loads in < 1 second
- Auth request completes in < 2 seconds
- Navigation transitions smooth (60fps)
- No memory leaks in auth store

### Accessibility
- WCAG 2.1 AA compliant
- Forms keyboard navigable
- Error messages screen-reader announced
- Color contrast  4.5:1

---

## Implementation Roadmap

### Day 1-2: Auth System Foundation (12-16h)
1. **FE#1:** Enhance authStore with SecureStore
 - [ ] Add Keychain integration
 - [ ] Update saveAuth/loadAuth functions
 - [ ] Add error handling for SecureStore failures
 - [ ] Write unit tests (authStore.test.ts)

2. **FE#2:** Verify Navigation
 - [ ] Review RootNavigator implementation
 - [ ] Test role-based switching
 - [ ] Verify tab icons and labels
 - [ ] Manual testing across roles

3. **FE#3:** Design System Audit
 - [ ] Review theme/index.ts tokens
 - [ ] Check Button.tsx component
 - [ ] Check Input.tsx component
 - [ ] Create missing Typography/Card components

### Day 3-4: Testing & Polish (12-18h)
1. **FE#1:** Write Integration Tests
 - [ ] Login flow test
 - [ ] Signup flow test
 - [ ] Token refresh test
 - [ ] Logout test

2. **FE#2:** Auth Screen Testing
 - [ ] Write screen test cases (auth.test.tsx)
 - [ ] Manual device testing (3+ devices)
 - [ ] Accessibility audit
 - [ ] Fix issues found

3. **FE#3:** Polish & Refinement
 - [ ] Update LoginScreen styling if needed
 - [ ] Update SignupScreen styling if needed
 - [ ] Add keyboard-aware scrolling
 - [ ] Performance optimization
 - [ ] Error message improvements

### Day 5: Final Testing & QA (4-6h)
1. **All:** Final Validation
 - [ ] Run full test suite
 - [ ] Manual E2E testing
 - [ ] Device/orientation testing
 - [ ] Accessibility compliance check
 - [ ] Performance profiling

2. **QA:** Acceptance Criteria Review
 - [ ] All checkboxes above verified
 - [ ] Sign-off for next sprint

---

##  Dependencies & Blockers

### Internal Dependencies:
- Design tokens in `src/theme/index.ts` (ready)
- Component library (Button, Input) (ready)
- API client configuration in `src/config/env.ts` (verify)

### External Dependencies:
- Backend `/auth/register` endpoint (needed by Week 1)
- Backend `/auth/login` endpoint (needed by Week 1)
- Backend `/auth/refresh` endpoint (needed by Week 1)

### Potential Blockers:
- SecureStore not available on simulator (has fallback)
- Backend endpoints delayed  use mock auth flag
- Design reviews delayed  proceed with current design

---

## Success Metrics

**Technical:**
- Test coverage  70%
- Zero critical bugs (P0)
-  5 high-priority bugs (P1)
- Login screen < 1s load time
- Auth API < 2s response time

**User Experience:**
- Smooth navigation between auth/app states
- Clear error messaging
- Accessible form interactions
- Responsive on all target devices

**Quality:**
- WCAG 2.1 AA compliance verified
- All tests passing
- No console warnings
- No memory leaks

---

## Related Documentation

- **MVP_COMPLETE_REQUIREMENTS.md** - Full spec reference
- **MVP_DEVELOPMENT_TASKS.md** - Full 16-week roadmap
- **Architecture Guide** - Technical patterns (in docs/)
- **Design System Guide** - Component specs (in design/)
- **API Specifications** - Endpoint docs (in docs/PART-05)

---

## Sign-Off Checklist

Before moving to Sprint 1.2, verify:

- [ ] All unit tests passing (70%+ coverage)
- [ ] All integration tests passing
- [ ] Manual testing on 3+ devices complete
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance targets met (< 2s auth response)
- [ ] Code review passed (2+ reviewers)
- [ ] QA sign-off obtained
- [ ] Product sign-off obtained
- [ ] Zero P0 bugs, 5 P1 bugs

---

**Sprint Status:** INITIATED
**Next Sprint:** 1.2 - Offer Browsing (Week 2)
**Last Updated:** December 26, 2025
**Owner:** Frontend Engineering Lead
