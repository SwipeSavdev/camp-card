# BSA Camp Card

Digital fundraising platform for Boy Scouts of America, replacing traditional paper camp cards with a modern mobile and web experience.

## Architecture

The platform consists of three independent codebases:

| Component | Stack | Port | Directory |
|-----------|-------|------|-----------|
| **Backend API** | Java 21 / Spring Boot 3.2 | 7010 | `backend/` |
| **Web Admin Portal** | Next.js 14.1 / React 18 | 7020 | `camp-card-mobile-app-v2-web-main/repos/camp-card-web/` |
| **Mobile App** | React Native 0.81 / Expo 54 | -- | `camp-card-mobile-app-v2-mobile-main/mobile/` |

Supporting services: PostgreSQL 16, Redis 7, Apache Kafka 3.6, Firebase (push notifications), Authorize.Net (payments).

## Production URLs

| Service | URL |
|---------|-----|
| Marketing Website | https://www.campcardapp.org |
| Backend API | https://api.campcardapp.org |
| Admin Portal | https://admin.campcardapp.org |
| Health Check | https://api.campcardapp.org/api/v1/public/health |

## Quick Start (Local Development)

### Prerequisites

- Java 21 (JDK)
- Node.js 18+
- Docker & Docker Compose

### Backend

```bash
cd backend
docker-compose up -d                              # Start PostgreSQL, Redis, Kafka
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Web Portal

```bash
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm install
npm run dev
```

### Mobile App

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile
npm install
npm start
```

## Repository Structure

```
camp-card/
├── backend/                                    # Java Spring Boot REST API
│   ├── src/main/java/
│   │   ├── org/bsa/campcard/                  # API, domain, config, security
│   │   └── com/bsa/campcard/                  # Entities, repos, services, DTOs
│   └── src/main/resources/db/migration/       # Flyway SQL migrations
├── camp-card-mobile-app-v2-web-main/
│   └── repos/camp-card-web/                   # Next.js Admin Portal
│       ├── app/                               # App Router pages
│       ├── lib/api.ts                         # API client
│       └── components/                        # Shared UI components
├── camp-card-mobile-app-v2-mobile-main/
│   └── mobile/                                # React Native / Expo App
│       ├── src/screens/                       # Role-based screens
│       ├── src/navigation/                    # Role-based navigators
│       └── src/stores/                        # Zustand state management
├── camp-card-mobile-app-v2-infrastructure-main/
│   └── infrastructure/                        # Terraform AWS IaC
├── docker-compose-local.yml                   # Full stack local dev
└── CLAUDE.md                                  # Detailed project documentation
```

## User Roles

| Role | Description |
|------|-------------|
| `NATIONAL_ADMIN` | Full platform access, manages councils and system settings |
| `COUNCIL_ADMIN` | Manages troops, merchants, and offers within their council |
| `TROOP_LEADER` | Manages scouts, tracks fundraising progress |
| `PARENT` | Browses offers, views merchants |
| `SCOUT` | QR code affiliate tracking, referrals, card management |

## Key Features

- **Multi-tenant architecture** with JWT auth and Row-Level Security (RLS)
- **Role-based access control** across all three platforms
- **Authorize.Net payment processing** (Accept Hosted / Accept.js)
- **Council-specific payment configs** with AES-256-GCM encryption
- **Scout referral tracking** with QR codes and viral chain attribution
- **Real-time analytics** dashboards for admin, council, and troop leaders
- **AI Marketing** campaign management with segment targeting
- **EAS managed builds** for iOS App Store and Google Play Store

## Deployment

### EC2 (Backend + Web)

Deployed on a single EC2 instance with Docker containers behind Nginx reverse proxy.

```bash
# SSH access
ssh -i ~/.ssh/campcard-github-actions ec2-user@3.137.164.102

# Backend: build and restart
cd /home/ec2-user/camp-card/backend
sudo git pull origin main
sudo docker build -t campcard-backend:latest .
sudo docker stop campcard-backend && sudo docker rm campcard-backend
sudo docker run -d --name campcard-backend --restart unless-stopped -p 7010:7010 \
  --env-file /home/ec2-user/camp-card/.env.aws \
  -e REDIS_HOST=campcard-redis -e REDIS_PORT=6379 -e REDIS_SSL=false \
  -e KAFKA_BOOTSTRAP_SERVERS=campcard-kafka:9092 \
  --network campcard_campcard-network campcard-backend:latest

# Web: build and restart
cd /home/ec2-user/camp-card/camp-card-mobile-app-v2-web-main/repos/camp-card-web
sudo git pull origin main
sudo docker build --no-cache --build-arg NEXT_PUBLIC_API_URL=https://api.campcardapp.org/api/v1 -t campcard-web:latest .
sudo docker stop campcard-web && sudo docker rm campcard-web
sudo docker run -d --name campcard-web --restart unless-stopped -p 7020:7020 \
  -e NEXTAUTH_URL=https://admin.campcardapp.org \
  -e NEXTAUTH_SECRET='bsa-campcard-nextauth-secret-key-2025-very-long' \
  -e NEXT_PUBLIC_API_URL=https://api.campcardapp.org/api/v1 \
  --network campcard_campcard-network campcard-web:latest
```

### Mobile (EAS)

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile
npx eas build --profile production --platform all --non-interactive
npx eas submit --platform all
```

## API Documentation

- Swagger UI: `http://localhost:7010/swagger-ui.html`
- OpenAPI spec: `http://localhost:7010/v3/api-docs`

## Testing

```bash
# Backend
cd backend && ./mvnw test

# Web Portal
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web && npm test

# Mobile
cd camp-card-mobile-app-v2-mobile-main/mobile && npm test
```

## Infrastructure

| Service | Details |
|---------|---------|
| **Compute** | EC2 (us-east-2), instance i-059295c02fec401db |
| **Database** | Amazon RDS PostgreSQL 16, schema `campcard` |
| **Cache** | Redis 7 (Docker on EC2) |
| **Messaging** | Kafka 3.6 (Docker on EC2) |
| **DNS** | Route 53 (campcardapp.org) |
| **SSL** | Let's Encrypt via Certbot |
| **Email** | AWS SES (us-east-2), domain: campcardapp.org |
| **Payments** | Authorize.Net (Sandbox) |
| **Mobile Builds** | Expo Application Services (EAS) |

## Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed project documentation, deployment procedures, and architecture notes
- [Backend README](backend/README.md) - Backend API details
- [Web Portal README](camp-card-mobile-app-v2-web-main/repos/camp-card-web/README.md) - Web admin portal details
- [Mobile README](camp-card-mobile-app-v2-mobile-main/mobile/README.md) - Mobile app details
