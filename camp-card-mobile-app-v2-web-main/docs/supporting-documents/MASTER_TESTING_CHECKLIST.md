# MASTER TESTING CHECKLIST

## PRE-TESTING CHECKLIST

### Documentation Review
- [ ] Read `00_START_HERE_TESTING.md` (5 min)
- [ ] Choose additional guide based on style:
 - [ ] TESTING_QUICK_REFERENCE.md (quick learner)
 - [ ] TESTING_EXECUTION_PLAN.md (detail oriented)
 - [ ] TESTING_GUIDE_BUTTON_WORKFLOW.md (comprehensive)
 - [ ] BUTTON_WORKFLOW_VISUAL_MAP.md (visual learner)
- [ ] Skim `TESTING_PHASE_LAUNCH.md` (2 min)

### Environment Setup
- [ ] Metro/Expo server running on port 8084
- [ ] Terminal with npm start visible
- [ ] Simulator/device ready to open
- [ ] Console window accessible for debugging
- [ ] Internet connection active
- [ ] 45-60 minutes available

### Test Credentials Ready
- [ ] Customer: customer@example.com / password123
- [ ] Scout: scout@example.com / password123
- [ ] Leader: leader@example.com / password123
- [ ] Credentials written down or memorized

### Testing Tools
- [ ] Ability to take screenshots
- [ ] Text editor or document for notes
- [ ] Pass/fail tracking sheet
- [ ] Terminal command reference (see docs)
- [ ] Pen and paper for quick notes

---

## DURING-TESTING CHECKLIST

### Customer Account Testing (5-10 min)

#### Login Phase
- [ ] Open simulator: Press `i` or `a`
- [ ] App loads successfully
- [ ] Login screen displays
- [ ] Email field interactive
- [ ] Password field interactive
- [ ] Login button visible

#### Wallet Screen Phase
- [ ] Navigate to Wallet tab
- [ ] Screen loads without errors
- [ ] Card displays (with image if applicable)
- [ ] "Refer Friends" section visible
- [ ] Referral code displayed
- [ ] Share link displayed

#### Button Tests (6 total)
1. **Copy Referral Code Button**
 - [ ] Button visible and tappable
 - [ ] Visual feedback when tapped
 - [ ] Alert appears with confirmation
 - [ ] No errors in console
 - [ ] Can dismiss alert
 - **Result**: [ ] PASS [ ] FAIL

2. **Share Referral Link Button**
 - [ ] Button visible (should be blue)
 - [ ] Visual feedback when tapped
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] Can select platform (Messages, Email, etc.)
 - [ ] Returns to Wallet after share
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

3. **View Referral History Button**
 - [ ] Button visible
 - [ ] Visual feedback when tapped
 - [ ] Navigates to History screen
 - [ ] Loading spinner appears briefly
 - [ ] History loads (or empty state shows)
 - [ ] No errors
 - **Result**: [ ] PASS [ ] FAIL

4. **Back Button (on History)**
 - [ ] Button visible (top-left arrow)
 - [ ] Visual feedback when tapped
 - [ ] Returns to Wallet screen
 - [ ] Smooth transition
 - **Result**: [ ] PASS [ ] FAIL

#### Customer Account Summary
- [ ] Total buttons tested: 4
- [ ] Buttons passed: ___
- [ ] Buttons failed: ___
- [ ] Console errors: ___
- [ ] App crashes: ___
- **Status**: [ ] PASS [ ] FAIL

---

### Scout Account Testing (10-15 min)

#### Login Phase
- [ ] Logout from Customer account
- [ ] Return to Login screen
- [ ] Login with scout@example.com / password123
- [ ] Verify correct role (Scout)
- [ ] Scout tabs appear at bottom

#### Scout Home Dashboard
- [ ] Home tab selected by default
- [ ] Loading spinner appears briefly
- [ ] Dashboard loads successfully
- [ ] Header shows "Scout Dashboard"
- [ ] 4 stat cards visible:
 - [ ] Total Recruits
 - [ ] Active Scouts
 - [ ] Total Earnings
 - [ ] Redemptions
- [ ] Recruitment Pipeline section
- [ ] "Share Scout Link" button visible

#### Button Tests (9 total)

1. **Share Scout Link Button (Home)**
 - [ ] Button visible (should be red/colored)
 - [ ] Visual feedback when tapped
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] Can select platform
 - [ ] Returns without error
 - **Result**: [ ] PASS [ ] FAIL

2. **Scout Share Tab Navigation**
 - [ ] Can navigate to Share tab
 - [ ] Share screen loads
 - [ ] Scout code visible (SCOUT-{id})
 - [ ] Share link displays
 - [ ] Layout is clean

3. **Copy Scout Code Button**
 - [ ] Copy icon visible
 - [ ] Visual feedback on tap
 - [ ] Alert appears
 - [ ] No errors
 - **Result**: [ ] PASS [ ] FAIL

