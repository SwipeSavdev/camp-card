# Google Play Billing Integration Guide

## 1. Google Play Product IDs Catalog

Use these Product IDs when creating products in Google Play Console > Monetization.

### Subscriptions (Auto-Renewable)

Create a Subscription Group called **"Camp Card Annual"** first, then add these base plans:

| Product ID | Type | Price | Description |
|------------|------|-------|-------------|
| `org.bsa.campcard.subscription.annual` | Auto-renewable subscription | $14.99/year | Annual Camp Card subscription (direct purchase) |
| `org.bsa.campcard.subscription.annual.scout` | Auto-renewable subscription | $9.99/year | Annual Camp Card subscription (scout referral discount) |

**Subscription Configuration:**
- Billing Period: 1 year
- Grace Period: 3 days (recommended)
- Free Trial: **NONE** (see Section 4)
- Proration Mode: Immediate without proration

### One-Time Products (Consumables)

| Product ID | Type | Price | Quantity | Description |
|------------|------|-------|----------|-------------|
| `org.bsa.campcard.cards.1` | Consumable | $14.99 | 1 card | Single Camp Card purchase |
| `org.bsa.campcard.cards.3` | Consumable | $44.99 | 3 cards | 3 Camp Cards bundle |
| `org.bsa.campcard.cards.5` | Consumable | $74.99 | 5 cards | 5 Camp Cards bundle |
| `org.bsa.campcard.cards.10` | Consumable | $149.99 | 10 cards | 10 Camp Cards bundle |

**Notes:**
- These match the existing iOS IAP products exactly
- Consumable products must be "consumed" after purchase to allow re-purchase
- Backend creates the Camp Card entities after receipt verification

---

## 2. Cards Logic Clarification

### What is a "Camp Card"?

A Camp Card is a **digital discount subscription** that grants the holder access to merchant offers for one year. Cards are the core product of the BSA fundraising program.

### Card Lifecycle States

```
PURCHASED → UNUSED → ACTIVE → EXPIRED
                ↓
              GIFTED → CLAIMED (by recipient)
```

| State | Description |
|-------|-------------|
| `UNUSED` | Card purchased but not yet activated. Sits in user's inventory. |
| `ACTIVE` | Currently active card. User can redeem merchant offers. Only ONE active card per user. |
| `EXPIRED` | Card has passed its 1-year validity period. |
| `GIFTED` | Card sent to another person. Pending their claim. |

### Card Purchase Flow

1. User selects quantity (1, 3, 5, or 10 cards)
2. Payment processed (Google Play Billing on Android, Apple IAP on iOS)
3. Backend verifies receipt with store servers
4. Backend creates `CampCard` entities with status `UNUSED`
5. User can activate a card to make it `ACTIVE`
6. User can gift unused cards to others

### Key API Endpoints (cardsApi)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/cards/purchase` | Purchase new cards (legacy Authorize.net - Android only) |
| `GET /api/v1/cards/my-cards` | Get user's card inventory |
| `POST /api/v1/cards/{id}/activate` | Activate an unused card (replaces current active card) |
| `POST /api/v1/cards/{id}/gift` | Gift an unused card to someone |
| `GET /api/v1/cards/claim/{token}` | Get gift details (public) |
| `POST /api/v1/cards/claim/{token}` | Claim a gifted card |

### Card Activation Rules

- Only **one card can be active** at a time per user
- Activating a new card **replaces** the current active card
- Replaced cards are NOT lost - they become "replaced" status for audit
- Cards expire 1 year from activation (not purchase) date

### Gift Flow

1. User calls `POST /api/v1/cards/{id}/gift` with recipient email
2. Backend generates claim token and sends email to recipient
3. Recipient clicks link → web page → `POST /api/v1/cards/claim/{token}`
4. Card ownership transfers to recipient (new or existing account)

---

## 3. Test Credentials

### Backend API Test Accounts

| Role | Email | Password |
|------|-------|----------|
| National Admin | `admin@campcard.org` | `Password123` |
| Scout | `test@campcard.org` | `Password123` |

### API Base URL

- **Production**: `https://api.campcardapp.org`
- **Development**: `http://localhost:7010`

