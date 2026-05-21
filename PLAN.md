# Implementation Plan

## Status

Full 500-component run IN PROGRESS on AutoDL westd (2026-05-20).
Run0+run1 generate+render complete. Run2 partial (56/100). Run3 in progress. Run4 queued.
VPS processing critique+improve for run0+run1 in parallel.

See CLAUDE.md `## Current Run Status` table for live state.

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

## Stage 1 — generate.ts

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

## Stage 2 — render.ts

### Env vars
- `OUTPUT_SUFFIX` — filters component dirs by suffix
- `PLAYWRIGHT_BROWSERS_PATH` — must be set (autodl-run.sh handles this)

### Function: `renderAll(): Promise<void>`
- Desktop screenshot: 1280×900, fullPage
- Mobile screenshot: 390×844, fullPage
- Wait strategy: `waitUntil: "domcontentloaded"` + 3000ms (**not** networkidle — causes timeouts)
- Per-component try/catch — log FAILED and continue (do not crash whole run)
- One browser instance per component (open → screenshot → close) — prevents OOM accumulation
- Skip if both PNGs already exist (resume support)

---

## Stage 3 — critique.ts

### Env vars
- `OUTPUT_SUFFIX` — filters dirs
- `CODEX_MODEL` — model string (default: gpt-5.4)

### Function: `critiqueAll(): Promise<void>`
- **CRITICAL:** prompt must come BEFORE `-i` flag in Codex CLI command
- Add `stdin: "ignore"` to Bun.spawn
- Sequential only — no parallelism
- Timeout: 120s per component
- Skip if `critique.md` exists (resume support)

---

## Stage 3b — improve.ts

### Function: `improveComponent(id, originalPrompt?): Promise<void>`
- Reads `screenshot-desktop.png` + `component.html` + `critique.md`
- Passes `originalPrompt` as scope constraint in Codex prompt:
  > "Original user intent: [prompt]. Improve the component staying within this scope."
- Falls back to generic scope instruction if no prompt provided
- Timeout: 300s (HTML output 3–5× larger than critique)
- Skip if `improved.html` exists (resume support)

### Function: `improveAll(testMode, testCount): Promise<void>`
- Reads `OUTPUT_SUFFIX` from env, filters dirs
- Reads `metadata.json` per component → passes prompt to `improveComponent`

---

## Stage 4 — package-dataset.ts

### Six record types per component *(mobile_to_code added 2026-05-20)*

1. **`prompt_to_html`** — text prompt → original HTML
2. **`screenshot_to_critique`** — desktop PNG → critique text
3. **`screenshot_to_code`** — desktop PNG → original HTML
4. **`mobile_to_code`** — mobile PNG → original HTML *(free extra record, same HTML target)*
5. **`screenshot_html_to_critique`** — desktop PNG + HTML → critique
6. **`screenshot_code_critique_to_improved`** — desktop PNG + original prompt + HTML + critique → improved HTML **(most valuable)**

Record type 6 includes original prompt so the model learns scope fidelity alongside design improvement.

### Function: `packageAll(): void`
- Reads `OUTPUT_SUFFIX` from env, filters dirs
- Writes to `DATASET_PATH` env var (default: `output/dataset.jsonl`)
- Writes `dataset-stats.json` alongside JSONL

### Expected counts (full run)
- 500 components × 6 record types = **~3,000 JSONL records**

---

## Temperature Variants — run-all-variants.sh

Five runs with different temperatures for training data diversity:

| Run  | Temperature | Expected output style |
|------|-------------|----------------------|
| run0 | 0.5 | Conservative, precise, fewer hallucinations |
| run1 | 0.7 | Balanced (default) |
| run2 | 0.85 | Slightly more creative |
| run3 | 1.0 | More varied, occasional quirks |
| run4 | 1.1 | Most creative, monitor for malformed output |

**Quality monitoring:** After each run, check median critique score.
- Target range: 5–7/10
- If run4 median < 5 → skip for training (too noisy)
- If run0 median > 7 → consider raising minimum temperature

**run-all-variants.sh** — do NOT use `set -e`. One crash should log and continue, not kill the job.

---

## Output Directory Structure

