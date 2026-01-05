# Sprint 1.1: Performance Testing & Optimization Guide

## Overview

This guide covers performance testing for Sprint 1.1 (Authentication & Role-Based Navigation). The goal is to ensure the app is responsive, fast, and uses resources efficiently on target devices.

**Performance Targets for Sprint 1.1:**
- Login time: < 2 seconds (normal network)
- Tab navigation: < 200ms
-  Battery usage: Minimal (screen on, network active)
-  Memory usage: < 200MB for auth screens
-  App bundle size: Keep under target

---

## Performance Baselines

### Devices for Testing

| Device | OS | Processor | RAM | Network | Target |
|--------|----|-----------|----|---------|--------|
| iPhone SE | iOS 17 | A15 | 4GB | 4G | 2.5s login |
| iPhone 14 | iOS 17 | A16 | 6GB | WiFi | 1.5s login |
| Pixel 6a | Android 13 | Tensor | 6GB | 4G | 2.5s login |
| iPad | iPadOS 17 | A14 | 6GB | WiFi | 1.5s login |

---

## Part 1: Authentication Performance

### 1.1 Login Performance Testing

#### Test Setup
1. Launch app on clean device (restart first)
2. Clear browser cache and app cache
3. Ensure device is at normal operating temperature
4. Use stopwatch/profiler tool to measure

#### Test Procedure

**Cold Start Login (App in memory):**

| Test | Start Time | Event | End Time | Duration |
|------|-----------|-------|----------|----------|
| 1 | 00:00 | Tap Login button | 00:xx | _____ s |
| 2 | 00:00 | Tap Login button | 00:xx | _____ s |
| 3 | 00:00 | Tap Login button | 00:xx | _____ s |
| Avg | - | - | - | **_____ s** |

**Expected:** < 2 seconds on 4G, < 1.5 seconds on WiFi

**Test Conditions:**
- Email: `customer@example.com`
- Password: `password123`
- Network: 4G (simulated if possible)
- Device state: Idle, screen at full brightness

---

#### Network Simulation Testing

Test login with different network conditions:

**Fast Network (WiFi):**
- Expected: 1-2 seconds
- Actual: _____ seconds

**Normal Network (4G LTE):**
- Expected: 2-3 seconds
- Actual: _____ seconds

**Slow Network (3G):**
- Expected: 3-5 seconds
- Actual: _____ seconds

**Tools for Network Simulation:**
- **iOS:** Xcode > Debug > Simulate Network Link Conditioner
- **Android:** Android Studio > Emulator > Extended controls > Network
- **Both:** Charles Proxy (throttle network)

---

### 1.2 Signup Performance Testing

**Test Procedure:**
1. Launch app
2. Tap "Sign up" link
3. Fill form:
 - Full Name: `Test User`
 - Email: `newuser@example.com`
 - Password: `password123`
 - Invitation Code: `INVITE123`
4. Tap "Sign Up" button
5. Measure time to completion

| Test | Start | End | Duration |
|------|-------|-----|----------|
| 1 | 00:00 | 00:xx | _____ s |
| 2 | 00:00 | 00:xx | _____ s |
| 3 | 00:00 | 00:xx | _____ s |
| Avg | - | - | **_____ s** |

**Expected:** < 3 seconds

---

### 1.3 Token Refresh Performance

**Objective:** Verify background token refresh doesn't impact user experience

**Test Procedure:**
1. Login successfully
2. Keep app in foreground for extended period (simulate long session)
3. Perform actions (navigate tabs) every few minutes
4. Monitor if any lag occurs during token refresh

**Checks:**
- [ ] No perceivable lag during refresh
- [ ] No "loading" spinners appear
- [ ] Navigation remains responsive
- [ ] Refresh happens silently in background

**Result:** Pass / Acceptable / Fail
**Notes:** _________________________

---

## Part 2: Navigation Performance

### 2.1 Tab Navigation Speed

**Objective:** Verify tab switching is instantaneous

**Test Procedure:**
1. Login as customer user
2. Rapidly tap between tabs: Home  Offers  Settings  Home
3. Measure response time

| Tab Switch | Duration (ms) |
|-----------|--------------|
| Home  Offers | _____ ms |
| Offers  Settings | _____ ms |
| Settings  Home | _____ ms |
| Avg | **_____ ms** |

**Expected:** < 200ms (should feel instant)

**Visual Check:**
- [ ] No visible delay/jank
- [ ] Smooth transition animation
- [ ] No content flashing
- [ ] Tab icon updates immediately

---

### 2.2 Screen Navigation Speed

