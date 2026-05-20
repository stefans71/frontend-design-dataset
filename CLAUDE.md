# frontend-design-dataset

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

## Last Updated

2026-05-20 ~13:00 JST

---

## ⚡ Continue From Here (after /compact)

Read in this order before doing anything:
1. **This file** (CLAUDE.md) — full context, especially Current Run Status below
2. **PLAN.md** — implementation checklist
3. **FRONTEND-DESIGN-MODEL-CARD.md** — acceptance criteria §7, training strategy §3

**Current situation:** 500-component full run is IN PROGRESS on AutoDL westd. Run0+run1 generate+render complete. Run2 partial (56/100). Run3 in progress (~70/100). Run4 queued. VPS is processing critique+improve for run0+run1 in parallel.

**Do not restart anything without checking current screen sessions first:**
```bash
# AutoDL
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "screen -list"
tail -f /tmp/fullrun3.log   # or fullrun2.log — check which is active

# VPS
screen -list
tail -f /tmp/vps-process.log
```

---

## Current Run Status (as of 2026-05-20 ~12:30 JST)

| Run  | Temp | Generate      | Render              | VPS Critique      | VPS Improve | Package |
|------|------|---------------|---------------------|-------------------|-------------|---------|
| run0 | 0.5  | 100/100 ✅    | 88/100 ✅ (12 failed) | 28/97 in progress | ⏳          | ⏳      |
| run1 | 0.7  | 100/100 ✅    | 86/100 ✅ (14 failed) | queued after run0 | ⏳          | ⏳      |
| run2 | 0.85 | 56/100 ⚠️     | 56/100 ✅             | not started       | ⏳          | ⏳      |
| run3 | 1.0  | ~70/100 running | ⏳                  | not started       | ⏳          | ⏳      |
| run4 | 1.1  | queued        | ⏳                  | not started       | ⏳          | ⏳      |

**After AutoDL run3+run4 complete:**
1. Fix run2 — `OUTPUT_SUFFIX=run2 bun run generate` fills ~44 missing (resume skips existing)
2. Re-render pass all 5 runs — catches ~26 Chromium failures (resume skips done PNGs)
3. Final rsync AutoDL → VPS
4. VPS processes run2+run3+run4
5. `cat output/dataset-run*.jsonl > output/dataset.jsonl` — expect ~3,000 records

---

## What Went Wrong & Fixes Applied (do not revert)

| # | Problem | Fix |
|---|---------|-----|
| 1 | `set -euo pipefail` in run script — one crash killed entire job | Removed `-e` from `run-all-variants.sh` — failures log and continue |
| 2 | `render.ts` had no per-component error handling — one Playwright crash killed whole stage | Added try/catch per component — logs FAILED and continues |
| 3 | Playwright `networkidle` timeout on slow/inline CSS pages | Switched to `domcontentloaded` + 3000ms fixed delay |
| 4 | run2 generate stopped at ~56/100 — llama-server memory pressure | Re-run with resume support after run3/run4 done |
| 5 | run2 render deadlocked on component-028 for 52min — no Playwright launch timeout | Per-component timeout needed — add `setTimeout` kill to browser launch |
| 6 | llama-server died mid-run — run3+run4 got 3 components then ConnectionRefused | Restart llama-server (`bash start.sh`), new screen session handles resume |
| 7 | ~26 render failures across run0+run1 (Chromium OOM crashes) | Re-render pass after full run — resume skips already-done PNGs |

**Additional permanent fixes (from earlier sessions):**
- **generate.ts system prompt:** inline CSS only — CDN not blocked but inline CSS is better training data
- **critique.ts:** `CRITIQUE_PROMPT` must come **before** `-i` flag — `-i FILE...` is variadic and eats the prompt as a second image path if placed after; `stdin: "ignore"` required
- **improve.ts:** reads `metadata.json` and passes original prompt as scope constraint — prevents Codex expanding a navbar into a full landing page
- **llama-server:** `--cache-reuse 0` flag required — prevents multi-turn crash on DeltaNet recurrent state

---

## SSH Access

```bash
# ACTIVE instance (westd clone, port 25180)
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com

# Port changes on every AutoDL reboot — check AutoDL web UI after reboot
# Original westc instance: on hold
```

## Rsync Scripts

Both scripts accept `PORT` (arg 1) and optional `HOST` (arg 2, default: connect.westd.seetacloud.com):

```bash
bash scripts/rsync-to-autodl.sh 25180                                          # push code to westd
bash scripts/rsync-from-autodl.sh 25180                                        # pull output from westd
bash scripts/rsync-to-autodl.sh <PORT> connect.westc.seetacloud.com            # use westc
```