### Google Play Testing

To test Google Play Billing:

1. **License Testing** (Google Play Console > Setup > License testing)
   - Add your test Gmail accounts
   - These accounts can make test purchases without being charged

2. **Internal Testing Track**
   - Upload APK to internal testing track
   - Add testers via email list
   - Testers download from Play Store link (not direct APK)

3. **Test Card Numbers** (for license testers)
   - Google Play handles test transactions automatically
   - Use `4242 4242 4242 4242` only works with Stripe (NOT applicable here)
   - License testers skip actual payment

### Apple Sandbox Testing (for comparison)

- Create Sandbox testers in App Store Connect > Users & Access > Sandbox Testers
- Sign into sandbox account on device: Settings > App Store > Sandbox Account

---

## 4. Trial Period Audit

**CONFIRMED: No free trial period is offered for Camp Card subscriptions.**

### Files Containing Trial References (to be cleaned up)

The following files contain legacy `trial` references that should be removed or updated:

| File | Line | Current State |
|------|------|---------------|
| `docs/PART-04-DATA-MODEL.md` | 485 | `trial_days INTEGER DEFAULT 0` - Schema allows trials but default is 0 |
| `docs/PART-05-API-SPECIFICATIONS.md` | 331, 342 | API spec shows `trial_days` field |
| `docs/PART-02-USER-JOURNEYS.md` | 649 | States "Trial period: 7 days (optional)" - **OUTDATED** |
| `src/__tests__/test-utils.tsx` | 192, 204 | Test mock with `trialDays: 0` |
| `src/__tests__/screens/scout/SubscriptionScreen.test.tsx` | 58, 83, 94 | Test case with `trialDays: 7` - **SHOULD BE 0** |
| `src/screens/auth/SubscriptionSelectionScreen.tsx` | 34, 154, 376, 385 | Has `trialDays` prop but rendering is disabled with comment |
| `src/screens/scout/SubscriptionScreen.tsx` | 37, 733, 1132 | Has `trialDays` prop but rendering is disabled with comment |

### Recommended Actions

1. **Update test file** `SubscriptionScreen.test.tsx` line 94: Change `trialDays: 7` to `trialDays: 0`
2. **Update docs** `PART-02-USER-JOURNEYS.md`: Remove "Trial period: 7 days (optional)"
3. **Keep schema** as-is (`trial_days DEFAULT 0`) - allows future flexibility without code change

### Google Play Subscription Configuration

When creating subscriptions in Google Play Console:
- **Free trial**: Do NOT enable
- **Introductory pricing**: Do NOT enable
- Start billing immediately upon subscription

---

## 5. FCM / Push Notifications Details

### Firebase Project Configuration

| Setting | Value |
|---------|-------|
| **Project ID** | `swipe-savvy-mobile-app` |
| **Project Number** | `144573893185` |
| **Storage Bucket** | `swipe-savvy-mobile-app.firebasestorage.app` |
| **Android App ID** | `1:144573893185:android:02fb670902d135a7a054c0` |
| **Android Package** | `com.bsa.campcard` |

**Note:** The google-services-3.json shows package `com.bsa.campcard` but app.json uses `org.bsa.campcard`. This may need updating in Firebase Console.

### Push Notification Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Backend API   │────▶│    AWS SNS      │
│  (Expo Push)    │     │  (Spring Boot)  │     │   (iOS + FCM)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The app uses **Expo Push Notifications** which abstracts FCM for Android and APNs for iOS.

### How It Works

1. **Registration** (app startup when authenticated):
   ```typescript
   // src/utils/notifications.ts
   const token = await Notifications.getExpoPushTokenAsync({ projectId });
   await apiClient.post('/api/v1/notifications/register-token', {
     token,
     deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
     deviceModel, osVersion, appVersion
   });
   ```

2. **Backend stores token** and routes to AWS SNS:
   - iOS → APNs platform application
   - Android → FCM platform application

3. **Sending notifications**:
   - Backend calls AWS SNS `publish()` with device endpoint ARN
   - SNS routes to appropriate platform (APNs or FCM)

### Android Notification Channels

Defined in `notifications.ts`:

