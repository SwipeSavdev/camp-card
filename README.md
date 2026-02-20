# BSA Camp Card

Digital fundraising platform for Boy Scouts of America, replacing traditional paper camp cards with a modern mobile and web experience.

## Architecture

The platform consists of five independent codebases:

| Component | Stack | Port | Directory |
|-----------|-------|------|-----------|
| **Backend API** | Java 21 / Spring Boot 3.2 | 7010 | `backend/` |
| **Web Admin Portal** | Next.js 14.1 / React 18 | 7020 | `camp-card-mobile-app-v2-web-main/repos/camp-card-web/` |
| **Mobile App (Expo)** | React Native 0.81 / Expo 54 | -- | `camp-card-mobile-app-v2-mobile-main/mobile/` |
| **iOS App (Native)** | SwiftUI / Xcode 16 | -- | `camp-card-ios/` |
| **Android App (Native)** | Kotlin / Jetpack Compose | -- | `camp-card-android/` |

Supporting services: PostgreSQL 16, Redis 7, Apache Kafka 3.6, Firebase (push notifications), Authorize.Net (payments).

## Production URLs

| Service | URL |
|---------|-----|
| Marketing Website | https://www.campcardapp.org |
| Backend API | https://api.campcardapp.org |
| Admin Portal | https://admin.campcardapp.org |
| Health Check | https://api.campcardapp.org/api/v1/public/health |

## Mobile App Store Status

| Platform | Version | Build | Track | Status |
|----------|---------|-------|-------|--------|
| **iOS (SwiftUI)** | 2.0.0 | 71 | TestFlight | Uploaded |
| **Android (Compose)** | 2.0.0 | 66 | Internal Testing | Live |
| iOS (Expo legacy) | 1.0.30 | 65 | -- | Rejected (Feb 2026) |

## Quick Start (Local Development)

### Prerequisites

- Java 21 (JDK)
- Node.js 18+
- Docker & Docker Compose
- Xcode 16+ (iOS native)
- Android Studio (Android native), Java 17 (Zulu)

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

### Mobile App (Expo)

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile
npm install
npm start
```

### iOS Native App

```bash
cd camp-card-ios
xcodegen generate
xcodebuild -project CampCard.xcodeproj -scheme CampCard \
  -destination 'platform=iOS Simulator,name=iPhone 16' build
```

### Android Native App

```bash
cd camp-card-android
JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home \
  ./gradlew assembleDebug
```

## Repository Structure

```
camp-card/
├── backend/                                    # Java Spring Boot REST API
│   ├── src/main/java/
│   │   ├── org/bsa/campcard/                  # API, domain, config, security
│   │   └── com/bsa/campcard/                  # Entities, repos, services, DTOs
│   └── src/main/resources/db/migration/       # Flyway SQL migrations
├── camp-card-ios/                             # Native iOS App (SwiftUI)
│   ├── Sources/
│   │   ├── App/                               # App entry point
│   │   ├── Core/                              # Networking, auth, extensions
│   │   ├── Features/                          # Screen modules by role
│   │   └── Navigation/                        # Role-based navigation
│   └── project.yml                            # XcodeGen project config
├── camp-card-android/                         # Native Android App (Kotlin/Compose)
│   ├── app/src/main/java/org/bsa/campcard/
│   │   ├── core/                              # Networking, auth, DI (Hilt)
│   │   ├── features/                          # Screen modules by role
│   │   └── ui/theme/                          # Material3 theming
│   └── app/build.gradle.kts                   # Gradle build config
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
- **Role-based access control** across all platforms
- **Authorize.Net payment processing** (Accept Hosted / Accept.js)
- **Council-specific payment configs** with AES-256-GCM encryption
- **Scout referral tracking** with QR codes and viral chain attribution
- **Real-time analytics** dashboards for admin, council, and troop leaders
- **AI Marketing** campaign management with segment targeting
- **Flip card wallet** (campcard_skin.jpg front, QR code back) on both iOS and Android
- **Biometric auth** (Face ID on iOS, Fingerprint on Android)
- **StoreKit 2 / Google Play Billing v7** for in-app subscriptions
- **Native iOS and Android builds** alongside Expo managed workflow

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

### Mobile — Expo (EAS)

```bash
cd camp-card-mobile-app-v2-mobile-main/mobile
npx eas build --profile production --platform all --non-interactive
npx eas submit --platform all
```

### Mobile — iOS Native (xcodebuild + altool)

