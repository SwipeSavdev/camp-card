# Sprint 1.1: Manual Testing & QA Guide

## Overview

This guide covers the manual testing procedures for Sprint 1.1 (Authentication & Role-Based Navigation). Testing can be performed on physical devices or Expo simulators.

**Status:** Sprint 1.1 foundation is complete and ready for testing.

---

## Quick Start

### Setup Test Environment

```bash
# Install dependencies
npm install

# Verify TypeScript compilation
npm run type-check

# Start Expo dev server
npm start
```

Select platform:
- **i** for iOS Simulator
- **a** for Android Emulator
- **w** for web (development browser)
- **e** to Expo Go

---

## Test Scenarios

### 1. Authentication Flow (Core Authentication System)

#### 1.1 Login - Valid Credentials
**Objective:** Verify user can login with valid email/password

**Steps:**
1. Launch app on fresh device/simulator
2. See "Login" screen with email/password fields
3. Enter email: `customer@example.com`
4. Enter password: `password123`
5. Tap "Login" button

**Expected Results:**
- Loading spinner appears (2-3 seconds)
- Screen transitions to main app (Customer tab view)
- User data displayed in settings (if visible)
- Token stored securely (verify in AsyncStorage via dev tools)

**Actual Results:** _______________

---

#### 1.2 Login - Invalid Credentials
**Objective:** Verify error handling for bad credentials

**Steps:**
1. On Login screen
2. Enter email: `invalid@example.com`
3. Enter password: `wrongpassword`
4. Tap "Login" button

**Expected Results:**
- Error message appears below button (red text)
- Message: "Invalid email or password" (or similar)
- Screen stays on Login
- No navigation attempted

**Actual Results:** _______________

---

#### 1.3 Login - Empty Fields
**Objective:** Verify form validation

**Steps:**
1. On Login screen
2. Leave both fields empty
3. Tap "Login" button

**Expected Results:**
- Either: Form blocks submission OR
- Error messages appear for required fields
- No API call made

**Actual Results:** _______________

---

#### 1.4 Signup - New User Registration
**Objective:** Verify new user registration flow

**Steps:**
1. On Login screen, tap "Don't have an account? Sign up"
2. On Signup screen:
 - Full Name: `Test User`
 - Email: `testuser@example.com`
 - Password: `password123` (8+ chars)
 - Invitation Code: `INVITE123` (if required)
3. Tap "Sign Up" button

**Expected Results:**
- User account created
- Auto-login occurs (transitions to main app)
- Or: Show confirmation message then redirect to Login

**Actual Results:** _______________

---

#### 1.5 Signup - Invalid Password
**Objective:** Verify password requirements

**Steps:**
1. On Signup screen
2. Full Name: `Test User`
3. Email: `test@example.com`
4. Password: `pass` (less than 8 chars)
5. Tap "Sign Up"

**Expected Results:**
- Error message appears (red text)
- Message indicates minimum 8 characters
- Form doesn't submit

**Actual Results:** _______________

---

#### 1.6 Logout
**Objective:** Verify user can logout securely

**Steps:**
1. Login as customer user
2. Navigate to Settings tab
3. Tap "Logout" or "Sign Out" button
4. Confirm logout if prompt appears

**Expected Results:**
- User returns to Login screen
- All stored tokens cleared from device
- Previous user data not visible (no persistence)

**Actual Results:** _______________

---

### 2. Role-Based Navigation (Navigation System)

#### 2.1 Customer Role Navigation
**Objective:** Verify customer users see correct tabs/screens

**Steps:**
1. Login as: `customer@example.com` / `password123`
2. Observe bottom tab bar

**Expected Results:**
- Tab 1: Home (or Subscriptions)
- Tab 2: Offers (or Browse)
- Tab 3: Settings
- Customer-specific content displayed

**Actual Results:** _______________

---

#### 2.2 Scout Role Navigation
**Objective:** Verify scout users see correct tabs/screens

**Steps:**
1. Logout
2. Login as: `scout@example.com` / `password123`
3. Observe bottom tab bar

**Expected Results:**
- Tab 1: Dashboard
- Tab 2: Share (or Fundraise)
- Tab 3: Settings
- Scout-specific content displayed

**Actual Results:** _______________

---

#### 2.3 Leader Role Navigation
**Objective:** Verify leader users see correct tabs/screens

**Steps:**
1. Logout
2. Login as: `leader@example.com` / `password123`
3. Observe bottom tab bar

**Expected Results:**
- Tab 1: Dashboard
- Tab 2: Scouts (manage)
- Tab 3: Share
- Tab 4: Settings
- Leader-specific content displayed

**Actual Results:** _______________

---

