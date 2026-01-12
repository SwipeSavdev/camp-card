#!/bin/bash
# ============================================================================
# Camp Card - Manual Deployment Script
# ============================================================================
# Run this script to manually deploy to AWS EC2
# Usage: ./scripts/manual-deploy.sh
# ============================================================================

set -e

# Configuration
EC2_HOST="18.190.69.205"
EC2_USER="ubuntu"  # Change to ec2-user if using Amazon Linux
SSH_KEY="$HOME/.ssh/swipesavvy-prod-key.pem"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Camp Card - Manual Deployment${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    echo "Please ensure your SSH key is in place."
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection to $EC2_HOST...${NC}"
if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${RED}SSH connection failed. Trying ec2-user...${NC}"
    EC2_USER="ec2-user"
    if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${RED}ERROR: Cannot connect to EC2 instance${NC}"
        echo "Please check:"
        echo "  1. SSH key permissions (should be 600)"
        echo "  2. EC2 security group allows SSH from your IP"
        echo "  3. EC2 instance is running"
        exit 1
    fi
fi

echo -e "${GREEN}SSH connection successful!${NC}"
echo ""

# Build Docker images locally
echo -e "${YELLOW}Step 1: Building Docker images locally...${NC}"

# Build backend
echo "Building backend image..."
cd "$(dirname "$0")/../backend"
docker build -t campcard-backend:latest .

# Build web portal
echo "Building web portal image..."
cd "$(dirname "$0")/../camp-card-mobile-app-v2-web-main/repos/camp-card-web"
docker build -t campcard-web:latest .

echo -e "${GREEN}Docker images built successfully!${NC}"
echo ""

# Save and transfer images
echo -e "${YELLOW}Step 2: Saving and transferring images...${NC}"

cd "$(dirname "$0")/.."

# Save images to tar files
docker save campcard-backend:latest | gzip > /tmp/campcard-backend.tar.gz
docker save campcard-web:latest | gzip > /tmp/campcard-web.tar.gz

# Transfer to EC2
echo "Transferring backend image..."
scp -i "$SSH_KEY" /tmp/campcard-backend.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"

echo "Transferring web image..."
scp -i "$SSH_KEY" /tmp/campcard-web.tar.gz "$EC2_USER@$EC2_HOST:/tmp/"

# Transfer docker-compose and deploy script
echo "Transferring deployment files..."
scp -i "$SSH_KEY" docker-compose-aws.yml "$EC2_USER@$EC2_HOST:/home/$EC2_USER/campcard/"
scp -i "$SSH_KEY" scripts/deploy-ec2.sh "$EC2_USER@$EC2_HOST:/home/$EC2_USER/campcard/"

echo -e "${GREEN}Files transferred successfully!${NC}"
echo ""

# Deploy on EC2
echo -e "${YELLOW}Step 3: Deploying on EC2...${NC}"

ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /home/$USER/campcard

    echo "Loading Docker images..."
    gunzip -c /tmp/campcard-backend.tar.gz | docker load
    gunzip -c /tmp/campcard-web.tar.gz | docker load

    echo "Cleaning up tar files..."
    rm -f /tmp/campcard-backend.tar.gz /tmp/campcard-web.tar.gz

    echo "Stopping existing containers..."
    docker compose -f docker-compose-aws.yml down --remove-orphans || true

    echo "Starting containers..."
    docker compose -f docker-compose-aws.yml up -d

    echo "Waiting for services to start..."
    sleep 30

    echo "Container status:"
    docker ps

    echo "Backend health check:"
    curl -sf http://localhost:7010/actuator/health/liveness || echo "Backend starting..."
ENDSSH

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Services available at:"
echo "  - Backend API: http://$EC2_HOST:7010"
echo "  - Web Portal:  http://$EC2_HOST:7020"
echo "  - Swagger UI:  http://$EC2_HOST:7010/swagger-ui.html"
echo ""

# Cleanup local tar files
rm -f /tmp/campcard-backend.tar.gz /tmp/campcard-web.tar.gz
