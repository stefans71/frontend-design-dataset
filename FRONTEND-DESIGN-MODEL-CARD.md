# Frontend Design Expert — Model Card & Project Handoff
> Last updated: 2026-05-20  
> Status: Dataset pipeline complete (100 records), v2 A/B test pending AutoDL, scaling to 2,500+ records next  
> GitHub: https://github.com/stefans71/frontend-design-dataset

---

## 1. Project Goal

Train a single fine-tuned vision-language model that a home user runs locally on a **12GB GPU**. The model:

- Accepts natural language prompts ("build me a website for my dog daycare")
- Asks qualifying questions when the prompt is too vague
- Recommends the right tech stack based on user needs
- Generates production-quality HTML/CSS/JS output with real interactions
- Accepts screenshot input and critiques or improves existing UI
- Runs entirely offline — no API keys, no cloud dependency

**One model. One conversation. No two-system complexity for the user.**

---

## 2. Target Model

| Property | Value |
|---|---|
| Base model | `Qwen/Qwen3-VL-8B-Instruct` |
| Architecture | Dense 8B vision-language model |
| Native context | 256K tokens |
| Fine-tune method | QLoRA NF4 + BF16 LoRA adapters, rank 32 |
| Output quantization | Q4_K_M (primary), Q3_K_M (12GB tight) |
| Model size at Q4 | ~5.5GB LM + ~2GB vision encoder |
| Usable KV cache @ 12GB | 64K–128K context |
| Inference runtime | Ollama or llama.cpp |
| Target tok/s (RTX 3060 12GB) | ~40-60 tok/s |
| Target tok/s (M3 16GB unified) | ~50-70 tok/s |

**Why Qwen3-VL-8B:** Natively multimodal (text + image input), 256K context, Apache 2.0 license, already has strong frontend coding DNA from pretraining. Users can upload screenshots for critique and improvement workflows.

---

## 3. Training Strategy

### Core Concept

We use a **teacher-student distillation** approach:

```
Qwen3.6-27B (student, generates mediocre output)
    ↓ produces HTML component
Playwright (renders to PNG screenshot)
    ↓ screenshot sent to judge
Codex GPT-5.4 (expert judge, critiques and improves)
    ↓ produces improved HTML + critique
Dataset record: [bad screenshot + bad code + critique] → [expert improved code]
```

The gap between Qwen's output and Codex's improvement IS the training signal. After fine-tuning on hundreds of these pairs, Qwen3-VL-8B internalizes expert design behavior into its weights — no system prompt needed at inference.

### Why This Works

- Qwen generates mediocre but structurally valid output (the "before")
- Codex GPT-5.4 has seen millions of production UI components — it knows what "after" looks like
- The critique explains WHY the improvement was made — the model learns design reasoning, not just patterns
- Vision input (screenshot) means the model learns to reason about rendered output, not just code

### Training Data Types

| Record Type | Input | Output | Count Target |
|---|---|---|---|
| `prompt_to_html` | Natural language prompt | component.html | 500 |
| `screenshot_to_critique` | Desktop PNG | critique.md | 500 |
| `screenshot_to_code` | Desktop PNG | component.html | 500 |
| `mobile_to_code` | Mobile PNG | component.html | 500 |
| `screenshot_code_critique_to_improved` | PNG + HTML + critique + original prompt | improved.html | 500 |
| `qualifying_conversation` | Vague user request | Questions → answers → full build | 200-400 |
| `full_page_build` | Answered brief | Complete HTML/CSS/JS page | 200-400 |
| **Total** | | | **~3,000-3,400** |

The first 5 types come from the automated pipeline. The last 2 (qualifying conversations and full page builds) are generated separately using Codex conversation traces.

---

## 4. What Is Built

### Pipeline — `frontend-design-dataset` repo

A fully automated Bun/TypeScript pipeline running across two machines:

```
AutoDL (RTX 5090, rented)          VPS Japan (hostdzire, owned)
────────────────────────           ─────────────────────────────
Stage 1: generate.ts               Stage 3: critique.ts
  Qwen3.6-27B via llama-server       Codex GPT-5.4 via Codex CLI
  → component.html                   → critique.md

Stage 2: render.ts                 Stage 3b: improve.ts
  Playwright Chromium                Codex GPT-5.4 via Codex CLI
  → screenshot-desktop.png          → improved.html
  → screenshot-mobile.png
                                   Stage 4: package-dataset.ts
         ↓ rsync                     → dataset.jsonl
bash scripts/rsync-from-autodl.sh    → dataset-stats.json

                                   pipeline.ts — orchestrates all stages
```