**Objective:** Verify screen transitions are smooth

**Test Procedure:**
1. From Home tab, navigate to any nested screen (if available)
2. Press back to return
3. Measure transition time

| Transition | Duration (ms) |
|-----------|--------------|
| Open  Detail | _____ ms |
| Detail  Back | _____ ms |

**Expected:** < 300ms for transitions

---

### 2.3 Role Switching Performance

**Objective:** Verify switching roles (logout/login different user) is efficient

**Test Procedure:**
1. Login as customer
2. Logout
3. Login as scout
4. Measure total time

| Step | Duration |
|------|----------|
| Logout | _____ s |
| Login (scout) | _____ s |
| Total | **_____ s** |

**Expected:** < 5 seconds total

---

## Part 3: Memory & CPU Performance

### 3.1 Memory Profiling

#### Setup
1. **iOS:** Xcode > Debug Navigator > Memory
2. **Android:** Android Studio > Profiler > Memory

#### Test Procedure

**Idle Memory (Auth Screens Only):**

| Device | Initial Memory | After Login | After 2 Minutes | Peak |
|--------|--------------|-------------|-----------------|------|
| iPhone SE | _____ MB | _____ MB | _____ MB | _____ MB |
| Pixel 6a | _____ MB | _____ MB | _____ MB | _____ MB |

**Target:** < 150MB for authentication screens

---

#### Memory Leak Testing

**Test Procedure:**
1. Login/logout 5 times rapidly
2. Watch memory profiler
3. Check if memory returns to baseline after logout

**Expected:** Memory should decrease when user logs out

**Result:** Pass / Potential leak / Leak detected

**Memory After Logouts:**
- Before: _____ MB
- After 5 cycles: _____ MB
- Difference: **_____ MB** (should be < 10MB increase)

---

### 3.2 CPU Performance

#### Setup
1. **iOS:** Xcode > Debug Navigator > CPU
2. **Android:** Android Studio > Profiler > CPU

#### Test During Login

| Activity | CPU Usage | Expected |
|----------|-----------|----------|
| Idle screen | _____ % | < 10% |
| Typing in field | _____ % | < 15% |
| Sending login request | _____ % | 30-50% |
| Processing response | _____ % | 20-40% |
| Navigation transition | _____ % | 40-60% |
| Idle after login | _____ % | < 10% |

**Expected:** CPU should spike during network activity, then drop to idle

---

## Part 4: Battery Impact

### 4.1 Battery Drain Testing

#### Setup
1. Full device charge (100%)
2. Brightness at 50%
3. Close other apps
4. Enable Battery Info app or equivalent

#### Test Procedure

**30-Minute Auth Screen Usage:**
1. Launch app at 100% battery
2. Run for 30 minutes, repeatedly:
 - Login
 - Browse (simulate 20 seconds)
 - Logout
3. Check battery level

| Time | Battery Level | Drain Rate |
|------|--------------|-----------|
| Start | 100% | - |
| 10 min | _____ % | _____ %/min |
| 20 min | _____ % | _____ %/min |
| 30 min | _____ % | _____ %/min |
| **Avg Drain** | - | **_____ %/min** |

**Expected:** < 1% per minute on normal devices

---

### 4.2 Background Battery Usage

**Objective:** Verify app doesn't drain battery when in background

#### Test Procedure
1. Login successfully
2. Put app in background (press home button)
3. Wait 5 minutes
4. Check battery level

**Expected:** No measurable drain while in background

**Result:** Pass / Minor drain / Significant drain
**Battery loss:** _____ %

---

## Part 5: Network Performance

### 5.1 Request/Response Monitoring

#### Setup
1. **iOS:** Instruments > System Trace or Network Link Conditioner
2. **Android:** Android Profiler > Network
3. **Both:** Charles Proxy (recommended)

#### Test - Login Request

**Monitor during login:**

| Metric | Value |
|--------|-------|
| Request size | _____ KB |
| Response size | _____ KB |
| Latency | _____ ms |
| DNS lookup | _____ ms |
| SSL/TLS handshake | _____ ms |
| Request transmission | _____ ms |
| Response transmission | _____ ms |
| Processing time | _____ ms |

**Target:**
- Request: < 2KB
- Response: < 10KB
- Total latency: < 2 seconds

---

### 5.2 Payload Optimization

**Check API Response Size:**

Expected login response structure:
```json
{
 "access_token": "...",
 "refresh_token": "...",
 "user": {
 "id": "...",
 "email": "...",
 "name": "...",
 "role": "...",
 "tenantId": "..."
 }
}
```

