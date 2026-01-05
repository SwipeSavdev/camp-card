#!/bin/sh
# ============================================================================
# Expo Development Server Startup Script
# ============================================================================
# This script starts Expo and prints the tunnel URL for testers to connect

echo "============================================"
echo "Camp Card Mobile - Expo Development Server"
echo "============================================"
echo ""
echo "Starting Expo in tunnel mode..."
echo "Please wait for the tunnel to be ready..."
echo ""

# Start Expo in the background
npx expo start --tunnel &
EXPO_PID=$!

# Wait for tunnel to be ready
sleep 30

# Try to get the tunnel URL from ngrok
echo ""
echo "============================================"
echo "TUNNEL URL FOR TESTERS"
echo "============================================"

# Get ngrok tunnel URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "Expo Tunnel URL: $NGROK_URL"
    echo ""
    echo "To test the app:"
    echo "1. Install 'Expo Go' app on your phone"
    echo "2. Open Expo Go and enter the URL above"
    echo "   OR scan this in Expo Go app"
    echo ""
else
    echo ""
    echo "Tunnel URL not yet available."
    echo "The app is running - check 'docker logs campcard-mobile' for updates"
    echo ""
    echo "Alternative: Use LAN mode if on same network"
    echo "Metro Bundler: http://$(hostname -i):8081"
    echo ""
fi

echo "============================================"
echo "API Backend: $EXPO_PUBLIC_API_BASE_URL"
echo "============================================"
echo ""

# Wait for Expo process
wait $EXPO_PID
