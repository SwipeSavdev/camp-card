# KB Snapshot – CAMP_CARD

Generated: 2026-01-16

## Project Overview

Camp Card is a BSA (Boy Scouts of America) fundraising digitalization platform that enables:
- Annual subscription cards for families
- Merchant discount offers
- Scout affiliate tracking
- AI-powered marketing campaigns
- Multi-tenant council management

## Key Files

### Backend (Java/Spring Boot)

#### Configuration
- `backend/pom.xml` - Maven dependencies
- `backend/src/main/resources/application.yml` - Main config
- `backend/src/main/resources/application-aws.yml` - Production config
- `backend/Dockerfile` - Container definition

#### Entities
- `backend/src/main/java/org/bsa/campcard/domain/user/User.java` - User entity
- `backend/src/main/java/com/bsa/campcard/entity/Subscription.java` - Subscription entity
- `backend/src/main/java/com/bsa/campcard/entity/Merchant.java` - Merchant entity
- `backend/src/main/java/com/bsa/campcard/entity/Offer.java` - Offer entity
- `backend/src/main/java/com/bsa/campcard/entity/MarketingCampaign.java` - Campaign entity

#### Services
- `backend/src/main/java/com/bsa/campcard/service/SubscriptionPurchaseService.java` - Subscription flow
- `backend/src/main/java/com/bsa/campcard/service/PaymentService.java` - Authorize.Net integration
- `backend/src/main/java/com/bsa/campcard/service/CampaignService.java` - Campaign management
- `backend/src/main/java/com/bsa/campcard/service/AiContentService.java` - Together.AI integration

#### Controllers
- `backend/src/main/java/org/bsa/campcard/api/AuthController.java` - Authentication
- `backend/src/main/java/org/bsa/campcard/api/UserController.java` - User CRUD
- `backend/src/main/java/org/bsa/campcard/api/CouncilController.java` - Council management
- `backend/src/main/java/org/bsa/campcard/api/MerchantController.java` - Merchant CRUD
- `backend/src/main/java/org/bsa/campcard/api/CampaignController.java` - Campaign API

#### Database Migrations
- `backend/src/main/resources/db/migration/V1__initial_schema.sql`
- `backend/src/main/resources/db/migration/V*__*.sql` - Subsequent migrations

### Web Portal (Next.js)

#### Configuration
- `camp-card-web/package.json` - NPM dependencies
- `camp-card-web/next.config.js` - Next.js config
- `camp-card-web/Dockerfile` - Container definition

#### Pages
- `camp-card-web/app/page.tsx` - Home page
- `camp-card-web/app/login/page.tsx` - Login
- `camp-card-web/app/dashboard/page.tsx` - Dashboard
- `camp-card-web/app/users/page.tsx` - User management
- `camp-card-web/app/councils/page.tsx` - Council management
- `camp-card-web/app/merchants/page.tsx` - Merchant management
- `camp-card-web/app/offers/page.tsx` - Offer management
- `camp-card-web/app/ai-marketing/page.tsx` - AI campaigns
- `camp-card-web/app/camp-cards/page.tsx` - Card management
- `camp-card-web/app/subscriptions/page.tsx` - Subscription management

#### API Client
- `camp-card-web/lib/api.ts` - API client functions

### Mobile App (React Native)

#### Configuration
- `mobile/package.json` - NPM dependencies
- `mobile/app.json` - Expo config
- `mobile/Dockerfile` - Container definition

#### Navigation
- `mobile/src/navigation/RootNavigator.tsx` - Root navigation
- `mobile/src/navigation/types.ts` - Navigation types

#### Screens (by role)
- `mobile/src/screens/scout/` - Scout screens
- `mobile/src/screens/troopLeader/` - Troop leader screens
- `mobile/src/screens/customer/` - Parent/customer screens

### Infrastructure
- `docker-compose-local.yml` - Full stack local dev
- `backend/docker-compose.yml` - Backend services only

## API Endpoints Summary

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Auth | /auth/login, /auth/register, /auth/refresh | No/Yes |
| Users | /users CRUD | Yes (Admin) |
| Councils | /councils CRUD | Yes (Admin) |
| Merchants | /merchants CRUD | Yes (Admin) |
| Offers | /offers CRUD | Yes |
| Subscriptions | /subscriptions/* | Mixed |
| Campaigns | /campaigns/* | Yes (Admin) |
| Camp Cards | /camp-cards/* | Yes |

## Database Schema (Key Tables)

| Table | Description |
|-------|-------------|
| users | User accounts with roles |
| councils | BSA councils |
| troops | Scout troops |
| merchants | Partner merchants |
| offers | Discount offers |
| subscriptions | Annual card subscriptions |
| marketing_campaigns | AI marketing campaigns |
| redemptions | Offer redemption history |

## External Integrations

| Service | Purpose | Environment Variable |
|---------|---------|---------------------|
| Authorize.Net | Payment processing | AUTH_NET_* |
| Together.AI | AI content generation | TOGETHER_AI_API_KEY |
| Firebase | Push notifications | FIREBASE_* |
| AWS RDS | PostgreSQL database | DB_* |
| AWS EC2 | Hosting | - |
