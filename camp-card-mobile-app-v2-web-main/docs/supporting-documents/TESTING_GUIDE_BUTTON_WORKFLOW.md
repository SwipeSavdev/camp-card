# Complete Testing Guide - Button Functionality & Workflows

## Test Environment Setup
- **Framework**: React Native with Expo
- **Date**: December 28, 2025
- **Phases Covered**: 3b (Referral System) & 3c (Scout/Leader Dashboards)
- **Test User Roles**: Customer, Scout, Leader

---

## PHASE 3B: REFERRAL SYSTEM TESTING

### Test Suite 1: Wallet Screen - Referral Code Display & Copy
**File**: `src/uiux/screens/customer/Wallet.tsx`

#### Test 1.1: Referral Code Display
- [ ] Navigate to Wallet tab
- [ ] Verify "Refer Friends" section appears
- [ ] Verify referral code displays (format: CUST-{userId})
- [ ] Expected: Code visible, properly formatted

#### Test 1.2: Copy Referral Code Button
- [ ] Tap copy icon next to referral code
- [ ] **Expected**:
 - Visual feedback (icon press state)
 - Alert displays "Copied!" message
 - Code content visible in clipboard

#### Test 1.3: Referral Link Display
- [ ] Verify share link displays below code
- [ ] Expected: Format shows https://campcard.app/ref/{code}
- [ ] Text wraps properly if truncated

#### Test 1.4: Share Referral Link Button
- [ ] Tap "Share Referral Link" (blue button)
- [ ] **Expected**:
 - Loading state briefly shows
 - Native share sheet opens
 - Can select email, message, etc.
 - After selection, API call logs the share
 - No error alerts appear

#### Test 1.5: View Referral History Button
- [ ] Tap "View Referral History" button
- [ ] **Expected**:
 - Navigation transitions smoothly
 - ReferralHistoryScreen loads
 - Loading spinner briefly appears
 - History list displays (if data exists)

---

### Test Suite 2: Referral History Screen
**File**: `src/screens/customer/ReferralHistoryScreen.tsx`

#### Test 2.1: Screen Navigation
- [ ] From Wallet, tap "View Referral History"
- [ ] Expected: Smooth slide animation, header shows "Referral History"
- [ ] Back button visible in top-left

#### Test 2.2: Loading State
- [ ] Screen loads and shows ActivityIndicator briefly
- [ ] Expected: Spinner centered, then disappears when data loads

#### Test 2.3: History List Display
- [ ] Verify FlatList shows referral entries
- [ ] Each entry shows:
 - [ ] Referred user name
 - [ ] Status badge (Completed/Pending/Expired)
 - [ ] Earnings amount
 - [ ] Referral date

#### Test 2.4: Status Badge Colors
- [ ] **Completed**: Green background, white text
- [ ] **Pending**: Blue background, white text
- [ ] **Expired**: Gray background, white text
- [ ] Colors render correctly

#### Test 2.5: Empty State
- [ ] If no referrals exist, verify empty message appears
- [ ] Expected: "No referrals yet" or similar message

#### Test 2.6: Error State
- [ ] If API fails, error message displays
- [ ] Expected: Gray background, readable error text
- [ ] No crash occurs

#### Test 2.7: Back Navigation
- [ ] Tap back button or use device back
- [ ] Expected: Returns to Wallet screen smoothly

---

## PHASE 3C: SCOUT DASHBOARDS TESTING

### Test Suite 3: Scout Home Dashboard
**File**: `src/uiux/screens/scout/Home.tsx`

#### Test 3.1: Dashboard Load
- [ ] Sign in as Scout user (role = "scout")
- [ ] Navigate to Scout tab  Home
- [ ] Expected: Loading spinner appears, then data loads
- [ ] No errors in console

#### Test 3.2: Stat Cards Display
Verify all 4 cards render:
- [ ] **Total Recruits**: Shows number with icon
- [ ] **Active Scouts**: Shows count
- [ ] **Total Earnings**: Shows currency amount
- [ ] **Redemptions**: Shows count

#### Test 3.3: Recruitment Pipeline Section
- [ ] Verify section title "Recruitment Pipeline"
- [ ] Shows breakdown:
 - [ ] Pending count
 - [ ] Accepted count
 - [ ] Rejected count
- [ ] All numbers display without overflow

#### Test 3.4: Share Scout Link Button
- [ ] Tap blue "Share Scout Link" button
- [ ] **Expected**:
 - Button briefly shows pressed state
 - Loading indicator appears
 - Native share sheet opens
 - Can select platform (Messages, Email, etc.)
 - After selection, disappears and button re-enabled
 - No error alerts

