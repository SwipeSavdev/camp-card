#!/bin/bash
set -e

# AWS CodeDeploy Application Specification
# This script runs on EC2 instances during deployment

APPLICATION_DIR="/opt/campcard"
JAR_NAME="campcard.jar"
SERVICE_NAME="campcard"

echo "Starting deployment..."

# Stop existing application
echo "Stopping existing service..."
sudo systemctl stop $SERVICE_NAME || true

# Backup current version
if [ -f "$APPLICATION_DIR/$JAR_NAME" ]; then
 echo "Backing up current version..."
 sudo cp $APPLICATION_DIR/$JAR_NAME $APPLICATION_DIR/$JAR_NAME.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy new JAR
echo "Copying new application..."
sudo cp $JAR_NAME $APPLICATION_DIR/

# Set permissions
sudo chown campcard:campcard $APPLICATION_DIR/$JAR_NAME
sudo chmod 755 $APPLICATION_DIR/$JAR_NAME

# Update environment variables from AWS Secrets Manager
echo "Fetching secrets from AWS Secrets Manager..."
aws secretsmanager get-secret-value \
 --secret-id campcard/prod/app \
 --query SecretString \
 --output text | sudo tee $APPLICATION_DIR/.env > /dev/null

# Start application
echo "Starting service..."
sudo systemctl daemon-reload
sudo systemctl start $SERVICE_NAME
sudo systemctl enable $SERVICE_NAME

# Wait for health check
echo "Waiting for application to be healthy..."
for i in {1..30}; do
 if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
 echo "Application is healthy!"
 exit 0
 fi
 echo "Attempt $i/30: Waiting for health check..."
 sleep 10
done

echo "ERROR: Application failed to start"
exit 1
