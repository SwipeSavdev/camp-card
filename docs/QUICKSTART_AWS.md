# BSA Camp Card - AWS Deployment Quick Start Guide

## AWS Infrastructure Overview

| Component | Service | Details |
|-----------|---------|---------|
| Server | EC2 | `18.190.69.205` (Ubuntu) |
| Database | RDS PostgreSQL 16 | `camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com` |
| Domain | - | `https://bsa.swipesavvy.com` |

---

## Quick Reference

### SSH Access

```bash
ssh -i ~/.ssh/campcard-ec2 ubuntu@18.190.69.205
```

### Running Containers

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| campcard-backend | campcard-backend:latest | 7010 | Spring Boot API |
| campcard-web | campcard-web:latest | 7020 | Next.js Portal |
| campcard-redis | redis:7-alpine | 6379 | Cache |
| campcard-kafka | confluentinc/cp-kafka:7.5.0 | 9092 | Messages |
| campcard-zookeeper | confluentinc/cp-zookeeper:7.5.0 | 2181 | Kafka coordination |

---

## Deployment Procedures

### Deploy Backend (Java/Spring Boot)

```bash
# SSH to server
ssh -i ~/.ssh/campcard-ec2 ubuntu@18.190.69.205

# Navigate and pull latest code
cd /home/ec2-user/camp-card/backend
sudo git pull origin main

# Build Docker image
sudo docker build -t campcard-backend:latest .

# Stop and remove existing container
sudo docker stop campcard-backend && sudo docker rm campcard-backend

# Start new container
sudo docker run -d --name campcard-backend --restart unless-stopped -p 7010:7010 \
  -e SPRING_PROFILES_ACTIVE=aws \
  -e DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com \
  -e DB_PORT=5432 -e DB_NAME=campcard \
  -e DB_USERNAME=campcard_app -e DB_PASSWORD=CampCardApp2024Secure \
  -e JWT_SECRET='bsa-camp-card-super-secret-jwt-key-2025-that-is-very-long-and-secure' \
  -e JWT_EXPIRATION=86400000 \
  -e REDIS_HOST=campcard-redis -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=campcard123 \
  -e REDIS_SSL=false \
  --network campcard_campcard-network campcard-backend:latest

# Verify container is running
sudo docker ps | grep campcard-backend
sudo docker logs --tail 50 campcard-backend
```

### Deploy Web Portal (Next.js)

```bash
# SSH to server
ssh -i ~/.ssh/campcard-ec2 ubuntu@18.190.69.205

# Navigate and pull latest code
cd /home/ec2-user/camp-card/camp-card-mobile-app-v2-web-main/repos/camp-card-web
sudo git pull origin main

# Build Docker image (with API URL)
sudo docker build --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1 \
  -t campcard-web:latest .

# Stop and remove existing container
sudo docker stop campcard-web && sudo docker rm campcard-web

# Start new container
sudo docker run -d --name campcard-web --restart unless-stopped -p 7020:7020 \
  -e NEXTAUTH_URL=https://bsa.swipesavvy.com \
  -e NEXTAUTH_SECRET='bsa-camp-card-nextauth-secret-2025' \
  -e NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1 \
  --network campcard_campcard-network campcard-web:latest

# Verify container is running
sudo docker ps | grep campcard-web
sudo docker logs --tail 50 campcard-web
```

---

## AWS Environment Variables

### Backend Container

| Variable | Value | Description |
|----------|-------|-------------|
| SPRING_PROFILES_ACTIVE | aws | Use AWS profile |
| DB_HOST | camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com | RDS endpoint |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | campcard | Database name |
| DB_USERNAME | campcard_app | App user (not postgres) |
| DB_PASSWORD | CampCardApp2024Secure | App user password |
| JWT_SECRET | (see deployment command) | JWT signing key |
| JWT_EXPIRATION | 86400000 | 24 hours in ms |
| REDIS_HOST | campcard-redis | Container name |
| REDIS_PORT | 6379 | Redis port |
| REDIS_PASSWORD | campcard123 | Redis password |
| REDIS_SSL | false | No TLS for local Redis |

### Web Portal Container

