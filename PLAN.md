# Implementation Plan

## Status

**DATASET COMPLETE — 2026-05-21 JST**
3,089 records in `output/dataset-final.jsonl`. Fine-tune phase next.
All data pipeline steps complete. See checklist below.

---

## Prompt Design Principles

All prompts for the full 100-prompt expansion must follow these rules:

**Write like a real non-designer user, not a frontend engineer.**

| ✗ Expert style (v1) | ✓ Natural language style (v2) |
|---|---|
| `bg-gray-950 background` | `dark background` |
| `bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg` | `blue button, white text, rounded corners` |
| `text-5xl font-black` | `large bold price` |
| `border border-purple-500/30 rounded-2xl p-8 shadow-xl` | `card with a subtle purple glow` |

**Each prompt must:**
1. Name a specific component type (button, card, form, nav, table…) — not a "page" or "app"
2. Include brand/product name and realistic content (no "Company Name", no lorem ipsum)
3. State light or dark theme in plain English
4. Mention accent color by name (blue, green, purple, amber…) — no hex, no Tailwind tokens
5. Scope to exactly what should appear on screen
6. End with: `Use only inline CSS — no external libraries. Self-contained HTML document.`

**Do not include:**
- Tailwind class names (`bg-gray-950`, `rounded-2xl`, `font-semibold`)
- Pixel or rem values (`px-8`, `py-3`, `text-5xl`, `w-80`)
- CSS property names (`border-radius`, `box-shadow`, `letter-spacing`)
- Framework references (Tailwind, Bootstrap, React, etc.)

---

## prompts/components.ts

Two exported arrays:

- **`COMPONENT_PROMPTS`** — 20 expert-authored v1 prompts. Kept for reference only. Not used in new runs.
- **`COMPONENT_PROMPTS_V2`** — 100 natural language prompts. Used when `OUTPUT_SUFFIX` is set (all production runs).

### Component mix (100 prompts total, ~42% dark theme)

| Category | Count | Dark theme target |
|---|---|---|
| Buttons & CTAs | 8 | ~3 dark |
| Forms | 10 | ~4 dark |
| Navigation | 8 | ~3 dark |
| Cards | 12 | ~5 dark |
| Modals & Overlays | 8 | ~4 dark |
| Feedback & Status | 10 | ~4 dark |
| Data Display | 12 | ~5 dark |
| Marketing | 10 | ~3 dark |
| Mobile | 8 | ~5 dark |
| Misc | 14 | ~6 dark |
| **Total** | **100** | **~42 dark** |

---

## Stage 1 — generate.ts ✅ COMPLETE

