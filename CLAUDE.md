# frontend-design-dataset

> Note: This file is getting large. After fine-tuning completes, archive
> completed session notes to CLAUDE-ARCHIVE.md and keep only active context here.

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

## Last Updated

2026-05-21 JST

---

## ⚡ Continue From Here (after /compact)

Read in this order before doing anything:
1. **This file** (CLAUDE.md) — full context, especially Fine-Tune Status below
2. **PLAN.md** — full pipeline implementation checklist (do not overwrite)
3. **FRONTEND-DESIGN-MODEL-CARD.md** — Sections 14+15 for fine-tune params and validation protocol

**Current situation:** Dataset COMPLETE — 3,089 records in `output/dataset-final.jsonl`.
Fine-tune phase starting. Active instance is frontend-dataset-clone-V2 (port 25615).
Do not touch the dataset instance (port 25180 — switched off, data preserved).

**First task in any new session:** Check V2 instance is healthy before doing anything:
```bash
ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com \
  "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader && df -h /root/autodl-tmp"
```

---

## Pending Doc Updates (after fine-tuning completes)

- §7 acceptance criteria: replace line count ratio ≥1.4 with CSS property
  quality check (flex/grid/transition/box-shadow introduced in improved.html)
- §9 prompt wording: clarify "inline CSS" means `<style>` block in `<head>`,
  not `style=""` attributes — reword to avoid confusion
- §13 conversation trace generation: add temperature variation, persona
  injection, generate in batches of 1-2 not 10 (diversity collapse risk)
- §2 add screenshot resolution guidance for inference: max 1024x1024
  recommended to avoid vision encoder VRAM OOM on 12GB GPUs
- Fine-tune instance SSH updated: port 25615, connect.westd.seetacloud.com
- CUDA 13.2 on V2 instance — backward compatible, no config changes needed
- Archive completed session notes to CLAUDE-ARCHIVE.md after fine-tune

---

## Dataset Status — COMPLETE ✅

| File | Records | Status |
|---|---|---|
| `output/dataset-final.jsonl` | 3,089 | ✅ Ready for fine-tuning — this is the input |
| `output/dataset-clean.jsonl` | 2,835 | ✅ Component records (post-eval) |
| `output/qualifying-conversations.jsonl` | 254 (150 ask / 104 immediate) | ✅ Conversation traces |

All records validated: 0 CDN links, 0 malformed, 95% scoring 8-9/9 on eval pass.

## Fine-Tune Status

| Step | Status |
|---|---|
| Verify V2 instance clone health | ⏳ Next |
| Install SWIFT on V2 instance | ⏳ |
| Rsync dataset-final.jsonl to V2 | ⏳ |
| Pre-training smoke test (10 steps, loss drops by step 5) | ⏳ |
| Full QLoRA fine-tune | ⏳ |
| Export GGUF + quantize (Q4_K_M + Q3_K_M) | ⏳ |
| Post-fine-tune validation (4 tests — see below) | ⏳ |

---

## Baseline Test Results — Qwen3-VL-8B-Instruct (confirmed)

Tested on AutoDL westd. Fine-tune decision: CONFIRMED REQUIRED.

| Test | Score | Finding |
|---|---|---|
| Vision critique | 5/10 | Works but vague — no px measurements, no hex values |
| Qualifying questions | 1/10 | Never asks — builds immediately (RLHF eager pleaser failure) |
| Self-contained HTML | 7/10 | Good output quality |

Test 2 (1/10) is definitive — system prompts cannot override RLHF
eagerness to build. Qualifying behavior must be trained into weights.

## Post-Fine-Tune Validation Protocol

Run these 4 tests after fine-tuning before releasing. Compare against baseline.

### Test A — Vision critique quality
Upload one 4/10 component screenshot. Ask for design critique.
PASS: mentions specific measurements, hex/color contrast, named design
principles, scores component. FAIL: generic feedback only.
Target: 7+/10 (vs 5/10 baseline)

### Test B — Qualifying questions (10 vague prompts)
Run all 10 prompts below, count how many trigger questions vs immediate build.
PASS: asks questions on ≥6/10. FAIL: <6/10.
Target: 8+/10 (vs 1/10 baseline)

Vague prompts to use:
1. "build me a website for my dog daycare called Stay Fit"
2. "make me an app for my restaurant"
3. "I need a landing page for my startup"
4. "build something for my photography business"
5. "create a site for my yoga studio"
6. "I want a web presence for my law firm"
7. "make me a dashboard"
8. "build a portfolio for me"
9. "I need an online store"
10. "create something for my fitness coaching business"

