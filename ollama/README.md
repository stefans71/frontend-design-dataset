# Ollama Modelfiles

These modelfiles are draft configurations for deploying the fine-tuned models via Ollama.

## Models

| File | Model | Size | Target GPU |
|---|---|---|---|
| `Modelfile.8b` | frontend-design-expert | Q4_K_M 4.7 GB | 8–12 GB VRAM |
| `Modelfile.4b` | frontend-design-lite | Q4_K_M 2.4 GB | 6–8 GB VRAM |

## Quick Start

```bash
# Copy GGUF to the same directory or update FROM path in the modelfile
ollama create frontend-design-expert -f Modelfile.8b
ollama run frontend-design-expert

ollama create frontend-design-lite -f Modelfile.4b
ollama run frontend-design-lite
```

## Vision Support

Ollama does not yet natively support multimodal Qwen3-VL GGUF.
For vision tasks (screenshot critique, screenshot-to-code), use llama-server directly:

```bash
# 8B with vision
llama-server \
  -m frontend-design-expert-Q4_K_M.gguf \
  --mmproj mmproj-F16.gguf \
  --port 11434 -c 8192 -ngl 99 --cache-reuse 0

# 4B with vision
llama-server \
  -m frontend-design-lite-Q4_K_M.gguf \
  --mmproj mmproj-Qwen3VL-4B-Instruct-F16.gguf \
  --port 11434 -c 8192 -ngl 99 --cache-reuse 0
```

## Validated Prompt Patterns

```
# Vision critique (must use exact phrase)
"Critique this UI design."

# Qualifying behavior (vague requests)
"Build me a website for my dog daycare"
→ model asks: what kind of site, one page or multi, style?

# HTML generation (component requests)
"Build a pricing card with free/pro/enterprise tiers in dark theme"
→ model outputs clean HTML directly, no preamble
```

## Notes

- Use `--no-think` or `chat_template_kwargs: {enable_thinking: false}` to suppress thinking mode
- The 8B model produces zero wrapper text; 4B produces ~36 chars of preamble
- Both models require the Qwen3 chat template (included in modelfiles above)
