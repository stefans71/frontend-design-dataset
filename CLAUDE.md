# frontend-design-dataset

Synthetic frontend design training data pipeline for fine-tuning **Qwen3-VL-8B**. A local LLM generates HTML components, Playwright renders them to screenshots, Codex CLI critiques the designs, and the results are packaged as JSONL training records.

## Last Updated

2026-05-20 JST

## ⚡ Continue From Here (after /compact)

Read in this order before doing anything:
1. **This file** (CLAUDE.md) — full context
2. **PLAN.md** — implementation status (step 9 ✅, steps 10–12 ⏳)
3. **FRONTEND-DESIGN-MODEL-CARD.md** — acceptance criteria §7, training strategy §3
4. **Active plan file:** `/root/.claude/plans/giggly-foraging-nebula.md` — detailed implementation plan for the full run

**Next action:** Implement the plan — code changes first (generate.ts, package-dataset.ts), then write 95 prompts, then run 2-run smoke test before the full 500-component run.

---

## Current Status

- Full 20-component v1 run complete — 100 records, 1.5 MB dataset.jsonl
- v2 A/B test COMPLETE and VALIDATED — both fixes confirmed (see Session Notes 2026-05-20)
- **Plan written:** 100 prompts × 5 temperature variants = 500 components → ~3,000 records + 200–400 conversation traces
- Active AutoDL instance: westd, port 25180 (clone of original westc)

## Two Fixes Applied for v2

**Fix 1 — Natural language prompts (`COMPONENT_PROMPTS_V2`):**
Expert prompts (v1) use Tailwind class names and pixel values — not representative of real users.
`COMPONENT_PROMPTS_V2` rewrites the first 5 prompts the way a non-designer would ask:
intent + content + rough style direction, no technical specifics.
All 100 prompts for the full run will be natural language style.

**Fix 2 — Scope-aware improve.ts:**
v1 improve.ts had no concept of the original user intent, causing Codex to expand scope
(e.g. a navbar prompt became a full SaaS landing page). Now `improveComponent(id, originalPrompt?)`
reads the prompt from metadata.json and passes it as a scope constraint in the Codex prompt.
The type-5 training record also now includes the original prompt so the model learns scope fidelity.

## Critical Fixes Applied (do not revert)

- **generate.ts system prompt:** inline CSS only, zero external resources, no Tailwind CDN — CDN is not blocked but inline CSS produces better training data (model learns real CSS)
- **render.ts:** uses `waitUntil: "domcontentloaded"` + 3000ms buffer (changed from networkidle — domcontentloaded is faster and works with both inline CSS and CDN pages)
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
# ACTIVE instance (westd clone, 2026-05-20)
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com

# ON HOLD — original westc instance (may still be available)
# ssh -i /root/.ssh/id_ed25519 -p <PORT> root@connect.westc.seetacloud.com
# Note: port changes on every AutoDL reboot — check AutoDL web UI
```

## Rsync Scripts

Both scripts accept `PORT` (arg 1) and optional `HOST` (arg 2, default: connect.westd.seetacloud.com):

```bash
bash scripts/rsync-to-autodl.sh 25180                    # push code to westd
bash scripts/rsync-from-autodl.sh 25180                  # pull output from westd
bash scripts/rsync-to-autodl.sh <PORT> connect.westc.seetacloud.com   # use westc
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

## OUTPUT_SUFFIX — Versioned Output Dirs

Set `OUTPUT_SUFFIX=v2` to write to `component-000-v2/` dirs instead of `component-000/`.
V1 data is never touched. All stages (generate, render, critique, improve, package) read this env var.
When OUTPUT_SUFFIX is set, generate.ts automatically uses COMPONENT_PROMPTS_V2.

