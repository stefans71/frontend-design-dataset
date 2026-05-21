# Frontend Design Expert — Model Card & Project Handoff
> Last updated: 2026-05-21 JST
> Status: **DATASET COMPLETE — 3,089 records ready for fine-tuning**
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

**Why Qwen3-VL-8B:** Natively multimodal (text + image input), 256K context, Apache 2.0 license, strong frontend coding DNA from pretraining. Users upload screenshots for critique and improvement workflows.

**Screenshot resolution guidance for inference:** Recommend users resize screenshots to max 1024×1024 before uploading. The vision encoder consumes fixed VRAM for image tokens — large screenshots on 12GB GPUs can cause OOM before any text generation begins.

### Alternative candidates researched (2026-05-20)

| Model | Params | QLoRA on 12GB | Notes |
|---|---|---|---|
| `Qwen/Qwen3-VL-4B-Instruct` | 4B | ✅ Comfortable | Best for 8GB GPU target |
| `Qwen/Qwen3-VL-8B-Instruct` | 8B | ✅ Works | **Primary target** |
| `Qwen3.5-9B` (early fusion) | 9B | ❌ Not recommended | Unsloth warns against QLoRA on Qwen3.5 |
| `Qwen3.5-4B` (early fusion) | 4B | ⚠️ Borderline | 16-bit LoRA might fit at ~10-12GB |
| `microsoft/Phi-4-multimodal` | 5.6B | ✅ | Strong coding, MIT license |
| `InternVL2_5-8B` | 8B | ✅ | Strong on visual coding specifically |

Decision: Qwen3-VL-8B chosen — QLoRA path is well-supported by Unsloth, official GGUF available, Ollama native. Qwen3.5 early fusion architecture is better but QLoRA incompatibility rules it out for 12GB training.

---

## 3. Training Strategy

### Core Concept

**Teacher-student distillation:**

```
Qwen3.6-27B (generates mediocre output)
    ↓ HTML component
Playwright (renders to PNG screenshot)
    ↓ screenshot sent to judge
Codex GPT-5.4 (expert judge, critiques and improves)
    ↓ critique.md + improved.html
Dataset record: [screenshot + bad code + critique] → [expert improved code]
```

The gap between Qwen's output and Codex's improvement IS the training signal. After fine-tuning, Qwen3-VL-8B internalizes expert design behavior into its weights — no special system prompt needed at inference.

### Why This Works

- Qwen generates mediocre but structurally valid output (the "before")
- Codex GPT-5.4 has seen millions of production UI components — it knows what "after" looks like
- The critique explains WHY the improvement was made — model learns design reasoning, not just patterns
- Vision input (screenshot) means the model learns to reason about rendered output, not just code
- Original prompt passed to improve.ts — Codex stays in scope (navbar → better navbar, not landing page)
- Visual judgment (color selection, contrast, hover states, interactive behaviors) transfers via the before/after pairs

### Training Data Types — Final Dataset

| Record Type | Input | Output | Final Count |
|---|---|---|---|
| `prompt_to_html` | Natural language prompt | component.html | ~472 |
| `screenshot_to_critique` | Desktop PNG | critique.md | ~472 |
| `screenshot_to_code` | Desktop PNG | component.html | ~472 |
| `mobile_to_code` | Mobile PNG | component.html | ~472 |
| `screenshot_html_to_critique` | Desktop PNG + HTML | critique.md | ~472 |
| `screenshot_code_critique_to_improved` | PNG + HTML + original prompt + critique | improved.html | ~472 |
| `qualifying_conversation` | Vague user request | Questions → answers → full build | 150 (ask-type) |
| `immediate_conversation` | Clear component request | Direct build, no questions | 104 |
| **Total** | | | **3,089** |

Component records come from 500 components × 6 record types = ~3,000 (minus ~165 skipped due to render failures). Conversation traces: 254 total (150 ask / 104 immediate = 59% ask ratio).

---

## 4. What Is Built

### Pipeline — `frontend-design-dataset` repo

