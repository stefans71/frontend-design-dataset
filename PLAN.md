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

## Output Directory Structure (final)

```
output/
├── component-000-run0/        ← run0, temp=0.5
│   ├── component.html
│   ├── metadata.json          ← includes prompt, temperature, outputSuffix
│   ├── screenshot-desktop.png
│   ├── screenshot-mobile.png
│   ├── critique.md
│   └── improved.html
├── ...
├── component-099-run4/        ← run4, temp=1.1
├── dataset-run0.jsonl         ← per-run JSONL (573 records)
├── dataset-run1.jsonl         ← 558 records
├── dataset-run2.jsonl         ← 573 records
├── dataset-run3.jsonl         ← 534 records
├── dataset-run4.jsonl         ← 598 records
├── dataset.jsonl              ← concatenated ~2,836 records
├── pre-scores.jsonl           ← Stage A eval results
├── scores.jsonl               ← final per-component scores
├── eval-summary.json          ← aggregate eval stats
├── dataset-clean.jsonl        ← post-eval (2,835 records, 0 excluded)
├── qualifying-conversations.jsonl  ← 254 conversation traces
└── dataset-final.jsonl        ← ← ← FINE-TUNE INPUT (3,089 records)
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
24. ⏳ **Verify V2 fine-tune instance health** (port 25615)
25. ⏳ **Install SWIFT on V2 instance**
26. ⏳ **Rsync dataset-final.jsonl to V2 instance**
27. ⏳ **Pre-training smoke test** (10 steps, loss drops by step 5)
28. ⏳ **Full QLoRA fine-tune** — see Step 21 below
29. ⏳ **Export GGUF + quantize** — see Step 22 below
30. ⏳ **Post-fine-tune validation** — 4-test protocol (see CLAUDE.md)
31. ⏳ **Test on Ollama** (RTX 3060 12GB target hardware)
32. ⏳ **Release**

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
**SSH:** `ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com`
**Input:** `output/dataset-final.jsonl` (3,089 records)

Pre-conditions:
- dataset-final.jsonl complete ✅ (3,089 records)
- Baseline confirmed fine-tune needed ✅ (Test 2: 1/10)
- V2 instance provisioned ✅ (port 25615, CUDA 13.2, 200GB disk)

### SWIFT Install on V2

```bash
ssh -i /root/.ssh/id_ed25519 -p 25615 root@connect.westd.seetacloud.com
pip install ms-swift -U
# If pip is slow on China network:
pip install ms-swift --index-url https://pypi.tuna.tsinghua.edu.cn/simple
swift --version   # confirm install
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

### Smoke test (always run first)

```bash
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
swift sft \
  --model Qwen/Qwen3-VL-8B-Instruct \
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
  --output_dir /root/autodl-tmp/finetune-smoke
# Loss should drop by step 5. Flat/spiking = config problem — fix before full run.
```

### Full fine-tune command

```bash
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
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
  --load_in_4bit True \
  --output_dir /root/autodl-tmp/finetune-output
```

- Framework: SWIFT (Alibaba's official Qwen training toolkit)
- Method: QLoRA NF4 + BF16 adapters, rank 32
- Hardware: RTX 5090 on V2 instance (fits at 8B QLoRA — 32GB VRAM)
- Training time estimate: ~3-5 hours for 3,089 records at rank 32
- Output: merged checkpoint at `/root/autodl-tmp/finetune-output`

---

## Step 22 — Quantize and Release ⏳

```bash
# Export to GGUF via llama.cpp
python convert_hf_to_gguf.py /root/autodl-tmp/finetune-output --outtype f16
llama-quantize model-f16.gguf model-q4_k_m.gguf Q4_K_M
llama-quantize model-f16.gguf model-q3_k_m.gguf Q3_K_M
```

Target inference hardware:
- RTX 3060 12GB: Q4_K_M (~5.5GB LM + ~2GB ViT = ~7.5GB + KV cache)
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
