# Camp Card Offers System - Production Deployment Procedures

**Version**: 1.0.0
**Date**: December 28, 2025
**Status**: Production-Ready
**Environment**: AWS | GCP | Self-Hosted

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Database Setup](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Mobile Deployment](#mobile-deployment)
6. [Health Checks](#health-checks)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Incident Response](#incident-response)
9. [Rollback Procedures](#rollback-procedures)
10. [Scaling Procedures](#scaling-procedures)

---

# PRE-DEPLOYMENT CHECKLIST

## Code Quality Checks

```bash
# Unit Tests
mvn clean test -DskipIntegrationTests

# Code Coverage (target: 80%+)
mvn jacoco:report
open target/site/jacoco/index.html

# Static Code Analysis
mvn sonar:sonar

# Dependency Check
mvn org.owasp:dependency-check-maven:check

# Security Scan
git secret scan
```

**Approval**:
- [ ] All unit tests pass
- [ ] Coverage > 80%
- [ ] No critical vulnerabilities
- [ ] No secrets in code

## Infrastructure Readiness

```bash
# Backend Service
- [ ] CPU: 2+ cores available
- [ ] Memory: 4GB+ available
- [ ] Disk: 50GB+ available
- [ ] Network: Firewall rules configured

# Database
- [ ] PostgreSQL 13+ installed
- [ ] Backup strategy in place
- [ ] Replication configured (production)
- [ ] Monitoring enabled

# Cache Layer (Optional)
- [ ] Redis 6+ installed
- [ ] Memory: 2GB+ available
- [ ] Persistence: RDB or AOF configured
```

## Security Configuration

```bash
# SSL/TLS Certificates
- [ ] Valid certificates obtained
- [ ] Certificate renewal configured
- [ ] Certificate: 2-year validity minimum

# API Keys & Secrets
- [ ] API keys generated & rotated
- [ ] Secrets stored in vault (not in git)
- [ ] JWT signing key configured
- [ ] CORS domains configured

# Access Control
- [ ] VPN/Bastion host configured
- [ ] SSH keys configured (not passwords)
- [ ] Database credentials in secrets manager
- [ ] IAM roles configured (AWS/GCP)

# Network Security
- [ ] Firewall rules configured
- [ ] Load balancer configured
- [ ] DDoS protection enabled (CloudFlare/AWS Shield)
- [ ] WAF rules configured
```

## Documentation Review

```bash
- [ ] Deployment guide reviewed
- [ ] Rollback procedures documented
- [ ] Incident playbooks created
- [ ] API documentation updated
- [ ] Configuration changes documented
```

## Team Readiness

```bash
- [ ] Deployment team trained
- [ ] On-call engineer assigned
- [ ] Escalation path documented
- [ ] Communication channels ready (Slack, PagerDuty)
- [ ] Deployment window confirmed
```

---

# BACKEND DEPLOYMENT

## Option 1: Docker Deployment (Recommended)

### Step 1: Build Docker Image

```bash
# 1. Navigate to backend directory
cd repos/camp-card-backend

# 2. Build JAR
mvn clean package -DskipTests

# 3. Build Docker image
docker build -t campcard-backend:1.0.0 \
 -t campcard-backend:latest \
 --build-arg JAR_FILE=target/campcard.jar .

# 4. Verify image
docker images | grep campcard-backend

# 5. Push to registry
docker tag campcard-backend:1.0.0 myregistry.azurecr.io/campcard-backend:1.0.0
docker push myregistry.azurecr.io/campcard-backend:1.0.0
```

### Step 2: Deploy with Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
 backend:
 image: campcard-backend:1.0.0
 ports:
 - "8080:8080"
 environment:
 SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campcard_db
 SPRING_DATASOURCE_USERNAME: campcard_user
 SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
 SPRING_JPA_HIBERNATE_DDL_AUTO: validate
 SPRING_REDIS_HOST: redis
 SPRING_REDIS_PORT: 6379
 SERVER_SERVLET_CONTEXT_PATH: /api
 JAVA_OPTS: "-Xms2g -Xmx4g"
 depends_on:
 - postgres
 - redis
 healthcheck:
 test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
 interval: 30s
 timeout: 10s
 retries: 3
 start_period: 40s

 postgres:
 image: postgres:15-alpine
 environment:
 POSTGRES_DB: campcard_db
 POSTGRES_USER: campcard_user
 POSTGRES_PASSWORD: ${DB_PASSWORD}
 volumes:
 - postgres_data:/var/lib/postgresql/data
 healthcheck:
 test: ["CMD-SHELL", "pg_isready -U campcard_user"]
 interval: 10s
 timeout: 5s
 retries: 5

 redis:
 image: redis:7-alpine
 command: redis-server --appendonly yes
 volumes:
 - redis_data:/data
 healthcheck:
 test: ["CMD", "redis-cli", "ping"]
 interval: 10s
 timeout: 5s
 retries: 5

volumes:
 postgres_data:
 redis_data:
```

### Step 3: Deploy to Production

```bash
# 1. SSH to production server
ssh prod-user@prod-server.com

# 2. Pull latest image
docker pull myregistry.azurecr.io/campcard-backend:1.0.0

# 3. Stop old container
docker-compose -f docker-compose.prod.yml down

# 4. Start new container
docker-compose -f docker-compose.prod.yml up -d

# 5. Monitor logs
docker-compose -f docker-compose.prod.yml logs -f backend

# 6. Verify health
curl http://localhost:8080/api/health
```

## Option 2: Kubernetes Deployment

### Step 1: Create Kubernetes Manifests

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: campcard-backend
 labels:
 app: campcard
 component: backend
spec:
 replicas: 3
 selector:
 matchLabels:
 app: campcard
 component: backend
 template:
 metadata:
 labels:
 app: campcard
 component: backend
 spec:
 containers:
 - name: backend
 image: myregistry.azurecr.io/campcard-backend:1.0.0
 ports:
 - containerPort: 8080
 env:
 - name: SPRING_DATASOURCE_URL
 valueFrom:
 configMapKeyRef:
 name: campcard-config
 key: db-url
 - name: SPRING_DATASOURCE_PASSWORD
 valueFrom:
 secretKeyRef:
 name: campcard-secrets
 key: db-password
 - name: JAVA_OPTS
 value: "-Xms2g -Xmx4g"
 livenessProbe:
 httpGet:
 path: /api/health
 port: 8080
 initialDelaySeconds: 60
 periodSeconds: 10
 failureThreshold: 3
 readinessProbe:
 httpGet:
 path: /api/ready
 port: 8080
 initialDelaySeconds: 30
 periodSeconds: 5
 resources:
 requests:
 memory: "2Gi"
 cpu: "500m"
 limits:
 memory: "4Gi"
 cpu: "2000m"
```

### Step 2: Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl create namespace campcard

# 2. Create ConfigMap for configuration
kubectl create configmap campcard-config \
 --from-literal=db-url=jdbc:postgresql://postgres:5432/campcard_db \
 -n campcard

# 3. Create Secret for passwords
kubectl create secret generic campcard-secrets \
 --from-literal=db-password=YOUR_SECURE_PASSWORD \
 -n campcard

# 4. Deploy application
kubectl apply -f deployment.yml -n campcard

# 5. Verify deployment
kubectl get pods -n campcard
kubectl get svc -n campcard

# 6. Check logs
kubectl logs -f deployment/campcard-backend -n campcard
```

## Option 3: Traditional VM Deployment

```bash
# 1. SSH to production server
ssh prod-user@prod-server.com

# 2. Navigate to app directory
cd /opt/campcard

# 3. Stop old service
sudo systemctl stop campcard-backend

# 4. Download new JAR
wget https://releases.campcard.com/campcard-1.0.0.jar
chmod +x campcard-1.0.0.jar

# 5. Update symlink
sudo rm -f current.jar
sudo ln -s campcard-1.0.0.jar current.jar

# 6. Start service
sudo systemctl start campcard-backend

# 7. Verify
curl http://localhost:8080/api/health
```

---

# DATABASE SETUP

## Step 1: Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres -h prod-db-server.com

# Create database
CREATE DATABASE campcard_db
 WITH OWNER campcard_user
 ENCODING 'UTF8'
 LOCALE 'en_US.UTF-8'
 TEMPLATE template0;

# Create user
CREATE USER campcard_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campcard_db TO campcard_user;
\c campcard_db
GRANT ALL ON SCHEMA public TO campcard_user;
```

## Step 2: Initialize Schema

```bash
# Option A: Using Flyway (automatic on startup)
# Place migration files in: src/main/resources/db/migration/
# Flyway will run migrations automatically on application startup

# Option B: Manual migration
psql -U campcard_user -d campcard_db -h prod-db-server.com < src/main/resources/db/migration/V000__initial_schema.sql
psql -U campcard_user -d campcard_db -h prod-db-server.com < src/main/resources/db/migration/V001__create_merchants_table.sql
psql -U campcard_user -d campcard_db -h prod-db-server.com < src/main/resources/db/migration/V002__create_categories_table.sql
psql -U campcard_user -d campcard_db -h prod-db-server.com < src/main/resources/db/migration/V003__create_offers_table.sql
```

## Step 3: Verify Setup

```bash
# Check database exists
psql -U postgres -h prod-db-server.com -l | grep campcard_db

# Check tables created
psql -U campcard_user -d campcard_db -h prod-db-server.com -c "\dt"

# Check offers seeded
psql -U campcard_user -d campcard_db -h prod-db-server.com -c "SELECT COUNT(*) FROM offers;"

# Expected output: 59
```

## Step 4: Backup Configuration

```bash
# Daily backup (cron job)
0 2 * * * pg_dump -U campcard_user -h prod-db-server.com campcard_db | gzip > /backups/campcard_$(date +\%Y\%m\%d).sql.gz

# Verify backup
gunzip -c /backups/campcard_20251228.sql.gz | head -50
```

---

# FRONTEND DEPLOYMENT

## Web Dashboard (Next.js)

### Step 1: Build for Production

```bash
cd repos/camp-card-web

# Install dependencies
npm ci

# Build optimized bundle
npm run build

# Verify build
ls -la .next/
```

### Step 2: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Verify deployment
vercel ls
curl https://your-domain.com
```

### Step 3: Deploy to AWS S3 + CloudFront

```bash
# 1. Export static site
npm run export

# 2. Upload to S3
aws s3 sync out/ s3://campcard-web-prod/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
 --distribution-id E123ABC \
 --paths "/*"

# 4. Verify
curl https://cdn.campcard.com
```

### Step 4: Configure Environment

```env
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.campcard.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

# MOBILE DEPLOYMENT

## iOS Deployment

### Step 1: Build for App Store

```bash
cd repos/camp-card-mobile

# Generate build
eas build --platform ios --auto-submit

# Monitor build
eas build:list
```

### Step 2: Submit to App Store

```bash
# Configure App Store Connect credentials
eas secrets:create --scope project --name APPLE_ID

# Submit
eas submit --platform ios
```

## Android Deployment

### Step 1: Build for Play Store

```bash
# Generate signed APK/AAB
eas build --platform android --auto-submit

# Configure Play Store credentials
eas secrets:create --scope project --name ANDROID_KEYSTORE_PASSWORD
```

### Step 2: Submit to Play Store

```bash
# Submit
eas submit --platform android
```

---

# HEALTH CHECKS

## Automated Health Monitoring

```bash
#!/bin/bash
# health-check.sh

BACKEND_URL="http://prod-server.com:8080/api/health"
DB_HOST="prod-db-server.com"
REDIS_HOST="prod-cache-server.com"

echo " Backend Health Check"
curl -s $BACKEND_URL | jq '.'

echo " Database Connection"
psql -U campcard_user -h $DB_HOST -d campcard_db -c "SELECT NOW();"

echo " Redis Connection"
redis-cli -h $REDIS_HOST PING

echo " API Test"
curl -s "https://api.campcard.com/offers?limit=1" | jq '.data[0]'

echo " All systems operational"
```

### Run Health Checks

```bash
# Manual check
bash health-check.sh

# Automated (every 5 minutes)
*/5 * * * * bash /opt/campcard/health-check.sh >> /var/log/campcard-health.log 2>&1
```

---

# MONITORING & ALERTS

## Prometheus Metrics

```yaml
# prometheus.yml
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: 'campcard-backend'
 static_configs:
 - targets: ['prod-server.com:8080']
 metrics_path: '/api/actuator/prometheus'
```

## Alert Rules

```yaml
# alerts.yml
groups:
 - name: campcard
 rules:
 - alert: HighErrorRate
 expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
 for: 5m
 annotations:
 summary: "High error rate detected"

 - alert: HighLatency
 expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1.0
 for: 5m
 annotations:
 summary: "High latency detected"

 - alert: LowDiskSpace
 expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
 annotations:
 summary: "Low disk space"
```

---

# INCIDENT RESPONSE

## Incident Severity Levels

| Level | Response Time | Escalation |
|-------|---------------|------------|
| **CRITICAL** | 15 min | CTO, VP Eng |
| **HIGH** | 30 min | Team Lead, On-call |
| **MEDIUM** | 2 hours | Engineer, Tech Lead |
| **LOW** | Next business day | Engineer |

## Critical Incident Playbook

### Step 1: Assess Impact

```
Questions to answer:
- How many users affected?
- Is data at risk?
- Are we losing revenue?
- Are we violating SLAs?
```

### Step 2: Mitigate Immediately

```bash
# Option A: Scale up resources
kubectl scale deployment campcard-backend --replicas=5

# Option B: Enable caching
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Option C: Disable non-critical features
# Update feature flags to disable analytics, webhooks

# Option D: Route traffic away
# Update load balancer, point to backup region
```

### Step 3: Root Cause Analysis

```bash
# Check recent changes
git log --oneline -20

# Review logs
grep ERROR /var/log/campcard.log | tail -100

# Check metrics
prometheus query 'rate(http_requests_total[5m])'
```

### Step 4: Implement Fix

```bash
# Deploy hotfix
git checkout -b hotfix/critical-bug-name
# Make changes
git commit -am "Fix critical bug"
git push origin hotfix/critical-bug-name

# Deploy immediately
./deploy.sh hotfix/critical-bug-name
```

---

# ROLLBACK PROCEDURES

## Quick Rollback (within 1 hour)

```bash
# Docker/Compose
docker-compose -f docker-compose.prod.yml pull old-version
docker-compose -f docker-compose.prod.yml up -d backend

# Kubernetes
kubectl rollout undo deployment/campcard-backend -n campcard

# Verify
curl http://prod-server.com:8080/api/health
```

## Database Rollback

```bash
# List backup versions
ls -la /backups/campcard*.sql.gz

# Restore from backup
gunzip -c /backups/campcard_20251228.sql.gz | psql -U campcard_user -d campcard_db

# Verify
psql -U campcard_user -d campcard_db -c "SELECT COUNT(*) FROM offers;"
```

---

# SCALING PROCEDURES

## Horizontal Scaling

```bash
# Add more backend instances
kubectl scale deployment campcard-backend --replicas=5

# Add database read replicas
aws rds create-db-instance-read-replica \
 --db-instance-identifier campcard-db-replica \
 --source-db-instance-identifier campcard-db
```

## Vertical Scaling

```bash
# Increase memory limit
kubectl set resources deployment campcard-backend \
 --limits=memory=8Gi,cpu=4000m
```

## Cache Scaling

```bash
# Increase Redis memory
redis-cli CONFIG SET maxmemory 4gb

# Enable Redis persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

---

## Support & Escalation

**Deployment Issues**: deploy@campcard.com
**Production Emergency**: +1-800-CAMP-CARD
**Escalation Path**: Engineer  Tech Lead  Manager  Director

---

**Document Version**: 1.0.0
**Last Updated**: December 28, 2025
**Status**: Production-Ready
