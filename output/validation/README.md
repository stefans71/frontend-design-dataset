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

## Files

- `test-prompts.json` — 10 validation prompts with original pipeline scores
- `fine-tuned/` — HTML + PNG for fine-tuned model outputs
- `base/` — HTML + PNG for base model outputs
- `fine-tuned-scores.jsonl` — Full GPT-5.4 critiques and scores per component
