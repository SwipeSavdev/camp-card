#!/bin/bash
# Run backend locally with AWS RDS connection

export DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=campcard
export DB_USERNAME=campcard_app
export DB_PASSWORD=CampCardApp2024Secure
export REDIS_HOST=localhost
export REDIS_PORT=7002
export REDIS_PASSWORD=devpassword
export JWT_SECRET=bsa-camp-card-super-secret-jwt-key-2025-that-is-very-long-and-secure

./mvnw spring-boot:run -Dspring-boot.run.profiles=local-rds
