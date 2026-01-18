# Camp Card Event Catalog

**Version:** 1.0
**Last Updated:** January 2026

## Overview

This document catalogs all event-driven communication patterns in the Camp Card platform, including Kafka topics (configured but not yet active), asynchronous notifications, and scheduled jobs.

## Event Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Event Sources                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  REST API       │    │  Scheduled      │    │   WebSocket     │         │
│  │  Controllers    │    │  Jobs           │    │   Messages      │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │Subscription  │  │  Campaign    │  │  Referral    │              │   │
│  │  │  Service     │  │   Service    │  │   Service    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Event Channels                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │  @Async      │  │   Kafka      │  │  WebSocket   │              │   │
│  │  │  Methods     │  │  (Future)    │  │   Topics     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Delivery Channels                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Firebase FCM │  │   AWS SES    │  │   AWS SNS    │              │   │
│  │  │  (Push)      │  │   (Email)    │  │   (SMS)      │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Kafka Topics (Configured - Future Implementation)

The following Kafka topics are configured in `application.yml` but not yet implemented with producers/consumers.

### Topic Configuration

```yaml
spring.kafka:
  bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:7004}

  producer:
    key-serializer: org.apache.kafka.common.serialization.StringSerializer
    value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    acks: all
    retries: 3
    properties:
      enable.idempotence: true

  consumer:
    group-id: campcard-api-consumer
    auto-offset-reset: earliest
    enable-auto-commit: false
```

### Planned Topics

| Topic Name | Purpose | Key | Payload |
|------------|---------|-----|---------|
| `subscription-events` | Subscription lifecycle events | userId | SubscriptionEvent |
| `payment-events` | Payment transactions | transactionId | PaymentEvent |
| `referral-events` | Referral tracking | referralCode | ReferralEvent |
| `redemption-events` | Offer redemptions | redemptionId | RedemptionEvent |
| `notification-events` | Notification dispatch | userId | NotificationEvent |
| `audit-events` | System audit log | resourceId | AuditEvent |

### Planned Event Schemas

**SubscriptionEvent:**
```json
{
  "eventType": "CREATED|ACTIVATED|RENEWED|CANCELED|EXPIRED",
  "timestamp": "2026-01-17T12:00:00Z",
  "userId": "uuid",
  "subscriptionId": "uuid",
  "planId": 1,
  "planName": "Annual Camp Card",
  "status": "ACTIVE",
  "amount": 2500,
  "periodStart": "2026-01-17T00:00:00Z",
  "periodEnd": "2027-01-17T00:00:00Z"
}
```

**PaymentEvent:**
```json
{
  "eventType": "CHARGED|REFUNDED|FAILED",
  "timestamp": "2026-01-17T12:00:00Z",
  "transactionId": "string",
  "userId": "uuid",
  "amount": 2500,
  "currency": "USD",
  "status": "APPROVED|DECLINED|ERROR",
  "cardLast4": "1111",
  "description": "Annual subscription"
}
```

**ReferralEvent:**
```json
{
  "eventType": "CREATED|COMPLETED|REWARDED|EXPIRED",
  "timestamp": "2026-01-17T12:00:00Z",
  "referralId": 1,
  "referralCode": "ABC123",
  "referrerId": "uuid",
  "referredUserId": "uuid",
  "rewardAmount": 500,
  "status": "COMPLETED"
}
```

**RedemptionEvent:**
```json
{
  "eventType": "INITIATED|VERIFIED|COMPLETED|CANCELED",
  "timestamp": "2026-01-17T12:00:00Z",
  "redemptionId": "uuid",
  "offerId": 1,
  "userId": "uuid",
  "merchantId": 1,
  "discountAmount": 1000,
  "verificationCode": "XYZ789"
}
```

**NotificationEvent:**
```json
{
  "eventType": "QUEUED|SENT|DELIVERED|FAILED",
  "timestamp": "2026-01-17T12:00:00Z",
  "notificationId": 1,
  "userId": "uuid",
  "channel": "EMAIL|SMS|PUSH|IN_APP",
  "type": "PAYMENT_SUCCESS|NEW_OFFER|...",
  "title": "string",
  "body": "string"
}
```

**AuditEvent:**
```json
{
  "eventType": "CREATE|UPDATE|DELETE|LOGIN|LOGOUT",
  "timestamp": "2026-01-17T12:00:00Z",
  "userId": "uuid",
  "action": "string",
  "resource": "USER|COUNCIL|SUBSCRIPTION|...",
  "resourceId": "string",
  "changes": {},
  "ipAddress": "string",
  "userAgent": "string"
}
```

---

## 2. Push Notification Events (Active)

**Service:** `PushNotificationService`
**Transport:** Firebase Cloud Messaging (FCM)

### Notification Channels

