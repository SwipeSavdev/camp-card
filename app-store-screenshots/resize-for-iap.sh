#!/bin/bash

# Resize screenshots for In-App Purchase Review
# Required size: 640 x 920 pixels

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ORIGINALS_DIR="$SCRIPT_DIR/originals"
OUTPUT_DIR="$SCRIPT_DIR/iap-review"

mkdir -p "$OUTPUT_DIR"

echo "=== IAP Review Screenshot Preparation ==="
echo "Required size: 640 x 920 pixels"
echo ""

if [ -z "$(ls -A "$ORIGINALS_DIR" 2>/dev/null)" ]; then
    echo "ERROR: No files found in $ORIGINALS_DIR"
    echo ""
    echo "Please AirDrop your TestFlight screenshots to your Mac,"
    echo "then copy them to: $ORIGINALS_DIR"
    exit 1
fi

for file in "$ORIGINALS_DIR"/*.png "$ORIGINALS_DIR"/*.PNG "$ORIGINALS_DIR"/*.jpg "$ORIGINALS_DIR"/*.jpeg; do
    [ -e "$file" ] || continue

    filename=$(basename "$file")
    base="${filename%.*}"

    echo "Processing: $filename"

    # Resize to 640x920 for IAP review (will crop/fit as needed)
    sips -z 920 640 "$file" --out "$OUTPUT_DIR/${base}_iap.png" 2>/dev/null

    echo "  Created: ${base}_iap.png (640x920)"
done

echo ""
echo "=== Done! ==="
echo "IAP screenshots saved to: $OUTPUT_DIR"
echo ""
echo "Upload these to App Store Connect → In-App Purchases → [Product] → Review Information → Screenshot"
