# Camp Card Mobile App - App Store Deployment Guide

This guide covers the complete process for deploying the Camp Card mobile app to the Apple App Store and Google Play Store.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Account Setup](#account-setup)
3. [Build Configuration](#build-configuration)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [App Store Listings](#app-store-listings)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js >= 20.0.0
- npm >= 10.0.0
- EAS CLI: `npm install -g eas-cli`
- Expo CLI: `npm install -g expo-cli`
- Xcode 15+ (for iOS builds on macOS)
- Android Studio (for local Android builds)

### Required Accounts
- **Apple Developer Account** ($99/year): https://developer.apple.com
- **Google Play Developer Account** ($25 one-time): https://play.google.com/console
- **Expo Account** (free): https://expo.dev

---

## Account Setup

### 1. EAS (Expo Application Services) Setup

```bash
# Login to Expo
eas login

# Initialize EAS for the project (run in mobile/ directory)
cd mobile
eas init

# This will create a project in Expo and update app.json with the projectId
```

Update `app.json` with the generated project ID:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

### 2. Apple Developer Setup

1. Log in to https://developer.apple.com
2. Go to **Certificates, Identifiers & Profiles**
3. Create an **App ID**:
   - Bundle ID: `org.bsa.campcard`
   - Enable capabilities: Push Notifications, Associated Domains
4. Note your **Team ID** (found in Membership section)

### 3. Google Play Developer Setup

1. Log in to https://play.google.com/console
2. Create a new app with package name: `org.bsa.campcard`
3. Create a **Service Account** for automated uploads:
   - Go to **Setup > API access**
   - Create a new service account
   - Grant "Release manager" permissions
   - Download the JSON key file
   - Save as `google-service-account.json` in the mobile directory (DO NOT commit to git)

---

## Build Configuration

### Environment Variables

Create a `.env.production` file (DO NOT commit):

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.campcardapp.org
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

### Update eas.json

Edit `eas.json` with your actual credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## iOS Deployment

### First-Time Setup

1. **Configure credentials** (EAS handles this automatically):
```bash
eas credentials
# Select iOS > Production > Set up credentials
# Choose "Let Expo handle it" for automatic management
```

2. **Create App Store Connect listing**:
   - Go to https://appstoreconnect.apple.com
   - Click **My Apps > + > New App**
   - Platform: iOS
   - Name: Camp Card
   - Bundle ID: org.bsa.campcard
   - SKU: campcard-ios
   - User Access: Full Access

### Build for iOS

```bash
# Development build (for testing with Expo Go alternative)
eas build --platform ios --profile development

# Preview build (for internal TestFlight testing)
eas build --platform ios --profile preview

# Production build (for App Store submission)
eas build --platform ios --profile production
```

### Submit to App Store

```bash
# Automatic submission after build
eas submit --platform ios --latest

# Or submit a specific build
eas submit --platform ios --id BUILD_ID
```

### TestFlight Distribution

1. After submission, go to App Store Connect
2. Navigate to your app > TestFlight
3. Wait for "Processing" to complete
4. Add internal/external testers
5. Submit for external testing review if needed

---

## Android Deployment

### First-Time Setup

1. **Create upload keystore** (EAS handles this automatically):
```bash
eas credentials
# Select Android > Production > Set up credentials
# Choose "Let Expo handle it" for automatic management
```

2. **Create Google Play listing**:
   - Go to https://play.google.com/console
   - Create app with package name: `org.bsa.campcard`
   - Complete the app content questionnaire
   - Set up pricing and distribution

### Build for Android

```bash
# Development build (APK for direct install)
eas build --platform android --profile development

# Preview build (APK for internal testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Submit to Google Play

```bash
# Automatic submission after build
eas submit --platform android --latest

# Or submit a specific build
eas submit --platform android --id BUILD_ID
```

### Play Store Tracks

- **Internal testing**: For internal team testing (up to 100 testers)
- **Closed testing**: For beta testers with email list
- **Open testing**: For public beta
- **Production**: Full release

To promote between tracks:
1. Go to Play Console > Release > Testing
2. Select your track
3. Click "Promote release" to move to next track

---

## App Store Listings

### iOS App Store Metadata

**Required Information:**

| Field | Value |
|-------|-------|
| App Name | Camp Card |
| Subtitle | Scout Fundraising Discounts |
| Category | Lifestyle (Primary), Shopping (Secondary) |
| Age Rating | 4+ |
| Price | Free |

**App Description (4000 chars max):**
```
Camp Card is the official BSA (Boy Scouts of America) digital discount subscription app that makes fundraising easier and more rewarding for Scouts, families, and communities.

FEATURES:
• Browse exclusive merchant offers and discounts
• Scan QR codes for instant offer redemptions
• Track your fundraising progress
• Support your local Scout troop with every purchase
• Find participating merchants near you
• Manage your subscription and account

FOR SCOUTS & FAMILIES:
Access hundreds of local and national discounts from participating merchants. Every redemption supports Scout programs and activities.

FOR TROOP LEADERS:
Track your troop's fundraising progress, manage Scout accounts, and see redemption analytics all in one place.

FOR MERCHANTS:
Partner with Camp Card to reach engaged Scout families and support youth development in your community.

Download Camp Card today and start saving while supporting Scouts!
```

**Keywords (100 chars max):**
```
scouts,bsa,fundraising,discounts,coupons,camping,youth,family,savings,merchant
```

**Support URL:** https://campcardapp.org/support
**Privacy Policy URL:** https://campcardapp.org/privacy
**Marketing URL:** https://campcardapp.org

### Google Play Store Metadata

**Short Description (80 chars):**
```
BSA Scout fundraising app - exclusive merchant discounts & offers
```

**Full Description (4000 chars):**
(Same as iOS description above)

**Screenshots Required:**
- Phone: At least 2 screenshots (1080x1920 or 1440x2560)
- Tablet (7"): At least 1 screenshot
- Tablet (10"): At least 1 screenshot

---

## Firebase Configuration

### iOS Setup

1. Go to Firebase Console > Project Settings
2. Add iOS app with bundle ID: `org.bsa.campcard`
3. Download `GoogleService-Info.plist`
4. Place in `mobile/` directory

### Android Setup

1. Go to Firebase Console > Project Settings
2. Add Android app with package name: `org.bsa.campcard`
3. Download `google-services.json`
4. Place in `mobile/` directory
5. Add SHA-1 certificate fingerprint:
```bash
# Get SHA-1 from EAS
eas credentials --platform android
```

---

## CI/CD with GitHub Actions

The existing `.github/workflows/ci-cd.yml` handles automated builds. Required secrets:

```
# GitHub Repository Secrets
EXPO_TOKEN=your-expo-token
GOOGLE_PLAY_SERVICE_ACCOUNT=<base64-encoded-json>
APPLE_ID=your-apple-id
APPLE_PASSWORD=your-app-specific-password
```

To encode the Google service account:
```bash
base64 -i google-service-account.json | tr -d '\n'
```

---

## Version Management

### Incrementing Versions

**Manual increment:**
```bash
# Increment patch version (1.0.0 -> 1.0.1)
npm version patch

# Increment minor version (1.0.0 -> 1.1.0)
npm version minor

# Increment major version (1.0.0 -> 2.0.0)
npm version major
```

**Automatic increment (EAS):**
The `eas.json` production profile has `"autoIncrement": true` which automatically increments:
- iOS buildNumber
- Android versionCode

### Version Sync

Keep versions in sync across:
- `package.json` (version field)
- `app.json` (expo.version, ios.buildNumber, android.versionCode)

---

## Troubleshooting

### Common Issues

**Build fails with credentials error:**
```bash
# Reset and reconfigure credentials
eas credentials --platform [ios|android]
```

**iOS code signing issues:**
```bash
# Let EAS manage certificates (recommended)
eas build --platform ios --profile production --clear-credentials
```

**Android keystore issues:**
```bash
# Reset Android credentials
eas credentials --platform android
# Select "Remove current keystore"
# Then set up new credentials
```

**Build cache issues:**
```bash
# Clear EAS build cache
eas build --platform all --clear-cache
```

### Support Resources

- Expo Documentation: https://docs.expo.dev
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit Docs: https://docs.expo.dev/submit/introduction/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policy: https://play.google.com/about/developer-content-policy/

---

## Checklist for First Release

### Pre-Build
- [ ] Update `app.json` with correct projectId
- [ ] Update `eas.json` with Apple credentials
- [ ] Add `google-service-account.json` (not in git)
- [ ] Add Firebase config files (GoogleService-Info.plist, google-services.json)
- [ ] Create app listings in App Store Connect and Play Console
- [ ] Prepare screenshots (minimum 2 per platform)
- [ ] Write app descriptions and keywords
- [ ] Set up privacy policy URL
- [ ] Configure push notification certificates

### Build & Submit
- [ ] Run `eas build --platform all --profile production`
- [ ] Test builds before submission
- [ ] Run `eas submit --platform all --latest`

### Post-Submit
- [ ] Monitor review status
- [ ] Respond to any reviewer feedback
- [ ] Plan phased rollout (Google Play)
- [ ] Set up crash monitoring (Sentry)
- [ ] Configure analytics dashboard

---

## Quick Commands Reference

```bash
# Login to EAS
eas login

# Build for all platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --latest

# Check build status
eas build:list

# View credentials
eas credentials

# Update OTA (no new build required)
eas update --branch production --message "Bug fix"
```
