# PHASE 5b: LIVE EXECUTION GUIDE

**Status:**  READY TO BEGIN
**Execution Time:** 2-3 hours
**Test Cases:** 13 comprehensive tests
**Target:** 100% pass rate on all test cases

---

## Quick Start (Choose Your Approach)

### Option 1: Fully Automated Testing (Recommended)
```bash
# If backend is running with test endpoints
cd /Users/macbookpro/Documents/camp-card-mobile-app-v2
npm run test:auth # Runs all auth tests automatically
```

### Option 2: Semi-Automated (Best for Verification)
```bash
# Run specific test scenario
npm run test:mobile-auth # Mobile app tests
npm run test:web-auth # Web portal tests
npm run test:cross-service # Token validation tests
```

### Option 3: Manual Testing (Most Thorough)
Follow the step-by-step guide below for each test case

---

## Mobile App Authentication Tests (4 cases, ~20 minutes)

### Prerequisites
- Mobile app running (expo start)
- iOS Simulator OR Android Emulator open
- Backend running (http://localhost:8080)
- Network connectivity verified

### Test Case 1.1: Basic Login Flow (5 minutes)

**Steps:**
```
1. Launch mobile app
  Verify: Login screen displays

2. Tap email field
  Enter: customer@example.com

3. Tap password field
  Enter: password123

4. Tap "Login" button
  Verify: Loading indicator shows

5. Wait for response
  Expected: <2 seconds response time
  Verify: JWT token received in response

6. Verify user context loads
  Check: User email displayed somewhere
  Check: Navigation updated (menu visible)

7. Navigate to Wallet tab
  Verify: Tab accessible
  Verify: Camp cards display

Result: PASS / FAIL
Notes: _________________
```

### Test Case 1.2: Session Persistence (5 minutes)

**Steps:**
```
1. Ensure logged in (from Test 1.1)
  Verify: Wallet tab active

2. Navigate to another screen
  Go to: Settings or Profile

3. Force close app
  Method: Swipe up (iOS) or back button twice (Android)

4. Wait 3 seconds

5. Re-launch app
  Click: App icon to reopen

6. Verify logged in state
  Check: Wallet accessible immediately
  Check: No login screen shown
  Check: Previous navigation state maintained

7. Optional: Verify token still in secure storage
  Check: App Debugging Tools if available

Result: PASS / FAIL
Notes: _________________
```

### Test Case 1.3: Logout Flow (5 minutes)

**Steps:**
```
1. Ensure logged in
  Verify: Authenticated state

2. Navigate to Settings tab
  Verify: Settings screen loads

3. Look for logout/sign out button
  Expected location: Bottom or menu

4. Tap logout button
  Verify: Confirmation dialog appears (optional)

5. Confirm logout
  Tap: "Confirm" or "Logout"

6. Verify redirected to login
  Check: Login screen displays
  Check: Email field empty
  Check: Can't navigate to Wallet

7. Try to tap back button multiple times
  Verify: Stays at login screen

Result: PASS / FAIL
Notes: _________________
```

### Test Case 1.4: Invalid Credentials (5 minutes)

**Steps:**
```
1. At login screen
  Verify: Fresh login attempt

2. Enter email: customer@example.com
  Check: Field accepts input

3. Enter password: wrongpassword
  Check: Field masks input

4. Tap Login button
  Verify: Loading shows briefly

5. Verify error message
  Expected: "Invalid email or password"
  Check: Clear, readable error text

6. Verify at login screen
  Check: Not navigated away
  Check: Can see both fields
  Check: Email field retained value (for retry)
  Check: Password field cleared

7. Try correct password
  Enter: password123
  Verify: Login succeeds

Result: PASS / FAIL
Notes: _________________
```

---

##  Web Portal Authentication Tests (3 cases, ~20 minutes)

### Prerequisites
- Web portal running (npm run dev, port 3000)
- Chrome/Safari browser open
- Backend running (http://localhost:8080)
- Browser developer tools available (optional)

### Test Case 2.1: Web Portal Login (7 minutes)

**Steps:**
```
1. Navigate to: http://localhost:3000
  Verify: Login page loads

2. Check page title/header
  Expected: "Camp Card" or similar

3. Click email input field
  Enter: scout@example.com

4. Click password input field
  Enter: password123

5. Click "Sign In" button
  Verify: Loading state shows

6. Wait for navigation
  Expected: <2 seconds
  Verify: Redirected to dashboard/home

7. Verify dashboard loads
  Check: Welcome message or user name visible
  Check: Scout-specific content displayed
  Check: Navigation menu visible

Result: PASS / FAIL
Notes: _________________
```

### Test Case 2.2: Session Persistence (7 minutes)

**Steps:**
```
1. On dashboard (from Test 2.1)
  Verify: Logged in state

2. Click on a link in the dashboard
  Example: Scout list, settings, etc.

3. Press F5 or Cmd+R (refresh)
  Browser refreshes page

4. Wait for page reload
  Expected: <3 seconds

5. Verify still on dashboard
  Check: Not redirected to login
  Check: Session cookie exists (DevTools  Application  Cookies)
  Check: nextauth.session-token or similar

6. Verify page loads normally
  Check: No loading spinners stuck
  Check: Data visible

7. Navigate to different page
  Verify: Can navigate normally

Result: PASS / FAIL
Notes: _________________
```

### Test Case 2.3: Protected Routes (6 minutes)

**Steps:**
```
1. First, log out completely
  Click: Logout button in menu
  Verify: Redirected to login

2. In address bar, go directly to: http://localhost:3000/dashboard
  Press: Enter/Return

3. Verify redirected to login
  Check: URL changes to /login or /auth
  Check: Login form displayed
  Check: Error message about protected route (optional)

4. Log in again (scout account)
  Email: scout@example.com
  Password: password123

5. Verify redirected to dashboard
  Check: URL shows /dashboard
  Check: Dashboard content loads

6. Try different protected route
  Example: /settings
  Verify: Can access after login
  Log out again
  Try to access: Still redirected to login

Result: PASS / FAIL
Notes: _________________
```

---

## Cross-Service Token Validation (2 cases, ~15 minutes)

### Prerequisites
- Both mobile app and web portal running
- Backend accessible
- Token inspection tools available (optional: JWT.io in browser)

### Test Case 3.1: Token Validation Across Services (8 minutes)

**Steps:**
```
1. MOBILE: Login as customer
  Email: customer@example.com
  Password: password123
  Verify: Login succeeds

2. MOBILE: Navigate to Wallet
  Verify: Can access protected resource
  Verify: No 401 Unauthorized error
  Check: Data displays (camp cards)

3. WEB: Open new browser window/tab
  Navigate to: http://localhost:3000

4. WEB: Login as scout
  Email: scout@example.com
  Password: password123
  Verify: Login succeeds

5. WEB: Navigate to dashboard
  Verify: Can access protected resource
  Verify: No 401 Unauthorized error
  Check: Data displays

6. BOTH: Make simultaneous requests
  Mobile: Refresh Wallet
  Web: Refresh Dashboard
  Verify: Both succeed (tokens valid)

7. VERIFY: Different tokens, same backend
  Confirm: Mobile token  Web token
  Confirm: Backend accepts both

Result: PASS / FAIL
Notes: _________________
```

### Test Case 3.2: Token Claims Consistency (7 minutes)

**Steps:**
```
1. MOBILE: Get token claims
  After login, token is in localStorage/secure storage
  Option A: Check response in Network tab
  Option B: Use app debugging tools

2. DECODE: Token claims (if visible)
  Look for: sub (subject/email)
  Look for: iat (issued at timestamp)
  Look for: exp (expiration timestamp)
  Look for: roles (array: CUSTOMER)

3. WEB: Check token claims (same way)
  After login, inspect token
  Expected claims: sub, iat, exp, roles

4. COMPARE: Claims between services
  Verify: Both have sub, iat, exp, roles
  Verify: Claim structure identical
  Verify: Role matches user type (CUSTOMER vs SCOUT)

5. VERIFY: Expiration times
  Both tokens should expire at similar time
  Expected: ~1 hour from now
  Verify: exp timestamp reasonable

6. OPTIONAL: Use jwt.io
  Copy mobile token  jwt.io
  Verify: Claims decode correctly
  Copy web token  jwt.io
  Verify: Same structure

Result: PASS / FAIL
Notes: _________________
```

---

##  Token Expiration & Refresh (2 cases, ~15 minutes)

### Test Case 4.1: Automatic Token Refresh (8 minutes)

**Steps:**
```
1. LOGIN: As customer
  Email: customer@example.com
  Verify: Token received

2. NAVIGATE: To Wallet
  Verify: Data loads

3. SIMULATE: Token expiration
  Method A: Wait 1 hour (impractical)
  Method B: Manual test with backend debug endpoint
  Method C: Modify token in DevTools (cut 1 char) to force 401

4. MAKE REQUEST: With "expired" token
  Example: Refresh the Wallet screen
  Expected: 401 Unauthorized initially

5. VERIFY: Automatic refresh triggered
  Check: No visible user interruption
  Check: Loading indicator brief
  Check: Request retried and succeeds

6. VERIFY: New token received
  Check: Response includes new token (in header/body)
  Check: Token different from original

7. VERIFY: Original request succeeds
  Check: Wallet data displays
  Check: No error messages

Result: PASS / FAIL
Notes: _________________
```

### Test Case 4.2: Refresh Token Expiration (7 minutes)

**Steps:**
```
1. SCENARIO: Simulating token older than refresh window
  This requires: Manually deleting refresh token or waiting
  For testing: Contact backend team for test endpoint

2. LOGIN: As customer
  Email: customer@example.com

3. SIMULATE: Both tokens expired (30+ day old session)
  Approach: Clear token, force re-login

4. ATTEMPT: To use app
  Try to access protected resource
  Example: Navigate to Wallet

5. VERIFY: Redirect to login
  Check: Automatically redirected (not forced by error)
  Check: Login form displays
  Check: No confusing error messages

6. LOGIN AGAIN: Fresh login
  Email: customer@example.com
  Password: password123
  Verify: Works normally

7. VERIFY: New tokens issued
  Check: Fresh session created
  Check: Can access all protected routes

Result: PASS / FAIL
Notes: _________________
```

---

##  Security Tests (2 cases, ~10 minutes)

### Test Case 5.1: No Credential Leakage (5 minutes)

**Steps:**
```
1. OPEN: Developer Tools
  Chrome: F12
  Safari: Cmd+Option+I

2. GO TO: Network tab
  Clear requests
  Login with customer account

3. INSPECT: Network requests
  Look for: POST /api/auth/login
  Check: Request body doesn't log password in response
  Check: Password never in URL query string
  Check: HTTPS used (not HTTP)

4. GO TO: Console tab
  Check: No console.log() statements with password/email
  Check: No warnings about credentials

5. GO TO: Application  LocalStorage
  Check: No password stored
  Check: Token stored (normal)
  Check: No sensitive user data

6. GO TO: Application  SessionStorage
  Check: No passwords/credentials

7. VERIFY: Secure Storage (Mobile)
  Check: App uses secure storage
  Verify: Token not in accessible logs

Result: PASS / FAIL
Notes: _________________
```

### Test Case 5.2: CORS & Security Headers (5 minutes)

**Steps:**
```
1. OPEN: DevTools Network tab

2. MAKE REQUEST: From web portal to backend
  Example: GET /api/user/profile
  Log in first (already done)

3. INSPECT: Response headers
  Look for: Access-Control-Allow-Origin
  Expected: http://localhost:3000 (or specific origin)
  Look for: Access-Control-Allow-Credentials
  Expected: true

4. CHECK: Request headers
  Look for: Origin: http://localhost:3000
  Look for: Cookie: (if using cookies)
  Look for: Authorization: Bearer [token]

5. VERIFY: Security headers
  Look for: Content-Security-Policy
  Look for: X-Content-Type-Options
  Look for: X-Frame-Options

6. TEST: Cross-origin (different domain)
  Try to make request from: http://localhost:3001 (different port)
  Verify: Request blocked or rejected
  Check: CORS error in console

Result: PASS / FAIL
Notes: _________________
```

---

## Results Summary Template

**Total Test Cases:** 13
**Passed:** ___/13
**Failed:** ___/13
**Pass Rate:** ___%

### By Scenario

| Scenario | Cases | Passed | Status |
|----------|-------|--------|--------|
| Mobile Auth | 4 | ___/4 | // |
| Web Auth | 3 | ___/3 | // |
| Cross-Service | 2 | ___/2 | // |
| Token Refresh | 2 | ___/2 | // |
| Security | 2 | ___/2 | // |

### Success Criteria

- 100% test cases pass (13/13)
- <2 second response times
- No app crashes
- No console errors
- Smooth navigation
- Tokens working across services

### Issues Found

_List any failures, errors, or unexpected behavior_

---

##  Next Steps After Phase 5b

1. Document all results
2. Calculate final pass rate
3.  **Phase 5c:** Load & Performance Testing (2-3 hours)
4.  **Phase 5d:** Database Validation (1-2 hours)
5.  **Phase 5e:** Cache Layer Testing (1 hour)
6.  **Phase 5f:** Message Queue Testing (1-2 hours)
7.  **Phase 5g:** Regression Testing (1-2 hours)
8.  **Phase 5h:** Final Reporting & Certification

---

**Status:**  READY FOR EXECUTION
**Estimated Duration:** 2-3 hours for all 13 test cases
**Target:** 90%+ pass rate (12/13 cases)
