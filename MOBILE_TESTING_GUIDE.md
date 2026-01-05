# Camp Card Mobile App - Testing Guide

This guide explains how to test the Camp Card mobile app on AWS EC2.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS EC2 Instance                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Backend   │  │  Web Portal │  │  Mobile Dev Server      │  │
│  │  (Port 7010)│  │ (Port 7020) │  │  (Expo - Ports 8081,    │  │
│  │  Spring Boot│  │   Next.js   │  │   19000-19002)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                     │                  │
│         └────────────────┬────────────────────┘                  │
│                          │                                       │
│                   ┌──────┴──────┐                                │
│                   │    Redis    │                                │
│                   │   Kafka     │                                │
│                   └─────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   AWS RDS PostgreSQL   │
              └────────────────────────┘
```

## Testing Options

### Option 1: Expo Go App (Recommended for Testing)

The simplest way to test the mobile app on a real device.

#### Prerequisites
1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Your phone must be on the internet (can be on different network than EC2)

#### Steps

1. **SSH into EC2 and check mobile container logs:**
   ```bash
   ssh -i campcard-backend.pem ubuntu@ec2-18-118-82-111.us-east-2.compute.amazonaws.com
   docker logs campcard-mobile -f
   ```

2. **Find the Expo tunnel URL:**
   The logs will show something like:
   ```
   Metro waiting on exp://u.expo.dev/xxx...

   › Tunnel ready.
   › QR code or URL: exp://xxx.exp.direct:443
   ```

3. **Connect from your phone:**
   - Open Expo Go app
   - Scan the QR code shown in the logs, OR
   - Enter the tunnel URL manually

4. **The app will load and connect to the backend API on EC2**

---

### Option 2: Build Android APK for Direct Installation

For more permanent testing or sharing with testers.

#### Build APK on EC2

```bash
# SSH into EC2
ssh -i campcard-backend.pem ubuntu@ec2-18-118-82-111.us-east-2.compute.amazonaws.com

# Enter the mobile container
docker exec -it campcard-mobile sh

# Build the APK
cd /app
npx expo build:android -t apk

# Or use EAS Build (recommended)
npx eas build --platform android --profile preview
```

#### Download and Install

1. Download the APK from the build URL provided
2. Enable "Install from Unknown Sources" on your Android device
3. Install the APK

---

### Option 3: Local Development Testing

Test on your local machine against the EC2 backend.

#### Setup

1. Clone the repo and navigate to mobile app:
   ```bash
   cd camp-card-mobile-app-v2-mobile-main/mobile
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Update `.env` to point to EC2 backend:
   ```bash
   API_BASE_URL=http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7010/api/v1
   ```

4. Start Expo:
   ```bash
   npx expo start
   ```

5. Scan QR code with Expo Go app

---

## EC2 Security Group Configuration

Ensure the following ports are open in your EC2 security group:

| Port | Service | Purpose |
|------|---------|---------|
| 7010 | Backend API | REST API for mobile app |
| 7020 | Web Portal | Admin web interface |
| 8081 | Metro Bundler | React Native bundler |
| 19000 | Expo DevTools | Expo development server |
| 19001 | Expo Packager | Expo packager info |
| 19002 | Expo Web | Expo web interface |

---

## Troubleshooting

### Mobile app can't connect to backend

1. **Check backend is running:**
   ```bash
   curl http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7010/actuator/health
   ```

2. **Check security groups allow port 7010**

3. **Verify API_BASE_URL in mobile app**

### Expo tunnel not working

1. **Restart the mobile container:**
   ```bash
   docker restart campcard-mobile
   ```

2. **Check container logs for errors:**
   ```bash
   docker logs campcard-mobile
   ```

3. **Verify ngrok/tunnel service is running inside container**

### App loads but shows errors

1. **Check backend logs:**
   ```bash
   docker logs campcard-backend -f
   ```

2. **Verify database connection:**
   ```bash
   docker exec campcard-backend curl localhost:7010/actuator/health
   ```

---

## Service URLs

| Service | URL |
|---------|-----|
| Backend API | http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7010 |
| Web Portal | http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7020 |
| API Docs (Swagger) | http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7010/swagger-ui.html |
| Health Check | http://ec2-18-118-82-111.us-east-2.compute.amazonaws.com:7010/actuator/health |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campcard.org | Password123! |

---

## Useful Commands

```bash
# View all containers
docker ps

# View mobile logs
docker logs campcard-mobile -f

# Restart all services
docker-compose -f docker-compose-aws.yml restart

# Rebuild mobile container
docker-compose -f docker-compose-aws.yml up -d --build mobile
```
