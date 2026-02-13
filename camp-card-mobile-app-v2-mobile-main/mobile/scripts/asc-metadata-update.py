#!/usr/bin/env python3
"""
Camp Card - App Store Connect API Metadata Updater
Updates Review Notes, EULA/Terms links, Privacy Policy URL, and version metadata.

Requirements:
  pip install PyJWT requests cryptography

Usage:
  python3 asc-metadata-update.py [--dry-run]

Environment:
  ASC_KEY_ID      = R227Z5WG3Q
  ASC_ISSUER_ID   = 51541aa3-d401-43f0-9244-976dbad0ec07
  ASC_KEY_PATH    = /Users/papajr/Downloads/AuthKey_R227Z5WG3Q.p8
  ASC_APP_ID      = 6758056347
"""

import os
import sys
import json
import time
import argparse
import jwt
import requests

# ============================================================
# Configuration
# ============================================================
ASC_KEY_ID = os.environ.get("ASC_KEY_ID", "R227Z5WG3Q")
ASC_ISSUER_ID = os.environ.get("ASC_ISSUER_ID", "51541aa3-d401-43f0-9244-976dbad0ec07")
ASC_KEY_PATH = os.environ.get("ASC_KEY_PATH", os.path.expanduser("~/Downloads/AuthKey_R227Z5WG3Q.p8"))
ASC_APP_ID = os.environ.get("ASC_APP_ID", "6758056347")
BASE_URL = "https://api.appstoreconnect.apple.com/v1"

# ============================================================
# Review Notes (Apple Review Guideline compliance)
# ============================================================
REVIEW_NOTES = """Demo Account:
Email: demo@campcard.org
Password: Password123
Role: PARENT (has active subscription, full feature access)

ATT (App Tracking Transparency):
The ATT permission prompt appears on first launch (iOS only) before any analytics tracking begins. The app uses first-party analytics only (no third-party analytics SDKs). If the user denies tracking, no IDFA is accessed, and the attConsent flag is set to false in all analytics events. The app continues to function normally regardless of ATT choice.

Implementation: App.tsx calls useTrackingPermission() hook from expo-tracking-transparency. Analytics session starts only after ATT prompt is resolved.

In-App Purchases:
The app uses StoreKit 2 for iOS in-app purchases via expo-iap. Products:
- org.bsa.campcard.subscription.annual (auto-renewable, $14.99/year)
- org.bsa.campcard.cards.1 through .cards.10 (consumable card packs)

Subscription Disclosure (Guideline 3.1.2):
Before every subscription purchase, a SubscriptionDisclosureModal is shown displaying:
- Subscription name and duration
- Price
- Auto-renewal terms and cancellation instructions
- Links to Privacy Policy (https://www.campcardapp.org/privacy)
- Links to Terms of Use (https://www.campcardapp.org/terms)

The disclosure modal appears BEFORE the native StoreKit payment sheet.

iPad Support:
The app runs on iPad in portrait mode with responsive layouts. iPad screenshots are genuine iPad Simulator captures (2048x2732), not resized iPhone screenshots.

Privacy:
- No Firebase Analytics or Crashlytics
- First-party analytics only (screen views, session data, feature usage)
- Analytics data sent to our own servers (api.campcardapp.org)
- Privacy Policy: https://www.campcardapp.org/privacy
- Terms of Use: https://www.campcardapp.org/terms
"""

PRIVACY_POLICY_URL = "https://www.campcardapp.org/privacy"
TERMS_OF_USE_URL = "https://www.campcardapp.org/terms"
SUPPORT_URL = "https://www.campcardapp.org/support"
MARKETING_URL = "https://www.campcardapp.org"

# ============================================================
# JWT Token Generation
# ============================================================
def generate_token():
    """Generate a JWT token for ASC API authentication."""
    with open(ASC_KEY_PATH, "r") as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iss": ASC_ISSUER_ID,
        "iat": now,
        "exp": now + 1200,  # 20 minutes
        "aud": "appstoreconnect-v1",
    }
    headers_jwt = {
        "alg": "ES256",
        "kid": ASC_KEY_ID,
        "typ": "JWT",
    }
    token = jwt.encode(payload, private_key, algorithm="ES256", headers=headers_jwt)
    return token