### Test C — System prompt length tax
Measure tokens needed in system prompt to get reliable behavior.
PASS: ≤200 token system prompt achieves correct behavior
FAIL: needs >500 tokens (eats KV cache on 12GB GPU)
Target: near-zero system prompt needed (behavior baked into weights)

### Test D — Markdown chatter
Ask for a component 3 times. Count non-code tokens in response.
PASS: outputs clean HTML, no preamble, no "here is your code" wrapper
FAIL: consistent markdown fences + explanation text around every output
Target: <20 tokens of wrapper text per response

### Fine-tune passed if:
- Test A: 7+/10
- Test B: ≥6/10 vague prompts trigger questions
- Test C: ≤200 token system prompt sufficient
- Test D: clean output, minimal chatter

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
| 8 | Codex daily quota exhausted mid-run | Re-login: `codex login --device-auth`; or switch to `claude -p` |
| 9 | Conversation trace diversity collapse | Persona + domain injection per batch, batches of 5 not 10, 480s timeout |

**Additional permanent fixes:**
- **generate.ts system prompt:** inline CSS only — CDN not blocked but inline CSS is better training data
- **critique.ts:** `CRITIQUE_PROMPT` must come **before** `-i` flag — `-i FILE...` is variadic and eats the prompt as a second image path if placed after; `stdin: "ignore"` required
- **improve.ts:** reads `metadata.json` and passes original prompt as scope constraint — prevents Codex expanding a navbar into a full landing page
- **llama-server:** `--cache-reuse 0` flag required — prevents multi-turn crash on DeltaNet recurrent state

---

## SSH Access

```bash
# ACTIVE fine-tune instance (V2, port 25615)
ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com

# Dataset reference instance (port 25180 — switched off, do not delete)
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com

# Port changes on every AutoDL reboot — check AutoDL web UI after reboot
```

## AutoDL Instances

| Name | ID | SSH | Status | Purpose |
|---|---|---|---|---|
| frontend-dataset-clone | 4yykv6xgt5-fbab8365 | `ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com` | Switched off | Dataset reference — do not delete |
| frontend-dataset-clone-V2 | b4c84b981f-1532c4c1 | `ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com` | **Running** | **Active fine-tune instance** |

**Active fine-tune instance:**
```bash
ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com
# Northwest Area B / 984 Machine
# CUDA 595.58.03 (13.2) — backward compatible with all existing tools
# Data disk: 200GB
# Clone of frontend-dataset-clone — all data should be present
```

**Note:** Port 25615 may change on reboot — check AutoDL web UI.

## AutoDL Academic Network Acceleration

AutoDL provides built-in proxy acceleration for academic use (GitHub + HuggingFace).
**Enable before any `git clone`, `pip install`, or `huggingface-cli download` call.**

```bash
# Enable (run once per session on AutoDL)
source /etc/network_turbo

# Disable when done (recommended — can affect normal network)
unset http_proxy && unset https_proxy
```

Accelerates: `github.com`, `githubusercontent.com`, `githubassets.com`, `huggingface.co`

**Public mirrors (fallback if built-in is slow):**
- HuggingFace mirror: `https://hf-mirror.com/` — set via `HF_ENDPOINT=https://hf-mirror.com`
- GitHub proxy: `https://ghproxy.link/` — prepend to raw GitHub URLs

**Usage for HuggingFace model download:**
```bash
source /etc/network_turbo
huggingface-cli download Qwen/Qwen3-VL-8B-Instruct --local-dir /root/autodl-tmp/Qwen3-VL-8B-Instruct

# Or via ModelScope (no proxy needed — China-native):
pip install modelscope -q
modelscope download --model Qwen/Qwen3-VL-8B-Instruct --local_dir /root/autodl-tmp/Qwen3-VL-8B-Instruct
```

## Rsync Scripts

Both scripts accept `PORT` (arg 1) and optional `HOST` (arg 2, default: connect.westd.seetacloud.com):

```bash
bash scripts/rsync-to-autodl.sh 25615                    # push to V2 fine-tune instance
bash scripts/rsync-from-autodl.sh 25615                  # pull from V2
bash scripts/rsync-to-autodl.sh 25180                    # push to dataset instance (switched off)
```

## AutoDL Startup Sequence (after reboot)

