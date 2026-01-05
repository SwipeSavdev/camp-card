# BSA Camp Card Digitalization Program
## Build Specification  Part 3: Architecture & Deployment (EC2)

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 High-Level Architecture

The BSA Camp Card platform is a **multi-tenant SaaS application** deployed on **AWS EC2 instances** with the following characteristics:

- **Compute:** EC2 instances in Auto Scaling Groups (no ECS/Fargate)
- **Load Balancing:** Application Load Balancer (ALB) with path-based routing
- **Database:** Amazon RDS for PostgreSQL (multi-AZ for HA)
- **Event Streaming:** Amazon MSK (Managed Kafka) or self-hosted Kafka on EC2
- **Caching:** Amazon ElastiCache for Redis
- **Storage:** S3 for static assets (logos, posters, QR codes)
- **CDN:** CloudFront for global asset delivery
- **Secrets:** AWS Secrets Manager + IAM instance profiles
- **Monitoring:** CloudWatch Logs/Metrics + CloudWatch Dashboards

### 1.2 System Components

```

 Internet Users 
 (Customers, Scouts, Admins via Mobile/Web) 

 
 
 
  CloudFront  (CDN for static assets)
  + Route 53  (DNS)
 
 
 
 
  ALB  (Application Load Balancer)
  campcard.app  (SSL/TLS termination)
 
 
 
  
  
  
  Next.js Web   Spring Boot 
  (EC2 ASG)   API (EC2) 
  Node.js 20+   Java 21 
  Port 3000   Port 8080 
  
  
 
 
 
   
   
   
  RDS   Redis   Kafka 
 PostgreSQL  (Cache)   (MSK) 
  Multi-AZ     
   
 
 
 
  S3 Buckets 
  (Assets/Logs) 
 

 
  Background Services (EC2) 
 
  - Kafka Consumers (async processing) 
  - Scheduled Jobs (payment retries) 
  - Notification Service (push/email) 
  - Geo-fence Monitoring 
 

 
  External Integrations 
 
  - Stripe (payments) 
  - Twilio/SNS (SMS) 
  - SendGrid/SES (email) 
  - OneSignal (push notifications) 
 
```

---

## 2. INFRASTRUCTURE DESIGN (EC2-BASED)

### 2.1 VPC & Network Topology

**VPC Configuration:**
- **Region:** `us-east-1` (primary), `us-west-2` (DR, future)
- **CIDR:** 10.0.0.0/16
- **Availability Zones:** 3 (us-east-1a, us-east-1b, us-east-1c)

**Subnet Layout:**

| Subnet Type | CIDR | AZ | Purpose |
|-------------|------|-----|---------|
| Public-1a | 10.0.1.0/24 | us-east-1a | NAT Gateway, ALB |
| Public-1b | 10.0.2.0/24 | us-east-1b | NAT Gateway, ALB |
| Public-1c | 10.0.3.0/24 | us-east-1c | NAT Gateway, ALB |
| Private-App-1a | 10.0.11.0/24 | us-east-1a | EC2 app instances |
| Private-App-1b | 10.0.12.0/24 | us-east-1b | EC2 app instances |
| Private-App-1c | 10.0.13.0/24 | us-east-1c | EC2 app instances |
| Private-Data-1a | 10.0.21.0/24 | us-east-1a | RDS, Redis, Kafka |
| Private-Data-1b | 10.0.22.0/24 | us-east-1b | RDS, Redis, Kafka |
| Private-Data-1c | 10.0.23.0/24 | us-east-1c | RDS, Redis, Kafka |

**Routing:**
- Public subnets: Route to Internet Gateway (IGW)
- Private subnets: Route to NAT Gateway (per AZ for HA)
- No direct internet access for app/data subnets

**Security Groups:**

| SG Name | Inbound Rules | Purpose |
|---------|--------------|---------|
| `alb-sg` | 443 (0.0.0.0/0), 80 (0.0.0.0/0) | ALB public access |
| `web-app-sg` | 3000 (from alb-sg) | Next.js instances |
| `api-app-sg` | 8080 (from alb-sg, web-app-sg) | Spring Boot API |
| `rds-sg` | 5432 (from api-app-sg, web-app-sg) | PostgreSQL |
| `redis-sg` | 6379 (from api-app-sg, web-app-sg) | Redis cache |
| `kafka-sg` | 9092 (from api-app-sg, bg-services-sg) | Kafka brokers |
| `bg-services-sg` | N/A (outbound only) | Background workers |

---

### 2.2 Compute: EC2 Auto Scaling Groups

#### 2.2.1 Spring Boot API (Java)