```
output/
├── component-000-run0/        ← run0, temp=0.5
│   ├── component.html
│   ├── metadata.json          ← includes prompt, temperature, outputSuffix
│   ├── screenshot-desktop.png
│   ├── screenshot-mobile.png
│   ├── critique.md
│   └── improved.html
├── component-000-run1/        ← run1, temp=0.7
├── ...
├── component-099-run4/        ← run4, temp=1.1
├── dataset-run0.jsonl         ← per-run JSONL
├── dataset-run1.jsonl
├── ...
├── dataset.jsonl              ← final concatenated (all 5 runs)
└── dataset-stats.json
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
18. 🔄 VPS critique+improve+package for run2+run3+run4 (run4 in progress ~05:35 UTC)
19. ⏳ Concatenate: `cat output/dataset-run*.jsonl > output/dataset.jsonl` (~3,000 records)
20.5. ⏳ Sub-agent eval pass → `output/scores.jsonl` (exclude components scoring <5/8)
20. ⏳ Generate 200-300 qualifying conversation traces on VPS (Codex CLI)
21. ⏳ Pre-training smoke test (10 steps, confirm loss dropping by step 5)
22. ⏳ Fine-tune Qwen3-VL-8B on combined dataset (~3,200-3,400 records, QLoRA)
23. ⏳ Quantize to Q4_K_M + Q3_K_M GGUF
24. ⏳ Post-training baseline retest (target: critique 7+/10, questions 8+/10)
22. ⏳ Quantize to Q4_K_M + Q3_K_M GGUF
23. ⏳ Test on Ollama (RTX 3060 12GB target)

---

## Step 20 — Qualifying Conversation Traces (200-400 records)
    see also ## 13. Second Training Dataset — Qualifying Conversation Traces in:
      /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/FRONTEND-DESIGN-MODEL-CARD.md
      

After the main dataset is complete, generate multi-turn conversations that teach the model
to ask follow-up questions on vague prompts. These are generated on VPS using Codex CLI.

**Why needed:** ~200-400 examples is sufficient to teach behavioral nudges (when/what to ask).
Base model already knows how to ask questions — we're teaching context-specific behavior.

**Generation command:**
```bash
codex exec -m gpt-5.4 \
  --dangerously-bypass-approvals-and-sandbox \
  --ephemeral \
  "Generate 10 multi-turn frontend design conversations in JSONL format.

Each conversation:
- Starts with a vague user request (website, app, landing page, dashboard)
- Assistant asks 2-3 focused qualifying questions
- User answers briefly  
- Assistant confirms tech approach and builds complete HTML/CSS/JS

Vary domains: restaurants, fitness, SaaS, portfolio, ecommerce, local businesses.
Vary vagueness: some very vague, some partially specified.
Output only valid JSONL, one conversation object per line."
```

Run 20-40 times = 200-400 examples.

**Trigger logic the model learns:**
- Ask questions when: full page/site/app requested with no tech stack or content detail
- Don't ask when: component request ("make me a button"), or user already specified enough

---

## Step 20.5 — Sub-Agent Eval Pass

After concat, before qualifying traces. Spawn Claude Sonnet 4.6 sub-agents via Task tool
inside Claude Code. Read `improved.html` source (not screenshots). Batch 20 per call.

**Scoring (8 pts total):**
- Interactivity (0-3): JS listeners + CSS transitions + state toggle = 3; hover/focus CSS only = 2; static = 1; broken = 0
- Visual Quality (0-3): hex colors + exact px + WCAG considered = 3; named colors + relative = 2; vague = 1; none = 0
- HTML Completeness (0-2): self-contained + no CDN + responsive = 2; minor issues = 1; broken = 0

**Output:** `output/scores.jsonl`:
```json
{"component": "component-003-run2", "interactivity": 2, "visual": 3, "completeness": 2, "total": 7, "notes": "..."}
```

**Exclusion:** filter `total < 5` before building final training split.

---

## Step 21 — Fine-Tune Qwen3-VL-8B

- Framework: SWIFT (Alibaba's official Qwen training toolkit)
- Method: QLoRA NF4 + BF16 adapters, rank 32
- Hardware: AutoDL H100 instance (or RTX 5090 — fits at 8B QLoRA)
- Training time estimate: ~3-5 hours for 3,400 records at rank 32
- Output: merged checkpoint → GGUF export

**CRITICAL — Qwen3-VL uses 32×32 patches (NOT 28×28 like Qwen2.5-VL). Wrong value = silent OOM.**

**SWIFT command:**
```bash
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
swift sft \
  --model Qwen/Qwen3-VL-8B-Instruct \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset output/dataset.jsonl \
  --num_train_epochs 3 \
  --output_dir ./output-finetune \
  --image_min_pixels $((256 * 32 * 32)) \
  --image_max_pixels $((1280 * 32 * 32)) \
  --tune_mm_vision False \
  --gradient_checkpointing True \
  --load_in_4bit True
```

**Pre-run checklist:**
- `pkill -f ollama` — free VRAM (mmproj holds 1.08GB idle)
- Smoke test first: add `--max_steps 10`, confirm loss drops by step 5
- Verify `image_min_pixels` uses `32*32` not `28*28`

---

## Step 22 — Quantize and Release

```bash
# Export to GGUF via llama.cpp
python convert_hf_to_gguf.py ./output-finetune --outtype f16
llama-quantize model-f16.gguf model-q4_k_m.gguf Q4_K_M
llama-quantize model-f16.gguf model-q3_k_m.gguf Q3_K_M
```

Target inference hardware:
- RTX 3060 12GB: Q4_K_M (~5.5GB LM + ~2GB ViT = ~7.5GB + KV cache)
- M3/M4 Mac 16GB unified: Q4_K_M with ~64K context
- RTX 4070 12GB: Q3_K_M for more KV cache headroom
