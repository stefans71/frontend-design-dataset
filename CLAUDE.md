# frontend-design-dataset

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

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
codex exec -m gpt-5.4 --dangerously-bypass-approvals-and-sandbox --ephemeral -i screenshot.png "prompt"
```

- Output is plain text to stdout
- Last lines are token count metadata — strip those, everything before is the response
- Runs sequentially only (no parallelism)
- Timeout: 120 seconds per invocation

## Playwright on AutoDL

- Env var required: `PLAYWRIGHT_BROWSERS_PATH=/root/autodl-tmp/pw-browsers`
- Chromium installed at that path
- One browser instance per component (open → screenshot → close)

## AutoDL Environment

- Bun: `/root/autodl-tmp/bun/bin/bun`
- Node: `/root/autodl-tmp/node-v22.15.0-linux-x64/bin`
- **Always** run `source autodl-run.sh` before any bun commands
- Rsync: `bash scripts/rsync-to-autodl.sh 33472` (port changes on AutoDL reboot)

## Key Constraints

- Codex CLI is sequential — no parallel critique calls
- One Playwright browser per component (open → screenshot → close)
- Resume support: skip components that already have output files
- `TEST_MODE=true` + `TEST_COUNT=3` runs only first 3 components

## GitHub

https://github.com/stefans71/frontend-design-dataset

## Current Status

Scaffold complete. No implementation written yet.

## Next Steps

Implement in this order:
1. Stage 1: `generate.ts`
2. Stage 2: `render.ts`
3. Stage 3: `critique.ts`

Syntax check after each stage (`bun build --no-bundle src/<file>.ts`). Do not implement `pipeline.ts` yet.