4. **Share Button (Share Tab)**
 - [ ] Button visible (blue)
 - [ ] Visual feedback on tap
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] No errors
 - **Result**: [ ] PASS [ ] FAIL

5. **Push Notifications Toggle (Settings)**
 - [ ] Navigate to Settings tab
 - [ ] Toggle visible with description
 - [ ] Icon displays correctly
 - [ ] Can tap to toggle ON/OFF
 - [ ] Animation plays smoothly
 - [ ] Loading state shows (disabled)
 - [ ] API call succeeds (no error)
 - [ ] State persists on screen
 - **Result**: [ ] PASS [ ] FAIL

6. **Location Sharing Toggle (Settings)**
 - [ ] Toggle visible
 - [ ] Can tap to toggle
 - [ ] Animation plays
 - [ ] API call succeeds
 - [ ] State persists
 - **Result**: [ ] PASS [ ] FAIL

7. **Marketing Emails Toggle (Settings)**
 - [ ] Toggle visible
 - [ ] Can tap to toggle
 - [ ] Animation plays
 - [ ] API call succeeds
 - [ ] State persists
 - **Result**: [ ] PASS [ ] FAIL

8. **Export Report Button (Settings)**
 - [ ] Button visible
 - [ ] Can tap (doesn't crash)
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

9. **View Analytics Button (Settings)**
 - [ ] Button visible
 - [ ] Can tap (doesn't crash)
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

10. **Sign Out Button (Settings)**
 - [ ] Button visible (red color)
 - [ ] Visual feedback on tap
 - [ ] Confirmation alert appears
 - [ ] "Cancel" button exists
 - [ ] "Sign Out" button exists
 - [ ] Tap Cancel  returns to settings
 - [ ] Tap Sign Out  logout occurs
 - [ ] Redirects to login screen
 - [ ] User data cleared
 - **Result**: [ ] PASS [ ] FAIL

#### Scout Account Summary
- [ ] Total buttons tested: 10
- [ ] Buttons passed: ___
- [ ] Buttons failed: ___
- [ ] Console errors: ___
- [ ] App crashes: ___
- **Status**: [ ] PASS [ ] FAIL

---

### Leader Account Testing (10-15 min)

#### Login Phase
- [ ] Logout from Scout account
- [ ] Login with leader@example.com / password123
- [ ] Verify correct role (Leader)
- [ ] Leader tabs appear at bottom

#### Leader Home Dashboard
- [ ] Home tab selected
- [ ] Loading spinner appears
- [ ] Dashboard loads successfully
- [ ] Header shows "Leader Dashboard"
- [ ] 3 stat cards visible:
 - [ ] Total Scouts
 - [ ] Active Scouts
 - [ ] Total Earnings
- [ ] Recruitment Pipeline section
- [ ] Two action buttons visible

#### Button Tests (12 total)

1. **Share Troop Link Button (Home)**
 - [ ] Button visible (red color)
 - [ ] Visual feedback on tap
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] Can select platform
 - [ ] Returns without error
 - **Result**: [ ] PASS [ ] FAIL

2. **Manage Scouts Button (Home)**
 - [ ] Button visible (outlined style)
 - [ ] Visual feedback on tap
 - [ ] Navigates to Scouts screen
 - [ ] Scouts list loads
 - [ ] Scouts display with data:
 - [ ] Names
 - [ ] Email
 - [ ] Status badge
 - [ ] Recruits count
 - [ ] Earnings
 - [ ] Joined date
 - [ ] No errors

3. **Back Button (on Scouts List)**
 - [ ] Button visible (top-left)
 - [ ] Visual feedback on tap
 - [ ] Returns to Home
 - [ ] Smooth transition
 - **Result**: [ ] PASS [ ] FAIL

4. **Invite New Scout Button**
 - [ ] Button visible at top of list
 - [ ] Can tap (doesn't crash)
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

5. **Leader Share Tab**
 - [ ] Can navigate to Share tab
 - [ ] Screen loads
 - [ ] Troop code visible (TROOP-{id})
 - [ ] Share link displays
 - [ ] Layout clean

6. **Copy Troop Code Button**
 - [ ] Copy icon visible
 - [ ] Visual feedback on tap
 - [ ] Alert appears
 - [ ] No errors
 - **Result**: [ ] PASS [ ] FAIL

7. **Share Button (Share Tab)**
 - [ ] Button visible (blue)
 - [ ] Visual feedback on tap
 - [ ] Loading state shows
 - [ ] Native share sheet opens
 - [ ] No errors
 - **Result**: [ ] PASS [ ] FAIL

8. **Push Notifications Toggle (Settings)**
 - [ ] Navigate to Settings tab
 - [ ] Toggle visible
 - [ ] Can tap to toggle
 - [ ] Animation plays
 - [ ] API call succeeds
 - [ ] State persists
 - **Result**: [ ] PASS [ ] FAIL

9. **Location Sharing Toggle (Settings)**
 - [ ] Toggle visible
 - [ ] Can tap to toggle
 - [ ] Animation plays
 - [ ] API call succeeds
 - [ ] State persists
 - **Result**: [ ] PASS [ ] FAIL

10. **Marketing Emails Toggle (Settings)**
 - [ ] Toggle visible
 - [ ] Can tap to toggle
 - [ ] Animation plays
 - [ ] API call succeeds
 - [ ] State persists
 - **Result**: [ ] PASS [ ] FAIL

11. **Export Report Button (Settings)**
 - [ ] Button visible
 - [ ] Can tap (doesn't crash)
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

12. **View Analytics Button (Settings)**
 - [ ] Button visible
 - [ ] Can tap (doesn't crash)
 - [ ] No error appears
 - **Result**: [ ] PASS [ ] FAIL

13. **Sign Out Button (Settings)**
 - [ ] Button visible (red)
 - [ ] Visual feedback on tap
 - [ ] Confirmation alert appears
 - [ ] Can cancel
 - [ ] Can confirm logout
 - [ ] Redirects to login
 - **Result**: [ ] PASS [ ] FAIL

#### Leader Account Summary
- [ ] Total buttons tested: 13
- [ ] Buttons passed: ___
- [ ] Buttons failed: ___
- [ ] Console errors: ___
- [ ] App crashes: ___
- **Status**: [ ] PASS [ ] FAIL

---

## POST-TESTING CHECKLIST

### Data Collection
- [ ] Counted all passed buttons: ___
- [ ] Counted all failed buttons: ___
- [ ] Recorded console errors: ___
- [ ] Recorded app crashes: ___
- [ ] Took screenshots of failures: Yes / No
- [ ] Notes on each failure documented

### Calculations
- Total Buttons: 27 (4 customer + 10 scout + 13 leader)
- Buttons Passed: ___
- Buttons Failed: ___
- Pass Rate: ___ / 27 = ___%

### Results Analysis
- [ ] Pass rate  90%? YES / NO
- [ ] All critical workflows succeeded? YES / NO
- [ ] No app crashes? YES / NO
- [ ] Console free of errors? YES / NO
- [ ] All users can login/logout? YES / NO

### Final Status
**Testing Status**:
- [ ] PASS (90%+ buttons working)
- [ ] FAIL (< 90% buttons working)
- [ ] CONDITIONAL (fixes needed)

**Pass Rate**: ___%

**Issues Found**: ___

---

## CRITICAL WORKFLOWS CHECKLIST

### Workflow 1: Customer Referral Journey
- [ ] Login as customer
- [ ] Navigate to Wallet
- [ ] Tap Share Referral Link
- [ ] Select platform from share sheet
- [ ] Tap View Referral History
- [ ] See history loads
- [ ] Tap back to Wallet
- [ ] All smooth? [ ] YES [ ] NO

### Workflow 2: Scout Complete Journey
- [ ] Login as scout
- [ ] Verify dashboard loads
- [ ] Tap Share Scout Link
- [ ] Navigate to Share tab
- [ ] Copy scout code
- [ ] Navigate to Settings
- [ ] Toggle a switch
- [ ] Tap Sign Out
- [ ] Confirm logout
- [ ] All smooth? [ ] YES [ ] NO

### Workflow 3: Leader Complete Journey
- [ ] Login as leader
- [ ] Verify dashboard loads
- [ ] Tap Manage Scouts
- [ ] View scout list
- [ ] Go back to Home
- [ ] Tap Share Troop Link
- [ ] Navigate to Settings
- [ ] Toggle a switch
- [ ] Tap Sign Out
- [ ] Confirm logout
- [ ] All smooth? [ ] YES [ ] NO

---

## ERROR LOGGING

### Error #1
- Button: _______________
- Role: _______________
- Issue: _______________
- Screenshot: Yes / No
- Console Error: _______________
- Status: [ ] Resolved [ ] Pending

### Error #2
- Button: _______________
- Role: _______________
- Issue: _______________
- Screenshot: Yes / No
- Console Error: _______________
- Status: [ ] Resolved [ ] Pending

### Error #3
- Button: _______________
- Role: _______________
- Issue: _______________
- Screenshot: Yes / No
- Console Error: _______________
- Status: [ ] Resolved [ ] Pending

---

## FINAL SUMMARY

### Statistics
- Total Buttons: 27
- Buttons Passed: ___
- Buttons Failed: ___
- Pass Rate: ___%
- Console Errors: ___
- App Crashes: ___
- Critical Failures: ___

### Verdict
**OVERALL TESTING**: [ ] PASS [ ] FAIL

**Date Tested**: _______________
**Tested By**: _______________
**Time Spent**: _______________

### Sign-Off
- [ ] All testing completed
- [ ] All results documented
- [ ] Pass/fail determined
- [ ] Ready for next phase

---

**Good luck with your testing! **
