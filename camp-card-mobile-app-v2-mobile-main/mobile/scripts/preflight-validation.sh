#!/bin/bash
# =============================================================================
# Camp Card - Pre-Submission Preflight Validation
# Validates all store compliance requirements before iOS/Android submission
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$MOBILE_DIR")")")"
SCREENSHOTS_DIR="$PROJECT_ROOT/app-store-screenshots"
STORE_ASSETS_DIR="$MOBILE_DIR/store-assets"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() { echo -e "  ${GREEN}PASS${NC} $1"; ((PASS_COUNT++)); }
fail() { echo -e "  ${RED}FAIL${NC} $1"; ((FAIL_COUNT++)); }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; ((WARN_COUNT++)); }

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  Camp Card Pre-Submission Preflight Validation${NC}"
echo -e "${BLUE}  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# =============================================================================
# 1. APP.JSON CONFIGURATION
# =============================================================================
echo -e "${YELLOW}[1/8] App Configuration (app.json)${NC}"

APP_JSON="$MOBILE_DIR/app.json"

# Check iOS bundle ID
if grep -q '"bundleIdentifier": "org.bsa.campcard"' "$APP_JSON"; then
  pass "iOS bundle identifier: org.bsa.campcard"
else
  fail "iOS bundle identifier missing or incorrect"
fi

# Check Android package name
if grep -q '"package": "org.bsa.campcard"' "$APP_JSON"; then
  pass "Android package name: org.bsa.campcard"
else
  fail "Android package name missing or incorrect"
fi

# Check version
VERSION=$(python3 -c "import json; print(json.load(open('$APP_JSON'))['expo']['version'])" 2>/dev/null)
echo -e "  ${BLUE}INFO${NC} App version: $VERSION"

# Check iOS build number
BUILD_NUM=$(python3 -c "import json; print(json.load(open('$APP_JSON'))['expo']['ios']['buildNumber'])" 2>/dev/null)
echo -e "  ${BLUE}INFO${NC} iOS build number: $BUILD_NUM"

# Check Android version code
VERSION_CODE=$(python3 -c "import json; print(json.load(open('$APP_JSON'))['expo']['android']['versionCode'])" 2>/dev/null)
echo -e "  ${BLUE}INFO${NC} Android versionCode: $VERSION_CODE"

# Check NSUserTrackingUsageDescription (ATT)
if grep -q "NSUserTrackingUsageDescription" "$APP_JSON"; then
  pass "NSUserTrackingUsageDescription present (ATT)"
else
  fail "NSUserTrackingUsageDescription MISSING - required for ATT"
fi

# Check expo-tracking-transparency plugin
if grep -q "expo-tracking-transparency" "$APP_JSON"; then
  pass "expo-tracking-transparency plugin configured"
else
  fail "expo-tracking-transparency plugin MISSING"
fi

# Check expo-iap plugin
if grep -q "expo-iap" "$APP_JSON"; then
  pass "expo-iap plugin configured"
else
  fail "expo-iap plugin MISSING"
fi

# Check supportsTablet (iPad screenshots required if true)
if grep -q '"supportsTablet": true' "$APP_JSON"; then
  pass "iPad support enabled (supportsTablet: true)"
  IPAD_REQUIRED=true
else
  IPAD_REQUIRED=false
  echo -e "  ${BLUE}INFO${NC} iPad support disabled"
fi

# Check privacy policy URL
if grep -q "privacyPolicyUrl" "$APP_JSON"; then
  pass "Privacy Policy URL configured in app.json"
else
  fail "Privacy Policy URL MISSING from app.json"
fi

# Check terms of service URL
if grep -q "termsOfServiceUrl" "$APP_JSON"; then
  pass "Terms of Service URL configured in app.json"
else
  fail "Terms of Service URL MISSING from app.json"
fi

# Check OTA updates config
if grep -q '"checkAutomatically": "ON_LOAD"' "$APP_JSON"; then
  pass "OTA updates configured (checkAutomatically: ON_LOAD)"
else
  warn "OTA updates not configured"
fi

echo ""

# =============================================================================
# 2. ATT / PRIVACY COMPLIANCE
# =============================================================================
echo -e "${YELLOW}[2/8] ATT & Privacy Compliance${NC}"

