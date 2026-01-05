# User Credentials Issued - December 27, 2025

##  User 1: COUNCIL_ADMIN

```
Name: Sarah Thompson
Email: sarah.thompson@campcard.com
Password: (Set via auth system - use /auth/register or /auth/login)
Phone: 407-555-0101
Role: COUNCIL_ADMIN
User ID: c8c96328-852c-4f0c-863d-003ae18ada85
Status: Active 
Card: None (Troop Leaders don't get cards)

Login Endpoint:
POST http://localhost:8080/auth/login
{
 "email": "sarah.thompson@campcard.com",
 "password": "[your-password]"
}
```

---

##  User 2: ADMIN

```
Name: Michael Chen
Email: michael.chen@campcard.com
Password: (Set via auth system - use /auth/register or /auth/login)
Phone: 407-555-0102
Role: ADMIN
User ID: b0722414-31b7-4510-833c-8abf80d3543b
Status: Active 
Card: None (Scouts don't get cards)

Login Endpoint:
POST http://localhost:8080/auth/login
{
 "email": "michael.chen@campcard.com",
 "password": "[your-password]"
}
```

---

##  User 3: CUSTOMER

```
Name: Emily Rodriguez
Email: emily.rodriguez@campcard.com
Password: (Set via auth system - use /auth/register or /auth/login)
Phone: 407-555-0103
Role: CUSTOMER
User ID: 0211df76-3a5a-4bb3-b18a-5284514b4c04
Status: Active 
Card: CARD-785041 
Card #: 0000002021454685
Tier: STANDARD (Monthly $9.99)
Balance: $0.00
Loyalty: 0 points

Login Endpoint:
POST http://localhost:8080/auth/login
{
 "email": "emily.rodriguez@campcard.com",
 "password": "[your-password]"
}
```

---

## Quick Reference Table

| Name | Email | Role | Card | User ID |
|------|-------|------|------|---------|
| Sarah Thompson | sarah.thompson@campcard.com | COUNCIL_ADMIN | | c8c96328-852c-4f0c-863d-003ae18ada85 |
| Michael Chen | michael.chen@campcard.com | ADMIN | | b0722414-31b7-4510-833c-8abf80d3543b |
| Emily Rodriguez | emily.rodriguez@campcard.com | CUSTOMER | CARD-785041 | 0211df76-3a5a-4bb3-b18a-5284514b4c04 |

---

## Password Setup

To set passwords for these users, use the auth system:

```bash
# Register or set password
curl -X POST http://localhost:8080/auth/register \
 -H "Content-Type: application/json" \
 -d '{
 "email": "emily.rodriguez@campcard.com",
 "password": "YourSecurePassword123!",
 "first_name": "Emily",
 "last_name": "Rodriguez"
 }'

# Or login with existing credentials
curl -X POST http://localhost:8080/auth/login \
 -H "Content-Type: application/json" \
 -d '{
 "email": "emily.rodriguez@campcard.com",
 "password": "YourPassword"
 }'
```

---

## API Access

All three users can access:
- `GET /offers` - View all available offers
- `GET /merchants` - View all merchants
- `GET /merchants/nearby` - Find offers by geolocation

**Only CUSTOMER (Emily) can access:**
- `GET /users/{id}/wallet` - View camp card
- `POST /offers/{id}/activate` - Redeem offers
- `GET /users/{id}/settings` - Manage preferences

**Only ADMIN/COUNCIL_ADMIN can access:**
- `POST /merchants` - Create merchants
- `POST /offers` - Create offers
- User management endpoints

---

**Generated:** December 27, 2025
**Status:** Ready for testing
