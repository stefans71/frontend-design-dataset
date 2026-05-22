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

![Before vs After: Base Model vs Fine-tuned on FitTrack login prompt](hero-comparison.png)

# Frontend Design Expert — 8B

A fine-tuned vision-language model that generates production-quality HTML/CSS components, critiques UI screenshots, and asks clarifying questions on vague design requests.

Fine-tuned from `Qwen/Qwen3-VL-8B-Instruct` on 3,090 synthetic frontend design training records generated via teacher-student distillation — GPT-5.4 critiquing and improving Qwen-generated components.

**Companion model:** [stefans71/frontend-design-lite-4b](https://huggingface.co/stefans71/frontend-design-lite-4b) — same training, 4B parameters, fits 8GB GPUs.

---

## What It Does

### 1. Asks qualifying questions on vague requests
```
User: build me a website for my dog daycare called Stay Fit

Model: Happy to build this. Three quick questions:
1. Is this mainly so people can find and contact you, or do they need to book appointments online?
2. One scrolling page or separate pages (Services, About, Contact)?
3. Fun and playful vibe, or clean and professional?
```

### 2. Generates brand-specific, prompt-faithful components
Given a brand name and domain, the model generates contextually appropriate copy, CTAs, and color schemes — not generic SaaS defaults.

### 3. Critiques UI screenshots with specific measurements
```
User: [uploads screenshot] Critique this UI design.

Model: Several issues to address:
- Heading hierarchy is flat — h1 and h2 are both 18px, indistinguishable
- Section gaps at 24px are too tight — minimum 48px between major sections  
- CTA button contrast ratio 3.2:1 fails WCAG AA (minimum 4.5:1)
- No hover states on interactive elements...
```

> **Note:** Use the exact phrase `"Critique this UI design."` for vision critique — the model learned this trigger phrase during training.

---

## Before / After Comparison

Fine-tuned vs. base Qwen3-VL-8B on the same prompts:

| Prompt | Improvement |
|---|---|
| Pricing card (3 tiers, dark, purple) | Fine-tuned renders all 3 tiers with "Most Popular" badge, per-plan CTAs; base renders a single Pro card |
| Navbar (dog daycare, light, warm) | Fine-tuned uses domain-appropriate labels ("Book a Spot"); base produces generic SaaS links with rendering artifacts |
| Login form (fitness app, dark, green accent) | Fine-tuned applies green consistently across focus rings, CTA, links; base defaults to blue regardless |
| Stats dashboard (revenue + users + churn) | Fine-tuned produces two linked KPI cards with sparkline; base renders one standalone chart |
| Mobile bottom nav (5 tabs, orange active) | Fine-tuned delivers all 5 labeled tabs with correct active state; base generates a social feed instead |
| Testimonial card (minimal, photo + stars + quote) | Fine-tuned outputs focused single card; base adds unrequested carousel with prev/next arrows |

**Key patterns observed:**
- **Prompt adherence** — doesn't add unrequested UI chrome or omit requested elements
- **Brand specificity** — contextually appropriate copy and CTAs from brand name alone  
- **Color fidelity** — named accent colors applied consistently across all interactive elements
- **Layout complexity** — handles multi-component layouts correctly on first generation

---

## Files

| File | Size | Use |
|---|---|---|
| `frontend-design-expert-Q4_K_M.gguf` | 4.7 GB | Primary — 12GB GPU (RTX 3060, RTX 4070, etc.) |
| `frontend-design-expert-Q3_K_M.gguf` | 3.9 GB | Tight 12GB — more KV cache headroom |
| `mmproj-F16.gguf` | 1.1 GB | Vision encoder — required for screenshot input |

---

## Quick Start

### Text-only (Ollama)

```bash
ollama pull stefans71/frontend-design-expert-8b
ollama run stefans71/frontend-design-expert-8b "make me a pricing card for my SaaS called TaskFlow"
```

### Vision + Text (llama-server)

Ollama does not currently support separate mmproj files for vision. Use llama-server for screenshot critique:

```bash
# Install llama.cpp (brew install llama.cpp on Mac, or build from source)

llama-server \
  -m frontend-design-expert-Q4_K_M.gguf \
  --mmproj mmproj-F16.gguf \
  -c 8192 \
  --host 0.0.0.0 \
  --port 8080
```

Then send requests via the OpenAI-compatible API:

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

- **Vision critique trigger:** Use exactly `"Critique this UI design."` — the model learned this phrase during training
- **Disable thinking mode:** Add `"chat_template_kwargs": {"enable_thinking": false}` to API requests
- **Screenshot resolution:** Resize screenshots to max 1024×1024 before uploading to avoid VRAM OOM on 12GB GPUs
- **Context window:** 8192 tokens recommended; increase to 32768 if generating long page builds

---

## Training Details

| Property | Value |
|---|---|
| Base model | Qwen/Qwen3-VL-8B-Instruct |
| Method | QLoRA (NF4 4-bit + BF16 LoRA adapters, rank 32) |
| Dataset | 3,090 records — see [stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset) |
| Hardware | NVIDIA RTX 5090 (32GB, Blackwell) |
| Training time | 2h 39m |
| Final loss | 0.246 |
| Token accuracy | 98.1% |
| Framework | SWIFT 4.2.1 (Alibaba) |
| Vision encoder | Frozen (`--freeze_vit True`) |

### Dataset composition

| Record type | Count | Description |
|---|---|---|
| `screenshot_code_critique_to_improved` | ~472 | Most valuable — PNG + HTML + critique → expert improved HTML |
| `screenshot_to_critique` | ~472 | Desktop screenshot → design critique |
| `screenshot_to_code` | ~472 | Desktop screenshot → HTML reconstruction |
| `mobile_to_code` | ~472 | Mobile screenshot → HTML |
| `screenshot_html_to_critique` | ~472 | Screenshot + HTML → detailed critique |
| `prompt_to_html` | ~472 | Natural language prompt → HTML component |
| `qualifying_conversation` | 150 | Vague request → qualifying questions → build |
| `immediate_conversation` | 104 | Clear request → direct build |

### Training methodology

Teacher-student distillation:
1. **Qwen3.6-27B** generates HTML components from natural language prompts
2. **Playwright** renders each component to desktop (1280×900) and mobile (390×844) screenshots
3. **GPT-5.4 (Codex)** critiques each screenshot and rewrites the HTML with expert-level design improvements
4. Training pairs: `[bad screenshot + bad code + expert critique] → [expert improved code]`

The gap between Qwen's output and GPT-5.4's improvement is the training signal. After fine-tuning, the 8B model internalizes expert design judgment — hover states, WCAG contrast, color consistency, layout hierarchy — without needing a system prompt.

---

## Validated Behaviors

Tested against base Qwen3-VL-8B-Instruct:

| Test | Baseline | Fine-tuned | Target |
|---|---|---|---|
| Vision critique specificity | 5/10 (vague) | PASS (px, hex, WCAG) | 7+/10 |
| Qualifying questions (10 vague prompts) | 1/10 | 10/10 | 6+/10 |
| Zero system prompt behavior | N/A | 4/5 correct | — |
| Clean HTML output (no wrapper text) | Verbose | 0 wrapper chars | <20 chars |

The qualifying question behavior (1/10 → 10/10) is the headline result. Base models are RLHF-tuned to be immediately helpful — they build immediately regardless of prompt vagueness. Fine-tuning on 254 qualifying conversation traces baked the "pause and clarify" behavior into the weights.

---

## Limitations

- Vision critique requires the exact phrase `"Critique this UI design."` — other phrasings may not reliably activate the critique behavior
- Ollama does not currently support separate mmproj files — use llama-server for vision tasks
- Generated HTML uses inline CSS only (no Tailwind CDN) — intentional for offline compatibility
- Complex HTML outputs may be truncated at 4096 tokens — increase `max_tokens` for full-page builds
- 4B Lite version may truncate complex components more frequently than 8B

---

## Related

- **[stefans71/frontend-design-lite-4b](https://huggingface.co/stefans71/frontend-design-lite-4b)** — 4B version for 8GB GPUs
- **[stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset)** — training pipeline (Bun + TypeScript + Playwright)
- Base model: **[Qwen/Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)**

---

## Citation

```bibtex
@misc{stefan2026frontenddesign,
  title={Frontend Design Expert: Fine-tuning Qwen3-VL-8B for UI Generation via Teacher-Student Distillation},
  author={Stefan, Scott},
  year={2026},
  url={https://huggingface.co/stefans71/frontend-design-expert-8b}
}
```
