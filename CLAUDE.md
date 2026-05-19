# frontend-design-dataset

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

## Last Updated

2026-05-19 23:30:00 JST

## Current Status

- Full 20-component run complete — generate, render, critique, improve, package all working
- 20/20 components generated and rendered (AutoDL RTX 5090)
- 20/20 critiques complete (4.2–6.2 KB each, pixel-level feedback, scores 4–7/10)
- 20/20 improved.html files generated (300s timeout; data table 017 needed retry)
- dataset.jsonl: 100 training records (20×each of 5 types) — 1.5 MB
- Scores: median 6/10, range 4–7. Dramatic visual improvements confirmed in browser (003: 4/10 → full landing page)
- Ready to scale to 2,500 records (100 prompts × 5 quality variants)

## Critical Fixes Applied (do not revert)

- **generate.ts system prompt:** inline CSS only, zero external resources, no Tailwind CDN — AutoDL China network blocks CDN connections which breaks Playwright networkidle
- **render.ts:** uses `waitUntil: "networkidle"` which works correctly now that HTML is self-contained
- **critique.ts:** `CRITIQUE_PROMPT` must come **before** `-i` flag in Codex CLI command — `-i FILE...` is variadic and consumes the prompt string as a second image path if placed after; also `stdin: "ignore"` required; output parser extracts response printed after `tokens used\n{count}\n`

## Architecture — Two Machine Split

```
AutoDL (RTX 5090)                    VPS Japan (hostdzire)
─────────────────                    ─────────────────────
Stage 1: bun run generate
Stage 2: bun run render
         ↓ rsync
                                     Stage 3:  bun run critique
                                     Stage 3b: bun run improve
                                     Stage 4:  bun run package
```

## SSH Access

```bash
# VPS → AutoDL
ssh -i /root/.ssh/id_ed25519 -p 33472 root@connect.westc.seetacloud.com
# Note: port 33472 changes on every AutoDL reboot — check AutoDL web UI
```

## AutoDL Startup Sequence

```bash
# 1. SSH in
ssh -i /root/.ssh/id_ed25519 -p <PORT> root@connect.westc.seetacloud.com
# 2. Start servers
bash /root/autodl-tmp/start.sh
# 3. In new terminal on VPS — update tunnel port if rebooted
# edit /etc/systemd/system/autodl-tunnel.service, then:
sudo systemctl daemon-reload && sudo systemctl restart autodl-tunnel.service
```

## Full Run Sequence

```bash
# On AutoDL:
cd /root/autodl-tmp/frontend-design-dataset
source autodl-run.sh
bun install --registry https://registry.npmmirror.com
TEST_MODE=false bun run generate    # generates all components
TEST_MODE=false bun run render      # renders all to PNG

# On VPS:
bash scripts/rsync-from-autodl.sh <PORT>
TEST_MODE=false bun run critique    # Codex CLI critiques all
TEST_MODE=false bun run improve     # Codex CLI generates improved HTML
bun run package                     # assembles dataset.jsonl
```

## Next Steps

1. Scale to 2,500 records (expand prompts to 100, run 5 quality variants each)
2. Fine-tune Qwen3-VL-8B on the dataset

---

## Pipeline Stages

1. **generate.ts** — Generate HTML/CSS components via llama-server (OpenAI-compatible API)
2. **render.ts** — Render HTML to desktop + mobile PNG screenshots via Playwright
3. **critique.ts** — Send screenshots to Codex CLI (gpt-5.4) for structured design critique
4. **improve.ts** — Send screenshot + HTML + critique to Codex CLI → improved.html (Stage 3b)
5. **package-dataset.ts** — Assemble JSONL with 5 record types per component
6. **pipeline.ts** — Orchestrates all stages in sequence with JST timestamps

## Training Record Types (package-dataset.ts)

1. `prompt_to_html` — text prompt → original HTML (generation knowledge)
2. `screenshot_to_critique` — desktop screenshot → critique (visual critique learning)
3. `screenshot_to_code` — desktop screenshot → original HTML (visual-to-code)
4. `screenshot_html_to_critique` — screenshot + HTML → critique (full-context critique)
5. `screenshot_code_critique_to_improved` — screenshot + HTML + critique → improved HTML **(most valuable)**

## Codex Timeout Notes

- critique.ts: 120s per component — sufficient for text output
- improve.ts: 300s per component — HTML output can be 3–5× larger than original
- Complex components (data table 13KB, search+filters 9KB) occasionally need retry

## Tech Stack

- **Runtime:** Bun + TypeScript
- **Rendering:** Playwright (Chromium)
- **Critique:** Codex CLI (`codex exec`)
- **LLM:** llama-server at `localhost:11434`, model `qwen3.6-27b-mtp`

## llama-server API

- Endpoint: `${LLAMA_SERVER_URL}/v1/chat/completions`
- OpenAI-compatible chat completions API
- **Always** include `chat_template_kwargs: { enable_thinking: false }` in every request — the model defaults to thinking mode which wraps output in think tags
- Model string: `qwen3.6-27b-mtp`

## Codex CLI

Confirmed working command:

```bash
# IMPORTANT: prompt MUST come before -i flag
codex exec -m gpt-5.4 --dangerously-bypass-approvals-and-sandbox --ephemeral "prompt" -i screenshot.png
```

- Output format: header block → `user` → prompt → `codex` → response → `tokens used` → count → **response repeated** (use this copy)
- Runs sequentially only (no parallelism)
- Timeout: 120 seconds per invocation
- Auth: ChatGPT OAuth via `/root/.codex/auth.json` (no API key needed)

## Playwright on AutoDL

- Env var required: `PLAYWRIGHT_BROWSERS_PATH=/root/autodl-tmp/pw-browsers`
- Chromium installed at that path
- One browser instance per component (open → screenshot → close)

## AutoDL Environment

- Bun: `/root/autodl-tmp/bun/bin/bun`
- Node: `/root/autodl-tmp/node-v22.15.0-linux-x64/bin`
- **Always** run `source autodl-run.sh` before any bun commands
- Rsync to AutoDL: `bash scripts/rsync-to-autodl.sh 33472` (port changes on AutoDL reboot)
- Rsync from AutoDL: `bash scripts/rsync-from-autodl.sh 33472`

## Key Constraints

- Codex CLI is sequential — no parallel critique calls
- One Playwright browser per component (open → screenshot → close)
- Resume support: skip components that already have output files
- `TEST_MODE=true` + `TEST_COUNT=3` runs only first 3 components
- HTML must be fully self-contained (inline CSS only) — no external resources

## GitHub

https://github.com/stefans71/frontend-design-dataset