| Channel ID | Description | Priority |
|------------|-------------|----------|
| `CHANNEL_ACCOUNT` | Account & profile updates | Normal |
| `CHANNEL_SECURITY` | Security alerts | High |
| `CHANNEL_PAYMENT` | Payment notifications | High |
| `CHANNEL_REFERRAL` | Referral updates | Normal |
| `CHANNEL_OFFER` | Offer notifications | Normal |
| `CHANNEL_MILESTONE` | Achievement alerts | Normal |
| `CHANNEL_TROOP` | Troop updates | Normal |
| `CHANNEL_GENERAL` | General announcements | Low |

### Notification Types

#### Account Events
```java
sendEmailVerifiedNotification(userId)
  → {type: "email_verified", screen: "home"}

sendProfileUpdatedNotification(userId)
  → {type: "profile_updated", screen: "profile"}
```

#### Security Events
```java
sendPasswordChangedNotification(userId)
  → {type: "password_changed", screen: "security_settings"}

sendNewDeviceLoginNotification(userId, deviceInfo, location)
  → {type: "new_device_login", deviceName, loginLocation, loginTime, screen: "security_settings"}

sendAccountLockedNotification(userId, reason)
  → {type: "account_locked", reason, screen: "support"}
```

#### Payment Events
```java
sendPaymentSuccessNotification(userId, amount, description)
  → {type: "payment_success", amount, description, screen: "payment_history"}

sendPaymentFailedNotification(userId, amount, reason)
  → {type: "payment_failed", amount, reason, screen: "payment_methods"}

sendSubscriptionActiveNotification(userId, planName, expirationDate)
  → {type: "subscription_active", planName, expirationDate, screen: "subscription"}

sendSubscriptionExpiringNotification(userId, daysRemaining)
  → {type: "subscription_expiring", daysRemaining, screen: "subscription"}

sendSubscriptionRenewedNotification(userId, newExpirationDate)
  → {type: "subscription_renewed", newExpirationDate, screen: "subscription"}
```

#### Referral Events
```java
sendReferralSignupNotification(referrerId, referredName)
  → {type: "referral_signup", referredName, screen: "referrals"}

sendReferralRewardNotification(userId, rewardAmount, referredName)
  → {type: "referral_reward", rewardAmount, referredName, screen: "referrals"}

sendReferralEngagementNotification(userId, engagementType)
  → {type: "referral_engagement", engagementType, screen: "referrals"}
```

#### Offer Events
```java
sendNewOfferNotification(userId, offerTitle, merchantName, discountValue)
  → {type: "new_offer", offerTitle, merchantName, discountValue, screen: "offers"}

sendOfferExpiringNotification(userId, offerTitle, daysRemaining)
  → {type: "offer_expiring", offerTitle, daysRemaining, screen: "offers"}

sendOfferRedeemedNotification(userId, offerTitle, savedAmount)
  → {type: "offer_redeemed", offerTitle, savedAmount, screen: "redemption_history"}
```

#### Milestone Events
```java
sendSalesMilestoneNotification(userId, milestone, salesAmount)
  → {type: "sales_milestone", milestone, salesAmount, screen: "achievements"}

sendTroopMilestoneNotification(userId, troopName, milestone, progress)
  → {type: "troop_milestone", troopName, milestone, progress, screen: "troop_dashboard"}
```

#### Troop Events
```java
sendScoutJoinedTroopNotification(userId, scoutName, troopName)
  → {type: "scout_joined", scoutName, troopName, screen: "troop_roster"}

sendLeaderboardUpdateNotification(userId, newRank, troopName)
  → {type: "leaderboard_update", newRank, troopName, screen: "leaderboard"}
```

#### General Events
```java
sendWelcomeNotification(userId, firstName)
  → {type: "welcome", firstName, screen: "home"}

sendAnnouncementNotification(userId, title, message)
  → {type: "announcement", announcementTitle, screen: "announcements"}

sendOnboardingReminderNotification(userId, incompleteSteps)
  → {type: "onboarding_reminder", incompleteSteps, screen: "onboarding"}
```

---

## 3. Email Events (Active)

**Service:** `EmailService`
**Transport:** AWS SES

### Email Types

| Email Type | Trigger | Template |
|------------|---------|----------|
| Verification | User registration | email-verification |
| Password Reset | Forgot password | password-reset |
| Password Changed | Password update | password-changed |
| Profile Update | Profile edit | profile-updated |
| Email Update | Email change | email-updated |
| Subscription Confirmation | Purchase | subscription-confirmation |
| Subscription Expiring | 7 days before | subscription-expiring |
| Subscription Renewed | Auto-renewal | subscription-renewed |
| Referral Reward | Referral completion | referral-reward |
| Offer Redemption | Redemption | redemption-confirmation |
| Campaign Email | Marketing | campaign-{type} |

### Email Payload Structure

```java
EmailService.sendEmail(
  String to,
  String subject,
  String templateName,
  Map<String, Object> variables
)
```