```
AutoDL (RTX 5090, westd)             VPS Japan (hostdzire)
────────────────────────             ─────────────────────
Stage 1: generate.ts                 Stage 3:  critique.ts
  Qwen3.6-27B via llama-server         Codex GPT-5.4 / claude -p
  → component.html                     → critique.md

Stage 2: render.ts                   Stage 3b: improve.ts
  Playwright Chromium                  Codex GPT-5.4 via Codex CLI
  → screenshot-desktop.png             → improved.html
  → screenshot-mobile.png
                                     Stage 4: package-dataset.ts
         ↓ rsync                       → dataset-run{N}.jsonl
bash scripts/rsync-from-autodl.sh      → dataset-stats.json

                                     Stage 5: evaluate.ts
                                       → pre-scores.jsonl (Stage A regex)
                                       → scores.jsonl (Stage B claude -p)
                                       → dataset-clean.jsonl

                                     Stage 6: generate-conversations.ts
                                       → qualifying-conversations.jsonl

                                     Final merge:
                                       → dataset-final.jsonl (3,089 records)
```

### Final Dataset Status (2026-05-21) ✅ COMPLETE

| Run | Temp | Components | Records | Status |
|---|---|---|---|---|
| run0 | 0.5 | 97/100 | 573 | Complete |
| run1 | 0.7 | 93/100 | 558 | Complete |
| run2 | 0.85 | 93/100 | 573 | Complete |
| run3 | 1.0 | 89/100 | 534 | Complete |
| run4 | 1.1 | 98/100 | 598 | Complete |
| **Component total** | | **~470/500** | **~2,835** | ✅ |
| Qualifying conversations | — | — | 254 | ✅ |
| **Grand total** | | | **3,089** | ✅ |

Missing ~30 components across all runs = Chromium OOM render failures. Unrecoverable, acceptable loss.

### Evaluation Pass Results (Step 20.5) ✅

Two-stage quality filter run on all 506 improved.html files before fine-tuning:

| Stage | Method | Result |
|---|---|---|
| Stage A — Hard gate | Regex: CDN links, file length | 475 pass, 0 CDN failures, 25 missing files |
| Stage A — Visual score | Regex: color count, measurements | All 475 scored visual=3 (GPT-5.4 consistently uses hex+px) |
| Stage B — Alignment | `claude -p`, 5/batch | 465/475 scored, 10 parse failures (kept) |
| Stage B — Interactivity | Context-aware LLM scoring | — |

**Score distribution:**
| Score | Components | % |
|---|---|---|
| 9/9 | 303 | 65% |
| 8/9 | 141 | 30% |
| 7/9 | 17 | 4% |
| 6/9 | 4 | 1% |
| <6 | 0 | 0% |

**0 components excluded** — all passed the 6/9 threshold. Dataset is exceptionally high quality.
`output/dataset-clean.jsonl` = 2,835 records (same as dataset.jsonl, no exclusions).

### Evaluation Rubric (for reference / future runs)

**Pre-filter (hard gate):**
```javascript
const hasExternalDeps = /https?:\/\/(?!www\.w3\.org|via\.placeholder\.com)/i.test(html);
if (hasExternalDeps || html.length < 500) → FAIL
```

**Visual score (regex, 0-3):**
```javascript
const colorMatches = html.match(/(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|var\(--)/ig) || [];
const hasMeasurement = /\d+(px|rem|em|vh|vw|%)/i.test(html);
// 3 = colorMatches>=3 AND hasMeasurement, 2 = either, 1 = neither
```

**Alignment (0-3):** LLM judges if HTML matches requested component type
**Interactivity (0-3):** Context-aware — interactive types vs display types scored differently
**Exclusion threshold:** total < 6/9

### Key Technical Discoveries (Do Not Revert)

