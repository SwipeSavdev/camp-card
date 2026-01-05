# Testing Execution Plan - Button Functionality & Workflows
**Start Date**: December 28, 2025

---

## QUICK START FOR TESTING

### Step 1: Verify App is Running
The Expo Metro bundler is now running on port 8084. You can:
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Physical Device**: Scan QR code with Expo Go app or Camera app

### Step 2: Test User Credentials
Use these test accounts (from TEST_USER_CREDENTIALS.md):

**Customer Account:**
- Email: customer@example.com
- Password: password123
- Role: customer

**Scout Account:**
- Email: scout@example.com
- Password: password123
- Role: scout

**Leader Account:**
- Email: leader@example.com
- Password: password123
- Role: leader

---

## TESTING PHASES (In Order)

### Phase 1: Login Flow (Quick Verify)
- [ ] App loads successfully
- [ ] Login screen displays
- [ ] Can type email and password
- [ ] Submit button responds
- [ ] Loads appropriate dashboard after login
- **Expected Time**: 2-3 minutes

### Phase 2: Phase 3b - Referral System (10 minutes)
Test with **Customer** account:

#### Wallet Screen Tests
1. [ ] Navigate to Wallet tab
2. [ ] "Refer Friends" section visible
3. [ ] Referral code displays (e.g., CUST-12345)
4. [ ] **Copy Button**: Tap copy icon  Alert should show "Copied!"
5. [ ] Share link displays (campcard.app/ref/...)
6. [ ] **Share Button**: Tap "Share Referral Link"
 - Button shows loading briefly
 - Native share sheet opens (can select Messages/Email)
 - After selection, sheet closes
 - No error appears
7. [ ] **History Button**: Tap "View Referral History"
 - Navigates to new screen
 - Loading spinner appears briefly
 - List loads (or "No referrals" message)
 - Back button works
 - Returns to Wallet

**Key Buttons to Test**:
- Copy referral code button
- Share referral link button
- View referral history button
- Back button on history screen

**Expected Result**: All buttons respond, no crashes, smooth transitions

---

### Phase 3: Phase 3c - Scout Role (15 minutes)
Test with **Scout** account:

#### Scout Tab - Home Screen
1. [ ] App loads Scout dashboard
2. [ ] Loading spinner appears briefly
3. [ ] Dashboard displays:
 - [ ] 4 stat cards (Recruits, Active Scouts, Earnings, Redemptions)
 - [ ] Recruitment Pipeline section (Pending/Accepted/Rejected)
 - [ ] "Share Scout Link" button (red/colored)
4. [ ] **Share Button**: Tap "Share Scout Link"
 - Loading state shows
 - Native share sheet opens
 - Can select platform
 - Sheet closes after selection
5. [ ] No errors in console

**Key Buttons**:
- Share Scout Link button
- Any navigation that appears

#### Scout Tab - Share Screen
1. [ ] Swipe/navigate to Share screen
2. [ ] Displays "Share Scout Link" header
3. [ ] Scout code visible (SCOUT-{id})
4. [ ] **Copy Button**: Tap  Alert should appear
5. [ ] Share link displays
6. [ ] **Share Button**: Opens native sheet
7. [ ] Quick share options visible (Facebook, Email, WhatsApp, SMS)

**Key Buttons**:
- Copy code button
- Share button
- Quick share method buttons (if tappable)

#### Scout Tab - Settings Screen
1. [ ] Navigate to Settings screen
2. [ ] Header shows "Settings" with user name
3. [ ] 3 toggle switches visible:
 - Push Notifications
 - Location Sharing
 - Marketing Emails
4. [ ] **Test Each Toggle**:
 - Tap toggle ON/OFF
 - Toggle should animate
 - Brief "disabled" state (graying out)
 - Should re-enable after 1-2 seconds
 - State persists on that screen
5. [ ] "Export Report" and "View Analytics" buttons visible
6. [ ] **Sign Out Button**: Tap red "Sign Out"
 - Confirmation alert appears
 - Can tap "Cancel" (returns to screen)
 - Can tap "Sign Out" (logs out, goes to login)

**Key Buttons**:
- 3 Toggle switches
- Export Report button (tap to verify no crash)
- View Analytics button (tap to verify no crash)
- Sign Out button

**Expected Result**: All toggles work, sign out logs user out

---

### Phase 4: Phase 3c - Leader Role (15 minutes)
Test with **Leader** account:

