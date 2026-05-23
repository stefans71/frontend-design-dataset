# Reddit Post — r/LocalLLaMA

## Title

I fine-tuned Qwen3-VL-8B on 3,090 GPT-5.4 critique pairs — it now asks qualifying questions before building (1/10 → 10/10)

## Image

`hero-comparison.png` — attach before posting (FitTrack login: base blue vs fine-tuned green)

## Body

For the past week I built a synthetic dataset pipeline and fine-tuned
Qwen3-VL-8B to be a frontend design expert that runs locally on a 12GB GPU.

**The core problem I wanted to solve:**
Base models are RLHF-tuned to be immediately helpful — they build
immediately regardless of how vague the request is. You can't fix this
with a system prompt. It has to be trained into the weights.

**Baseline test (before fine-tuning):**
"build me a website for my dog daycare called Stay Fit"
→ Base model immediately generates 400 lines of generic HTML
→ Wrong brand name, blue buttons, no contact form

**After fine-tuning:**
→ "Three quick questions:
   1. Is this mainly so people can find you, or do they need to book online?
   2. One scrolling page or multiple pages?
   3. Fun and playful, or clean and professional?"
→ Then builds exactly what was asked

**Qualifying questions: 1/10 → 10/10** on vague prompts

**How I built the dataset (3,090 records):**
- Qwen3.6-27B generates HTML components from 100 natural language prompts
- Playwright renders each to desktop + mobile screenshots
- GPT-5.4 critiques the design (specific px measurements, WCAG contrast,
  named design principles)
- GPT-5.4 rewrites with expert improvements
- Training pairs: [bad screenshot + bad code + critique] → [expert improved code]
- 254 qualifying conversation traces (59% ask / 41% immediate build)

**Head-to-head validation (base vs fine-tuned, same hardware):**
| Category | Base 8B | Fine-tuned 8B | Delta |
|---|---|---|---|
| Mobile components | 1-5/10 | 6-6.5/10 | +1 to +5 |
| Forms | 5/10 | 5-6.5/10 | 0 to +1.5 |
| Cards | 5/10 | 5-6/10 | 0 to +1 |
| Average | 4.50/10 | 5.50/10 | +1.00 |

Fine-tuned wins 6/10, ties 3/10, loses 1/10 (dark navbar only)

**Vision critique also improved:**
Before: vague feedback, no measurements
After: specific px values, hex colors, WCAG AA contrast ratios

**Models (free, Apache 2.0):**
- 8B Expert (12GB GPU): huggingface.co/stefans71/frontend-design-expert-8b
- 4B Lite (8GB GPU): huggingface.co/stefans71/frontend-design-lite-4b

**Dataset + pipeline code:**
github.com/stefans71/frontend-design-dataset

Happy to answer questions about the training approach, dataset generation,
or the qualifying question behavior specifically.