| # | Issue | Root Cause | Fix |
|---|---|---|---|
| 1 | `set -e` in run script killed entire job on one crash | Bash exits on any non-zero | Removed `-e` from `run-all-variants.sh` |
| 2 | One Playwright crash killed entire render stage | No per-component error handling | try/catch per component in render.ts |
| 3 | Playwright networkidle timeout | CDN/inline CSS keeps connections open | `domcontentloaded` + 3000ms — do not revert to networkidle |
| 4 | run2 generate stopped at 56/100 | llama-server memory pressure | Resume support handles gaps |
| 5 | Playwright deadlocked 52min on one component | No per-component browser launch timeout | Per-component timeout on browser launch |
| 6 | llama-server died mid-run | Memory exhaustion | Restart with `bash start.sh`, resume handles gaps |
| 7 | ~26 render OOM failures | Chromium OOM on complex components | Re-render pass — resume skips done PNGs |
| 8 | Codex CLI `-i` flag consumed prompt as image | `-i FILE...` is variadic | CRITIQUE_PROMPT must come BEFORE `-i` flag |
| 9 | Codex empty stdout | stdin not closed | `stdin: "ignore"` in Bun.spawn |
| 10 | improve.ts scope creep (navbar → landing page) | Codex inferred scope from screenshot | Pass original prompt from metadata.json as scope constraint |
| 11 | llama-server multi-turn crash | LCP prefix rollback + DeltaNet incompatible | `--cache-reuse 0` in start.sh — do not remove |
| 12 | Playwright Chromium download slow from China | `cdn.playwright.dev` routes internationally | `aria2c -x 16` + npmmirror binary mirror + `bsdtar` |
| 13 | Codex daily quota exhausted mid-run | ChatGPT plan daily limit on Codex CLI | Re-login: `codex login --device-auth`; or switch to `claude -p` |
| 14 | Conversation trace diversity collapse risk | LLM repeats same phrasing in batch generation | Persona + domain injection per batch, batches of 5 not 10 |
| 15 | Codex timeout on content-heavy domains | Restaurant/e-commerce HTML too long for 120s | Increased to 480s timeout in generate-conversations.ts |

---

## 5. Infrastructure

### AutoDL Instance

| Component | Value |
|---|---|
| GPU | NVIDIA RTX 5090 (32GB VRAM, Blackwell SM 12.0) |
| CUDA | 13.0 (driver 580.142), toolkit 12.8 |
| OS | Ubuntu 22.04 Jammy |
| Disk | 250GB persistent at `/root/autodl-tmp/` |
| Active instance | westd clone — `connect.westd.seetacloud.com` port 25180 |
| Region | AutoDL Northwest B, China (use Huawei/npmmirror for downloads) |

**SSH Access:**
```bash
# ACTIVE — westd clone
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com
# Port changes on every AutoDL reboot — check AutoDL web UI
```

**AutoDL Startup Sequence (after reboot):**
```bash
ssh -i /root/.ssh/id_ed25519 -p <NEW_PORT> root@connect.westd.seetacloud.com
bash /root/autodl-tmp/start.sh
curl http://localhost:11434/health   # → {"status":"ok"}
# Update VPS tunnel if port changed:
sudo nano /etc/systemd/system/autodl-tunnel.service
sudo systemctl daemon-reload && sudo systemctl restart autodl-tunnel.service
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

**Performance:**
- Generation: 92-97 tok/s with MTP speculative decoding
- VRAM at 131K context: 29.3/32.6 GB (3.3 GB headroom — do not exceed 131K)
- MTP acceptance rate: ~78%

**Key AutoDL Paths:**
```
/root/autodl-tmp/
├── Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf      19GB   Generation model (Qwen3.6-27B)
├── nomic-embed-text-v1.5.Q8_0.gguf       140MB  Embedding model
├── qwen3-vl-8b-gguf/                             Qwen3-VL-8B GGUF (baseline test)
│   ├── Qwen3-VL-8B-Instruct-Q4_K_M.gguf  ~5GB   Fine-tune target model
│   └── mmproj-*.gguf                      ~1GB   Vision encoder — required for image input
├── llama-mtp/llama-server                 71MB   Inference binary (MTP branch)
├── bun/bin/bun                                   Bun runtime
├── node-v22.15.0-linux-x64/bin/                  Node.js
├── pw-browsers/                           636MB  Playwright Chromium
├── frontend-design-dataset/                      Project (rsynced from VPS)
├── start.sh                                      Startup script (both llama-servers)
└── setup-pi.sh                                   PI Agent setup (separate project)
```

### Qwen3-VL-8B Baseline Test (completed 2026-05-20)

Downloaded via ModelScope to `/root/autodl-tmp/qwen3-vl-8b-gguf/`. Served on port 8080 via llama-server with `--mmproj` flag.

**Results — confirmed fine-tune is required:**

| Test | Score | Finding |
|---|---|---|
| Vision critique | 5/10 | Works but vague — no px measurements, no hex values |
| Qualifying questions | 1/10 | Never asks — builds immediately (RLHF eager pleaser failure) |
| Self-contained HTML | 7/10 | Good output quality |

Test 2 (1/10) is definitive. System prompts cannot override RLHF eagerness to build. Qualifying behavior must be trained into weights. **Fine-tune confirmed required.**

**Download command (for reference):**
```bash
pip install modelscope -q
modelscope download \
  --model Qwen/Qwen3-VL-8B-Instruct-GGUF \
  --include '*Q4_K_M*' '*mmproj*' \
  --local_dir /root/autodl-tmp/qwen3-vl-8b-gguf