Signing credentials are stored in **GitHub Secrets** (`ASC_API_KEY_P8_BASE64`, `ASC_API_KEY_ID`, `ASC_API_ISSUER_ID`, `APPLE_TEAM_ID`) and **AWS Secrets Manager** (`campcard/mobile/ios-signing`).

```bash
cd camp-card-ios
xcodegen generate
xcodebuild -project CampCard.xcodeproj -scheme CampCard \
  -archivePath /tmp/CampCard.xcarchive archive \
  -allowProvisioningUpdates \
  -authenticationKeyPath ~/.private_keys/AuthKey_R227Z5WG3Q.p8 \
  -authenticationKeyID R227Z5WG3Q \
  -authenticationKeyIssuerID 51541aa3-d401-43f0-9244-976dbad0ec07

xcodebuild -exportArchive \
  -archivePath /tmp/CampCard.xcarchive \
  -exportPath /tmp/CampCard-export \
  -exportOptionsPlist ExportOptions.plist \
  -allowProvisioningUpdates \
  -authenticationKeyPath ~/.private_keys/AuthKey_R227Z5WG3Q.p8 \
  -authenticationKeyID R227Z5WG3Q \
  -authenticationKeyIssuerID 51541aa3-d401-43f0-9244-976dbad0ec07

xcrun altool --upload-app -f /tmp/CampCard-export/CampCard.ipa \
  --type ios --apiKey R227Z5WG3Q \
  --apiIssuer 51541aa3-d401-43f0-9244-976dbad0ec07
```

### Mobile — Android Native (Gradle + Play API)

Signing credentials are stored in **GitHub Secrets** (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `ANDROID_STORE_PASSWORD`) and **AWS Secrets Manager** (`campcard/mobile/android-signing`).

```bash
cd camp-card-android
# key.properties is gitignored — restore from secrets before building:
# echo "storeFile=..." > key.properties

JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home \
  ./gradlew bundleRelease

# Upload to Play Internal Testing via API
python3 scripts/upload_aab_to_play.py
```

## CI/CD Secrets Reference

| Secret | Store | Purpose |
|--------|-------|---------|
| `ANDROID_KEYSTORE_BASE64` | GitHub + AWS | Android release keystore (base64) |
| `ANDROID_STORE_PASSWORD` | GitHub + AWS | Keystore store password |
| `ANDROID_KEY_ALIAS` | GitHub + AWS | Key alias in keystore |
| `ANDROID_KEY_PASSWORD` | GitHub + AWS | Key password |
| `ASC_API_KEY_P8_BASE64` | GitHub + AWS | Apple ASC API key (.p8, base64) |
| `ASC_API_KEY_ID` | GitHub + AWS | ASC API Key ID (R227Z5WG3Q) |
| `ASC_API_ISSUER_ID` | GitHub + AWS | ASC Issuer ID |
| `APPLE_TEAM_ID` | GitHub + AWS | Apple Developer Team ID |

AWS Secrets Manager ARNs:
- `arn:aws:secretsmanager:us-east-2:858955002750:secret:campcard/mobile/android-signing`
- `arn:aws:secretsmanager:us-east-2:858955002750:secret:campcard/mobile/ios-signing`

## API Documentation

- Swagger UI: `http://localhost:7010/swagger-ui.html`
- OpenAPI spec: `http://localhost:7010/v3/api-docs`

## Testing

```bash
# Backend
cd backend && ./mvnw test

# Web Portal
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web && npm test

# Mobile (Expo)
cd camp-card-mobile-app-v2-mobile-main/mobile && npm test

# iOS Native
cd camp-card-ios
xcodebuild test -project CampCard.xcodeproj -scheme CampCard \
  -destination 'platform=iOS Simulator,name=iPhone 16'

# Android Native
cd camp-card-android
JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home \
  ./gradlew test
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
| **Email** | AWS SES (us-east-1), domain: campcardapp.org |
| **Payments** | Authorize.Net |
| **Mobile Builds** | Expo Application Services (EAS) + native xcodebuild/Gradle |
| **iOS TestFlight** | v2.0.0 build 71 (uploaded Feb 2026) |
| **Android Internal** | v2.0.0 build 66 (Internal Testing, Feb 2026) |

## Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed project documentation, deployment procedures, and architecture notes
- [Backend README](backend/README.md) - Backend API details
- [Web Portal README](camp-card-mobile-app-v2-web-main/repos/camp-card-web/README.md) - Web admin portal details
- [Mobile README](camp-card-mobile-app-v2-mobile-main/mobile/README.md) - Mobile app details