#### 2.4 Navigation Persistence
**Objective:** Verify selected tab persists when navigating within tabs

**Steps:**
1. Login as customer
2. Tap "Offers" tab
3. Within Offers, navigate to detail screen (if available)
4. Tap "Home" tab
5. Tap "Offers" tab again

**Expected Results:**
- Last selected tab remembered
- Or: Tab content resets to default (acceptable)

**Actual Results:** _______________

---

### 3. UI/Visual Testing

#### 3.1 Login Screen Design
**Objective:** Verify login screen matches design system

**Visual Checks:**
- [ ] Logo/branding visible at top
- [ ] Email input field has placeholder text
- [ ] Password input field masks characters
- [ ] "Login" button has blue background (theme color)
- [ ] "Sign Up" link is visible and styled
- [ ] Form spacing is consistent (padding, margins)
- [ ] Text is readable (contrast, font size)
- [ ] No text overflow on small screens

**Actual Results:** _______________

---

#### 3.2 Signup Screen Design
**Objective:** Verify signup screen matches design system

**Visual Checks:**
- [ ] All 4 form fields visible: Full Name, Email, Password, Invitation Code
- [ ] Fields have proper labels above them
- [ ] Field borders are consistent
- [ ] "Sign Up" button has blue background
- [ ] "Already have account? Login" link visible
- [ ] Form sections are organized logically
- [ ] Error messages display inline (if applicable)

**Actual Results:** _______________

---

#### 3.3 Theme Colors & Spacing
**Objective:** Verify design tokens are applied correctly