# Check useTrackingPermission hook exists
if [ -f "$MOBILE_DIR/src/hooks/useTrackingPermission.ts" ]; then
  pass "useTrackingPermission hook exists"
else
  fail "useTrackingPermission hook MISSING"
fi

# Check ATT integration in App.tsx
if grep -q "useTrackingPermission" "$MOBILE_DIR/App.tsx"; then
  pass "ATT hook integrated in App.tsx"
else
  fail "ATT hook NOT integrated in App.tsx"
fi

# Check analytics gates behind ATT
if grep -q "attReady" "$MOBILE_DIR/App.tsx"; then
  pass "Analytics gated behind ATT resolution in App.tsx"
else
  fail "Analytics NOT gated behind ATT in App.tsx"
fi

# Check setTrackingAllowed in analytics service
if grep -q "setTrackingAllowed" "$MOBILE_DIR/src/services/analyticsService.ts"; then
  pass "analyticsService.setTrackingAllowed() implemented"
else
  fail "analyticsService.setTrackingAllowed() MISSING"
fi

# Check attConsent in analytics events
if grep -q "attConsent" "$MOBILE_DIR/src/services/analyticsService.ts"; then
  pass "attConsent included in analytics events"
else
  fail "attConsent NOT included in analytics events"
fi

# Check Privacy Policy screen
if [ -f "$MOBILE_DIR/src/screens/profile/PrivacyPolicyScreen.tsx" ]; then
  if grep -q "App Tracking Transparency" "$MOBILE_DIR/src/screens/profile/PrivacyPolicyScreen.tsx"; then
    pass "Privacy Policy includes ATT section"
  else
    fail "Privacy Policy MISSING ATT section"
  fi
else
  fail "PrivacyPolicyScreen.tsx MISSING"
fi

echo ""

# =============================================================================
# 3. SUBSCRIPTION DISCLOSURE (Apple 3.1.2)
# =============================================================================
echo -e "${YELLOW}[3/8] Subscription Disclosure (Guideline 3.1.2)${NC}"

DISCLOSURE="$MOBILE_DIR/src/components/SubscriptionDisclosureModal.tsx"

if [ -f "$DISCLOSURE" ]; then
  pass "SubscriptionDisclosureModal component exists"

  # Check required elements
  if grep -q "productName" "$DISCLOSURE"; then
    pass "Disclosure shows subscription name"
  else
    fail "Disclosure MISSING subscription name"
  fi

  if grep -q "period" "$DISCLOSURE"; then
    pass "Disclosure shows subscription period"
  else
    fail "Disclosure MISSING subscription period"
  fi

  if grep -q "price" "$DISCLOSURE"; then
    pass "Disclosure shows subscription price"
  else
    fail "Disclosure MISSING subscription price"
  fi

  if grep -q "privacy" "$DISCLOSURE"; then
    pass "Disclosure links to Privacy Policy"
  else
    fail "Disclosure MISSING Privacy Policy link"
  fi

  if grep -q "terms" "$DISCLOSURE" || grep -q "Terms" "$DISCLOSURE"; then
    pass "Disclosure links to Terms of Use"
  else
    fail "Disclosure MISSING Terms of Use link"
  fi
else
  fail "SubscriptionDisclosureModal.tsx MISSING"
fi

# Check disclosure integration in purchase screens
for screen in "PaymentScreen.tsx" "SubscriptionScreen.tsx"; do
  found=false
  for f in $(find "$MOBILE_DIR/src/screens" -name "$screen" 2>/dev/null); do
    if grep -q "SubscriptionDisclosureModal" "$f"; then
      pass "Disclosure modal integrated in $screen"
      found=true
    fi
  done
  if [ "$found" = false ]; then
    fail "Disclosure modal NOT integrated in $screen"
  fi
done

echo ""

# =============================================================================
# 4. IAP CONFIGURATION
# =============================================================================
echo -e "${YELLOW}[4/8] In-App Purchase Configuration${NC}"

