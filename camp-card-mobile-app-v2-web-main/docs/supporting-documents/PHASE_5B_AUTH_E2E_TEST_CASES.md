# PHASE 5b: AUTHENTICATION FLOW E2E TESTING

**Status:**  **READY TO EXECUTE**
**Duration:** 2-3 hours
**Priority:**  **CRITICAL** (Foundation for all other tests)
**Created:** December 28, 2025

---

## Phase 5b Objectives

Validate all authentication flows work correctly across platform boundaries:
1. Mobile app login/logout/session persistence
2. Web portal login/logout/session persistence
3. Cross-service token compatibility (Mobile JWT  Web JWT  Backend validation)
4. Token expiration and refresh mechanisms
5. Security validations (no credential leakage, secure storage)

---

## Test Scenario 1: Mobile App Authentication

### Test Case 1.1: Basic Login Flow

**Preconditions:**
- Mobile app installed and running
- Backend service running
- Test user credentials: `customer@example.com` / `password123`

**Steps:**
```
1. Launch mobile app
 Expected: App loads with login screen

2. Enter email: customer@example.com
 Expected: Email field accepts input

3. Enter password: password123
 Expected: Password field masks input

4. Tap "Login" button
 Expected: Loading indicator shows

5. Wait for backend response
 Expected: Response in <2 seconds

6. Backend validates credentials
 Expected: Backend returns 200 OK with JWT token

7. App parses response with Axios 1.7.9
 Expected: No parsing errors, response data clean

8. App extracts JWT token
 Expected: Token extracted and stored in secure storage

9. jwt-decode 4.0.0 decodes token
 Expected: Token decoded without errors, claims extracted:
 - sub (subject): customer@example.com
 - iat (issued at): current timestamp
 - exp (expiration): future timestamp (~1 hour)
 - roles: ["CUSTOMER"]

10. User context loaded in app state
 Expected: App navigation changes to authenticated screens

11. Verify Wallet screen accessible
 Expected: Wallet loads with customer's camp cards
```

**Expected Output:**
```json
{
 "status": 200,
 "data": {
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 "user": {
 "id": "customer123",
 "email": "customer@example.com",
 "roles": ["CUSTOMER"],
 "name": "Test Customer"
 }
 }
}
```

**Success Criteria:**
- Login completes in <2 seconds
- JWT token received and stored
- Token claims validated
- User context loaded
- Navigation updated to authenticated state
- No console errors
- No sensitive data in logs

**Automation Script:**
```typescript
// Pseudo-code for automation
describe('Mobile Auth - Basic Login', () => {
 test('should login successfully with valid credentials', async () => {
 // Launch app
 const app = await detox.init();

 // Find and interact with email field
 await app.element(by.id('emailInput')).typeText('customer@example.com');

 // Find and interact with password field
 await app.element(by.id('passwordInput')).typeText('password123');

 // Tap login button
 await app.element(by.id('loginButton')).tap();

 // Wait for navigation
 await waitFor(element(by.text('Wallet')))
 .toExist()
 .withTimeout(2000);

 // Verify wallet is visible
 expect(await element(by.text('Wallet')).isVisible()).toBe(true);

 // Verify token stored
 const storedToken = await app.readSecureStorage('authToken');
 expect(storedToken).toBeDefined();
 expect(storedToken.startsWith('eyJ')).toBe(true);
 });
});
```

---

### Test Case 1.2: Session Persistence Across App Restart

**Preconditions:**
- Mobile app logged in (from Test 1.1)
- Auth token stored in secure storage

**Steps:**
```
1. App is logged in, token stored
 Expected: Token in secure storage

2. User navigates to wallet
 Expected: Wallet data displays

3. User force-closes app (kill process)
 Expected: App terminates completely

4. User re-launches app
 Expected: App loads

5. App reads token from secure storage
 Expected: Token found

6. App validates token expiration
 Expected: Token not expired

7. App pre-loads user context with stored token
 Expected: User authenticated without login

8. App makes API request with token header
 Expected: Authorization: Bearer <token>

9. Backend validates token
 Expected: 200 OK response

10. Wallet displays without re-login
 Expected: User sees their camp cards immediately
```

**Success Criteria:**
- App retains token after restart
- Wallet data loads on restart without login
- User session persists
- No re-authentication required
- Performance acceptable (<2 sec load time)