```

**Serve command:**
```bash
/root/autodl-tmp/llama-mtp/llama-server \
  -m /root/autodl-tmp/qwen3-vl-8b-gguf/Qwen3-VL-8B-Instruct-Q4_K_M.gguf \
  --mmproj /root/autodl-tmp/qwen3-vl-8b-gguf/mmproj-Qwen3-VL-8B-Instruct-Q4_K_M.gguf \
  -ngl 99 -c 32768 \
  --host 0.0.0.0 --port 8080
```

### VPS (Japan — hostdzire)

- Development machine — Claude Code + Sonnet 4.6 runs here
- Codex CLI at `/usr/bin/codex` (v0.118.0) — ChatGPT OAuth auth
- If auth fails: `codex logout && codex login --device-auth`
- Codex daily quota limit — if exhausted, switch to `claude -p` (same subprocess pattern)
- `claude -p` works for all VPS generation tasks — used successfully for eval Stage B (95 batches, zero failures)

**Key VPS Paths:**
```
/root/tinkering/Local-LLMs/Local-LLM-Agent/
├── frontend-design-dataset/    ← THIS PROJECT
│   ├── src/
│   │   ├── pipeline.ts                  Orchestrator — all stages
│   │   ├── generate.ts                  Stage 1 — Qwen HTML generation + TEMPERATURE
│   │   ├── render.ts                    Stage 2 — Playwright (domcontentloaded+3000ms)
│   │   ├── critique.ts                  Stage 3 — Codex design critique
│   │   ├── improve.ts                   Stage 3b — Codex improved HTML (scope-constrained)
│   │   ├── package-dataset.ts           Stage 4 — 6-type JSONL assembly + stats
│   │   ├── evaluate.ts                  Stage 5 — Two-stage eval (regex + claude -p)
│   │   └── generate-conversations.ts    Stage 6 — Qualifying conversation traces
│   ├── prompts/
│   │   └── components.ts                COMPONENT_PROMPTS (v1) + COMPONENT_PROMPTS_V2 (100)
│   ├── output/
│   │   ├── component-000-run0/          Full run output (500 dirs)
│   │   ├── component-099-run4/
│   │   ├── dataset-run{0-4}.jsonl       Per-run datasets
│   │   ├── dataset.jsonl                Concatenated component records (~2,835)
│   │   ├── pre-scores.jsonl             Stage A eval results
│   │   ├── scores.jsonl                 Final eval scores per component
│   │   ├── eval-summary.json            Aggregate eval stats
│   │   ├── dataset-clean.jsonl          Post-eval filtered (~2,835, 0 excluded)
│   │   ├── qualifying-conversations.jsonl  254 conversation traces
│   │   └── dataset-final.jsonl          ← FINE-TUNE INPUT (3,089 records)
│   ├── scripts/
│   │   ├── rsync-to-autodl.sh
│   │   ├── rsync-from-autodl.sh
│   │   └── run-all-variants.sh          5-temperature full run (no set -e)
│   ├── CLAUDE.md
│   ├── PLAN.md
│   ├── FRONTEND-DESIGN-MODEL-CARD.md
│   └── autodl-run.sh
└── pi-modular/                          PI Agent v1 (separate project)
```

### GitHub
```
Repo: https://github.com/stefans71/frontend-design-dataset
Branch: main
```

---

## 6. Full Run Sequence (archived — dataset complete)

The 5-temperature full run is complete. This section preserved for reference if dataset regeneration is ever needed.

```bash
# AutoDL — generate + render all 5 variants
source autodl-run.sh
bun install --registry https://registry.npmmirror.com
screen -dmS fullrun bash -c 'TEST_MODE=false bash scripts/run-all-variants.sh 2>&1 | tee /tmp/fullrun.log'
tail -f /tmp/fullrun.log