def api_request(method, path, token, data=None):
    """Make an authenticated ASC API request."""
    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    resp = requests.request(method, url, headers=headers, json=data)
    if resp.status_code >= 400:
        print(f"  ERROR: {method} {path} -> {resp.status_code}")
        try:
            print(f"  Response: {json.dumps(resp.json(), indent=2)}")
        except Exception:
            print(f"  Response: {resp.text[:500]}")
        return None
    return resp.json() if resp.text else {}


# ============================================================
# API Operations
# ============================================================
def get_app_info(token):
    """Get app details."""
    data = api_request("GET", f"/apps/{ASC_APP_ID}", token)
    if data:
        attrs = data["data"]["attributes"]
        print(f"  App: {attrs.get('name')} ({attrs.get('bundleId')})")
        print(f"  SKU: {attrs.get('sku')}")
    return data


def get_latest_version(token, platform="IOS"):
    """Get the latest app store version."""
    data = api_request(
        "GET",
        f"/apps/{ASC_APP_ID}/appStoreVersions?filter[platform]={platform}&limit=1&sort=-createdDate",
        token,
    )
    if data and data.get("data"):
        version = data["data"][0]
        attrs = version["attributes"]
        print(f"  Version: {attrs.get('versionString')} (state: {attrs.get('appStoreState')})")
        return version
    else:
        print("  No app store version found")
        return None


def get_version_localizations(token, version_id):
    """Get version localizations (metadata)."""
    data = api_request(
        "GET",
        f"/appStoreVersions/{version_id}/appStoreVersionLocalizations",
        token,
    )
    if data and data.get("data"):
        for loc in data["data"]:
            attrs = loc["attributes"]
            print(f"  Locale: {attrs.get('locale')}")
        return data["data"]
    return []


def update_version_localization(token, localization_id, updates):
    """Update a version localization (description, keywords, review notes, etc.)."""
    payload = {
        "data": {
            "type": "appStoreVersionLocalizations",
            "id": localization_id,
            "attributes": updates,
        }
    }
    return api_request("PATCH", f"/appStoreVersionLocalizations/{localization_id}", token, payload)


def update_app_info(token, app_info_id, updates):
    """Update app-level information."""
    payload = {
        "data": {
            "type": "appInfos",
            "id": app_info_id,
            "attributes": updates,
        }
    }
    return api_request("PATCH", f"/appInfos/{app_info_id}", token, payload)


def get_app_info_localizations(token):
    """Get app info localizations for links."""
    # First get app infos
    data = api_request("GET", f"/apps/{ASC_APP_ID}/appInfos", token)
    if not data or not data.get("data"):
        return None, []
    app_info = data["data"][0]
    app_info_id = app_info["id"]

    # Then get localizations
    locs = api_request("GET", f"/appInfos/{app_info_id}/appInfoLocalizations", token)
    if locs and locs.get("data"):
        return app_info_id, locs["data"]
    return app_info_id, []


def update_app_info_localization(token, localization_id, updates):
    """Update app info localization (privacy policy URL, etc.)."""
    payload = {
        "data": {
            "type": "appInfoLocalizations",
            "id": localization_id,
            "attributes": updates,
        }
    }
    return api_request("PATCH", f"/appInfoLocalizations/{localization_id}", token, payload)


def update_review_detail(token, version_id, demo_email, demo_password, notes):
    """Update app store review details (demo account + review notes)."""
    # Get existing review detail
    data = api_request("GET", f"/appStoreVersions/{version_id}/appStoreReviewDetail", token)
    if data and data.get("data"):
        review_id = data["data"]["id"]
        payload = {
            "data": {
                "type": "appStoreReviewDetails",
                "id": review_id,
                "attributes": {
                    "demoAccountName": demo_email,
                    "demoAccountPassword": demo_password,
                    "demoAccountRequired": True,
                    "notes": notes,
                },
            }
        }
        return api_request("PATCH", f"/appStoreReviewDetails/{review_id}", token, payload)
    else:
        # Create new review detail
        payload = {
            "data": {
                "type": "appStoreReviewDetails",
                "attributes": {
                    "demoAccountName": demo_email,
                    "demoAccountPassword": demo_password,
                    "demoAccountRequired": True,
                    "notes": notes,
                },
                "relationships": {
                    "appStoreVersion": {
                        "data": {
                            "type": "appStoreVersions",
                            "id": version_id,
                        }
                    }
                },
            }
        }
        return api_request("POST", "/appStoreReviewDetails", token, payload)


