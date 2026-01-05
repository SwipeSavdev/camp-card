#!/bin/bash
# ============================================================================
# Camp Card - EC2 Initial Setup Script
# ============================================================================
# Run this script ONCE on a fresh EC2 instance to install Docker and
# configure the environment for Camp Card deployment.
#
# Usage:
#   chmod +x setup-ec2.sh
#   sudo ./setup-ec2.sh
# ============================================================================

set -e

echo "============================================"
echo "Camp Card EC2 Setup"
echo "Started at: $(date)"
echo "============================================"

# Update system
echo ""
echo "=== Updating system packages ==="
yum update -y

# Install Docker
echo ""
echo "=== Installing Docker ==="
yum install -y docker

# Start Docker service
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Install Docker Compose
echo ""
echo "=== Installing Docker Compose ==="
DOCKER_COMPOSE_VERSION="v2.24.5"
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Create symlink for 'docker compose' command
mkdir -p /usr/local/lib/docker/cli-plugins
ln -sf /usr/local/bin/docker-compose /usr/local/lib/docker/cli-plugins/docker-compose

# Install useful tools
echo ""
echo "=== Installing additional tools ==="
yum install -y git htop wget curl jq

# Create campcard directory
echo ""
echo "=== Creating application directory ==="
CAMPCARD_DIR="/home/ec2-user/campcard"
mkdir -p "$CAMPCARD_DIR"
chown ec2-user:ec2-user "$CAMPCARD_DIR"

# Create .env template
cat > "$CAMPCARD_DIR/.env.example" << 'EOF'
# ============================================================================
# Camp Card - AWS Environment Configuration
# ============================================================================
# Copy this file to .env and fill in your values
# ============================================================================

# Database (AWS RDS)
DB_HOST=your-rds-endpoint.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=campcard
DB_USERNAME=campcard_app
DB_PASSWORD=your_secure_password

# Redis
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your-very-long-secure-jwt-secret-at-least-256-bits

# Web Portal
PUBLIC_API_URL=http://your-ec2-public-ip:7010/api/v1
NEXTAUTH_URL=http://your-ec2-public-ip:7020
NEXTAUTH_SECRET=your-nextauth-secret-at-least-32-chars
EOF

chown ec2-user:ec2-user "$CAMPCARD_DIR/.env.example"

# Configure firewall (if using iptables)
echo ""
echo "=== Configuring firewall rules ==="
# Note: AWS Security Groups should handle this, but adding iptables rules as backup
iptables -I INPUT -p tcp --dport 7010 -j ACCEPT || true
iptables -I INPUT -p tcp --dport 7020 -j ACCEPT || true

# Set up log rotation for Docker
echo ""
echo "=== Configuring Docker log rotation ==="
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply log settings
systemctl restart docker

echo ""
echo "============================================"
echo "EC2 Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (for docker group to take effect)"
echo "   Or run: newgrp docker"
echo ""
echo "2. Configure environment:"
echo "   cd $CAMPCARD_DIR"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with your values"
echo ""
echo "3. Copy docker-compose-aws.yml to $CAMPCARD_DIR"
echo ""
echo "4. Start the application:"
echo "   docker compose -f docker-compose-aws.yml up -d"
echo ""
echo "Docker version:"
docker --version
echo ""
echo "Docker Compose version:"
docker compose version
echo ""