**Instance Configuration:**
- **Instance Type:** `c6i.xlarge` (4 vCPU, 8 GB RAM)  compute-optimized for API
- **AMI:** Amazon Linux 2023 (AL2023) or Ubuntu 22.04 LTS
- **Launch Template:**
 - User data script:
 - Install Java 21 (Corretto or OpenJDK)
 - Install CloudWatch agent
 - Install CodeDeploy agent
 - Configure IMDSv2 (require tokens)
 - IAM Instance Profile: `campcard-api-role` (see 2.7)
 - Security Group: `api-app-sg`

**Auto Scaling Group:**
- **Min:** 2 instances (HA across 2 AZs)
- **Desired:** 4 instances (normal load)
- **Max:** 20 instances (campaign peaks)
- **Health Check:** ELB + EC2 (grace period 300s)
- **Scaling Policies:**
 - **Scale Up:** CPU > 70% for 2 min  add 2 instances
 - **Scale Down:** CPU < 30% for 5 min  remove 1 instance
 - **Target Tracking:** Maintain 60% CPU utilization

**Deployment Strategy:**
- Blue/Green via CodeDeploy (see 2.5)
- Rolling updates with 25% batch size
- Health check: `/actuator/health` endpoint

#### 2.2.2 Next.js Web Portal (Node.js)

**Instance Configuration:**
- **Instance Type:** `t3.medium` (2 vCPU, 4 GB RAM)  burstable for web
- **AMI:** Amazon Linux 2023
- **Launch Template:**
 - User data:
 - Install Node.js 20+ (via nvm or yum)
 - Install PM2 (process manager)
 - Install CloudWatch agent
 - Install CodeDeploy agent
 - IAM Instance Profile: `campcard-web-role`
 - Security Group: `web-app-sg`

**Auto Scaling Group:**
- **Min:** 2 instances
- **Desired:** 3 instances
- **Max:** 10 instances
- **Health Check:** ELB + EC2
- **Scaling Policies:** Similar to API (CPU-based)

**Deployment:**
- Blue/Green via CodeDeploy
- Next.js built as standalone output (`output: 'standalone'` in next.config.js)
- PM2 manages Node process (`pm2 start server.js`)

#### 2.2.3 Background Services (Kafka Consumers)

**Instance Configuration:**
- **Instance Type:** `m6i.large` (2 vCPU, 8 GB RAM)  balanced for async jobs
- **AMI:** Amazon Linux 2023
- **Launch Template:**
 - User data:
 - Install Java 21 (for Kafka consumer JVM apps)
 - Install CloudWatch agent
 - IAM Instance Profile: `campcard-bg-services-role`
 - Security Group: `bg-services-sg`

**Auto Scaling Group:**
- **Min:** 2 instances (HA)
- **Desired:** 2 instances
- **Max:** 8 instances (scale with event volume)
- **Scaling Metric:** Kafka consumer lag (custom CloudWatch metric)

**Deployed Services:**
- `SubscriptionEventConsumer` (processes subscription_created, subscription_canceled)
- `RedemptionEventConsumer` (processes redemption_recorded)
- `NotificationService` (sends push, email, SMS)
- `PaymentRetryJob` (scheduled cron for failed payments)

---

### 2.3 Data Layer

#### 2.3.1 Amazon RDS for PostgreSQL

**Configuration:**
- **Engine:** PostgreSQL 16.x
- **Instance Class:** `db.r6i.2xlarge` (8 vCPU, 64 GB RAM)  memory-optimized
- **Storage:** 500 GB gp3 (16,000 IOPS, 1000 MB/s throughput)
- **Multi-AZ:** Enabled (synchronous replication to standby)
- **Read Replicas:** 2 replicas for read-heavy queries (dashboards, reporting)
- **Backups:**
 - Automated daily snapshots (35-day retention)
 - Point-in-time recovery (PITR) enabled
- **Parameter Group:**
 - `shared_preload_libraries = 'pg_stat_statements'` (query analytics)
 - `max_connections = 500`
 - `work_mem = 128MB`
- **Security:**
 - Encryption at rest (KMS key: `alias/campcard-rds`)
 - SSL/TLS required (`rds.force_ssl = 1`)
 - Security Group: `rds-sg`

**Connection Pooling:**
- App-side: HikariCP (Spring Boot default)
 - Max pool size: 20 per instance
 - Connection timeout: 30s
- Alternative: RDS Proxy (optional, reduces connection overhead)

**Tenant Isolation:**
- Row-Level Security (RLS) policies (see Part 1, Section 5.1)
- All queries scoped by `council_id`

#### 2.3.2 Amazon ElastiCache for Redis

