# TESTING START - Complete Guide Index

##  QUICK START (30 seconds)

1. **App is Running**: Expo server on port 8084
2. **Open Simulator**: Press `i` (iOS) or `a` (Android) in terminal
3. **Login**: Use credentials below
4. **Start Testing**: Follow the guides

---

##  TEST CREDENTIALS (Copy & Paste Ready)

```
CUSTOMER ACCOUNT
Email: customer@example.com
Password: password123
Role: customer

SCOUT ACCOUNT
Email: scout@example.com
Password: password123
Role: scout

LEADER ACCOUNT
Email: leader@example.com
Password: password123
Role: leader
```

---

## DOCUMENTATION GUIDE

### Start Here (Pick One):
- **Just want quick reference?**  `TESTING_QUICK_REFERENCE.md` (5 min read)
- **Want step-by-step plan?**  `TESTING_EXECUTION_PLAN.md` (10 min read)
- **Need complete specs?**  `TESTING_GUIDE_BUTTON_WORKFLOW.md` (15 min read)
- **Visual learner?**  `BUTTON_WORKFLOW_VISUAL_MAP.md` (10 min read)
- **Just a summary?**  `TESTING_READY_SUMMARY.md` (5 min read)  You are here!

### File Breakdown:

| File | Purpose | Read Time | Content |
|------|---------|-----------|---------|
| `TESTING_QUICK_REFERENCE.md` | Cheat sheet with checklists | 5 min | Button categories, tracking sheet, common issues |
| `TESTING_EXECUTION_PLAN.md` | Detailed step-by-step testing | 15 min | All 24+ buttons, 3 workflows, results tracker |
| `TESTING_GUIDE_BUTTON_WORKFLOW.md` | Complete test specifications | 20 min | 9 test suites, error scenarios, success criteria |
| `BUTTON_WORKFLOW_VISUAL_MAP.md` | Screen layouts in ASCII art | 10 min | Where each button is, visual flows, state diagrams |
| `TESTING_READY_SUMMARY.md` | Status and next steps | 5 min | What's done, what to test, how to start |

---

## WHAT YOU'RE TESTING

### Phase 3b: Referral System (Customer)
**5 buttons to test**
- Copy referral code
- Share referral link
- View referral history
- Back navigation
- Sign in/out

### Phase 3c: Scout Dashboards
**8 buttons to test**
- Share scout link
- Copy scout code
- Share from share tab
- 3 toggle switches (notifications, location, marketing)
- Export report
- View analytics
- Sign out

### Phase 3c: Leader Dashboards
**11 buttons to test**
- Share troop link
- Manage scouts
- Back from scouts list
- Invite new scout
- Copy troop code
- Share from share tab
- 3 toggle switches
- Export report
- View analytics
- Sign out

**Total: 24+ buttons across 3 roles**

---

## TESTING CHECKLIST

### Pre-Test (Before You Start):
- [ ] Read the appropriate guide (5-15 minutes)
- [ ] Open simulator/device
- [ ] Have credentials ready
- [ ] Keep documentation open for reference

### During Test (While Testing):
- [ ] Test customer account (5-10 min)
- [ ] Test scout account (10-15 min)
- [ ] Test leader account (10-15 min)
- [ ] Take notes on failures
- [ ] Take screenshots of errors
- [ ] Check console for warnings

### Post-Test (After Testing):
- [ ] Document all failures
- [ ] Calculate pass rate
- [ ] Note any improvements
- [ ] File issues for failures
- [ ] Re-test after fixes

**Total Time: 45-60 minutes**

---

## TESTING FLOW

```
START
 
Choose Documentation Guide
  Read (5-15 min)
  Open for reference
 
Open Simulator/Device
  Press 'i' for iOS
  Press 'a' for Android
 
TEST CUSTOMER (5-10 min)
  Login: customer@example.com / password123
  Go to Wallet tab
  Test copy code button
  Test share button
  Test history button
  Document results
 
LOGOUT & TEST SCOUT (10-15 min)
  Login: scout@example.com / password123
  Test Home dashboard loads
  Test Share screen buttons
  Test Settings toggles
  Document results
 
LOGOUT & TEST LEADER (10-15 min)
  Login: leader@example.com / password123
  Test Home dashboard
  Test Manage Scouts navigation
  Test all settings
  Document results
 
CALCULATE RESULTS
  Count passing buttons
  Calculate pass rate
  Note any issues
  File tickets for failures
 
REPORT FINDINGS
  90%+ pass = SUCCESS
  <90% pass = FIX & RETRY
 
END
```

---

## QUICK METRICS

