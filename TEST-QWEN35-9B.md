# Test Plan: qwen3.5:9b Evaluation on AutoDL

**Goal:** Decide whether to fine-tune at all, or which model to target.
**Do not touch:** VPS `vps-improve` screen session — runs independently.

---

## Decision Matrix

| Result | Decision |
|---|---|
| Vision works + all 3 tests score 7+/10 | Skip fine-tune — write system prompt, ship qwen3.5:9b as-is |
| Vision works + scores 4–6/10 | Fine-tune Qwen3.5-4B with 16-bit LoRA |
| Vision broken or scores <4/10 | Fine-tune Qwen3-VL-8B with QLoRA (original plan) |

---

## Pre-flight

**Check VPS is still running** (do this first, do not disturb it):
```bash
screen -ls
tail -5 /tmp/improve-run2c.log 2>/dev/null || tail -5 /tmp/improve-run2b.log 2>/dev/null
```

---

## Step 1 — Start AutoDL

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "bash /root/autodl-tmp/start.sh"
```
Wait for: `Generation server ready`

---

## Step 2 — Install Ollama on AutoDL

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "
  curl -fsSL https://ollama.com/install.sh | sh 2>&1 | tail -5
  ollama --version
"
```

**If China network blocks it:**
```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "
  curl -fsSL https://gh-proxy.com/https://raw.githubusercontent.com/ollama/ollama/main/scripts/install.sh | sh 2>&1 | tail -5
"
```

---

## Step 3 — Pull Model and Copy Test Asset

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "ollama pull qwen3.5:9b"
```

Copy a component screenshot for vision test:
```bash
scp -i /root/.ssh/id_ed25519 -P 25180 \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/output/component-003-run0/screenshot-desktop.png \
  root@connect.westd.seetacloud.com:/tmp/test-component.png
```

For comparison — our existing GPT-5.4 critique of this component:
```bash
cat output/component-003-run0/critique.md
```

---

## Test 1 — Vision Capability

**Can it see a screenshot and produce specific design critique?**

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "
  ollama run qwen3.5:9b 'You are a UI/UX designer. Look at this screenshot and describe every design issue you see. Be specific — name exact spacing problems, contrast issues, typography weaknesses. Score it 1-10.' --image /tmp/test-component.png
"
```

**Score criteria:**
- 8–10: Names specific issues (contrast ratios, spacing inconsistencies, font weight problems), references design principles
- 5–7: General observations, some specifics, not deeply actionable
- 1–4: Vague ("looks good", "could be better"), no specific measurements or principles

**Compare to:** `output/component-003-run0/critique.md`

---

## Test 2 — Qualifying Questions

**Does it ask before building, or just start coding?**

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "
  ollama run qwen3.5:9b 'build me a website for my dog daycare called Stay Fit'
"
```

**Score criteria:**
- 8–10: Asks 2–4 targeted questions (purpose, pages/scope, visual style) before producing any HTML
- 5–7: Asks 1 question or makes reasonable assumptions explicit
- 1–4: Immediately starts building without any clarification

**What we're looking for:** Questions about purpose (contact/booking?), scope (one page vs multi?), and style (playful vs professional?).

---

## Test 3 — Self-Contained Output

**Does it produce inline CSS with no CDN dependencies?**

```bash
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "
  ollama run qwen3.5:9b 'Make me a navbar component for a SaaS app called TaskFlow. Output a complete self-contained HTML file with a style block in the head — no external CDN, no frameworks.'
"
```

**Score criteria:**
- 8–10: Pure `<style>` block in `<head>`, no CDN links, complete HTML, 80+ lines, good visual design
- 5–7: Mostly self-contained but may have minor CDN reference or thin CSS
- 1–4: Uses Tailwind CDN, Bootstrap, or other external resources despite instruction

**Check for:**
```bash
# In the output, look for:
grep -i "cdn\|tailwind\|bootstrap\|googleapis\|unpkg" output.html  # should be empty
grep -c "<style" output.html  # should be 1
wc -l output.html  # aim for 80+
```

---

## Step 4 — Shut Down AutoDL

**After all 3 tests complete, immediately shut down to save costs:**
```bash
# From AutoDL web UI — stop the instance
# Or via SSH if available:
ssh -i /root/.ssh/id_ed25519 -p 25180 root@connect.westd.seetacloud.com "shutdown -h now"
```

---

## Scoring Summary Template

```
Test 1 — Vision:        __/10
  - Specific issues named: Y/N
  - vs GPT-5.4 critique quality: better / similar / worse

Test 2 — Qualifying:    __/10
  - Asked questions: Y/N
  - Number of questions: __
  - Right questions (purpose/scope/style): Y/N

Test 3 — Self-contained: __/10
  - <style> block used: Y/N
  - CDN links: Y/N (should be N)
  - Line count: __
  - Visual quality: good / mediocre / poor

Overall: __/30
Verdict: [ ] Ship as-is  [ ] Fine-tune Qwen3.5-4B  [ ] Fine-tune Qwen3-VL-8B
```

---

## Notes

- Ollama runs models at full precision by default — this is a capability test, not a VRAM test
- If qwen3.5:9b has no vision capability (image flag rejected), that's an immediate <4/10 and we go to Qwen3-VL-8B
- Port 25180 may change after AutoDL reboot — check AutoDL web UI if SSH fails