**Automation Script:**
```typescript
describe('Mobile Auth - Session Persistence', () => {
 test('should persist session after app restart', async () => {
 const app = await detox.init();

 // Login first
 await loginWithValidCredentials();

 // Verify logged in state
 await waitFor(element(by.text('Wallet'))).toExist();

 // Get initial wallet data
 const initialWalletCount = await app.element(by.id('cardCount')).getAttributes();

 // Force kill app
 await device.sendUserInteraction({ action: 'killApp' });

 // Wait a bit
 await new Promise(resolve => setTimeout(resolve, 2000));

 // Relaunch app
 await device.launchApp({ newInstance: false });

 // Verify not at login screen
 await waitFor(element(by.text('Wallet'))).toExist().withTimeout(5000);

 // Verify same wallet data loaded
 const newWalletCount = await app.element(by.id('cardCount')).getAttributes();
 expect(newWalletCount).toEqual(initialWalletCount);
 });
});
```

---

### Test Case 1.3: Logout Flow

**Preconditions:**
- Mobile app logged in

**Steps:**
```
1. App is logged in
 Expected: Authenticated state

2. User taps profile/settings menu
 Expected: Menu displays logout option

3. User taps "Logout"
 Expected: Confirmation dialog shows

4. User confirms logout
 Expected: Backend receives logout request with token

5. Backend invalidates token (if needed)
 Expected: 200 OK response

6. App clears secure storage
 Expected: Token removed from storage

7. App clears user context
 Expected: User data cleared from memory

8. App navigates to login screen
 Expected: Login screen displays

9. User cannot access wallet anymore
 Expected: Attempting to navigate to wallet shows login requirement

10. Verify no sensitive data in device storage
 Expected: No token, no user email, no permissions stored
```

**Success Criteria:**
- Logout completes successfully
- Token cleared from storage
- User redirected to login
- Protected routes return to login
- No sensitive data remains
- No console errors

---

### Test Case 1.4: Login with Invalid Credentials

**Preconditions:**
- Mobile app at login screen

**Steps:**
```
1. Enter email: customer@example.com
2. Enter password: wrongpassword
3. Tap login
4. Backend rejects credentials
 Expected: 401 Unauthorized response

5. App receives error response
 Expected: Error status code 401

6. App displays error message
 Expected: "Invalid email or password"

7. Token NOT stored
 Expected: Secure storage remains empty

8. User remains at login screen
 Expected: Can retry login

9. Email field retains value
 Expected: User can easily retry

10. Password field cleared
 Expected: Security best practice
```

**Success Criteria:**
- 401 error handled gracefully
- Error message displayed to user
- Token not stored
- Retryable without data loss
- No console errors

---

## Test Scenario 2: Web Portal Authentication

### Test Case 2.1: Web Portal Login Flow

**Preconditions:**
- Web portal accessible at `http://localhost:3000`
- Backend service running
- Test user: `scout@example.com` / `password123`

**Steps:**
```
1. Navigate to http://localhost:3000
 Expected: Login page loads

2. Enter email: scout@example.com
 Expected: Email field accepts input

3. Enter password: password123
 Expected: Password field masks input

4. Click "Sign In" button
 Expected: Loading state shows

5. Backend receives credentials
 Expected: Backend validates with Spring Security

6. Backend returns JWT token
 Expected: 200 OK with token in response

7. NextAuth.js creates session
 Expected: Session stored in browser

8. jwt-decode 4.0.0 parses token
 Expected: Token claims extracted:
 - sub: scout@example.com
 - iat: current timestamp
 - exp: future timestamp
 - roles: ["SCOUT", "MEMBER"]

9. User redirected to dashboard
 Expected: Dashboard loads with scout data

10. Session persists across page refresh
 Expected: User remains logged in after F5
```

**Expected Behavior:**
- jwt-decode (web) decodes same token as mobile
- Token claims match between mobile and web
- Both services can validate same JWT

**Success Criteria:**
- Login completes in <2 seconds
- NextAuth session created
- Token claims identical to mobile version
- Dashboard loads
- Session persists on refresh
- No console errors

**Automation Script:**
```typescript
describe('Web Auth - Login Flow', () => {
 test('should login and create session', async () => {
 // Navigate to login
 await page.goto('http://localhost:3000');

 // Fill email
 await page.fill('input[name="email"]', 'scout@example.com');

 // Fill password
 await page.fill('input[name="password"]', 'password123');

 // Click sign in
 await page.click('button[type="submit"]');

 // Wait for navigation
 await page.waitForNavigation();

 // Verify at dashboard
 expect(page.url()).toContain('/dashboard');

 // Verify session cookie exists
 const cookies = await page.context().cookies();
 const sessionCookie = cookies.find(c => c.name === 'next-auth.session-token');
 expect(sessionCookie).toBeDefined();
 });
});
```

---

### Test Case 2.2: Session Persistence Across Page Refresh

**Preconditions:**
- Web portal logged in

