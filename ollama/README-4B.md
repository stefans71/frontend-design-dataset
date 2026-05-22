---
license: apache-2.0
base_model: Qwen/Qwen3-VL-4B-Instruct
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

# Frontend Design Lite — 4B

A lightweight fine-tuned vision-language model for frontend design tasks. Fits comfortably on **8GB GPUs** (RTX 3060 8GB, older laptops, entry-level Macs).

Fine-tuned from `Qwen/Qwen3-VL-4B-Instruct` on the same 3,090 training records as the 8B version, using BF16 LoRA for cleaner gradients at smaller parameter count.

**Pro version:** [stefans71/frontend-design-expert-8b](https://huggingface.co/stefans71/frontend-design-expert-8b) — 8B parameters, higher accuracy, requires 12GB GPU.

---

## What It Does

Same capabilities as the 8B version at reduced size:

- **Asks qualifying questions** on vague page/site/app requests (8/10 on vague prompts vs 1/10 baseline)
- **Generates brand-specific HTML/CSS** with correct color schemes, CTAs, and layout
- **Critiques UI screenshots** with specific measurements and WCAG references
- **Builds immediately** on clear component requests without unnecessary questions

---

## Files

| File | Size | Use |
|---|---|---|
| `frontend-design-lite-Q4_K_M.gguf` | 2.4 GB | Primary — 8GB GPU |
| `frontend-design-lite-Q3_K_M.gguf` | 2.0 GB | Tight 8GB — more KV cache |
| `mmproj-4b-F16.gguf` | ~0.5 GB | Vision encoder — required for screenshot input |

**Total for vision inference:** ~2.9GB — leaves ~5GB for KV cache on 8GB GPU.

---

## Quick Start

### Text-only (Ollama)

```bash
ollama pull stefans71/frontend-design-lite-4b
ollama run stefans71/frontend-design-lite-4b "make me a navbar for my bakery called Sunrise Breads"
```

### Vision + Text (llama-server)

```bash
llama-server \
  -m frontend-design-lite-Q4_K_M.gguf \
  --mmproj mmproj-4b-F16.gguf \
  -c 8192 \
  --host 0.0.0.0 \
  --port 8080
```

> **Note:** Use exactly `"Critique this UI design."` for vision critique — the model learned this trigger phrase during training.

---

## Training Details

| Property | Value |
|---|---|
| Base model | Qwen/Qwen3-VL-4B-Instruct |
| Method | BF16 LoRA (rank 32) — no quantization during training |
| Dataset | 3,090 records (same as 8B) |
| Hardware | NVIDIA RTX 5090 (32GB) |
| Training time | 53 minutes |
| Final loss | 0.325 |
| Token accuracy | 92.5% |
| Epochs | 2 |

BF16 (not 4-bit) was used for training because the 4B has fewer parameters to absorb the training signal — cleaner gradients help it punch above its weight class.

---

## Validated Behaviors

| Test | Baseline | Fine-tuned | Target |
|---|---|---|---|
| Vision critique specificity | 5/10 (vague) | PASS (px, hex, WCAG) | 7+/10 |
| Qualifying questions (10 vague prompts) | 1/10 | 8/10 | 5+/10 |
| Zero system prompt behavior | N/A | 3/5 correct | — |
| Clean HTML output | Verbose | 36 wrapper chars | <50 chars |

---

## 4B vs 8B — When to Use Which

| | 4B Lite | 8B Expert |
|---|---|---|
| GPU requirement | 8GB | 12GB |
| Q4_K_M size | 2.4 GB | 4.7 GB |
| Qualifying questions | 8/10 | 10/10 |
| Token accuracy | 92.5% | 98.1% |
| Complex layouts | May truncate | Handles cleanly |
| Speed | Faster | Slightly slower |

Choose 4B if you have an 8GB GPU or want faster inference. Choose 8B for higher accuracy on complex multi-component layouts.

---

## Limitations

- Vision critique requires exact phrase `"Critique this UI design."`
- Ollama does not currently support separate mmproj files — use llama-server for vision
- May truncate complex HTML outputs more than 8B — increase `max_tokens` for full-page builds
- Generated HTML uses inline CSS only — no Tailwind CDN (intentional for offline use)

---

## Related

- **[stefans71/frontend-design-expert-8b](https://huggingface.co/stefans71/frontend-design-expert-8b)** — 8B Pro version
- **[stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset)** — training pipeline
- Base model: **[Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)**
