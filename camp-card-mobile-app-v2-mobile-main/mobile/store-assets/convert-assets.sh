#!/bin/bash

# Store Assets Conversion Script
# Converts SVG templates to PNG format for app store submission
#
# Prerequisites:
#   macOS: brew install librsvg imagemagick
#   Linux: apt-get install librsvg2-bin imagemagick
#
# Usage: ./convert-assets.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/output"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Camp Card Store Assets Generator${NC}"
echo -e "${GREEN}========================================${NC}"

# Check for required tools
check_tool() {
    if command -v $1 &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

echo ""
echo "Checking required tools..."
RSVG_AVAILABLE=false
CONVERT_AVAILABLE=false

if check_tool "rsvg-convert"; then
    RSVG_AVAILABLE=true
fi

if check_tool "convert"; then
    CONVERT_AVAILABLE=true
fi

if [ "$RSVG_AVAILABLE" = false ] && [ "$CONVERT_AVAILABLE" = false ]; then
    echo ""
    echo -e "${RED}Error: No SVG conversion tool found.${NC}"
    echo "Please install one of the following:"
    echo "  macOS: brew install librsvg"
    echo "  Linux: apt-get install librsvg2-bin"
    exit 1
fi

# Create output directories
echo ""
echo "Creating output directories..."
mkdir -p "$OUTPUT_DIR/ios/screenshots"
mkdir -p "$OUTPUT_DIR/android/screenshots"
mkdir -p "$OUTPUT_DIR/icons/ios"
mkdir -p "$OUTPUT_DIR/icons/android"
mkdir -p "$OUTPUT_DIR/promotional"

# Function to convert SVG to PNG
convert_svg() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"

    if [ "$RSVG_AVAILABLE" = true ]; then
        rsvg-convert -w "$width" -h "$height" "$input" -o "$output"
    else
        convert -background none -resize "${width}x${height}" "$input" "$output"
    fi
}

# ============================================
# iOS Screenshots (6.5" display: 1284x2778)
# ============================================
echo ""
echo -e "${YELLOW}Converting iOS Screenshots (1284x2778)...${NC}"

for svg in "$SCRIPT_DIR/screenshots/ios"/*.svg; do
    if [ -f "$svg" ]; then
        filename=$(basename "$svg" .svg)
        echo "  Converting $filename..."
        convert_svg "$svg" "$OUTPUT_DIR/ios/screenshots/${filename}.png" 1284 2778
    fi
done

# ============================================
# Android Screenshots (1080x1920)
# ============================================
echo ""
echo -e "${YELLOW}Converting Android Screenshots (1080x1920)...${NC}"

for svg in "$SCRIPT_DIR/screenshots/android"/*.svg; do
    if [ -f "$svg" ]; then
        filename=$(basename "$svg" .svg)
        echo "  Converting $filename..."
        convert_svg "$svg" "$OUTPUT_DIR/android/screenshots/${filename}.png" 1080 1920
    fi
done

# ============================================
# App Icons - iOS sizes
# ============================================
echo ""
echo -e "${YELLOW}Converting iOS App Icons...${NC}"

IOS_ICON_SIZES=(
    "1024:App Store"
    "180:iPhone @3x"
    "120:iPhone @2x"
    "167:iPad Pro"
    "152:iPad @2x"
    "76:iPad @1x"
    "87:Settings @3x"
    "58:Settings @2x"
    "29:Settings @1x"
    "80:Spotlight @2x"
    "40:Spotlight @1x"
    "60:Notification @3x"
    "40:Notification @2x"
    "20:Notification @1x"
)

ICON_SVG="$SCRIPT_DIR/icons/app-icon-simple.svg"
if [ -f "$ICON_SVG" ]; then
    for size_info in "${IOS_ICON_SIZES[@]}"; do
        size="${size_info%%:*}"
        name="${size_info##*:}"
        echo "  Generating ${size}x${size} ($name)..."
        convert_svg "$ICON_SVG" "$OUTPUT_DIR/icons/ios/icon-${size}x${size}.png" "$size" "$size"
    done
else
    echo -e "  ${RED}Warning: app-icon-simple.svg not found${NC}"
fi

# ============================================
# App Icons - Android sizes
# ============================================
echo ""
echo -e "${YELLOW}Converting Android App Icons...${NC}"

ANDROID_ICON_SIZES=(
    "512:Play Store"
    "192:xxxhdpi"
    "144:xxhdpi"
    "96:xhdpi"
    "72:hdpi"
    "48:mdpi"
)

if [ -f "$ICON_SVG" ]; then
    for size_info in "${ANDROID_ICON_SIZES[@]}"; do
        size="${size_info%%:*}"
        name="${size_info##*:}"
        echo "  Generating ${size}x${size} ($name)..."
        convert_svg "$ICON_SVG" "$OUTPUT_DIR/icons/android/icon-${size}x${size}.png" "$size" "$size"
    done
fi

# ============================================
# Feature Graphics / Promotional
# ============================================
echo ""
echo -e "${YELLOW}Converting Promotional Graphics...${NC}"

# Feature graphic template (1024x500)
FEATURE_SVG="$SCRIPT_DIR/feature-graphics/feature-graphic-template.svg"
if [ -f "$FEATURE_SVG" ]; then
    echo "  Converting feature graphic (1024x500)..."
    convert_svg "$FEATURE_SVG" "$OUTPUT_DIR/promotional/feature-graphic-1024x500.png" 1024 500
fi

# Promotional banner
PROMO_SVG="$SCRIPT_DIR/promotional/promotional-banner-1024x500.svg"
if [ -f "$PROMO_SVG" ]; then
    echo "  Converting promotional banner (1024x500)..."
    convert_svg "$PROMO_SVG" "$OUTPUT_DIR/promotional/promotional-banner-1024x500.png" 1024 500
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Conversion Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Output location: $OUTPUT_DIR"
echo ""
echo "Generated assets:"
echo "  iOS Screenshots:      $(ls -1 "$OUTPUT_DIR/ios/screenshots" 2>/dev/null | wc -l | tr -d ' ') files"
echo "  Android Screenshots:  $(ls -1 "$OUTPUT_DIR/android/screenshots" 2>/dev/null | wc -l | tr -d ' ') files"
echo "  iOS Icons:            $(ls -1 "$OUTPUT_DIR/icons/ios" 2>/dev/null | wc -l | tr -d ' ') files"
echo "  Android Icons:        $(ls -1 "$OUTPUT_DIR/icons/android" 2>/dev/null | wc -l | tr -d ' ') files"
echo "  Promotional:          $(ls -1 "$OUTPUT_DIR/promotional" 2>/dev/null | wc -l | tr -d ' ') files"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review generated PNG files in $OUTPUT_DIR"
echo "2. Upload iOS screenshots to App Store Connect"
echo "3. Upload Android screenshots to Google Play Console"
echo "4. Replace app icons in your Expo project if needed"