# VPS — critique + improve + package per suffix
bash scripts/rsync-from-autodl.sh 25180
screen -dmS vps-process bash -c '
for SUFFIX in run0 run1 run2 run3 run4; do
  OUTPUT_SUFFIX=$SUFFIX bun run critique &&
  OUTPUT_SUFFIX=$SUFFIX bun run improve &&
  DATASET_PATH=output/dataset-${SUFFIX}.jsonl OUTPUT_SUFFIX=$SUFFIX bun run package
done 2>&1 | tee /tmp/vps-process.log'

# Concatenate
cat output/dataset-run*.jsonl > output/dataset.jsonl

# Evaluate
bun run evaluate

# Conversations
bun run conversations

# Final merge
cat output/dataset-clean.jsonl output/qualifying-conversations.jsonl > output/dataset-final.jsonl
wc -l output/dataset-final.jsonl  # 3,089
```

---

## 7. Current Status & What's Pending

### Done ✅

- [x] AutoDL environment fully set up (llama-server, Playwright, Bun)
- [x] All pipeline stages implemented (generate, render, critique, improve, package, evaluate, conversations)
- [x] v2 A/B test VALIDATED — natural language prompts + scope constraint confirmed
- [x] COMPONENT_PROMPTS_V2: 100 natural language prompts (~42% dark theme)
- [x] TEMPERATURE env var + graceful HTML validation in generate.ts
- [x] mobile_to_code as 6th record type
- [x] run-all-variants.sh — 5-temperature orchestration
- [x] Smoke test passed
- [x] Full 500-component run complete (470 clean after OOM losses)
- [x] Evaluation pass: 0 components excluded, 95% scoring 8-9/9
- [x] Qualifying conversation traces: 254 records (59% ask, 41% immediate)
- [x] **dataset-final.jsonl: 3,089 records COMPLETE**
- [x] Baseline test confirmed fine-tune required (qualifying questions: 1/10)

### Pending ⏳ — Fine-Tune Phase

- [ ] **Pre-training smoke test on AutoDL**
  - 10 steps, confirm loss drops by step 5
  - Use correct 32×32 patch params (see Section 14)
  - Kill any Ollama process before starting: `pkill -f ollama`

- [ ] **Full QLoRA fine-tune — Qwen3-VL-8B**
  - SWIFT framework on AutoDL RTX 5090 (or H100 if available)
  - See Section 14 for exact training parameters
  - Input: `output/dataset-final.jsonl` (3,089 records)

- [ ] **Export to GGUF + quantize**
  - Q4_K_M (primary — 12GB GPU)
  - Q3_K_M (tight 12GB — more KV cache)

- [ ] **Post-fine-tune validation** — run 4-test protocol (Section 15)
  - Target: qualifying questions 6+/10 (vs 1/10 baseline)
  - Target: vision critique 7+/10 (vs 5/10 baseline)

- [ ] **Test on Ollama** (RTX 3060 12GB target hardware)

- [ ] **Release**

### v2 Acceptance Criteria (completed — kept for reference)

Both fixes validated on 2026-05-20. v2 prompts adopted.

| Criterion | Result |
|---|---|
| Scope fidelity | ✅ component-003: 1182L → 452L |
| Prompt alignment | ✅ All 5 scored 3/3 |
| Training signal | ✅ 4/5 ratio ≥1.4 |
| No external resources | ✅ All clean |
| Critique specificity | ✅ 733-1041 words with measurements |

---

## 8. Design Decisions & Rationale

### Why inline CSS (not Tailwind CDN)

Tailwind CDN confirmed NOT blocked on AutoDL westd (tested 2026-05-20). Original timeout was `networkidle` waiting for CDN connections — fixed by `domcontentloaded` + 3000ms.

Inline CSS still used because: the fine-tuned model should learn real CSS that works offline without Tailwind installed. COMPONENT_PROMPTS_V2 enforce it at the prompt level. Target home users run offline.

### Why Codex CLI not OpenAI REST API

Codex CLI uses ChatGPT account OAuth — no per-token cost. REST API would incur significant charges for 2,500+ critique+improve calls. Note: Codex has daily quota limits — if exhausted, `claude -p` is a reliable substitute (proven in eval Stage B: 95 batches, zero failures).

### Why the original prompt is passed to improve.ts

Without it, Codex infers scope from the screenshot and expands it. Component-003 (navbar prompt) became a 1,182-line SaaS landing page without the prompt constraint. With the prompt: 452 lines, correct scope, score improved 4→6.

### Why natural language prompts (v2)

Training on expert Tailwind-class prompts creates inference mismatch — model learns expert input, not normal user input. v2 results: avg score 5.7→6.4, scope fidelity dramatically improved.

### Why 200-400 qualifying conversation traces

Qwen3-VL-8B already knows how to ask questions — it's a behavioral nudge (when/what to ask), not a new capability. 200-400 examples is sufficient. Final dataset: 254 traces (150 ask, 104 immediate = 59/41 split).

### Why not two models

Single fine-tuned model is the only practical product for home users. Two models = two downloads, two GPU loads, routing logic the user shouldn't see.

### Why temperature variants (5 runs)

Training data diversity — same 100 prompts at 5 temperatures produces varied output styles. Quality gate: if run median < 5/10, skip that run. All 5 runs passed (scores 6-7/10 median across runs).

### Why `claude -p` over Codex for future generation tasks

Codex CLI has daily quota limits and inconsistent timeouts on long HTML generation. `claude -p` subprocess pattern is identical, uses Max subscription with no daily quota, and proved more reliable in eval Stage B. Recommend switching `generate-conversations.ts` to `claude -p` if regeneration is ever needed.

---

## 9. Prompt Design Principles (v2 Standard)

All prompts must follow these rules:

**DO:**
- Write as a real non-designer user would type
- Include brand name / domain context ("my dog daycare called Stay Fit")
- Include rough style direction ("fun and colorful", "clean and minimal", "dark theme")
- Specify component type OR page type — not both
- Include key content elements

**DON'T:**
- Use Tailwind class names (`bg-blue-600`, `px-8 py-3`)
- Specify exact pixel values or font weights
- Include implementation details the user wouldn't know

**Good:**
```
"Make a top navigation bar for my SaaS called TaskFlow. Logo on the left, 
nav links in the middle (Features, Pricing, Docs, Blog), Sign In and a 
blue Get Started button on the right. Should work on mobile."
```

**Bad:**
```
"Build a navbar. bg-white border-b border-gray-200 w-full px-6 py-4 
flex items-center justify-between..."
```

---

## 10. What the Fine-Tuned Model Should Do

**Scenario 1 — Vague request (ask questions):**
```
User: "build me a website for my dog daycare called Stay Fit"

