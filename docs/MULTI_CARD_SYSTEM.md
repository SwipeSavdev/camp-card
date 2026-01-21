# Multi-Card Purchase & Gifting System

## Overview

This document describes the multi-card purchase and gifting system for Camp Card. The system allows customers to purchase multiple cards in a single transaction, gift cards to friends and family, and replenish their offers by activating unused cards.

## Key Design Principles

1. **December 31st Expiry**: All cards expire on December 31st of the purchase year, matching the annual fundraising cycle
2. **Cards as Inventory**: Cards are separate entities from subscriptions, enabling true multi-card ownership
3. **Scout Attribution Preserved**: Gift recipients' cards still credit the original Scout for commission
4. **Backward Compatible**: Existing subscriptions are migrated to the new card system

---

## User Flows

### 1. New User Purchase Flow

```
Login Screen → Plan Selection → Quantity Selection → Payment → Signup → Card Wallet
```

1. User selects subscription plan ($10 Scout referral or $15 direct)
2. User selects quantity (1-10 cards)
3. User enters payment information via Authorize.net
4. User creates account
5. First card is auto-activated, remaining cards are UNASSIGNED in wallet

### 2. Existing User - Buy More Cards

```
Profile → Card Wallet → Buy More → Quantity Selection → Payment → Success
```

1. User navigates to Card Wallet from profile menu
2. User taps "Buy More Cards"
3. User selects quantity and completes payment
4. New cards added to wallet as UNASSIGNED

### 3. Gift Card Flow

```
Card Wallet → Select Card → Gift → Enter Email + Message → Send → Email Sent
```

**Sender Side:**
1. User selects an UNASSIGNED card from wallet
2. Taps "Gift This Card"
3. Enters recipient email and optional message
4. Card status changes to GIFTED (pending claim)

**Recipient Side:**
1. Receives email with gift notification and claim link
2. Clicks link → opens claim page
3. Creates account (or logs in if existing user)
4. Card transferred to their ownership, status becomes ACTIVE

### 4. Replenish Offers Flow

```
Card Wallet → Select Unused Card → Replenish → Confirm → Offers Reset
```

1. User's active card has used many offers (e.g., 42/47)
2. User selects an UNASSIGNED card from wallet
3. Taps "Replenish Offers"
4. Confirms action in modal
5. Old card marked REPLACED, new card becomes ACTIVE
6. All 47 offers now available again

---

## Card Statuses

| Status | Description |
|--------|-------------|
| `UNASSIGNED` | Purchased but not activated; in user's wallet |
| `ACTIVE` | Currently in use for offer redemptions |
| `GIFTED` | Sent as gift, pending recipient claim |
| `REPLACED` | Deactivated when user replenished with new card |
| `EXPIRED` | Past December 31st expiry date |
| `REVOKED` | Administratively disabled |

---

## API Endpoints