**Configuration:**
- **Engine:** Redis 7.x
- **Node Type:** `cache.r6g.xlarge` (4 vCPU, 26.3 GB RAM)
- **Cluster Mode:** Enabled (sharded for scale)
 - 3 shards, 1 replica per shard (6 total nodes)
- **Multi-AZ:** Enabled (automatic failover)
- **Backups:** Daily snapshots (7-day retention)
- **Encryption:** At rest + in-transit (TLS)
- **Security Group:** `redis-sg`

**Use Cases:**
- Session storage (JWT token blacklist for logout)
- API rate limiting (token bucket per tenant/user)
- Offer browsing cache (TTL 5 min)
- Dashboard query cache (TTL 1 min)
- Geofence state (active geofences per user)

**Key Patterns:**
- `session:{user_id}`  JWT metadata
- `rate_limit:{tenant_id}:{endpoint}`  request count
- `offers:council:{council_id}`  serialized offer list
- `dashboard:scout:{scout_id}`  cached metrics

#### 2.3.3 Apache Kafka (Amazon MSK)

**Configuration:**
- **Service:** Amazon MSK (Managed Streaming for Kafka)
- **Version:** Kafka 3.6.x
- **Cluster Type:** Provisioned (for predictable performance)
- **Broker Nodes:** 3 brokers (1 per AZ)
- **Broker Type:** `kafka.m5.large` (2 vCPU, 8 GB RAM)
- **Storage:** 500 GB per broker (EBS gp3)
- **Replication Factor:** 3 (in-sync replicas ISR = 2)
- **Security:**
 - IAM authentication (no plaintext passwords)
 - Encryption in-transit (TLS)
 - Encryption at rest (EBS encryption)
- **Security Group:** `kafka-sg`

**Alternative (Self-Hosted on EC2):**
- If MSK not preferred, deploy Kafka on EC2:
 - 3 broker instances (`m6i.large`)
 - ZooKeeper ensemble (3 nodes) or KRaft mode
 - Monitoring via Prometheus + Grafana

**Topics:**

| Topic Name | Partitions | Retention | Purpose |
|------------|------------|-----------|---------|
| `subscription-events` | 12 | 7 days | subscription_created, subscription_canceled, subscription_renewed |
| `referral-events` | 6 | 30 days | referral_click, referral_conversion, referral_attributed |
| `redemption-events` | 12 | 7 days | redemption_recorded, redemption_validated |
| `notification-events` | 6 | 3 days | notification_sent, geofence_entered |
| `audit-events` | 3 | 90 days | All admin actions, PII access |
| `payment-events` | 6 | 30 days | payment_success, payment_failed, payment_refunded |

**Partitioning Strategy:**
- Key: `council_id` (ensures all events for a council go to same partition, ordering preserved)
- Allows parallel processing per council

**Consumer Groups:**
- `subscription-processor-group`  SubscriptionEventConsumer
- `notification-service-group`  NotificationService
- `analytics-group`  Data warehouse sync (future)

---

### 2.4 Application Load Balancer (ALB)

**Configuration:**
- **Scheme:** Internet-facing
- **Subnets:** Public-1a, Public-1b, Public-1c
- **Security Group:** `alb-sg`
- **Listeners:**
 - **HTTP (80):** Redirect to HTTPS 443
 - **HTTPS (443):** SSL/TLS with ACM certificate (`*.campcard.app`)

**Target Groups:**

| Target Group | Protocol | Port | Health Check Path | Stickiness |
|--------------|----------|------|-------------------|------------|
| `api-tg` | HTTP | 8080 | `/actuator/health` | None (stateless) |
| `web-tg` | HTTP | 3000 | `/api/health` | Session cookie (1 hour) |

**Routing Rules (Path-Based):**
- `/api/*`  `api-tg` (Spring Boot)
- `/actuator/*`  `api-tg` (Spring Boot actuator)
- `/*`  `web-tg` (Next.js catch-all)

**SSL/TLS:**
- Certificate: AWS Certificate Manager (ACM) wildcard cert for `*.campcard.app`
- Security Policy: `ELBSecurityPolicy-TLS-1-2-2017-01` (TLS 1.2+)

**Access Logs:**
- Enabled, stored in S3: `s3://campcard-alb-logs/`

---

### 2.5 CI/CD Pipeline (CodePipeline + CodeDeploy)

#### 2.5.1 Pipeline Architecture

```
   
 GitHub  CodeBuild  S3 Bucket  CodeDeploy 
 (Source)   (Build)   (Artifacts)   (Deploy) 
   
  
  
  
  
  Tests   EC2 ASG 
  Unit + Integ   Blue/Green 
  
```

#### 2.5.2 Spring Boot API Pipeline

