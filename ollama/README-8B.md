---
license: apache-2.0
base_model: Qwen/Qwen3-VL-8B-Instruct
tags:
- frontend
- web-design
- ui-ux
- code-generation
- vision-language
- gguf
- qwen3-vl
- fine-tuned
language:
- en
pipeline_tag: image-text-to-text
---

<p align="center">
  <img src="hero.png" alt="Frontend Design Expert — Fine-tuned Qwen3-VL that asks before it builds" width="800"/>
</p>

<p align="center">
  <a href="https://huggingface.co/stefans71/frontend-design-lite-4b"><img src="https://img.shields.io/badge/🤗-4B_Lite_(8GB_GPU)-blue" alt="4B Lite"/></a>
  <a href="https://github.com/stefans71/frontend-design-dataset"><img src="https://img.shields.io/badge/GitHub-Dataset_Pipeline-green" alt="GitHub"/></a>
  <img src="https://img.shields.io/badge/Base-Qwen3--VL--8B-4b8bbf" alt="Base model"/>
  <img src="https://img.shields.io/badge/License-Apache_2.0-gray" alt="License"/>
</p>

---

> [!IMPORTANT]
> **Vision critique trigger:** Use exactly `"Critique this UI design."` when sending a screenshot.
> The model learned this specific phrase during training — other phrasings may not reliably activate the critique behavior.

## The Problem

Base models are RLHF-tuned to be immediately helpful — they build immediately regardless of how vague the request is. You can't fix this with a system prompt. It has to be trained into the weights.

<p align="center">
  <img src="terminal.png" alt="Base Model vs Fine-tuned: qualifying question behavior" width="800"/>
</p>

**1/10 → 10/10** on qualifying questions. All 10 tested vague prompts triggered clarifying questions from the fine-tuned model; only 1/10 from the base model.

---

## Before / After

<p align="center">
  <img src="hero-comparison.png" alt="Before vs After: Base Model vs Fine-tuned on FitTrack login prompt" width="800"/>
</p>

*Left: base Qwen3-VL-8B ignores the brand name and defaults to blue. Right: fine-tuned model applies FitTrack branding and green accent across every interactive element.*

Fine-tuned vs. base Qwen3-VL-8B on the same prompts:

| Prompt | Base Model | Fine-tuned |
|---|---|---|
| Pricing card — dark, purple, 3 tiers | Renders one Pro card | All 3 tiers with "Most Popular" badge |
| Navbar — dog daycare, warm colors | Generic SaaS links + rendering artifacts | Domain-appropriate labels ("Book a Spot") |
| Login form — fitness app, green accent | Blue buttons regardless | Green applied consistently across all states |
| Stats dashboard — revenue + users + churn | One standalone chart | Two linked KPI cards with sparkline |
| Mobile bottom nav — 5 tabs, orange active | Generates a social feed | All 5 labeled tabs, correct active state |
| Testimonial card — minimal, photo + stars | Adds unrequested carousel | Focused single card |

---

## Training Pipeline

<p align="center">
  <img src="pipeline.png" alt="Training pipeline: Natural Prompt → Qwen3.6-27B → Playwright → GPT-5.4 → 3,090 Records → Fine-tuned 8B" width="800"/>
</p>

Teacher-student distillation:
1. **Qwen3.6-27B** generates HTML components from natural language prompts
2. **Playwright** renders each component to desktop (1280×900) and mobile (390×844) screenshots
3. **GPT-5.4** critiques each screenshot and rewrites the HTML with expert design improvements — hover states, WCAG contrast, color consistency, layout hierarchy
4. Training pairs: `[screenshot + original HTML + critique] → [expert improved HTML]`

The gap between Qwen's output and GPT-5.4's rewrite is the training signal. 3,090 records across 8 types:

| Record type | Count | Description |
|---|---|---|
| `screenshot_code_critique_to_improved` | ~472 | PNG + HTML + critique → expert improved HTML — most valuable |
| `screenshot_to_critique` | ~472 | Desktop screenshot → design critique with measurements |
| `screenshot_to_code` | ~472 | Desktop screenshot → HTML reconstruction |
| `mobile_to_code` | ~472 | Mobile screenshot → HTML |
| `screenshot_html_to_critique` | ~472 | Screenshot + HTML → detailed critique |
| `prompt_to_html` | ~472 | Natural language prompt → HTML component |
| `qualifying_conversation` | 150 | Vague request → questions → answers → build |
| `immediate_conversation` | 104 | Clear request → direct build |

---

## Validated Behaviors

| Test | Base 8B | Fine-tuned 8B | Fine-tuned 4B |
|---|---|---|---|
| Qualifying questions (10 vague) | 1/10 | **10/10** | 9/10 |
| Vision critique specificity | Vague | px + hex + WCAG | px + contrast |
| Token accuracy (training) | — | **98.1%** | 92.5% |
| Clean HTML output | Verbose | **0 wrapper chars** | 0 wrapper chars |
| Self-improvement loop | -0.50 (regresses) | -0.35 (slight regression) | not tested |

### Head-to-Head Design Quality

