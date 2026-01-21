# COPPA & Minors Privacy Compliance

## Overview

This document outlines the Camp Card application's compliance with the Children's Online Privacy Protection Act (COPPA) and state privacy laws regarding minors' data, particularly location data.

## Legal Requirements Summary

### Federal Law - COPPA (Children's Online Privacy Protection Act)

| Requirement | Age Group | Description |
|-------------|-----------|-------------|
| Verifiable Parental Consent | Under 13 | Required BEFORE collecting any personal information |
| Privacy Notice | Under 13 | Must inform parents about data collection practices |
| Parental Rights | Under 13 | Parents can review, delete, or revoke consent |
| Data Minimization | Under 13 | Cannot condition participation on unnecessary data |

### State Laws (Florida, California, etc.)

| Requirement | Age Group | Description |
|-------------|-----------|-------------|
| Location Restrictions | Under 18 | Precise geolocation requires consent and transparency |
| Opt-out Rights | Under 16 (CCPA) | Affirmative consent required for data sharing |
| Risk Assessment | Under 18 | Cannot create "substantial risk" to minors |

---

## User Flow Diagrams

### Flow 1: Scout Account Creation (Unit Leader Creates in Admin Portal)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN PORTAL - UNIT LEADER                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │   Unit Leader Logs In        │
                         │   to Admin Portal            │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   "Manage Scouts" Section    │
                         │   Click "Add New Scout"      │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
         ┌──────────────────────────────────────────────────────────────┐
         │                    ADD SCOUT FORM                            │
         │  ┌────────────────────────────────────────────────────────┐  │
         │  │  First Name: [_______________]                         │  │
         │  │  Last Name:  [_______________]                         │  │
         │  │  Email:      [_______________]                         │  │
         │  │                                                        │  │
         │  │  ┌─────────────────────────────────────────────────┐   │  │
         │  │  │  📅 Date of Birth: [MM/DD/YYYY] ◄── REQUIRED    │   │  │
         │  │  │     (Required for COPPA compliance)             │   │  │
         │  │  └─────────────────────────────────────────────────┘   │  │
         │  │                                                        │  │
         │  │  ┌─────────────────────────────────────────────────┐   │  │
         │  │  │  PARENT/GUARDIAN INFORMATION ◄── REQUIRED       │   │  │
         │  │  │  Parent Name:  [_______________]                │   │  │
         │  │  │  Parent Email: [_______________]                │   │  │
         │  │  │  Parent Phone: [_______________] (optional)     │   │  │
         │  │  └─────────────────────────────────────────────────┘   │  │
         │  │                                                        │  │
         │  │  [Create Scout Account]                                │  │
         │  └────────────────────────────────────────────────────────┘  │
         └──────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
         ┌──────────────────────────────────────────────────────────────┐
         │                    BACKEND PROCESSING                        │
         │  ┌────────────────────────────────────────────────────────┐  │
         │  │  1. Create Scout user account (status: PENDING_CONSENT)│  │
         │  │  2. Calculate age from DOB                             │  │
         │  │  3. Set is_minor = true if age < 18                    │  │
         │  │  4. Set is_under_13 = true if age < 13                 │  │
         │  │  5. Create ParentalConsent record (status: PENDING)    │  │
         │  │  6. Generate verification token                        │  │
         │  │  7. Send consent request email to parent               │  │
         │  │  8. Send welcome email to Scout with temp password     │  │
         │  └────────────────────────────────────────────────────────┘  │
         └──────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
    ┌───────────────────────────────┐       ┌───────────────────────────────┐
    │      EMAIL TO PARENT          │       │      EMAIL TO SCOUT           │
    │  ┌─────────────────────────┐  │       │  ┌─────────────────────────┐  │
    │  │ Subject: Consent        │  │       │  │ Subject: Welcome to     │  │
    │  │ Required for [Scout]    │  │       │  │ Camp Card!              │  │
    │  │                         │  │       │  │                         │  │
    │  │ Your child has been     │  │       │  │ Your Unit Leader has    │  │
    │  │ added to Camp Card.     │  │       │  │ created your account.   │  │
    │  │                         │  │       │  │                         │  │
    │  │ Please review and       │  │       │  │ Temporary Password:     │  │
    │  │ approve their account:  │  │       │  │ [xxxxxx]                │  │
    │  │                         │  │       │  │                         │  │
    │  │ [APPROVE] [DENY]        │  │       │  │ Download the app and    │  │
    │  │                         │  │       │  │ log in to get started!  │  │
    │  └─────────────────────────┘  │       │  └─────────────────────────┘  │
    └───────────────────────────────┘       └───────────────────────────────┘
