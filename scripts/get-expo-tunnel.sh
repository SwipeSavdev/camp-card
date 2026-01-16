#!/bin/bash
# ============================================================================
# Get Expo Tunnel URL from AWS EC2 Deployment
# ============================================================================
# This script retrieves the Expo Go tunnel URL from the mobile container
# Usage: ./scripts/get-expo-tunnel.sh
# ============================================================================

set -e

# Load EC2 connection details from .env or environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if EC2_HOST and EC2_USER are set
if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ]; then
    echo "❌ Error: EC2_HOST and EC2_USER environment variables must be set"
    echo "   Add them to .env file or export them in your shell"
    exit 1
fi

# Check if SSH key exists
SSH_KEY="${EC2_SSH_KEY:-$HOME/.ssh/campcard.pem}"
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ Error: SSH key not found at $SSH_KEY"
    echo "   Set EC2_SSH_KEY environment variable to the correct path"
    exit 1
fi

echo "============================================"
echo "Camp Card - Expo Tunnel URL Retriever"
echo "============================================"
echo ""
echo "Connecting to EC2: $EC2_USER@$EC2_HOST"
echo ""

# SSH into EC2 and get the tunnel URL
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'ENDSSH'

echo "============================================"
echo "Mobile App Container Status"
echo "============================================"

# Check if container is running
if ! docker ps --filter "name=campcard-mobile" --format "{{.Names}}" | grep -q "campcard-mobile"; then
    echo "❌ Mobile container is not running"
    echo ""
    echo "Starting mobile container..."
    cd ~/campcard
    docker-compose -f docker-compose-aws.yml up -d campcard-mobile
    echo "⏳ Waiting 30 seconds for tunnel to establish..."
    sleep 30
fi

echo ""
echo "Container is running ✓"
echo ""

echo "============================================"
echo "Expo Tunnel URL"
echo "============================================"
echo ""

# Try to get ngrok tunnel URL from container
TUNNEL_URL=$(docker exec campcard-mobile curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$TUNNEL_URL" ]; then
    # Extract the exp:// URL for Expo Go
    EXP_URL=$(echo "$TUNNEL_URL" | sed 's|https://|exp://|' | sed 's|http://|exp://|')

    echo "✅ Tunnel is active!"
    echo ""
    echo "📱 Expo Go URL:"
    echo "   $EXP_URL"
    echo ""
    echo "🌐 Web URL:"
    echo "   $TUNNEL_URL"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "To test the app:"
    echo "1. Install 'Expo Go' from App Store or Google Play"
    echo "2. Open Expo Go app"
    echo "3. Enter this URL: $EXP_URL"
    echo "   OR open the camera and scan the QR code from logs"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo "⚠️  Tunnel URL not yet available"
    echo ""
    echo "The container may still be starting up."
    echo "Wait 1-2 minutes and try again."
    echo ""
    echo "You can also check the logs directly:"
    echo "  docker logs campcard-mobile --tail 50"
    echo ""
    echo "Recent logs:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker logs campcard-mobile --tail 30 2>&1 | grep -A 5 -i "tunnel\|metro\|expo" || echo "No tunnel info in logs yet"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "============================================"
echo "Backend API Status"
echo "============================================"

# Check backend health
if curl -sf http://localhost:7010/actuator/health/liveness > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
    echo "   http://$EC2_HOST:7010"
else
    echo "⚠️  Backend API not responding"
fi

echo ""

ENDSSH

echo ""
echo "============================================"
echo "Done!"
echo "============================================"