Model: "Happy to build this. Three quick questions:
1. Is this mainly so people can find and contact you, or do they book online?
2. One scrolling page or separate pages (Services, About, Contact)?
3. Fun and playful, or clean and professional?"

User: "contact info, one page, fun colors"

Model: [produces complete HTML/CSS/JS with smooth scroll, hover states, animations]
```

**Scenario 2 — Screenshot input (critique + improve):**
```
User: [uploads screenshot] "Can you improve this design?"

Model: "I can see several issues:
- Heading hierarchy too flat — everything the same weight
- 32px between sections too tight — needs 64px minimum
- CTA button contrast 3.2:1, below WCAG AA (4.5:1 minimum)

Here's the improved version..."
```

**Scenario 3 — Component request (build immediately):**
```
User: "make me a pricing card with three tiers for my SaaS"

Model: [no questions — scope is clear]
[produces complete three-tier pricing card with all states]
```

---

## 11. Next Session Startup

```
1. Read CLAUDE.md — start with ⚡ Continue From Here section
2. Read PLAN.md — check Implementation Checklist
3. Check AutoDL web UI for current SSH port (port changes on reboot)
4. Do not restart any screen sessions without checking screen -ls first
```

**Fresh machine setup:**
```bash
git clone https://github.com/stefans71/frontend-design-dataset.git
cd frontend-design-dataset
bun install
cp .env.example .env
# AutoDL setup: follow Section 5
```

---

## 12. File Reference

| File | Location | Purpose |
|---|---|---|
| `CLAUDE.md` | project root | Agent context — read first every session |
| `PLAN.md` | project root | Implementation checklist |
| `FRONTEND-DESIGN-MODEL-CARD.md` | project root | This file — project overview and handoff |
| `autodl-run.sh` | project root | AutoDL env setup — source before every run |
| `src/pipeline.ts` | src/ | Orchestrator — all stages with JST timestamps |
| `src/generate.ts` | src/ | Stage 1 — Qwen HTML generation + TEMPERATURE |
| `src/render.ts` | src/ | Stage 2 — Playwright (domcontentloaded+3000ms) |
| `src/critique.ts` | src/ | Stage 3 — Codex design critique |
| `src/improve.ts` | src/ | Stage 3b — Codex improved HTML (scope-constrained) |
| `src/package-dataset.ts` | src/ | Stage 4 — 6-type JSONL assembly + stats |
| `src/evaluate.ts` | src/ | Stage 5 — Two-stage eval (regex + claude -p LLM) |
| `src/generate-conversations.ts` | src/ | Stage 6 — Qualifying conversation traces |
| `prompts/components.ts` | prompts/ | COMPONENT_PROMPTS (v1) + COMPONENT_PROMPTS_V2 (100) |
| `scripts/rsync-to-autodl.sh` | scripts/ | Push code/data to AutoDL |
| `scripts/rsync-from-autodl.sh` | scripts/ | Pull output from AutoDL |
| `scripts/run-all-variants.sh` | scripts/ | 5-temperature full run orchestration |
| `output/dataset-final.jsonl` | output/ | ← FINE-TUNE INPUT — 3,089 records |
| `output/dataset-clean.jsonl` | output/ | Post-eval component records (2,835) |
| `output/qualifying-conversations.jsonl` | output/ | 254 conversation traces |
| `output/scores.jsonl` | output/ | Per-component eval scores |
| `output/eval-summary.json` | output/ | Aggregate eval stats |
| `output/dataset-run{N}.jsonl` | output/ | Per-temperature-run datasets |
| `start.sh` | AutoDL `/root/autodl-tmp/` | Starts both llama-server instances |
| `setup-pi.sh` | AutoDL `/root/autodl-tmp/` | PI Agent setup (separate project) |

---

## 13. Second Training Dataset — Qualifying Conversation Traces

### Purpose

Teaches the model when to ask follow-up questions vs build immediately. Without this dataset the fine-tuned model builds immediately on every prompt regardless of vagueness — the baseline test confirmed this (1/10 on qualifying questions).

### The Decision Boundary

| Prompt type | Correct behavior |
|---|---|
| Component request ("make me a button") | Build immediately |
| Partially specified ("dark pricing card, 3 tiers") | Build immediately |
| Full page/site/app, vague ("build me a website") | Ask 2-3 questions |
| Full page, specified ("one-page dark portfolio, hero + grid + contact") | Build immediately |
| Screenshot input | Critique/improve immediately |

Training must show BOTH sides — ask AND immediate. Final split: 59% ask / 41% immediate.

### Questions the Model Should Ask (max 2-3)

1. **Purpose** — what does it need to do? (find/contact vs book/buy/sign up)
2. **Scope** — one page or multiple? Component or full page?
3. **Style** — only if not already stated (professional vs playful, dark vs light)

Never ask about tech stack — model decides based on answers.

### Generation Notes

- Generated via Codex CLI with persona + domain injection per batch
- 5 conversations per batch (not 10 — reduces timeout risk)
- 480s timeout (content-heavy domains like restaurant generate long HTML)
- If Codex quota exhausted: switch to `claude -p` — identical subprocess pattern, no daily quota
- Diversity via: 5 personas × 14 domains = 70 combinations, plus transition style variation

---

## 14. Fine-Tune Configuration — Qwen3-VL-8B QLoRA

### CRITICAL: Qwen3-VL Patch Size

Qwen3-VL uses **32×32 pixel patches**, NOT 28×28 like Qwen2.5-VL. Copying a Qwen2.5-VL config silently mis-sizes images and causes OOM on 1200+ token images.

### Required Parameters

```bash
swift sft \
  --model Qwen/Qwen3-VL-8B-Instruct \
  --tuner_type lora \
  --lora_rank 32 \
  --dataset output/dataset-final.jsonl \
  --num_train_epochs 3 \
  --image_min_pixels $((256 * 32 * 32)) \
  --image_max_pixels $((1280 * 32 * 32)) \
  --tune_mm_vision False \
  --gradient_checkpointing True \
  --output_dir ./output-finetune
