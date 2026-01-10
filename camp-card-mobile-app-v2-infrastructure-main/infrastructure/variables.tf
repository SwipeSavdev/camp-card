variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "campcard"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6i.xlarge"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "campcard"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "campcard_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.r6g.large"
}

variable "redis_num_shards" {
  description = "Number of Redis shards"
  type        = number
  default     = 3
}

variable "redis_auth_token" {
  description = "Auth token for Redis (must be at least 16 characters)"
  type        = string
  sensitive   = true
}

variable "kafka_instance_type" {
  description = "MSK Kafka instance type"
  type        = string
  default     = "kafka.m5.large"
}

variable "kafka_num_brokers" {
  description = "Number of Kafka brokers"
  type        = number
  default     = 3
}

variable "api_instance_type" {
  description = "EC2 instance type for API servers"
  type        = string
  default     = "c6i.large"
}

variable "api_min_size" {
  description = "Minimum number of API instances"
  type        = number
  default     = 2
}

variable "api_max_size" {
  description = "Maximum number of API instances"
  type        = number
  default     = 6
}

variable "api_desired_size" {
  description = "Desired number of API instances"
  type        = number
  default     = 2
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "campcard.org"
}
