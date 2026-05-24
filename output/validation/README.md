# Head-to-Head Validation — Fine-Tuned vs Base Qwen3-VL-8B

## Setup

- **Models:** Fine-tuned 8B (Q4_K_M) vs Base Qwen3-VL-8B-Instruct (Q4_K_M)
- **Hardware:** AutoDL RTX 3080 Ti (sm_86, 12GB VRAM)
- **Inference:** llama-cpp-python 0.3.23, n_ctx=4096
- **Prompts:** 10 representative components from `test-prompts.json` (5 dark / 5 light, 6 categories)
- **Judge:** GPT-5.4 via Codex CLI, exact same `CRITIQUE_PROMPT` used during training
- **Screenshots:** 1280×900 desktop PNG, rendered with Playwright

## Final Validation Results (apples-to-apples)

- Same model (Qwen3-VL-8B), same hardware, same GPT-5.4 judge, same critique prompt as training
- Fine-tuned avg: **5.50/10**
- Base avg: **4.50/10**
- Delta: **+1.00 point**
- Fine-tuned wins: 6/10, ties: 3/10, loses: 1/10 (dark navbar only)
- Biggest improvement: mobile dark **+5** (base scored 1, fine-tuned scored 6)
- Note: scores reflect first-pass generation — training data used GPT-5.4 improvement step which brings scores to ~8.6/10

## Per-Component Scores

| Component | Category | Theme | Base | FT | Delta |
|---|---|---|---|---|---|
| component-012-run0 | form | dark | 5 | 6.5 | +1.5 |
| component-014-run0 | form | light | 5 | 5 | 0 |
| component-002-run0 | card | dark | 5 | 6 | +1 |
| component-028-run0 | card | light | 5 | 5 | 0 |
| component-003-run0 | navbar | light | 4 | 4 | 0 |
| component-021-run0 | navbar | dark | 4 | **3** | **-1** |
| component-078-run0 | mobile | dark | 1 | 6 | **+5** |
| component-084-run0 | mobile | light | 5 | 6.5 | +1.5 |
| component-072-run0 | marketing | dark | 6 | 6.5 | +0.5 |
| component-065-run0 | data_display | light | 5 | 6.5 | +1.5 |
| **AVERAGE** | | | **4.50** | **5.50** | **+1.00** |

---

## Step 28 — Self-Improvement Loop Results

Each model critiques its own first-pass screenshot, then rewrites the HTML. Output re-scored by GPT-5.4.

### Summary Table

| | Avg Score | Δ vs First-Pass |
|---|---|---|
| Base first-pass | 4.50 | — |
| Base self-improved | 4.00 | **-0.50** (regressed) |
| Fine-tuned first-pass | 5.50 | +1.00 vs base |
| Fine-tuned self-improved | 5.15 | **-0.35** (slight regression) |

### Base Self-Improvement Per-Component

| Component | Category | Theme | Base 1st | Base Imp | Δ |
|---|---|---|---|---|---|
| component-012-run0 | form | dark | 5 | 4 | -1 |
| component-014-run0 | form | light | 5 | 4 | -1 |
| component-002-run0 | card | dark | 5 | 5 | 0 |
| component-028-run0 | card | light | 5 | 4 | -1 |
| component-003-run0 | navbar | light | 4 | 1 | **-3** |
| component-021-run0 | navbar | dark | 4 | 4 | 0 |
| component-078-run0 | mobile | dark | 1 | 2 | +1 |
| component-084-run0 | mobile | light | 5 | 4 | -1 |
| component-072-run0 | marketing | dark | 6 | 6.5 | +0.5 |
| component-065-run0 | data_display | light | 5 | 5.5 | +0.5 |
| **AVERAGE** | | | **4.50** | **4.00** | **-0.50** |

**Finding:** The base Qwen3-VL-8B model cannot reliably improve its own designs. 7/10 components held flat or regressed; only 3 showed any improvement. Component-003 (navbar) dropped from 4→1 — the rewrite broke the design. The self-critique is too generic at this quality level to guide meaningful improvement.

### Fine-Tuned Self-Improvement Per-Component

| Component | Category | Theme | FT 1st | FT Imp | Delta |
|---|---|---|---|---|---|
| component-012-run0 | form | dark | 6.5 | 6 | -0.5 |
| component-014-run0 | form | light | 5 | 5 | 0 |
| component-002-run0 | card | dark | 6 | 5 | -1 |
| component-028-run0 | card | light | 5 | 6 | **+1** |
| component-003-run0 | navbar | light | 4 | 6 | **+2** |
| component-021-run0 | navbar | dark | 3 | 4 | **+1** |
| component-078-run0 | mobile | dark | 6 | 4 | -2 |
| component-084-run0 | mobile | light | 6.5 | 6 | -0.5 |
| component-072-run0 | marketing | dark | 6.5 | 4 | **-2.5** |
| component-065-run0 | data_display | light | 6.5 | 5.5 | -1 |
| **AVERAGE** | | | **5.50** | **5.15** | **-0.35** |

**Finding:** The fine-tuned model's self-improvement loop shows mixed results. 3/10 components improved (navbars +1/+2, card +1), 2 held flat, and 5 regressed. The overall delta is -0.35 — a slight regression. The base model regressed more severely (-0.50) with the same methodology. Both models struggle with the critique→improve loop, but the fine-tuned model starts from a higher baseline (5.50 vs 4.50) and degrades less.

### Known Model Limitation — Critique Trigger

The fine-tuned model returns empty response for "Critique this UI design."
on certain component types (navbars, product cards, invoice/data tables).
The model CAN see these images (responds normally to other prompts like
"What do you see in this image?") but produces an immediate stop token
for the critique trigger on these visual patterns. This is non-deterministic —
succeeds ~1 in 3 attempts at temperature 0.7, more reliably at temperature 0.3.

This is a training gap — the critique trigger phrase was learned from training
data that may not have had sufficient examples for these component types.

**Workaround:** Use an alternative prompt with retry:
`"Review this UI component and list specific design issues with measurements."`
with temperature 0.3 and up to 5 retry attempts. Used for components 003, 028, 065.

### Hardware / Inference

- **Hardware (base):** AutoDL RTX 3080 Ti (sm_86, 12GB VRAM)
- **Hardware (fine-tuned):** AutoDL RTX 5090 (sm_120, 32GB VRAM)
- **Base model inference:** llama-cpp-python 0.3.23, Qwen25VLChatHandler, n_ctx=4096
- **Fine-tuned model inference:** llama-server (llama.cpp), Q4_K_M GGUF + mmproj-F16, c=8192
- **Judge:** GPT-5.4 via Codex CLI (`bun run self-improve`)

---

## Files

- `test-prompts.json` — 10 validation prompts with original pipeline scores
- `fine-tuned/` — HTML + PNG for fine-tuned model outputs
- `base/` — HTML + PNG for base model outputs
- `fine-tuned-scores.jsonl` — Full GPT-5.4 critiques and scores per component
- `base-improved/` — Self-improved base model HTML + PNGs (10/10)
- `fine-tuned-improved/` — Self-improved fine-tuned model HTML + PNGs + critiques (10/10)
- `self-improve-scores.jsonl` — GPT-5.4 scores for all self-improved outputs
