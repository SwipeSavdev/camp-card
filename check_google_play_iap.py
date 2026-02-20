#!/usr/bin/env python3
"""
Query Google Play Developer API to check IAP products for org.bsa.campcard.

Uses the service account at:
  camp-card-mobile-app-v2-mobile-main/mobile/google-play-service-account.json
"""

import json
import warnings
import sys

# Suppress Python 3.9 EOL and LibreSSL warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*urllib3.*")

from google.oauth2 import service_account
from google.auth.transport.requests import Request
import requests

# Configuration
SERVICE_ACCOUNT_PATH = (
    "/Users/papajr/Documents/Projects-2026/camp-card/"
    "camp-card-mobile-app-v2-mobile-main/mobile/google-play-service-account.json"
)
PACKAGE_NAME = "org.bsa.campcard"
BASE_URL = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]


def get_credentials():
    """Load service account credentials and generate an access token."""
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_PATH, scopes=SCOPES
    )
    creds.refresh(Request())
    return creds


def query_endpoint(session, name, url):
    """Query an endpoint and print the results."""
    print(f"\n{'='*70}")
    print(f"  {name}")
    print(f"  GET {url}")
    print(f"{'='*70}")

    resp = session.get(url)
    print(f"Status: {resp.status_code}")

    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
    except Exception:
        print(f"Raw response: {resp.text[:2000]}")

    return resp.status_code, resp


def main():
    # Print service account info
    print("Loading service account credentials...")
    with open(SERVICE_ACCOUNT_PATH) as f:
        sa_info = json.load(f)
    print(f"  Service Account Email: {sa_info.get('client_email', 'N/A')}")
    print(f"  Project ID: {sa_info.get('project_id', 'N/A')}")
    print(f"  Package Name: {PACKAGE_NAME}")

    # Authenticate
    print("\nAuthenticating with Google Play Developer API...")
    creds = get_credentials()
    print(f"  Access token obtained (expires: {creds.expiry})")

    # Create authenticated session
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {creds.token}",
        "Accept": "application/json",
    })

    # 1. One-time products (legacy inappproducts endpoint)
    query_endpoint(
        session,
        "ONE-TIME PRODUCTS (legacy inappproducts endpoint)",
        f"{BASE_URL}/{PACKAGE_NAME}/inappproducts",
    )

    # 2. One-time products (newer onetimeproducts endpoint)
    query_endpoint(
        session,
        "ONE-TIME PRODUCTS (newer onetimeproducts endpoint - may not be available)",
        f"{BASE_URL}/{PACKAGE_NAME}/onetimeproducts",
    )

    # 3. Subscriptions (subscriptions endpoint)
    query_endpoint(
        session,
        "SUBSCRIPTIONS (subscriptions endpoint)",
        f"{BASE_URL}/{PACKAGE_NAME}/subscriptions",
    )

    # Summary
    print(f"\n{'='*70}")
    print("  SUMMARY")
    print(f"{'='*70}")
    print(f"Package: {PACKAGE_NAME}")
    print("Check the responses above to see if any IAP products exist.")
    print("An empty list or 404 means no products have been created yet.")


if __name__ == "__main__":
    main()
