#!/bin/bash
# ============================================================================
# Camp Card - EC2 Deployment Script
# ============================================================================
# This script is executed on the EC2 instance during deployment
# It handles Docker container orchestration with docker-compose
# ============================================================================

set -e

# Configuration
DEPLOY_DIR="/home/ubuntu/campcard"
COMPOSE_FILE="docker-compose-aws.yml"
ENV_FILE=".env"

echo "============================================"
echo "Camp Card EC2 Deployment"
echo "Started at: $(date)"
echo "============================================"

cd "$DEPLOY_DIR"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found!"
    echo "Please create the .env file with required environment variables."
    echo "See .env.example for reference."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo ""
echo "=== Stopping existing containers ==="
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true

echo ""
echo "=== Pulling latest images ==="
docker compose -f "$COMPOSE_FILE" pull || true

echo ""
echo "=== Starting containers ==="
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "=== Waiting for services to be healthy ==="
sleep 10

# Health check loop
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Health check attempt $ATTEMPT/$MAX_ATTEMPTS..."

    # Check backend health
    BACKEND_HEALTH=$(curl -sf http://localhost:7010/actuator/health/liveness 2>/dev/null || echo "unhealthy")

    if echo "$BACKEND_HEALTH" | grep -q "UP"; then
        echo "Backend is healthy!"
        break
    fi

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "WARNING: Backend did not become healthy within timeout"
        echo "Continuing anyway - check logs with: docker logs campcard-backend"
    fi

    ATTEMPT=$((ATTEMPT + 1))
    sleep 10
done

echo ""
echo "=== Container Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Cleaning up old images ==="
docker image prune -f

echo ""
echo "============================================"
echo "Deployment completed at: $(date)"
echo "============================================"
echo ""
echo "Services available at:"
echo "  - Backend API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_EC2_IP'):7010"
echo "  - Web Portal:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_EC2_IP'):7020"
echo ""
