# Camp Card App Store Assets

This directory contains all assets required for Apple App Store and Google Play Store submissions.

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#003F87` | BSA Blue - Primary brand color |
| Scout Red | `#CE1126` | Accent for Scout role |
| Scout Gold | `#FFD700` | Accent for achievements |
| White | `#FFFFFF` | Text on dark backgrounds |
| Dark Text | `#1A1A1A` | Primary text |

## Directory Structure

```
store-assets/
├── README.md                 # This file
├── app-store-metadata.json   # Store listing metadata
├── convert-assets.sh         # SVG to PNG conversion script
├── icons/                    # App icons
│   ├── app-icon.svg          # Main icon with text (SVG template)
│   └── app-icon-simple.svg   # Simple icon for small sizes (SVG template)
├── screenshots/              # Device screenshots
│   ├── screenshot-template.svg   # Base screenshot template
│   ├── ios/                  # iOS screenshots (1284x2778)
│   │   ├── 01-welcome.svg
│   │   ├── 02-offers.svg
│   │   ├── 03-scan-qr.svg
│   │   ├── 04-map.svg
│   │   └── 05-profile.svg
│   └── android/              # Android screenshots (1080x1920)
│       ├── 01-welcome.svg
│       ├── 02-offers.svg
│       ├── 03-scan-qr.svg
│       ├── 04-map.svg
│       └── 05-profile.svg
├── feature-graphics/         # Android feature graphic
│   └── feature-graphic-template.svg
├── promotional/              # Marketing images
│   └── promotional-banner-1024x500.svg
└── output/                   # Generated PNG files (after running convert-assets.sh)
```

## Quick Start - Converting SVG to PNG

All store assets are provided as SVG templates. To convert them to PNG for submission:

```bash
# Install required tool (macOS)
brew install librsvg

# Run conversion script
cd store-assets
./convert-assets.sh
```

Output will be in `store-assets/output/` directory.

---

## App Icons

### iOS App Icon (Required)
| Size | Filename | Purpose |
|------|----------|---------|
| 1024x1024 | `appicon_1024.png` | App Store listing |
| 180x180 | `icon_180.png` | iPhone @3x |
| 120x120 | `icon_120.png` | iPhone @2x |
| 167x167 | `icon_167.png` | iPad Pro @2x |
| 152x152 | `icon_152.png` | iPad @2x |

**Requirements:**
- PNG format, no transparency
- No rounded corners (iOS adds automatically)
- No alpha channel
- RGB color space

### Android Icons (Required)
| Size | Filename | Purpose |
|------|----------|---------|
| 512x512 | `playstore_icon.png` | Play Store listing |
| 192x192 | `adaptive_icon.png` | Adaptive icon |
| 108x108 | `ic_launcher_foreground.png` | Adaptive foreground |

**Requirements:**
- PNG format
- Adaptive icon safe zone: 66x66dp centered in 108x108dp

---

## Screenshots

### iOS Screenshots

#### iPhone 6.5" Display (REQUIRED)
- **Size:** 1284 x 2778 pixels
- **Format:** PNG or JPG
- **Quantity:** Up to 10 screenshots

#### iPhone 5.5" Display (REQUIRED)
- **Size:** 1242 x 2208 pixels
- **Format:** PNG or JPG
- **Quantity:** Up to 10 screenshots

#### iPad Pro 12.9" (Optional)
- **Size:** 2048 x 2732 pixels
- **Format:** PNG or JPG
- **Quantity:** Up to 5 screenshots

### Android Screenshots

#### Phone Screenshots (REQUIRED)
- **Size:** 1080 x 1920 pixels (minimum)
- **Recommended:** 1440 x 2560 pixels
- **Format:** PNG or JPG (24-bit, no alpha)
- **Quantity:** 2-8 screenshots

#### 7" Tablet (REQUIRED)
- **Size:** 1024 x 600 pixels (minimum)
- **Format:** PNG or JPG
- **Quantity:** Minimum 1

#### 10" Tablet (REQUIRED)
- **Size:** 1280 x 800 pixels (minimum)
- **Format:** PNG or JPG
- **Quantity:** Minimum 1

---

## Screenshot Content Suggestions

Create screenshots showing these key features in order:

### 1. Welcome/Login Screen
**Headline:** "Scout Fundraising Made Easy"
**Show:** Clean login screen with Camp Card branding

### 2. Home Dashboard
**Headline:** "Discover Local Deals"
**Show:** Home screen with featured offers and merchant cards

### 3. Offer Details
**Headline:** "Exclusive Discounts"
**Show:** Detailed offer view with savings percentage

### 4. QR Code Scanner
**Headline:** "Scan to Save"
**Show:** Camera QR scanner in action

### 5. Merchant Map
**Headline:** "Find Nearby Merchants"
**Show:** Map view with merchant pins