# ============================================================
# Main
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Update ASC metadata for Camp Card")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be updated without making changes")
    args = parser.parse_args()

    print("=" * 60)
    print("  Camp Card - ASC Metadata Updater")
    print("=" * 60)

    # Validate key file
    if not os.path.exists(ASC_KEY_PATH):
        print(f"\nERROR: ASC API key not found at {ASC_KEY_PATH}")
        sys.exit(1)

    print(f"\n  Key ID: {ASC_KEY_ID}")
    print(f"  Issuer: {ASC_ISSUER_ID}")
    print(f"  App ID: {ASC_APP_ID}")
    print(f"  Dry Run: {args.dry_run}")
    print()

    # Generate token
    print("[1/5] Generating JWT token...")
    token = generate_token()
    print("  Token generated successfully")
    print()

    # Get app info
    print("[2/5] Fetching app information...")
    app_data = get_app_info(token)
    if not app_data:
        print("  Failed to fetch app info")
        sys.exit(1)
    print()

    # Get latest version
    print("[3/5] Fetching latest iOS version...")
    version = get_latest_version(token)
    if not version:
        print("  No version found to update")
        sys.exit(1)
    version_id = version["id"]
    version_state = version["attributes"]["appStoreState"]
    print(f"  Version ID: {version_id}")
    print(f"  State: {version_state}")
    print()

    if args.dry_run:
        print("[DRY RUN] Would update the following:")
        print(f"\n  Review Notes:\n{REVIEW_NOTES[:200]}...")
        print(f"\n  Demo Account: demo@campcard.org / Password123")
        print(f"\n  Privacy Policy: {PRIVACY_POLICY_URL}")
        print(f"  Terms of Use: {TERMS_OF_USE_URL}")
        print(f"  Support URL: {SUPPORT_URL}")
        print(f"  Marketing URL: {MARKETING_URL}")
        print("\n[DRY RUN] No changes made.")
        return

    # Update review details (demo account + review notes)
    print("[4/5] Updating review details...")
    result = update_review_detail(
        token,
        version_id,
        demo_email="demo@campcard.org",
        demo_password="Password123",
        notes=REVIEW_NOTES.strip(),
    )
    if result:
        print("  Review details updated successfully")
    else:
        print("  Failed to update review details (may need an editable version)")
    print()

    # Update version localizations (description, keywords)
    print("[5/5] Updating version localizations...")
    localizations = get_version_localizations(token, version_id)
    for loc in localizations:
        loc_id = loc["id"]
        locale = loc["attributes"]["locale"]
        print(f"  Updating locale: {locale}")

        # Only update whatsNew for the version (not description - that's set at version creation)
        updates = {
            "whatsNew": (
                "Version 1.1.0:\n"
                "- App Tracking Transparency (ATT) framework integration\n"
                "- Enhanced subscription disclosure before purchases\n"
                "- Improved first-party analytics (no third-party tracking)\n"
                "- Updated Privacy Policy with ATT section\n"
                "- Bug fixes and performance improvements"
            ),
        }
        result = update_version_localization(token, loc_id, updates)
        if result:
            print(f"    Updated successfully")
        else:
            print(f"    Failed to update")

    # Update app info localizations (privacy policy URL, etc.)
    print("\n  Updating app info localizations (URLs)...")
    app_info_id, info_locs = get_app_info_localizations(token)
    for loc in info_locs:
        loc_id = loc["id"]
        locale = loc["attributes"]["locale"]
        print(f"  Updating app info locale: {locale}")

        updates = {
            "privacyPolicyUrl": PRIVACY_POLICY_URL,
            "privacyPolicyText": None,  # Clear any inline text in favor of URL
        }
        result = update_app_info_localization(token, loc_id, updates)
        if result:
            print(f"    App info updated successfully")

    print("\n" + "=" * 60)
    print("  Metadata update complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