# Check IAP service
IAP_SERVICE="$MOBILE_DIR/src/services/iapService.ts"
if [ -f "$IAP_SERVICE" ]; then
  pass "iapService.ts exists"

  # Check no iOS-only gate
  if grep -q "Platform.OS !== 'ios'" "$IAP_SERVICE" | head -1; then
    fail "iapService has iOS-only gate (blocks Android)"
  else
    pass "iapService supports both platforms"
  fi

  # Check Google Play receipt verification endpoint
  if grep -q "google/verify-receipt" "$IAP_SERVICE"; then
    pass "Google Play receipt verification endpoint configured"
  else
    fail "Google Play receipt verification endpoint MISSING"
  fi

  # Check Apple receipt verification endpoint
  if grep -q "apple/verify-receipt" "$IAP_SERVICE"; then
    pass "Apple receipt verification endpoint configured"
  else
    fail "Apple receipt verification endpoint MISSING"
  fi
else
  fail "iapService.ts MISSING"
fi

# Check useIAP hook
IAP_HOOK="$MOBILE_DIR/src/hooks/useIAP.ts"
if [ -f "$IAP_HOOK" ]; then
  if grep -q "isUserCancellation" "$IAP_HOOK"; then
    pass "User cancellation handling implemented in useIAP"
  else
    fail "User cancellation handling MISSING in useIAP"
  fi
else
  fail "useIAP.ts MISSING"
fi

# Check product constants
CONSTANTS="$MOBILE_DIR/src/config/constants.ts"
if grep -q "SUBSCRIPTION_ANNUAL" "$CONSTANTS"; then
  pass "Subscription product ID configured"
else
  fail "Subscription product ID MISSING"
fi

if grep -q "CARDS_1" "$CONSTANTS" && grep -q "CARDS_10" "$CONSTANTS"; then
  pass "Card product IDs configured (1-10)"
else
  fail "Card product IDs incomplete"
fi

echo ""

# =============================================================================
# 5. DEMO ACCOUNT
# =============================================================================
echo -e "${YELLOW}[5/8] Demo Account & Login Stability${NC}"

# Check login screen error handling
LOGIN="$MOBILE_DIR/src/screens/auth/LoginScreen.tsx"
if [ -f "$LOGIN" ]; then
  pass "LoginScreen.tsx exists"

  if grep -q "Alert.alert" "$LOGIN"; then
    pass "Login screen has error alerts"
  else
    fail "Login screen MISSING error alerts"
  fi
else
  fail "LoginScreen.tsx MISSING"
fi

# Check biometric auth
if grep -q "biometric\|Biometric\|USE_BIOMETRIC" "$APP_JSON"; then
  pass "Biometric authentication configured"
else
  warn "Biometric authentication not configured"
fi

echo -e "  ${BLUE}INFO${NC} Demo account: demo@campcard.org / Password123 (PARENT role)"

echo ""

# =============================================================================
# 6. SCREENSHOTS
# =============================================================================
echo -e "${YELLOW}[6/8] Screenshot Assets${NC}"