```

### Flow 2: Scout First Login (Mobile App)

```
                              ┌──────────────────┐
                              │   Scout Opens    │
                              │   Mobile App     │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Login Screen   │
                              │   Email + Temp   │
                              │   Password       │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Backend Check:  │
                              │  user.consent    │
                              │  Status = ?      │
                              └────────┬─────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
┌──────────────────┐       ┌──────────────────────┐      ┌──────────────────┐
│ CONSENT_GRANTED  │       │  CONSENT_PENDING     │      │  CONSENT_DENIED  │
│                  │       │                      │      │                  │
│ Parent already   │       │ Parent hasn't        │      │ Parent denied    │
│ approved         │       │ responded yet        │      │ consent          │
└────────┬─────────┘       └──────────┬───────────┘      └────────┬─────────┘
         │                            │                           │
         │                            ▼                           ▼
         │              ┌─────────────────────────────┐  ┌─────────────────────┐
         │              │   PENDING CONSENT SCREEN    │  │   ACCESS DENIED     │
         │              │  ┌───────────────────────┐  │  │  ┌───────────────┐  │
         │              │  │  ⏳                    │  │  │  │ ❌ Your parent│  │
         │              │  │  Waiting for Parent   │  │  │  │ did not       │  │
         │              │  │  Approval             │  │  │  │ approve your  │  │
         │              │  │                       │  │  │  │ account.      │  │
         │              │  │  We've sent an email  │  │  │  │               │  │
         │              │  │  to your parent at:   │  │  │  │ Please ask    │  │
         │              │  │  p****@email.com      │  │  │  │ them to       │  │
         │              │  │                       │  │  │  │ reconsider.   │  │
         │              │  │  [Resend Email]       │  │  │  │               │  │
         │              │  │  [Enter Different     │  │  │  │ [Contact      │  │
         │              │  │   Parent Email]       │  │  │  │  Support]     │  │
         │              │  └───────────────────────┘  │  │  └───────────────┘  │
         │              └─────────────────────────────┘  └─────────────────────┘
         │                            │
         │                            │ (When parent approves)
         │                            │
         └────────────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │   FORCE PASSWORD CHANGE   │
              │  (First login only)       │
              │  ┌─────────────────────┐  │
              │  │ Create New Password │  │
              │  │ [_______________]   │  │
              │  │                     │  │
              │  │ Confirm Password    │  │
              │  │ [_______________]   │  │
              │  │                     │  │
              │  │ [Set Password]      │  │
              │  └─────────────────────┘  │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   FULL APP ACCESS         │
              │   (Scout Dashboard)       │
              │                           │
              │   ✅ Location enabled     │
              │   ✅ Full features        │
              └───────────────────────────┘
