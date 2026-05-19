# frontend-design-dataset

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

## Last Updated

2026-05-19 22:16:38 JST

## Current Status

- Pipeline fully working end to end — all 3 stages tested clean
- 3 test components generated, rendered, and critiqued successfully
- Critique files are 4–5 KB with specific pixel-level design feedback and scores
- Ready to scale to full 20-component run, then 2,500 records

## Critical Fixes Applied (do not revert)

- **generate.ts system prompt:** inline CSS only, zero external resources, no Tailwind CDN — AutoDL China network blocks CDN connections which breaks Playwright networkidle
- **render.ts:** uses `waitUntil: "networkidle"` which works correctly now that HTML is self-contained
- **critique.ts:** `CRITIQUE_PROMPT` must come **before** `-i` flag in Codex CLI command — `-i FILE...` is variadic and consumes the prompt string as a second image path if placed after; also `stdin: "ignore"` required; output parser extracts response printed after `tokens used\n{count}\n`

## Architecture — Two Machine Split

```
AutoDL (RTX 5090)                    VPS Japan (hostdzire)
─────────────────                    ─────────────────────
Stage 1: bun run generate            Stage 3: bun run critique
Stage 2: bun run render              (Codex CLI lives here only)
         ↓
bash scripts/rsync-from-autodl.sh <PORT>
         ↓
              VPS runs critique
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
TEST_MODE=false bun run generate    # generates all 20 components
TEST_MODE=false bun run render      # renders all 20 to PNG

# On VPS:
bash scripts/rsync-from-autodl.sh <PORT>
TEST_MODE=false bun run critique    # Codex CLI critiques all 20

# Then package (not implemented yet):
bun run package
```

## Next Steps

1. Run full 20-component test (`TEST_MODE=false`) — validate all prompts produce good output
2. Implement `pipeline.ts` — orchestrates all stages in sequence with proper error handling
3. Implement `package-dataset.ts` — assembles JSONL training records from all component outputs
4. Scale to 2,500 records (expand prompts to 100, run 5 quality variants each)
5. Fine-tune Qwen3-VL-8B on the dataset

---

## Pipeline Stages

1. **generate.ts** — Generate HTML/CSS components via llama-server (OpenAI-compatible API)
2. **render.ts** — Render HTML to desktop + mobile PNG screenshots via Playwright
3. **critique.ts** — Send screenshots to Codex CLI (gpt-5.4) for structured design critique
4. **package-dataset.ts** — Assemble JSONL training records from all artifacts

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
