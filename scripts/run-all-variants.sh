#!/usr/bin/env bash
# 5-temperature variant run — 100 prompts × 5 runs = 500 component dirs
# Usage: bash scripts/run-all-variants.sh
# Run from: /root/autodl-tmp/frontend-design-dataset after source autodl-run.sh
#
# Launch via tmux on AutoDL:
#   tmux new-session -d -s fullrun -x 220 -y 50
#   tmux send-keys -t fullrun "cd /root/autodl-tmp/frontend-design-dataset && source autodl-run.sh && bash scripts/run-all-variants.sh 2>&1 | tee /tmp/fullrun.log" Enter

set -uo pipefail

export TEST_MODE=false

TEMPS=(0.5 0.7 0.85 1.0 1.1)
NAMES=(run0 run1 run2 run3 run4)

for i in "${!NAMES[@]}"; do
  SUFFIX="${NAMES[$i]}"
  TEMP="${TEMPS[$i]}"
  echo "========================================"
  echo "=== ${SUFFIX} (temperature=${TEMP}) ==="
  echo "========================================"
  OUTPUT_SUFFIX="${SUFFIX}" TEMPERATURE="${TEMP}" bun run generate 2>&1 | tee /tmp/generate-${SUFFIX}.log
  OUTPUT_SUFFIX="${SUFFIX}" bun run render 2>&1 | tee /tmp/render-${SUFFIX}.log
  echo "=== ${SUFFIX} complete ==="
done

echo "========================================"
echo "All 5 runs complete."
echo "Next: rsync output back to VPS, then run critique + improve + package per suffix."
