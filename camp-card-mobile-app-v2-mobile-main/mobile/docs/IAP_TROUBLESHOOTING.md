# iOS In-App Purchase Troubleshooting Guide

## Problem: "0 Products Available" / "Product Unavailable"

Your IAP products exist in App Store Connect but are not being returned to the app. This is a common configuration issue, not a code problem.

## Root Cause Checklist

### 1. ✅ Products Must Be Attached to App Version (MOST COMMON ISSUE)

Products in "Ready to Submit" status are **not automatically available** to your app. You must explicitly attach them to an app version:

1. Go to **App Store Connect** → **My Apps** → **Camp Card**
2. Click on your app version under **iOS App** (e.g., "1.0 Prepare for Submission")
3. Scroll down to **In-App Purchases** section
4. Click the **+** button to add in-app purchases
5. Select all 4 products:
   - `org.bsa.campcard.cards.1`
   - `org.bsa.campcard.cards.3`
   - `org.bsa.campcard.cards.5`
   - `org.bsa.campcard.cards.10`
6. Click **Done**

**Important**: Each new app version needs the IAPs attached again.

### 2. ✅ Paid Applications Agreement

You must have an active "Paid Applications" agreement:

1. Go to **App Store Connect** → **Agreements, Tax, and Banking**
2. Ensure the **Paid Apps** contract is active (green checkmark)
3. If it shows "Action Required", complete the banking and tax information

### 3. ✅ Sandbox Tester Configuration

IAP testing requires a Sandbox Apple ID:

1. **Create Sandbox Tester** (if not already done):
   - App Store Connect → **Users and Access** → **Sandbox** tab
   - Click **+** to add a new tester
   - Use any email (can be fake, but must be unique)
   - Set a password you'll remember

2. **Sign in on Test Device**:
   - **iOS 14+**: Settings → App Store → **Sandbox Account** → Sign in
   - **iOS 13**: Sign out of your real Apple ID in Settings → iTunes & App Store, then when you make a purchase in the app, you'll be prompted to sign in with Sandbox

3. **Verify**: The Sandbox Account section should show your sandbox tester email

### 4. ✅ App Build Requirements

IAP **only works** in these scenarios:

| Build Type | IAP Works? | Notes |
|------------|------------|-------|
| Expo Go | ❌ No | Native module not available |
| Development Build | ✅ Yes | Must be built with `expo-iap` plugin |
| TestFlight | ✅ Yes | Uses Sandbox environment |
| App Store | ✅ Yes | Production environment |

**Solution**: Build and install via TestFlight for testing:
```bash
cd mobile
npx eas build --profile preview --platform ios
# Then submit to TestFlight and install
```

### 5. ✅ Bundle ID Match

The bundle ID in your app must exactly match App Store Connect:

- **app.json**: `"bundleIdentifier": "org.bsa.campcard"` ✅
- **App Store Connect**: Should be `org.bsa.campcard` ✅

### 6. ✅ Product ID Format

Product IDs must match exactly (case-sensitive):

| Code Constant | Expected Product ID |
|---------------|---------------------|
| `IAP_PRODUCTS.CARDS_1` | `org.bsa.campcard.cards.1` |
| `IAP_PRODUCTS.CARDS_3` | `org.bsa.campcard.cards.3` |
| `IAP_PRODUCTS.CARDS_5` | `org.bsa.campcard.cards.5` |
| `IAP_PRODUCTS.CARDS_10` | `org.bsa.campcard.cards.10` |

Verify in App Store Connect → Features → In-App Purchases that the Product IDs match exactly.

## Step-by-Step Fix Procedure

### Step 1: Attach IAPs to App Version

```
App Store Connect → My Apps → Camp Card → iOS App Version →
Scroll to "In-App Purchases" → Click "+" → Select all 4 products → Done
```

### Step 2: Verify Agreements

```
App Store Connect → Agreements, Tax, and Banking →
Ensure "Paid Apps" shows green checkmark
```

### Step 3: Configure Sandbox Tester on Device

```
On iPhone: Settings → App Store → Sandbox Account →
Sign in with sandbox tester credentials
```

### Step 4: Build TestFlight Version

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile
npx eas build --profile preview --platform ios
```

After build completes:
1. Go to App Store Connect → TestFlight
2. Wait for build processing
3. Add yourself as internal tester
4. Install via TestFlight app on device

### Step 5: Test Purchase Flow

1. Open app from TestFlight
2. Navigate to "Buy More Cards"
3. Select a package (1, 3, 5, or 10 cards)
4. Tap Purchase button
5. Apple IAP sheet should appear
6. Sign in with Sandbox account when prompted
7. Complete purchase

## Debugging Tips

### Check Console Logs

The app logs IAP activity. Connect device to Mac and use Console.app or Xcode to see:

```
[IAP] Initializing StoreKit connection...
[IAP] Connection result: true Connected: true
[IAP] Fetching products with SKUs: ["org.bsa.campcard.cards.1", ...]
[IAP] Fetched products: 4 ["org.bsa.campcard.cards.1", ...]
```

If you see:
```
[IAP] Fetched products: 0 []
[IAP] No products returned. Ensure products are configured...
```

This confirms App Store Connect configuration issue.

### StoreKit Configuration File (Optional)

For local development testing without App Store Connect, you can create a StoreKit Configuration file:

1. In Xcode, File → New → File → StoreKit Configuration File
2. Add products matching your Product IDs
3. In scheme settings, set the StoreKit Configuration

This only works in Xcode simulator builds, not EAS/Expo builds.

## Product Status Reference

| Status in ASC | Available to App? |
|--------------|-------------------|
| Ready to Submit | ❌ (must attach to version) |
| Waiting for Review | ✅ (in sandbox) |
| Approved | ✅ |
| Rejected | ❌ |
| Developer Action Needed | ❌ |

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Product Unavailable" | Products not attached to version | Attach in App Store Connect |
| "Cannot find native module 'ExpoIap'" | Running in Expo Go | Use TestFlight build |
| "Purchase failed: Unknown" | Sandbox not signed in | Configure Sandbox Account |
| "Receipt validation failed" | Backend not configured | Check backend Apple IAP endpoint |

## Support

If products still don't load after completing all steps:

1. Wait 30-60 minutes (Apple caches product data)
2. Delete and reinstall the app
3. Sign out and back into Sandbox Account
4. Contact Apple Developer Support if issue persists

## Files Reference

| File | Purpose |
|------|---------|
| `src/services/iapService.ts` | StoreKit 2 wrapper service |
| `src/hooks/useIAP.ts` | React hook for IAP state |
| `src/config/constants.ts` | Product ID constants |
| `app.json` | expo-iap plugin configuration |