```

### Flow 3: Parent/Customer Self-Registration (Age Gate During Signup)

```
                                    ┌──────────────┐
                                    │  App Launch  │
                                    └──────┬───────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   Welcome Screen       │
                              │   "Create Account"     │
                              └───────────┬────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      AGE VERIFICATION GATE      │
                         │  ┌───────────────────────────┐  │
                         │  │  "When is your birthday?" │  │
                         │  │                           │  │
                         │  │   [Date Picker Control]   │  │
                         │  │                           │  │
                         │  │   This helps us provide   │  │
                         │  │   appropriate content     │  │
                         │  │   and comply with         │  │
                         │  │   privacy laws.           │  │
                         │  └───────────────────────────┘  │
                         └────────────────┬────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │   AGE < 13       │  │   AGE 13-17      │  │   AGE 18+        │
         │   (COPPA Full)   │  │   (State Laws)   │  │   (Adult)        │
         └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
                  │                     │                     │
                  ▼                     ▼                     │
    ┌─────────────────────────────────────────────────┐       │
    │           UNDER 18 - REQUIRES CONSENT           │       │
    │  ┌───────────────────────────────────────────┐  │       │
    │  │  🔒 Parental Consent Required             │  │       │
    │  │                                           │  │       │
    │  │  Because you're under 18, we need your   │  │       │
    │  │  parent or guardian's permission to      │  │       │
    │  │  create an account.                      │  │       │
    │  │                                           │  │       │
    │  │  Parent/Guardian Email:                  │  │       │
    │  │  [_____________________________]         │  │       │
    │  │                                           │  │       │
    │  │  Parent/Guardian Full Name:              │  │       │
    │  │  [_____________________________]         │  │       │
    │  │                                           │  │       │
    │  │  [Request Parent Permission]             │  │       │
    │  └───────────────────────────────────────────┘  │       │
    └─────────────────────┬───────────────────────────┘       │
                          │                                   │
                          │ (After parent approves)           │
                          │                                   │
                          ▼                                   ▼
                    ┌───────────────────────────────────────────┐
                    │       COMPLETE REGISTRATION FORM          │
                    │  ┌─────────────────────────────────────┐  │
                    │  │  Email: [___________________]       │  │
                    │  │  Password: [___________________]    │  │
                    │  │  First Name: [___________________]  │  │
                    │  │  Last Name: [___________________]   │  │
                    │  │                                     │  │
                    │  │  [Create Account]                   │  │
                    │  └─────────────────────────────────────┘  │
                    └───────────────────────────────────────────┘
```

### Flow 4: Location Access Control (In-App)

```
                              ┌──────────────────────┐
                              │  User taps "Find     │
                              │  Nearby Merchants"   │
                              └──────────┬───────────┘
                                         │
                                         ▼
                    ┌────────────────────────────────────────────┐
                    │           CHECK USER PROFILE               │
                    │  ┌──────────────────────────────────────┐  │
                    │  │  user.role = ?                       │  │
                    │  │  user.isMinor = ?                    │  │
                    │  │  user.locationConsentStatus = ?      │  │
                    │  └──────────────────────────────────────┘  │
                    └────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  ADULT (18+)        │      │  MINOR WITH         │      │  MINOR WITHOUT      │
│  or                 │      │  LOCATION CONSENT   │      │  LOCATION CONSENT   │
│  UNIT_LEADER        │      │                     │      │                     │
└──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
           │                            │                            │
           │                            │                            ▼
           │                            │              ┌─────────────────────────────┐
           │                            │              │   LOCATION BLOCKED MODAL    │
           │                            │              │  ┌───────────────────────┐  │
           │                            │              │  │  🔒 Location Access   │  │
           │                            │              │  │     Restricted        │  │
           │                            │              │  │                       │  │
           │                            │              │  │  Your parent hasn't   │  │
           │                            │              │  │  enabled location     │  │
           │                            │              │  │  access for your      │  │
           │                            │              │  │  account.             │  │
           │                            │              │  │                       │  │
           │                            │              │  │  [Browse All Offers]  │  │
           │                            │              │  └───────────────────────┘  │
           │                            │              └─────────────────────────────┘
           │                            │
           └────────────┬───────────────┘
                        │
                        ▼
              ┌──────────────────────┐
              │  REQUEST OS LOCATION │
              │  PERMISSION          │
              └──────────┬───────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  📍 LOCATION ACTIVE INDICATOR │
         │  (Visible while tracking)     │
         │  ┌───────────────────────┐    │
         │  │ 🔴 Location active    │    │
         │  └───────────────────────┘    │
         └───────────────────────────────┘
```

---

## Database Schema

### Users Table (Updated Fields)

```sql
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT FALSE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS is_under_13 BOOLEAN DEFAULT FALSE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS consent_status VARCHAR(20) DEFAULT 'NOT_REQUIRED';
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS location_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255);
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
```

### Parental Consents Table

```sql
CREATE TABLE campcard.parental_consents (
    id BIGSERIAL PRIMARY KEY,
    minor_user_id BIGINT NOT NULL REFERENCES campcard.users(id) ON DELETE CASCADE,
    parent_user_id BIGINT REFERENCES campcard.users(id) ON DELETE SET NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(20),

    consent_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    location_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    data_collection_consent BOOLEAN DEFAULT FALSE,

    verification_token VARCHAR(255) UNIQUE,
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    consent_granted_at TIMESTAMP WITH TIME ZONE,
    consent_ip_address VARCHAR(45),
    consent_user_agent TEXT,
    revoked_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(minor_user_id)
);
```

---

## API Endpoints

### Admin Portal (Unit Leader)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/scouts` | Create scout with DOB and parent info |
| GET | `/api/v1/scouts/{id}/consent-status` | Get consent status |
| POST | `/api/v1/scouts/{id}/resend-consent` | Resend consent email |

