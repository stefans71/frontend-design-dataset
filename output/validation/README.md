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
| Fine-tuned self-improved | N/A | Blocked — see note |

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

### Fine-Tuned Self-Improvement — Blocked

The fine-tuned model's self-improvement test could not run. Root cause: the fine-tuned Qwen3-VL model's thinking mode interferes with vision inference in llama-cpp-python 0.3.23. The `chat_template_kwargs: {enable_thinking: false}` parameter is not supported in this library version. llama-server (which supports this flag natively) was not available with a binary compiled for sm_86 (RTX 3080 Ti) that also supports the `qwen3vl` model architecture.

**Workaround for future runs:** Use Ollama 0.22.1+ with native Qwen3-VL support and the `num_ctx` parameter — Ollama handles thinking-mode suppression transparently.

### Hardware / Inference

- **Hardware:** AutoDL RTX 3080 Ti (sm_86, 12GB VRAM)
- **Base model inference:** llama-cpp-python 0.3.23, Qwen25VLChatHandler, n_ctx=4096
- **Fine-tuned model inference:** Blocked (see above)
- **Judge:** GPT-5.4 via Codex CLI (`bun run self-improve`)

---

## Files

- `test-prompts.json` — 10 validation prompts with original pipeline scores
- `fine-tuned/` — HTML + PNG for fine-tuned model outputs
- `base/` — HTML + PNG for base model outputs
- `fine-tuned-scores.jsonl` — Full GPT-5.4 critiques and scores per component
- `base-improved/` — Self-improved base model HTML + PNGs (10/10)
- `self-improve-scores.jsonl` — GPT-5.4 scores for self-improved outputs
