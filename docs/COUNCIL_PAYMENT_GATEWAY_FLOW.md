# Council Payment Gateway Configuration Flow

This document provides detailed workflow diagrams for the council-specific Authorize.net payment gateway configuration system.

---

## Table of Contents

1. [Council Onboarding Flow](#1-council-onboarding-flow)
2. [Payment Gateway Configuration Flow](#2-payment-gateway-configuration-flow)
3. [Payment Processing Flow (Multi-Gateway)](#3-payment-processing-flow-multi-gateway)
4. [Credential Verification Flow](#4-credential-verification-flow)
5. [Subscription Purchase Flow (Council-Specific)](#5-subscription-purchase-flow-council-specific)
6. [System Architecture Overview](#6-system-architecture-overview)

---

## 1. Council Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              COUNCIL ONBOARDING FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │   National Admin Logs In     │
                         │   (admin.campcardapp.org)    │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Navigate to Councils       │
                         │   → Create New Council       │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STEP 1: Basic Information                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  Council Number:  [_______________]    Council Name:  [_________________________]   │   │
│   │  Region:          [Northeast ▼]        Short Name:    [_______________]             │   │
│   │                                                                                      │   │
│   │  Street Address:  [_________________________________________________]               │   │
│   │  City:           [_______________]  State: [__]  ZIP: [_________]                   │   │
│   │                                                                                      │   │
│   │  Phone:          [_______________]  Email: [_________________________]              │   │
│   │  Website:        [_________________________________________________]               │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│                                       [Next Step →]                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STEP 2: Contact Details                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  SCOUT EXECUTIVE                          CAMP CARD COORDINATOR                      │   │
│   │  ─────────────────                        ─────────────────────                      │   │
│   │  Name:  [_______________]                 Name:  [_______________]                   │   │
│   │  Email: [_______________]                 Email: [_______________]                   │   │
│   │                                           Phone: [_______________]                   │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│                                  [← Previous]  [Next Step →]                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              STEP 3: Payment Gateway Configuration                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  AUTHORIZE.NET CREDENTIALS                                                           │   │
│   │  ─────────────────────────                                                           │   │
│   │                                                                                      │   │
│   │  API Login ID:      [_________________________]                                      │   │
│   │                                                                                      │   │
│   │  Transaction Key:   [_________________________]                                      │   │
│   │                                                                                      │   │
│   │  Environment:       ○ Sandbox (Testing)                                              │   │
│   │                     ● Production (Live)                                              │   │
│   │                                                                                      │   │
│   │  ┌─────────────────────────────────────────────────────────────────────────────┐    │   │
│   │  │  ⚠️  These credentials will be encrypted and stored securely.               │    │   │
│   │  │     Only National Admins can view or modify these settings.                 │    │   │
│   │  └─────────────────────────────────────────────────────────────────────────────┘    │   │
│   │                                                                                      │   │
│   │                            [Test Connection]                                         │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│                                  [← Previous]  [Next Step →]                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Test Connection Clicked    │
                         └──────────────┬───────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
         ┌──────────────────┐                    ┌──────────────────┐
         │  ✓ Connection    │                    │  ✗ Connection    │
         │    Successful    │                    │    Failed        │
         └────────┬─────────┘                    └────────┬─────────┘
                  │                                       │
                  │                                       ▼
                  │                            ┌──────────────────────┐
                  │                            │  Show Error Message  │
                  │                            │  "Invalid API Login  │
                  │                            │   ID or Transaction  │
                  │                            │   Key. Please check  │
                  │                            │   your credentials." │
                  │                            └──────────┬───────────┘
                  │                                       │
                  │                                       ▼
                  │                            ┌──────────────────────┐
                  │                            │  User Corrects       │
                  │                            │  Credentials         │
                  │                            └──────────┬───────────┘
                  │                                       │
                  │◄──────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STEP 4: Review & Activate                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  COUNCIL SUMMARY                                                                     │   │
│   │  ───────────────                                                                     │   │
│   │                                                                                      │   │
│   │  Council:          Greater New York Councils (#641)                                  │   │
│   │  Region:           Northeast                                                         │   │
│   │  Coordinator:      John Smith (john.smith@scouting.org)                              │   │
│   │                                                                                      │   │
│   │  PAYMENT GATEWAY                                                                     │   │
│   │  ───────────────                                                                     │   │
│   │  Gateway:          Authorize.net                                                     │   │
│   │  API Login ID:     ••••••••1234                                                      │   │
│   │  Environment:      Production                                                        │   │
│   │  Status:           ✓ Verified                                                        │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│                                  [← Previous]  [Activate Council]                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Council Created &          │
                         │   Payment Gateway Configured │
                         │                              │
                         │   Status: ACTIVE             │
                         │   Gateway: VERIFIED          │
                         └──────────────────────────────┘
```

---

## 2. Payment Gateway Configuration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          PAYMENT GATEWAY CONFIGURATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        FRONTEND (Web Portal)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   Admin enters credentials                                                                   │
│        │                                                                                     │
│        ▼                                                                                     │
│   ┌────────────────────────────────────────┐                                                │
│   │  POST /api/v1/councils/{id}/payment-config                                              │
│   │  {                                                                                      │
│   │    "apiLoginId": "ABC123XYZ",                                                           │
│   │    "transactionKey": "9k8j7h6g5f4d3s2a",                                                │
│   │    "environment": "PRODUCTION"                                                          │
│   │  }                                                                                      │
│   └────────────────────────────────────────┘                                                │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        BACKEND (Spring Boot)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        CouncilPaymentConfigController                                │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │  @PreAuthorize("hasRole('NATIONAL_ADMIN')")                                          │   │
│   │  @PostMapping("/councils/{councilId}/payment-config")                                │   │
│   │                                                                                      │   │
│   │  1. Validate request DTO                                                             │   │
│   │  2. Check council exists                                                             │   │
│   │  3. Call CouncilPaymentConfigService.createConfig()                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        CouncilPaymentConfigService                                   │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │  createConfig(councilId, request):                                                   │   │
│   │                                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │  1. Check for existing config                                                  │  │   │
│   │  │     → If exists, throw ConflictException                                       │  │   │
│   │  │                                                                                │  │   │
│   │  │  2. Encrypt credentials                                                        │  │   │
│   │  │     apiLoginIdEncrypted = encryptionService.encrypt(apiLoginId)               │  │   │
│   │  │     transactionKeyEncrypted = encryptionService.encrypt(transactionKey)       │  │   │
│   │  │                                                                                │  │   │
│   │  │  3. Create CouncilPaymentConfig entity                                         │  │   │
│   │  │     config.councilId = councilId                                               │  │   │
│   │  │     config.gatewayType = AUTHORIZE_NET                                         │  │   │
│   │  │     config.apiLoginIdEncrypted = apiLoginIdEncrypted                           │  │   │
│   │  │     config.transactionKeyEncrypted = transactionKeyEncrypted                   │  │   │
│   │  │     config.environment = request.environment                                   │  │   │
│   │  │     config.isActive = true                                                     │  │   │
│   │  │     config.isVerified = false                                                  │  │   │
│   │  │                                                                                │  │   │
│   │  │  4. Save to database                                                           │  │   │
│   │  │                                                                                │  │   │
│   │  │  5. Return masked response                                                     │  │   │
│   │  └───────────────────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        CredentialEncryptionService                                   │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │  encrypt(plainText):                                                                 │   │
│   │                                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │                                                                                │  │   │
│   │  │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                     │  │   │
│   │  │   │  Plain Text │ ──▶ │  AES-256    │ ──▶ │  Encrypted  │                     │  │   │
│   │  │   │  "ABC123"   │     │  GCM        │     │  Base64     │                     │  │   │
│   │  │   └─────────────┘     └─────────────┘     └─────────────┘                     │  │   │
│   │  │                             │                                                  │  │   │
│   │  │                     Master Key from                                            │  │   │
│   │  │                     CREDENTIAL_ENCRYPTION_KEY                                  │  │   │
│   │  │                     environment variable                                       │  │   │
│   │  │                                                                                │  │   │
│   │  │   Unique IV (Initialization Vector) per encryption                             │  │   │
│   │  │   IV prepended to ciphertext for decryption                                    │  │   │
│   │  │                                                                                │  │   │
│   │  └───────────────────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        DATABASE (PostgreSQL)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         council_payment_configs                                      │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │  id                    │  1                                                          │   │
│   │  council_id            │  641                                                        │   │
│   │  gateway_type          │  AUTHORIZE_NET                                              │   │
│   │  api_login_id_encrypted│  aGVsbG8gd29ybGQgdGhpcyBpcyBlbmNyeXB0ZWQ=...               │   │
│   │  transaction_key_enc   │  c29tZSBvdGhlciBlbmNyeXB0ZWQgZGF0YQ==...                   │   │
│   │  environment           │  PRODUCTION                                                 │   │
│   │  is_active             │  true                                                       │   │
│   │  is_verified           │  false                                                      │   │
│   │  last_verified_at      │  NULL                                                       │   │
│   │  created_at            │  2026-01-22 10:30:00                                        │   │
│   │  updated_at            │  2026-01-22 10:30:00                                        │   │
│   │  created_by            │  1 (admin user id)                                          │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Payment Processing Flow (Multi-Gateway)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT PROCESSING FLOW (MULTI-GATEWAY)                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │   User Initiates Purchase    │
                         │   (Mobile App or Web Portal) │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Purchase Request           │
                         │   - userId: 12345            │
                         │   - councilId: 641           │
                         │   - amount: $10.00           │
                         │   - cardInfo: {...}          │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        PaymentService                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   charge(councilId, request):                                                                │
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 1: Get Council Payment Gateway Credentials                                     │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   getMerchantAuth(councilId):                                                        │   │
│   │                                                                                      │   │
│   │         ┌──────────────────────────────────────────────┐                            │   │
│   │         │  councilPaymentConfigService                  │                            │   │
│   │         │  .getDecryptedCredentials(councilId)          │                            │   │
│   │         └───────────────────────┬──────────────────────┘                            │   │
│   │                                 │                                                    │   │
│   │              ┌──────────────────┴──────────────────┐                                │   │
│   │              │                                     │                                │   │
│   │              ▼                                     ▼                                │   │
│   │   ┌──────────────────────┐            ┌──────────────────────┐                     │   │
│   │   │  Council Config      │            │  No Council Config   │                     │   │
│   │   │  Found & Active      │            │  Found               │                     │   │
│   │   └──────────┬───────────┘            └──────────┬───────────┘                     │   │
│   │              │                                   │                                  │   │
│   │              ▼                                   ▼                                  │   │
│   │   ┌──────────────────────┐            ┌──────────────────────┐                     │   │
│   │   │  Decrypt Credentials │            │  Use Default Gateway │                     │   │
│   │   │  from Database       │            │  (Environment Vars)  │                     │   │
│   │   │                      │            │                      │                     │   │
│   │   │  apiLoginId:         │            │  apiLoginId:         │                     │   │
│   │   │    decrypted value   │            │    ${AUTHORIZE_NET_  │                     │   │
│   │   │  transactionKey:     │            │      API_LOGIN_ID}   │                     │   │
│   │   │    decrypted value   │            │  transactionKey:     │                     │   │
│   │   │  environment:        │            │    ${AUTHORIZE_NET_  │                     │   │
│   │   │    from config       │            │      TRANSACTION_KEY}│                     │   │
│   │   └──────────┬───────────┘            └──────────┬───────────┘                     │   │
│   │              │                                   │                                  │   │
│   │              └───────────────┬───────────────────┘                                  │   │
│   │                              │                                                      │   │
│   │                              ▼                                                      │   │
│   │              ┌───────────────────────────────────┐                                  │   │
│   │              │  MerchantAuthenticationType       │                                  │   │
│   │              │  - name: apiLoginId               │                                  │   │
│   │              │  - transactionKey: transactionKey │                                  │   │
│   │              └───────────────────────────────────┘                                  │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 2: Build Transaction Request                                                   │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   TransactionRequestType:                                                            │   │
│   │   - transactionType: AUTH_CAPTURE                                                    │   │
│   │   - amount: $10.00                                                                   │   │
│   │   - payment: CreditCardType                                                          │   │
│   │   - customer: CustomerDataType                                                       │   │
│   │   - billTo: CustomerAddressType                                                      │   │
│   │   - order: OrderType (description, invoice)                                          │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 3: Set Environment Based on Council Config                                     │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   if (councilConfig != null) {                                                       │   │
│   │       environment = councilConfig.getEnvironment(); // PRODUCTION or SANDBOX         │   │
│   │   } else {                                                                           │   │
│   │       environment = defaultEnvironment; // from env vars                             │   │
│   │   }                                                                                  │   │
│   │                                                                                      │   │
│   │   ApiOperationBase.setEnvironment(                                                   │   │
│   │       "PRODUCTION".equals(environment)                                               │   │
│   │           ? Environment.PRODUCTION                                                   │   │
│   │           : Environment.SANDBOX                                                      │   │
│   │   );                                                                                 │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 4: Execute Transaction                                                         │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   CreateTransactionController.execute()                                              │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      AUTHORIZE.NET                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│        ┌────────────────────────────────────────────────────────────────────────┐           │
│        │                                                                         │           │
│        │   Council #641's Authorize.net Account                                  │           │
│        │   (or Default Account if no council config)                             │           │
│        │                                                                         │           │
│        │   ┌───────────────────────────────────────────────────────────────┐    │           │
│        │   │  Transaction Processing                                        │    │           │
│        │   │  - Card Validation                                             │    │           │
│        │   │  - Fraud Detection                                             │    │           │
│        │   │  - Bank Authorization                                          │    │           │
│        │   │  - Settlement                                                  │    │           │
│        │   └───────────────────────────────────────────────────────────────┘    │           │
│        │                                                                         │           │
│        │   Funds deposited to Council #641's bank account                        │           │
│        │                                                                         │           │
│        └────────────────────────────────────────────────────────────────────────┘           │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Transaction Response       │
                         │   - transactionId: 12345678  │
                         │   - status: SUCCESS          │
                         │   - authCode: ABC123         │
                         └──────────────────────────────┘
```

---

## 4. Credential Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            CREDENTIAL VERIFICATION FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │   Admin Clicks               │
                         │   "Test Connection"          │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │  POST /api/v1/councils/      │
                         │  {councilId}/payment-config/ │
                         │  verify                      │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            CouncilPaymentConfigService.verifyConfig()                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 1: Retrieve and Decrypt Credentials                                            │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   CouncilPaymentConfig config = repository.findByCouncilId(councilId);               │   │
│   │                                                                                      │   │
│   │   String apiLoginId = encryptionService.decrypt(config.getApiLoginIdEncrypted());    │   │
│   │   String transactionKey = encryptionService.decrypt(config.getTransactionKeyEnc()); │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 2: Send Test Authentication Request to Authorize.net                           │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   // Use AuthenticateTestRequest to verify credentials                               │   │
│   │   // This does NOT process any payment, just validates API access                    │   │
│   │                                                                                      │   │
│   │   MerchantAuthenticationType merchantAuth = new MerchantAuthenticationType();        │   │
│   │   merchantAuth.setName(apiLoginId);                                                  │   │
│   │   merchantAuth.setTransactionKey(transactionKey);                                    │   │
│   │                                                                                      │   │
│   │   AuthenticateTestRequest testRequest = new AuthenticateTestRequest();               │   │
│   │   testRequest.setMerchantAuthentication(merchantAuth);                               │   │
│   │                                                                                      │   │
│   │   AuthenticateTestController controller = new AuthenticateTestController(testReq);   │   │
│   │   controller.execute();                                                              │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 3: Process Response                                                            │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │              ┌──────────────────┴──────────────────┐                                │   │
│   │              │                                     │                                │   │
│   │              ▼                                     ▼                                │   │
│   │   ┌──────────────────────┐            ┌──────────────────────┐                     │   │
│   │   │  ResultCode = OK     │            │  ResultCode = ERROR  │                     │   │
│   │   └──────────┬───────────┘            └──────────┬───────────┘                     │   │
│   │              │                                   │                                  │   │
│   │              ▼                                   ▼                                  │   │
│   │   ┌──────────────────────┐            ┌──────────────────────┐                     │   │
│   │   │  Update Config:      │            │  Return Error:       │                     │   │
│   │   │  - isVerified: true  │            │  - success: false    │                     │   │
│   │   │  - lastVerifiedAt:   │            │  - errorCode: E00007 │                     │   │
│   │   │      NOW()           │            │  - errorMessage:     │                     │   │
│   │   │                      │            │    "User auth failed"│                     │   │
│   │   │  Return:             │            │                      │                     │   │
│   │   │  - success: true     │            │  Config remains      │                     │   │
│   │   │  - message: "Valid"  │            │  - isVerified: false │                     │   │
│   │   └──────────────────────┘            └───���──────────────────┘                     │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Response to Frontend       │
                         │   {                          │
                         │     "success": true/false,   │
                         │     "verified": true/false,  │
                         │     "message": "...",        │
                         │     "verifiedAt": "..."      │
                         │   }                          │
                         └──────────────────────────────┘
```

---

## 5. Subscription Purchase Flow (Council-Specific)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       SUBSCRIPTION PURCHASE FLOW (COUNCIL-SPECIFIC)                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │   User Opens Mobile App      │
                         │   (Scout from Council #641)  │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   User Selects Subscription  │
                         │   Plan: $10 Annual           │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   User Enters Payment Info   │
                         │   via Accept Hosted iFrame   │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Backend Processing                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  SubscriptionService.createSubscription(userId, planId)                              │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 1: Get User's Council                                                          │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   User user = userRepository.findById(userId);                                       │   │
│   │   Long councilId = user.getCouncil().getId();  // Council #641                       │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 2: Get Accept Hosted Token with Council Gateway                                │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   // PaymentService now takes councilId                                              │   │
│   │   AcceptHostedTokenResponse tokenResponse =                                          │   │
│   │       paymentService.getAcceptHostedToken(councilId, request);                       │   │
│   │                                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────────────────────┐   │   │
│   │   │  PaymentService.getAcceptHostedToken(councilId, request):                    │   │   │
│   │   │                                                                              │   │   │
│   │   │  1. Get council payment config                                               │   │   │
│   │   │     CouncilPaymentConfig config =                                            │   │   │
│   │   │         configService.getActiveConfig(councilId);                            │   │   │
│   │   │                                                                              │   │   │
│   │   │  2. If config exists and is verified:                                        │   │   │
│   │   │     - Use council's Authorize.net credentials                                │   │   │
│   │   │     - Funds go to Council #641's bank account                                │   │   │
│   │   │                                                                              │   │   │
│   │   │  3. If no config (fallback):                                                 │   │   │
│   │   │     - Use default Authorize.net credentials                                  │   │   │
│   │   │     - Funds go to BSA National bank account                                  │   │   │
│   │   │     - Log warning for monitoring                                             │   │   │
│   │   └─────────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                                     │
│                                        ▼                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 3: Display Payment Form                                                        │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │   Return token to frontend for Accept Hosted iFrame                                  │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              USER COMPLETES PAYMENT                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                      │   │
│   │   ┌───────────────────────────────────────────────────────────────────────────┐     │   │
│   │   │                    AUTHORIZE.NET ACCEPT HOSTED                             │     │   │
│   │   ├───────────────────────────────────────────────────────────────────────────┤     │   │
│   │   │                                                                            │     │   │
│   │   │   Camp Card - Scouting America                                             │     │   │
│   │   │   ─────────────────────────────                                            │     │   │
│   │   │                                                                            │     │   │
│   │   │   Order Total: $10.00                                                      │     │   │
│   │   │   Description: Camp Card Annual Subscription                               │     │   │
│   │   │                                                                            │     │   │
│   │   │   Card Number:  [4111-1111-1111-1111]                                      │     │   │
│   │   │   Expiration:   [01/27]                                                    │     │   │
│   │   │   CVV:          [***]                                                      │     │   │
│   │   │                                                                            │     │   │
│   │   │   Email:        [scout@example.com]                                        │     │   │
│   │   │                                                                            │     │   │
│   │   │                        [  Pay $10.00  ]                                    │     │   │
│   │   │                                                                            │     │   │
│   │   └───────────────────────────────────────────────────────────────────────────┘     │   │
│   │                                                                                      │   │
│   │   Payment processed through Council #641's Authorize.net account                     │   │
│   │   → Funds deposited to Council #641's bank account                                   │   │
│   │                                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Transaction Completed      │
                         │   - transactionId: 12345678  │
                         │   - councilId: 641           │
                         │   - status: SUCCESS          │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   Create Subscription        │
                         │   Activate Camp Card         │
                         │   Send Confirmation Email    │
                         └──────────────────────────────┘
```

---

## 6. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            SYSTEM ARCHITECTURE OVERVIEW                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           CLIENTS                                                  │
├───────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                    │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐                  │
│   │     Mobile App      │    │     Web Portal      │    │   POS Terminal      │                  │
│   │   (React Native)    │    │     (Next.js)       │    │   (Future)          │                  │
│   │                     │    │                     │    │                     │                  │
│   │  - Scouts           │    │  - National Admin   │    │  - Merchant Staff   │                  │
│   │  - Parents          │    │  - Council Admin    │    │                     │                  │
│   │  - Troop Leaders    │    │  - Troop Leaders    │    │                     │                  │
│   └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘                  │
│              │                          │                          │                              │
│              └──────────────────────────┼──────────────────────────┘                              │
│                                         │                                                         │
└─────────────────────────────────────────┼─────────────────────────────────────────────────────────┘
                                          │ HTTPS
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND API (Spring Boot)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                  API LAYER                                           │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                      │   │
│   │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────────────┐   │   │
│   │  │ PaymentController │  │ SubscriptionCtrl  │  │ CouncilPaymentConfigController│   │   │
│   │  │                   │  │                   │  │ (NEW)                         │   │   │
│   │  │ POST /charge      │  │ POST /subscribe   │  │ GET/POST/PUT/DELETE           │   │   │
│   │  │ POST /refund      │  │ GET /plans        │  │ /councils/{id}/payment-config │   │   │
│   │  └─────────┬─────────┘  └─────────┬─────────┘  └────────────┬──────────────────┘   │   │
│   │            │                      │                         │                      │   │
│   └────────────┼──────────────────────┼─────────────────────────┼──────────────────────┘   │
│                │                      │                         │                          │
│   ┌────────────┼──────────────────────┼─────────────────────────┼──────────────────────┐   │
│   │            │                      │                         │                      │   │
│   │            ▼                      ▼                         ▼                      │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────┐    │   │
│   │  │                            SERVICE LAYER                                   │    │   │
│   │  ├───────────────────────────────────────────────────────────────────────────┤    │   │
│   │  │                                                                            │    │   │
│   │  │  ┌─────────────────────────────────────────────────────────────────────┐  │    │   │
│   │  │  │                       PaymentService (MODIFIED)                      │  │    │   │
│   │  │  ├─────────────────────────────────────────────────────────────────────┤  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  + charge(councilId, request)         ◄── Now takes councilId       │  │    │   │
│   │  │  │  + refund(councilId, request)         ◄── Now takes councilId       │  │    │   │
│   │  │  │  + getAcceptHostedToken(councilId, request)                         │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  - getMerchantAuth(councilId)         ◄── NEW: Routes to council    │  │    │   │
│   │  │  │                                           gateway or fallback        │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  Dependencies:                                                       │  │    │   │
│   │  │  │  ├── CouncilPaymentConfigService (NEW)                               │  │    │   │
│   │  │  │  └── CredentialEncryptionService (NEW)                               │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  └─────────────────────────────────────────────────────────────────────┘  │    │   │
│   │  │                                                                            │    │   │
│   │  │  ┌─────────────────────────────────────────────────────────────────────┐  │    │   │
│   │  │  │              CouncilPaymentConfigService (NEW)                       │  │    │   │
│   │  │  ├─────────────────────────────────────────────────────────────────────┤  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  + createConfig(councilId, request)                                  │  │    │   │
│   │  │  │  + updateConfig(councilId, request)                                  │  │    │   │
│   │  │  │  + getConfig(councilId)                                              │  │    │   │
│   │  │  │  + verifyConfig(councilId)                                           │  │    │   │
│   │  │  │  + deactivateConfig(councilId)                                       │  │    │   │
│   │  │  │  + getDecryptedCredentials(councilId)                                │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  └─────────────────────────────────────────────────────────────────────┘  │    │   │
│   │  │                                                                            │    │   │
│   │  │  ┌─────────────────────────────────────────────────────────────────────┐  │    │   │
│   │  │  │              CredentialEncryptionService (NEW)                       │  │    │   │
│   │  │  ├─────────────────────────────────────────────────────────────────────┤  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  + encrypt(plainText): String                                        │  │    │   │
│   │  │  │  + decrypt(cipherText): String                                       │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  │  Algorithm: AES-256-GCM                                              │  │    │   │
│   │  │  │  Key Source: CREDENTIAL_ENCRYPTION_KEY env var                       │  │    │   │
│   │  │  │                                                                      │  │    │   │
│   │  │  └─────────────────────────────────────────────────────────────────────┘  │    │   │
│   │  │                                                                            │    │   │
│   │  └───────────────────────────────────────────────────────────────────────────┘    │   │
│   │                                                                                    │   │
│   └────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│            DATABASE (PostgreSQL)         │   │           AUTHORIZE.NET                  │
├─────────────────────────────────────────┤   ├─────────────────────────────────────────┤
│                                          │   │                                          │
│  ┌────────────────────────────────────┐ │   │   ┌────────────────────────────────────┐│
│  │         councils                   │ │   │   │  Council #641 Gateway Account      ││
│  ├────────────────────────────────────┤ │   │   │  - API Login: ABC123               ││
│  │  id: 641                           │ │   │   │  - Bank: Council's Account          ││
│  │  name: Greater New York            │ │   │   └────────────────────────────────────┘│
│  │  council_number: 641               │ │   │                                          │
│  └────────────────────────────────────┘ │   │   ┌────────────────────────────────────┐│
│                 │                        │   │   │  Council #123 Gateway Account      ││
│                 │ 1:1                    │   │   │  - API Login: XYZ789               ││
│                 ▼                        │   │   │  - Bank: Council's Account          ││
│  ┌────────────────────────────────────┐ │   │   └────────────────────────────────────┘│
│  │   council_payment_configs (NEW)    │ │   │                                          │
│  ├────────────────────────────────────┤ │   │   ┌────────────────────────────────────┐│
│  │  id: 1                             │ │   │   │  Default Gateway (Fallback)        ││
│  │  council_id: 641                   │ │───┼──▶│  - API Login: DEFAULT123            ││
│  │  gateway_type: AUTHORIZE_NET       │ │   │   │  - Bank: BSA National Account       ││
│  │  api_login_id_encrypted: ****      │ │   │   └────────────────────────────────────┘│
│  │  transaction_key_encrypted: ****   │ │   │                                          │
│  │  environment: PRODUCTION           │ │   │                                          │
│  │  is_active: true                   │ │   │                                          │
│  │  is_verified: true                 │ │   │                                          │
│  │  last_verified_at: 2026-01-22      │ │   │                                          │
│  └────────────────────────────────────┘ │   │                                          │
│                                          │   │                                          │
└─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA FLOW SUMMARY                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘


  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │   CONFIGURATION FLOW (National Admin)                                                    │
  │   ────────────────────────────────────                                                   │
  │                                                                                          │
  │   Web Portal ──▶ POST /councils/{id}/payment-config ──▶ Encrypt ──▶ Save to DB          │
  │                  {apiLoginId, transactionKey}            AES-256                         │
  │                                                                                          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘

                                          │
                                          ▼

  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │   PAYMENT FLOW (User Purchase)                                                           │
  │   ────────────────────────────                                                           │
  │                                                                                          │
  │   Mobile App ──▶ POST /subscribe ──▶ Get User's Council ──▶ Lookup Payment Config       │
  │                                                                    │                     │
  │                                      ┌─────────────────────────────┴──────────────────┐ │
  │                                      │                                                 │ │
  │                                      ▼                                                 ▼ │
  │                              ┌───────────────┐                              ┌───────────┐│
  │                              │ Config Found  │                              │ No Config ││
  │                              │ & Verified    │                              │  Found    ││
  │                              └───────┬───────┘                              └─────┬─────┘│
  │                                      │                                            │      │
  │                                      ▼                                            ▼      │
  │                              ┌───────────────┐                              ┌───────────┐│
  │                              │ Decrypt Creds │                              │Use Default││
  │                              │ Process via   │                              │  Gateway  ││
  │                              │ Council's     │                              │(Env Vars) ││
  │                              │ Gateway       │                              └─────┬─────┘│
  │                              └───────┬───────┘                                    │      │
  │                                      │                                            │      │
  │                                      └────────────────────┬───────────────────────┘      │
  │                                                           │                              │
  │                                                           ▼                              │
  │                                               ┌───────────────────────┐                  │
  │                                               │   AUTHORIZE.NET       │                  │
  │                                               │   Process Payment     │                  │
  │                                               └───────────────────────┘                  │
  │                                                                                          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      SECURITY MODEL                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘


   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │                               ACCESS CONTROL MATRIX                                      │
   ├─────────────────────────────────────────────────────────────────────────────────────────┤
   │                                                                                          │
   │   Operation                    │ NATIONAL_ADMIN │ COUNCIL_ADMIN │ TROOP_LEADER │ USER   │
   │   ─────────────────────────────┼────────────────┼───────────────┼──────────────┼────────│
   │   Create payment config        │       ✓        │       ✗       │       ✗      │   ✗    │
   │   Update payment config        │       ✓        │       ✗       │       ✗      │   ✗    │
   │   Delete payment config        │       ✓        │       ✗       │       ✗      │   ✗    │
   │   View payment config (masked) │       ✓        │  Own Council  │       ✗      │   ✗    │
   │   Verify payment config        │       ✓        │  Own Council  │       ✗      │   ✗    │
   │   Make payment (uses config)   │       ✓        │       ✓       │       ✓      │   ✓    │
   │                                                                                          │
   └─────────────────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────────────────────┐
   │                               CREDENTIAL PROTECTION                                      │
   ├─────────────────────────────────────────────────────────────────────────────────────────┤
   │                                                                                          │
   │   At Rest (Database):                                                                    │
   │   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
   │   │  api_login_id_encrypted: aGVsbG8gd29ybGQgdGhpcyBpcyBlbmNyeXB0ZWQ=...            │   │
   │   │  transaction_key_encrypted: c29tZSBvdGhlciBlbmNyeXB0ZWQgZGF0YQ==...             │   │
   │   │                                                                                  │   │
   │   │  • AES-256-GCM encryption                                                        │   │
   │   │  • Unique IV per encryption                                                      │   │
   │   │  • Master key in environment variable (not in code/database)                     │   │
   │   └─────────────────────────────────────────────────────────────────────────────────┘   │
   │                                                                                          │
   │   In API Responses:                                                                      │
   │   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
   │   │  {                                                                               │   │
   │   │    "apiLoginId": "••••••••1234",     // Masked - only last 4 chars              │   │
   │   │    "transactionKey": "••••••••5678", // Masked - only last 4 chars              │   │
   │   │    "environment": "PRODUCTION",                                                  │   │
   │   │    "isVerified": true                                                            │   │
   │   │  }                                                                               │   │
   │   │                                                                                  │   │
   │   │  • NEVER return plain text credentials                                           │   │
   │   │  • NEVER log credentials (even in debug mode)                                    │   │
   │   └─────────────────────────────────────────────────────────────────────────────────┘   │
   │                                                                                          │
   │   In Transit:                                                                            │
   │   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
   │   │  • TLS 1.3 for all API communications                                            │   │
   │   │  • HTTPS enforced for web portal and mobile app                                  │   │
   │   │  • Credentials sent only during create/update (POST/PUT)                         │   │
   │   └─────────────────────────────────────────────────────────────────────────────────┘   │
   │                                                                                          │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```
