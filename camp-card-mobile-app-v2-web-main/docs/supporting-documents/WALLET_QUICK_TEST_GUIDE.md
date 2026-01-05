# Wallet UI/UX Update - Quick Start Testing Guide

**Updated:** December 27, 2025
**Status:** Ready to Test

---

## Quick Start (3 Minutes)

### Step 1: Start the App
```bash
cd repos/camp-card-mobile
npm start
```

### Step 2: Open in Expo Go
- **iPhone:** Open Camera app  Scan QR code
- **Android:** Open Expo Go app  Scan QR code
- **Simulator:** Press `i` (iOS) or `a` (Android)

### Step 3: Navigate to Wallet
1. Look at the bottom navigation bar
2. You should see: **Home | Dashboard | Wallet | Offers | Settings**
3. Tap the **Wallet** tab ( icon)

---

## What You'll See

### Navigation Bar (Bottom)
```
 Home Dashboard  Wallet  Offers  Settings
```
- First tab is **Home** (NEW!)
- Active tab is **RED**
- Inactive tabs are **GRAY**

### Wallet Screen

#### Part 1: Card Front (Default)
```

  Camp Card Logo 
 
 [Branded Background Image] 
 
    7961
 
 CARDHOLDER  
 Emily Rodriguez 

```

**What to look for:**
- Camp Card logo in center
- Beautiful branded background
- Truncated card number ( 7961) - bottom right
- "Emily Rodriguez" name - bottom left
- Flip button (white circle with swap icon) - bottom right

#### Part 2: Card Back (After Tapping Flip)
```

  (Stripe) 
 
 CARD NUMBER 
 0000 1264 7961 19 
 
 CARDHOLDER 
 EMILY RODRIGUEZ 
 
  

```

**What to look for:**
- Dark navy blue background
- White magnetic stripe at top
- Full card number in monospace
- "EMILY RODRIGUEZ" in uppercase
- Smooth 3D flip animation (~600ms)

#### Part 3: Balance Section (Below Card)
```

 Available Balance  
 $250.00 
 [Blue Background] 

```

**What to look for:**
- **BLUE** background (not green!)
- "$250.00" balance displayed
- Wallet icon on the right

#### Part 4: Refer Friends Section
- Referral code display
- Share button
- Quick links to share

#### Part 5: Quick Actions
- Card security option
- Transaction history option

---

## Color Verification Checklist

As you test, verify these brand colors:

