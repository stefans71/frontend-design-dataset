# Frontend Design Dataset V2 — Pi Harness Batch Test

## What We're Building
Testing whether the Pi Agent harness (pi-harness-stable) adds measurable design quality
beyond raw model inference on Qwen3.5-VL-8B base and fine-tuned models.

## The Test
3-condition comparison on same 10 prompts from ../output/validation/test-prompts.json:

| Condition | Model | Harness | Expected Score |
|---|---|---|---|
| A | Qwen3.5-VL-8B base | No | 4.50 (already done) |
| B | Qwen3.5-VL-8B fine-tuned | No | 5.50 (already done) |
| C | Qwen3.5-VL-8B base | Yes (web-design-batch) | ??? |
| D | Qwen3.5-VL-8B fine-tuned | Yes (web-design-batch) | ??? |

Scoring: GPT-5.4 via Codex CLI on VPS using same critique rubric as training.
Results go in: output/validation/pi-harness-scores.jsonl

## Key Findings So Far
- Pi harness uses single-turn nodes with artifact accumulation — NOT multi-turn Q&A
- 6 approval gates in web-design.yaml must be stripped → web-design-batch.yaml
- Harness is purely text-based — no vision/screenshots used
- Port 11434 llama-server OpenAI-compatible endpoint
- pi -p slash command support: UNCONFIRMED — test before batch run

## AutoDL Setup (RTX PRO 6000, ~$1/hr)
Clone from: 3080 Ti instance (dbfb41b9f9-ce413e40)
Zone: Northwest Area B

Boot sequence (5 SSH commands from VPS):
1. ssh in → bash /root/autodl-tmp/start.sh          # starts llama-servers
2. bash /root/autodl-tmp/setup-pi.sh                # PATH, PI config, symlinks
3. rsync pi-harness-stable from VPS to AutoDL        # push latest code
4. sed fix tsconfig + npm run build                  # fix VPS→AutoDL path diff
5. curl http://localhost:11434/health                # confirm llama-server up

Tsconfig gotcha: after every rsync, fix paths:
VPS path:    /usr/lib/node_modules
AutoDL path: /root/autodl-tmp/node-v22.15.0-linux-x64/lib/node_modules

PI version: v0.73.1 (pinned on AutoDL — don't upgrade during testing)
PI must run from project directory (finds .pi/workflows/ relative to cwd)

## Models on AutoDL (3080 Ti clone)
- Base 8B: /root/autodl-tmp/qwen-eval/qwen3-vl-8b-gguf/Qwen3-VL-8B-Instruct-Q4_K_M.gguf
- Fine-tuned 8B: /root/autodl-tmp/fine-tuned/mirror-Q4_K_M.gguf
- mmproj: /root/autodl-tmp/qwen-eval/qwen3-vl-8b-gguf/mmproj-F16.gguf

## Files in This Directory
- AUTODL-setup-research/autodl-resarch-060126.md   ← operational runbook
- web-design-batch.yaml                            ← TO CREATE (gates stripped)
- batch-test.sh                                    ← TO CREATE (loop script)
- parse-results.py                                 ← TO CREATE (adapt from parse-baseline.py)

## Pi Harness Location (VPS)
/root/tinkering/Local-LLMs/Local-LLM-Agent/pi-harness-stable/

## Test Prompts
/root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/output/validation/test-prompts.json
10 prompts: forms, cards, navbars, mobile, marketing, data_display
All from training data with existing baseline scores (8-9/9 GPT-5.4 quality)

## Scoring
bun run score-validation in frontend-design-dataset/
Script: src/score-validation.ts
Same GPT-5.4 critique rubric used during training
Output: output/validation/pi-harness-scores.jsonl

## Next Actions
1. Confirm pi -p slash command support (read CLI source)
2. Create web-design-batch.yaml (strip 6 gates from web-design.yaml)
3. Create batch-test.sh loop script
4. Rent RTX PRO 6000 on AutoDL, clone 3080 Ti
5. Run Condition C (base + harness, 10 prompts)
6. Run Condition D (fine-tuned + harness, 10 prompts)
7. Rsync outputs to VPS, score with Codex
8. Compare all 4 conditions, update HuggingFace README

## Related Projects
- Fine-tuned models: huggingface.co/stefans71/frontend-design-expert-8b
- Dataset site: qwen.data-analytics.space
- Main dataset repo: ../  (frontend-design-dataset)
- Pi harness: /root/tinkering/Local-LLMs/Local-LLM-Agent/pi-harness-stable/