## AutoDL Startup Sequence (after reboot)

```bash
# 1. SSH in with new port from AutoDL web UI
ssh -i /root/.ssh/id_ed25519 -p <NEW_PORT> root@connect.westd.seetacloud.com
# 2. Start both llama-server instances
bash /root/autodl-tmp/start.sh
# 3. Verify healthy
curl http://localhost:11434/health   # → {"status":"ok"}
# 4. On VPS — update tunnel port if changed
sudo nano /etc/systemd/system/autodl-tunnel.service   # update port
sudo systemctl daemon-reload && sudo systemctl restart autodl-tunnel.service
```

---

## Architecture — Two Machine Split

```
AutoDL (RTX 5090, westd)             VPS Japan (hostdzire)
────────────────────────             ─────────────────────
Stage 1: bun run generate            Stage 3:  bun run critique
Stage 2: bun run render              Stage 3b: bun run improve
         ↓ rsync                     Stage 4:  bun run package
bash scripts/rsync-from-autodl.sh
```

---

## Full Run Sequence

### Standard full run (fresh)
```bash
# AutoDL — always use screen/tmux for long runs
source autodl-run.sh
bun install --registry https://registry.npmmirror.com
screen -dmS fullrun bash -c 'TEST_MODE=false bash scripts/run-all-variants.sh 2>&1 | tee /tmp/fullrun.log'

# Monitor
tail -f /tmp/fullrun.log
screen -list   # check session is alive

# VPS — after AutoDL generate+render complete
bash scripts/rsync-from-autodl.sh 25180
screen -dmS vps-process bash -c 'for SUFFIX in run0 run1 run2 run3 run4; do echo "=== $SUFFIX ===" && OUTPUT_SUFFIX=$SUFFIX bun run critique && OUTPUT_SUFFIX=$SUFFIX bun run improve && DATASET_PATH=output/dataset-${SUFFIX}.jsonl OUTPUT_SUFFIX=$SUFFIX bun run package; done 2>&1 | tee /tmp/vps-process.log'

# Final concatenation
cat output/dataset-run*.jsonl > output/dataset.jsonl
wc -l output/dataset.jsonl   # expect ~3,000
```

### Resume a partial run (after crash/restart)
```bash
# Resume generate for a specific run (skips existing component.html files)
OUTPUT_SUFFIX=run2 TEMPERATURE=0.85 TEST_MODE=false bun run generate

# Re-render pass (skips existing PNGs)
OUTPUT_SUFFIX=run2 TEST_MODE=false bun run render

# Re-render ALL runs (catches Chromium OOM failures)
for SUFFIX in run0 run1 run2 run3 run4; do
  OUTPUT_SUFFIX=$SUFFIX TEST_MODE=false bun run render
done
```

### Long run monitoring
```bash
# Check progress from VPS at any time
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "tail -5 /tmp/fullrun.log"

# Check component count per run
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com \
  "for s in run0 run1 run2 run3 run4; do echo -n \"\$s: \"; ls /root/autodl-tmp/frontend-design-dataset/output/ | grep \$s | wc -l; done"
```

---

## OUTPUT_SUFFIX — Versioned Output Dirs

Set `OUTPUT_SUFFIX=run0` to write to `component-000-run0/` dirs. All stages read this env var.
When OUTPUT_SUFFIX is set, generate.ts automatically uses `COMPONENT_PROMPTS_V2`.

```bash
# Single suffix run
OUTPUT_SUFFIX=run2 TEMPERATURE=0.85 TEST_MODE=false bun run generate
OUTPUT_SUFFIX=run2 TEST_MODE=false bun run render

# Full 5-temperature run (run-all-variants.sh handles this automatically)
TEST_MODE=false bash scripts/run-all-variants.sh
```

---

## Pipeline Stages

1. **generate.ts** — HTML/CSS components via llama-server (`TEMPERATURE` env var, default 0.7)
2. **render.ts** — Desktop (1280×900) + mobile (390×844) PNGs via Playwright
3. **critique.ts** — Codex CLI design critique → `critique.md`
4. **improve.ts** — Codex CLI improved HTML → `improved.html` (scope-constrained by original prompt)
5. **package-dataset.ts** — Assembles 6 JSONL record types per component
6. **pipeline.ts** — Orchestrates all stages with JST timestamps

## Training Record Types