Head-to-head test: base Qwen3-VL-8B vs fine-tuned, same 10 prompts, same hardware (RTX 3080 Ti 12GB), GPT-5.4 judge using the same critique rubric as training.

| Component | Category | Base | Fine-tuned | Delta |
|---|---|---|---|---|
| Login form (dark) | Form | 5 | 6.5 | +1.5 |
| Checkout form (light) | Form | 5 | 5 | 0 |
| Pricing card (dark) | Card | 5 | 6 | +1 |
| Product card (light) | Card | 5 | 5 | 0 |
| Top navbar (light) | Navbar | 4 | 4 | 0 |
| Sidebar nav (dark) | Navbar | 4 | 3 | -1 |
| Mobile bottom sheet (dark) | Mobile | 1 | 6 | +5 |
| Transaction list (light) | Mobile | 5 | 6.5 | +1.5 |
| CTA section (dark) | Marketing | 6 | 6.5 | +0.5 |
| Invoice table (light) | Data | 5 | 6.5 | +1.5 |
| **Average** | | **4.50** | **5.50** | **+1.00** |

- Fine-tuned wins: 6/10 components
- Tied: 3/10
- Base wins: 1/10 (dark navbar only)
- Biggest improvement: mobile dark bottom sheet +5 (base scored 1, fine-tuned scored 6)

> **Note:** Scores reflect first-pass generation without the improvement step. The model was trained on critique+improvement pairs — ask it to critique and improve its own output for higher quality results.

---

> [!TIP]
> **Thinking mode:** Always disable thinking mode in your inference server.
> Add `"chat_template_kwargs": {"enable_thinking": false}` to API requests,
> or use `--no-think` flag with llama-server.

## Quick Start

### Text-only (Ollama)

```bash
ollama pull stefans71/frontend-design-expert-8b
ollama run stefans71/frontend-design-expert-8b \
  "make me a pricing card for my SaaS called TaskFlow, dark theme, purple accent"
```

### Vision + Text (llama-server)

Ollama does not currently support separate mmproj files for vision. Use llama-server:

```bash
llama-server \
  -m frontend-design-expert-Q4_K_M.gguf \
  --mmproj mmproj-F16.gguf \
  -c 8192 \
  --host 0.0.0.0 \
  --port 8080
```

Send requests via the OpenAI-compatible API:

```python
import base64, requests

with open("screenshot.png", "rb") as f:
    img = base64.b64encode(f.read()).decode()

response = requests.post("http://localhost:8080/v1/chat/completions", json={
    "model": "frontend-design-expert",
    "messages": [{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img}"}},
            {"type": "text", "text": "Critique this UI design."}
        ]
    }],
    "max_tokens": 1024
})
print(response.json()["choices"][0]["message"]["content"])
```

### Inference tips

- **Vision critique trigger:** Use exactly `"Critique this UI design."` — other phrasings may trigger thinking-mode EOS
- **Disable thinking mode:** Add `"chat_template_kwargs": {"enable_thinking": false}` to API requests
- **Screenshot resolution:** Max 1024×1024 to avoid VRAM OOM on 12GB GPUs
- **Context window:** 8192 tokens; increase to 32768 for full-page builds

---

## Files

| File | Size | Use |
|---|---|---|
| `frontend-design-expert-Q4_K_M.gguf` | 4.7 GB | Primary — 12GB GPU (RTX 3060, RTX 4070, etc.) |
| `frontend-design-expert-Q3_K_M.gguf` | 3.9 GB | Tight 12GB — more KV cache headroom |
| `mmproj-F16.gguf` | 1.1 GB | Vision encoder — required for screenshot input |

---

## Training Details

| Property | Value |
|---|---|
| Base model | Qwen/Qwen3-VL-8B-Instruct |
| Method | QLoRA (NF4 4-bit + BF16 LoRA adapters, rank 32) |
| Dataset | 3,090 records — [stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset) |
| Hardware | NVIDIA RTX 5090 (32GB, Blackwell) |
| Training time | 2h 39m |
| Final loss | 0.246 |
| Token accuracy | 98.1% |
| Framework | SWIFT 4.2.1 (Alibaba) |
| Vision encoder | Frozen (`--freeze_vit True`) |

---

## Limitations

- Vision critique requires the exact phrase `"Critique this UI design."` — other phrasings may not reliably activate the behavior
- Ollama does not currently support separate mmproj files — use llama-server for vision tasks
- Generated HTML uses inline CSS only (no Tailwind CDN) — intentional for offline compatibility
- Complex HTML outputs may be truncated at 4096 tokens — increase `max_tokens` for full-page builds

---

## Related

- **[stefans71/frontend-design-lite-4b](https://huggingface.co/stefans71/frontend-design-lite-4b)** — 4B version for 8GB GPUs
- **[stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset)** — training pipeline (Bun + TypeScript + Playwright)
- Base model: **[Qwen/Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)**

---

```bibtex
@misc{stefan2026frontenddesign,
  title={Frontend Design Expert: Fine-tuning Qwen3-VL-8B for UI Generation via Teacher-Student Distillation},
  author={Stefan, Scott},
  year={2026},
  url={https://huggingface.co/stefans71/frontend-design-expert-8b}
}
```
