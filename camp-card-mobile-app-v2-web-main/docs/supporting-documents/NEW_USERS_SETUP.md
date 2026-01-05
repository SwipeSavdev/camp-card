# New Users Setup - Complete

## Three New Users Created (One Per Role)

### User 1: COUNCIL_ADMIN - Sarah Thompson
```
ID: c8c96328-852c-4f0c-863d-003ae18ada85
Email: sarah.thompson@campcard.com
Phone: 407-555-0101
Role: COUNCIL_ADMIN
Status: Active 
Card: None (Troop Leaders don't get cards)
```

### User 2: ADMIN - Michael Chen
```
ID: b0722414-31b7-4510-833c-8abf80d3543b
Email: michael.chen@campcard.com
Phone: 407-555-0102
Role: ADMIN
Status: Active 
Card: None (Scouts don't get cards)
```

### User 3: CUSTOMER - Emily Rodriguez
```
ID: 0211df76-3a5a-4bb3-b18a-5284514b4c04
Email: emily.rodriguez@campcard.com
Phone: 407-555-0103
Role: CUSTOMER
Status: Active 
Card: CARD-785041  ISSUED
```

---

##  Camp Card Issued to Customer Only

**Card Details (Emily Rodriguez):**
```json
{
 "card_member_number": "CARD-785041",
 "card_number": "0000002021454685",
 "card_holder_name": "Emily Rodriguez",
 "card_type": "STANDARD",
 "subscription_type": "MONTHLY",
 "subscription_price": "$9.99/month",
 "status": "PENDING",
 "is_primary": true,
 "current_balance": "$0.00",
 "loyalty_points": 0,
 "issued_at": "2025-12-27T21:16:06.728235Z",
 "expires_at": "2026-12-27T21:16:06.728243Z"
}
```

---

## All Offers Available to Customer

### Offer 1: Pizza Palace - 20% off entire purchase
- **Merchant:** Pizza Palace (DINING)
- **Valid:** Dec 1 - Dec 31, 2025
- **Usage:** UNLIMITED
- **Location:** Downtown, 123 Main St, Orlando, FL
- **Distance:** 2.3 km
- **Status:** Can Redeem

### Offer 2: AutoCare - $10 off oil change
- **Merchant:** AutoCare (AUTO)
- **Valid:** Dec 1, 2025 - Jan 15, 2026
- **Usage:** UNLIMITED
- **Location:** Main Service Center, 55 Service Rd
- **Distance:** 5.1 km
- **Status:** Can Redeem

### Offer 3: Fun Zone - Buy 1 Get 1 50% off
- **Merchant:** Fun Zone (ENTERTAINMENT)
- **Valid:** Dec 1, 2025 - Feb 1, 2026
- **Usage:** LIMITED
- **Location:** Front Gate, 800 Park Ave
- **Distance:** 12.2 km
- **Status:**  Limited (Check availability)

---

## API Endpoints to Test

### Get All Users
```bash
curl http://localhost:8080/users
```

### Get Customer Wallet
```bash
curl http://localhost:8080/users/0211df76-3a5a-4bb3-b18a-5284514b4c04/wallet
```

### Get All Available Offers
```bash
curl http://localhost:8080/offers
```

### Get Nearby Offers (Geolocation)
```bash
curl "http://localhost:8080/merchants/nearby?latitude=28.54&longitude=-81.38&radius_km=15"
```

### Redeem an Offer
```bash
curl -X POST http://localhost:8080/offers/123/activate \
 -H "Content-Type: application/json" \
 -d '{"user_id": "0211df76-3a5a-4bb3-b18a-5284514b4c04"}'
```

---

## Summary

| Role | User | Card | Offers | Status |
|------|------|------|--------|--------|
| COUNCIL_ADMIN | Sarah Thompson | | View only | Active |
| ADMIN | Michael Chen | | View only | Active |
| CUSTOMER | Emily Rodriguez | CARD-785041 | Full access | Active |

---

## Next Steps

1. **Mobile App Integration**
 - Display Emily's card in wallet: CARD-785041
 - Show offers on geolocation screen
 - Allow offer redemption with QR code

2. **Offer Redemption Flow**
 - Customer taps offer  Generates QR code
 - Merchant scans  Payment processed
 - Balance updated  Loyalty points earned

3. **Admin Dashboard**
 - Sarah (COUNCIL_ADMIN) can manage merchants
 - Michael (ADMIN) can manage offers
 - Both have read-only access to offers

---

**Created:** December 27, 2025
**Status:** Complete and tested
