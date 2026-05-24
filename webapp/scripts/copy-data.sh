#!/bin/bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_ROOT="$(cd "$REPO_ROOT/.." && pwd)/output"

echo "=== Copying dataset.sqlite ==="
cp "$DATA_ROOT/db/dataset.sqlite" "$REPO_ROOT/data/"

echo "=== Copying validation scores ==="
cp "$DATA_ROOT/validation/fine-tuned-scores.jsonl" "$REPO_ROOT/data/" 2>/dev/null || true
cp "$DATA_ROOT/validation/self-improve-scores.jsonl" "$REPO_ROOT/data/" 2>/dev/null || true

echo "=== Copying validation screenshots ==="
mkdir -p "$REPO_ROOT/public/screenshots/validation/fine-tuned"
mkdir -p "$REPO_ROOT/public/screenshots/validation/base"
for dir in fine-tuned base; do
  for png in "$DATA_ROOT/validation/$dir/"*-desktop.png; do
    [ -f "$png" ] || continue
    name=$(basename "$png" .png)
    cwebp -q 80 "$png" -o "$REPO_ROOT/public/screenshots/validation/$dir/${name}.webp" 2>/dev/null
  done
done

echo "=== Done. Run 'bun run optimize-images' next ==="
