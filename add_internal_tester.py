#!/usr/bin/env python3
"""
Add support@swipesavvy.com as an internal tester for org.bsa.campcard on Google Play.
Tries multiple API approaches to discover the correct schema.
"""

import json
import sys

try:
    from google.oauth2 import service_account
    import google.auth.transport.requests as google_requests
    import requests
except ImportError as e:
    print(f"ERROR: Missing dependency: {e}")
    print("Install with: pip3 install --user google-auth requests")
    sys.exit(1)

# --- Authentication ---

SA_PATH = "/Users/papajr/Documents/Projects-2026/camp-card/camp-card-mobile-app-v2-mobile-main/mobile/google-play-service-account.json"
PACKAGE = "org.bsa.campcard"
TESTER_EMAIL = "support@swipesavvy.com"
BASE = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{PACKAGE}"

print("=" * 70)
print("Google Play Internal Tester Addition Script")
print("=" * 70)
print(f"Package: {PACKAGE}")
print(f"Tester:  {TESTER_EMAIL}")
print()

# Load service account credentials and get access token
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]
credentials = service_account.Credentials.from_service_account_file(SA_PATH, scopes=SCOPES)
credentials.refresh(google_requests.Request())

token = credentials.token
print(f"Service account: {credentials.service_account_email}")
print(f"Token obtained (first 20 chars): {token[:20]}...")
print()

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
}


def pp(label, resp):
    """Pretty-print a response."""
    print(f"  [{resp.status_code}] {label}")
    try:
        body = resp.json()
        print(f"  Body: {json.dumps(body, indent=2)}")
    except Exception:
        print(f"  Body (raw): {resp.text[:2000]}")
    print()


# --- Approach 1: Edit-based testers API ---

print("=" * 70)
print("APPROACH 1: Edit-based testers API")
print("=" * 70)
print()

# Step 1: Create an edit
print("Step 1: Create an edit")
r_edit = requests.post(f"{BASE}/edits", headers=headers, json={})
pp("POST /edits", r_edit)

if r_edit.status_code not in (200, 201):
    print("FAILED to create edit. Cannot proceed with Approach 1.")
    edit_id = None
else:
    edit_id = r_edit.json().get("id")
    print(f"  Edit ID: {edit_id}")
    print()

    # Step 2: Get current testers
    print("Step 2: Get current internal testers")
    r_get = requests.get(f"{BASE}/edits/{edit_id}/testers/internal", headers=headers)
    pp("GET /edits/{editId}/testers/internal", r_get)

    # Also try other track names
    for track_name in ["alpha", "beta", "production"]:
        r_track = requests.get(f"{BASE}/edits/{edit_id}/testers/{track_name}", headers=headers)
        pp(f"GET /edits/{{editId}}/testers/{track_name}", r_track)

    # Step 3: Try updating testers with googleIdentities (object form)
    print("Step 3: Try PUT with googleIdentities (object form)")
    body3 = {
        "googleGroups": [],
        "googleIdentities": [{"googleIdentity": TESTER_EMAIL}],
    }
    r3 = requests.put(
        f"{BASE}/edits/{edit_id}/testers/internal",
        headers=headers,
        json=body3,
    )
    pp("PUT testers/internal (googleIdentities objects)", r3)

    # Step 4: Try with googleGroups containing the email
    if r3.status_code >= 400:
        print("Step 4: Try PUT with googleGroups containing email")
        body4 = {"googleGroups": [TESTER_EMAIL]}
        r4 = requests.put(
            f"{BASE}/edits/{edit_id}/testers/internal",
            headers=headers,
            json=body4,
        )
        pp("PUT testers/internal (googleGroups)", r4)

    # Step 5: Try googleIdentities as plain strings
    if r3.status_code >= 400:
        print("Step 5: Try PUT with googleIdentities as strings")
        body5 = {"googleIdentities": [TESTER_EMAIL]}
        r5 = requests.put(
            f"{BASE}/edits/{edit_id}/testers/internal",
            headers=headers,
            json=body5,
        )
        pp("PUT testers/internal (googleIdentities strings)", r5)

    # Step 6: Try emails field (older API convention)
    if r3.status_code >= 400:
        print("Step 6: Try PUT with emails field")
        body6 = {"emails": [TESTER_EMAIL]}
        r6 = requests.put(
            f"{BASE}/edits/{edit_id}/testers/internal",
            headers=headers,
            json=body6,
        )
        pp("PUT testers/internal (emails)", r6)

    # Also try PATCH instead of PUT for each variant
    print("Step 6b: Try PATCH with various fields")
    for label, body in [
        ("googleIdentities objects", {"googleIdentities": [{"googleIdentity": TESTER_EMAIL}]}),
        ("googleIdentities strings", {"googleIdentities": [TESTER_EMAIL]}),
        ("emails", {"emails": [TESTER_EMAIL]}),
        ("testers", {"testers": [{"email": TESTER_EMAIL}]}),
    ]:
        r_patch = requests.patch(
            f"{BASE}/edits/{edit_id}/testers/internal",
            headers=headers,
            json=body,
        )
        pp(f"PATCH testers/internal ({label})", r_patch)
        if r_patch.status_code < 400:
            break

    # Step 7: Try to commit the edit
    print("Step 7: Commit the edit")
    r_commit = requests.post(f"{BASE}/edits/{edit_id}:commit", headers=headers)
    pp("POST /edits/{editId}:commit", r_commit)

    # Step 8: If commit failed, delete the edit
    if r_commit.status_code >= 400:
        print("Step 8: Commit failed, deleting edit")
        r_del = requests.delete(f"{BASE}/edits/{edit_id}", headers=headers)
        pp("DELETE /edits/{editId}", r_del)