```bash
# 1. SSH in with new port from AutoDL web UI
ssh -i /root/.ssh/id_ed25519 -p <NEW_PORT> root@connect.westd.seetacloud.com
# 2. Start both llama-server instances (for data pipeline — not needed for fine-tuning)
bash /root/autodl-tmp/start.sh
# 3. Verify healthy
curl http://localhost:11434/health   # → {"status":"ok"}
# 4. On VPS — update tunnel port if changed
sudo nano /etc/systemd/system/autodl-tunnel.service   # update port
sudo systemctl daemon-reload && sudo systemctl restart autodl-tunnel.service
```

---

## OOM Prevention — Qwen3-VL Training Config

**CRITICAL:** Qwen3-VL uses **32×32 pixel patches**, NOT 28×28 like Qwen2.5-VL.
Copying a Qwen2.5-VL config will silently mis-size images and OOM on 1200+ images.

Required parameters for all fine-tune runs:
```bash
--image_min_pixels $((256 * 32 * 32))    # 262,144 — do NOT use 28*28 value
--image_max_pixels $((1280 * 32 * 32))   # 1,310,720 — increase for screenshot data
--tune_mm_vision False                    # freeze vision encoder — saves ~4GB VRAM
--gradient_checkpointing True             # required at batch_size > 1
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'  # reduces fragmentation spikes
load_in_4bit = True                       # QLoRA — safe for Qwen3-VL (NOT Qwen3.5)
```

**Before training — kill Ollama:**
```bash
pkill -f ollama   # Ollama idle holds VRAM and blocks training
nvidia-smi        # Confirm GPU free
```

**Smoke test first (always):**
```bash
swift sft ... --max_steps 10
# Loss should drop by step 5. Flat/spiking = config problem.
```

**SWIFT install on AutoDL:**
```bash
pip install ms-swift -U
# Or from ModelScope if pip is slow:
pip install ms-swift --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

**Full fine-tune command:**
```bash
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
swift sft \
  --model Qwen/Qwen3-VL-8B-Instruct \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset /root/autodl-tmp/frontend-design-dataset/output/dataset-final.jsonl \
  --num_train_epochs 3 \
  --image_min_pixels $((256 * 32 * 32)) \
  --image_max_pixels $((1280 * 32 * 32)) \
  --tune_mm_vision False \
  --gradient_checkpointing True \
  --output_dir /root/autodl-tmp/finetune-output
```

---

## Architecture — Two Machine Split (dataset pipeline — archived)

Dataset generation is complete. This is preserved for reference only.

```
AutoDL (RTX 5090, westd)             VPS Japan (hostdzire)
────────────────────────             ─────────────────────
Stage 1: bun run generate            Stage 3:  bun run critique
Stage 2: bun run render              Stage 3b: bun run improve
         ↓ rsync                     Stage 4:  bun run package
bash scripts/rsync-from-autodl.sh    Stage 5:  bun run evaluate
                                     Stage 6:  bun run conversations
                                     Final:    dataset-final.jsonl (3,089 records)
```

---

## Pipeline Stages (all complete)

1. **generate.ts** — HTML/CSS components via llama-server (`TEMPERATURE` env var, default 0.7)
2. **render.ts** — Desktop (1280×900) + mobile (390×844) PNGs via Playwright
3. **critique.ts** — Codex CLI / `claude -p` design critique → `critique.md`
4. **improve.ts** — Codex CLI improved HTML → `improved.html` (scope-constrained by original prompt)
5. **package-dataset.ts** — Assembles 6 JSONL record types per component
6. **evaluate.ts** — Two-stage eval: regex (Stage A) + `claude -p` LLM scoring (Stage B)
7. **generate-conversations.ts** — 254 qualifying conversation traces (59% ask / 41% immediate)
8. **pipeline.ts** — Orchestrates all stages with JST timestamps

## Training Record Types (final dataset)

1. `prompt_to_html` — text prompt → original HTML
2. `screenshot_to_critique` — desktop PNG → critique
3. `screenshot_to_code` — desktop PNG → original HTML
4. `mobile_to_code` — mobile PNG → original HTML
5. `screenshot_html_to_critique` — PNG + HTML → critique
6. `screenshot_code_critique_to_improved` — PNG + HTML + original prompt + critique → improved HTML **(most valuable)**
7. `qualifying_conversation` — vague request → questions → answers → build (150 records)
8. `immediate_conversation` — clear request → direct build (104 records)

**Total: 3,089 records in `output/dataset-final.jsonl`**

---

## llama-server API (for data pipeline — not needed for fine-tuning)

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

- Always include `enable_thinking: false` — model defaults to thinking mode
- Model string: `qwen3.6-27b-mtp`
- Max safe context: 131K tokens (29.3/32.6 GB VRAM at 131K)
- Speed: 92–97 tok/s with MTP speculative decoding

## Codex CLI

```bash
# CRITICAL: prompt MUST come before -i flag
codex exec -m gpt-5.4 --dangerously-bypass-approvals-and-sandbox --ephemeral "prompt text" -i screenshot.png
```

- Auth: ChatGPT OAuth (`~/.codex/auth.json`) — no API key needed
- If auth fails: `codex logout && codex login --device-auth`
- Daily quota limit — if exhausted, switch to `claude -p` (identical subprocess pattern)
- Sequential only — no parallelism

## Playwright on AutoDL (data pipeline — not needed for fine-tuning)

```bash
export PLAYWRIGHT_BROWSERS_PATH=/root/autodl-tmp/pw-browsers
```

- Wait strategy: `domcontentloaded` + 3000ms (NOT networkidle)
- Per-component try/catch — failures log and continue

## AutoDL Environment

```bash
# Always source this first for data pipeline work
source /root/autodl-tmp/frontend-design-dataset/autodl-run.sh
# Sets: PATH (bun + node), PLAYWRIGHT_BROWSERS_PATH, checks llama-server health