### Current Dataset Status

- **20 components generated** — all 5 file types per component
- **100 JSONL training records** — all 5 record types
- **Dataset size:** 1.5MB
- **Score range:** 4/10 to 7/10 (median 6/10) — good training signal spread
- **v2 A/B test:** code complete, pending AutoDL availability

### Key Technical Discoveries (Do Not Revert)

| Issue | Root Cause | Fix |
|---|---|---|
| Playwright networkidle timeout | CDN connections keep network active indefinitely | Switch to `domcontentloaded` + 3000ms buffer — CDN not blocked, just shouldn't use `networkidle` |
| Codex CLI `-i` flag bug | `-i FILE...` is variadic — consumes prompt string as second image if placed after | Move CRITIQUE_PROMPT before `-i` flag |
| Codex empty stdout | stdin not closed | Add `stdin: "ignore"` to Bun.spawn |
| Codex stdout parsing | Token count lines appear after response | Strip lines after `tokens used\n{count}\n` |
| improve.ts scope creep | Codex never received original prompt — inferred scope from screenshot | Pass original prompt from metadata.json as scope constraint |
| AutoDL GitHub blocked | China network blocks github.com | Use `ghfast.top` mirror for git clone only |
| AutoDL HuggingFace blocked | China network blocks huggingface.co | Use `hf-mirror.com` or ModelScope |
| Playwright Chromium download slow | `cdn.playwright.dev` routes internationally from China (~4MB/s) | Download via `npmmirror.com` binary mirror using `aria2c -x 16` + `bsdtar` |
| llama-server multi-turn crash | LCP prefix rollback incompatible with DeltaNet recurrent state | `--cache-reuse 0` flag in start.sh |
| Bun not in PATH on AutoDL | Non-standard install path | Always `source autodl-run.sh` first |

---

## 5. Infrastructure

### AutoDL Instance

| Component | Value |
|---|---|
| GPU | NVIDIA RTX 5090 (32GB VRAM, Blackwell SM 12.0) |
| CUDA | 13.0 (driver 580.142), toolkit 12.8 |
| OS | Ubuntu 22.04 Jammy |
| Disk | 250GB persistent at `/root/autodl-tmp/` |
| Region | AutoDL westDC3 China (use Huawei/npmmirror for downloads) |

**SSH Access (port changes on every reboot — check AutoDL web UI):**
```bash
ssh -i /root/.ssh/id_ed25519 -p 33472 root@connect.westc.seetacloud.com
# 33472 is last known port — update after every reboot
```

**AutoDL Startup Sequence (after every reboot):**
```bash
# 1. SSH in with new port from AutoDL web UI
ssh -i /root/.ssh/id_ed25519 -p <NEW_PORT> root@connect.westc.seetacloud.com

# 2. Start both llama-server instances
bash /root/autodl-tmp/start.sh
# Waits up to 120s for generation server health check
# Generation server ready in ~6s
# Embedding server starts instantly (CPU only)

# 3. Verify both servers healthy
curl http://localhost:11434/health   # → {"status":"ok"}
curl http://localhost:8081/health    # → {"status":"ok"}

# 4. Update SSH tunnel on VPS if port changed
# On VPS:
sudo nano /etc/systemd/system/autodl-tunnel.service  # update port
sudo systemctl daemon-reload
sudo systemctl restart autodl-tunnel.service
```

**llama-server — Generation (GPU, port 11434):**
```bash
/root/autodl-tmp/llama-mtp/llama-server \
  -m /root/autodl-tmp/Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf \
  -ngl 99 -c 131072 -fa on -np 1 \
  --spec-type draft-mtp --spec-draft-n-max 2 \
  --cache-reuse 0 \
  --host 0.0.0.0 --port 11434
```

**llama-server — Embeddings (CPU, port 8081):**
```bash
/root/autodl-tmp/llama-mtp/llama-server \
  -m /root/autodl-tmp/nomic-embed-text-v1.5.Q8_0.gguf \
  -ngl 0 --embedding \
  --host 0.0.0.0 --port 8081
```