# --- Approach 2: Newer testing endpoints ---

print()
print("=" * 70)
print("APPROACH 2: Newer /testing endpoints (discovery)")
print("=" * 70)
print()

for endpoint in [
    "/testing",
    "/testing/internal",
    "/testing/internal/testers",
    "/internalappsharing",
]:
    r = requests.get(f"{BASE}{endpoint}", headers=headers)
    pp(f"GET {endpoint}", r)

# Also try POST to add tester directly
for endpoint in [
    "/testing/internal/testers",
    "/testing/internal",
]:
    r = requests.post(
        f"{BASE}{endpoint}",
        headers=headers,
        json={"email": TESTER_EMAIL},
    )
    pp(f"POST {endpoint} (email)", r)

    r = requests.post(
        f"{BASE}{endpoint}",
        headers=headers,
        json={"emails": [TESTER_EMAIL]},
    )
    pp(f"POST {endpoint} (emails list)", r)


# --- Approach 3: Alternative API paths ---

print()
print("=" * 70)
print("APPROACH 3: Alternative API paths")
print("=" * 70)
print()

# Create a fresh edit for track listing
r_edit2 = requests.post(f"{BASE}/edits", headers=headers, json={})
if r_edit2.status_code in (200, 201):
    edit_id2 = r_edit2.json().get("id")
    print(f"Fresh edit ID: {edit_id2}")
    print()

    print("Listing all tracks:")
    r_tracks = requests.get(f"{BASE}/edits/{edit_id2}/tracks", headers=headers)
    pp("GET /edits/{editId}/tracks", r_tracks)

    # Try the internal track specifically
    r_internal = requests.get(f"{BASE}/edits/{edit_id2}/tracks/internal", headers=headers)
    pp("GET /edits/{editId}/tracks/internal", r_internal)

    # Clean up
    requests.delete(f"{BASE}/edits/{edit_id2}", headers=headers)
else:
    pp("POST /edits (fresh)", r_edit2)

# Try non-edit-based paths
for path in [
    "/users",
    "/testers",
    "/internalAppSharingArtifacts",
]:
    r = requests.get(f"{BASE}{path}", headers=headers)
    pp(f"GET {path}", r)


print()
print("=" * 70)
print("DONE - Review all responses above to determine the correct approach.")
print("=" * 70)
