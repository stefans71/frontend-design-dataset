#!/bin/bash
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPONENTS_DIR="$(cd "$REPO_ROOT/.." && pwd)/output/assets/components"
OUT_DIR="$REPO_ROOT/public/screenshots"

mkdir -p "$OUT_DIR"

# Check for cwebp
if ! command -v cwebp &> /dev/null; then
  echo "Installing webp tools..."
  apt-get install -y webp 2>/dev/null || brew install webp 2>/dev/null || \
    echo "Please install webp tools: apt install webp"
  exit 1
fi

count=0
for dir in "$COMPONENTS_DIR"/component-*-run*/; do
  id=$(basename "$dir")

  # Desktop PNG -> WebP at 640px wide
  if [ -f "$dir/screenshot-desktop.png" ]; then
    cwebp -q 80 -resize 640 0 "$dir/screenshot-desktop.png" \
      -o "$OUT_DIR/${id}-desktop.webp" 2>/dev/null
    count=$((count + 1))
  fi

  # Mobile PNG -> WebP at 320px wide
  if [ -f "$dir/screenshot-mobile.png" ]; then
    cwebp -q 80 -resize 320 0 "$dir/screenshot-mobile.png" \
      -o "$OUT_DIR/${id}-mobile.webp" 2>/dev/null
    count=$((count + 1))
  fi
done

echo "Optimized $count images -> $OUT_DIR"