#### Leader Tab - Home Screen
1. [ ] App loads Leader dashboard
2. [ ] Loading spinner appears
3. [ ] Displays:
 - [ ] 3 stat cards (Total Scouts, Active Scouts, Earnings)
 - [ ] Recruitment Pipeline
 - [ ] 2 action buttons: "Share Troop Link" (red), "Manage Scouts" (outlined)
4. [ ] **Share Button**: Tap "Share Troop Link"
 - Loading state
 - Native share sheet opens
 - Works without error
5. [ ] **Manage Scouts Button**: Tap "Manage Scouts"
 - Navigates to Scouts list screen
 - Loading spinner appears
 - List of scouts displays with:
 - Scout names
 - Status badges (Active/Inactive/Invited)
 - Recruits count
 - Earnings
 - Joined date
 - "Invite New Scout" button at top
 - Back button returns to Home

**Key Buttons**:
- Share Troop Link button
- Manage Scouts button
- Back button on Scouts screen
- Invite New Scout button (tap to verify no crash)

#### Leader Tab - Share Screen
1. [ ] Navigate to Share screen
2. [ ] Header: "Share Troop Link"
3. [ ] Troop code visible (TROOP-{id})
4. [ ] **Copy Button**: Tap  Alert appears
5. [ ] Share link displays
6. [ ] **Share Button**: Native sheet opens
7. [ ] Quick share methods visible

**Key Buttons**:
- Copy code button
- Share button

#### Leader Tab - Settings Screen
1. [ ] Navigate to Settings
2. [ ] 3 toggles visible
3. [ ] **Test Each Toggle**:
 - Tap to toggle ON/OFF
 - Should work same as Scout Settings
 - State should update
4. [ ] Quick actions visible
5. [ ] **Sign Out**: Tap and confirm logout

**Key Buttons**:
- 3 Toggle switches
- Sign Out button

**Expected Result**: All toggles work, all buttons respond

---

## CRITICAL WORKFLOWS - FULL END-TO-END

### Workflow 1: Customer Referral Journey
**Time**: 5 minutes
1. [ ] Login as customer@example.com
2. [ ] Go to Wallet tab
3. [ ] Tap "Share Referral Link" button
4. [ ] Select a platform from native share sheet
5. [ ] Returns to Wallet
6. [ ] Tap "View Referral History" button
7. [ ] See referral history (should have recent share)
8. [ ] Tap back button
9. [ ] Back on Wallet
10. [ ] All transitions smooth, no errors

### Workflow 2: Scout Complete Journey
**Time**: 8 minutes
1. [ ] Logout from customer account
2. [ ] Login as scout@example.com
3. [ ] Verify Scout dashboard loads
4. [ ] Tap "Share Scout Link" (use native or quick method)
5. [ ] Navigate to Share tab
6. [ ] Tap copy code button
7. [ ] Navigate to Settings tab
8. [ ] Toggle one switch (e.g., Push Notifications)
 - Watch it disable/enable
 - Verify no error alerts
9. [ ] Tap Sign Out  Confirm logout
10. [ ] Back at login screen
11. [ ] No crashes, smooth experience

### Workflow 3: Leader Complete Journey
**Time**: 10 minutes
1. [ ] Login as leader@example.com
2. [ ] Verify Leader dashboard loads
3. [ ] Tap "Manage Scouts" button
4. [ ] View scout list (should show at least placeholder scouts)
5. [ ] Tap back button
6. [ ] Tap "Share Troop Link" button
7. [ ] Use share (can cancel from sheet)
8. [ ] Navigate to Share tab
9. [ ] Tap copy code button
10. [ ] Navigate to Settings tab
11. [ ] Toggle a switch
12. [ ] Tap Sign Out  Confirm
13. [ ] Back at login
14. [ ] Smooth journey, no errors

---

## BUTTON INTERACTION VERIFICATION

### For Every Button, Verify:
- [ ] Visual feedback when pressed (opacity change, highlight, or animation)
- [ ] Responds immediately to tap (no delay)
- [ ] Doesn't trigger multiple times on double-tap
- [ ] Loading state shows during async operations
- [ ] Disabled state shows when appropriate
- [ ] Clear, readable text label
- [ ] Proper icon if applicable
- [ ] Appropriate size for easy tapping
- [ ] Color contrast is good
- [ ] No layout shift when pressed

### Button Checklist by Type:

**Navigation Buttons** (e.g., "Manage Scouts", "View Referral History"):
- [ ] Smooth screen transition
- [ ] Destination loads correctly
- [ ] Back button works
- [ ] No flicker or blank screen

**Action Buttons** (e.g., "Share", "Copy"):
- [ ] Show loading if async
- [ ] Provide feedback (alert, toast, state change)
- [ ] Handle errors gracefully
- [ ] Prevent accidental double-actions

