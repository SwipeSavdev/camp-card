#!/usr/bin/env python3
"""
Update App Store Connect app description with Terms of Use and Privacy Policy links.
Also sets the Privacy Policy URL field on the app info.
"""

import json
import time
import sys
import requests
import jwt  # PyJWT

# ── Configuration ──────────────────────────────────────────────────────────────
KEY_FILE = "/Users/papajr/Downloads/AuthKey_R227Z5WG3Q.p8"
KEY_ID = "R227Z5WG3Q"
ISSUER_ID = "51541aa3-d401-43f0-9244-976dbad0ec07"
APP_ID = "6758056347"
BASE_URL = "https://api.appstoreconnect.apple.com"

TERMS_URL = "https://www.campcardapp.org/terms"
PRIVACY_URL = "https://www.campcardapp.org/privacy"

LINKS_BLOCK = f"""

Terms of Use: {TERMS_URL}
Privacy Policy: {PRIVACY_URL}"""


# ── JWT Token Generation ──────────────────────────────────────────────────────
def generate_token():
    with open(KEY_FILE, "r") as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iss": ISSUER_ID,
        "iat": now,
        "exp": now + 20 * 60,  # 20 minutes
        "aud": "appstoreconnect-v1",
    }
    token = jwt.encode(payload, private_key, algorithm="ES256", headers={"kid": KEY_ID})
    return token


def get_headers():
    return {
        "Authorization": f"Bearer {generate_token()}",
        "Content-Type": "application/json",
    }


# ── API Helpers ────────────────────────────────────────────────────────────────
def api_get(path, params=None):
    url = f"{BASE_URL}{path}"
    resp = requests.get(url, headers=get_headers(), params=params)
    if resp.status_code != 200:
        print(f"GET {path} -> {resp.status_code}")
        print(resp.text)
        sys.exit(1)
    return resp.json()


def api_patch(path, data):
    url = f"{BASE_URL}{path}"
    resp = requests.patch(url, headers=get_headers(), json=data)
    if resp.status_code not in (200, 204):
        print(f"PATCH {path} -> {resp.status_code}")
        print(json.dumps(resp.json(), indent=2) if resp.text else "(empty)")
        return None
    return resp.json() if resp.text else {}


# ── Step 1: Get all app store versions ─────────────────────────────────────────
def get_app_store_versions():
    print("=" * 70)
    print("STEP 1: Fetching all App Store versions...")
    print("=" * 70)

    data = api_get(f"/v1/apps/{APP_ID}/appStoreVersions")
    versions = data.get("data", [])
    for v in versions:
        attrs = v["attributes"]
        print(f"  Version {attrs.get('versionString')} | State: {attrs.get('appStoreState')} | ID: {v['id']}")
    return versions


# ── Step 2: Get localizations for a version ───────────────────────────────────
def get_localizations(version_id):
    print(f"\nSTEP 2: Fetching localizations for version {version_id}...")

    data = api_get(f"/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations")
    locs = data.get("data", [])
    for loc in locs:
        attrs = loc["attributes"]
        print(f"  Locale: {attrs.get('locale')} | ID: {loc['id']}")
    return locs


# ── Step 3: Read and update description ────────────────────────────────────────
def update_description(localization_id, current_description):
    print(f"\nSTEP 3: Updating description for localization {localization_id}...")

    # Check if links are already present
    if TERMS_URL in (current_description or "") and PRIVACY_URL in (current_description or ""):
        print("  Links are already present in the description. Skipping update.")
        return True

    # Append links
    new_description = (current_description or "").rstrip() + LINKS_BLOCK

    print(f"\n  Current description length: {len(current_description or '')}")
    print(f"  New description length: {len(new_description)}")
    print(f"\n  Appending block:\n{LINKS_BLOCK}")

    payload = {
        "data": {
            "type": "appStoreVersionLocalizations",
            "id": localization_id,
            "attributes": {
                "description": new_description,
            },
        }
    }

    result = api_patch(f"/v1/appStoreVersionLocalizations/{localization_id}", payload)
    if result is not None:
        print("  Description updated successfully!")
        return True
    else:
        print("  Failed to update description.")
        return False