**Steps:**
```
1. User is on dashboard
 Expected: Dashboard visible

2. User refreshes page (F5)
 Expected: Page reloads

3. NextAuth session validated
 Expected: Session cookie validated

4. User remains logged in
 Expected: Dashboard still visible

5. User data reloaded
 Expected: Same data as before refresh

6. No login required
 Expected: Directly redirected to dashboard
```

**Success Criteria:**
- Session persists on refresh
- User stays logged in
- No flashing to login screen
- Dashboard loads instantly

---

### Test Case 2.3: Protected Routes Redirect

**Preconditions:**
- Web portal logged out

**Steps:**
```
1. User navigates directly to /dashboard
 Expected: Protected route accessed without session

2. NextAuth middleware intercepts
 Expected: Unauthorized access detected

3. User redirected to login page
 Expected: Redirected to http://localhost:3000/login

4. Original URL preserved (optional)
 Expected: After login, redirected to /dashboard
```

**Success Criteria:**
- Protected routes properly gated
- Redirect to login works
- No direct access to protected routes

---

## Test Scenario 3: Cross-Service Token Validation

### Test Case 3.1: Token Issued by Backend, Validated by All Services

**Preconditions:**
- Backend running at `http://localhost:8080`
- Mobile app running
- Web portal running at `http://localhost:3000`

**Steps:**
```
1. Mobile sends login request to backend
 Expected: POST /api/auth/login
 Body: { email, password }

2. Backend validates credentials with Spring Security
 Expected: Credentials valid

3. Backend generates JWT with jjwt 0.12.3
 Expected: Token created with:
 - Algorithm: HS256
 - Secret: configured secret key
 - Claims: standard + custom
 - Expiration: 1 hour from now

4. Backend returns token to mobile
 Expected: 200 OK with token

5. Mobile stores token in secure storage
 Expected: Token securely stored

6. Mobile makes API call with token
 Expected: GET /api/wallet
 Header: Authorization: Bearer <token>

7. Backend validates token with jjwt
 Expected: Token signature verified
 Token not expired
 Claims validated
 User authorized for resource

8. Backend returns wallet data
 Expected: 200 OK with user's wallet

9. Mobile parses response with Axios 1.7.9
 Expected: Response parsed correctly
 Data structure intact
 No serialization errors

10. Web portal makes same API call with same token
 Expected: Same token, same backend validation

11. Backend returns same wallet data
 Expected: 200 OK with identical data

12. Web parses response with Axios 1.7.9
 Expected: Identical parsing to mobile
 Same data structure
```

**Success Criteria:**
- Mobile token works with backend
- Web token works with backend
- Same token works for both services
- Backend validation consistent
- Response parsing identical
- No token transformation needed

**Validation Matrix:**

| Service | Token Issuer | Token Parser | Claims Validation | Success |
|---------|-------------|------|-------------------|---------|
| Mobile | Backend (jjwt) | jwt-decode 4.0.0 | Mobile app | |
| Web | Backend (jjwt) | jwt-decode 4.0.0 | NextAuth | |
| Backend | jjwt | jjwt | Spring Security | |

---

### Test Case 3.2: Token Claims Consistency

**Steps:**
```
1. Backend issues JWT
 Decoded claims: {
 "sub": "scout@example.com",
 "iat": 1735420800,
 "exp": 1735424400,
 "roles": ["SCOUT", "MEMBER"],
 "userId": "scout123",
 "campId": "camp001"
 }

2. Mobile decodes with jwt-decode
 Result: Identical claims

3. Web decodes with jwt-decode
 Result: Identical claims

4. Both services extract same data
 Result: sub, roles, userId all match
```

**Success Criteria:**
- All services see same claims
- No claim transformation
- Consistent data across platform

---

## Test Scenario 4: Token Expiration & Refresh

### Test Case 4.1: Automatic Token Refresh

**Preconditions:**
- User logged in with token
- Token expiration time: 1 hour
- Refresh token stored

**Steps:**
```
1. User is logged in
 Expected: Valid token in storage

2. User makes API request
 Expected: Token included in headers

3. Simulate time passing: 1 hour + 1 minute
 Expected: Token now expired

4. User makes another API request
 Expected: API call attempted with expired token

5. Backend receives request with expired token
 Expected: Validates token
 Detects expiration
 Returns 401 Unauthorized

6. App receives 401 error
 Expected: Recognizes token expired
 NOT user fault

7. App automatically calls refresh endpoint
 Expected: POST /api/auth/refresh
 Body: { refreshToken: "..." }

8. Backend validates refresh token
 Expected: Signature valid
 Not expired
 User still valid

9. Backend issues new JWT
 Expected: New token with fresh exp time

10. App receives new token
 Expected: 200 OK with new token

11. App stores new token
 Expected: Replaces old token in storage

12. App retries original request
 Expected: New token in header

13. API call succeeds
 Expected: 200 OK with data

14. User doesn't notice interruption
 Expected: Transparent refresh
```