**Toggle Switches**:
- [ ] Smooth animation when toggling
- [ ] Visual change (on/off state clear)
- [ ] Disabled during API call
- [ ] State persists
- [ ] Show error if API fails

**Sign Out Button**:
- [ ] Shows confirmation alert
- [ ] Can cancel to stay logged in
- [ ] Can confirm to logout
- [ ] Redirects to login
- [ ] User data cleared

---

## ERROR SCENARIOS TO TEST

1. **Network Error**:
 - [ ] Disconnect WiFi
 - [ ] Try to load any dashboard
 - [ ] Error alert should appear
 - [ ] Can dismiss alert
 - [ ] Reconnect WiFi and retry works

2. **Toggle Failure**:
 - [ ] Disconnect WiFi
 - [ ] Try to toggle a setting
 - [ ] Error alert should appear
 - [ ] Toggle should revert to previous state
 - [ ] Can retry after reconnecting

3. **Share Cancellation**:
 - [ ] Tap share button
 - [ ] Tap Cancel in native sheet
 - [ ] Should return to app without error
 - [ ] Button re-enabled

---

## TESTING CHECKLIST - ALL BUTTONS

### Phase 3b Buttons (Customer)
- [ ] Copy Referral Code button
- [ ] Share Referral Link button
- [ ] View Referral History button
- [ ] Back button (on history screen)

### Phase 3c Scout Buttons
- [ ] Share Scout Link button (Home)
- [ ] Copy Scout Code button (Share tab)
- [ ] Share button (Share tab)
- [ ] Push Notifications toggle (Settings)
- [ ] Location Sharing toggle (Settings)
- [ ] Marketing Emails toggle (Settings)
- [ ] Export Report button (Settings)
- [ ] View Analytics button (Settings)
- [ ] Sign Out button (Settings)

### Phase 3c Leader Buttons
- [ ] Share Troop Link button (Home)
- [ ] Manage Scouts button (Home)
- [ ] Back button (on Scouts list)
- [ ] Invite New Scout button (Scouts list)
- [ ] Copy Troop Code button (Share tab)
- [ ] Share button (Share tab)
- [ ] Push Notifications toggle (Settings)
- [ ] Location Sharing toggle (Settings)
- [ ] Marketing Emails toggle (Settings)
- [ ] Export Report button (Settings)
- [ ] View Analytics button (Settings)
- [ ] Sign Out button (Settings)

**Total Buttons to Test**: 24+

---

## TESTING RESULTS TRACKER

### Phase 3b Results
**Customer Account - Referral Testing**
- Wallet Screen: ____/3 tests passed
- History Screen: ____/4 tests passed
- **Status**: __ PASS / __ FAIL

### Phase 3c Scout Results
- Home Dashboard: ____/2 tests passed
- Share Screen: ____/3 tests passed
- Settings Screen: ____/5 tests passed
- **Status**: __ PASS / __ FAIL

### Phase 3c Leader Results
- Home Dashboard: ____/2 tests passed
- Scouts List: ____/2 tests passed
- Share Screen: ____/3 tests passed
- Settings Screen: ____/5 tests passed
- **Status**: __ PASS / __ FAIL

### Critical Workflows
- Workflow 1 (Customer): __ PASS / __ FAIL
- Workflow 2 (Scout): __ PASS / __ FAIL
- Workflow 3 (Leader): __ PASS / __ FAIL

### Overall Testing
**Total Tests**: 24+ buttons
**Passed**: ____
**Failed**: ____
**Pass Rate**: ____%

---

## COMMON ISSUES TO WATCH FOR

1. **Module Import Errors**  Check file paths
2. **Theme Colors Not Found**  Verify colors object
3. **API Not Responding**  Check mock data fallback
4. **Toggle State Not Updating**  Verify useState and API call
5. **Navigation Not Working**  Check route names in navigator
6. **Loading Spinner Not Disappearing**  Check loading state cleanup
7. **Share Sheet Not Opening**  iOS/Android permissions
8. **Back Button Not Working**  Check navigation setup
9. **Sign Out Not Clearing Data**  Verify authStore.logout()
10. **Toggles Not Persisting**  Check API response handling

---

## NEXT STEPS AFTER TESTING

1. Document any failures with screenshots
2. File issues for failed tests
3. Fix critical errors first
4. Re-test fixed issues
5. Create final testing report
6. Move to production deployment if all pass

---

**Estimated Total Testing Time**: 45-60 minutes

Good luck with testing!
