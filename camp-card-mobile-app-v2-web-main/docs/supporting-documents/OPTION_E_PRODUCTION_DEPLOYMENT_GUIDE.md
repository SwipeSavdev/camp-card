# Option E: Production Deployment Guide

## Executive Summary

The Camp Card Offers System is production-ready. This guide covers deployment, scaling, and operational best practices.

---

## Part 1: Backend Deployment

### Prerequisites
- Java 17+ (OpenJDK or Oracle JDK)
- PostgreSQL 14+ (remote or self-hosted)
- Maven 3.8+
- Linux/macOS server with 2GB+ RAM

### Deployment Steps

#### 1. Build Production JAR

```bash
cd repos/camp-card-backend
mvn clean package -DskipTests -P production
# Output: target/campcard.jar (139 MB)
```

#### 2. Database Setup

```bash
# Create production database
createdb campcard_prod

# Run Flyway migrations
psql campcard_prod < src/main/resources/db/migration/V001__Create_base_schema.sql
psql campcard_prod < src/main/resources/db/migration/V002__Create_camp_cards_and_merchant_schema.sql
psql campcard_prod < src/main/resources/db/migration/V003__create_offers_table.sql
```

#### 3. Environment Configuration

Create `.env` or set system environment variables:

```bash
# PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://db.example.com:5432/campcard_prod
SPRING_DATASOURCE_USERNAME=campcard_user
SPRING_DATASOURCE_PASSWORD=<secure-password>

# Server
SERVER_PORT=8080
SERVER_SERVLET_CONTEXT_PATH=/api

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_BSA=DEBUG

# Flyway
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_OUT_OF_ORDER=false
```

#### 4. Start Backend Service

**Option A: systemd Service (Recommended)**

Create `/etc/systemd/system/campcard-backend.service`:

```ini
[Unit]
Description=Camp Card Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=campcard
WorkingDirectory=/opt/campcard
ExecStart=/usr/bin/java -jar campcard.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

Environment="SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/campcard_prod"
Environment="SPRING_DATASOURCE_USERNAME=campcard_user"
Environment="SPRING_DATASOURCE_PASSWORD=<password>"

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
systemctl start campcard-backend
systemctl enable campcard-backend
```

**Option B: Docker Container**

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/campcard.jar /app/campcard.jar
WORKDIR /app
EXPOSE 8080
CMD ["java", "-jar", "campcard.jar"]
```

Build and run:
```bash
docker build -t campcard-backend .
docker run -d \
 -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/campcard \
 -e SPRING_DATASOURCE_USERNAME=campcard \
 -e SPRING_DATASOURCE_PASSWORD=<password> \
 -p 8080:8080 \
 campcard-backend
```

### Backend Scaling

**Vertical Scaling (Single Server)**
- Increase JVM heap: `-Xmx2G -Xms2G`
- Monitor: CPU < 70%, Memory < 80%
- Connection pool: `spring.datasource.hikari.maximum-pool-size=20`

**Horizontal Scaling (Multiple Servers)**
- Load balancer: Nginx/HAProxy
- Configure sticky sessions for auth
- Ensure database can handle connection pool  number of servers

---

## Part 2: Web Dashboard Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel, Netlify, or self-hosted server

### Deployment Steps

#### 1. Build for Production

```bash
cd repos/camp-card-web
npm install --legacy-peer-deps
npm run build
# Output: .next/standalone directory (production-ready)
```

#### 2. Environment Configuration

Create `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://api.campcard.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=https://dashboard.campcard.com
```

#### 3. Deployment Options

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel deploy --prod
```

**Option B: Self-hosted with PM2**
```bash
npm install -g pm2
pm2 start "npm run start" --name "campcard-web"
pm2 startup
pm2 save
```

**Option C: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## Part 3: Mobile App Deployment

### Prerequisites
- iOS: Xcode + Apple Developer Account
- Android: Android Studio + Google Play Developer Account

### Build & Release

#### iOS App Store
```bash
cd repos/camp-card-mobile
# Update version in package.json and app.json
eas build --platform ios --auto-submit
```

#### Google Play Store
```bash
eas build --platform android --auto-submit
```

### Configuration for Production

Create `.env.production`:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.campcard.com
ENABLE_MOCK_AUTH=false
```

---

## Part 4: Database Management

### Backup Strategy

**Daily Backups**
```bash
# Automated backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump campcard_prod | gzip > /backups/campcard_${TIMESTAMP}.sql.gz

