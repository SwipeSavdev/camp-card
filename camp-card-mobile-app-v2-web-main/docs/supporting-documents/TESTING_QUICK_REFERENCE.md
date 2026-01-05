# Button Testing Quick Reference Card

## QUICK START

**App Status**: Expo server running on port 8084
**Test Duration**: 45-60 minutes
**Test Roles**: Customer, Scout, Leader

---

## HOW TO RUN THE APP

In the terminal where `npm start` is running, press:
- **`i`**  Open iOS Simulator
- **`a`**  Open Android Emulator
- **Scan QR Code**  Use Expo Go app on real device

---

##  TEST USER ACCOUNTS

```
CUSTOMER
 Email: customer@example.com
 Password: password123
 Expected Tab: Wallet (Referral Features)

SCOUT
 Email: scout@example.com
 Password: password123
 Expected Tabs: Home, Share, Settings

LEADER
 Email: leader@example.com
 Password: password123
 Expected Tabs: Home, Scouts, Share, Settings
```

---

## WHAT TO TEST (PRIORITY ORDER)

### Priority 1: Critical Buttons (5 min)
- Login button
- Share Referral Link (Customer)
- Share Scout Link (Scout)
- Manage Scouts (Leader)
- Sign Out (All roles)

### Priority 2: Navigation Buttons (5 min)
- "View Referral History" button
- Back buttons on all screens
- Tab navigation
- "Manage Scouts" button

### Priority 3: Toggle Switches (5 min)
- Push Notifications toggle
- Location Sharing toggle
- Marketing Emails toggle

### Priority 4: Copy/Share Buttons (5 min)
- Copy referral code
- Copy scout code
- Copy troop code
- Share buttons (all share screens)

### Priority 5: Support Buttons (5 min)
- "Export Report" button
- "View Analytics" button
- "Invite New Scout" button

---

## BUTTON INTERACTION CHECKLIST

For EVERY button, verify:
- [ ] **Visual Feedback**: Opacity/highlight change on tap
- [ ] **Immediate Response**: No lag
- [ ] **No Double-Tap Issues**: Can't trigger twice
- [ ] **Loading State**: Shows during async operations
- [ ] **Disabled State**: Grayed out when should be
- [ ] **Clear Text**: Easy to read
- [ ] **Proper Icon**: If applicable, correct icon shown
- [ ] **Good Size**: Easy to tap
- [ ] **No Layout Shift**: UI doesn't move when pressed
- [ ] **Error Handling**: Shows alert if operation fails

---

## QUICK TEST FLOWS

### Flow 1: Customer Referral (2 min)
```
1. Login as customer
2. Tap Wallet tab
3. Tap "Share Referral Link" button
4. Select Messages/Email from share sheet
5. Tap "View Referral History" button
6. Verify history loads
7. Tap back to return to Wallet
 All smooth? PASS  Error? FAIL
```

### Flow 2: Scout Setup (3 min)
```
1. Login as scout
2. Verify Home dashboard loads
3. Tap "Share Scout Link" button
4. Use share sheet or quick share
5. Go to Share tab  Copy code
6. Go to Settings tab  Toggle one switch
7. Tap Sign Out  Confirm logout
 All smooth? PASS  Error? FAIL
```

### Flow 3: Leader Setup (3 min)
```
1. Login as leader
2. Verify Home dashboard loads
3. Tap "Manage Scouts"  See list
4. Tap back to return
5. Tap "Share Troop Link" button
6. Go to Settings  Toggle one switch
7. Tap Sign Out  Confirm logout
 All smooth? PASS  Error? FAIL
```

---

##  COMMON ISSUES & FIXES

| Issue | How to Identify | Fix |
|-------|-----------------|-----|
| Button doesn't respond | Tap button, nothing happens | Reload app: Press `r` |
| White screen | App loads but shows blank | Check console for errors |
| Share sheet won't open | Button tapped but no sheet | Check permissions/iOS/Android |
| Toggle won't work | Switch doesn't animate | Network may be down, check API |
| Navigation loops | Can't go back | Check RootNavigator routes |
| Error alert stays | Error shows but won't dismiss | Tap outside or OK button |
| Data doesn't load | Loading spinner spins forever | API may be down, check console |

---

## TRACKING SHEET

```
PHASE 3b (Customer Referral)
 Wallet Buttons: __/3 passing
 History Screen: __/2 passing
 Status: [PASS] [FAIL]

PHASE 3c SCOUT
 Home Screen: __/1 passing
 Share Screen: __/2 passing
 Settings: __/5 passing
 Status: [PASS] [FAIL]

PHASE 3c LEADER
 Home Screen: __/2 passing
 Scouts Screen: __/2 passing
 Share Screen: __/2 passing
 Settings: __/5 passing
 Status: [PASS] [FAIL]

WORKFLOWS
 Customer Journey: [PASS] [FAIL]
 Scout Journey: [PASS] [FAIL]
 Leader Journey: [PASS] [FAIL]

OVERALL: __/24 buttons working
Pass Rate: ___%
```

---

## TERMINAL COMMANDS WHILE TESTING

| Press | Action |
|-------|--------|
| `r` | Reload app |
| `m` | Toggle menu |
| `j` | Open debugger |
| `i` | Open iOS Simulator |
| `a` | Open Android Emulator |
| `w` | Open web version |
| `Ctrl+C` | Stop server |

---

## WHAT TO WATCH FOR

1. **Console Warnings/Errors**  Stop testing, note error
2. **Red Screen**  App crashed, restart with `r`
3. **API Timeouts**  Check backend is running
4. **Layout Overflow**  Text/buttons cut off screen
5. **Slow Animations**  Note performance issue
6. **Missing Icons/Images**  Asset loading problem
7. **Hard to Read Text**  Contrast/color issue
8. **Buttons Too Small**  Accessibility issue

---

## TESTING LOG TEMPLATE

```
Test Time: ___:___
Role Being Tested: [Customer] [Scout] [Leader]
Device: [iOS] [Android] [Web]

Test Case: ________________
Result: [PASS] [FAIL]
Error: ____________________
Screenshot: [ Yes] [No]

Notes:
_________________________
_________________________
```

---

## SUCCESS CRITERIA

 **All 24+ buttons respond to taps**
 **All transitions are smooth**
 **No app crashes**
 **Loading states show/hide correctly**
 **Toggles persist their state**
 **Share sheets open native**
 **Sign out works completely**
 **Navigation buttons work**
 **Error alerts show when needed**
 **No console errors**

**Overall**: If 90%+ of buttons work correctly = **TESTING PASSED**

---

##  NEED HELP?

1. Check the full testing guide: `TESTING_GUIDE_BUTTON_WORKFLOW.md`
2. Check the execution plan: `TESTING_EXECUTION_PLAN.md`
3. Check console logs for error details
4. Press `Ctrl+C` to stop server, check code, then restart

---

**Ready to test?**
Start by pressing `i` (iOS) or `a` (Android) in the terminal!
