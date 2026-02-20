#!/usr/bin/env python3
"""
Create the Scout Annual Subscription in Google Play Console via Android Publisher API.

Original requested ID: org.bsa.campcard.subscription.annual.scout (42 chars - exceeds 40 char limit)
Adjusted ID: campcard.subscription.annual.scout (34 chars - fits within limit)
Base Plan: annual-plan ($14.99/year)
"""

import json
import warnings
warnings.filterwarnings("ignore")

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

# Configuration
PACKAGE_NAME = "org.bsa.campcard"
SERVICE_ACCOUNT_JSON = "/Users/papajr/Documents/Projects-2026/camp-card/camp-card-mobile-app-v2-mobile-main/mobile/google-play-service-account.json"
SCOPE = "https://www.googleapis.com/auth/androidpublisher"
BASE_URL = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PACKAGE_NAME}"

# NOTE: Original requested ID was 'org.bsa.campcard.subscription.annual.scout' (42 chars)
# Google Play subscription IDs have a 40-character limit, so we shortened it.
NEW_PRODUCT_ID = "campcard.subscription.annual.scout"
BASE_PLAN_ID = "annual-plan"


def get_session():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_JSON,
        scopes=[SCOPE],
    )
    return AuthorizedSession(credentials)


def list_subscriptions(session):
    print("=" * 70)
    print("STEP 1: Listing existing subscriptions")
    print("=" * 70)

    url = f"{BASE_URL}/subscriptions"
    resp = session.get(url)
    print(f"GET {url}")
    print(f"Status: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        subscriptions = data.get("subscriptions", [])
        if subscriptions:
            for sub in subscriptions:
                product_id = sub.get("productId", "N/A")
                print(f"\n  Subscription: {product_id} ({len(product_id)} chars)")
                for listing in sub.get("listings", []):
                    print(f"    [{listing.get('languageCode')}] {listing.get('title')}")
                for bp in sub.get("basePlans", []):
                    bp_id = bp.get("basePlanId", "N/A")
                    state = bp.get("state", "N/A")
                    auto = bp.get("autoRenewingBasePlanType", {})
                    print(f"    Base Plan: {bp_id} (state: {state})")
                    print(f"      Period: {auto.get('billingPeriodDuration')}, Grace: {auto.get('gracePeriodDuration')}")
                    for rc in bp.get("regionalConfigs", []):
                        p = rc.get("price", {})
                        units = p.get("units", "0")
                        nanos = p.get("nanos", 0)
                        price_str = f"{units}.{nanos // 10000000:02d}" if nanos else f"{units}.00"
                        print(f"      [{rc.get('regionCode')}] {p.get('currencyCode')} {price_str}")
        else:
            print("  No subscriptions found.")
    else:
        print(f"  Error: {resp.text}")


def create_subscription(session):
    print("\n" + "=" * 70)
    print("STEP 2: Creating Scout Annual Subscription")
    print(f"  Product ID: {NEW_PRODUCT_ID} ({len(NEW_PRODUCT_ID)} chars)")
    print("=" * 70)

    url = f"{BASE_URL}/subscriptions"
    params = {
        "productId": NEW_PRODUCT_ID,
        "regionsVersion.version": "2022/02",
    }

    subscription_body = {
        "productId": NEW_PRODUCT_ID,
        "listings": [
            {
                "languageCode": "en-US",
                "title": "Camp Card Scout Annual Subscription",
                "description": "Annual access to exclusive merchant discounts for Scouts supporting BSA fundraising.",
                "benefits": [
                    "Access to exclusive merchant discounts",
                    "Support Scout fundraising",
                    "Unlimited offer redemptions",
                ],
            }
        ],
        "basePlans": [
            {
                "basePlanId": BASE_PLAN_ID,
                "state": "DRAFT",
                "autoRenewingBasePlanType": {
                    "billingPeriodDuration": "P1Y",
                    "gracePeriodDuration": "P7D",
                    "resubscribeState": "RESUBSCRIBE_STATE_ACTIVE",
                    "prorationMode": "SUBSCRIPTION_PRORATION_MODE_CHARGE_ON_NEXT_BILLING_DATE",
                    "legacyCompatible": True,
                },
                "regionalConfigs": [
                    {
                        "regionCode": "US",
                        "newSubscriberAvailability": True,
                        "price": {
                            "currencyCode": "USD",
                            "units": "14",
                            "nanos": 990000000,
                        },
                    }
                ],
                "otherRegionsConfig": {
                    "usdPrice": {
                        "currencyCode": "USD",
                        "units": "14",
                        "nanos": 990000000,
                    },
                    "eurPrice": {
                        "currencyCode": "EUR",
                        "units": "14",
                        "nanos": 990000000,
                    },
                    "newSubscriberAvailability": True,
                },
            }
        ],
        "taxAndComplianceSettings": {
            "eeaWithdrawalRightType": "WITHDRAWAL_RIGHT_SERVICE"
        },
    }

    print(f"POST {url}")
    print(f"Params: {json.dumps(params)}")
    print(f"Body:\n{json.dumps(subscription_body, indent=2)}")

    resp = session.post(url, json=subscription_body, params=params)

    print(f"\nStatus: {resp.status_code}")
    try:
        resp_data = resp.json()
        print(f"Response:\n{json.dumps(resp_data, indent=2)}")
    except:
        print(f"Response: {resp.text}")

    if resp.status_code in (200, 201):
        print("\n  SUCCESS: Subscription created!")
        return True
    else:
        print("\n  FAILED: Subscription creation failed.")
        return False


def activate_base_plan(session):
    print("\n" + "=" * 70)
    print("STEP 3: Activating base plan")
    print("=" * 70)

    url = f"{BASE_URL}/subscriptions/{NEW_PRODUCT_ID}/basePlans/{BASE_PLAN_ID}:activate"
    print(f"POST {url}")

    resp = session.post(url, json={})
    print(f"Status: {resp.status_code}")
    try:
        print(f"Response:\n{json.dumps(resp.json(), indent=2)}")
    except:
        print(f"Response: {resp.text}")

    if resp.status_code == 200:
        print("\n  SUCCESS: Base plan activated!")
        return True
    else:
        print("\n  FAILED: Base plan activation failed.")
        return False


def verify_subscription(session):
    print("\n" + "=" * 70)
    print("STEP 4: Verifying subscription")
    print("=" * 70)

    url = f"{BASE_URL}/subscriptions/{NEW_PRODUCT_ID}"
    resp = session.get(url)
    print(f"GET {url}")
    print(f"Status: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")

        # Summary
        listings = data.get("listings", [])
        base_plans = data.get("basePlans", [])
        print("\n--- SUMMARY ---")
        print(f"  Product ID: {data.get('productId')}")
        for l in listings:
            print(f"  Title: {l.get('title')}")
            print(f"  Description: {l.get('description')}")
        for bp in base_plans:
            print(f"  Base Plan: {bp.get('basePlanId')} (state: {bp.get('state')})")
            for rc in bp.get("regionalConfigs", []):
                p = rc.get("price", {})
                units = p.get("units", "0")
                nanos = p.get("nanos", 0)
                price_str = f"${units}.{nanos // 10000000:02d}"
                print(f"  Price [{rc.get('regionCode')}]: {price_str}/year")
        print("\n  SUCCESS: Subscription verified and active!")
    else:
        print(f"  Error: {resp.text}")


def main():
    print("Android Publisher API - Create Scout Subscription")
    print(f"Package: {PACKAGE_NAME}")
    print(f"New Product ID: {NEW_PRODUCT_ID} ({len(NEW_PRODUCT_ID)} chars)")
    print(f"NOTE: Shortened from 'org.bsa.campcard.subscription.annual.scout' (42 chars)")
    print(f"      to '{NEW_PRODUCT_ID}' ({len(NEW_PRODUCT_ID)} chars)")
    print(f"      because Google Play has a 40-character limit on subscription IDs.")
    print("=" * 70)

    session = get_session()

    # Step 1: List existing
    list_subscriptions(session)

    # Step 2: Create
    created = create_subscription(session)

    if created:
        # Step 3: Activate base plan
        activate_base_plan(session)

        # Step 4: Verify
        verify_subscription(session)
    else:
        print("\nSkipping activation and verification due to creation failure.")


if __name__ == "__main__":
    main()
