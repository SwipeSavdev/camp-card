#!/bin/bash

# Camp Card Screenshot Capture Script
# Run this while the iOS Simulator has the app open

OUTPUT_DIR="./store-assets/screenshots"
mkdir -p "$OUTPUT_DIR"

echo "📸 Camp Card Screenshot Capture"
echo "================================"
echo ""
echo "Instructions:"
echo "1. Open the Camp Card app in iOS Simulator"
echo "2. Navigate to each screen and press Enter to capture"
echo ""

# Get booted simulator
DEVICE=$(xcrun simctl list devices | grep Booted | head -1 | sed 's/.*(\([^)]*\)).*/\1/')

if [ -z "$DEVICE" ]; then
    echo "❌ No simulator is running. Start one with:"
    echo "   open -a Simulator"
    exit 1
fi

echo "✅ Found simulator: $DEVICE"
echo ""

# Screenshot function
capture() {
    local name=$1
    local filename="$OUTPUT_DIR/${name}.png"
    echo "📷 Capturing: $name"
    xcrun simctl io booted screenshot "$filename"
    echo "   Saved to: $filename"
    echo ""
}

# Capture sequence
echo "Navigate to HOME/DASHBOARD screen, then press Enter..."
read
capture "01_home_dashboard"

echo "Navigate to OFFERS LIST screen, then press Enter..."
read
capture "02_offers_list"

echo "Navigate to QR CODE / REDEMPTION screen, then press Enter..."
read
capture "03_qr_redemption"

echo "Navigate to MY CARDS / WALLET screen, then press Enter..."
read
capture "04_my_cards"

echo "Navigate to PROFILE screen, then press Enter..."
read
capture "05_profile"

echo ""
echo "✅ All screenshots captured!"
echo "📁 Location: $OUTPUT_DIR"
echo ""
echo "Screenshots saved:"
ls -la "$OUTPUT_DIR"