**Common Variables:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "baseUrl": "https://bsa.swipesavvy.com",
  "logoUrl": "string",
  "year": 2026
}
```

---

## 4. Campaign Dispatch Events (Active)

**Service:** `CampaignDispatchService`

### Delivery Channels

| Channel | Transport | Status Tracking |
|---------|-----------|-----------------|
| EMAIL | AWS SES | Opens, clicks, bounces |
| SMS | AWS SNS | Delivery, failures |
| PUSH | Firebase FCM | Delivery, opens |
| IN_APP | Database | Views, clicks |

### Delivery Status Flow

```
PENDING → SCHEDULED → SENDING → SENT → DELIVERED → OPENED → CLICKED → CONVERTED
                         ↓
                       FAILED → (retry up to 3 times)
                         ↓
                       SKIPPED
```

### Campaign Recipient Schema

```json
{
  "campaignId": 1,
  "userId": "uuid",
  "channel": "EMAIL|SMS|PUSH|IN_APP",
  "status": "PENDING|...|CONVERTED",
  "contactInfo": "email@example.com",
  "scheduledAt": "2026-01-17T12:00:00Z",
  "sentAt": "2026-01-17T12:01:00Z",
  "deliveredAt": "2026-01-17T12:01:05Z",
  "openedAt": "2026-01-17T14:30:00Z",
  "clickedAt": "2026-01-17T14:31:00Z",
  "convertedAt": "2026-01-17T15:00:00Z",
  "openCount": 2,
  "clickCount": 1,
  "retryCount": 0,
  "metadata": {},
  "triggeredByGeofence": false
}
```

### Geofence-Triggered Campaigns

```json
{
  "triggeredByGeofence": true,
  "geofenceId": "merchant-123",
  "triggerLatitude": 40.7128,
  "triggerLongitude": -74.0060
}
```

---

## 5. Scheduled Jobs

**Framework:** Spring `@Scheduled`

| Job | Schedule | Description |
|-----|----------|-------------|
| `processScheduledCampaigns` | Every 60s | Process campaigns ready to send |
| `retryFailedDeliveries` | Every 30m | Retry failed campaign deliveries |
| `broadcastDashboardStats` | Every 30s | WebSocket dashboard updates |
| `cleanupExpiredTokens` | Daily | Clean expired JWT refresh tokens |
| `updateSubscriptionStatus` | Daily | Mark expired subscriptions |

---

## 6. WebSocket Events (Active)

**Protocol:** STOMP over WebSocket
**Base Path:** `/ws`

### Topics

| Topic | Description | Payload |
|-------|-------------|---------|
| `/topic/dashboard` | Dashboard metrics | DashboardResponse |
| `/topic/troop-sales` | Troop sales updates | TroopSalesData |
| `/topic/scout-sales` | Scout sales updates | ScoutSalesData |
| `/topic/referrals` | Referral updates | ReferralData |
| `/topic/notifications` | Real-time notifications | NotificationData |

### Message Mappings

| Destination | Response Topic | Description |
|-------------|----------------|-------------|
| `/app/dashboard/refresh` | `/topic/dashboard` | Manual refresh |
| `/app/subscribe/troop-sales` | `/topic/troop-sales` | Subscribe to troop |
| `/app/subscribe/scout-sales` | `/topic/scout-sales` | Subscribe to scout |
| `/app/subscribe/referrals` | `/topic/referrals` | Subscribe to referrals |

---

## 7. Event Processing Best Practices

### Idempotency

All event handlers should be idempotent. Use idempotency keys:

```java
@Header("X-Idempotency-Key") String idempotencyKey
```

### Correlation IDs

Include correlation IDs for distributed tracing:

```java
@Header("X-Correlation-Id") String correlationId
@Header("X-Test-Run-Id") String testRunId
```

### Retry Policy

| Event Type | Max Retries | Backoff |
|------------|-------------|---------|
| Email | 3 | Exponential (1s, 2s, 4s) |
| SMS | 3 | Exponential (1s, 2s, 4s) |
| Push | 3 | Exponential (1s, 2s, 4s) |
| Kafka | 3 | Exponential (1s, 2s, 4s) |

### Dead Letter Queue (Future)

Failed events after max retries should go to DLQ:
- `subscription-events-dlq`
- `payment-events-dlq`
- `notification-events-dlq`

---

## 8. Monitoring & Metrics

### Key Metrics to Track

| Metric | Description |
|--------|-------------|
| `events.published` | Events published by topic |
| `events.consumed` | Events consumed by topic |
| `events.failed` | Failed events by topic |
| `events.latency` | Processing latency |
| `notifications.sent` | Notifications sent by channel |
| `notifications.delivered` | Notifications delivered |
| `notifications.opened` | Notification open rate |
| `campaigns.sent` | Campaign emails sent |
| `campaigns.opened` | Campaign open rate |
| `campaigns.clicked` | Campaign click rate |
| `campaigns.converted` | Campaign conversion rate |

---

## Related Documentation

- [System Map](./system-map.md)
- [API Inventory](./api-inventory.md)
- [Entity Relationships](./entity-relationships.md)