**Source Stage:**
- **Repository:** GitHub `bsa/campcard-api` (private)
- **Trigger:** Push to `main` branch or pull request merge
- **Webhook:** GitHub webhook  CodePipeline

**Build Stage (CodeBuild):**
- **Build Spec:** `buildspec.yml`
 ```yaml
 version: 0.2
 phases:
 install:
 runtime-versions:
 java: corretto21
 pre_build:
 commands:
 - echo "Running tests..."
 - ./mvnw clean test
 build:
 commands:
 - echo "Building JAR..."
 - ./mvnw package -DskipTests
 post_build:
 commands:
 - echo "Build complete"
 artifacts:
 files:
 - target/campcard-api.jar
 - appspec.yml
 - scripts/**/*
 cache:
 paths:
 - '/root/.m2/**/*'
 ```
- **Output:** JAR file + deployment scripts  S3

**Test Stage:**
- Unit tests (via Maven Surefire)
- Integration tests (Testcontainers + PostgreSQL)
- Code coverage (JaCoCo, min 70%)
- SonarQube analysis (optional)

**Deploy Stage (CodeDeploy):**
- **Deployment Group:** `api-prod-dg`
- **Target:** Auto Scaling Group `api-asg`
- **Strategy:** Blue/Green
 - New ASG created with updated instances
 - Traffic shifted via ALB target group swap
 - Old ASG terminated after 1 hour bake time
- **Lifecycle Hooks:**
 - `ApplicationStop`  Graceful shutdown (drain connections)
 - `ApplicationStart`  Start Spring Boot app
 - `ValidateService`  Health check `/actuator/health`

**AppSpec File (`appspec.yml`):**
```yaml
version: 0.0
os: linux
files:
 - source: target/campcard-api.jar
 destination: /opt/campcard-api/
hooks:
 ApplicationStop:
 - location: scripts/stop_server.sh
 timeout: 300
 BeforeInstall:
 - location: scripts/install_dependencies.sh
 timeout: 300
 ApplicationStart:
 - location: scripts/start_server.sh
 timeout: 300
 ValidateService:
 - location: scripts/validate_service.sh
 timeout: 300
```

**Deployment Scripts:**
- `stop_server.sh`: `systemctl stop campcard-api`
- `start_server.sh`: `systemctl start campcard-api`
- `validate_service.sh`: `curl -f http://localhost:8080/actuator/health`

#### 2.5.3 Next.js Web Pipeline

**Build Stage:**
- **Build Spec:**
 ```yaml
 version: 0.2
 phases:
 install:
 runtime-versions:
 nodejs: 20
 pre_build:
 commands:
 - npm ci
 - npm run lint
 - npm run test
 build:
 commands:
 - npm run build
 artifacts:
 files:
 - .next/**/*
 - public/**/*
 - package.json
 - server.js
 - appspec.yml
 - scripts/**/*
 ```

**Deploy Stage:**
- Same CodeDeploy blue/green pattern
- PM2 manages Node process: `pm2 start server.js --name campcard-web`

#### 2.5.4 Environment Promotion

**Environments:**
1. **Dev:** Auto-deploy on every commit to `develop` branch
2. **Staging:** Auto-deploy on merge to `staging` branch
3. **Production:** Manual approval gate + deploy on merge to `main`

**Approval Gate (Production):**
- SNS notification to DevOps team
- Manual approval in CodePipeline console
- Deploys after approval

---

### 2.6 Static Assets & CDN

**S3 Buckets:**

| Bucket Name | Purpose | Lifecycle Policy |
|-------------|---------|------------------|
| `campcard-assets-prod` | Merchant logos, poster PDFs, QR codes | None (permanent) |
| `campcard-logs-prod` | ALB logs, app logs (JSON) | Delete after 90 days |
| `campcard-backups-prod` | Database exports, config backups | Glacier after 30 days |
| `campcard-artifacts-prod` | CodePipeline build artifacts | Delete after 30 days |

**CloudFront Distribution:**
- **Origin:** `campcard-assets-prod.s3.us-east-1.amazonaws.com`
- **Domain:** `cdn.campcard.app` (CNAME via Route 53)
- **SSL:** ACM certificate for `cdn.campcard.app`
- **Cache Behavior:**
 - TTL: 1 year for `/logos/*`, `/qr-codes/*`
 - TTL: 1 hour for `/posters/*`
- **Compression:** Gzip + Brotli enabled
- **Security:** OAI (Origin Access Identity) restricts S3 direct access

**Upload Flow:**
- Admin uploads merchant logo via web portal
- API uploads to S3: `s3://campcard-assets-prod/logos/{merchant_id}.png`
- Returns CloudFront URL: `https://cdn.campcard.app/logos/{merchant_id}.png`

