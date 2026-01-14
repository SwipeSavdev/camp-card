# BSA Camp Card - Local Development Quick Start Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker Desktop** (v4.0+) - [Download](https://www.docker.com/products/docker-desktop)
- **Java 21** (JDK) - [Download](https://adoptium.net/) or `brew install openjdk@21`
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Maven 3.9+** (or use included `./mvnw`)
- **Git**

---

## Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/SwipeSavdev/camp-card.git
cd camp-card
```

### Step 2: Start Supporting Services

```bash
cd backend
docker-compose up -d
```

This starts:
| Service     | Port | Description |
|-------------|------|-------------|
| PostgreSQL  | 7001 | Database |
| Redis       | 7002 | Cache |
| Zookeeper   | 7003 | Kafka coordination |
| Kafka       | 7004 | Message broker |
| Kafka UI    | 7005 | Web UI for Kafka |
| Mailhog SMTP| 7006 | Email testing |
| Mailhog UI  | 7007 | Email web viewer |
| LocalStack  | 7008 | AWS emulation |

### Step 3: Create Database Schema

The backend uses a dedicated `campcard` schema. Create it before first run:

```bash
docker exec campcard-postgres psql -U postgres -d campcard_dev -c "CREATE SCHEMA IF NOT EXISTS campcard;"
```

### Step 4: Start the Backend API

**Important:** Ensure Java 21 is active. If you have multiple Java versions:

```bash
# macOS with Homebrew
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.9/libexec/openjdk.jdk/Contents/Home

# Verify Java version
java -version  # Should show 21.x
```

Start the backend:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API will be available at: `http://localhost:7010`

**Note:** On first run, Hibernate will automatically create all database tables in the `campcard` schema.

### Step 5: Start the Web Portal

```bash
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm install
npm run dev
```

The web portal will be available at: `http://localhost:7020`

### Step 6: Verify Everything Works

1. **API Health Check**: http://localhost:7010/actuator/health
2. **Swagger UI**: http://localhost:7010/swagger-ui.html
3. **Web Portal**: http://localhost:7020

---

## Test Credentials

The database is seeded with test users on first run:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Council Admin | john.smith@nycbsa.org | Password123 | COUNCIL_ADMIN |
| Troop Leader | david.wilson@troop101.org | Password123 | TROOP_LEADER |
| Parent | james.anderson@email.com | Password123 | PARENT |
| Scout | ethan.anderson@email.com | Password123 | SCOUT |

---

## Local Environment Configuration

### Backend (`application-dev.yml`)

The dev profile is pre-configured with:

```yaml
# Database
spring.datasource.url=jdbc:postgresql://localhost:7001/campcard_dev
spring.datasource.username=postgres
spring.datasource.password=postgres

# Schema managed by Hibernate (matches RDS production)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.default_schema=campcard

# Flyway disabled for local (Hibernate manages schema)
spring.flyway.enabled=false

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=7002
spring.data.redis.password=devpassword

# Kafka
spring.kafka.bootstrap-servers=localhost:7004
```

### Web Portal (`.env.local`)

Create this file in `camp-card-mobile-app-v2-web-main/repos/camp-card-web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:7010/api/v1
NEXTAUTH_URL=http://localhost:7020
NEXTAUTH_SECRET=dev-nextauth-secret-key
```

---

## Database Schema Management

### Local Development vs AWS

| Environment | Schema Management | Schema Name |
|-------------|-------------------|-------------|
| Local (dev) | Hibernate ddl-auto: update | campcard |
| AWS (prod)  | Hibernate ddl-auto: validate | campcard |

For local development, Hibernate automatically creates and updates tables based on JPA entities. This ensures the local schema always matches the entity definitions (same as RDS production, which was originally created by Hibernate).

### Database Operations

```bash
# Connect to local PostgreSQL
docker exec -it campcard-postgres psql -U postgres -d campcard_dev

# List tables in campcard schema
\dt campcard.*

# View table structure
\d campcard.users

# Reset database (WARNING: Deletes all data)
docker exec campcard-postgres psql -U postgres -c "DROP DATABASE campcard_dev;"
docker exec campcard-postgres psql -U postgres -c "CREATE DATABASE campcard_dev;"
docker exec campcard-postgres psql -U postgres -d campcard_dev -c "CREATE SCHEMA campcard;"
# Then restart the backend to recreate tables
```

---

## Common Development Tasks

### Run Backend Tests

```bash
cd backend
./mvnw test                                    # All tests
./mvnw test -Dtest=UserServiceTest            # Single test class
./mvnw test -Dtest=UserServiceTest#testCreate  # Single test method
```

### Run Web Portal Tests

```bash
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm test              # Jest unit tests
npm run e2e           # Playwright E2E tests
npm run e2e:ui        # E2E with UI
```

### Code Quality

```bash
# Backend
cd backend
./mvnw spotless:apply    # Format code
./mvnw checkstyle:check  # Check style

# Frontend
cd camp-card-mobile-app-v2-web-main/repos/camp-card-web
npm run lint:fix         # ESLint fix
npm run type-check       # TypeScript check
```

---

## Stopping Services

```bash
# Stop all Docker containers
cd backend
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

---

## Troubleshooting

### Java 21 Not Found

```bash
# Check installed Java versions (macOS)
/usr/libexec/java_home -V

# Install Java 21 with Homebrew
brew install openjdk@21

# Set JAVA_HOME
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.9/libexec/openjdk.jdk/Contents/Home
```

### Port Already in Use

```bash
# Find process using a port (e.g., 7010)
lsof -i :7010

# Kill the process
kill -9 <PID>
```

### Docker Out of Disk Space

```bash
# Clean up Docker resources
docker system prune -a --volumes -f
```

### Database Connection Issues

1. Ensure PostgreSQL container is running: `docker ps | grep postgres`
2. Check container logs: `docker logs campcard-postgres`
3. Verify port binding: `docker port campcard-postgres`

### Maven Build Failures

```bash
# Clear Maven cache and rebuild
./mvnw clean install -DskipTests
```

### Node Module Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## IDE Setup

### IntelliJ IDEA (Backend)

1. Open the `backend` folder as a project
2. Mark `src/main/java` as Sources Root
3. Mark `src/test/java` as Test Sources Root
4. Set Project SDK to Java 21
5. Enable annotation processing for Lombok

### VS Code (Web Portal)

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

---

## Service URLs Summary

| Service | URL |
|---------|-----|
| Backend API | http://localhost:7010 |
| Swagger UI | http://localhost:7010/swagger-ui.html |
| OpenAPI Spec | http://localhost:7010/v3/api-docs |
| Web Portal | http://localhost:7020 |
| Kafka UI | http://localhost:7005 |
| Mailhog | http://localhost:7007 |

---

## Next Steps

- Read the [Database Schema Documentation](./DATABASE_SCHEMA.md)
- Check the [AWS Deployment Guide](./QUICKSTART_AWS.md)
- Review the main [CLAUDE.md](../CLAUDE.md) for full project context