**Visual Checks:**
- [ ] Primary buttons use navy blue (#1a365d or similar)
- [ ] Text colors are readable
- [ ] Input field borders are gray
- [ ] Card shadows (if present) are subtle
- [ ] Padding/spacing follows 8px grid
- [ ] Font sizes are consistent

**Actual Results:** _______________

---

### 4. Device/Screen Compatibility

#### 4.1 iPhone SE (375px width)
**Objective:** Verify app works on smallest supported screen

**Steps:**
1. Run on iPhone SE simulator or device
2. Navigate through all screens
3. Check form fields and buttons

**Visual Checks:**
- [ ] No text overflow
- [ ] Buttons are tappable (min 44px height)
- [ ] Form fields fit within screen
- [ ] Keyboard doesn't hide critical buttons

**Actual Results:** _______________

---

#### 4.2 iPhone 14 Pro Max (430px width)
**Objective:** Verify app works on largest supported screen

**Steps:**
1. Run on iPhone 14 Pro Max or simulator
2. Navigate through all screens
3. Check layout

**Visual Checks:**
- [ ] Content doesn't look stretched
- [ ] Spacing is balanced
- [ ] Text is readable at large screen size

**Actual Results:** _______________

---

#### 4.3 Android Device (if available)
**Objective:** Verify app works on Android platform

**Steps:**
1. Run on Android emulator or device
2. Navigate through main flows
3. Check platform-specific behaviors

**Visual Checks:**
- [ ] Back button navigation works
- [ ] Status bar is not obscured
- [ ] Touch gestures work
- [ ] Keyboard handling is correct

**Actual Results:** _______________

---

### 5. Performance Testing

#### 5.1 Login Performance
**Objective:** Verify login completes in acceptable time

**Steps:**
1. On Login screen
2. Measure time from "Login" tap to main app display
3. Repeat 3 times with network simulation (if available)

**Timing:**
- Expected: <2 seconds on normal network
- Acceptable: <3 seconds on slow 3G
- Unacceptable: >5 seconds

**Actual Results:**
- Test 1: _____ seconds
- Test 2: _____ seconds
- Test 3: _____ seconds
- Average: _____ seconds

---

#### 5.2 Navigation Speed
**Objective:** Verify tab switching is responsive

**Steps:**
1. Login as customer
2. Rapidly tap between tabs (Home  Offers  Settings  Home)
3. Measure responsiveness

**Expected Results:**
- Tab switches instantly or <200ms lag
- No freezing or jank
- Smooth animations (if present)

**Actual Results:** _______________

---

### 6. Accessibility Testing (WCAG 2.1 AA)

#### 6.1 Screen Reader Compatibility (iOS)
**Objective:** Verify VoiceOver works with app

**Steps:**
1. Enable VoiceOver: Settings > Accessibility > VoiceOver > On
2. Navigate through Login and Signup screens
3. Verify all elements are read aloud

**Expected Results:**
- [ ] All form fields are announced with labels
- [ ] Button purposes are clear
- [ ] Error messages are announced
- [ ] Navigation order is logical (top to bottom, left to right)

**Actual Results:** _______________

---

#### 6.2 Color Contrast
**Objective:** Verify text meets WCAG AA standards (4.5:1 ratio)

**Visual Checks:**
- [ ] Button text on background: High contrast
- [ ] Error messages (usually red): Readable against background
- [ ] Labels/help text: Readable

**Tools:** Use online contrast checker
- https://webaim.org/resources/contrastchecker/

**Actual Results:** _______________

---

#### 6.3 Touch Target Size
**Objective:** Verify touch targets meet 44pt minimum

**Visual Checks:**
- [ ] All buttons are at least 44pt x 44pt
- [ ] Form fields are at least 44pt tall
- [ ] Tappable elements have space around them

**Actual Results:** _______________

---

### 7. Security Testing

#### 7.1 Token Storage
**Objective:** Verify tokens are stored securely

**Steps:**
1. Login as customer
2. Inspect device storage:
 - iOS: Xcode Device Inspector or React Native Debugger
 - Android: Android Studio Device File Explorer
3. Check token location

**Expected Results:**
- [ ] Tokens stored in Keychain (iOS) or KeyStore (Android)
- [ ] User data only in AsyncStorage (not tokens)
- [ ] No sensitive data in plain text

**Actual Results:** _______________

---

#### 7.2 Password Field Masking
**Objective:** Verify password is not exposed

**Steps:**
1. On Login/Signup screen
2. Enter password
3. Verify characters are masked (not visible as plain text)

**Expected Results:**
- [ ] Password shows as dots/asterisks ()
- [ ] Characters not visible even with device recording
- [ ] Copy/paste disabled (optional but recommended)

**Actual Results:** _______________

---

#### 7.3 Token Refresh
**Objective:** Verify expired tokens are refreshed automatically

**Steps:**
1. Login as customer
2. Keep app in foreground for extended time
3. Verify continued functionality (optional API call)

**Expected Results:**
- [ ] App continues working after token would expire
- [ ] No logout prompts appear unexpectedly
- [ ] Refresh happens silently in background

**Actual Results:** _______________

---

## Test Device Matrix

| Device | OS Version | Screen Size | Status | Notes |
|--------|-----------|-------------|--------|-------|
| iPhone 14 Pro | iOS 17+ | 6.1" | [ ] | |
| iPhone SE (3rd) | iOS 17+ | 4.7" | [ ] | |
| Pixel 7 | Android 13+ | 6.1" | [ ] | |
| iPad (if applicable) | iPadOS 17+ | 10.9" | [ ] | |

---

## Test Execution Checklist

### Pre-Testing
- [ ] Environment setup complete (npm install, npm start)
- [ ] Latest code pulled from main branch
- [ ] TypeScript compilation verified (`npm run type-check`)
- [ ] Device/simulator is clean (clear cache if needed)
- [ ] Network conditions simulated (if possible)

### Testing Phase
- [ ] All test scenarios executed
- [ ] Results recorded in each section
- [ ] Screenshots/videos captured for issues
- [ ] Performance metrics recorded
- [ ] Accessibility audit completed

### Post-Testing
- [ ] Issues documented with steps to reproduce
- [ ] Performance baseline established
- [ ] Accessibility compliance report completed
- [ ] Device compatibility matrix filled out
- [ ] Results communicated to team

---

## Issue Reporting Template

For each issue found, provide:

```
Title: [Brief description]
Severity: Critical | High | Medium | Low
Device: [Device, OS version]
Steps to Reproduce:
1.
2.
3.

Expected: [What should happen]

Actual: [What actually happens]

Screenshots: [Attach images/videos if possible]

Notes: [Any additional context]
```

---

## Sign-Off

**Tester Name:** _________________
**Date:** _________________
**Overall Status:** Pass / Pass with Issues / Fail

**Summary:**
[Brief summary of testing results and any blocking issues]

---

## Appendix: Test Credentials

Use these credentials for manual testing (adjust based on actual backend):

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Customer | customer@example.com | password123 | Can browse offers |
| Scout | scout@example.com | password123 | Can create fundraisers |
| Leader | leader@example.com | password123 | Can manage scouts |
| Admin | admin@example.com | password123 | Can access admin features |

> **Note:** These credentials should match those configured in your development/test backend environment.

---

## Next Steps After Testing

1. **If all tests pass:**
 - Move to Sprint 1.2 (Offer Browsing feature)
 - Schedule team code review
 - Deploy to staging for QA

2. **If issues found:**
 - Prioritize by severity
 - Create tickets for each issue
 - Re-test after fixes
 - Update this document with resolution

3. **Accessibility Issues:**
 - Schedule accessibility audit with specialist
 - Document WCAG violations
 - Create remediation plan

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Sprint:** Sprint 1.1