| Variable | Value | Description |
|----------|-------|-------------|
| NEXTAUTH_URL | https://bsa.swipesavvy.com | Auth callback URL |
| NEXTAUTH_SECRET | (see deployment command) | Session encryption |
| NEXT_PUBLIC_API_URL | https://bsa.swipesavvy.com/api/v1 | Backend API |

---

## Common Operations

### View Container Logs

```bash
# Backend logs
sudo docker logs --tail 100 campcard-backend
sudo docker logs -f campcard-backend  # Follow logs

# Web portal logs
sudo docker logs --tail 100 campcard-web
sudo docker logs -f campcard-web
```

### Check Container Status

```bash
sudo docker ps -a
```

### Restart a Container

```bash
sudo docker restart campcard-backend
sudo docker restart campcard-web
```

### Access Container Shell

```bash
sudo docker exec -it campcard-backend /bin/sh
sudo docker exec -it campcard-web /bin/sh
```

### Clean Up Disk Space

**IMPORTANT**: The EC2 instance has limited disk space. Run this regularly:

```bash
sudo docker system prune -a --volumes -f
```

### Check Disk Usage

```bash
df -h
```

---

## Database Operations (RDS)

### Connect to RDS from EC2

```bash
# Using psql from backend container
sudo docker exec -it campcard-backend psql \
  -h camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com \
  -U campcard_app -d campcard

# Or install psql on EC2
sudo apt-get install postgresql-client
psql -h camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com \
  -U campcard_app -d campcard
```

### RDS Connection Details

| Property | Value |
|----------|-------|
| Endpoint | camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com |
| Port | 5432 |
| Database | campcard |
| Schema | campcard |
| App User | campcard_app |
| App Password | CampCardApp2024Secure |
| Master User | postgres |

### Important Database Notes

- All tables are in the `campcard` schema (not `public`)
- Application uses `campcard_app` user with limited privileges
- Schema changes are managed by Flyway migrations only
- Database is baselined at migration V9

---

## Network Configuration

All containers run on the `campcard_campcard-network` Docker network. This allows containers to communicate using container names as hostnames.

```bash
# View network details
sudo docker network inspect campcard_campcard-network
```

---

## SSL/HTTPS

HTTPS is terminated at the load balancer/reverse proxy level. The containers communicate internally over HTTP.

- External URL: `https://bsa.swipesavvy.com`
- Backend internal: `http://campcard-backend:7010`
- Web internal: `http://campcard-web:7020`

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
sudo docker logs campcard-backend

# Check if port is in use
sudo lsof -i :7010
```

### "No Space Left on Device" Error

```bash
# Clean up Docker resources
sudo docker system prune -a --volumes -f

# Check disk usage
df -h
```

### Database Connection Refused

1. Verify RDS security group allows EC2 IP
2. Check the container is on the correct network
3. Verify environment variables are set correctly

### Backend Returns 500 Errors

1. Check backend logs: `sudo docker logs campcard-backend`
2. Verify database connection
3. Check Redis connectivity

### Web Portal Shows Blank Page

1. Check if backend API is accessible
2. Verify NEXT_PUBLIC_API_URL is correct
3. Check browser console for errors

---

## Rollback Procedure

If a deployment fails:

```bash
# Stop the broken container
sudo docker stop campcard-backend

# Pull the previous image from history
sudo docker images  # Find previous image ID

# Restart with previous image
sudo docker run -d --name campcard-backend ... <previous-image-id>
```

---

## Monitoring Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| Backend Health | https://bsa.swipesavvy.com/actuator/health | Spring Boot health |
| API Docs | https://bsa.swipesavvy.com/swagger-ui.html | Swagger UI |
| Web Portal | https://bsa.swipesavvy.com | Main application |

---

## Security Notes

1. **Never commit credentials** to the repository
2. **SSH key** (`~/.ssh/campcard-ec2`) must have 400 permissions
3. **Database** uses dedicated `campcard_app` user, not superuser
4. **JWT secrets** should be rotated periodically
5. **REDIS_SSL=false** is intentional (local container, not AWS ElastiCache)

---

## Related Documentation

- [Local Development Guide](./QUICKSTART_LOCAL.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Main Project Guide](../CLAUDE.md)
