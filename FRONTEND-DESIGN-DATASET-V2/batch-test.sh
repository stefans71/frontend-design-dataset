#!/bin/bash
# Batch test script — runs web-design-batch workflow for each prompt
# Usage: bash batch-test.sh base|finetuned
# Requires: pi running, llama-server on port 11434, web-design-batch.yaml in .pi/workflows/

MODEL=${1:-base}
HARNESS="/root/autodl-tmp/pi-harness-stable"
RESULTS="/root/autodl-tmp/batch-results/$MODEL"
PROMPTS_FILE="/root/autodl-tmp/frontend-design-dataset/output/validation/test-prompts.json"

mkdir -p "$RESULTS"

# Read prompts from test-prompts.json
PROMPTS=$(python3 -c "
import json
data = json.load(open('$PROMPTS_FILE'))
for p in data:
    print(p['id'] + '|||' + p['prompt'])
")

cd "$HARNESS"

while IFS= read -r line; do
  ID=$(echo "$line" | cut -d'|' -f1)
  PROMPT=$(echo "$line" | cut -d'|' -f4-)

  echo "=== Running: $ID ==="
  echo "Prompt: $PROMPT"

  # Run workflow
  pi -p "/workflow run web-design-batch $PROMPT"

  mkdir -p "$RESULTS/$ID"

  # Save workflow artifacts (briefs, plans, logs)
  LATEST=$(ls -td .pi/workflow-artifacts/web-design-batch-* 2>/dev/null | head -1)
  if [ -n "$LATEST" ]; then
    cp -r "$LATEST" "$RESULTS/$ID/artifacts"
  fi

  # Find index.html written by implement node
  if [ -f "$HARNESS/index.html" ]; then
    cp "$HARNESS/index.html" "$RESULTS/$ID/output.html"
    CHARS=$(wc -c < "$HARNESS/index.html")
    echo "=== Saved: $RESULTS/$ID/output.html ($CHARS chars) ==="
  elif [ -f "index.html" ]; then
    cp "index.html" "$RESULTS/$ID/output.html"
    CHARS=$(wc -c < "index.html")
    echo "=== Saved: $RESULTS/$ID/output.html ($CHARS chars) ==="
  else
    echo "=== WARNING: No index.html found for $ID — workflow may have failed ==="
  fi

  # Cleanup — remove all generated files for next run
  git checkout -- . 2>/dev/null || true
  git clean -fd 2>/dev/null || true

  echo ""
done <<< "$PROMPTS"

echo "=== Batch complete. Results in: $RESULTS ==="
