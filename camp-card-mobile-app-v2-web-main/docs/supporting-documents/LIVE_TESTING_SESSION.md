# LIVE TESTING SESSION - December 28, 2025

## APP STATUS
- **Expo Server**: Running on port 8084
- **Status**: Ready for testing
- **Available Commands**: Press `i` (iOS), `a` (Android), or `w` (web)

---

## TESTING SESSION CHECKLIST

### PHASE 1: CUSTOMER ACCOUNT TESTING (5-10 minutes)

#### Pre-Test Setup
- [ ] App loads successfully
- [ ] Console shows no red errors
- [ ] Login screen displays

#### Login
- [ ] Email field: Type `customer@example.com`
- [ ] Password field: Type `password123`
- [ ] Tap "Login" button
- [ ] Expected: Dashboard/Wallet loads

#### Wallet Screen - Referral System Tests

**Button 1: Copy Referral Code**
- Location: "Refer Friends" section  [] icon next to code
- Action: Tap copy button
- Expected:
 - [ ] Visual feedback (button press)
 - [ ] Alert appears with "Copied!" message
 - [ ] No console errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 2: Share Referral Link**
- Location: Blue button "Share Referral Link"
- Action: Tap button
- Expected:
 - [ ] Button shows loading state briefly
 - [ ] Native share sheet opens
 - [ ] Can select platform (Messages, Email, etc.)
 - [ ] Returns to Wallet after selection
 - [ ] No error alerts
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 3: View Referral History**
- Location: Gray/outlined button "View Referral History"
- Action: Tap button
- Expected:
 - [ ] Visual feedback
 - [ ] Navigates to new screen
 - [ ] Loading spinner appears briefly
 - [ ] History list displays (or empty state)
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 4: Back (on History Screen)**
- Location: Top-left arrow
- Action: Tap back button
- Expected:
 - [ ] Returns to Wallet smoothly
 - [ ] No lag or blank screens
 - [ ] Wallet state preserved
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Customer Summary
- Total buttons tested: __ / 4
- Buttons passed: __
- Buttons failed: __
- Console errors: Yes / No
- App crashed: Yes / No
- **Phase 1 Result**:  PASS  FAIL

---

### PHASE 2: SCOUT ACCOUNT TESTING (10-15 minutes)

#### Pre-Test Setup
- [ ] Logout from Customer account
- [ ] Tap "Sign Out" or navigate to Settings  Sign Out
- [ ] Confirm logout

#### Login
- [ ] Email: `scout@example.com`
- [ ] Password: `password123`
- [ ] Tap Login
- [ ] Expected: Scout tabs appear (Home, Share, Settings)

#### Scout Home Screen Tests

**Button 1: Share Scout Link**
- Location: Red/colored button on Home dashboard
- Action: Tap button
- Expected:
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] Can select platform
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Scout Share Screen Tests

**Button 2: Copy Scout Code**
- Location: Share tab  [] icon next to code (SCOUT-{id})
- Action: Tap copy
- Expected:
 - [ ] Alert appears
 - [ ] Indicates copied successfully
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 3: Share Button**
- Location: Blue "Share" button on Share screen
- Action: Tap button
- Expected:
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Scout Settings Screen Tests

**Button 4: Push Notifications Toggle**
- Location: Settings tab  First toggle switch
- Action: Tap toggle ON/OFF
- Expected:
 - [ ] Toggle animates smoothly
 - [ ] Toggle briefly disables (grayed)
 - [ ] API call completes (1-2 seconds)
 - [ ] Toggle re-enables
 - [ ] State persists (stays ON or OFF)
 - [ ] No error alert
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 5: Location Sharing Toggle**
- Location: Settings tab  Second toggle
- Action: Tap toggle
- Expected: Same as Button 4
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 6: Marketing Emails Toggle**
- Location: Settings tab  Third toggle
- Action: Tap toggle
- Expected: Same as Button 4
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 7: Export Report**
- Location: Settings tab  "Export Report" button
- Action: Tap button
- Expected:
 - [ ] Button doesn't crash app
 - [ ] No error alert
 - [ ] (Full functionality not required yet)
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 8: View Analytics**
- Location: Settings tab  "View Analytics" button
- Action: Tap button
- Expected:
 - [ ] Button doesn't crash app
 - [ ] No error alert
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 9: Sign Out**
- Location: Red button at bottom of Settings
- Action: Tap button
- Expected:
 - [ ] Confirmation alert appears
 - [ ] Alert has "Cancel" and "Sign Out" options
 - [ ] Tap Cancel  returns to Settings
 - [ ] Tap Sign Out  logout completes
 - [ ] Redirects to Login screen
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Scout Summary
- Total buttons tested: __ / 9
- Buttons passed: __
- Buttons failed: __
- Console errors: Yes / No
- App crashed: Yes / No
- **Phase 2 Result**:  PASS  FAIL