# Key paths
/root/autodl-tmp/bun/bin/bun                               # Bun runtime
/root/autodl-tmp/node-v22.15.0-linux-x64/bin/              # Node.js
/root/autodl-tmp/pw-browsers/                              # Playwright Chromium
/root/autodl-tmp/Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf          # 19GB generation model
/root/autodl-tmp/qwen3-vl-8b-gguf/                        # Qwen3-VL-8B baseline test files
/root/autodl-tmp/start.sh                                  # starts both llama-server instances
/root/autodl-tmp/frontend-design-dataset/output/dataset-final.jsonl  # ← fine-tune input
```

---

## Tailwind CDN — Status

- **Not blocked** on AutoDL westd China zone
- **render.ts uses** `domcontentloaded` + 3000ms — works for both CDN and inline CSS pages
- **generate.ts uses inline CSS** — COMPONENT_PROMPTS_V2 enforce it; inline CSS produces better training data
- Do not add Tailwind CDN to generate.ts system prompt

---

## Key Constraints

- Codex CLI sequential — no parallel critique/improve calls
- One Playwright browser per component
- Resume support: all stages skip components with existing output files
- `TEST_MODE=true` + `TEST_COUNT=3` limits to first 3 components
- HTML must be self-contained (inline CSS) — no external CDN resources in generated output
- AutoDL single slot (`-np 1`) — one llama-server request at a time

---

## Evaluation Pass (Step 20.5) — COMPLETE ✅

Results: 475 passed Stage A, 0 excluded (all scored ≥6/9), 95% scored 8-9/9.

### Stage A — Bun script (deterministic)
File: `src/evaluate.ts` | Output: `output/pre-scores.jsonl`
- Hard gate: fail if `https://` found (except w3.org, placeholder.com) OR file <500 chars
- Visual score via regex: color count + measurement units → 0-3

### Stage B — LLM scoring (`claude -p`, 5 per batch)
Output: `output/scores.jsonl`
- ALIGNMENT (0-3): does HTML match requested component type?
- INTERACTIVITY (0-3): context-aware — interactive vs display types

### Stage C — Filter
total = visual + alignment + interactivity (max 9) | exclude if <6
Output: `output/dataset-clean.jsonl` (2,835 records, 0 excluded)

---

## GitHub

https://github.com/stefans71/frontend-design-dataset

---

## Session Notes — 2026-05-20 JST

### Full Run Issues (all resolved)
- `set -e` removed from `run-all-variants.sh`
- Per-component try/catch added to `render.ts`
- llama-server died mid-run3 — restarted, resume handled gaps
- run2 stopped at 56/100 — resumed after run3/run4 complete
- ~26 render OOM failures — re-render pass completed
- Codex daily quota exhausted 3× — re-logged each time

### Dataset Complete (2026-05-21)
- 500 components generated (470 clean after OOM losses)
- Eval pass: 0 excluded, 95% scoring 8-9/9
- 254 qualifying conversation traces (59% ask, 41% immediate)
- Final: 3,089 records in dataset-final.jsonl
- Fine-tune confirmed required (qualifying questions baseline: 1/10)

### New Instance (2026-05-21)
- frontend-dataset-clone-V2 provisioned for fine-tuning
- SSH: `ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com`
- CUDA 13.2 — backward compatible
- 200GB data disk
