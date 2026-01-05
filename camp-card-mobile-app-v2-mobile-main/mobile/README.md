# 📱 BSA Camp Card - Mobile App

**React Native mobile application for iOS and Android**

![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![iOS](https://img.shields.io/badge/iOS-15%2B-lightgrey.svg)
![Android](https://img.shields.io/badge/Android-10%2B-green.svg)

> **Note:** This is a standalone repository within a multi-repository architecture. All dependencies must be installed in this directory. Do not install packages in parent directory.

---

## 📋 Overview

Mobile app for customers and Scouts featuring:
- 🛍️ Browse local merchant offers with geo-proximity
- 💳 Stripe-powered in-app subscriptions
- 📷 QR code scanning for Scout referrals
- 🎯 Offer redemption with temporary validation codes
- 📊 Scout fundraising dashboard (ages 5-14 appropriate UX)
- 🔗 Share referral links via SMS, email, social media
- 🔔 Push notifications for offers and milestones

**Platforms:**
- iOS 15.0+
- Android 10 (API 29)+

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- React Native CLI
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### 1. Install Dependencies

```bash
# Install Node packages
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
vim .env
```

### 3. Run on iOS

```bash
# Start Metro bundler
npm start

# Run on iOS simulator (separate terminal)
npm run ios

# Or run on specific device
npm run ios -- --device "iPhone 15 Pro"
```

### 4. Run on Android

```bash
# Start Android emulator first
# Then run
npm run android

# Or specific variant
npm run android -- --variant=debug
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── OfferCard.tsx
│   │   └── ...
│   ├── screens/              # App screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── OfferDetailsScreen.tsx
│   │   ├── offers/
│   │   │   ├── OffersListScreen.tsx
│   │   │   ├── OfferMapScreen.tsx
│   │   │   └── RedemptionScreen.tsx
│   │   ├── scout/
│   │   │   ├── ScoutDashboardScreen.tsx
│   │   │   └── ShareLinkScreen.tsx
│   │   ├── subscription/
│   │   │   ├── PlansScreen.tsx
│   │   │   ├── CheckoutScreen.tsx
│   │   │   └── ManageScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── SettingsScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── store/                # Zustand state management
│   │   ├── authStore.ts
│   │   ├── subscriptionStore.ts
│   │   ├── offersStore.ts
│   │   └── scoutStore.ts
│   ├── services/             # API clients
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── subscriptionService.ts
│   │   ├── offerService.ts
│   │   └── scoutService.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   ├── useLocation.ts
│   │   └── useOffers.ts
│   ├── theme/                # Design system
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── storage.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── models.types.ts
│   └── App.tsx
├── ios/                      # iOS native code
│   ├── CampCard/
│   ├── CampCard.xcodeproj
│   └── Podfile
├── android/                  # Android native code
│   ├── app/
│   ├── build.gradle
│   └── settings.gradle
├── e2e/                      # Detox E2E tests
│   ├── auth.test.ts
│   ├── offers.test.ts
│   └── subscription.test.ts
├── __tests__/                # Jest unit tests
├── .env.example
├── .gitignore
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

```bash
# API
API_BASE_URL=http://localhost:8080/v1
API_TIMEOUT=30000

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef

# Maps
GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Analytics & Monitoring
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
FIREBASE_APP_ID=1:1234567890:ios:abcdef1234567890

# Feature Flags
ENABLE_CUSTOMER_REFERRALS=false
ENABLE_PUSH_NOTIFICATIONS=true
```

### iOS Configuration

**Info.plist permissions:**
```xml
<key>NSCameraUsageDescription</key>
<string>Scan QR codes for Scout referrals</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Find nearby merchant offers</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Save QR codes and posters</string>
```

### Android Configuration

**AndroidManifest.xml permissions:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

**Coverage Target:** 80% line coverage

### E2E Tests (Detox)

```bash
# Build iOS app for testing
npm run detox:build:ios

# Run iOS E2E tests
npm run detox:test:ios

# Build Android app for testing
npm run detox:build:android

# Run Android E2E tests
npm run detox:test:android

# Run specific test
npm run detox:test:ios -- e2e/subscription.test.ts
```

### Manual Testing Checklist

- [ ] Login/Register flow
- [ ] QR code scan → Subscription signup
- [ ] Browse offers by category
- [ ] Map view with nearby offers
- [ ] Offer redemption code generation
- [ ] Scout dashboard metrics
- [ ] Share referral link (SMS, email)
- [ ] Subscription management
- [ ] Push notification handling

---

## 🎨 Design System

### Theme Tokens

```typescript
// src/theme/colors.ts
export const colors = {
  primary: {
    navy900: '#000C2F',
    navy700: '#05244A',
    blue500: '#0A4384',
  },
  accent: {
    red500: '#D9012C',
    red600: '#B01427',
  },
  gradient: {
    primary: 'radial-gradient(circle at 35% 45%, #3B5C82 0%, #000C2F 100%)',
  },
  // ...
};

// src/theme/spacing.ts
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

### Component Usage

```tsx
import { Button, Card } from '@/components';
import { colors, spacing } from '@/theme';

<Button 
  variant="primary" 
  size="large"
  onPress={handleSubmit}
>
  Subscribe Now
</Button>

<Card style={{ padding: spacing.md }}>
  <Text style={{ color: colors.primary.navy900 }}>
    Offer Title
  </Text>
</Card>
```

---

## 📱 Features

### 1. Authentication

- Email/password registration
- JWT token storage (secure keychain)
- Biometric login (Face ID / Fingerprint)
- Auto token refresh

### 2. Subscriptions

- View subscription plans
- Stripe Checkout integration
- Manage subscription (upgrade, cancel)
- View payment history

### 3. Offers

- Browse all offers by category
- Search offers by merchant name
- Map view with geo-proximity
- Filter by distance (1mi, 5mi, 10mi)
- Favorite offers

### 4. Redemption

- Generate temporary 6-digit code (10-min expiry)
- Show QR code to merchant
- Redemption history

### 5. Scout Dashboard

- Total raised (with progress bar)
- Signup count (direct + indirect)
- Rank in troop (leaderboard)
- Share link (SMS, email, social)
- Print poster (PDF generation)

### 6. Referrals

- Unique Scout QR code
- Short link generation
- Track clicks and conversions
- Customer-to-customer viral chain

---

## 🚢 Deployment

### iOS App Store

```bash
# 1. Increment version
npm version patch

# 2. Build release
cd ios
xcodebuild -workspace CampCard.xcworkspace \
  -scheme CampCard \
  -configuration Release \
  -archivePath build/CampCard.xcarchive \
  archive

# 3. Export IPA
xcodebuild -exportArchive \
  -archivePath build/CampCard.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

# 4. Upload to App Store Connect
xcrun altool --upload-app \
  --file build/CampCard.ipa \
  --username "your-apple-id@example.com" \
  --password "app-specific-password"

# Or use Fastlane
fastlane ios beta      # TestFlight
fastlane ios release   # App Store
```

### Google Play Store

```bash
# 1. Generate release APK/AAB
cd android
./gradlew bundleRelease

# 2. Upload to Google Play Console
# build/app/outputs/bundle/release/app-release.aab

# Or use Fastlane
fastlane android beta      # Internal testing
fastlane android release   # Production
```

### Over-The-Air Updates (CodePush)

```bash
# Release to staging
appcenter codepush release-react \
  -a BSA/CampCard-iOS \
  -d Staging

# Promote to production
appcenter codepush promote \
  -a BSA/CampCard-iOS \
  -s Staging \
  -d Production
```

---

## 🔒 Security

### Secure Storage

```typescript
// Store JWT tokens
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('access_token', token, {
  service: 'campcard',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
});

// Retrieve tokens
const credentials = await Keychain.getGenericPassword({ service: 'campcard' });
```

### Certificate Pinning

```typescript
// iOS: AppDelegate.m (SSL pinning via TrustKit)
// Android: network_security_config.xml
```

### Biometric Authentication

```typescript
import ReactNativeBiometrics from 'react-native-biometrics';

const { success } = await rnBiometrics.simplePrompt({
  promptMessage: 'Confirm fingerprint',
});
```

---

## 📊 Analytics

### Event Tracking

```typescript
import analytics from '@react-native-firebase/analytics';

// Track screen views
analytics().logScreenView({
  screen_name: 'OfferDetails',
  screen_class: 'OfferDetailsScreen',
});

// Track events
analytics().logEvent('subscription_started', {
  plan_id: 'annual',
  price: 29.99,
  scout_id: scoutId,
});
```

### Crash Reporting

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
});

// Capture errors
try {
  // ...
} catch (error) {
  Sentry.captureException(error);
}
```

---

## 🤝 Contributing

### Code Style

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Airbnb style guide
- **Formatting:** Prettier (auto-format on save)

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format all files
npm run format
```

### Commit Convention

```
feat(offers): add map view with geo-proximity filtering

Implements FR-067 for customers to find nearby offers.

Closes #234
```

---

## 📞 Support

**Documentation:** See `/docs` in main repository  
**Issues:** GitHub Issues  
**Slack:** #mobile-dev  
**Email:** mobile-team@campcard.org

---

## 📄 License

**UNLICENSED** - Proprietary  
Copyright © 2025 Boy Scouts of America
