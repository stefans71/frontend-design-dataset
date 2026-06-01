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

  # Find latest artifacts
  LATEST=$(ls -td .pi/workflow-artifacts/web-design-batch-* 2>/dev/null | head -1)

  if [ -n "$LATEST" ]; then
    mkdir -p "$RESULTS/$ID"
    cp -r "$LATEST" "$RESULTS/$ID/artifacts"
    # Copy any HTML output files
    find "$LATEST" -name "*.html" -exec cp {} "$RESULTS/$ID/" \;
    find . -name "index.html" -newer "$LATEST" -exec cp {} "$RESULTS/$ID/output.html" \; 2>/dev/null
    echo "=== Saved: $RESULTS/$ID ==="
  else
    echo "=== WARNING: No artifacts found for $ID ==="
  fi

  # Clean working directory for next run
  git checkout -- . 2>/dev/null || true

  echo ""
done <<< "$PROMPTS"

echo "=== Batch complete. Results in: $RESULTS ==="