---

### PHASE 3: LEADER ACCOUNT TESTING (10-15 minutes)

#### Pre-Test Setup
- [ ] Logout from Scout account
- [ ] Return to Login screen

#### Login
- [ ] Email: `leader@example.com`
- [ ] Password: `password123`
- [ ] Tap Login
- [ ] Expected: Leader tabs appear (Home, Scouts, Share, Settings)

#### Leader Home Screen Tests

**Button 1: Share Troop Link**
- Location: Red button on Home dashboard
- Action: Tap button
- Expected:
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 2: Manage Scouts**
- Location: Outlined button on Home dashboard
- Action: Tap button
- Expected:
 - [ ] Navigates to Scouts screen
 - [ ] Scout list displays
 - [ ] Each scout shows name, email, status, stats
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Leader Scouts Screen Tests

**Button 3: Back Button**
- Location: Top-left on Scouts screen
- Action: Tap back
- Expected:
 - [ ] Returns to Home
 - [ ] Smooth transition
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 4: Invite New Scout**
- Location: Top of Scouts list
- Action: Tap button
- Expected:
 - [ ] Button doesn't crash app
 - [ ] No error
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Leader Share Screen Tests

**Button 5: Copy Troop Code**
- Location: Share tab  [] icon next to code (TROOP-{id})
- Action: Tap copy
- Expected:
 - [ ] Alert appears
 - [ ] Copied successfully indicated
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 6: Share Button**
- Location: Blue "Share" button on Share screen
- Action: Tap button
- Expected:
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] No errors
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Leader Settings Screen Tests

**Button 7: Push Notifications Toggle**
- Location: Settings tab  First toggle
- Action: Tap toggle
- Expected: Same behavior as Scout settings
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 8: Location Sharing Toggle**
- Location: Settings tab  Second toggle
- Action: Tap toggle
- Expected: Same behavior
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 9: Marketing Emails Toggle**
- Location: Settings tab  Third toggle
- Action: Tap toggle
- Expected: Same behavior
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 10: Export Report**
- Location: Settings tab  "Export Report" button
- Action: Tap button
- Expected:
 - [ ] Button doesn't crash app
 - [ ] No error
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 11: View Analytics**
- Location: Settings tab  "View Analytics" button
- Action: Tap button
- Expected:
 - [ ] Button doesn't crash app
 - [ ] No error
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

**Button 12: Sign Out**
- Location: Red button at bottom of Settings
- Action: Tap button
- Expected:
 - [ ] Confirmation alert appears
 - [ ] Can confirm or cancel
 - [ ] Sign Out completes logout
 - [ ] Redirects to Login
- **Result**:  PASS  FAIL  SKIP
- Notes: _________________________

#### Leader Summary
- Total buttons tested: __ / 12
- Buttons passed: __
- Buttons failed: __
- Console errors: Yes / No
- App crashed: Yes / No
- **Phase 3 Result**:  PASS  FAIL

---

## FINAL RESULTS

### Button Count Summary
| Phase | Buttons Tested | Passed | Failed |
|-------|---|---|---|
| Customer | 4 | __ | __ |
| Scout | 9 | __ | __ |
| Leader | 12 | __ | __ |
| **TOTAL** | **25** | **__** | **__** |

### Pass Rate Calculation
```
Total Passed: ____ out of 25 buttons
Pass Rate: ____ / 25 = ____%
Target: 90%+ (23/25 minimum)
Status:  PASS  FAIL
```

### Overall Assessment
- Console Errors:  None  Minor  Major
- App Crashes:  Zero  1-2  3+
- Navigation:  Smooth  Acceptable  Issues
- **OVERALL RESULT**:  PASS  FAIL

---

## ISSUES FOUND

### Issue #1
- **Button**: ___________________
- **Problem**: ___________________
- **Screenshots**: Yes / No
- **Console Error**: ___________________
- **Severity**:  Minor  Major  Critical

### Issue #2
- **Button**: ___________________
- **Problem**: ___________________
- **Screenshots**: Yes / No
- **Console Error**: ___________________
- **Severity**:  Minor  Major  Critical

### Issue #3
- **Button**: ___________________
- **Problem**: ___________________
- **Screenshots**: Yes / No
- **Console Error**: ___________________
- **Severity**:  Minor  Major  Critical

---

## TESTING COMPLETE

**Date**: December 28, 2025
**Tested By**: ___________________
**Time Spent**: ___________________
**Final Status**:  PASS  FAIL

**Next Steps**:
- [ ] All issues documented
- [ ] Screenshots collected
- [ ] Console logs reviewed
- [ ] Pass rate calculated
- [ ] Ready for development fixes (if needed)

---

**REMEMBER**: Target pass rate is 90%+ (23/25 buttons minimum). Good luck!
