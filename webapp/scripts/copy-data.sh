#!/bin/bash
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_ROOT="$(cd "$REPO_ROOT/.." && pwd)/output"

echo "=== Copying dataset.sqlite ==="
cp "$DATA_ROOT/db/dataset.sqlite" "$REPO_ROOT/data/"

echo "=== Copying validation scores ==="
cp "$DATA_ROOT/validation/fine-tuned-scores.jsonl" "$REPO_ROOT/data/" 2>/dev/null || true
cp "$DATA_ROOT/validation/self-improve-scores.jsonl" "$REPO_ROOT/data/" 2>/dev/null || true

echo "=== Done. Run 'bun run optimize-images' next ==="
