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
    # Save all artifacts (briefs, plans, handoffs, logs)
    cp -r "$LATEST" "$RESULTS/$ID/artifacts"

    # Collect working-tree files created/modified by the workflow.
    # The implement node writes to paths decided by prd.md/plan.md —
    # there's no fixed output path. Use git to find everything new.
    git diff --name-only --diff-filter=ACMR HEAD > /tmp/changed-files.txt 2>/dev/null
    git ls-files --others --exclude-standard >> /tmp/changed-files.txt 2>/dev/null

    if [ -s /tmp/changed-files.txt ]; then
      mkdir -p "$RESULTS/$ID/src"
      while IFS= read -r f; do
        mkdir -p "$RESULTS/$ID/src/$(dirname "$f")"
        cp "$f" "$RESULTS/$ID/src/$f" 2>/dev/null
      done < /tmp/changed-files.txt
      echo "=== Saved $(wc -l < /tmp/changed-files.txt) files to $RESULTS/$ID/src/ ==="
    fi

    # Also extract file list from plan.md for cross-reference
    if [ -f "$LATEST/plan.md" ]; then
      grep -E '^\s*-\s*\*\*File:\*\*' "$LATEST/plan.md" > "$RESULTS/$ID/planned-files.txt" 2>/dev/null
    fi

    echo "=== Saved: $RESULTS/$ID ==="
  else
    echo "=== WARNING: No artifacts found for $ID ==="
  fi

  # Clean working directory for next run
  git checkout -- . 2>/dev/null || true
  git clean -fd 2>/dev/null || true

  echo ""
done <<< "$PROMPTS"

echo "=== Batch complete. Results in: $RESULTS ==="
