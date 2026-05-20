# Implementation Plan

## Status

Stages 1–4 fully implemented and validated on 20 v1 components.
v2 A/B test code ready — pending AutoDL availability for generate+render run.

---

## Prompt Design Principles

All prompts for the full 100-prompt expansion must follow these rules:

**Write like a real non-designer user, not a frontend engineer.**

| ✗ Expert style (v1) | ✓ Natural language style (v2) |
|---|---|
| `bg-gray-950 background` | `dark background` |
| `bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg` | `blue button, white text, rounded corners` |
| `text-5xl font-black` | `large bold price` |
| `border border-purple-500/30 rounded-2xl p-8 shadow-xl` | `card with a subtle purple glow` |

**Each prompt must:**
1. Name a specific component type (button, card, form, nav, table…) — not a "page" or "app"
2. Include brand/product name and realistic content (no "Company Name", no lorem ipsum)
3. State light or dark theme in plain English
4. Mention accent color by name (blue, green, purple, amber…) — no hex, no Tailwind tokens
5. Scope to exactly what should appear on screen — no "also add a hero section below"
6. End with: `Use only inline CSS — no external libraries. Self-contained HTML document.`

**Do not include:**
- Tailwind class names (`bg-gray-950`, `rounded-2xl`, `font-semibold`)
- Pixel or rem values (`px-8`, `py-3`, `text-5xl`, `w-80`)
- CSS property names (`border-radius`, `box-shadow`, `letter-spacing`)
- Framework references (Tailwind, Bootstrap, React, etc.)

---

## prompts/components.ts

Two exported arrays:

- **`COMPONENT_PROMPTS`** — 20 expert-authored v1 prompts. Kept for reference and backward compatibility. Not used in new runs.
- **`COMPONENT_PROMPTS_V2`** — natural language rewrites of the first 5 prompts. Used when `OUTPUT_SUFFIX` is set.
- **Full 100-prompt array** (to be added) — all in natural language style, covering the component mix below.

### Required component mix (100 prompts total)

Maintain at least 40% dark theme. Cover all major UI component categories:

| Category | Count | Examples |
|---|---|---|
| Buttons & CTAs | 8 | Primary CTA, destructive, loading state, icon button, split button |
| Forms | 10 | Login, signup, newsletter, search, settings, contact, checkout |
| Navigation | 8 | Navbar, sidebar, bottom nav, breadcrumb, tab bar, pagination |
| Cards | 12 | Product card, profile card, pricing card, blog post card, stat card |
| Modals & Overlays | 8 | Dialog, confirm, side drawer, image lightbox, command palette |
| Feedback & Status | 10 | Toast, alert banner, empty state, skeleton loader, progress bar |
| Data Display | 12 | Table, list, timeline, kanban column, calendar cell, chart card |
| Marketing | 10 | Testimonial, feature grid, pricing table, FAQ accordion, CTA section |
| Mobile | 8 | Bottom nav, pull-to-refresh, onboarding card, mobile menu, swipe card |
| Misc | 14 | File upload, cookie banner, notification bell, avatar stack, tag input |

Each component gets 5 quality variants in the full run (temperature variation or re-prompting).

---

## Stage 1 — generate.ts

### Function: `generateComponent(prompt: string, outputDir: string): Promise<void>`

1. Check if `{outputDir}/component.html` exists — skip if so
2. POST to `${LLAMA_SERVER_URL}/v1/chat/completions` with system prompt enforcing inline CSS only, zero CDN
3. Extract `choices[0].message.content`
4. Strip markdown fences
5. Save `{outputDir}/component.html`
6. Save `{outputDir}/metadata.json` with prompt, model, timestamp, outputSuffix

### Function: `generateAll(): Promise<void>`

- Reads `TEST_MODE`, `TEST_COUNT`, `OUTPUT_SUFFIX` from env
- If `OUTPUT_SUFFIX` set → uses `COMPONENT_PROMPTS_V2` and dirs like `component-000-v2/`
- Otherwise → uses `COMPONENT_PROMPTS` and dirs like `component-000/`

---

## Stage 2 — render.ts

### Function: `renderAll(): Promise<void>`

- Reads `OUTPUT_SUFFIX` from env
- Filters component dirs by suffix: `OUTPUT_SUFFIX=v2` → matches only `component-*-v2/`
- Desktop screenshot: 1280×900, fullPage
- Mobile screenshot: 390×844, fullPage
- `waitUntil: "networkidle"` + 1500ms buffer (required — do not change)

