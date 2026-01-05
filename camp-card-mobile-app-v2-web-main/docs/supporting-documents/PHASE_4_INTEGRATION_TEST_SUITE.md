# PHASE 4: INTEGRATION TEST SUITE
## Camp Card Mobile App v2 - User Flow Validation

**Date:** December 28, 2025
**Environment:** Development (Expo + Backend Running)
**Status:** TEST SUITE READY FOR EXECUTION

---

## USER FLOW TEST SCENARIOS

### Flow 1: Customer Login  Wallet  Copy Code
**Objective:** Verify complete customer referral flow
**Expected Time:** 2 minutes
**Devices:** iOS/Android Simulator or Physical Device

```
STEPS:
1. Launch app  Login screen displays
2. Enter: Email "customer@campcard.com"
3. Enter: Password "TestPass123!"
4. Tap: Login button
5. Expected: Navigate to Customer Dashboard
6. Tap: Wallet tab (bottom nav)
7. Expected: Wallet screen loads with card
8. Locate: "Copy Code" button
9. Tap: Copy Code button
10. Expected: Alert "Success - code copied"
11. Dismiss: Alert
12. Expected: Referral code still visible

VERIFICATION:
 Login succeeds
 Navigation works
 Wallet loads quickly
 Card displays properly
 Copy button responsive
 Alert shows success
```

---

### Flow 2: Scout Login  Dashboard  Invite Scouts
**Objective:** Verify scout invitation/sharing flow
**Expected Time:** 2 minutes
**Devices:** iOS/Android Simulator or Physical Device

```
STEPS:
1. Launch app  Login screen displays
2. Enter: Email "scout@campcard.com"
3. Enter: Password "TestPass123!"
4. Tap: Login button
5. Expected: Navigate to Scout Dashboard
6. Expected: Dashboard shows stats
7. Tap: Invite/Share button
8. Expected: Share options appear
9. Select: SMS or Email option
10. Expected: Native share dialog
11. Cancel: Share dialog
12. Expected: Return to Dashboard

VERIFICATION:
 Scout login succeeds
 Dashboard loads with data
 Stats display correctly
 Share button functional
 Share options available
 Dialog appears/closes properly
```

---

### Flow 3: Leader Login  Scouts  Card Flip
**Objective:** Verify leader card flip animation
**Expected Time:** 2 minutes
**Devices:** iOS/Android Simulator or Physical Device

```
STEPS:
1. Launch app  Login screen displays
2. Enter: Email "leader@campcard.com"
3. Enter: Password "TestPass123!"
4. Tap: Login button
5. Expected: Navigate to Leader Home
6. Tap: Wallet tab (or similar)
7. Expected: Wallet screen loads with card
8. Tap: Card or "Flip" button
9. Expected: Card flips smoothly
10. Observe: Animation is fluid (no jank)
11. Tap: Card again to flip back
12. Expected: Card returns to original side

VERIFICATION:
 Leader login succeeds
 Navigation correct
 Card renders properly
 Flip animation smooth
 Animation completes fully
 Animation repeatable
 No visual artifacts
```

---

### Flow 4: Login  Forgot Password  Reset
**Objective:** Verify forgot password flow
**Expected Time:** 2 minutes
**Devices:** iOS/Android Simulator or Physical Device

```
STEPS:
1. Launch app  Login screen displays
2. Tap: "Forgot Password?" link
3. Expected: Forgot Password screen loads
4. Enter: Email "customer@campcard.com"
5. Tap: "Send Reset Link" button
6. Expected: Loading indicator appears
7. Expected: Success message shows
8. Message: "Check your email..."
9. Tap: "Back to Login" button
10. Expected: Return to Login screen

VERIFICATION:
 Navigation to ForgotPassword works
 Email input accepts text
 Submit button functional
 Loading state shows
 Success confirmation displays
 Proper messaging shown
 Navigation back works
```

---

### Flow 5: All Bottom Tab Navigation
**Objective:** Verify tab switching across all roles
**Expected Time:** 1 minute per role
**Devices:** iOS/Android Simulator or Physical Device

```
CUSTOMER TABS (Tap each):
 Dashboard - Stats visible
 Offers - Offers list loads
 Wallet - Card displays
 Settings - Account info shows

SCOUT TABS (Tap each):
 Home - Stats visible
 Dashboard - Details show
 Scouts - List loads
 Wallet - Card displays
 Settings - Account info shows

LEADER TABS (Tap each):
 Home - Overview visible
 Scouts - Members list loads
 Wallet - Card displays
 Settings - Account info shows
```

---

##  API INTEGRATION VERIFICATION

### Login API Test
```
Endpoint: POST /auth/login
Request: {
 "email": "customer@campcard.com",
 "password": "TestPass123!"
}

Expected Response:
 Status 200
 Contains access_token
 Contains user object
 User has role field
 User has email field

Test Result: [ ] PASS [ ] FAIL
```

### Dashboard API Test
```
Endpoint: GET /api/dashboard
Headers: Authorization: Bearer {token}

Expected Response:
 Status 200
 Contains user stats
 Contains referral data
 Contains wallet info

Test Result: [ ] PASS [ ] FAIL
```