### Card Management

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/cards/purchase` | POST | Optional | Purchase 1-10 cards |
| `/api/v1/cards/my-cards` | GET | Required | Get user's card inventory |
| `/api/v1/cards/{id}` | GET | Required | Get single card details |
| `/api/v1/cards/{id}/activate` | POST | Required | Activate card (replenish offers) |
| `/api/v1/cards/{id}/gift` | POST | Required | Send card as gift |
| `/api/v1/cards/{id}/cancel-gift` | POST | Required | Cancel pending gift |
| `/api/v1/cards/{id}/resend-gift` | POST | Required | Resend gift email |
| `/api/v1/cards/claim/{token}` | GET | None | Get gift details for claim page |
| `/api/v1/cards/claim/{token}` | POST | Optional | Claim gifted card |

### Request/Response Examples

**Purchase Cards Request:**
```json
{
  "quantity": 3,
  "scoutCode": "ABC123",
  "paymentToken": "authorize_net_token",
  "email": "buyer@example.com",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Purchase Cards Response:**
```json
{
  "orderId": "uuid",
  "cards": [
    {
      "id": 1,
      "uuid": "uuid",
      "cardNumber": "CC-1234-5678-9012",
      "status": "ACTIVE",
      "expiresAt": "2026-12-31T23:59:59Z"
    },
    {
      "id": 2,
      "uuid": "uuid",
      "cardNumber": "CC-2345-6789-0123",
      "status": "UNASSIGNED",
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  ],
  "totalPaid": 3000
}
```

**Gift Card Request:**
```json
{
  "recipientEmail": "friend@example.com",
  "message": "Enjoy savings at local merchants!"
}
```

**My Cards Response:**
```json
{
  "activeCard": {
    "id": 1,
    "cardNumber": "CC-1234-5678-9012",
    "status": "ACTIVE",
    "activatedAt": "2026-01-15T10:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "offersUsed": 42,
    "totalOffers": 47,
    "totalSavings": 127.50
  },
  "unusedCards": [
    {
      "id": 2,
      "cardNumber": "CC-2345-6789-0123",
      "status": "UNASSIGNED",
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  ],
  "giftedCards": [
    {
      "id": 3,
      "cardNumber": "CC-3456-7890-1234",
      "status": "GIFTED",
      "giftedToEmail": "friend@example.com",
      "giftedAt": "2026-01-20T14:30:00Z",
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  ]
}
```

---

## Database Schema

### camp_cards Table

```sql
CREATE TABLE campcard.camp_cards (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    card_number VARCHAR(20) UNIQUE NOT NULL,

    -- Ownership
    owner_user_id UUID REFERENCES campcard.users(id),
    original_purchaser_id UUID NOT NULL REFERENCES campcard.users(id),
    purchase_transaction_id VARCHAR(100),
    purchase_order_id BIGINT REFERENCES campcard.card_orders(id),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'UNASSIGNED',

    -- Dates
    activated_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- Always Dec 31st

    -- Gift info
    gifted_at TIMESTAMP,
    gifted_to_email VARCHAR(255),
    gift_message TEXT,
    gift_claim_token VARCHAR(100) UNIQUE,
    gift_claimed_at TIMESTAMP,

    -- Scout attribution (preserved for gifts)
    scout_attribution_id UUID REFERENCES campcard.users(id),
    referral_depth INT DEFAULT 0,

    -- Replenishment tracking
    replaced_by_card_id BIGINT REFERENCES campcard.camp_cards(id),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### card_orders Table

```sql
CREATE TABLE campcard.card_orders (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    user_id UUID REFERENCES campcard.users(id),
    quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 10),
    unit_price_cents INT NOT NULL,
    total_price_cents INT NOT NULL,
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    scout_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### offer_redemptions Modification

```sql
ALTER TABLE campcard.offer_redemptions
ADD COLUMN camp_card_id BIGINT REFERENCES campcard.camp_cards(id);
```

---

## Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `CardExpiryNotificationJob` | Daily @ 9:00 AM | Send 30/15/7/3-day expiry alerts |
| `UnusedCardReminderJob` | Weekly (Mondays) @ 10:00 AM | Remind users with unused cards |
| `GiftClaimReminderJob` | Daily @ 11:00 AM | Remind about unclaimed gifts (3, 7, 14 days) |
| `ExpireCardsJob` | Jan 1 @ 00:01 AM | Mark all cards as EXPIRED |
| `CleanupExpiredGiftsJob` | Jan 1 @ 00:05 AM | Return unclaimed gifts to EXPIRED |

---

## Notification Types

### Push Notifications

| Type | Trigger | Message Example |
|------|---------|-----------------|
| `EXPIRY_30_DAYS` | Dec 1st | "Your Camp Card expires in 30 days. You have 2 unused cards." |
| `EXPIRY_15_DAYS` | Dec 15th | "Only 15 days left! 8 offers remaining. Use them now!" |
| `EXPIRY_7_DAYS` | Dec 24th | "7 days until your card expires. Gift or use your unused cards!" |
| `EXPIRY_3_DAYS` | Dec 28th | "3 DAYS LEFT! Your offers expire Dec 31st at midnight." |
| `UNUSED_CARDS` | Weekly | "You have 2 unused Camp Cards. Gift them or use for more offers!" |
| `GIFT_PENDING` | 3/7/14 days | "Your gift to friend@email.com hasn't been claimed yet." |

### Email Templates

1. **Gift Card Notification** - Sent to recipient when card is gifted
2. **Gift Claimed Confirmation** - Sent to sender when gift is claimed
3. **Expiry Reminder** - Sent at 30 and 15 days before expiry
4. **Gift Claim Reminder** - Sent to sender about unclaimed gifts

---

## Mobile App Screens

### New Screens

1. **QuantitySelectionScreen** - Select number of cards to purchase (1-10)
2. **CardWalletScreen** - View all cards (active, unused, gifted)
3. **GiftCardScreen** - Enter recipient email and message
4. **ReplenishModal** - Confirm offer replenishment
5. **ClaimGiftScreen** - Claim a gifted card (deep link target)
6. **BuyMoreCardsScreen** - Purchase additional cards for existing users

### Modified Screens

1. **SubscriptionSelectionScreen** - Add navigation to quantity selection
2. **PaymentScreen** - Support variable quantities
3. **SignupScreen** - Handle multi-card purchase completion
4. **ProfileScreen** - Add "My Cards" menu item

---

## Implementation Phases

| Phase | Scope | Estimated Effort |
|-------|-------|------------------|
| 1 | Database migration | 1 day |
| 2 | Backend: Entity & Repository | 1 day |
| 3 | Backend: Service & Controller | 2 days |
| 4 | Backend: Notification jobs | 1 day |
| 5 | Backend: Email templates | 1 day |
| 6 | Mobile: Quantity selection | 1 day |
| 7 | Mobile: Card wallet | 2 days |
| 8 | Mobile: Gift/Replenish flows | 2 days |
| 9 | Mobile: Expiry alerts | 1 day |
| 10 | Testing & deployment | 2 days |

**Total Estimated Effort: 14 days**

---

## Migration Strategy

### Existing Subscription Migration

All existing active subscriptions will be migrated to the new `camp_cards` table:

```sql
INSERT INTO campcard.camp_cards (
    card_number, owner_user_id, original_purchaser_id,
    status, activated_at, expires_at, scout_attribution_id, referral_depth
)
SELECT
    s.card_number,
    s.user_id,
    s.user_id,
    'ACTIVE',
    s.current_period_start,
    s.current_period_end,
    s.root_scout_id,
    s.referral_depth
FROM campcard.subscriptions s
WHERE s.status = 'ACTIVE' AND s.card_number IS NOT NULL;
```

### Backward Compatibility

- The `subscriptions` table remains for tracking subscription metadata
- Existing APIs continue to work during transition
- Mobile app gracefully handles both old and new card formats

---

## Security Considerations

1. **Gift Claim Tokens**: Cryptographically secure, one-time use tokens
2. **Card Ownership Validation**: All card operations validate ownership
3. **Rate Limiting**: Gift sending limited to prevent abuse
4. **Email Verification**: Gift recipients must verify email to claim

---

## Future Enhancements

1. **Card Transfer**: Direct transfer between users without email
2. **Family Plans**: Discounted bulk purchases for families
3. **Corporate Gifting**: Bulk gift codes for businesses
4. **Card Trading**: Marketplace for unused cards