---

### 2.7 IAM Roles & Secrets Management

#### 2.7.1 IAM Instance Profiles

**`campcard-api-role`:**
```json
{
 "Version": "2012-10-17",
 "Statement": [
 {
 "Effect": "Allow",
 "Action": [
 "secretsmanager:GetSecretValue"
 ],
 "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:campcard/api/*"
 },
 {
 "Effect": "Allow",
 "Action": [
 "s3:PutObject",
 "s3:GetObject"
 ],
 "Resource": "arn:aws:s3:::campcard-assets-prod/*"
 },
 {
 "Effect": "Allow",
 "Action": [
 "kafka:*"
 ],
 "Resource": "arn:aws:kafka:us-east-1:*:cluster/campcard-kafka/*"
 },
 {
 "Effect": "Allow",
 "Action": [
 "logs:CreateLogGroup",
 "logs:CreateLogStream",
 "logs:PutLogEvents"
 ],
 "Resource": "*"
 }
 ]
}
```

**`campcard-web-role`:**
- Similar to API role, no Kafka access

**`campcard-bg-services-role`:**
- Kafka consumer permissions
- SES send email permissions
- SNS publish (SMS)

#### 2.7.2 Secrets Manager

**Secrets Stored:**

| Secret Name | Value | Rotation |
|-------------|-------|----------|
| `campcard/api/db-password` | PostgreSQL master password | 90 days (auto) |
| `campcard/api/jwt-secret` | JWT signing key (HS256) | Manual |
| `campcard/api/stripe-api-key` | Stripe secret key | Manual |
| `campcard/api/sendgrid-api-key` | SendGrid API key | Manual |
| `campcard/api/redis-auth-token` | Redis AUTH token | 90 days |

**Access Pattern (Spring Boot):**
```java
// application.yml
spring:
 datasource:
 password: ${DB_PASSWORD} # Injected via env var from Secrets Manager

// Launch script
export DB_PASSWORD=$(aws secretsmanager get-secret-value \
 --secret-id campcard/api/db-password \
 --query SecretString --output text)
```

**Security:**
- Secrets encrypted with KMS key: `alias/campcard-secrets`
- IAM policies enforce least privilege (instance profile can only read its secrets)
- No secrets in source code, env files, or logs

#### 2.7.3 IMDSv2 Enforcement

**Requirement:** All EC2 instances MUST use Instance Metadata Service v2 (session-oriented)

**Launch Template Configuration:**
```json
{
 "MetadataOptions": {
 "HttpTokens": "required",
 "HttpPutResponseHopLimit": 1
 }
}
```

**Application Code:**
- AWS SDK automatically uses IMDSv2 when available
- No code changes needed

---

### 2.8 Monitoring & Observability

#### 2.8.1 CloudWatch Logs

**Log Groups:**

| Log Group | Source | Retention |
|-----------|--------|-----------|
| `/aws/ec2/campcard-api` | Spring Boot API (JSON logs) | 30 days |
| `/aws/ec2/campcard-web` | Next.js (JSON logs) | 30 days |
| `/aws/ec2/campcard-bg-services` | Background workers | 30 days |
| `/aws/rds/campcard-db/postgresql` | RDS slow queries | 7 days |
| `/aws/elasticache/campcard-redis` | Redis slow log | 7 days |

**Log Format (Structured JSON):**
```json
{
 "timestamp": "2025-12-23T10:15:30.123Z",
 "level": "INFO",
 "service": "campcard-api",
 "traceId": "a3f9x2b8...",
 "userId": "user-uuid",
 "councilId": 42,
 "message": "Subscription created",
 "metadata": {
 "subscriptionId": "sub-xyz",
 "scoutId": "scout-abc"
 }
}
```

**Log Aggregation:**
- CloudWatch Logs Insights for querying
- Export to S3 for long-term storage (optional)

#### 2.8.2 CloudWatch Metrics

**Custom Metrics (Published by App):**

| Metric Name | Dimensions | Purpose |
|-------------|------------|---------|
| `SubscriptionsCreated` | CouncilId, PlanId | Track conversion rate |
| `RedemptionsRecorded` | CouncilId, MerchantId | Offer usage |
| `ReferralConversions` | CouncilId, ScoutId | Attribution funnel |
| `APILatency` | Endpoint, Method | Performance tracking |
| `DatabaseConnections` | InstanceId | Connection pool health |
| `KafkaConsumerLag` | Topic, ConsumerGroup | Event processing backlog |

**AWS-Managed Metrics:**
- EC2: CPU, Network, Disk I/O
- RDS: Connections, Deadlocks, Replication Lag
- ALB: Request Count, Target Response Time, HTTP 5xx
- ElastiCache: Cache Hits, Evictions, CPU