| Channel ID | Name | Importance |
|------------|------|------------|
| `default` | Camp Card Notifications | MAX |
| `offers` | New Offers | HIGH |
| `payments` | Payment Updates | HIGH |
| `referrals` | Referral Rewards | DEFAULT |

### Notification Types

| Type | Trigger | Data Payload |
|------|---------|--------------|
| `NEW_OFFER` | New merchant offer available | `{ offerId: string }` |
| `PAYMENT_SUCCESS` | Payment processed | - |
| `REFERRAL_REWARD` | Referral converted | - |

### Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/notifications/register-token` | Register device for push |
| `DELETE /api/v1/notifications/unregister-token/{token}` | Unregister on logout |
| `GET /api/v1/notifications/me` | Get user's notifications (paginated) |
| `GET /api/v1/notifications/me/unread-count` | Get unread count |
| `PUT /api/v1/notifications/{id}/read` | Mark single as read |
| `PUT /api/v1/notifications/mark-all-read` | Mark all as read |

### Required Firebase Setup for Android

1. **Firebase Console** (console.firebase.google.com):
   - Verify Android app package name matches `org.bsa.campcard`
   - Download updated `google-services.json`
   - Place in `mobile/` directory

2. **EAS Build**:
   - `google-services.json` is already referenced in `app.json`:
     ```json
     "android": {
       "googleServicesFile": "./google-services.json"
     }
     ```

3. **AWS SNS** (for backend):
   - Create FCM platform application in AWS SNS
   - Use FCM Server Key from Firebase Console > Project Settings > Cloud Messaging
   - Region: `us-east-1`

---

## 6. Integration Checklist

### Google Play Console Setup

- [ ] Create "Camp Card Annual" subscription group
- [ ] Add `org.bsa.campcard.subscription.annual` ($14.99/year, no trial)
- [ ] Add `org.bsa.campcard.subscription.annual.scout` ($9.99/year, no trial)
- [ ] Add consumable `org.bsa.campcard.cards.1` ($14.99)
- [ ] Add consumable `org.bsa.campcard.cards.3` ($44.99)
- [ ] Add consumable `org.bsa.campcard.cards.5` ($74.99)
- [ ] Add consumable `org.bsa.campcard.cards.10` ($149.99)
- [ ] Set up license testers for testing

### Firebase Console Setup

- [ ] Verify/update Android package to `org.bsa.campcard`
- [ ] Download updated `google-services.json`
- [ ] Copy FCM Server Key for AWS SNS

### Backend Changes Needed

- [ ] Add Google Play receipt verification endpoint (`/api/v1/google/verify-purchase`)
- [ ] Add Google Play webhook for subscription events
- [ ] Configure Google Play Developer API credentials

### Mobile App Changes Needed

- [ ] Add `react-native-iap` Android configuration
- [ ] Create `googlePlayService.ts` (mirrors `iapService.ts` for Android)
- [ ] Update payment screens with Platform.OS branching
- [ ] Test purchase flows with license testers

---

## 7. Authorize.net Usage Inventory (Android Migration)

The following files currently use Authorize.net for Android payments and need to be updated for Google Play Billing:

### Payment Processing Files (Critical)

| File | Lines | What Changes |
|------|-------|--------------|
| [CardPaymentModal.tsx](../src/components/CardPaymentModal.tsx) | 1-321 | **Android only** - Credit card form. Replace with Google Play Billing UI for Android |
| [BuyMoreCardsScreen.tsx](../src/screens/wallet/BuyMoreCardsScreen.tsx) | 20, 120-121, 381 | Uses `paymentsApi.charge()`. Add Platform branching for Android IAP |
| [SubscriptionScreen.tsx](../src/screens/scout/SubscriptionScreen.tsx) | 20, 174-185, 322-383, 900 | Uses `paymentsApi.charge()`, `paymentMethodsApi`. Add Platform branching |
| [PaymentScreen.tsx](../src/screens/auth/PaymentScreen.tsx) | 21, 198-201, 331-430 | Uses `paymentsApi.mobileCharge()`. Add Platform branching for signup flow |
| [SelectScoutForSubscriptionScreen.tsx](../src/screens/troopLeader/SelectScoutForSubscriptionScreen.tsx) | 179 | Has TODO comment for Authorize.net integration |