# Keep last 30 days
find /backups -name "campcard_*.sql.gz" -mtime +30 -delete
```

Schedule with crontab:
```bash
0 2 * * * /opt/campcard/backup.sh
```

**Point-in-Time Recovery**
```bash
# Enable WAL archiving in postgresql.conf
archive_mode = on
archive_command = 'cp %p /wal-archive/%f'
```

### Monitoring & Maintenance

```bash
# Monitor connection count
SELECT count(*) FROM pg_stat_activity;

# Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM offers WHERE is_active = true;
```

---

## Part 5: Monitoring & Logging

### Application Logging

**Backend Logs**
```bash
tail -f /var/log/campcard/application.log

# Structured logging for analysis
grep "ERROR\|WARN" /var/log/campcard/application.log
```

**Web App Logs**
```bash
pm2 logs campcard-web

# Or with Docker
docker logs <container-id> -f
```

### Health Checks

**Backend Health Endpoint**
```bash
curl http://localhost:8080/actuator/health
# Response: {"status":"UP"}
```

**Database Health**
```bash
psql -c "SELECT 1;" campcard_prod
```

### Monitoring Tools

Recommended stack:
- **Metrics**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alerting**: Datadog or New Relic

---

## Part 6: Security Checklist

### Backend Security
- HTTPS/TLS enabled
- Database passwords in secrets manager
- SQL injection protection (JPA)
- CORS properly configured
- Authentication tokens validated
- Rate limiting enabled
- Input validation on all endpoints

### Database Security
- Network isolation (VPC/private subnet)
- Encrypted at rest
- Encrypted in transit (SSL)
- Regular security patches
- Automated backups encrypted
- Access restricted to app servers

### API Security
- Bearer token authentication
- Token expiration: 1 hour
- Refresh token rotation: 7 days
- Rate limiting: 100 req/min per user
- Request size limits: 10MB
- CORS whitelist strict domains

---

## Part 7: Performance Optimization

### Database Optimization

**Indexes Already Created:**
- `idx_offers_merchant_id` - Fast merchant lookup
- `idx_offers_category_id` - Fast category filtering
- `idx_offers_is_active` - Fast active offer queries
- `idx_offers_uuid` - Fast UUID lookups
- `idx_offers_valid_from` - Fast date range queries
- `idx_offers_valid_until` - Fast validity checks
- `idx_offers_created_at` - Fast sorting by creation

**Connection Pooling**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.maximum-lifetime=1800000
```

### API Caching

Implement Redis for:
- Offer list cache (5 min TTL)
- Merchant data cache (30 min TTL)
- Category cache (24 hour TTL)

```bash
# Add to application.properties
spring.redis.host=redis.example.com
spring.cache.type=redis
```

### CDN Configuration

Cache static assets:
- Images: 30 days
- JavaScript/CSS: 1 day
- API responses: No caching (except GET /categories)

---

## Part 8: Disaster Recovery

### RTO/RPO Targets
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

### Failover Procedure

1. **Database Failover**
 ```bash
 # Promote standby replica
 SELECT pg_promote();
 ```

2. **Backend Failover**
 - Activate secondary server in load balancer
 - Health checks verify readiness
 - Automatic restart on failure

3. **Data Restoration**
 - From encrypted backup: `pg_restore`
 - Update replication lag monitor
 - Verify data integrity

---

## Part 9: Cost Estimation

### AWS Deployment Example (Monthly)

| Service | Size | Cost |
|---------|------|------|
| EC2 (Backend) | t3.medium | $35 |
| RDS PostgreSQL | db.t3.small | $50 |
| ALB | 1 | $16 |
| Data Transfer | 100GB | $9 |
| S3 Backups | 500GB | $12 |
| **Total** | | **$122/mo** |

### Scaling Costs
- 10,000 users: +$50/mo
- 100,000 users: +$200/mo
- 1M users: +$2,000/mo

---

## Part 10: Maintenance Schedule

### Daily
- Monitor application logs
- Check database connection count
- Verify backup completion

### Weekly
- Review performance metrics
- Check disk space usage
- Verify replication lag

### Monthly
- Update dependencies
- Review security patches
- Test disaster recovery
- Analyze query performance

### Quarterly
- Full security audit
- Capacity planning review
- Performance optimization
- Cost analysis

---

## Deployment Checklist

- [ ] Backend JAR built and tested
- [ ] Database migrated and backed up
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Load balancer configured
- [ ] Health checks passing
- [ ] Monitoring/logging active
- [ ] Backup system tested
- [ ] Security scan passed
- [ ] Performance tested under load
- [ ] Documentation complete
- [ ] Incident response plan ready

---

**Option E Status**: **PRODUCTION DEPLOYMENT GUIDE COMPLETE**