| Metric | Value |
|--------|-------|
| Total Buttons | 24+ |
| Test Roles | 3 (Customer, Scout, Leader) |
| Test Screens | 9 (Wallet, Referral History, Home x3, Share x3, Settings x3) |
| Critical Workflows | 3 (complete journey for each role) |
| Estimated Time | 45-60 minutes |
| Success Rate Target | 90%+ |
| Code Errors Fixed | 5 |
| Documentation Pages | 5 |

---

##  WHAT COUNTS AS SUCCESS

 **Button Passes If:**
- Responds immediately to tap
- Shows visual feedback (opacity/press)
- Completes action (share, navigate, toggle)
- Doesn't crash app
- Shows appropriate loading state
- Handles errors gracefully

 **Button Fails If:**
- Doesn't respond to tap
- Causes app crash
- Shows confusing error
- Loading state never disappears
- State doesn't persist
- Broken navigation

---

## SIMULATOR CONTROLS

While testing, use these keys in the terminal:

| Key | Action |
|-----|--------|
| `r` | Reload app |
| `i` | Open iOS Simulator |
| `a` | Open Android Emulator |
| `w` | Open web version |
| `m` | Toggle menu |
| `j` | Open debugger |
| `Ctrl+C` | Stop server |
| `?` | Show all commands |

---

##  TROUBLESHOOTING

### App Won't Start
- Check that Metro is running
- Look for red errors in console
- Restart with `Ctrl+C` then `npm start`

### Button Doesn't Work
- Check console for JavaScript errors
- Reload with `r` key
- Try different user role
- Verify network connection

### Navigation Broken
- Close and reopen app
- Check RootNavigator.tsx routes
- Reload with `r`

### Toggle Won't Update
- Check network connection
- Look for API errors in console
- Toggle should animate (visual feedback)
- Check if state reverts (error handling)

### Share Sheet Won't Open
- On iOS: Check photo permissions
- On Android: Check app permissions
- Try different platform selection
- Reload app

---

## EXAMPLE TESTING LOG

```
TIME: 2:30 PM
ROLE: Customer
TEST: Copy Referral Code Button
RESULT: PASS
NOTES: Alert appeared correctly, button responded immediately

---

TIME: 2:35 PM
ROLE: Customer
TEST: Share Referral Link Button
RESULT: PASS
NOTES: Native share sheet opened, could select Messages, Email, etc.

---

TIME: 2:40 PM
ROLE: Customer
TEST: View Referral History Button
RESULT: PARTIAL
NOTES: Navigation worked but got error loading data. Fallback to empty state.
ACTION: Note error, check console, verify API

---

TOTAL CUSTOMER TESTS: 3/3 buttons working = 100%

```

---

## TARGET PASS RATES BY SECTION

```
Phase 3b (Customer):
 Buttons: 5/5 = 100% target

Phase 3c Scout:
 Home: 1/1 = 100% target
 Share: 2/2 = 100% target
 Settings: 5/5 = 100% target

Phase 3c Leader:
 Home: 2/2 = 100% target
 Scouts: 2/2 = 100% target
 Share: 2/2 = 100% target
 Settings: 5/5 = 100% target

Overall Target: 24/24 = 100% 
Acceptable: 22/24+ = 90%+
Below Target: <22/24 = Needs fixes
```

---

## DOCUMENTATION QUICK LINKS

**Need specific info?**

- Button locations  See `BUTTON_WORKFLOW_VISUAL_MAP.md`
- Test procedures  See `TESTING_EXECUTION_PLAN.md`
- Success criteria  See `TESTING_GUIDE_BUTTON_WORKFLOW.md`
- Checklists  See `TESTING_QUICK_REFERENCE.md`
- Current status  See `TESTING_READY_SUMMARY.md`

---

## GET STARTED NOW

### Step 1: You are here 
You've read this file. Great!

### Step 2: Open One Guide
Pick a guide that matches your learning style:
- Quick person?  TESTING_QUICK_REFERENCE.md
- Detailed person?  TESTING_EXECUTION_PLAN.md
- Visual person?  BUTTON_WORKFLOW_VISUAL_MAP.md

### Step 3: Start Simulator
In terminal, press:
- `i` for iOS
- `a` for Android

### Step 4: Begin Testing
Login and start tapping buttons!

---

## FINAL CHECKLIST

Before you start testing, verify:
- [ ] All code is error-free (5 errors fixed) 
- [ ] Expo server is running 
- [ ] Documentation is created (5 files) 
- [ ] Test credentials ready 
- [ ] Simulator/device available 
- [ ] 45-60 minutes available 
- [ ] Console open for debugging 
- [ ] Screenshots capability ready 

**Everything is ready! Let's test! **

---

**Questions while testing?**
1. Check the appropriate guide (see links above)
2. Check console for errors
3. Reload app with `r` key
4. Document the issue and move on

**Estimated completion:** 45-60 minutes of quality testing

Good luck! 