### API & Configuration Files

| File | Lines | What Changes |
|------|-------|--------------|
| [apiClient.ts](../src/services/apiClient.ts) | 416-503 | `paymentsApi`, `paymentMethodsApi` definitions. Keep for Android, add `googlePlayApi` |
| [constants.ts](../src/config/constants.ts) | 9-14 | `AUTHORIZENET_*` constants. Keep for Android, add `GOOGLE_PLAY_*` constants |
| [env.d.ts](../src/types/env.d.ts) | 6-7 | TypeScript env declarations. Add Google Play env vars |
| [api.ts](../src/utils/api.ts) | 1 | Re-exports payment APIs. Add Google Play exports |

### Legal/Policy Files (Text Updates)

| File | Lines | What Changes |
|------|-------|--------------|
| [TermsOfServiceScreen.tsx](../src/screens/profile/TermsOfServiceScreen.tsx) | 229-250, 541-545 | References "Authorize.net" in legal text. Add Google Play Billing text for Android |
| [PrivacyPolicyScreen.tsx](../src/screens/profile/PrivacyPolicyScreen.tsx) | 108, 150, 190, 229-230, 296, 510-512 | References "Authorize.net" in privacy text. Add Google Play references for Android |
| [SubscriptionSelectionScreen.tsx](../src/screens/auth/SubscriptionSelectionScreen.tsx) | 214 | Shows "Secure payment powered by Authorize.net". Make platform-aware |

### Test Files

| File | Lines | What Changes |
|------|-------|--------------|
| [constants.test.ts](../src/__tests__/constants.test.ts) | 11 | Tests AUTHORIZENET env vars. Add Google Play tests |

### Migration Strategy

**Phase 1: Add Google Play Billing (Parallel)**
1. Add `expo-iap` Android configuration to app.json
2. Create `googlePlayService.ts` mirroring `iapService.ts`
3. Add `Platform.OS === 'android'` branching in payment screens
4. Add Google Play receipt verification endpoint to backend

**Phase 2: Update UI Components**
1. Update `CardPaymentModal` to only render on web (if needed)
2. Update payment screens to show Google Play UI on Android
3. Update legal text to be platform-aware

**Phase 3: Testing & Verification**
1. Test subscription purchases on Android internal track
2. Test consumable (card) purchases
3. Test restore purchases
4. Verify Authorize.net still works on web/admin portal

**Phase 4: Remove Authorize.net from Android (After Verification)**
1. Remove Android-specific Authorize.net code paths
2. Keep Authorize.net code for web portal only
3. Update legal/policy text to remove Android Authorize.net references

### Code Example: Platform Branching

```typescript
// In BuyMoreCardsScreen.tsx
import { Platform } from 'react-native';
import { iapService } from '../../services/iapService';
import { googlePlayService } from '../../services/googlePlayService'; // New

const handlePurchase = async () => {
  if (Platform.OS === 'ios') {
    // Existing iOS IAP flow
    await iapService.purchaseProduct(getCardSku());
  } else if (Platform.OS === 'android') {
    // New Android Google Play Billing flow
    await googlePlayService.purchaseProduct(getCardSku());
  } else {
    // Web/fallback - keep Authorize.net
    setShowPaymentModal(true);
  }
};
```

---

## 8. Summary

| Item | Status | Notes |
|------|--------|-------|
| Google Play Product IDs | ✅ Documented | Section 1 - Same as iOS |
| Cards Logic | ✅ Documented | Section 2 |
| Test Credentials | ✅ Documented | Section 3 |
| Trial Period | ✅ Confirmed NONE | Section 4 - Test file fixed |
| FCM Details | ✅ Documented | Section 5 |
| Authorize.net Inventory | ✅ Complete | Section 7 - 12 files identified |

**Next Steps:**
1. Create products in Google Play Console using the IDs in Section 1
2. Add Google Play Billing code to mobile app following the migration strategy
3. Add backend endpoint for Google Play receipt verification
4. Test on internal track before production release