```

Environment variable required:
```bash
export PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True'
```

Config:
```python
load_in_4bit = True   # QLoRA — safe for Qwen3-VL (NOT safe for Qwen3.5)
```

### Pre-training Smoke Test (always run first)

```bash
# 10 steps only — confirm loss drops by step 5
swift sft [above params] --max_steps 10
# Check tensorboard or loss output — should decrease from step 1→5
# If loss is flat or spiking → config problem, fix before full run
```

### Before Starting

```bash
pkill -f ollama   # Kill any Ollama process — holds VRAM and blocks training
nvidia-smi        # Confirm GPU free
```

---

## 15. Post-Fine-Tune Validation Protocol

Run all 4 tests after fine-tuning before releasing. Compare against baseline.

### Test A — Vision critique quality
Upload a 4/10 component screenshot. Ask for design critique.
- **PASS:** Mentions specific measurements, hex/color contrast, named design principles, scores component
- **FAIL:** Generic feedback only
- **Target:** 7+/10 (baseline: 5/10)

### Test B — Qualifying questions (10 vague prompts)
Run all 10 prompts, count how many trigger qualifying questions vs immediate build.
- **PASS:** Asks questions on ≥6/10
- **FAIL:** <6/10
- **Target:** 8+/10 (baseline: 1/10)

**10 test prompts:**
1. "build me a website for my dog daycare called Stay Fit"
2. "make me an app for my restaurant"
3. "I need a landing page for my startup"
4. "build something for my photography business"
5. "create a site for my yoga studio"
6. "I want a web presence for my law firm"
7. "make me a dashboard"
8. "build a portfolio for me"
9. "I need an online store"
10. "create something for my fitness coaching business"

### Test C — System prompt length tax
Measure tokens in system prompt needed for correct behavior.
- **PASS:** ≤200 tokens achieves correct behavior (baked into weights)
- **FAIL:** >500 tokens needed (eats KV cache on 12GB GPU)
- **Target:** Near-zero system prompt (baseline: untested, RLHF overrides any prompt)

### Test D — Markdown chatter
Ask for a component 3 times. Count non-code tokens per response.
- **PASS:** Clean HTML output, <20 wrapper tokens
- **FAIL:** Consistent preamble + markdown fences + explanation text
- **Target:** Minimal chatter (baseline: typical LLM verbosity)

### Fine-tune passed if:
- Test A: 7+/10
- Test B: ≥6/10 vague prompts trigger questions
- Test C: ≤200 token system prompt sufficient
- Test D: Clean output, minimal chatter

---

## 16. Section Notes (from Gemini review, 2026-05-20)

Items flagged for future dataset regeneration or model card accuracy:

1. **Visual score metric** — Line count ratio (≥1.4) was replaced with regex quality check (hex colors + measurements). The eval rubric in Section 7 reflects the final approach.

2. **"Inline CSS" wording** — Prompts say "inline CSS" meaning a `<style>` block in `<head>`, NOT `style=""` attributes on elements. The `<style>` block approach preserves `:hover`, `@media`, and CSS transitions. Never revert to inline style attributes.

3. **Screenshot resolution for inference** — Documented in Section 2. Users on 12GB GPUs should resize screenshots to max 1024×1024 before uploading to avoid vision encoder OOM.

4. **Conversation trace diversity** — Batches of 5 (not 10) with persona + domain injection prevents diversity collapse. If regenerating, maintain this batch size and inject variation per call.