### Colors You Should See
- **Card Back:** Dark Navy (#000C2F)
- **Balance Card:** Blue (#0A4384) - NOT GREEN
- **Active Tab:** Red (#D9012C)
- **Inactive Tabs:** Gray/Muted
- **Text:** Dark Navy or White

### Colors You Should NOT See
- Green (#39D98A or #00B86B)
- Bright primary red on balance
- Any other bright colors

---

## Interactive Tests

### Test 1: Card Flip Animation
1. Open Wallet screen
2. Tap the flip button ( white circle)
3. **Expected:** Smooth 3D card flip animation
4. **Duration:** Should take ~0.6 seconds
5. Tap again to flip back

**What to check:**
- Is it smooth? (no jank)
- Does it take about 0.6 seconds?
- Can you flip back and forth?
- Is the animation natural-looking?

 **Pass if:** Smooth flip animation visible

### Test 2: Card Number Security
1. View front of card
2. **Expected:** See `   7961`
3. Flip to back
4. **Expected:** See full number `0000 1264 7961 19`

**What to check:**
- Is front number truncated?
- Is back number full?
- Does it match: 0000 1264 7961 19?

 **Pass if:** Truncated on front, full on back

### Test 3: Navigation Tabs
1. Look at bottom navigation bar
2. **Expected:** 5 tabs visible: Home, Dashboard, Wallet, Offers, Settings
3. Tap **Home** (1st tab)
4. **Expected:** Shows Home screen
5. Tap back to **Wallet** (3rd tab)
6. **Expected:** Shows Wallet screen again

**What to check:**
- All 5 tabs present?
- Are icons visible?
- Is Wallet tab 3rd position?
- Active tab is RED?
- Can navigate to each?

 **Pass if:** All 5 tabs work, Wallet is 3rd, Home is 1st

### Test 4: User Data
1. View front of card
2. **Expected:** See "Emily Rodriguez"
3. View balance section
4. **Expected:** See "$250.00"

**What to check:**
- Correct name?
- Correct balance?
- Proper formatting?

 **Pass if:** Name is Emily Rodriguez, balance is $250.00

### Test 5: Brand Colors
1. View card back
2. **Expected:** Should be dark navy, NOT red or green
3. View balance section
4. **Expected:** Should be blue, NOT green
5. Tap a tab
6. **Expected:** Active tab should be red

**What to check:**
- Card back is navy (dark)?
- Balance is blue?
- No green colors?
- Active tab is red?

 **Pass if:** Navy card back, blue balance, red active tab

### Test 6: Referral Section
1. Scroll down on Wallet
2. **Expected:** See "Refer Friends" section
3. Look for referral code
4. **Expected:** Should show code like "SCOUT-XXXXXX"
5. Tap share button
6. **Expected:** Share dialog opens

**What to check:**
- Referral section visible?
- Code displays?
- Share button works?

 **Pass if:** Referral section works and share opens

### Test 7: Quick Actions
1. Scroll to bottom
2. **Expected:** See quick action buttons
3. Tap on one
4. **Expected:** Dialog or action appears

**What to check:**
- Quick actions visible?
- Buttons responsive?

 **Pass if:** Quick actions section present and tappable

---

## Troubleshooting

### Issue: Card shows generic icon instead of logo
**Solution:** Make sure assets are loaded
```bash
npm start # Restart the app
```

### Issue: Card flip is jerky or slow
**Solution:** This is normal on first load. Check:
- Is Expo running on your device?
- Try pressing `r` to reload

### Issue: Balance shows green instead of blue
**Solution:** App might be outdated
```bash
npm start --clear
```

### Issue: Only 4 tabs instead of 5
**Solution:** Home tab wasn't imported correctly
- Check that CustomerHome is imported in RootNavigator.tsx
- Verify the import line exists

### Issue: App crashes when opening Wallet
**Solution:** Assets might be missing
```bash
# Check that images exist:
ls -la assets/images/campcard_*.png
```

---

## Test Results Template

```markdown
### Test Date: [DATE]
### Tester: [NAME]
### Device: [iPhone 12/Simulator/etc]

#### Functionality Tests
- [ ] Card flip animation smooth
- [ ] Card flip takes ~600ms
- [ ] Front shows truncated number
- [ ] Back shows full number
- [ ] 5 tabs visible
- [ ] Home is 1st tab
- [ ] Wallet is 3rd tab
- [ ] Referral code displays
- [ ] Share button works

#### Visual Tests
- [ ] Card back is navy (dark)
- [ ] Balance card is blue
- [ ] No green colors
- [ ] Active tab is red
- [ ] Logo visible on front
- [ ] Proper shadows on card
- [ ] Text is readable
- [ ] Layout is centered

#### Overall
- [ ] App runs smoothly
- [ ] No crashes
- [ ] Responsive to taps
- [ ] Proper spacing

**Overall Status:** PASS / FAIL
**Notes:** [Any issues or observations]
```

---

## Success Criteria

### You'll Know It's Working When...

1. **Visual**
 - Card has branded logo
 - Card has navy background on back
 - Balance section is BLUE (not green)
 - Active tab is RED

2. **Interactive**
 - Card flips smoothly
 - Can flip back and forth
 - 5 tabs at bottom
 - Can navigate between tabs

3. **Data**
 - Shows "Emily Rodriguez"
 - Shows "$250.00"
 - Shows card number
 - Referral code visible

4. **Performance**
 - App launches in <2 seconds
 - Card flip takes ~0.6 seconds
 - Tabs respond instantly
 - No lag when scrolling

---

##  Key Files Updated

**If you need to investigate:**
- Wallet screen: `src/uiux/screens/customer/Wallet.tsx`
- Navigation: `src/navigation/RootNavigator.tsx`
- Theme colors: `src/uiux/theme.ts`
- Images: `assets/images/campcard_bg.png`, `assets/images/campcard_lockup_left.png`

---

## That's It!

You're all set to test the new Wallet UI/UX. The main things to verify are:

1. **Card looks professional** with logo and branded background
2. **Colors match brand** (blue not green, navy card back)
3. **Home tab is first** in navigation
4. **Animation is smooth** when flipping
5. **User data shows correctly** (Emily Rodriguez, $250.00)

Enjoy testing! 

---

**Questions?** Check the detailed documentation:
- Full details: `WALLET_UI_FINALIZATION_COMPLETE.md`
- Visual guide: `WALLET_UI_VISUAL_GUIDE.md`
- Implementation: `WALLET_IMPLEMENTATION_SUMMARY.md`