**API Format (OpenAI-compatible):**
```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-27b-mtp",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 256,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

**Performance:**
- Generation: 92-97 tok/s with MTP speculative decoding
- VRAM at 131K context: 29.3/32.6 GB (3.3 GB headroom — do not exceed 131K)
- MTP acceptance rate: ~78%

**Key AutoDL Paths:**
```
/root/autodl-tmp/
├── Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf   19GB  Generation model
├── nomic-embed-text-v1.5.Q8_0.gguf    140MB Embedding model
├── llama-mtp/llama-server              71MB  Inference binary
├── bun/bin/bun                               Bun runtime
├── node-v22.15.0-linux-x64/bin/              Node.js
├── pw-browsers/                        636MB Playwright Chromium
│   ├── chromium-1223/chrome-linux/           Chrome for Testing 148.0
│   └── chromium_headless_shell-1223/
├── frontend-design-dataset/                  Project (rsynced from VPS)
├── start.sh                                  Startup script
└── setup-pi.sh                               PI Agent setup (separate project)
```

**AutoDL Run Environment:**
```bash
# Always source this first in any AutoDL session for this project
source /root/autodl-tmp/frontend-design-dataset/autodl-run.sh
# Sets PATH for bun + node, sets PLAYWRIGHT_BROWSERS_PATH, checks llama-server health
```

### VPS (Japan — hostdzire)

- Development machine — Claude Code runs here
- Codex CLI installed at `/usr/bin/codex` (v0.118.0)
- Codex auth: ChatGPT account OAuth (`~/.codex/auth.json`) — NOT API key based
- If Codex auth fails: `codex logout && codex login --device-auth`
- SSH tunnel to AutoDL for Continue.dev: `/etc/systemd/system/autodl-tunnel.service`

**Key VPS Paths:**
```
/root/tinkering/Local-LLMs/Local-LLM-Agent/
├── frontend-design-dataset/    ← THIS PROJECT
│   ├── src/
│   │   ├── pipeline.ts         Orchestrator — all 5 stages
│   │   ├── generate.ts         Stage 1 — Qwen HTML generation
│   │   ├── render.ts           Stage 2 — Playwright screenshots
│   │   ├── critique.ts         Stage 3 — Codex design critique
│   │   ├── improve.ts          Stage 3b — Codex improved HTML
│   │   └── package-dataset.ts  Stage 4 — JSONL assembly
│   ├── prompts/
│   │   └── components.ts       COMPONENT_PROMPTS (expert/v1)
│   │                           COMPONENT_PROMPTS_V2 (natural language)
│   ├── output/
│   │   ├── component-000/      Per-component output dirs
│   │   │   ├── component.html
│   │   │   ├── metadata.json
│   │   │   ├── screenshot-desktop.png
│   │   │   ├── screenshot-mobile.png
│   │   │   ├── critique.md
│   │   │   └── improved.html
│   │   ├── component-000-v2/   v2 test output (OUTPUT_SUFFIX=v2)
│   │   ├── dataset.jsonl       Final training file
│   │   └── dataset-stats.json  Record counts by type
│   ├── scripts/
│   │   ├── rsync-to-autodl.sh    Push code to AutoDL
│   │   └── rsync-from-autodl.sh  Pull output from AutoDL
│   ├── CLAUDE.md               Agent context file
│   ├── PLAN.md                 Implementation plan
│   └── autodl-run.sh           AutoDL environment setup
└── pi-modular/                 PI Agent v1 (separate project)
```

### GitHub

```
Repo: https://github.com/stefans71/frontend-design-dataset
Branch: main
```

---

## 6. Full Run Sequence

### Standard Run (after AutoDL reboot)

```bash
# ── STEP 1: AutoDL startup ──────────────────────────────────────
ssh -i /root/.ssh/id_ed25519 -p <PORT> root@connect.westc.seetacloud.com
bash /root/autodl-tmp/start.sh
# Wait for "Generation server ready"

# ── STEP 2: Sync latest code to AutoDL (from VPS) ───────────────
cd /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset
bash scripts/rsync-to-autodl.sh <PORT>

# ── STEP 3: Run Stage 1 + 2 on AutoDL ───────────────────────────
ssh -i /root/.ssh/id_ed25519 -p <PORT> root@connect.westc.seetacloud.com
cd /root/autodl-tmp/frontend-design-dataset
source autodl-run.sh
bun install --registry https://registry.npmmirror.com
# For full run:
TEST_MODE=false bun run generate
TEST_MODE=false bun run render
# For test run (3 components):
TEST_MODE=true TEST_COUNT=3 bun run generate
TEST_MODE=true TEST_COUNT=3 bun run render

# ── STEP 4: Pull output to VPS ───────────────────────────────────
# On VPS:
bash scripts/rsync-from-autodl.sh <PORT>