### 6. Profile & Subscription
**Headline:** "Manage Your Card"
**Show:** Profile screen with subscription status

### 7. Scout Dashboard (Troop Leader View)
**Headline:** "Track Your Troop"
**Show:** Troop leader dashboard with metrics

### 8. Redemption Success
**Headline:** "You Saved!"
**Show:** Successful redemption confirmation

---

## Feature Graphic (Android Only)

**Size:** 1024 x 500 pixels
**Format:** PNG or JPG (24-bit, no alpha)

### Design Guidelines:
- Landscape orientation
- Brand logo prominently displayed
- Tagline: "Scout Fundraising Discounts"
- Show app in context (phone mockup optional)
- Use brand blue (#003F87) as background

### Suggested Layout:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [Camp Card Logo]                                      │
│                                                         │
│   SCOUT FUNDRAISING                                     │
│   DISCOUNTS                                             │
│                                                         │
│   Support Scouts. Save Money.                           │
│                                                         │
│                              [Phone mockup with app]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Promotional Text

### App Store Short Description (30 chars max)
```
Scout Fundraising Discounts
```

### App Store Promotional Text (170 chars max)
```
Support local Scouts while saving at hundreds of merchants! Camp Card brings exclusive discounts from businesses in your community. Download and start saving today!
```

### Play Store Short Description (80 chars max)
```
BSA Scout fundraising app - exclusive merchant discounts & offers
```

### Full Description (4000 chars max)
See `app-store-metadata.json` for complete description.

---

## What's New / Release Notes

### Version 1.0.0
```
Initial release of Camp Card!

• Browse and redeem exclusive merchant offers
• Support Scout fundraising with every purchase
• Find participating merchants near you
• Track your redemptions and savings
• Secure login with biometric authentication
• Role-based experience for Scouts, Parents, and Troop Leaders
```

---

## Generating Screenshots

### Option 1: Simulator Screenshots
1. Run the app in iOS Simulator (iPhone 14 Pro Max for 6.5")
2. Press Cmd + S to save screenshot
3. Use ImageMagick to add device frame:
   ```bash
   # Install ImageMagick
   brew install imagemagick

   # Add padding/frame to screenshot
   convert screenshot.png -gravity center -background "#003F87" -extent 1284x2778 framed.png
   ```

### Option 2: Expo Screenshot Tool
```bash
npx expo-screenshot-tool --device "iPhone 14 Pro Max"
```

### Option 3: Fastlane Snapshot (Recommended)
```bash
# Install fastlane
gem install fastlane

# Generate screenshots
fastlane snapshot
```

---

## Pre-Submission Checklist

### Icons
- [ ] 1024x1024 App Store icon (iOS)
- [ ] 512x512 Play Store icon (Android)
- [ ] Adaptive icon with foreground/background (Android)

### Screenshots
- [ ] iPhone 6.5" screenshots (minimum 3)
- [ ] iPhone 5.5" screenshots (minimum 3)
- [ ] Android phone screenshots (minimum 2)
- [ ] Android 7" tablet screenshot (minimum 1)
- [ ] Android 10" tablet screenshot (minimum 1)

### Graphics
- [ ] Feature graphic 1024x500 (Android)
- [ ] Promotional graphics (optional)

### Metadata
- [ ] App name verified
- [ ] Short description
- [ ] Full description
- [ ] Keywords (100 chars max, iOS)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL

---

## Asset Generation Commands

### Resize icon to all iOS sizes:
```bash
# From 1024x1024 source
sips -z 180 180 appicon_1024.png --out icon_180.png
sips -z 120 120 appicon_1024.png --out icon_120.png
sips -z 167 167 appicon_1024.png --out icon_167.png
sips -z 152 152 appicon_1024.png --out icon_152.png
```

### Resize for Android:
```bash
sips -z 512 512 appicon_1024.png --out playstore_icon.png
sips -z 192 192 appicon_1024.png --out adaptive_icon.png
```

### Convert to required format:
```bash
# Ensure no alpha channel for Play Store
convert input.png -alpha off output.png
```

---

## Legal Documents

Legal documents required for app store submission are in the `../legal/` directory:

- **Terms of Service**: `../legal/TERMS_OF_SERVICE.md`
- **Privacy Policy**: `../legal/PRIVACY_POLICY.md`

These documents are designed for Apple App Store and Google Play Store compliance, including:
- COPPA (Children's Online Privacy Protection Act)
- CCPA (California Consumer Privacy Act)
- Apple App Store Guidelines Section 5.1
- Google Play User Data Policy

**Before submission:**
1. Host these documents on your website (required by both stores)
2. Add URLs to App Store Connect and Google Play Console
3. Complete the App Privacy / Data Safety sections

---

## Contact for Assets

For official BSA logos and brand guidelines, contact:
- Email: support@campcardapp.org
- Brand Guidelines: https://campcardapp.org/brand
