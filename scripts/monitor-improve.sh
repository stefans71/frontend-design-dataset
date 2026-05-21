#!/usr/bin/env bash
# Monitor vps-improve session — run every ~20min
# Writes status to /tmp/improve-monitor.log
# Auto-restarts if session dies mid-run or stalls

set -uo pipefail

PROJECT_DIR="/root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset"
CHECKPOINT=/tmp/improve-checkpoint.txt
MONITOR_LOG=/tmp/improve-monitor.log
SESSION_NAME="vps-improve"
NOW=$(date '+%Y-%m-%d %H:%M:%S UTC')
# Screen session start — only consider logs newer than this
SCREEN_START=$(screen -ls | grep "vps-improve" | grep -oP '\d{2}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}' | head -1 || echo "")

log() { echo "$1" | tee -a "$MONITOR_LOG"; }

log ""
log "=== $NOW ==="

# --- 1. Check completion ---
for suffix in b c; do
  if grep -q "ALL_IMPROVE_DONE" /tmp/improve-run4${suffix}.log 2>/dev/null; then
    log "  STATUS: ALL_IMPROVE_DONE — monitoring complete"
    exit 0
  fi
done

# --- 2. Screen session alive? ---
SCREEN_ALIVE=0
if screen -ls | grep -q "vps-improve"; then
  SCREEN_ALIVE=1
  SCREEN_ACTUAL=$(screen -ls | grep "vps-improve" | awk '{print $1}')
  log "  Screen: ALIVE ($SCREEN_ACTUAL)"
else
  log "  Screen: DEAD — no vps-improve session found"
fi

# --- 3. Find ACTIVE log — most recently modified improve log ---
ACTIVE_LOG=""
ACTIVE_LOG_TIME=0
for run in run1 run2 run3 run4; do
  for suffix in b c; do
    LOG="/tmp/improve-${run}${suffix}.log"
    if [ -f "$LOG" ]; then
      MTIME=$(stat -c %Y "$LOG" 2>/dev/null || echo 0)
      if [ "$MTIME" -gt "$ACTIVE_LOG_TIME" ]; then
        ACTIVE_LOG_TIME=$MTIME
        ACTIVE_LOG=$LOG
      fi
    fi
  done
done

CURRENT_RUN=""
LAST_COMPONENT=0
LAST_TOTAL=100
if [ -n "$ACTIVE_LOG" ]; then
  # Extract run name from log filename (improve-runXx.log)
  CURRENT_RUN=$(basename "$ACTIVE_LOG" | grep -oP 'run\d+')
  LC=$(grep -oP 'Component \K[0-9]+(?=/[0-9]+ done)' "$ACTIVE_LOG" 2>/dev/null | tail -1 || true)
  LT=$(grep -oP 'Component [0-9]+/\K[0-9]+(?= done)' "$ACTIVE_LOG" 2>/dev/null | tail -1 || true)
  LAST_COMPONENT="${LC:-0}"
  LAST_TOTAL="${LT:-100}"
  AGE=$(( $(date +%s) - ACTIVE_LOG_TIME ))
  log "  Active log: $(basename $ACTIVE_LOG) (${AGE}s ago) | Component: ${LAST_COMPONENT}/${LAST_TOTAL}"
  log "  Last lines: $(tail -2 $ACTIVE_LOG | tr '\n' ' ')"
else
  log "  No improve log found"
fi

# --- 4. Auth / HTML-skip warnings ---
SKIP_COUNT=0
for run in run1 run2 run3 run4; do
  for suffix in b c; do
    LOG="/tmp/improve-${run}${suffix}.log"
    if [ -f "$LOG" ]; then
      # Only check logs modified after screen session started (skip stale logs)
      MTIME=$(stat -c %Y "$LOG" 2>/dev/null || echo 0)
      SESSION_EPOCH=$(date -d "2026-05-20 21:10:14 UTC" +%s 2>/dev/null || echo 0)
      if [ "$MTIME" -gt "$SESSION_EPOCH" ]; then
        N=$(grep -c "not valid HTML" "$LOG" 2>/dev/null || true)
        SKIP_COUNT=$((SKIP_COUNT + N))
      fi
    fi
  done
done
if [ "$SKIP_COUNT" -gt 5 ]; then
  log "  WARNING: $SKIP_COUNT HTML-skip events — possible Codex auth failure"
fi

# --- 5. improved.html counts per run (glob must be unquoted) ---
COUNTS=""
for s in run0 run1 run2 run3 run4; do
  n=$(ls $PROJECT_DIR/output/component-*-${s}/improved.html 2>/dev/null | wc -l || true)
  COUNTS="$COUNTS $s=$n"
done
log "  improved.html:$COUNTS"

# --- 6. Stall detection (same position as last check) ---
CHECKPOINT_KEY="${CURRENT_RUN:-none}:${LAST_COMPONENT}"
STALLED=0
if [ -f "$CHECKPOINT" ]; then
  PREV=$(cat "$CHECKPOINT")
  if [ "$PREV" = "$CHECKPOINT_KEY" ] && [ "$SCREEN_ALIVE" = "1" ] && [ "$LAST_COMPONENT" -gt 0 ]; then
    STALLED=1
    log "  WARNING: STALL — same position as last check ($CHECKPOINT_KEY)"
  fi
fi
echo "$CHECKPOINT_KEY" > "$CHECKPOINT"

# --- 7. Auto-restart if dead or stalled ---
if [ "$SCREEN_ALIVE" = "0" ] || [ "$STALLED" = "1" ]; then
  # Find the FIRST incomplete run by improved.html count (not by log mtime)
  # run0/run1 are complete. Thresholds are conservative — resume skips done files.
  RESTART_FROM=""
  for run in run2 run3 run4; do
    n=$(ls $PROJECT_DIR/output/component-*-${run}/improved.html 2>/dev/null | wc -l || true)
    if [ "$n" -lt 88 ]; then
      RESTART_FROM="$run"
      break
    fi
  done

  if [ -z "$RESTART_FROM" ]; then
    log "  All runs appear complete — no restart needed. Check for ALL_IMPROVE_DONE."
    exit 0
  fi

  log "  ACTION: Restarting from $RESTART_FROM (resume skips done improved.html)"

  if [ "$STALLED" = "1" ]; then
    screen -X -S "$SESSION_NAME" quit 2>/dev/null || true
    sleep 2
  fi

  # Build run list from first incomplete run onward
  RUNS_TO_DO=""
  SAW=0
  for run in run2 run3 run4; do
    [ "$run" = "$RESTART_FROM" ] && SAW=1
    [ "$SAW" = "1" ] && RUNS_TO_DO="$RUNS_TO_DO $run"
  done
  RUNS_TO_DO="${RUNS_TO_DO# }"

  screen -dmS "${SESSION_NAME}" bash -c "
cd $PROJECT_DIR
for SUFFIX in $RUNS_TO_DO; do
  echo \"=== \${SUFFIX} improve ===\" && OUTPUT_SUFFIX=\$SUFFIX bun run improve 2>&1 | tee /tmp/improve-\${SUFFIX}c.log
  echo \"=== \${SUFFIX} package ===\" && DATASET_PATH=output/dataset-\${SUFFIX}.jsonl OUTPUT_SUFFIX=\$SUFFIX bun run package 2>&1 | tee /tmp/package-\${SUFFIX}c.log
done
echo ALL_IMPROVE_DONE
"
  log "  Launched: new vps-improve session for runs: $RUNS_TO_DO"
fi

log ""