### Mobile App

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/mobile/login` | Returns consent status in response |
| POST | `/api/v1/auth/register` | Includes DOB and parent info for minors |
| GET | `/api/v1/consent/my-status` | Get current user's consent status |
| POST | `/api/v1/consent/resend` | Resend consent email to parent |
| POST | `/api/v1/consent/update-parent` | Update parent email and resend |

### Public (Consent Verification)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/consent/verify/{token}` | Get consent verification page data |
| POST | `/api/v1/consent/verify/{token}` | Submit parent's consent decision |

### Parent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/consent/children` | List children linked to parent |
| GET | `/api/v1/consent/children/{childId}/data` | Get all data for child |
| DELETE | `/api/v1/consent/children/{childId}/data` | Delete all child data |
| POST | `/api/v1/consent/children/{childId}/revoke-location` | Revoke location consent |

---

## Implementation Checklist

### Phase 1: Backend

- [ ] V027 Migration: Add COPPA fields to users table
- [ ] V027 Migration: Create parental_consents table
- [ ] ParentalConsent entity and repository
- [ ] ParentalConsentService
- [ ] Update User entity with new fields
- [ ] ParentalConsentController
- [ ] Consent email templates
- [ ] Update AuthController for consent status

### Phase 2: Admin Portal

- [ ] Update Add Scout form with DOB and parent fields
- [ ] Show consent status badge on scout list
- [ ] Add "Resend Consent Email" button
- [ ] Consent verification page

### Phase 3: Mobile App

- [ ] AgeVerificationScreen
- [ ] ParentalConsentRequiredScreen
- [ ] PendingConsentScreen
- [ ] ForcePasswordChangeScreen
- [ ] Update authStore with consent status
- [ ] useLocationWithConsent hook
- [ ] LocationActiveIndicator component

---

## Privacy Policy Additions

The following must be added to the Privacy Policy:

### Children's Privacy (COPPA Compliance)

Camp Card is committed to protecting the privacy of children. We comply with the Children's Online Privacy Protection Act (COPPA) and applicable state privacy laws.

**Users Under 13:**
- We do not knowingly collect personal information from children under 13 without verifiable parental consent
- Parents must provide consent via email verification before their child can use location features
- Parents can review, delete, or revoke consent for their child's data at any time

**Users Under 18:**
- Location data collection requires parental consent for all users under 18
- We collect only the minimum location data necessary to show nearby merchants
- Location data is not stored permanently or shared with third parties

**Parental Rights:**
Parents and guardians have the right to:
- Review the personal information collected from their child
- Request deletion of their child's personal information
- Revoke consent for future data collection
- Contact us at privacy@campcardapp.org with questions

**Location Data:**
- Location is only collected when actively using the "Find Merchants" feature
- We do not track location in the background
- Location data is not used for behavioral advertising
- A visible indicator shows when location is being accessed

---

## Terms of Service Additions

### Age Requirements and Parental Consent

**Age Verification:**
By using Camp Card, you confirm that:
- If you are 18 or older, you have the legal capacity to enter into this agreement
- If you are under 18, your parent or guardian has provided consent for you to use this service

**Parental Consent for Minors:**
- Users under 18 require parental consent to access the app
- Parents must verify their identity and approve their child's account via email
- Parents may revoke consent at any time, which will result in account deactivation

**Data Collection for Minors:**
- We collect minimal personal information from minors
- Location data is only collected with explicit parental consent
- Parents can request full deletion of their child's data at any time

---

## Contact Information

For privacy inquiries or to exercise parental rights:
- Email: privacy@campcardapp.org
- Web: https://campcardapp.org/privacy
- Mail: [Physical Address]

---

*Document Version: 1.0*
*Last Updated: January 2026*