# ── Step 4: Check / Set Privacy Policy URL on App Info ─────────────────────────
def check_and_set_privacy_policy():
    print("\n" + "=" * 70)
    print("STEP 4: Checking Privacy Policy URL on App Info...")
    print("=" * 70)

    # Get app infos
    data = api_get(f"/v1/apps/{APP_ID}/appInfos")
    infos = data.get("data", [])

    for info in infos:
        info_id = info["id"]
        state = info["attributes"].get("appStoreState", "UNKNOWN")
        print(f"  App Info ID: {info_id} | State: {state}")

        # Get localizations for this app info
        loc_data = api_get(f"/v1/appInfos/{info_id}/appInfoLocalizations")
        locs = loc_data.get("data", [])

        for loc in locs:
            loc_id = loc["id"]
            attrs = loc["attributes"]
            locale = attrs.get("locale", "unknown")
            current_privacy = attrs.get("privacyPolicyUrl", "")
            current_privacy_text = attrs.get("privacyPolicyText", "")

            print(f"\n  Locale: {locale} | Localization ID: {loc_id}")
            print(f"  Current Privacy Policy URL: {current_privacy or '(not set)'}")
            print(f"  Current Privacy Policy Text: {current_privacy_text or '(not set)'}")

            # Update if needed
            if current_privacy != PRIVACY_URL:
                print(f"  -> Setting Privacy Policy URL to: {PRIVACY_URL}")
                payload = {
                    "data": {
                        "type": "appInfoLocalizations",
                        "id": loc_id,
                        "attributes": {
                            "privacyPolicyUrl": PRIVACY_URL,
                        },
                    }
                }
                result = api_patch(f"/v1/appInfoLocalizations/{loc_id}", payload)
                if result is not None:
                    print("  Privacy Policy URL updated successfully!")
                else:
                    print("  Failed to update Privacy Policy URL on app info localization.")
            else:
                print("  Privacy Policy URL is already set correctly.")


# ── Step 5: Check for EULA / License Agreements ───────────────────────────────
def check_eula():
    print("\n" + "=" * 70)
    print("STEP 5: Checking End User License Agreements (EULA)...")
    print("=" * 70)

    # The EULA endpoint
    url = f"{BASE_URL}/v1/apps/{APP_ID}/endUserLicenseAgreement"
    resp = requests.get(url, headers=get_headers())
    print(f"  GET endUserLicenseAgreement -> {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        eula_data = data.get("data", {})
        attrs = eula_data.get("attributes", {})
        print(f"  EULA ID: {eula_data.get('id', 'N/A')}")
        agreement_text = attrs.get("agreementText", "")
        print(f"  Agreement text length: {len(agreement_text)}")
        if agreement_text:
            print(f"  First 200 chars: {agreement_text[:200]}...")
        return eula_data
    elif resp.status_code == 404:
        print("  No custom EULA set. Apple's standard EULA is in effect.")
        print("  This is fine - Apple uses their standard Licensed Application EULA by default.")
        return None
    else:
        print(f"  Response: {resp.text}")
        return None


# ── Step 6: Check app-level attributes ────────────────────────────────────────
def check_app_privacy_policy_url():
    print("\n" + "=" * 70)
    print("STEP 6: Checking app-level attributes...")
    print("=" * 70)

    data = api_get(f"/v1/apps/{APP_ID}")
    app_data = data.get("data", {})
    attrs = app_data.get("attributes", {})

    print(f"  App attributes: {list(attrs.keys())}")

    content_rights = attrs.get("contentRightsDeclaration", "")
    print(f"  Content Rights Declaration: {content_rights or '(not set)'}")

    return attrs


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("App Store Connect - Update Description & Privacy Policy")
    print("App ID:", APP_ID)
    print()

    # Step 1: Get versions
    versions = get_app_store_versions()
    if not versions:
        print("No versions found!")
        sys.exit(1)

    # Find the editable version (not READY_FOR_DISTRIBUTION)
    editable_states = [
        "REJECTED",
        "DEVELOPER_REJECTED",
        "PREPARE_FOR_SUBMISSION",
        "WAITING_FOR_REVIEW",
        "IN_REVIEW",
        "PENDING_DEVELOPER_RELEASE",
        "METADATA_REJECTED",
    ]

    target_version = None
    for state in editable_states:
        for v in versions:
            if v["attributes"].get("appStoreState") == state:
                target_version = v
                break
        if target_version:
            break

    if not target_version:
        target_version = versions[0]
        print(f"\n  WARNING: No editable version found, using first version.")

    version_id = target_version["id"]
    version_state = target_version["attributes"].get("appStoreState")
    version_string = target_version["attributes"].get("versionString")
    print(f"\n  Target version: {version_string} | State: {version_state} | ID: {version_id}")

    # Step 2: Get localizations
    localizations = get_localizations(version_id)

    # Find en-US localization
    en_us_loc = None
    for loc in localizations:
        if loc["attributes"].get("locale") == "en-US":
            en_us_loc = loc
            break

    if not en_us_loc:
        print("  No en-US localization found!")
        if localizations:
            en_us_loc = localizations[0]
            print(f"  Using first available: {en_us_loc['attributes'].get('locale')}")
        else:
            print("  No localizations at all!")
            sys.exit(1)

    loc_id = en_us_loc["id"]
    current_desc = en_us_loc["attributes"].get("description", "")

    print(f"\n  Current description:\n{'─' * 40}")
    print(current_desc)
    print(f"{'─' * 40}")

    # Step 3: Update description
    update_description(loc_id, current_desc)

    # Step 4: Privacy Policy URL on App Info
    check_and_set_privacy_policy()

    # Step 5: Check EULA
    check_eula()

    # Step 6: Check app-level attributes
    check_app_privacy_policy_url()

    print("\n" + "=" * 70)
    print("DONE!")
    print("=" * 70)


if __name__ == "__main__":
    main()