### Env vars
- `LLAMA_SERVER_URL` — llama-server base URL (default: http://localhost:11434)
- `LLAMA_MODEL` — model string (default: qwen3.6-27b-mtp)
- `TEMPERATURE` — generation temperature (default: 0.7), stored in metadata.json
- `OUTPUT_SUFFIX` — dir suffix (e.g. `run0` → `component-000-run0/`)
- `TEST_MODE` + `TEST_COUNT` — limit to first N prompts

### Function: `generateComponent(prompt, outputDir): Promise<void>`
1. Skip if `{outputDir}/component.html` exists (resume support)
2. POST to `/v1/chat/completions` with system prompt: inline CSS only, zero CDN, realistic content
3. Always include `chat_template_kwargs: { enable_thinking: false }`
4. Strip markdown fences from response
5. Validate HTML — skip and warn if no `<html` or `<!DOCTYPE` (graceful skip, no crash)
6. Save `component.html` + `metadata.json` (prompt, model, timestamp, temperature, outputSuffix)

### Function: `generateAll(): Promise<void>`
- Uses `COMPONENT_PROMPTS_V2` when `OUTPUT_SUFFIX` is set
- Falls back to `COMPONENT_PROMPTS` otherwise (legacy v1 only)

---

## Stage 2 — render.ts ✅ COMPLETE

### Function: `renderAll(): Promise<void>`
- Desktop screenshot: 1280×900, fullPage
- Mobile screenshot: 390×844, fullPage
- Wait strategy: `waitUntil: "domcontentloaded"` + 3000ms (**not** networkidle — causes timeouts)
- Per-component try/catch — log FAILED and continue (do not crash whole run)
- One browser instance per component (open → screenshot → close) — prevents OOM accumulation
- Skip if both PNGs already exist (resume support)

---

## Stage 3 — critique.ts ✅ COMPLETE

### Function: `critiqueAll(): Promise<void>`
- **CRITICAL:** prompt must come BEFORE `-i` flag in Codex CLI command
- Add `stdin: "ignore"` to Bun.spawn
- Sequential only — no parallelism
- Timeout: 120s per component
- Skip if `critique.md` exists (resume support)
- Fallback: `claude -p` if Codex daily quota exhausted (identical subprocess pattern)

---

## Stage 3b — improve.ts ✅ COMPLETE

### Function: `improveComponent(id, originalPrompt?): Promise<void>`
- Reads `screenshot-desktop.png` + `component.html` + `critique.md`
- Passes `originalPrompt` as scope constraint in Codex prompt
- Timeout: 480s (increased from 300s — content-heavy components need more time)
- Skip if `improved.html` exists (resume support)

---

## Stage 4 — package-dataset.ts ✅ COMPLETE

### Six record types per component

1. **`prompt_to_html`** — text prompt → original HTML
2. **`screenshot_to_critique`** — desktop PNG → critique text
3. **`screenshot_to_code`** — desktop PNG → original HTML
4. **`mobile_to_code`** — mobile PNG → original HTML
5. **`screenshot_html_to_critique`** — desktop PNG + HTML → critique
6. **`screenshot_code_critique_to_improved`** — desktop PNG + original prompt + HTML + critique → improved HTML **(most valuable)**

Record type 6 includes original prompt so the model learns scope fidelity alongside design improvement.

**Actual counts:** ~2,835 records across 5 runs (some lost to Chromium OOM render failures)

---

## Temperature Variants — run-all-variants.sh ✅ COMPLETE

| Run | Temperature | Components | Status |
|-----|-------------|-----------|--------|
| run0 | 0.5 | 97/100 | ✅ |
| run1 | 0.7 | 93/100 | ✅ |
| run2 | 0.85 | 93/100 | ✅ |
| run3 | 1.0 | 89/100 | ✅ |
| run4 | 1.1 | 98/100 | ✅ |

All runs scored median 6-7/10 — all 5 kept in training set.
**run-all-variants.sh** — does NOT use `set -e`. One crash logs and continues.

---

## Output Directory Structure (final — restructured 2026-05-22)

```
output/
├── assets/components/         ← 500 production component dirs (component-NNN-runX/)
│   ├── component-000-run0/    ← run0, temp=0.5
│   │   ├── component.html
│   │   ├── metadata.json      ← includes prompt, temperature, outputSuffix
│   │   ├── screenshot-desktop.png
│   │   ├── screenshot-mobile.png
│   │   ├── critique.md
│   │   └── improved.html
│   └── component-099-run4/   ← run4, temp=1.1
├── archive/test-runs/         ← 35 dirs: smoke tests, v2, tailwind-test, bare component-NNN
├── exports/                   ← JSONL datasets
│   ├── dataset-final.jsonl    ← ← ← FINE-TUNE INPUT (3,090 records)
│   ├── dataset-clean.jsonl    ← post-eval (2,835 records)
│   ├── dataset.jsonl          ← concatenated run0-run4 (~2,836 records)
│   ├── dataset-run0.jsonl     ← per-run JSONL (573 records)
│   ├── dataset-run1.jsonl     ← 558 records
│   ├── dataset-run2.jsonl     ← 573 records
│   ├── dataset-run3.jsonl     ← 534 records
│   ├── dataset-run4.jsonl     ← 598 records
│   └── qualifying-conversations.jsonl  ← 254 conversation traces
├── eval/                      ← evaluation outputs
│   ├── pre-scores.jsonl       ← Stage A eval results
│   ├── scores.jsonl           ← final per-component scores
│   └── eval-summary.json      ← aggregate eval stats
├── db/                        ← SQLite database (build with: bun run build-db)
│   └── dataset.sqlite         ← 500 components, 254 conversations, eval scores indexed
└── marketing/                 ← comparison screenshots for HuggingFace/GitHub
```

---

## Implementation Checklist

1. ✅ `prompts/components.ts` — v1 prompts + COMPONENT_PROMPTS_V2 (5 prompts)
2. ✅ `src/generate.ts` — OUTPUT_SUFFIX, V2 prompt routing
3. ✅ `src/render.ts` — OUTPUT_SUFFIX dir filtering
4. ✅ `src/critique.ts` — OUTPUT_SUFFIX dir filtering
5. ✅ `src/improve.ts` — originalPrompt param, scope instruction, OUTPUT_SUFFIX
6. ✅ `src/package-dataset.ts` — OUTPUT_SUFFIX, original prompt in type-6 record
7. ✅ `src/pipeline.ts` — orchestrator with JST timestamps
8. ✅ `package.json` — scripts for all stages
9. ✅ v2 A/B test VALIDATED — natural language prompts + scope constraint both confirmed
10. ✅ COMPONENT_PROMPTS_V2 expanded to 100 prompts
11. ✅ `src/generate.ts` — TEMPERATURE env var + graceful HTML validation
12. ✅ `src/package-dataset.ts` — mobile_to_code (6th record type) + dataset-stats.json
13. ✅ `scripts/run-all-variants.sh` — 5-temperature loop, no set -e
14. ✅ Smoke test passed (3 components × 2 temps × 6 record types = 36 records)
15. ✅ **Full 500-component run complete** — all 5 runs done
16. ✅ Resume run2 (93/100 final), re-render pass complete
17. ✅ Re-render pass all 5 runs (Chromium OOM failures recovered)
18. ✅ VPS critique+improve+package all 5 runs — complete 2026-05-21
19. ✅ Concatenate: `output/dataset.jsonl` — **2,836 records**
20. ✅ **Step 20.5 — Eval pass complete** — 0 excluded, 95% scoring 8-9/9, `dataset-clean.jsonl` = 2,835
21. ✅ **Step 20 — Qualifying conversation traces** — 254 records (150 ask / 104 immediate, 59% ask ratio)
22. ✅ **Final merge** — `output/dataset-final.jsonl` = **3,089 records** ← fine-tune input
23. ✅ Baseline test confirmed fine-tune required (qualifying questions: 1/10)
24. ✅ **Verify V2 fine-tune instance health** — RTX 5090 32GB, 222GB free, CUDA 13.2
25. ✅ **Install SWIFT on V2 instance** — ms-swift 4.2.1
26. ✅ **Rsync dataset-final.jsonl + PNGs to V2** — 3,089 records, 983 PNGs confirmed
26a. ✅ **Download Qwen3-VL-8B-Instruct HF weights** — /root/autodl-tmp/Qwen3-VL-8B-Instruct-HF (~16GB)
27. ✅ **Pre-training smoke test** — step 1 loss 0.5289, VRAM 22.44 GiB, speed 3.6 s/it, full run ~2.3h
28. ✅ **Full QLoRA fine-tune** — 2h 39m, final loss 0.246, token_acc 98.1%, checkpoint-2319
29. ✅ **Export GGUF + quantize** — f16 16GB, Q4_K_M 4.7GB, Q3_K_M 3.9GB at /root/autodl-tmp/
30. ✅ **Post-fine-tune validation (8B)** — 4/4 tests passed: A(vision critique w/ px+hex), B(10/10 qualifying), C(4/5 no-sys), D(0 wrapper chars)
31. ⏳ **Test on Ollama** (RTX 3060 12GB target hardware)
32. ⏳ **Release (8B)**
33. ✅ **Download Qwen3-VL-4B-Instruct HF weights** — /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF (8.4GB)
34. ✅ **Fine-tune Qwen3-VL-4B (Designer Lite)** — v2 run: 53m, loss 0.325, token_acc 92.5%, checkpoint-1546
35. ✅ **Export 4B GGUF + quantize** — f16 7.5GB, Q4_K_M 2.4GB, Q3_K_M 2.0GB (11:18 JST 2026-05-22)
36. ✅ **Validate 4B** — 4/4 tests passed: A(vision critique), B(8/10 qualifying), C(3/5 no-sys), D(36 wrapper chars)
37. ⏳ **Release (4B Lite)**
38. ✅ **Head-to-head validation generated** — 10 prompts × 2 models on RTX 3080 Ti
39. ✅ **Codex scoring on VPS** — fine-tuned +1.00 avg over base (5.50 vs 4.50, 6/10 wins)
40. ✅ **Update HF READMEs with validated scores** — head-to-head table added to both 8B and 4B
41. ⏳ **Reddit r/LocalLLaMA post**
42. ✅ **Self-improvement loop — base model** — 4.00/10 avg (regressed -0.50 from 4.50 first-pass)
43. ⏳ **Self-improvement loop — fine-tuned** — BLOCKED (inference infra; needs Ollama 0.22.1+ with Qwen3-VL)

---

## Step 20 — Qualifying Conversation Traces ✅ COMPLETE

**Result:** 254 records (150 ask / 104 immediate = 59% ask ratio — within 55-65% target)

**Files:**
- Script: `src/generate-conversations.ts`
- Output: `output/qualifying-conversations.jsonl`
- Final merged: `output/dataset-final.jsonl` (dataset-clean.jsonl + qualifying-conversations.jsonl)

**Generation notes (for if regeneration ever needed):**
- Two passes: Pass 1 (vague → questions), Pass 2 (clear → immediate build)
- 5 conversations per batch (not 10 — reduces timeout risk)
- 480s Codex timeout — content-heavy domains generate long HTML
- Persona × domain injection per batch for diversity (5 personas × 14 domains)
- Early exit guard at 250 total records
- If Codex daily quota exhausted: switch to `claude -p` (identical pattern, no quota)
- Spot-check before merging: ask/immediate ratio, CDN links, malformed records

**Trigger logic model learns:**
- Ask questions when: full page/site/app requested with no detail
- Don't ask when: component request, or user already specified enough

---

## Step 20.5 — Evaluation Pass ✅ COMPLETE

**Results:** 475 passed Stage A, 0 excluded by score, `dataset-clean.jsonl` = 2,835 records
Score distribution: 9→303 (65%), 8→141 (30%), 7→17 (4%), 6→4 (1%), <6→0

### Files
- Script: `src/evaluate.ts`
- Input: `output/component-*-run*/improved.html` (506 files)
- Input: `output/component-*-run*/metadata.json` (prompt source)
- Input: `output/dataset.jsonl` (2,836 records to filter)
- Output: `output/pre-scores.jsonl` (Stage A results)
- Output: `output/scores.jsonl` (final scores per component)
- Output: `output/eval-summary.json` (aggregate stats)
- Output: `output/dataset-clean.jsonl` ← filtered dataset (2,835 records)

### Scoring rubric (max 9 points)

**Stage A — Bun regex (visual score, 0-3):**
- Color regex: `/(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|var\(--)/ig`
- Measurement regex: `/\d+(px|rem|em|vh|vw|%)/i`
- Hard gate: fail if `https://` in file (except w3.org/placeholder.com) OR file <500 chars

**Stage B — `claude -p` LLM scoring (5 per batch):**
- ALIGNMENT (0-3): does HTML match requested component type?
- INTERACTIVITY (0-3): context-aware — interactive vs display types
- Exclusion threshold: total < 6/9

---

## Step 21 — Fine-Tune Qwen3-VL-8B ⏳

**Instance:** frontend-dataset-clone-V2
**SSH:** `ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host>`
**Input:** `output/dataset-final.jsonl` (3,089 records)

Pre-conditions:
- dataset-final.jsonl complete ✅ (3,089 records)
- Baseline confirmed fine-tune needed ✅ (Test 2: 1/10)
- V2 instance provisioned ✅ (port <PORT>, CUDA 13.2, 200GB disk)

### SWIFT Install on V2

```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host>
pip install ms-swift -U --index-url https://pypi.tuna.tsinghua.edu.cn/simple
swift --version   # confirm: ms-swift 4.2.1

# Also required (SWIFT 4.2.1 does not install these automatically):
pip install qwen-vl-utils decord bitsandbytes \
  --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Pre-run checklist

```bash
pkill -f ollama          # free VRAM (mmproj holds 1.08GB idle)
nvidia-smi               # confirm GPU free
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
```

### CRITICAL — 32×32 patch size

Qwen3-VL uses **32×32 pixel patches**, NOT 28×28 like Qwen2.5-VL.
Wrong value = silent image mis-sizing → OOM on 1200+ token images.

### CRITICAL — Image paths are relative

Dataset uses **relative paths** (`output/component-000-run0/screenshot-desktop.png`).
Swift must be launched from `/root/autodl-tmp/frontend-design-dataset/` or paths won't resolve.

### Smoke test (always run first)

```bash
cd /root/autodl-tmp/frontend-design-dataset
pkill -f ollama 2>/dev/null || true   # free VRAM before starting
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
swift sft \
  --model /root/autodl-tmp/Qwen3-VL-8B-Instruct-HF \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset /root/autodl-tmp/frontend-design-dataset/output/dataset-final.jsonl \
  --num_train_epochs 1 \
  --max_steps 10 \
  --image_min_pixels $((256 * 32 * 32)) \
  --image_max_pixels $((1280 * 32 * 32)) \
  --tune_mm_vision False \
  --gradient_checkpointing True \
  --load_in_4bit True \
  --output_dir /root/autodl-tmp/finetune-smoke \
  2>&1 | tee /tmp/smoke.log
# Loss should drop by step 5. Flat/spiking = config problem — fix before full run.
# After step 10: check nvidia-smi VRAM usage.
#   <20GB used → safe to try BF16 (remove --load_in_4bit True for higher quality)
#   >24GB used → keep 4-bit
```

### BF16 vs QLoRA decision

After smoke test, run `nvidia-smi` and check GPU memory used:
- **Under 20GB**: Full BF16 fine-tune is viable. Remove `--load_in_4bit True`. Higher quality gradients, same 3 epochs.
- **20–24GB**: Borderline — keep 4-bit to be safe.
- **Over 24GB**: Keep `--load_in_4bit True` (required to fit in 32GB).

### Full fine-tune command

```bash
cd /root/autodl-tmp/frontend-design-dataset
pkill -f ollama 2>/dev/null || true
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
swift sft \
  --model /root/autodl-tmp/Qwen3-VL-8B-Instruct-HF \
  --model_type qwen3_vl \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset output/dataset-final.jsonl \
  --num_train_epochs 3 \
  --max_pixels $((1280 * 32 * 32)) \
  --max_length 4096 \
  --per_device_train_batch_size 1 \
  --gradient_accumulation_steps 4 \
  --freeze_vit True \
  --gradient_checkpointing True \
  --quant_bits 4 \
  --quant_method bnb \
  --output_dir /root/autodl-tmp/finetune-output \
  2>&1 | tee /tmp/finetune.log
```

- Framework: SWIFT 4.2.1 (Alibaba's official Qwen training toolkit)
- Method: QLoRA NF4 + BF16 adapters, rank 32
- Hardware: RTX 5090 on V2 instance (32GB VRAM)
- Model path: `/root/autodl-tmp/Qwen3-VL-8B-Instruct-HF` (local, not HF hub string)
- Dataset path: relative (`output/dataset-final.jsonl`) — must run from dataset root
- Training time estimate: ~3-5 hours for 3,090 records at rank 32
- Output: merged checkpoint at `/root/autodl-tmp/finetune-output`

---

## Step 22 — Export GGUF + Quantize ⏳

**Confirmed workflow (researched 2026-05-22 while training runs):**
- `llama-quantize` build started in background on V2 → `/tmp/build-quantize.log`
- convert_hf_to_gguf.py at `/root/autodl-tmp/llama-mtp/convert_hf_to_gguf.py` — Qwen3-VL supported ✅
- mmproj reuse confirmed (see below)

### Pre-check: llama-quantize binary

```bash
# Verify build completed (started during training):
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> \
  "tail -3 /tmp/build-quantize.log"
# Expect: BUILD_DONE at end

# If not done yet, build manually:
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> \
  "cd /root/autodl-tmp/llama-mtp && cmake --build build --target llama-quantize -j\$(nproc)"

# Binary after build:
# /root/autodl-tmp/llama-mtp/build/bin/llama-quantize
```

### Vision encoder (mmproj) — REUSE EXISTING ✅

`--freeze_vit True` was used → vision encoder weights unchanged.
**No mmproj conversion needed.** Reuse directly:
```
/root/autodl-tmp/qwen-eval/qwen3-vl-8b-gguf/mmproj-F16.gguf  (1.1G)
```

### Checkpoint path

`save_steps=500` → intermediate saves at steps 500, 1000, 1500, 2000.
Final checkpoint (step 2319, after 3 epochs):
```
/root/autodl-tmp/finetune-output/v0-20260522-064424/checkpoint-2319
```
Verify after training: `ls /root/autodl-tmp/finetune-output/v0-20260522-064424/`

### Disk check before starting

```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> "df -h /root/autodl-tmp"
# Need: ~16GB (merge) + ~16GB (f16 GGUF) + ~5GB (Q4_K_M) + ~4GB (Q3_K_M) ≈ 41GB extra
```

### Part 1 — Merge LoRA adapters → HF format

```bash
# Run from dataset root (cd required — SWIFT uses relative paths for images)
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> bash <<'EOF'
cd /root/autodl-tmp/frontend-design-dataset
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
swift export \
  --model /root/autodl-tmp/Qwen3-VL-8B-Instruct-HF \
  --adapters /root/autodl-tmp/finetune-output/v0-20260522-064424/checkpoint-2319 \
  --output_dir /root/autodl-tmp/finetune-merged \
  --merge_lora True \
  --torch_dtype bfloat16
EOF
# IMPORTANT: SWIFT 4.2.1 ignores --output_dir for merge_lora.
# Merged model saves alongside the adapter as: checkpoint-2319-merged/
# Actual output: /root/autodl-tmp/finetune-output/v0-20260522-064424/checkpoint-2319-merged/ (~17GB)
# NOTE: --torch_dtype bfloat16 is REQUIRED — default float32 (32GB) exceeds RTX 5090 31.36GB VRAM
```

### Part 2 — Convert LM to GGUF

**`--mmproj` flag is NOT used** → produces LM GGUF only (vision encoder excluded).
We reuse the existing frozen mmproj instead.
**Use `python3`** — `python` is not in PATH on this AutoDL instance.

```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> bash <<'EOF'
cd /root/autodl-tmp/llama-mtp
python3 convert_hf_to_gguf.py \
  /root/autodl-tmp/finetune-output/v0-20260522-064424/checkpoint-2319-merged \
  --outtype f16 \
  --outfile /root/autodl-tmp/frontend-design-expert-f16.gguf
EOF
# Output: /root/autodl-tmp/frontend-design-expert-f16.gguf (~16.4GB)
# Note: use checkpoint-2319-merged path (SWIFT ignores --output_dir)
```

### Part 3 — Quantize

```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> bash <<'EOF'
/root/autodl-tmp/llama-mtp/build/bin/llama-quantize \
  /root/autodl-tmp/frontend-design-expert-f16.gguf \
  /root/autodl-tmp/frontend-design-expert-Q4_K_M.gguf \
  Q4_K_M

/root/autodl-tmp/llama-mtp/build/bin/llama-quantize \
  /root/autodl-tmp/frontend-design-expert-f16.gguf \
  /root/autodl-tmp/frontend-design-expert-Q3_K_M.gguf \
  Q3_K_M
EOF
# Q4_K_M: ~5GB | Q3_K_M: ~4GB
```

### Part 4 — Smoke test with llama-server

```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> \
  "/root/autodl-tmp/llama-mtp/llama-server \
    --model /root/autodl-tmp/frontend-design-expert-Q4_K_M.gguf \
    --mmproj /root/autodl-tmp/qwen-eval/qwen3-vl-8b-gguf/mmproj-F16.gguf \
    --port 11435 \
    --ctx-size 8192"
```

Target inference hardware:
- RTX 3060 12GB: Q4_K_M (~5GB LM + ~1.1GB mmproj = ~6.1GB + KV cache)
- M3/M4 Mac 16GB unified: Q4_K_M with ~64K context
- RTX 4070 12GB: Q3_K_M for more KV cache headroom

---

## Step 23 — Post-Fine-Tune Validation ⏳

Run 4-test protocol from CLAUDE.md before releasing. Targets:
- Test A (vision critique): 7+/10 (baseline: 5/10)
- Test B (qualifying questions): 6+/10 vague prompts trigger questions (baseline: 1/10)
- Test C (system prompt tax): ≤200 token system prompt sufficient
- Test D (markdown chatter): <20 wrapper tokens per response

See CLAUDE.md `## Post-Fine-Tune Validation Protocol` for full test prompts and pass criteria.

---

## Step 24 — Head-to-Head Validation (Apples-to-Apples) ✅ COMPLETE

True comparison: base Qwen3-VL-8B vs fine-tuned Qwen3-VL-8B on same 10 prompts.

### Instance used
RTX 3080 Ti 12GB (dbfb41b9f9-ce413e40) — clone of frontend-dataset-clone V1
SSH: `ssh -i ~/.ssh/id_ed25519 -p 24817 root@connect.westb.seetacloud.com`
Note: llama-server binary was Blackwell-only (sm_120) — had to install llama-cpp-python compiled for sm_86

### Test prompts
10 components from training data — `output/validation/test-prompts.json`
5 dark / 5 light, 6 categories (form, card, navbar, mobile, marketing, data)
All scored 8-9/9 in original eval pass (high quality baseline)

### Output size results
| Model | Avg chars | Min | Max |
|---|---|---|---|
| Fine-tuned 8B | 9,143 | 5,509 | 14,118 |
| Base 8B | 4,907 | 1,985 | 8,167 |
| Ratio | 1.9× | — | — |

Fine-tuned generates 1.9× more detailed HTML consistently across all component types.

### Files
- `output/validation/fine-tuned/` — 10 HTML + desktop PNGs
- `output/validation/base/` — 10 HTML + desktop PNGs
- `output/validation/test-prompts.json` — 10 test prompts with baseline scores

### Pending
- [ ] Codex GPT-5.4 scoring — `bun run score-validation` on VPS
- [ ] Update HuggingFace READMEs with real comparison scores
- [ ] Reddit r/LocalLLaMA post with validated results

---

## Step 25 — Codex Scoring ✅ COMPLETE

Fine-tuned +1.00 avg over base (apples-to-apples). Same model, hardware, judge, and critique prompt as training.

- Fine-tuned avg: 5.50/10 | Base avg: 4.50/10 | Delta: +1.00
- Fine-tuned wins: 6/10, ties: 3/10, loses: 1/10 (dark navbar only)
- Biggest improvement: mobile dark +5 (base 1 → fine-tuned 6)
- Results: `output/validation/fine-tuned-scores.jsonl`

---

## Step 26 — Update HuggingFace READMEs ✅ COMPLETE

Update both 8B and 4B HF READMEs with validated comparison scores.

---

## Step 27 — Reddit r/LocalLLaMA Post ⏳

Post validated comparison results to r/LocalLLaMA.

---

## Step 28 — Self-Improvement Loop Test ✅ COMPLETE (partial)

Tests whether models can critique and improve their own output.
No system prompt — pure behavior from trained weights.

### Results

| | Avg Score | Δ |
|---|---|---|
| Base first-pass | 4.50 | — |
| Base self-improved | **4.00** | **-0.50 (regressed)** |
| Fine-tuned first-pass | 5.50 | +1.00 vs base |
| Fine-tuned self-improved | **N/A** | Blocked — see note |

**Base finding:** The base model cannot reliably self-improve. 7/10 flat or regressed; component-003 (navbar) crashed 4→1. Critique-and-rewrite with a weak model makes designs worse.

**Fine-tuned blocked:** llama-cpp-python 0.3.23 does not support `chat_template_kwargs: {enable_thinking: false}`. The fine-tuned Qwen3-VL triggers thinking-mode EOS on vision input without this flag. llama-server binaries compiled for sm_86 (RTX 3080 Ti) in the available builds pre-date `qwen3vl` architecture support. This is an inference infrastructure limitation, not a model quality issue.

**Workaround for future runs:** Ollama 0.22.1+ with native Qwen3-VL support handles thinking suppression transparently. Alternatively, build llama.cpp from the latest source for sm_86.

### Output structure:
```
output/validation/
├── fine-tuned/              ← first-pass HTML + PNGs ✅
├── base/                    ← first-pass HTML + PNGs ✅
├── base-improved/           ← Turn 3 HTML + PNGs ✅ (10/10)
├── fine-tuned-improved/     ← 0/10 (blocked by inference infra)
└── self-improve-scores.jsonl ← base-improved scores ✅
```

### Checklist:
- [x] Verify instance health (port 24817)
- [x] Write src/self-improve-validation.ts
- [x] Generate Turn 2 + 3 for base model (10 components) ✅
- [ ] Generate Turn 2 + 3 for fine-tuned model — BLOCKED (inference infra)
- [x] Render base-improved outputs to PNG ✅
- [x] Rsync to VPS ✅
- [x] Score with GPT-5.4 — bun run self-improve ✅
- [x] Compare: first-pass vs self-improved for base ✅
- [ ] Repeat for fine-tuned — BLOCKED
- [ ] Repeat for 4B fine-tuned — deferred
- [ ] Update HuggingFace READMEs with self-improvement results
- [x] Reddit r/LocalLLaMA post drafted (output/marketing/reddit-post.md)

---

## Step 30 — Designer Lite: Fine-Tune Qwen3-VL-4B ✅ COMPLETE

Queue immediately after Step 22 (8B GGUF export) completes.
Target: 8GB GPU users (RTX 3060, older laptops, entry-level Macs).

**Download 4B weights (~9GB):**
```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> "
source /etc/network_turbo
modelscope download \
  --model Qwen/Qwen3-VL-4B-Instruct \
  --local_dir /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF
"
```

**Fine-tune command (BF16, no quantization needed on RTX 5090):**
```bash
ssh -i ~/.ssh/id_ed25519 -p <PORT> root@<your-autodl-host> "
cd /root/autodl-tmp/frontend-design-dataset
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
screen -S finetune-4b
swift sft \
  --model /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF \
  --model_type qwen3_vl \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset output/dataset-final.jsonl \
  --num_train_epochs 2 \
  --max_length 4096 \
  --max_pixels \$((1280 * 32 * 32)) \
  --freeze_vit True \
  --gradient_checkpointing True \
  --per_device_train_batch_size 2 \
  --gradient_accumulation_steps 2 \
  --output_dir /root/autodl-tmp/finetune-output-4b \
  2>&1 | tee /tmp/finetune-4b.log
"
```

**Configuration rationale:**
- BF16 (not 4-bit) — 4B has fewer parameters; cleaner gradients help it punch above its weight
- batch_size 2 + accum 2 = effective batch 4 — safe at ~18-20GB VRAM
- 2 epochs — 4B benefits from seeing data twice vs 8B's 3 epochs
- Same dataset (3,090 records) — no additional data work needed

**Expected:**
- VRAM: ~18-20GB (safe on RTX 5090)
- Speed: ~2.2 s/it (faster than 8B)
- Duration: ~2.2 hours (2 epochs × ~1,546 steps)
- Starting loss: expect ~0.5-0.7 (similar to 8B baseline)
- If step 1 loss ≥ 8.0: chat template mismatch — stop immediately

**Smoke test first (always):**
```bash
swift sft \
  --model /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF \
  --model_type qwen3_vl \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset output/dataset-final.jsonl \
  --num_train_epochs 1 \
  --max_steps 10 \
  --max_length 4096 \
  --max_pixels $((1280 * 32 * 32)) \
  --freeze_vit True \
  --gradient_checkpointing True \
  --per_device_train_batch_size 2 \
  --gradient_accumulation_steps 2 \
  --output_dir /root/autodl-tmp/finetune-smoke-4b
```

**Export after training (same workflow as 8B):**

Get mmproj for 4B base first — need to either find a pre-built one or generate it:
```bash
# Option A: download pre-built 4B GGUF (has mmproj) from HuggingFace
# Option B: generate mmproj from 4B weights using convert_hf_to_gguf.py --mmproj flag:
cd /root/autodl-tmp/llama-mtp
python convert_hf_to_gguf.py \
  /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF \
  --mmproj \
  --outfile /root/autodl-tmp/qwen3-vl-4b-mmproj-F16.gguf
```

```bash
# Merge LoRA
swift export \
  --model /root/autodl-tmp/Qwen3-VL-4B-Instruct-HF \
  --adapters /root/autodl-tmp/finetune-output-4b/v0-*/checkpoint-last \
  --output_dir /root/autodl-tmp/finetune-merged-4b \
  --merge_lora True

# Convert LM (no --mmproj → LM only)
cd /root/autodl-tmp/llama-mtp
python convert_hf_to_gguf.py /root/autodl-tmp/finetune-merged-4b \
  --outtype f16 \
  --outfile /root/autodl-tmp/frontend-design-lite-f16.gguf

# Quantize
/root/autodl-tmp/llama-mtp/build/bin/llama-quantize \
  /root/autodl-tmp/frontend-design-lite-f16.gguf \
  /root/autodl-tmp/frontend-design-lite-Q4_K_M.gguf \
  Q4_K_M

/root/autodl-tmp/llama-mtp/build/bin/llama-quantize \
  /root/autodl-tmp/frontend-design-lite-f16.gguf \
  /root/autodl-tmp/frontend-design-lite-Q3_K_M.gguf \
  Q3_K_M
```

**mmproj:** Reuse base Qwen3-VL-4B mmproj (vision encoder frozen — same as 8B approach).
Note: 4B mmproj is different from 8B — do NOT reuse the 8B `mmproj-F16.gguf`.

**Known limitation:** 4B may truncate complex HTML outputs more than 8B. Acceptable trade-off for 8GB GPU compatibility.

**Post-training validation:** Same 4-test protocol as 8B (CLAUDE.md `## Post-Fine-Tune Validation Protocol`).
Target: qualifying questions **5+/10** (lower bar than 8B's 6+/10 — smaller model).

---

## Step 20 Detail — Qualifying Conversation Traces (preserved for reference)

see also `## 13. Second Training Dataset — Qualifying Conversation Traces` in:
`/root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/FRONTEND-DESIGN-MODEL-CARD.md`

**Two pass approach (completed):**
- Pass 1 (20 batches × 5): vague request → clarifying questions → build (qualifying_conversation)
- Pass 2 (15 batches × 5): specific request → build immediately (immediate_conversation)
- Personas (5) + domains (14) randomized per batch — diversity via combinatorics
- Target: 200+ total, 55-65% ask type
- **Actual: 254 records, 59% ask ratio ✅**

**Spot-check commands (for future regeneration):**
```bash
# Check ask/immediate ratio
python3 -c "
import json
ask, immediate, malformed = 0, 0, 0
for line in open('output/qualifying-conversations.jsonl'):
    try:
        d = json.loads(line.strip())
        turns = len(d.get('messages', []))
        if turns >= 4: ask += 1
        elif turns == 2: immediate += 1
        else: malformed += 1
    except: malformed += 1
print(f'Ask: {ask} | Immediate: {immediate} | Ask ratio: {ask/(ask+immediate)*100:.0f}%')
"

# Check for CDN links
grep -c "cdn\|googleapis\|jsdelivr" output/qualifying-conversations.jsonl || echo "0 CDN hits"
```