#### 2.8.3 CloudWatch Dashboards

**Dashboard: System Health**
- ALB request rate and latency (p50, p95, p99)
- API error rate (4xx, 5xx)
- EC2 CPU and memory utilization
- RDS connections and replica lag
- Kafka consumer lag

**Dashboard: Business Metrics**
- Subscriptions created (last 24h, 7d, 30d)
- Redemptions recorded (by council, by merchant)
- Referral conversions (by scout)
- Revenue (estimated, by council)

**Dashboard: Tenant Health**
- Per-council request volume
- Per-council error rates
- Per-council active users

#### 2.8.4 Alarms

**Critical Alarms (PagerDuty/SNS):**
- API error rate > 5% for 5 minutes  Page on-call
- RDS CPU > 90% for 10 minutes  Page on-call
- ALB 5xx > 1% for 5 minutes  Page on-call
- Kafka consumer lag > 100,000 messages  Page on-call

**Warning Alarms (Slack/Email):**
- API latency p95 > 2s for 10 minutes
- EC2 Auto Scaling at max capacity
- RDS disk space < 20%

#### 2.8.5 Distributed Tracing (Optional, Recommended)

**Tool:** AWS X-Ray or Datadog APM

**Implementation:**
- Spring Boot: Add X-Ray SDK, instrument HTTP + DB calls
- Next.js: Add X-Ray middleware
- Kafka: Trace event publishing and consumption

**Trace Context Propagation:**
- `X-Trace-Id` header (UUID) generated at ALB
- Passed through all services (API  DB, API  Kafka)
- Logged in all log entries for correlation

---

### 2.9 Backup & Disaster Recovery

#### 2.9.1 RDS Backups

**Automated Backups:**
- Daily snapshots at 3 AM UTC (low-traffic window)
- 35-day retention
- PITR (Point-in-Time Recovery) enabled

**Manual Snapshots:**
- Before major releases (pre-deployment)
- Retained indefinitely (tagged `release-vX.Y.Z`)

**Cross-Region Replication:**
- Snapshot copy to `us-west-2` (DR region)  future
- RPO (Recovery Point Objective): < 24 hours
- RTO (Recovery Time Objective): < 4 hours

#### 2.9.2 Kafka Data Retention

**Topic Retention:**
- `audit-events`: 90 days (compliance)
- `payment-events`: 30 days (financial records)
- Other topics: 7 days (operational)

**Backup Strategy:**
- No explicit Kafka backups (replayable from RDS if needed)
- Critical events also logged to RDS for permanent storage

#### 2.9.3 Application Code & Infrastructure

**Source Code:**
- GitHub repository with branch protection
- All merges via pull requests (code review required)

**Infrastructure as Code:**
- Terraform or CloudFormation for VPC, EC2, RDS, etc.
- Version controlled in `bsa/campcard-infra` repo
- Apply via CI/CD (Terraform Cloud or CodePipeline)

**Secrets Backup:**
- Secrets Manager auto-replicates to us-west-2 (multi-region secret)

---

### 2.10 Cost Estimation (Monthly, Production)

**Assumptions:**
- 50K active users, 500 councils, 50K troops
- 1M API requests/day
- 10K subscriptions/day during campaigns

| Component | Quantity | Unit Cost | Monthly Cost |
|-----------|----------|-----------|--------------|
| **EC2 (API)** | 4 x c6i.xlarge (avg) | $0.17/hr | ~$490 |
| **EC2 (Web)** | 3 x t3.medium (avg) | $0.042/hr | ~$90 |
| **EC2 (BG Services)** | 2 x m6i.large | $0.096/hr | ~$140 |
| **RDS PostgreSQL** | db.r6i.2xlarge Multi-AZ | $1.20/hr | ~$870 |
| **RDS Read Replicas** | 2 x db.r6i.xlarge | $0.60/hr each | ~$870 |
| **ElastiCache Redis** | 6 nodes (cache.r6g.xlarge) | $0.295/hr/node | ~$1,275 |
| **MSK Kafka** | 3 brokers (kafka.m5.large) | $0.21/hr/broker | ~$455 |
| **ALB** | 1 ALB | $0.0225/hr + LCU | ~$50 |
| **S3 Storage** | 500 GB (assets) | $0.023/GB | ~$12 |
| **CloudFront** | 1 TB transfer | $0.085/GB | ~$85 |
| **Data Transfer (Out)** | 2 TB/month | $0.09/GB | ~$180 |
| **CloudWatch** | Logs + Metrics | Varies | ~$100 |
| **NAT Gateway** | 3 NAT Gateways | $0.045/hr each | ~$100 |
| **Secrets Manager** | 10 secrets | $0.40/secret | ~$4 |
| **Route 53** | 1 hosted zone | $0.50/zone | ~$1 |
| **ACM** | SSL certificates | Free | $0 |
| **Total** | | | **~$4,722/month** |