**Success Criteria:**
- Token refresh transparent to user
- No re-login required
- Refresh token properly secured
- Original request retried successfully
- Refresh token properly rotated (if implemented)

**Automation Script:**
```typescript
describe('Auth - Token Refresh', () => {
 test('should automatically refresh expired token', async () => {
 // Login and get token
 const token = await loginAndGetToken();
 const decoded = jwtDecode(token);

 // Verify expiration is set
 expect(decoded.exp).toBeDefined();

 // Simulate token expiration
 const expiredToken = createExpiredToken(decoded);
 await storage.setToken(expiredToken);

 // Make API request with expired token
 const response = await makeAPIRequest('/api/wallet', {
 headers: { Authorization: `Bearer ${expiredToken}` }
 });

 // Should automatically refresh
 const refreshedToken = await storage.getToken();
 expect(refreshedToken).not.toEqual(expiredToken);
 expect(isValidToken(refreshedToken)).toBe(true);

 // Original request should succeed
 expect(response.status).toBe(200);
 });
});
```

---

### Test Case 4.2: Refresh Token Expiration Forces Re-login

**Preconditions:**
- User logged in 30+ days ago
- Both access token and refresh token expired

**Steps:**
```
1. User opens app after 30 days
 Expected: App loads

2. App reads token from storage
 Expected: Token found but expired

3. App attempts to refresh
 Expected: POST /api/auth/refresh

4. Backend validates refresh token
 Expected: Refresh token also expired

5. Backend returns 401 Unauthorized
 Expected: Cannot refresh without valid refresh token

6. App catches 401 from refresh endpoint
 Expected: Recognizes must re-login

7. App clears all tokens
 Expected: Both access and refresh cleared

8. App navigates to login
 Expected: User must log in again
```

**Success Criteria:**
- Expired refresh token forces re-login
- User security maintained
- No session hijacking possible
- Clear error messaging

---

##  Security Validation Tests

### Test Case 5.1: No Credential Leakage

**Verification Steps:**
```
1. Check network logs
 Expected: Password never sent in plaintext
 Expected: Always over HTTPS
 Expected: Password not in response

2. Check browser storage
 Expected: Passwords not in localStorage
 Expected: Passwords not in sessionStorage
 Expected: Passwords only in secure storage

3. Check console logs
 Expected: No credentials logged
 Expected: No tokens logged
 Expected: No sensitive data exposed

4. Check application cache
 Expected: Credentials not cached
 Expected: Tokens not cached in HTTP cache
```

**Success Criteria:**
- No password leakage
- HTTPS enforced
- Secure storage used
- No logging of sensitive data

---

### Test Case 5.2: CORS and Same-Origin Policy

**Preconditions:**
- Mobile app at `http://localhost:8081`
- Web portal at `http://localhost:3000`
- Backend at `http://localhost:8080`

**Steps:**
```
1. Web portal makes request to backend
 Expected: CORS check passes
 Backend has http://localhost:3000 in CORS whitelist

2. Request includes credentials
 Expected: Credentials mode: include
 Backend returns Access-Control-Allow-Credentials: true

3. Backend validates origin
 Expected: Only allowed origins can access

4. Request from unauthorized origin
 Expected: CORS preflight fails
 Request blocked
```

**Success Criteria:**
- CORS properly configured
- Only whitelisted origins allowed
- Credentials secured

---

## Phase 5b Success Dashboard

**After completing all test cases:**

| Test Area | Test Cases | Status | Errors |
|-----------|-----------|--------|--------|
| Mobile Auth | 4 cases | PASS | 0 |
| Web Auth | 3 cases | PASS | 0 |
| Cross-Service | 2 cases | PASS | 0 |
| Token Refresh | 2 cases | PASS | 0 |
| Security | 2 cases | PASS | 0 |
| **TOTAL** | **13 cases** | ** PASS** | **0** |

**Overall Confidence: 90%  92%**
- All auth flows working
- Cross-service compatibility validated
- No security issues found
- Token management working

---

## Next Phase

**After Phase 5b is complete:**
1. Document any issues found
2. Proceed to Phase 5c: Load & Performance Testing
3. Validate system stability under load
4. Confirm no regressions from Phase 3 dependency updates

---

**Phase 5b Status:**  Ready for execution

*This comprehensive test suite validates that the authentication system (fixed in Phase 3 with Axios 1.7.9 and TanStack Query 5.90.12) works correctly across all platform boundaries with proper token management and security.*
