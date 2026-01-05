# Sprint 1.1 QA Quick Reference Card

**Print this page and keep it handy during testing**

---

## Quick Start (5 min)

```bash
cd repos/camp-card-mobile
npm install
npm run type-check # Should pass
npm start # Select platform (i for iOS)
```

**Login Test Credentials:**
```
Customer: customer@example.com / password123
Scout: scout@example.com / password123
Leader: leader@example.com / password123
```

---

## Core Test Scenarios (7 total)

### 1. Login - Valid
- Email: `customer@example.com`
- Password: `password123`
- Expected: Navigate to main app (Customer tabs)

### 2. Login - Invalid
- Email: `invalid@example.com`
- Password: `wrongpassword`
- Expected: Error message, stay on login

### 3. Signup
- Full Name: `Test User`
- Email: `new@example.com`
- Password: `password123` (8+ chars)
- Expected: Account created, auto-login

### 4. Logout
- Expected: Return to login screen
- Verify: No user data persists

### 5. Role Navigation
- Test: Switch between Customer/Scout/Leader
- Verify: Different tabs show for each role

### 6. Device Compatibility
- iPhone SE (375px) - Smallest
- iPhone 14 Pro (430px) - Largest
- Android (if available)

### 7. Performance
- Login time: < 2 seconds (target)
- Tab switch: < 200ms
- No lag or freezing

---

## Test Checklists

### Functional Testing
- [ ] Login works
- [ ] Signup works
- [ ] Logout works
- [ ] Role navigation correct
- [ ] Error messages display
- [ ] No crashes

### Visual Testing
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] Layout is centered
- [ ] Colors match design
- [ ] Spacing is consistent
- [ ] No text overflow

### Device Testing
- [ ] Small screen (iPhone SE)
- [ ] Large screen (iPhone 14+)
- [ ] Android emulator
- [ ] Both orientations
- [ ] Various brightness levels

### Accessibility
- [ ] VoiceOver announces elements
- [ ] Focus indicators visible
- [ ] Color contrast good
- [ ] Touch targets > 44pt
- [ ] Keyboard navigation works

### Performance
- [ ] Login < 3 seconds
- [ ] Tab switch instant
- [ ] No memory leaks
- [ ] Battery drain acceptable
- [ ] No UI stuttering

### Security
- [ ] Password is masked
- [ ] Tokens stored securely
- [ ] Logout clears data
- [ ] No sensitive data in logs

---

## Documentation Guides

| Scenario | Read | Duration |
|----------|------|----------|
| Setup | DEVELOPMENT_QUICK_START.md | 5 min |
| Testing | SPRINT_1_1_MANUAL_TESTING_GUIDE.md | 20 min |
| Accessibility | SPRINT_1_1_ACCESSIBILITY_AUDIT.md | 30 min |
| Performance | SPRINT_1_1_PERFORMANCE_GUIDE.md | 20 min |

---

## Tools You'll Need

**Required:**
- Xcode (iOS) or Android Studio (Android)
- Network throttling (Charles Proxy recommended)
- Accessibility tools (VoiceOver/TalkBack built-in)

**Optional:**
- Network Link Conditioner (Apple)
- React Native Debugger
- Performance monitoring tools

---

## Red Flags 

Stop testing and escalate if you see:

 **App Crashes**
- Note exactly what you were doing
- Take screenshot if possible
- Report immediately

 **Data Leaks**
- Tokens visible in plain text
- User data persists after logout
- Sensitive data in network requests

 **Security Issues**
- Password not masked
- Tokens in local storage (not Keychain)
- No HTTPS connection

 **Performance Issues**
- Login > 5 seconds
- App freezes
- UI stuttering/jank
- High memory usage

---

## Issue Reporting Template

```
Title: [Clear description]
Severity: Critical | High | Medium | Low

Steps to Reproduce:
1.
2.
3.

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Device: [iPhone SE / Pixel 6a / etc]
OS Version: [iOS 17 / Android 13 / etc]
Screenshot: [Attach if visual]

Additional Notes:
[Any other context]
```

---

## Success Criteria

### Must Pass
- [ ] No app crashes
- [ ] Login/logout works
- [ ] Roles switch correctly
- [ ] TypeScript compiles
- [ ] < 3 second login

### Should Pass
- [ ] Accessibility AA compliant
- [ ] Works on 4+ devices
- [ ] User-friendly errors
- [ ] Design system matched

### Nice to Have
- [ ] Performance optimized
- [ ] Advanced accessibility
- [ ] Offline capability

---

## Performance Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| Login Time | < 2s | < 3s | > 5s |
| Tab Switch | < 200ms | < 300ms | > 500ms |
| Memory | < 150MB | < 200MB | > 300MB |
| Battery | < 1%/min | < 2%/min | > 3%/min |

---

## Device Testing Matrix

| Device | Screen | Status | Notes |
|--------|--------|--------|-------|
| iPhone SE | 375px | [ ] | Smallest |
| iPhone 14 | 393px | [ ] | Standard |
| iPhone 14 Pro Max | 430px | [ ] | Largest |
| Pixel 6a | 412px | [ ] | Android |

---

## Accessibility Quick Checks

**Can I use it with VoiceOver?**
- Settings > Accessibility > VoiceOver > On
- Swipe right to navigate
- Double-tap to activate
- All elements announced?

**Can I see it without colors?**
- Is text readable?
- Are buttons findable?
- Is contrast good (4.5:1)?

**Can I use it with keyboard?**
- Tab through elements
- Enter/Space activates buttons
- Focus visible?

**Can anyone use it?**
- Touch targets > 44pt?
- Text scalable?
- No flashing?

---

## Day-by-Day Testing Plan

**Day 1-2: Functional Testing**
- Login flows
- Navigation
- Device compatibility
- ~16 hours

**Day 3: Accessibility Audit**
- WCAG 2.1 checks
- VoiceOver/TalkBack
- ~8 hours

**Day 4: Performance Profiling**
- Time measurements
- Memory/CPU/Battery
- ~8 hours

**Day 5: Bug Fixes & Sign-Off**
- Re-test fixes
- Final approval
- ~4 hours

---

## Common Issues & Fixes

**App won't start:**
```
npm install
npm run type-check
npm start
```

**Simulator slow:**
- Close other apps
- Restart simulator
- Clear build cache

**Network errors:**
- Check backend API running
- Verify API URL correct
- Use mock data if needed

**Password not masked:**
- Check input field type
- Verify secureTextEntry={true}
- Test on device

**Performance slow:**
- Check network speed
- Profile CPU/memory
- Close other apps

---

## Contacts

**Questions about Testing:** QA Lead
**Code Issues:** Dev Team
**Timeline Issues:** Scrum Master
**General Questions:** Team Standup

---

## Checklist Before Signing Off

- [ ] All test scenarios executed
- [ ] Results documented
- [ ] Screenshots taken
- [ ] Issues reported
- [ ] Performance baseline set
- [ ] Accessibility audit complete
- [ ] Device matrix filled
- [ ] Team notified
- [ ] Sign-off document completed

---

**Keep this handy during testing! **

---

*For detailed procedures, see SPRINT_1_1_MANUAL_TESTING_GUIDE.md*