# iPhone screenshots
IPHONE_COUNT=0
if [ -d "$SCREENSHOTS_DIR/iap-review" ]; then
  IPHONE_COUNT=$(find "$SCREENSHOTS_DIR/iap-review" -name "*.PNG" -o -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
fi
if [ "$IPHONE_COUNT" -ge 2 ]; then
  pass "iPhone screenshots: $IPHONE_COUNT files (min 2 required)"
else
  fail "iPhone screenshots: $IPHONE_COUNT files (min 2 required)"
fi

# iPad screenshots
IPAD_COUNT=0
if [ -d "$SCREENSHOTS_DIR/ipad" ]; then
  IPAD_COUNT=$(find "$SCREENSHOTS_DIR/ipad" -name "*.png" -o -name "*.PNG" 2>/dev/null | wc -l | tr -d ' ')
fi
if [ "$IPAD_REQUIRED" = true ]; then
  if [ "$IPAD_COUNT" -ge 2 ]; then
    pass "iPad screenshots: $IPAD_COUNT files (required since supportsTablet=true)"
  else
    fail "iPad screenshots: $IPAD_COUNT files (min 2 required since supportsTablet=true)"
  fi
else
  echo -e "  ${BLUE}INFO${NC} iPad screenshots not required"
fi

# Android screenshots
ANDROID_COUNT=0
if [ -d "$STORE_ASSETS_DIR/output/android/screenshots" ]; then
  ANDROID_COUNT=$(find "$STORE_ASSETS_DIR/output/android/screenshots" -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
fi
if [ "$ANDROID_COUNT" -ge 2 ]; then
  pass "Android screenshots (PNG): $ANDROID_COUNT files"
else
  warn "Android screenshots (PNG): $ANDROID_COUNT files (need to run convert-assets.sh)"
fi

# Feature graphic
if [ -f "$STORE_ASSETS_DIR/output/promotional/feature-graphic-1024x500.png" ]; then
  pass "Google Play feature graphic exists"
else
  warn "Google Play feature graphic MISSING (run convert-assets.sh)"
fi

echo ""

# =============================================================================
# 7. ANDROID-SPECIFIC
# =============================================================================
echo -e "${YELLOW}[7/8] Android / Google Play Compliance${NC}"

# Check unused permissions removed
if grep -q '"CAMERA"' "$APP_JSON"; then
  fail "Unused CAMERA permission still declared"
else
  pass "CAMERA permission removed (not used)"
fi

if grep -q '"VIBRATE"' "$APP_JSON"; then
  fail "Unused VIBRATE permission still declared"
else
  pass "VIBRATE permission removed (not used)"
fi

if grep -q '"RECEIVE_BOOT_COMPLETED"' "$APP_JSON"; then
  fail "Unused RECEIVE_BOOT_COMPLETED permission still declared"
else
  pass "RECEIVE_BOOT_COMPLETED permission removed (not used)"
fi

if grep -q '"USE_FINGERPRINT"' "$APP_JSON"; then
  fail "Deprecated USE_FINGERPRINT permission still declared"
else
  pass "USE_FINGERPRINT removed (USE_BIOMETRIC covers it)"
fi

# Check google-services.json
if [ -f "$MOBILE_DIR/google-services.json" ]; then
  pass "google-services.json exists"
else
  fail "google-services.json MISSING"
fi

# Check backend Google Play controller
GP_CONTROLLER=$(find "$PROJECT_ROOT" -path "*/controller/GooglePlayController.java" 2>/dev/null | head -1)
if [ -n "$GP_CONTROLLER" ]; then
  pass "GooglePlayController.java exists (backend)"
else
  fail "GooglePlayController.java MISSING (backend)"
fi

GP_SERVICE=$(find "$PROJECT_ROOT" -path "*/service/GooglePlayBillingService.java" 2>/dev/null | head -1)
if [ -n "$GP_SERVICE" ]; then
  pass "GooglePlayBillingService.java exists (backend)"
else
  fail "GooglePlayBillingService.java MISSING (backend)"
fi

echo ""

# =============================================================================
# 8. BUILD READINESS
# =============================================================================
echo -e "${YELLOW}[8/8] Build & Submission Readiness${NC}"

# Check eas.json
if [ -f "$MOBILE_DIR/eas.json" ]; then
  pass "eas.json exists"

  if grep -q '"production"' "$MOBILE_DIR/eas.json"; then
    pass "Production build profile configured"
  else
    fail "Production build profile MISSING in eas.json"
  fi

  if grep -q '"channel": "production"' "$MOBILE_DIR/eas.json"; then
    pass "Production channel configured for OTA updates"
  else
    warn "Production channel not configured in eas.json"
  fi
else
  fail "eas.json MISSING"
fi

# Check EAS CLI
if command -v eas &>/dev/null || npx eas --version &>/dev/null 2>&1; then
  pass "EAS CLI available"
else
  warn "EAS CLI not found (install with: npm install -g eas-cli)"
fi

# TypeScript check
echo -e "  ${BLUE}INFO${NC} Running TypeScript check..."
cd "$MOBILE_DIR"
if npx tsc --noEmit 2>/dev/null; then
  pass "TypeScript compilation: no errors"
else
  fail "TypeScript compilation has errors"
fi

echo ""

# =============================================================================
# SUMMARY
# =============================================================================
echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  PREFLIGHT VALIDATION SUMMARY${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo -e "  ${GREEN}PASSED:  $PASS_COUNT${NC}"
echo -e "  ${RED}FAILED:  $FAIL_COUNT${NC}"
echo -e "  ${YELLOW}WARNINGS: $WARN_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}STATUS: READY FOR SUBMISSION${NC}"
  exit 0
else
  echo -e "  ${RED}STATUS: NOT READY - FIX $FAIL_COUNT FAILURES${NC}"
  exit 1
fi
