#!/bin/bash
# ============================================================================
# Camp Card - Local Deploy to EC2 Script (Bash/WSL)
# ============================================================================
# This script deploys from your local machine to EC2
#
# Usage:
#   ./scripts/deploy-local.sh <ec2-host> [ec2-user] [pem-file]
#
# Example:
#   ./scripts/deploy-local.sh ec2-3-145-64-52.us-east-2.compute.amazonaws.com
# ============================================================================

set -e

# Arguments
EC2_HOST="${1}"
EC2_USER="${2:-ec2-user}"
PEM_FILE="${3:-$HOME/campcard-backend.pem}"

if [ -z "$EC2_HOST" ]; then
    echo "Usage: $0 <ec2-host> [ec2-user] [pem-file]"
    echo ""
    echo "Example:"
    echo "  $0 ec2-3-145-64-52.us-east-2.compute.amazonaws.com"
    exit 1
fi

echo "============================================"
echo "Camp Card - Deploy to EC2"
echo "============================================"
echo ""
echo "EC2 Host: $EC2_HOST"
echo "EC2 User: $EC2_USER"
echo "PEM File: $PEM_FILE"
echo ""

# Check PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "ERROR: PEM file not found: $PEM_FILE"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project Root: $PROJECT_ROOT"
echo ""

# Build Docker images
echo "=== Building Docker images ==="

echo "Building backend..."
docker build -t campcard-backend:latest "$PROJECT_ROOT/backend"

echo "Building web portal..."
docker build -t campcard-web:latest "$PROJECT_ROOT/camp-card-mobile-app-v2-web-main/repos/camp-card-web"

echo "Build complete!"
echo ""

# Save images to tar files
echo "=== Saving Docker images ==="
TEMP_DIR=$(mktemp -d)

docker save campcard-backend:latest -o "$TEMP_DIR/backend.tar"
docker save campcard-web:latest -o "$TEMP_DIR/web.tar"

echo "Images saved to $TEMP_DIR"
echo ""

# Copy files to EC2
echo "=== Copying files to EC2 ==="

# Create remote directory
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "mkdir -p /home/${EC2_USER}/campcard"

# Copy docker-compose file
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no "$PROJECT_ROOT/docker-compose-aws.yml" "${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/campcard/"

# Copy deployment script
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no "$PROJECT_ROOT/scripts/deploy-ec2.sh" "${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/campcard/"

# Copy Docker images
echo "Copying backend image (this may take a while)..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no "$TEMP_DIR/backend.tar" "${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/campcard/"

echo "Copying web image..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no "$TEMP_DIR/web.tar" "${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/campcard/"

echo "Files copied!"
echo ""

# Deploy on EC2
echo "=== Deploying on EC2 ==="

ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" << 'ENDSSH'
cd ~/campcard

echo "Loading Docker images..."
docker load -i backend.tar
docker load -i web.tar

echo "Cleaning up tar files..."
rm -f backend.tar web.tar

echo "Running deployment..."
chmod +x deploy-ec2.sh
./deploy-ec2.sh
ENDSSH

# Cleanup local temp files
echo ""
echo "=== Cleaning up ==="
rm -rf "$TEMP_DIR"

echo ""
echo "============================================"
echo "Deployment Complete!"
echo "============================================"
echo ""
echo "Access your application at:"
echo "  - Backend API: http://${EC2_HOST}:7010"
echo "  - Web Portal:  http://${EC2_HOST}:7020"
echo ""