#### Test 3.5: Error State
- [ ] If API fails (mock by disconnecting), error alert shows
- [ ] Expected: "Failed to load dashboard" message
- [ ] Can tap OK to dismiss
- [ ] UI doesn't crash

#### Test 3.6: Refresh Behavior
- [ ] Scroll and pull-to-refresh (if enabled)
- [ ] OR close/reopen Scout tab
- [ ] Expected: Data refreshes, spinner shows briefly

---

### Test Suite 4: Scout Share Screen
**File**: `src/uiux/screens/scout/Share.tsx`

#### Test 4.1: Screen Navigation
- [ ] From Scout Home, button should navigate to Share screen
- [ ] OR tap Share tab at bottom
- [ ] Expected: Screen loads with "Share Scout Link" header

#### Test 4.2: Scout Code Display
- [ ] Verify code displays (format: SCOUT-{userId})
- [ ] Code clearly visible, readable font
- [ ] Copy icon next to code

#### Test 4.3: Copy Scout Code
- [ ] Tap copy icon
- [ ] Expected: Alert "Copied!" appears
- [ ] Code in clipboard

#### Test 4.4: Share Link Display
- [ ] Link shows (format: https://campcard.app/scout/{code})
- [ ] Text displays without overflow
- [ ] Readable font size

#### Test 4.5: Share Button
- [ ] Tap "Share" button
- [ ] Expected:
 - Loading state briefly
 - Native share sheet opens
 - Selections available (Messages, Email, WhatsApp, etc.)
 - After selection, API logs the share
 - Returns to screen with success

#### Test 4.6: Quick Share Methods
- [ ] Verify quick share rows visible:
 - [ ] Facebook
 - [ ] Email
 - [ ] WhatsApp
 - [ ] SMS
- [ ] Each shows icon and label
- [ ] Text readable

#### Test 4.7: Info Card
- [ ] Verify info card at top explains benefits
- [ ] Text is clear and concise
- [ ] No layout issues

---

### Test Suite 5: Scout Settings Screen
**File**: `src/uiux/screens/scout/Settings.tsx`

#### Test 5.1: Screen Navigation
- [ ] Tap Settings tab at bottom
- [ ] Expected: Screen loads, header shows "Settings"
- [ ] User name displays below header

#### Test 5.2: Toggle Switches Load
- [ ] Verify 3 toggle switches appear:
 - [ ] Push Notifications
 - [ ] Location Sharing
 - [ ] Marketing Emails
- [ ] Each has icon, label, and description
- [ ] All toggles respond to tap

#### Test 5.3: Push Notifications Toggle
- [ ] Tap toggle OFF (if on) or ON (if off)
- [ ] **Expected**:
 - Toggle animates
 - Toggle briefly disabled (grayed out)
 - API call made to `/users/{userId}/settings/notifications/toggle`
 - Toggle re-enables after success
 - State persists on screen refresh

#### Test 5.4: Location Sharing Toggle
- [ ] Tap toggle
- [ ] Same behavior as 5.3
- [ ] Different setting saved

#### Test 5.5: Marketing Emails Toggle
- [ ] Tap toggle
- [ ] Same behavior as 5.3
- [ ] Different setting saved

#### Test 5.6: Quick Actions Section
- [ ] Verify "Quick Actions" cards appear:
 - [ ] Export Report
 - [ ] View Analytics
- [ ] Tap each (may not have full functionality, but shouldn't crash)
- [ ] Icons and labels visible

#### Test 5.7: Sign Out Button
- [ ] Scroll to bottom, verify "Sign Out" button
- [ ] Red icon, red text
- [ ] Tap button
- [ ] **Expected**:
 - Confirmation alert appears
 - "Are you sure?" message
 - Buttons: Cancel, Sign Out
 - Tap Cancel: Alert closes, user stays logged in
 - Tap Sign Out: User logged out, redirected to login screen

#### Test 5.8: Error Handling on Toggle
- [ ] Simulate API failure (disconnect network)
- [ ] Tap toggle
- [ ] **Expected**:
 - Error alert appears
 - Toggle reverts to previous state (rollback)
 - "Failed to update" message
 - User can retry

---

## PHASE 3C: LEADER DASHBOARDS TESTING

### Test Suite 6: Leader Home Dashboard
**File**: `src/uiux/screens/leader/Home.tsx`

#### Test 6.1: Dashboard Load
- [ ] Sign in as Leader user (role = "leader")
- [ ] Navigate to Leader tab  Home
- [ ] Expected: Loading spinner, then data loads
- [ ] No console errors

#### Test 6.2: Stat Cards Display
Verify all 3 cards:
- [ ] **Total Scouts**: Shows count with icon
- [ ] **Active Scouts**: Shows count
- [ ] **Total Earnings**: Shows currency amount

#### Test 6.3: Recruitment Pipeline
- [ ] Section shows breakdown:
 - [ ] Pending scouts
 - [ ] Accepted scouts
 - [ ] Rejected scouts
- [ ] All counts display

#### Test 6.4: Share Troop Link Button
- [ ] Tap red "Share Troop Link" button
- [ ] **Expected**:
 - Button press animation
 - Loading state briefly
 - Native share sheet opens
 - Can select platform
 - Returns after selection
 - No errors

#### Test 6.5: Manage Scouts Button
- [ ] Tap outlined "Manage Scouts" button
- [ ] **Expected**:
 - Navigation to LeaderScouts screen
 - Smooth transition
 - Scout list loads

#### Test 6.6: Error State
- [ ] Disconnect network before load
- [ ] Expected: Error alert with retry option
- [ ] No crash

---

### Test Suite 7: Leader Scouts Management
**File**: `src/uiux/screens/leader/Scouts.tsx`

#### Test 7.1: Scouts List Load
- [ ] From Leader Home, tap "Manage Scouts"
- [ ] OR navigate via navigation
- [ ] Expected: Loading spinner, then list appears
- [ ] Header shows "Scouts (X)" with count

#### Test 7.2: Scout Card Display
Each scout card shows:
- [ ] Scout name
- [ ] Email address
- [ ] Troop number
- [ ] Status badge (Active/Inactive/Invited)
- [ ] Recruits count
- [ ] Total earnings
- [ ] Joined date

#### Test 7.3: Status Badge Colors
- [ ] **Active**: Green left border
- [ ] **Inactive**: Gray left border
- [ ] **Invited**: Blue left border
- [ ] Colors render correctly

#### Test 7.4: Invite New Scout Button
- [ ] Top of list shows button
- [ ] Tap button (may not have full flow yet)
- [ ] No crash
- [ ] Button is clearly visible

#### Test 7.5: Scout Card Interaction
- [ ] Tap scout card
- [ ] Expected: Can select/view details (if tappable)
- [ ] OR verifies list renders without tap handler

#### Test 7.6: Empty State
- [ ] If no scouts exist, empty message displays
- [ ] Expected: "No scouts yet" or similar
- [ ] Can still see Invite button

#### Test 7.7: Loading State
- [ ] On refresh, spinner appears
- [ ] Disappears when data loads

#### Test 7.8: FlatList Scrolling
- [ ] List scrolls smoothly
- [ ] No layout shift during scroll
- [ ] Performance is acceptable

---

### Test Suite 8: Leader Share Screen
**File**: `src/uiux/screens/leader/Share.tsx`

#### Test 8.1: Screen Navigation
- [ ] From Leader Home, tap "Share Troop Link"
- [ ] OR navigate via tabs
- [ ] Expected: Screen loads with header

#### Test 8.2: Troop Code Display
- [ ] Code shows (format: TROOP-{userId})
- [ ] Copy icon next to code
- [ ] Readable font

#### Test 8.3: Copy Troop Code
- [ ] Tap copy icon
- [ ] Expected: Alert appears with "Copied!"
- [ ] Code in clipboard

#### Test 8.4: Share Link Display
- [ ] Shows unique link
- [ ] Format: https://campcard.app/troop/{code}
- [ ] No overflow

#### Test 8.5: Share Button
- [ ] Tap "Share" button
- [ ] Expected:
 - Loading state
 - Native share sheet
 - Platform selection
 - API logs share
 - Success feedback

#### Test 8.6: Quick Share Methods
- [ ] All 4 quick methods visible:
 - [ ] Facebook
 - [ ] Email
 - [ ] WhatsApp
 - [ ] SMS
- [ ] Icons and labels clear

#### Test 8.7: Info Card
- [ ] Explains troop growth benefits
- [ ] Clear, readable text

---

### Test Suite 9: Leader Settings Screen
**File**: `src/uiux/screens/leader/Settings.tsx`

#### Test 9.1: Screen Navigation
- [ ] Tap Settings tab
- [ ] Expected: Screen loads, "Settings" header visible
- [ ] User name displays

#### Test 9.2: Notification Toggles
- [ ] 3 toggles appear:
 - [ ] Push Notifications
 - [ ] Location Sharing
 - [ ] Marketing Emails
- [ ] Each has icon and description

#### Test 9.3: Toggle Behavior
- [ ] Tap each toggle
- [ ] Expected:
 - Animation
 - Brief disable state
 - API call made
 - State persists
 - No errors

#### Test 9.4: Quick Actions
- [ ] Export Report button visible
- [ ] View Analytics button visible
- [ ] Tap doesn't crash

#### Test 9.5: Sign Out Button
- [ ] Red "Sign Out" button at bottom
- [ ] Tap shows confirmation alert
- [ ] Confirm signs out user
- [ ] Redirects to login

#### Test 9.6: Error Handling
- [ ] Disconnect network
- [ ] Tap toggle
- [ ] Error appears, state reverts
- [ ] User can retry

---

## CRITICAL WORKFLOWS TO TEST

### Workflow 1: Complete Referral Journey (Customer)
1. [ ] Login as customer
2. [ ] Open Wallet tab
3. [ ] Tap "Share Referral Link"
4. [ ] Select platform (Messages/Email)
5. [ ] Confirm share sheet opens
6. [ ] Tap "View Referral History"
7. [ ] Verify history loads with previous shares
8. [ ] Tap back to return to wallet
9. [ ] **Expected**: All transitions smooth, no errors

### Workflow 2: Scout Complete Journey
1. [ ] Login as scout
2. [ ] Tap Scout tab  Home
3. [ ] Verify dashboard loads with stats
4. [ ] Tap "Share Scout Link"
5. [ ] Use share sheet or quick share method
6. [ ] Navigate to Share tab
7. [ ] Copy scout code
8. [ ] Go to Settings
9. [ ] Toggle notification (test API call)
10. [ ] Sign out
11. [ ] **Expected**: All flows work seamlessly

### Workflow 3: Leader Complete Journey
1. [ ] Login as leader
2. [ ] Tap Leader tab  Home
3. [ ] Verify dashboard loads
4. [ ] Tap "Manage Scouts"
5. [ ] Verify scout list displays
6. [ ] Go back to Home
7. [ ] Tap "Share Troop Link"
8. [ ] Use native share
9. [ ] Navigate to Settings
10. [ ] Toggle a preference
11. [ ] Sign out
12. [ ] **Expected**: All navigation works, data loads, API calls succeed

### Workflow 4: API Error Handling
1. [ ] Turn off WiFi/data
2. [ ] Try to load any dashboard
3. [ ] Verify error alert appears
4. [ ] Alert message is helpful
5. [ ] UI doesn't crash
6. [ ] Can dismiss alert
7. [ ] Turn WiFi back on
8. [ ] Retry works
9. [ ] **Expected**: Graceful error handling

### Workflow 5: Loading States
1. [ ] Watch each screen load
2. [ ] Verify spinner appears briefly
3. [ ] Spinner disappears when data loads
4. [ ] No flicker or layout shift
5. [ ] Buttons disabled during load (if applicable)
6. [ ] **Expected**: Professional loading experience

---

## Button Interaction Checklist

### All Buttons Should:
- [ ] Show visual press state (opacity change or highlight)
- [ ] Respond immediately to tap
- [ ] Not be tappable during loading
- [ ] Have clear, readable text
- [ ] Be properly sized for easy tapping
- [ ] Have appropriate icons
- [ ] Not cause layout shift when pressed

### Navigation Buttons Should:
- [ ] Transition smoothly
- [ ] Show destination content correctly
- [ ] Back button works
- [ ] Tab navigation works
- [ ] No infinite loops

### Action Buttons Should:
- [ ] Show loading state during API call
- [ ] Handle success (feedback, state update)
- [ ] Handle errors (alert, recovery)
- [ ] Prevent double-tap errors

---

## Test Completion Checklist

### To Pass Testing:
- [ ] All 9 test suites passed
- [ ] All 5 critical workflows completed
- [ ] No console errors
- [ ] No app crashes
- [ ] All buttons respond correctly
- [ ] All API calls complete
- [ ] Loading/error states work
- [ ] Navigation flows smoothly
- [ ] Data displays correctly

---

## Notes for Testers

1. **Use Test Credentials** from TEST_USER_CREDENTIALS.md
2. **Check Console** for any warnings or errors
3. **Test Both Orientations** (if applicable)
4. **Test on Device** for real performance
5. **Document Failures** with screenshots/logs
6. **API Mocking**: Fallback data included for offline testing

---

**Test Start Date**: December 28, 2025
**Test Platform**: iOS/Android with Expo
**Status**: Ready to begin testing