**Optimization Opportunities:**
- Use Reserved Instances (save 3060% on EC2/RDS)
- Right-size instances based on actual usage
- Use Savings Plans
- Archive old logs to S3 Glacier
- Use spot instances for non-critical background jobs (future)

---

## 3. DEPLOYMENT PATTERNS

### 3.1 Blue/Green Deployment (Zero Downtime)

**Process:**
1. **Blue Environment:** Current production (e.g., ASG with v1.0.0)
2. **Build:** CodeBuild creates new version (v1.1.0)
3. **Green Environment:** CodeDeploy creates new ASG with v1.1.0
4. **Health Check:** Validate all instances healthy (`/actuator/health`)
5. **Traffic Shift:** ALB target group swaps from Blue to Green (instant)
6. **Bake Time:** Monitor Green for 1 hour (CloudWatch alarms)
7. **Rollback (if needed):** Swap back to Blue target group (instant)
8. **Terminate Blue:** After successful bake, terminate old ASG

**Advantages:**
- Zero downtime
- Instant rollback
- No version mixing (all instances on same version)

### 3.2 Canary Deployment (Low-Risk Testing)

**Process:**
1. Deploy v1.1.0 to 10% of instances (e.g., 1 of 10)
2. Route 10% of traffic to canary instances
3. Monitor error rates, latency for 30 minutes
4. If healthy: gradually shift to 50%, then 100%
5. If unhealthy: route all traffic back to stable version

**Implementation:**
- ALB weighted target groups (90% Blue, 10% Green)
- CodeDeploy supports canary configs: `Canary10Percent30Minutes`

---

## 4. SECURITY ARCHITECTURE

### 4.1 Network Security

**Defense in Depth:**
1. **Perimeter:** WAF (Web Application Firewall) on CloudFront/ALB
 - Block SQL injection, XSS patterns
 - Rate limiting (1000 req/min per IP)
 - Geo-blocking (if needed)
2. **Network:** VPC with private subnets, no direct internet access
3. **Compute:** Security groups (least privilege, port-specific)
4. **Data:** Encryption at rest (EBS, RDS, S3, Redis, Kafka)
5. **Transport:** TLS 1.2+ everywhere (ALB, RDS, Redis, Kafka)

**Bastions / Jump Hosts:**
- No SSH access to app instances from internet
- Optional: AWS Systems Manager Session Manager (SSM) for maintenance
- No SSH keys stored on instances (use SSM for shell access)

### 4.2 Application Security

**OWASP Top 10 Mitigations:**
1. **Injection (SQL, NoSQL):** Parameterized queries (JPA/Hibernate)
2. **Broken Auth:** JWT with short expiry (15 min access, 7 day refresh)
3. **Sensitive Data Exposure:** TLS everywhere, secrets in Secrets Manager
4. **XXE:** Disable XML external entities in parsers
5. **Broken Access Control:** RBAC + tenant context in every query
6. **Security Misconfiguration:** Hardened AMIs, CIS benchmarks
7. **XSS:** React auto-escapes, CSP headers
8. **Insecure Deserialization:** Avoid deserializing untrusted data
9. **Known Vulnerabilities:** Dependabot, Snyk scans in CI/CD
10. **Insufficient Logging:** All sensitive actions logged to CloudWatch + Kafka

**Rate Limiting:**
- Redis-based token bucket (per user, per tenant, per IP)
- Limits:
 - Auth endpoints: 5 req/min per IP
 - API endpoints: 100 req/min per user
 - Admin endpoints: 50 req/min per admin

### 4.3 Data Privacy & Compliance

**PII Handling:**
- Scout PII minimized (first name, parent email only)
- Customer PII encrypted at rest (RDS encryption)
- PII redacted from logs (email  `e***@***.com`, phone  `***-***-1234`)
- Audit log for all PII access (who, when, what)

**COPPA Compliance (Youth):**
- No Scout email collection
- Parent email required for consent
- No behavioral tracking of Scouts
- No targeted advertising to minors

**GDPR-Ready (Future International):**
- Right to access: Export user data API
- Right to erasure: Delete account with cascade
- Data portability: JSON export of user data
- Consent management: Granular notification preferences

---

## 5. OPERATIONAL RUNBOOKS

### 5.1 Deployment Runbook