# ── STEP 5: Run Stage 3 + 3b + 4 on VPS ─────────────────────────
TEST_MODE=false bun run critique
TEST_MODE=false bun run improve
bun run package

# ── STEP 6: Push final dataset back to AutoDL (for fine-tuning) ──
bash scripts/rsync-to-autodl.sh <PORT>
```

### v2 A/B Test Run (5 components, pending)

```bash
# Uses COMPONENT_PROMPTS_V2 (natural language prompts)
# Output goes to component-000-v2/ etc (no v1 data touched)

# AutoDL:
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run generate
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run render

# VPS (after rsync):
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run critique
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run improve

# Then compare v1 vs v2 visually for all 5 pairs
```

### Long Run Management (tmux for AutoDL)

```bash
# Start persistent session (survives SSH disconnect)
tmux new-session -d -s generate -x 220 -y 50
tmux send-keys -t generate "cd /root/autodl-tmp/frontend-design-dataset && source autodl-run.sh && TEST_MODE=false bun run generate 2>&1 | tee /tmp/generate.log" Enter

# Monitor from VPS at any time
ssh -i /root/.ssh/id_ed25519 -p <PORT> root@connect.westc.seetacloud.com "tail -10 /tmp/generate.log"

# Reattach
ssh ... then: tmux attach -t generate
```

---

## 7. Current Status & What's Pending

### Done ✅

- [x] AutoDL environment: llama-server (Qwen3.6-27B MTP), Playwright Chromium, Bun — all working
- [x] Pipeline: all 5 stages implemented and tested (generate, render, critique, improve, package)
- [x] 20 components generated with all file types
- [x] 100 JSONL training records across 5 record types
- [x] resume support (skip-if-exists) in all stages
- [x] OUTPUT_SUFFIX versioning for A/B testing
- [x] v2 natural language prompts written (COMPONENT_PROMPTS_V2)
- [x] improve.ts: original prompt passed as scope constraint
- [x] CLAUDE.md and PLAN.md up to date

### Pending ⏳

- [ ] **v2 A/B test** — waiting for AutoDL RTX 5090 availability
  - Run 5 components with natural language prompts (COMPONENT_PROMPTS_V2)
  - Output goes to `component-000-v2/` etc — v1 data untouched
  - Confirm scope constraint in improve.ts keeps Codex focused on component type

- [ ] **Validate v2 results** — concrete acceptance criteria (not visual inspection)

  ### v2 Acceptance Criteria — What "Better" Actually Means

  "Better" is not subjective. Each of the 5 v2 components is evaluated against
  5 measurable criteria. 4/5 components must pass all criteria to adopt v2 prompts.

  | Criterion | How Measured | Pass Threshold |
  |---|---|---|
  | **Scope fidelity** | improved.html line count vs component type expected range | Navbar <400 lines, card <300 lines, full page <800 lines |
  | **Prompt-to-output alignment** | Claude reads prompt + component.html, scores 1-3: 1=wrong component, 2=roughly correct, 3=matches intent | Score ≥ 2 on 4/5 components |
  | **Training signal strength** | `improved.html line count ÷ component.html line count` | Ratio ≥ 1.4 (improved is 40%+ larger — meaningful changes were made) |
  | **No external resources** | `grep -r "cdn\|https://" output/component-*-v2/*.html` | Zero hits across all output files |
  | **Critique specificity** | critique.md word count + contains specific measurements | >300 words AND contains at least one px, rem, or % value |

  **Scoring examples:**

  PASS — Scope fidelity:
  ```
  Prompt: "make me a navbar for TaskFlow SaaS"
  improved.html: 280 lines — navbar with logo, links, mobile menu, hover states
  → PASS (navbar, under 400 lines, stayed in scope)
  ```

  FAIL — Scope fidelity:
  ```
  Prompt: "make me a navbar for TaskFlow SaaS"
  improved.html: 1183 lines — full landing page with hero, features, dashboard
  → FAIL (scope crept from component to full product)
  ```

  PASS — Prompt alignment:
  ```
  Prompt: "fun colorful contact page for my dog daycare Stay Fit"
  component.html: colorful page with contact form, dog paw icons, friendly tone
  → Score 3 (matches intent exactly)
  ```

  FAIL — Prompt alignment:
  ```
  Prompt: "fun colorful contact page for my dog daycare Stay Fit"
  component.html: dark minimal SaaS pricing table
  → Score 1 (completely wrong — Qwen ignored the natural language prompt)
  ```

  PASS — Training signal strength:
  ```
  component.html: 200 lines (Qwen's mediocre output)
  improved.html: 380 lines (Codex's expert rewrite)
  Ratio: 1.9 → PASS (strong training signal, significant improvement)
  ```

  FAIL — Training signal strength:
  ```
  component.html: 200 lines
  improved.html: 215 lines (trivial changes — a few color tweaks)
  Ratio: 1.07 → FAIL (weak signal, not worth training on)
  ```

  **How Claude runs this check (paste into session after v2 run):**
  ```
  Read CLAUDE.md. The v2 test is complete. For each of the 5 v2 components,
  evaluate all 5 acceptance criteria from the model card Section 7.
  Read the actual files — component.html, improved.html, critique.md, metadata.json.
  Produce a results table with PASS/FAIL per criterion per component.
  Final verdict: adopt v2 prompts if 4/5 components pass all criteria.
  ```

- [ ] **Decision: adopt v2 prompts** — based on acceptance criteria results above
  - If 4/5 pass → write 80 more prompts in natural language style (total: 100)
  - If fewer pass → identify which criterion failed, fix the specific issue, retest
  - Update PLAN.md only after decision is confirmed by criteria

- [ ] **Scale to 2,500 records**
  - 100 prompts × 5 quality variants = 500 components
  - × 5 record types = 2,500 JSONL records
  - Estimated time: ~8-12 hours on AutoDL + VPS

- [ ] **Qualifying conversation traces (200-400 records)**
  - Generate using Codex on VPS
  - Multi-turn: vague request → qualifying questions → user answers → full build
  - Teaches the model WHEN to ask and WHAT to ask

- [ ] **Full page build traces (200-400 records)**
  - After qualifying conversation resolves to a full page request
  - Complete HTML/CSS/JS with real interactions (no CDN constraint for this type)
  - Smooth scrolling, hover states, CSS animations, Intersection Observer lazy loading

- [ ] **Fine-tune Qwen3-VL-8B**
  - SWIFT framework on AutoDL (or separate H100 instance)
  - QLoRA NF4 + BF16 adapters, rank 32
  - Training data: ~3,000-3,400 records combined

- [ ] **Quantize and release**
  - Export to GGUF
  - Q4_K_M build (primary — 12GB GPU)
  - Q3_K_M build (tight 12GB — more KV cache)
  - Test on Ollama

---

## 8. Design Decisions & Rationale

### Why inline CSS (Tailwind CDN tested and not blocked, but inline CSS still preferred)

Tailwind CDN was tested on AutoDL westd China zone (2026-05-20) and confirmed to load successfully — `cdn.tailwindcss.com` is not blocked. The original `networkidle` timeout issue was fixed by switching render.ts to `domcontentloaded` + 3000ms buffer.

Inline CSS is still used because: (1) training data quality — the fine-tuned model should learn to write real CSS properties that work everywhere, not Tailwind utility classes that only work in Tailwind projects; (2) COMPONENT_PROMPTS_V2 explicitly instruct "Use only inline CSS" so the model follows the prompt regardless of the system prompt; (3) the fine-tuned model's target users run it offline — teaching it Tailwind vocabulary doesn't help users without Tailwind installed.

### Why Codex CLI not OpenAI REST API

Codex CLI uses ChatGPT account auth (OAuth) — included in the ChatGPT Plus/Pro plan with no per-token cost beyond the subscription. REST API would incur per-token charges. For a dataset generation run of 2,500+ critique+improve calls this is significant.

### Why the original prompt is passed to improve.ts

Without it, Codex infers scope from the screenshot. A sparse navbar with empty space below it gets "improved" into a complete SaaS landing page — because that's what Codex's training data says should go there. Passing the original prompt ("build a navbar") constrains the output to the correct scope.

### Why natural language prompts (v2)

The fine-tuned model will be used at inference by non-designers typing natural requests. Training on expert Tailwind-class prompts creates a mismatch — the model learns to respond to expert input, not normal user input. Natural language prompts match real inference conditions.

### Why 200-400 qualifying conversation traces

Qwen3-VL-8B already knows how to ask questions — it's a capable base model. You're teaching it WHEN and WHAT to ask in the frontend design context, not a new capability. Behavioral nudges require far fewer examples than capability training. 200-400 high-quality multi-turn examples is sufficient to establish consistent qualifying behavior.

### Why not two models

A single fine-tuned model is the only practical choice for a home user product. Two models means two downloads, two GPU loads, routing logic, and complexity the user shouldn't see. Everything — qualifying questions, component generation, screenshot critique, full page builds — goes into one fine-tuned Qwen3-VL-8B.

---

## 9. Prompt Design Principles (v2 Standard)

All prompts in the training dataset must follow these rules:

**DO:**
- Write as a real non-designer user would type
- Include brand name and/or domain context ("my dog daycare called Stay Fit")
- Include rough style direction ("fun and colorful", "clean and minimal", "dark theme")
- Specify component type OR page type — not both
- Include key content elements ("menu links: Services, Pricing, About, Contact")

**DON'T:**
- Use Tailwind class names (`bg-blue-600`, `px-8 py-3`)
- Specify exact pixel values or font weights
- Include implementation details the user wouldn't know
- Write prompts only an expert could write

**Good example:**
```
"Make a top navigation bar for my project management SaaS called TaskFlow. 
Logo on the left, nav links in the middle (Features, Pricing, Docs, Blog), 
Sign In and a blue Get Started button on the right. Should work on mobile."
```

**Bad example:**
```
"Build a responsive navbar. bg-white border-b border-gray-200 w-full px-6 py-4 
flex items-center justify-between. Left: blue square SVG + font-semibold text-gray-900 
text-lg..."
```

---

## 10. What the Fine-Tuned Model Should Do

When a home user runs this model locally via Ollama:

**Scenario 1 — Vague request:**
```
User: "build me a website for my dog daycare called Stay Fit"

Model: "Happy to build this. Three quick questions:
1. Is this mainly for people to find and contact you, or 
   do they need to book appointments online?
2. One scrolling page or separate pages (Services, About, Contact)?
3. Fun and playful vibe or clean and professional?"

User: "just contact info, one page, fun colors"

Model: "Perfect — building a single-page HTML site now..."
[produces complete HTML/CSS/JS with smooth scroll, hover states, animations]
```

**Scenario 2 — Screenshot input:**
```
User: [uploads screenshot of their existing site]
      "Can you improve this design?"

Model: "I can see several issues here:
- The heading hierarchy is too flat — everything feels the same weight
- 32px gap between sections is too tight — needs 64px minimum
- The CTA button lacks contrast (3.2:1 vs WCAG AA 4.5:1 minimum)

Here's the improved version..."
[produces improved HTML/CSS]
```

**Scenario 3 — Component request:**
```
User: "make me a pricing card with three tiers for my SaaS"

Model: [no questions needed — scope is clear]
[produces complete three-tier pricing card with all states]
```

---

## 11. Next Session Startup

For any new Claude session working on this project:

```
1. Read CLAUDE.md in /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/
2. Read PLAN.md in the same directory
3. Check AutoDL web UI for current SSH port
4. Run: bash scripts/rsync-to-autodl.sh <PORT> to sync latest code
5. Follow the pending tasks list in Section 7 of this model card
```

**If starting completely fresh on a new machine:**
```bash
git clone https://github.com/stefans71/frontend-design-dataset.git
cd frontend-design-dataset
bun install
cp .env.example .env
# Fill in .env — LLAMA_SERVER_URL, CODEX_MODEL
# AutoDL setup: follow Section 5 Infrastructure
```

---

## 12. File Reference

| File | Location | Purpose |
|---|---|---|
| `CLAUDE.md` | project root | Agent context — read first every session |
| `PLAN.md` | project root | Detailed implementation plan |
| `FRONTEND-DESIGN-MODEL-CARD.md` | project root | This file — project overview and handoff |
| `autodl-run.sh` | project root | AutoDL env setup — source before every run |
| `src/pipeline.ts` | src/ | Orchestrator — all stages with JST timestamps |
| `src/generate.ts` | src/ | Stage 1 — Qwen HTML generation |
| `src/render.ts` | src/ | Stage 2 — Playwright screenshots |
| `src/critique.ts` | src/ | Stage 3 — Codex design critique |
| `src/improve.ts` | src/ | Stage 3b — Codex improved HTML |
| `src/package-dataset.ts` | src/ | Stage 4 — JSONL assembly |
| `prompts/components.ts` | prompts/ | v1 expert prompts + v2 natural language |
| `scripts/rsync-to-autodl.sh` | scripts/ | Push code/data to AutoDL |
| `scripts/rsync-from-autodl.sh` | scripts/ | Pull output from AutoDL |
| `output/dataset.jsonl` | output/ | Final training file |
| `output/dataset-stats.json` | output/ | Record counts by type |
| `start.sh` | AutoDL `/root/autodl-tmp/` | Start both llama-server instances |
| `setup-pi.sh` | AutoDL `/root/autodl-tmp/` | PI Agent setup (separate project) |
| `AUTODL-SETUP.md` | pi-modular repo | Full AutoDL environment documentation |
---

## 13. Second Training Dataset — Qualifying Conversation Traces

This is a separate dataset generated after the main component dataset. It teaches the model
a distinct behavior: **when to ask follow-up questions and what to ask**.

Without this dataset the fine-tuned model will generate immediately on every prompt regardless
of vagueness — it has no examples showing it should pause and clarify first.

---

### Why It's a Separate Dataset

The component dataset (6 record types, ~3,000 records) teaches:
- Design quality — what good UI looks like vs bad
- Visual reasoning — screenshot → critique → improvement
- Code generation — prompt → production HTML/CSS

It does NOT teach conversation flow. Every record is single-turn:
```
[input] → [output]
```

Qualifying conversation traces are multi-turn:
```
[user] → [model asks] → [user answers] → [model builds]
```

These require a different record format and different generation approach.

---

### The Decision Boundary the Model Must Learn

The model needs to internalize one core rule:

| Prompt type | Correct behavior | Example |
|---|---|---|
| Component request | Build immediately — scope is clear | "make me a login button" |
| Partially specified | Build immediately — enough detail given | "dark pricing card with 3 tiers for my SaaS" |
| Full page/site/app, vague | Ask 2-3 questions first | "build me a website for my bakery" |
| Full page/site/app, specified | Build immediately | "one-page dark portfolio for a photographer, hero + work grid + contact" |
| Screenshot input | Critique/improve immediately — visual is the spec | [uploads screenshot] "improve this" |

Training examples must show BOTH sides — cases where the model asks AND cases where it builds
immediately. Otherwise the model learns to always ask, which is equally wrong.

---

### Record Format

Multi-turn ShareGPT format — different from the single-turn component records:

```jsonl
{
  "id": "conv-042_bakery_website",
  "type": "qualifying_conversation",
  "messages": [
    {
      "role": "user",
      "content": "build me a website for my bakery called Sunrise Breads"
    },
    {
      "role": "assistant",
      "content": "Happy to build this. Three quick questions so I get it right:\n\n1. **Purpose** — mainly for people to find you and call/visit, or do they need to order online?\n2. **Pages** — one scrolling page, or separate pages (Menu, About, Contact)?\n3. **Style** — warm and rustic, or clean and modern?"
    },
    {
      "role": "user",
      "content": "find us and visit, one page, warm and rustic"
    },
    {
      "role": "assistant",
      "content": "Perfect — a warm single-page HTML site with rustic character. Building it now...\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n...\n</html>\n```"
    }
  ]
}
```

And the counter-example (no questions needed):

```jsonl
{
  "id": "conv-043_button_immediate",
  "type": "qualifying_conversation",
  "messages": [
    {
      "role": "user",
      "content": "make me a primary action button with a loading state"
    },
    {
      "role": "assistant",
      "content": "Here's a button component with default, loading, and disabled states:\n\n```html\n...\n```"
    }
  ]
}
```

---

### What Questions the Model Should Ask

When a qualifying question turn IS appropriate, the model asks exactly **2-3 questions**, never more.
The questions follow a consistent priority order:

1. **Purpose** — what does the user actually need it to do?
   - "Is this mainly for people to find you, or do they need to do something (book, buy, sign up)?"

2. **Scope** — how much content?
   - "One scrolling page, or separate pages?"
   - "A single component, or a full page?"

3. **Style** — only if not already stated
   - "What vibe — professional and minimal, or bold and expressive?"
   - Skip this if the user already mentioned colors or mood

The model should NEVER ask about tech stack — it decides that based on the answers:
- Contact/info site → plain HTML/CSS/JS
- Booking/interactive → note React would be better but still deliver HTML
- Component request → always HTML/CSS

---

### Generation Approach

Generated on VPS using Codex CLI. Two passes needed:

**Pass 1 — Vague requests (should ask questions):**
```bash
codex exec -m gpt-5.4 \
  --dangerously-bypass-approvals-and-sandbox \
  --ephemeral \
  "Generate 10 multi-turn frontend design conversations in JSONL format.

Each conversation MUST follow this exact pattern:
1. User gives a vague website/app/page request (not a component)
2. Assistant asks exactly 2-3 focused qualifying questions
3. User answers briefly (1 sentence)
4. Assistant confirms the approach in one sentence, then outputs complete HTML/CSS/JS

Vary domains: restaurant, fitness studio, SaaS, personal portfolio, nonprofit,
local service business, ecommerce, event page.
Vary vagueness: some give brand name only, some give a bit more.
The HTML output must be complete, self-contained, with inline CSS only.
Output only valid JSONL — one JSON object per line, no markdown, no preamble." \
  -o /tmp/conv-batch.txt

cat /tmp/conv-batch.txt >> output/qualifying-conversations.jsonl
```

**Pass 2 — Clear requests (should NOT ask questions):**
```bash
codex exec -m gpt-5.4 \
  --dangerously-bypass-approvals-and-sandbox \
  --ephemeral \
  "Generate 10 single-turn frontend design conversations in JSONL format.

Each conversation:
1. User gives a SPECIFIC component or well-described page request
   (enough detail that no clarification is needed)
2. Assistant builds immediately — NO questions asked

Examples of specific enough requests:
- 'make me a dark login form with email, password, and forgot password link'
- 'three-tier pricing card for a SaaS, highlight the middle tier'
- 'mobile bottom nav with 5 tabs for a fitness app'

Vary: buttons, cards, forms, navbars, modals, data tables, marketing sections.
HTML output complete, self-contained, inline CSS only.
Output only valid JSONL — one JSON object per line." \
  -o /tmp/conv-batch-immediate.txt

cat /tmp/conv-batch-immediate.txt >> output/qualifying-conversations.jsonl
```

Run Pass 1: 15-20 times = 150-200 vague examples
Run Pass 2: 10-15 times = 100-150 immediate examples
**Total: 250-350 records — roughly 60% ask/40% immediate**

---

### Integration With Main Dataset

The qualifying conversation records are packaged separately then merged:

```bash
# After generating all conversation traces:
wc -l output/qualifying-conversations.jsonl   # expect 250-350

# Validate format (every line must be valid JSON with 'messages' array)
python3 -c "
import json, sys
errors = 0
for i, line in enumerate(open('output/qualifying-conversations.jsonl')):
    try:
        d = json.loads(line)
        assert 'messages' in d
        assert len(d['messages']) >= 2
    except Exception as e:
        print(f'Line {i}: {e}')
        errors += 1
print(f'Valid: {i+1-errors}/{i+1}')
"

# Merge with main component dataset for fine-tuning
cat output/dataset.jsonl output/qualifying-conversations.jsonl > output/dataset-final.jsonl
wc -l output/dataset-final.jsonl   # expect ~3,250-3,350
```

---

### Quality Check for Conversation Traces

Before merging, verify the traces have the right balance and structure:

```bash
# Count ask vs immediate records
python3 -c "
import json
ask, immediate = 0, 0
for line in open('output/qualifying-conversations.jsonl'):
    d = json.loads(line)
    turns = len(d['messages'])
    if turns >= 4:   # user → questions → answer → build
        ask += 1
    else:            # user → build immediately
        immediate += 1
print(f'Ask questions: {ask} | Build immediately: {immediate}')
print(f'Ratio: {ask/(ask+immediate)*100:.0f}% ask')
# Target: 55-65% ask, 35-45% immediate
"

# Spot check: read 5 random ask-type traces
python3 -c "
import json, random
traces = [json.loads(l) for l in open('output/qualifying-conversations.jsonl')]
ask_traces = [t for t in traces if len(t['messages']) >= 4]
for t in random.sample(ask_traces, min(5, len(ask_traces))):
    print('USER:', t['messages'][0]['content'][:80])
    print('MODEL:', t['messages'][1]['content'][:120])
    print('---')
"
```

**Acceptance criteria for conversation traces:**
- ≥ 250 total records
- 55-65% are ask-type (4+ turns), 35-45% are immediate (2 turns)
- No ask-type trace asks more than 3 questions
- No immediate-type trace asks any questions
- All records contain complete HTML output in the final assistant turn
- HTML is self-contained (no external CDN)

---

### Why This Amount Is Sufficient

Qwen3-VL-8B is a capable base model that already knows how to ask questions and how to build HTML.
The fine-tune is teaching it **context-specific behavior**, not new capabilities:

- When to ask → learned from the ask-type examples showing the decision boundary
- What to ask → learned from the specific question patterns in 150-200 examples
- When NOT to ask → learned from the immediate examples (equally important)

Research benchmark: models learn simple behavioral rules from 200-500 high-quality examples.
This is far simpler than capability training — it's a routing decision plus a question template.

250-350 examples across both classes is sufficient. More is not necessarily better —
too many ask-type examples would bias the model toward always asking even when unnecessary.