1. `prompt_to_html` — text prompt → original HTML
2. `screenshot_to_critique` — desktop PNG → critique
3. `screenshot_to_code` — desktop PNG → original HTML
4. `mobile_to_code` — mobile PNG → original HTML *(added 2026-05-20)*
5. `screenshot_html_to_critique` — PNG + HTML → critique
6. `screenshot_code_critique_to_improved` — PNG + HTML + original prompt + critique → improved HTML **(most valuable)**

Expected total: 500 components × 6 types = **~3,000 records**

---

## llama-server API

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-27b-mtp",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 4096,
    "temperature": 0.7,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

- **Always** include `enable_thinking: false` — model defaults to thinking mode
- Model string: `qwen3.6-27b-mtp`
- Max safe context: 131K tokens (29.3/32.6 GB VRAM at 131K)
- Speed: 92–97 tok/s with MTP speculative decoding

## Codex CLI

```bash
# CRITICAL: prompt MUST come before -i flag
codex exec -m gpt-5.4 --dangerously-bypass-approvals-and-sandbox --ephemeral "prompt text" -i screenshot.png -o output.txt
```

- Auth: ChatGPT OAuth (`~/.codex/auth.json`) — no API key needed
- If auth fails: `codex logout && codex login --device-auth`
- Output: use `-o output.txt` and read file — more reliable than stdout parsing
- Sequential only — no parallelism (Codex CLI limitation)
- Timeouts: critique 120s, improve 300s

## Playwright on AutoDL

```bash
export PLAYWRIGHT_BROWSERS_PATH=/root/autodl-tmp/pw-browsers
```

- One browser per component (open → screenshot → close) — prevents OOM accumulation
- Wait strategy: `domcontentloaded` + 3000ms (NOT networkidle)
- Per-component try/catch — failures log and continue, don't crash the run
- Chromium OOM is possible on complex components — resume support handles re-render

## AutoDL Environment

```bash
# Always source this first
source /root/autodl-tmp/frontend-design-dataset/autodl-run.sh
# Sets: PATH (bun + node), PLAYWRIGHT_BROWSERS_PATH, checks llama-server health

# Key paths
/root/autodl-tmp/bun/bin/bun                          # Bun runtime
/root/autodl-tmp/node-v22.15.0-linux-x64/bin/         # Node.js
/root/autodl-tmp/pw-browsers/                         # Playwright Chromium
/root/autodl-tmp/Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf     # 19GB generation model
/root/autodl-tmp/start.sh                             # starts both llama-server instances
```

---

## Tailwind CDN — Status

- **Not blocked** on AutoDL westd China zone — CDN loads correctly
- **render.ts uses** `domcontentloaded` + 3000ms — works for both CDN and inline CSS pages
- **generate.ts uses inline CSS** — COMPONENT_PROMPTS_V2 enforce it; inline CSS produces better training data (model learns real CSS, not utility classes)
- Do not add Tailwind CDN to generate.ts system prompt — prompts already override it and the conflict causes inconsistent output

---

## Key Constraints

- Codex CLI sequential — no parallel critique/improve calls
- One Playwright browser per component
- Resume support: all stages skip components with existing output files
- `TEST_MODE=true` + `TEST_COUNT=3` limits to first 3 components
- HTML must be self-contained (inline CSS) — no external CDN resources in generated output
- AutoDL single slot (`-np 1`) — one llama-server request at a time

---

## GitHub

https://github.com/stefans71/frontend-design-dataset

---

## Session Notes — 2026-05-20 ~13:00 JST

### Full Run Issues and Resolutions
- `set -e` removed from `run-all-variants.sh` — one Playwright crash was killing entire job
- Per-component try/catch added to `render.ts` — Chromium OOM failures now log and continue
- llama-server died mid-run3 — restarted, new screen session `run34` handles run3+run4
- run2 stopped at 56/100 — will resume after run3+run4 complete
- ~26 render failures (OOM) across run0+run1 — re-render pass scheduled after full generate complete
- VPS started processing run0+run1 critique in parallel (screen session `vps-run01`)

### Components Visual Quality
Natural language prompts (v2) producing significantly better output than expert prompts (v1).
Component-026-run0 example: dark mode social feed with phone frame, Instagram-style layout, proper UI chrome.

### After Full Run Completes
1. Resume run2 generate (44 missing components)
2. Re-render pass all 5 runs (26 failed OOM renders)
3. Final rsync AutoDL → VPS
4. VPS processes run2+run3+run4
5. Concatenate all 5 datasets
6. Generate 200-400 qualifying conversation traces on VPS (Codex CLI)
7. Fine-tune Qwen3-VL-8B