```bash
# v2 A/B test — 5 components, natural language prompts
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run generate
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run render
# ... rsync ...
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run critique
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run improve
OUTPUT_SUFFIX=v2 bun run package
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

1. Run v2 A/B test on AutoDL (5 components, natural language prompts) — validate both fixes
2. Compare v1 vs v2: base HTML quality, scope fidelity in improved.html
3. Scale to 2,500 records (100 natural language prompts × 5 quality variants)
4. Fine-tune Qwen3-VL-8B on the dataset

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
5. `screenshot_code_critique_to_improved` — screenshot + HTML + original prompt + critique → improved HTML **(most valuable)**; original prompt included as scope constraint

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

---

## Tailwind CDN Test Results — 2026-05-20 JST

**Result: TECHNICAL PASS** (all 3 criteria met), with important observations.

### What was tested
- `render.ts`: `domcontentloaded` + 3000ms (was `networkidle` + 1500ms) — **KEEP**
- `generate.ts`: SYSTEM_PROMPT instructs Tailwind CDN — **SEE BELOW**
- Ran 3 components with `OUTPUT_SUFFIX=tailwind-test` on AutoDL westd zone

### Results
- All 6 PNGs: 25K–111K (pass >15KB) ✓
- No Playwright timeout errors ✓
- Tailwind CDN loaded and rendered correctly for component-000 ✓

### Critical observation — prompt conflict
`COMPONENT_PROMPTS_V2` prompts end with `"Use only inline CSS — no external libraries."` which overrides the Tailwind system prompt. Only 1/3 components followed the CDN instruction; the other 2 produced inline CSS.

**Conclusion:**
- Tailwind CDN is **not blocked** on AutoDL westd China network
- `render.ts` change (domcontentloaded + 3000ms) is better in all cases — KEPT
- For training data: inline CSS remains preferred (model card §8) — prompts already enforce it
- generate.ts system prompt kept as Tailwind CDN for now, but COMPONENT_PROMPTS_V2 overrides it in practice

---

## Session Notes — 2026-05-20 08:43:21 JST

### Current Status
- All v2 code committed and pushed to GitHub
- AutoDL offline (rebooted, new SSH port needed from AutoDL web UI)
- v2 A/B test NOT yet run — waiting for AutoDL to come back online

### What's Ready to Run (exact commands)

```bash
# Step 1 — rsync new code to AutoDL
bash scripts/rsync-to-autodl.sh <NEW_PORT>

# Step 2 — AutoDL: generate + render v2
source autodl-run.sh
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run generate
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run render

# Step 3 — VPS: pull + critique + improve v2
bash scripts/rsync-from-autodl.sh <NEW_PORT>
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run critique
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run improve

# Step 4 — Compare v1 vs v2 for all 5 pairs visually
```

### What Changed This Session
- `COMPONENT_PROMPTS_V2`: 5 natural language rewrites (no Tailwind classes)
- `improve.ts`: now reads `metadata.json` and passes original prompt as scope constraint
- `OUTPUT_SUFFIX` env var: all 5 stages support versioned output dirs
- `package.json`: `test:v2` script added
- `PLAN.md`: Prompt Design Principles section added, 100-prompt mix table
- `CLAUDE.md`: both fixes documented

### After v2 Test Confirms
- Write all 80 remaining prompts in natural language style
- Scale to 100 prompts × 5 quality variants = 500 components = 2,500 JSONL records
- Full pipeline run on AutoDL

---

## Session Notes — 2026-05-20 JST (v2 test complete)

### New AutoDL Instance
- Host: connect.westd.seetacloud.com, port 25180 (clone of westc instance)
- All data confirmed present: Qwen3.6-27B GGUF, llama-server, bun, Playwright
- rsync scripts updated to accept HOST as second arg (default: westd)

### Tailwind CDN Test — PASS (CDN not blocked)
- cdn.tailwindcss.com DOES load from AutoDL westd China zone
- render.ts: `domcontentloaded` + 3000ms KEPT (better than networkidle for all cases)
- generate.ts: system prompt REVERTED to inline CSS (CDN works but inline CSS is better training data + COMPONENT_PROMPTS_V2 already enforce inline CSS)
- model card §8 updated: "CDN not blocked, inline CSS still preferred"

### v2 A/B Test — VALIDATED ✓

**Both fixes confirmed working:**

| Fix | Evidence |
|---|---|
| Natural language prompts | Scores same or better (avg 5.7→6.4), components match intent on all 5 |
| Scope-aware improve.ts | Component-003: 1182L→452L, score 4→6. No scope expansion in any improved.html |

**Quantitative results:**
- v1 avg improved.html: 719L | v2 avg improved.html: 334L (scope under control)
- v2 critique scores: 6, 6.5, 7, 6, 6.5 (median 6.5, up from 6 in v1)
- All improved.html files: clean (no external resources)

**Known issue (fix applied):** generate.ts Tailwind CDN system prompt caused component-001 and component-003 component.html to include Google Fonts + Tailwind CDN. System prompt reverted to inline CSS. improved.html files were clean regardless.

### Decision: ADOPT v2 prompts for full 100-prompt run ✓

### Immediate next steps
1. Write 80 remaining natural language prompts in COMPONENT_PROMPTS_V2 (bring to 100 total)
2. Follow PLAN.md component mix table
3. Scale to 100 prompts × 5 variants → 500 components → 2,500 JSONL records
4. Full run on AutoDL westd (port 25180)
