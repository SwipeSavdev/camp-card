# BSA Camp Card Platform

A multi-repository platform for digitalizing Boy Scouts of America fundraising through Camp Card sales.

## Platform Components

| Component | Technology | Port | Description |
|-----------|------------|------|-------------|
| Backend API | Java 21 / Spring Boot 3.2 | 7010 | REST API server |
| Web Portal | Next.js 14.1 | 7020 | Admin/council dashboard |
| Mobile App | React Native / Expo 54 | - | Scout & parent app |

## Quick Start

### Local Development

```bash
# Start supporting services (PostgreSQL, Redis, Kafka)
cd backend
docker-compose up -d

# Start backend API
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Start web portal (in another terminal)
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm install && npm run dev
```

**Full guide:** [docs/QUICKSTART_LOCAL.md](docs/QUICKSTART_LOCAL.md)

### AWS Deployment

```bash
# SSH to EC2
ssh -i ~/.ssh/campcard-ec2 ubuntu@18.190.69.205

# Deploy backend
cd /home/ec2-user/camp-card/backend
sudo git pull origin main
sudo docker build -t campcard-backend:latest .
# See full deployment commands in AWS guide
```

**Full guide:** [docs/QUICKSTART_AWS.md](docs/QUICKSTART_AWS.md)

## Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART_LOCAL.md](docs/QUICKSTART_LOCAL.md) | Local development setup guide |
| [QUICKSTART_AWS.md](docs/QUICKSTART_AWS.md) | AWS deployment procedures |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Complete database documentation |
| [CLAUDE.md](CLAUDE.md) | Full project context and conventions |

## Local Service Ports

| Service | Port |
|---------|------|
| PostgreSQL | 7001 |
| Redis | 7002 |
| Zookeeper | 7003 |
| Kafka | 7004 |
| Kafka UI | 7005 |
| Mailhog SMTP | 7006 |
| Mailhog UI | 7007 |
| LocalStack | 7008 |
| Backend API | 7010 |
| Web Portal | 7020 |

## Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Test User | test@campcard.org | Password123 | SCOUT |

## User Roles

```
NATIONAL_ADMIN  - Full system access
COUNCIL_ADMIN   - Council-level management
TROOP_LEADER    - Troop management
PARENT          - Parent/guardian access
SCOUT           - Scout member (default)
```

## Technology Stack

### Backend
- Java 21, Spring Boot 3.2, Maven
- PostgreSQL 16, Redis 7, Apache Kafka 3.6
- JWT authentication, BCrypt password hashing
- Flyway migrations

### Web Portal
- Next.js 14.1, React 18, TypeScript
- TanStack Query, Zustand, Zod
- TailwindCSS, Radix UI
- NextAuth.js

### Mobile App
- React Native 0.81, Expo 54
- React Navigation
- Firebase (push notifications)

### Payments
- Stripe, Authorize.Net

## AWS Infrastructure

| Component | Details |
|-----------|---------|
| EC2 Server | 18.190.69.205 (Ubuntu) |
| RDS Database | PostgreSQL 16 |
| Domain | https://bsa.swipesavvy.com |

## License

Proprietary - SwipeSavvy Development
