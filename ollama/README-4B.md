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

<p align="center">
  <img src="hero.png" alt="Frontend Design Lite — Fine-tuned Qwen3-VL that asks before it builds" width="800"/>
</p>

<p align="center">
  <a href="https://huggingface.co/stefans71/frontend-design-expert-8b"><img src="https://img.shields.io/badge/🤗-8B_Expert_(12GB_GPU)-orange" alt="8B Expert"/></a>
  <a href="https://github.com/stefans71/frontend-design-dataset"><img src="https://img.shields.io/badge/GitHub-Dataset_Pipeline-green" alt="GitHub"/></a>
  <img src="https://img.shields.io/badge/Base-Qwen3--VL--4B-4b8bbf" alt="Base model"/>
  <img src="https://img.shields.io/badge/License-Apache_2.0-gray" alt="License"/>
</p>

---

## The Problem

Base models are RLHF-tuned to be immediately helpful — they build immediately regardless of how vague the request is. You can't fix this with a system prompt. It has to be trained into the weights.

<p align="center">
  <img src="terminal.png" alt="Base Model vs Fine-tuned: qualifying question behavior" width="800"/>
</p>

**1/10 → 8/10** on qualifying questions. 8 of 10 tested vague prompts triggered clarifying questions from the fine-tuned 4B model; only 1/10 from the base model.

---

## Before / After

<p align="center">
  <img src="hero-comparison.png" alt="Before vs After: Base Model vs Fine-tuned on FitTrack login prompt" width="800"/>
</p>

*Left: base Qwen3-VL-8B ignores the brand name and defaults to blue. Right: fine-tuned model applies FitTrack branding and green accent across every interactive element.*

---

## 4B Lite vs 8B Expert

| | 4B Lite | 8B Expert |
|---|---|---|
| GPU requirement | **8GB** | 12GB |
| Q4_K_M size | **2.4 GB** | 4.7 GB |
| Qualifying questions | 8/10 | 10/10 |
| Token accuracy | 92.5% | 98.1% |
| Complex layouts | May truncate | Handles cleanly |
| Speed | Faster | Slightly slower |

Choose 4B if you have an 8GB GPU or want faster inference. Choose 8B for maximum accuracy on complex multi-component layouts.

---

## Training Pipeline

<p align="center">
  <img src="pipeline.png" alt="Training pipeline: Natural Prompt → Qwen3.6-27B → Playwright → GPT-5.4 → 3,090 Records → Fine-tuned 8B" width="800"/>
</p>

Same dataset and methodology as the 8B version. Teacher-student distillation:
1. **Qwen3.6-27B** generates HTML components from natural language prompts
2. **Playwright** renders each to desktop (1280×900) and mobile (390×844) screenshots
3. **GPT-5.4** critiques and rewrites with expert improvements — WCAG contrast, hover states, color consistency
4. Training pairs: `[screenshot + original HTML + critique] → [expert improved HTML]`

BF16 (not 4-bit) was used for 4B training because fewer parameters means the model needs cleaner gradients to absorb the signal.

---

## Validation Results

| Test | Base Model | Fine-tuned 4B | Fine-tuned 8B |
|---|---|---|---|
| Qualifying questions (10 vague prompts) | 1/10 | **8/10** | 10/10 |
| Vision critique quality | Vague, no measurements | px + hex + WCAG AA | px + hex + WCAG AA |
| Token accuracy | — | **92.5%** | 98.1% |
| Clean HTML output | Verbose markdown | ~36 wrapper chars | Zero wrapper text |

---

## Quick Start

### Text-only (Ollama)

```bash
ollama pull stefans71/frontend-design-lite-4b
ollama run stefans71/frontend-design-lite-4b \
  "make me a navbar for my bakery called Sunrise Breads, warm colors, light theme"
```

### Vision + Text (llama-server)

Ollama does not currently support separate mmproj files for vision. Use llama-server:

```bash
llama-server \
  -m frontend-design-lite-Q4_K_M.gguf \
  --mmproj mmproj-Qwen3VL-4B-Instruct-F16.gguf \
  -c 8192 \
  --host 0.0.0.0 \
  --port 8080
```

> **Vision critique trigger:** Use exactly `"Critique this UI design."` — the model learned this phrase during training. Other phrasings may not reliably activate the behavior.

---

## Files

| File | Size | Use |
|---|---|---|
| `frontend-design-lite-Q4_K_M.gguf` | 2.4 GB | Primary — 8GB GPU |
| `frontend-design-lite-Q3_K_M.gguf` | 2.0 GB | Tight 8GB — more KV cache |
| `mmproj-Qwen3VL-4B-Instruct-F16.gguf` | 0.8 GB | Vision encoder — required for screenshot input |

**Total for vision inference:** ~3.2GB — leaves ~4.8GB for KV cache on 8GB GPU.

---

## Training Details

| Property | Value |
|---|---|
| Base model | Qwen/Qwen3-VL-4B-Instruct |
| Method | BF16 LoRA (rank 32) — no quantization during training |
| Dataset | 3,090 records — [stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset) |
| Hardware | NVIDIA RTX 5090 (32GB) |
| Training time | 53 minutes |
| Final loss | 0.325 |
| Token accuracy | 92.5% |
| Epochs | 2 |

---

## Limitations

- Vision critique requires the exact phrase `"Critique this UI design."` — other phrasings may trigger thinking-mode EOS
- Ollama does not currently support separate mmproj files — use llama-server for vision tasks
- May truncate complex HTML outputs more than 8B — increase `max_tokens` for full-page builds
- Generated HTML uses inline CSS only (no Tailwind CDN) — intentional for offline compatibility

---

## Related

- **[stefans71/frontend-design-expert-8b](https://huggingface.co/stefans71/frontend-design-expert-8b)** — 8B Expert for 12GB GPUs
- **[stefans71/frontend-design-dataset](https://github.com/stefans71/frontend-design-dataset)** — training pipeline
- Base model: **[Qwen/Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)**