---

## Stage 3 — critique.ts

### Function: `critiqueAll(): Promise<void>`

- Reads `OUTPUT_SUFFIX` from env, filters dirs accordingly
- Runs Codex sequentially (no parallelism)
- Timeout: 120s per component

---

## Stage 3b — improve.ts

### Function: `improveComponent(id: string, originalPrompt?: string): Promise<void>`

- `originalPrompt` is read from `metadata.json` by `improveAll` and passed in
- If provided, the Codex prompt includes a scope constraint:
  > "A navbar prompt should produce a better navbar, not a landing page."
- If not provided, falls back to: "Improve only the specific component shown."
- Timeout: 300s (HTML output is 3–5× larger than critique text)

### Function: `improveAll(testMode, testCount): Promise<void>`

- Reads `OUTPUT_SUFFIX` from env, filters dirs accordingly
- Reads `metadata.json` per component to get original prompt
- Passes prompt to `improveComponent` as scope constraint

---

## Stage 4 — package-dataset.ts

### Five record types per component

1. **`prompt_to_html`** — text prompt → original HTML
2. **`screenshot_to_critique`** — screenshot → critique text
3. **`screenshot_to_code`** — screenshot → original HTML (reconstruct from visual)
4. **`screenshot_html_to_critique`** — screenshot + HTML → critique
5. **`screenshot_code_critique_to_improved`** — screenshot + original prompt + HTML + critique → improved HTML

Record type 5 now includes the original prompt in the user message so the model learns scope fidelity alongside design improvement.

### Function: `packageAll(): void`

- Reads `OUTPUT_SUFFIX` from env, filters dirs accordingly
- Writes to `output/dataset.jsonl` (or `DATASET_PATH` env var)

---

## Output Directory Structure (per component)

```
output/component-000/          ← v1 (expert prompts)
├── component.html
├── metadata.json              ← includes prompt + outputSuffix field
├── screenshot-desktop.png
├── screenshot-mobile.png
├── critique.md
└── improved.html

output/component-000-v2/       ← v2 (natural language prompts)
├── component.html
├── metadata.json
├── screenshot-desktop.png
├── screenshot-mobile.png
├── critique.md
└── improved.html
```

---

## v2 A/B Test Plan

**Goal:** Validate two fixes before scaling to 100 prompts.

**What to compare for each of the 5 components:**

| Comparison | What we're measuring |
|---|---|
| v1 `component.html` vs v2 `component.html` | Does natural language produce different/better base output from Qwen? |
| v1 `improved.html` vs v2 `improved.html` | Does the scope constraint keep Codex focused on the component type? |
| v1 critique score vs v2 critique score | Do simpler prompts produce better-scored components? |

**Expected outcomes:**
- v2 base HTML: same or slightly lower quality (natural prompts give less precise spec), but more varied and realistic
- v2 improved.html: significantly better scope fidelity (no more navbars becoming landing pages)

**Run sequence:**
```bash
# AutoDL:
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run generate
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run render

# VPS (after rsync):
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run critique
TEST_MODE=true TEST_COUNT=5 OUTPUT_SUFFIX=v2 bun run improve
OUTPUT_SUFFIX=v2 bun run package
```

---

## Implementation Order (remaining)

1. ✅ `prompts/components.ts` — v1 prompts + COMPONENT_PROMPTS_V2
2. ✅ `src/generate.ts` — OUTPUT_SUFFIX, V2 prompt routing
3. ✅ `src/render.ts` — OUTPUT_SUFFIX dir filtering
4. ✅ `src/critique.ts` — OUTPUT_SUFFIX dir filtering
5. ✅ `src/improve.ts` — originalPrompt param, scope instruction, OUTPUT_SUFFIX, metadata reading
6. ✅ `src/package-dataset.ts` — OUTPUT_SUFFIX filtering, original prompt in type-5 record
7. ✅ `src/pipeline.ts` — orchestrator with JST timestamps
8. ✅ `package.json` — test:v2 script
9. ✅ Run v2 A/B test on AutoDL + VPS — VALIDATED (both fixes confirmed, adopted)
10. ⏳ Write all 80 new natural language prompts (bring total to 100)
11. ⏳ Full 100-prompt × 5-variant run → 2,500 records
12. ⏳ Fine-tune Qwen3-VL-8B