**Size Analysis:**
- Estimated response: _____ bytes
- Actual response: _____ bytes
- Optimization: Good / Could be smaller / Too large

---

## Part 6: Bundle Size Analysis

### 6.1 App Bundle Size

**Check compiled app size:**

```bash
# Build release app
npm run build # or equivalent for mobile

# Measure size
ls -lh # Check compiled artifact size
```

| Metric | Size | Target |
|--------|------|--------|
| iOS IPA | _____ MB | < 100MB |
| Android APK | _____ MB | < 100MB |
| JavaScript bundle | _____ KB | < 500KB |
| Assets | _____ MB | < 20MB |

---

### 6.2 Code Coverage Analysis

**JavaScript modules by size:**

```bash
# Generate bundle analysis
npm run analyze # if configured
```

| Module | Size | Usage |
|--------|------|-------|
| React Native | _____ KB | Required |
| Navigation | _____ KB | Required |
| Zustand (state) | _____ KB | Required |
| Axios (HTTP) | _____ KB | Required |
| Auth screens | _____ KB | Required |
| Unused | _____ KB | Remove? |

---

## Part 7: Performance Optimization Checklist

### Code-Level Optimizations

- [ ] Auth screens use functional components (no class components)
- [ ] Memoization applied where needed (React.memo)
- [ ] Unused imports removed
- [ ] Console logs removed in production
- [ ] Heavy computations moved off main thread (if applicable)

### Bundle Optimizations

- [ ] Code splitting enabled (if applicable)
- [ ] Tree-shaking configured
- [ ] Minification enabled for production
- [ ] Dead code removed
- [ ] Unused dependencies removed

### Network Optimizations

- [ ] API responses are minimal
- [ ] GZIP compression enabled
- [ ] CDN configured for static assets
- [ ] Caching strategy implemented
- [ ] Request batching considered

### Memory Optimizations

- [ ] No memory leaks detected
- [ ] Image loading is lazy
- [ ] Unused state cleared on logout
- [ ] Event listeners properly cleaned up
- [ ] Large data structures optimized

---

## Performance Regression Prevention

### Continuous Monitoring

**Automated Performance Tests:**
- [ ] Set up performance budget in build system
- [ ] Monitor bundle size with each commit
- [ ] Track rendering performance metrics
- [ ] Alert on regressions > 10%

**Baseline Metrics (Establish Now):**

| Metric | Baseline | Alert Threshold |
|--------|----------|-----------------|
| Login time | _____ s | +0.5s |
| Tab nav | _____ ms | +100ms |
| Bundle size | _____ KB | +50KB |
| Memory peak | _____ MB | +50MB |

---

## Performance Testing Results Summary

### Overall Assessment

| Category | Status | Details |
|----------|--------|---------|
| Auth Performance | / / | |
| Navigation Performance | / / | |
| Memory Usage | / / | |
| CPU Usage | / / | |
| Battery Impact | / / | |
| Network Performance | / / | |
| Bundle Size | / / | |

### Issues Found

| Issue | Severity | Impact | Remediation |
|-------|----------|--------|-------------|
| | | | |
| | | | |

### Optimization Recommendations

**Priority 1 (Critical):**
-

**Priority 2 (High):**
-

**Priority 3 (Medium):**
-

---

## Sign-Off

**Tester Name:** _________________
**Date:** _________________
**Overall Status:** Pass / Pass with Optimizations / Fail

**Baseline Performance Established:**
- [ ] Yes - Ready for regression monitoring
- [ ] No - Need to re-test

**Next Steps:**
1. [Action item]
2. [Action item]
3. [Action item]

---

## Appendix: Performance Testing Tools

### iOS Tools
- **Xcode Instruments:** Time Profiler, System Trace, Memory
- **Xcode Debug Navigator:** Real-time memory/CPU/energy
- **Apple Network Link Conditioner:** Network simulation
- **App Store Connect:** Real-world performance data

### Android Tools
- **Android Profiler:** CPU, Memory, Network, Energy
- **Android Studio Device Monitor:** System-wide monitoring
- **Android Emulator:** Network throttling
- **Firebase Performance Monitoring:** Production metrics

### Cross-Platform Tools
- **Charles Proxy:** Network request inspection/throttling
- **React DevTools Profiler:** React rendering performance
- **Sentry:** Real-world error & performance monitoring
- **New Relic:** Application performance monitoring

### Benchmarking
- **Lighthouse:** Web performance (if web version)
- **WebPageTest:** Network performance simulation
- **React Native Benchmark:** Component rendering

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Sprint:** Sprint 1.1
