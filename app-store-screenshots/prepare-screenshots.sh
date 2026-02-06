#!/bin/bash

# App Store Screenshot Preparation Script
# Resizes screenshots for all required iPhone sizes

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ORIGINALS_DIR="$SCRIPT_DIR/originals"
OUTPUT_67="$SCRIPT_DIR/6.7-inch"
OUTPUT_65="$SCRIPT_DIR/6.5-inch"
OUTPUT_55="$SCRIPT_DIR/5.5-inch"

# Create output directories if they don't exist
mkdir -p "$OUTPUT_67" "$OUTPUT_65" "$OUTPUT_55"

echo "=== App Store Screenshot Preparation ==="
echo ""
echo "Source: $ORIGINALS_DIR"
echo ""

# Check if originals directory has files
if [ -z "$(ls -A "$ORIGINALS_DIR" 2>/dev/null)" ]; then
    echo "ERROR: No files found in $ORIGINALS_DIR"
    echo ""
    echo "Please save your TestFlight screenshots to:"
    echo "  $ORIGINALS_DIR"
    echo ""
    echo "Recommended naming:"
    echo "  01-choose-plan.png"
    echo "  02-quantity-1-card.png"
    echo "  03-quantity-3-cards.png"
    echo "  04-quantity-5-cards.png"
    echo "  05-quantity-10-cards.png"
    exit 1
fi

# Process each PNG file
for file in "$ORIGINALS_DIR"/*.png "$ORIGINALS_DIR"/*.PNG; do
    [ -e "$file" ] || continue

    filename=$(basename "$file")
    echo "Processing: $filename"

    # Get original dimensions
    dims=$(sips -g pixelWidth -g pixelHeight "$file" | grep pixel)
    width=$(echo "$dims" | grep Width | awk '{print $2}')
    height=$(echo "$dims" | grep Height | awk '{print $2}')
    echo "  Original: ${width}x${height}"

    # Copy to 6.7" folder if already correct size
    if [ "$width" = "1290" ] && [ "$height" = "2796" ]; then
        echo "  6.7\" (1290x2796): Already correct size, copying..."
        cp "$file" "$OUTPUT_67/$filename"
    else
        echo "  6.7\" (1290x2796): Resizing..."
        sips -z 2796 1290 "$file" --out "$OUTPUT_67/$filename" >/dev/null
    fi

    # Create 6.5" version (1242x2688)
    echo "  6.5\" (1242x2688): Resizing..."
    sips -z 2688 1242 "$file" --out "$OUTPUT_65/$filename" >/dev/null

    # Create 5.5" version (1242x2208)
    echo "  5.5\" (1242x2208): Resizing..."
    sips -z 2208 1242 "$file" --out "$OUTPUT_55/$filename" >/dev/null

    echo ""
done

echo "=== Done! ==="
echo ""
echo "Screenshots ready for upload:"
echo "  6.7\" display: $OUTPUT_67"
echo "  6.5\" display: $OUTPUT_65"
echo "  5.5\" display: $OUTPUT_55"
echo ""
echo "Upload order for App Store Connect:"
echo "  1. Go to App Store Connect > Your App > iOS Screenshots"
echo "  2. Select 'iPhone 6.7\" Display' and upload from 6.7-inch folder"
echo "  3. Select 'iPhone 6.5\" Display' and upload from 6.5-inch folder"
echo "  4. Select 'iPhone 5.5\" Display' and upload from 5.5-inch folder"
