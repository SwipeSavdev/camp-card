# Quick Reference - Test User & Offers

## Login Credentials
```
Email: jason.mayoral@me.com
Password: Valipay2@23!$!
```

## Service URLs
| Service | URL |
|---------|-----|
| Backend | http://localhost:8080 |
| Web App | http://localhost:3000 |
| Mobile | Expo (Port 8081) |

## 3 Available Offers

### 1. Pizza Palace 
- **Discount:** 20% off purchase
- **Valid:** Dec 1, 2025 - Dec 31, 2025
- **Redeemable:** YES

### 2. AutoCare 
- **Discount:** $10 off oil change
- **Valid:** Dec 1, 2025 - Jan 15, 2026
- **Redeemable:** YES

### 3. Fun Zone 
- **Discount:** Buy 1 Get 1 50% off
- **Valid:** Dec 1, 2025 - Feb 1, 2026
- **Redeemable:** Limited

## Test Offer API
```bash
curl http://localhost:8080/offers | python3 -m json.tool
```

## Test Login
```bash
curl -X POST http://localhost:8080/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"jason.mayoral@me.com","password":"Valipay2@23!$!"}'
```

## Redemption Process
1. Login to mobile app
2. View offers
3. Tap offer  See details
4. Tap Redeem  Generate QR code
5. Code format: `CC{id}-{####}`
6. Valid for 10 minutes

---
**Ready to test!**