### Referral Code API Test
```
Endpoint: GET /api/referral/code
Headers: Authorization: Bearer {token}

Expected Response:
 Status 200
 Contains code field
 Code format: REF-XXXX
 Contains share URLs

Test Result: [ ] PASS [ ] FAIL
```

### Password Reset API Test
```
Endpoint: POST /users/password-reset/request
Request: { "email": "customer@campcard.com" }

Expected Response:
 Status 200 or 201
 Contains success message
 Email sent confirmation

Test Result: [ ] PASS [ ] FAIL
```

---

## PERFORMANCE BENCHMARKS

### Load Time Measurements
```
App Startup:
Expected: < 3 seconds
Measurement: _____ seconds
Result: [ ] PASS [ ] FAIL

Login Flow:
Expected: < 2 seconds
Measurement: _____ seconds
Result: [ ] PASS [ ] FAIL

Tab Switching:
Expected: < 300ms
Measurement: _____ ms
Result: [ ] PASS [ ] FAIL

Card Flip:
Expected: < 500ms
Measurement: _____ ms
Result: [ ] PASS [ ] FAIL
```

---

## ERROR HANDLING TESTS

### Test: Network Offline
```
Setup: Disconnect device from network
Action: Tap any button that makes API call
Expected: Error message, not crash
Result: [ ] PASS [ ] FAIL
```

### Test: Invalid Credentials
```
Setup: Login screen
Action: Enter wrong password
Expected: "Login failed" error message
Result: [ ] PASS [ ] FAIL
```

### Test: API Timeout
```
Setup: Slow network simulator
Action: Submit login
Expected: Timeout message or retry
Result: [ ] PASS [ ] FAIL
```

### Test: Empty Inputs
```
Setup: Login screen
Action: Tap login without entering email
Expected: "Email is required" validation
Result: [ ] PASS [ ] FAIL
```

---

## UI/UX VERIFICATION

### Visual Regression Tests
```
Login Screen:
 Logo size correct
 Colors use theme
 Spacing consistent
 Typography readable
 Input fields accept text
 Button responds to tap

Wallet Screen:
 Card renders correctly
 Card text visible
 Buttons positioned well
 Icons render
 Copy button has icon
 Flip button responsive

Settings Screen:
 User info displays
 Menu items listed
 Logout button visible
 All options clickable
```

### Responsive Design Tests
```
Portrait Mode:
 Content fits screen
 No horizontal scroll
 Bottom nav visible
 All buttons accessible

Landscape Mode:
 Content fits screen
 No vertical scroll
 Layout adjusts
 Navigation accessible
```

---

## TEST EXECUTION CHECKLIST

### Pre-Test Setup
- [ ] Device/Simulator prepared
- [ ] App installed or running
- [ ] Backend API running on :8080
- [ ] Expo dev server on :8081
- [ ] Network connectivity verified
- [ ] Test accounts created

### Test Execution
- [ ] Flow 1: Customer complete
- [ ] Flow 2: Scout complete
- [ ] Flow 3: Leader complete
- [ ] Flow 4: Forgot Password complete
- [ ] Flow 5: Tab navigation complete
- [ ] API tests complete
- [ ] Performance measured
- [ ] Error handling tested
- [ ] UI/UX verified

### Post-Test
- [ ] All results documented
- [ ] Issues logged (if any)
- [ ] Performance baseline recorded
- [ ] Screenshots captured
- [ ] Test report generated

---

## TEST RESULTS TEMPLATE

### Test Case: [Name]
```
Status: [ ] PASS [ ] FAIL
Device: [iPhone/Android/Simulator]
Duration: _____ seconds
Error (if any): _____________________

Observations:
- Point 1: _________________________
- Point 2: _________________________
- Point 3: _________________________

Fix Needed: [ ] Yes [ ] No
Priority: [ ] High [ ] Medium [ ] Low
Assigned To: _____________________
```

---

## SUCCESS CRITERIA

### All Flows Must Pass
- Customer login to wallet  copy code
- Scout login to dashboard  invite
- Leader login to wallet  flip card
- Forgot password flow complete
- All tab navigation working

### API Integration
- All endpoints respond
- No 500 errors
- Data returns correctly
- Authentication working

### Performance
- App < 3s startup
- Navigation < 300ms
- API < 2s response
- No visual stuttering

### UI/UX Quality
- No visual bugs
- Responsive design
- Consistent theming
- Smooth animations

---

## SUMMARY METRICS

| Test | Target | Actual | Status |
|------|--------|--------|--------|
| Login Success | 100% | ___% | [ ] |
| Tab Navigation | 100% | ___% | [ ] |
| Wallet Display | 100% | ___% | [ ] |
| Copy Function | 100% | ___% | [ ] |
| Flip Animation | 100% | ___% | [ ] |
| API Responses | 100% | ___% | [ ] |
| Error Handling | 100% | ___% | [ ] |
| Performance | 95%+ | ___% | [ ] |

---

## NOTES & ISSUES FOUND

### Issue #1: [If any]
```
Description: ___________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Steps to Reproduce: ______________
Expected: __________________
Actual: __________________
Fix: __________________
```

---

**Test Date:** December 28, 2025
**Tester:** QA Specialist
**Environment:** Development
**Status:** READY FOR EXECUTION

Next Phase: Execute tests and report results
