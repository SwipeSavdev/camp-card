#  BSA Camp Card - Infrastructure

**Terraform Infrastructure as Code for AWS deployment**

![Terraform](https://img.shields.io/badge/Terraform-1.6+-purple.svg)
![AWS](https://img.shields.io/badge/AWS-EC2-orange.svg)

> **Note:** This is a standalone repository within a multi-repository architecture. The infrastructure provisions resources for all application components (backend, mobile, web).

---

## Overview

Complete AWS infrastructure provisioning for the BSA Camp Card Platform using Terraform:

-  VPC with multi-AZ deployment (3 availability zones)
-  EC2 Auto Scaling Groups for API and web servers
-  RDS PostgreSQL Multi-AZ for high availability
-  ElastiCache Redis cluster for caching
-  MSK Kafka for event streaming
-  Application Load Balancer with SSL/TLS
-  CloudFront CDN for static assets
- IAM roles, security groups, and secrets management

**Estimated Monthly Cost:** ~$4,700 (production)

---

## Quick Start

### Prerequisites

- Terraform 1.6+
- AWS CLI configured with credentials
- S3 bucket for Terraform state (create manually first)

### 1. Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify access
aws sts get-caller-identity
```

### 2. Create S3 Backend (One-Time Setup)

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
 --bucket campcard-terraform-state \
 --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
 --bucket campcard-terraform-state \
 --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
 --table-name terraform-state-lock \
 --attribute-definitions AttributeName=LockID,AttributeType=S \
 --key-schema AttributeName=LockID,KeyType=HASH \
 --billing-mode PAY_PER_REQUEST \
 --region us-east-1
```

### 3. Initialize Terraform

```bash
# Initialize Terraform (downloads providers)
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive
```

### 4. Plan Infrastructure

```bash
# Create execution plan
terraform plan -var-file=prod.tfvars -out=tfplan

# Review changes before applying
```

### 5. Apply Infrastructure

```bash
# Apply changes
terraform apply tfplan

# Or apply directly (with approval prompt)
terraform apply -var-file=prod.tfvars
```

### 6. Verify Deployment

```bash
# Show outputs
terraform output

# Get specific output
terraform output vpc_id
terraform output alb_dns_name
```

---

##  Project Structure

```
infrastructure/
 environments/
  dev.tfvars # Development variables
  staging.tfvars # Staging variables
  prod.tfvars # Production variables
 modules/ # Reusable Terraform modules
  vpc/
   main.tf
   variables.tf
   outputs.tf
  ec2/
  rds/
  elasticache/
  kafka/
 vpc.tf # VPC configuration
 ec2.tf # EC2 Auto Scaling Groups
 rds.tf # PostgreSQL database
 elasticache.tf # Redis cluster
 msk.tf # Kafka cluster
 alb.tf # Application Load Balancer
 s3.tf # Storage buckets
 cloudfront.tf # CDN distribution
 iam.tf # IAM roles and policies
 security-groups.tf # Security group rules
 secrets.tf # Secrets Manager
 cloudwatch.tf # Monitoring and alarms
 route53.tf # DNS records
 variables.tf # Input variables
 outputs.tf # Output values
 backend.tf # Terraform backend config
 providers.tf # Provider configurations
 .gitignore
 README.md
```

---

##  Configuration

### Environment Variables

Create `prod.tfvars`:

```hcl
# General
environment = "prod"
aws_region = "us-east-1"
project = "campcard"

# VPC
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# EC2
api_instance_type = "c6i.xlarge"
api_min_size = 2
api_max_size = 10
api_desired_size = 3

web_instance_type = "t3.medium"
web_min_size = 2
web_max_size = 6
web_desired_size = 2

# RDS
db_instance_class = "db.r6i.2xlarge"
db_allocated_storage = 500
db_multi_az = true
db_backup_retention = 7

# ElastiCache
redis_node_type = "cache.r6g.xlarge"
redis_num_nodes = 3

# MSK Kafka
kafka_instance_type = "kafka.m5.large"
kafka_brokers = 3

# Domain
domain_name = "campcard.org"
```

### Backend Configuration

```hcl
# backend.tf
terraform {
 backend "s3" {
 bucket = "campcard-terraform-state"
 key = "prod/terraform.tfstate"
 region = "us-east-1"
 encrypt = true
 dynamodb_table = "terraform-state-lock"
 }
}
```

---

##  Infrastructure Components

### 1. VPC & Networking

- **VPC:** 10.0.0.0/16 CIDR
- **Public Subnets:** 3 subnets (ALB, NAT Gateways)
- **Private App Subnets:** 3 subnets (EC2 instances)
- **Private Data Subnets:** 3 subnets (RDS, Redis, Kafka)
- **NAT Gateways:** 3 (one per AZ for HA)
- **Internet Gateway:** 1

### 2. Compute (EC2)

**API Tier:**
- Instance Type: c6i.xlarge (4 vCPU, 8 GiB RAM)
- Auto Scaling: 2-10 instances
- Health Checks: ALB target group

**Web Tier:**
- Instance Type: t3.medium (2 vCPU, 4 GiB RAM)
- Auto Scaling: 2-6 instances

**Background Workers:**
- Instance Type: m6i.large (2 vCPU, 8 GiB RAM)
- Auto Scaling: 1-4 instances

### 3. Database (RDS PostgreSQL)

- Engine: PostgreSQL 16.x
- Instance: db.r6i.2xlarge (8 vCPU, 64 GiB RAM)
- Storage: 500 GB gp3 SSD
- Multi-AZ: Enabled
- Backups: 7-day retention
- Encryption: At rest + in transit

### 4. Cache (ElastiCache Redis)

- Engine: Redis 7.x
- Node Type: cache.r6g.xlarge (4 vCPU, 13 GiB RAM)
- Cluster Mode: Enabled (3 shards)
- Replicas: 1 per shard
- Encryption: At rest + in transit

### 5. Streaming (MSK Kafka)

- Kafka Version: 3.6
- Brokers: 3 (one per AZ)
- Instance Type: kafka.m5.large
- Storage: 1 TB per broker

### 6. Load Balancer (ALB)

- Listeners: HTTP (80)  HTTPS redirect, HTTPS (443)
- SSL Certificate: ACM managed
- Health Checks: `/actuator/health`
- Stickiness: Enabled (cookie-based)

### 7. CDN (CloudFront)

- Origins: S3 bucket (static assets), ALB (dynamic content)
- SSL Certificate: ACM managed
- Cache Behaviors: Static assets (1-year TTL)
- Geo Restriction: None

---

##  Cost Breakdown

**Production Environment (~$4,700/month):**

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **EC2 (API)** | 3x c6i.xlarge (On-Demand) | ~$550 |
| **EC2 (Web)** | 2x t3.medium (On-Demand) | ~$120 |
| **EC2 (Workers)** | 2x m6i.large (On-Demand) | ~$280 |
| **RDS PostgreSQL** | db.r6i.2xlarge Multi-AZ | ~$1,400 |
| **ElastiCache Redis** | cache.r6g.xlarge x3 (cluster) | ~$550 |
| **MSK Kafka** | 3x kafka.m5.large | ~$900 |
| **ALB** | Standard pricing | ~$25 |
| **NAT Gateways** | 3x NAT Gateway | ~$100 |
| **S3** | 1 TB storage + requests | ~$25 |
| **CloudFront** | 1 TB data transfer | ~$85 |
| **Data Transfer** | Out to internet | ~$90 |
| **CloudWatch** | Logs + metrics | ~$50 |
| **Secrets Manager** | 10 secrets | ~$5 |
| **Route 53** | Hosted zone + queries | ~$1 |
| **Backup** | RDS snapshots | ~$50 |
| **Other** | Elastic IPs, etc. | ~$25 |
| **Total** | | **~$4,700** |

**Cost Optimization Tips:**
- Use Reserved Instances (1-year) for 30% savings
- Use Spot Instances for background workers (70% savings)
- Enable S3 Intelligent-Tiering
- Use RDS Graviton instances (10% savings)

---

##  Security

### Network Security

- Private subnets for all data tier resources
- Security groups with least privilege
- VPC endpoints for AWS services (no internet routing)
- IMDSv2 enforcement on EC2 instances

### Data Security

- Encryption at rest (RDS, Redis, S3, EBS)
- Encryption in transit (TLS 1.3 everywhere)
- Secrets stored in AWS Secrets Manager
- Automatic secret rotation (90 days)

### Access Control

- IAM instance profiles (no long-term credentials)
- MFA required for production access
- Audit logging to CloudTrail
- VPC Flow Logs enabled

---

## Monitoring & Alarms

### CloudWatch Alarms

```hcl
# High CPU utilization
resource "aws_cloudwatch_metric_alarm" "api_cpu_high" {
 alarm_name = "campcard-api-cpu-high"
 comparison_operator = "GreaterThanThreshold"
 evaluation_periods = 2
 metric_name = "CPUUtilization"
 namespace = "AWS/EC2"
 period = 300
 statistic = "Average"
 threshold = 80
 alarm_actions = [aws_sns_topic.alerts.arn]
}

# Database connections
resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
 alarm_name = "campcard-rds-connections-high"
 comparison_operator = "GreaterThanThreshold"
 evaluation_periods = 2
 metric_name = "DatabaseConnections"
 namespace = "AWS/RDS"
 period = 300
 statistic = "Average"
 threshold = 200
 alarm_actions = [aws_sns_topic.alerts.arn]
}
```

### Dashboards

- EC2 instance health
- RDS performance insights
- Redis cache hit rate
- Kafka consumer lag
- ALB request/error rates

---

##  Deployment

### Deploy to Development

```bash
terraform workspace select dev || terraform workspace new dev
terraform apply -var-file=environments/dev.tfvars
```

### Deploy to Staging

```bash
terraform workspace select staging || terraform workspace new staging
terraform apply -var-file=environments/staging.tfvars
```

### Deploy to Production

```bash
terraform workspace select prod || terraform workspace new prod
terraform plan -var-file=environments/prod.tfvars -out=tfplan
# Review plan carefully
terraform apply tfplan
```

### Destroy Infrastructure

```bash
# WARNING: This will delete all resources!
terraform destroy -var-file=environments/dev.tfvars
```

---

##  Updates & Maintenance

### Update Infrastructure

```bash
# Make changes to .tf files
vim vpc.tf

# Plan changes
terraform plan -var-file=prod.tfvars

# Apply changes
terraform apply -var-file=prod.tfvars
```

### Upgrade Terraform Version

```bash
# Update required_version in providers.tf
terraform init -upgrade
```

### Refresh State

```bash
terraform refresh -var-file=prod.tfvars
```

---

##  Contributing

### Code Style

- Use consistent naming: `campcard-{resource}-{env}`
- Add tags to all resources
- Document all variables
- Use modules for reusable components

### Commit Convention

```
feat(ec2): add auto-scaling based on CPU metrics

Implements dynamic scaling for API tier.

Closes #456
```

---

##  Support

**Documentation:** See `/docs` in main repository
**Issues:** GitHub Issues
**Slack:** #devops
**Email:** devops-team@campcard.org

---

##  License

**UNLICENSED** - Proprietary
Copyright  2025 Boy Scouts of America