**Pre-Deployment Checklist:**
- [ ] All tests pass (unit, integration, e2e)
- [ ] Code review approved
- [ ] Security scan clean (Snyk, SonarQube)
- [ ] Database migrations reviewed (Flyway scripts)
- [ ] RDS snapshot created (manual, tagged with release)
- [ ] Feature flags configured (if new features)
- [ ] Rollback plan documented

**Deployment Steps:**
1. Merge PR to `main` branch
2. CodePipeline triggers automatically
3. Monitor CodeBuild logs
4. Approve production deployment (manual gate)
5. CodeDeploy blue/green starts
6. Monitor CloudWatch dashboards (error rate, latency)
7. Validate critical paths (sign-up, redemption, dashboard)
8. Bake time: 1 hour
9. If stable: Mark deployment successful
10. If issues: Trigger rollback (swap ALB target group)

**Post-Deployment:**
- Announce in Slack: `#deployments` channel
- Update changelog
- Monitor for 24 hours (escalate if issues)

### 5.2 Incident Response Runbook

**P1 (Critical Outage):**
1. Page on-call engineer (PagerDuty)
2. Create incident channel in Slack
3. Investigate: Check CloudWatch dashboards, logs, alarms
4. Mitigate: Rollback deployment, scale up capacity, failover DB
5. Communicate: Update status page, notify stakeholders
6. Resolve: Fix root cause, deploy hotfix
7. Post-mortem: Blameless retrospective, document learnings

**P2 (Degraded Performance):**
- Similar process, but 2-hour SLA vs. 30-min for P1

**Common Incident Scenarios:**
- **API 5xx Spike:** Check app logs  database issue?  Restart unhealthy instances
- **Database Overload:** Slow queries  Add read replicas, cache aggressive queries
- **Kafka Consumer Lag:** Scale up consumer ASG, optimize consumer logic
- **DDoS Attack:** Enable WAF rate limiting, block IPs, contact AWS Support

### 5.3 Database Migration Runbook

**Tool:** Flyway (versioned SQL migrations)

**Process:**
1. Developer writes migration: `V2__add_geofence_table.sql`
2. Test migration on local DB (Docker PostgreSQL)
3. Code review migration SQL
4. Deploy to staging: Flyway runs automatically on app startup
5. Validate staging schema
6. Deploy to production: Flyway runs on app startup
7. Monitor for schema errors (CloudWatch logs)

**Rollback:**
- Flyway does NOT support auto-rollback
- Manual rollback script: `V2_1__rollback_geofence_table.sql`
- Restore from snapshot if catastrophic failure

---

## 6. SCALABILITY & PERFORMANCE

### 6.1 Scaling Strategy

**Vertical Scaling (Compute):**
- Increase instance size (e.g., c6i.xlarge  c6i.2xlarge)
- Use for immediate capacity boost during campaigns

**Horizontal Scaling (Compute):**
- Auto Scaling Groups add instances based on CPU/memory
- Preferred for sustained load
- Max capacity: 20 API instances (handle 50K req/s)

**Database Scaling:**
- **Read-heavy:** Add read replicas (current: 2, max: 5)
- **Write-heavy:** Vertical scale (upgrade instance class)
- **Future:** Shard by `council_id` if single DB insufficient

**Caching:**
- Redis cache for hot data (offers, dashboards)
- Cache hit ratio target: 80%+
- Invalidation strategy: TTL + event-driven purge (on offer update)

### 6.2 Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| API latency (p95) | < 500ms | Fast user experience |
| API latency (p99) | < 1s | 99% of requests feel instant |
| Page load time (web) | < 2s | SEO + UX best practice |
| Database query time (p95) | < 100ms | Indexed queries, optimized |
| Offer redemption time | < 1s | Critical path for in-store use |
| Dashboard load time | < 1s | Cached queries, pre-aggregated |

**Load Testing:**
- Tool: JMeter or k6
- Scenario: 10K concurrent users, 1M req/hour
- Run quarterly and before major releases

---

## 7. MULTI-REGION CONSIDERATIONS (FUTURE)

**Current:** Single region (us-east-1)

**Future DR Strategy:**
- **Region:** us-west-2 (warm standby)
- **RDS:** Cross-region read replica (async replication)
- **S3:** Cross-region replication enabled
- **Failover:** Manual DNS cutover (Route 53 health checks)
- **RPO:** 5 minutes (replication lag)
- **RTO:** 1 hour (manual failover + DNS propagation)

**Active-Active (V3+):**
- Deploy to multiple regions
- Route 53 latency-based routing
- Data: Multi-region DB (Aurora Global Database) or DynamoDB Global Tables
- Complexity: Much higher, justify with global user base

---

**END OF PART 3**

**Next:** Part 4  Data Model & Attribution Logic
