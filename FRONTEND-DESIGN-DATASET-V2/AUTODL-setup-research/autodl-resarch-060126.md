# AutoDL Setup Research — PI Harness V2 Batch Testing

> **Date:** 2026-06-01
> **Purpose:** Determine how to run the PI harness web-design workflow on AutoDL for batch testing (10 prompts, unattended) to measure whether the harness adds capabilities beyond fine-tuned Qwen3.5-VL models.

---

## 1. PI Agent API Interface

**Protocol:** OpenAI-compatible llama-server API (not Ollama, not custom).

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:11434/v1` |
| Endpoints | `/v1/chat/completions`, `/v1/completions`, `/health` |
| Auth | `apiKey: "none"` (literal string, not empty) |
| Server | `llama-server` from am17an/llama.cpp `mtp-clean` branch |
| Format | GGUF quantized models |

The harness does NOT talk to the model directly — it delegates to PI Agent (the host runtime), which handles all HTTP calls. The model config lives at `~/.pi/agent/models.json`.

**Embedding server** runs as a separate llama-server instance on CPU at port 8081 (nomic-embed-text-v1.5, 768-dim vectors). Used by pi-memory for cross-session recall. Optional for batch testing.

---

## 2. Q&A Workflow — How Vague Prompts Are Handled

**No multi-turn questioning.** The harness uses single-turn inference with prompt engineering + approval gates.

When a vague prompt like "build me a website for my dog daycare" comes in:

1. **`calibrate` node** (single-turn prompt) — reads `$USER_MESSAGE` + any existing profile, infers preferences from context, fills gaps with defaults (frontend_level: 5, tech_stack: react_tailwind, etc.), writes `draft-profile.json`
2. **`gate-calibrate` node** (approval) — user sees the summary, approves or provides corrections
3. **`refine-profile` node** (single-turn prompt) — applies corrections, writes final `user-profile.json`
4. **`brief` node** — reads the vague prompt + profile, produces a structured design brief

The workflow explicitly tells the model: "This is a single-turn node — you cannot ask questions interactively." It's a **prompt -> artifact -> gate -> prompt -> artifact** chain, not a conversation.

---

## 3. Conversation Format — Multi-Turn Handling

**Stateless node chains with artifact-based state passing.**

- Each prompt node sends one message to the model via `sendAndWait()`
- When a node has `fresh_context: true`, the executor calls `ctx.newSession()` — clears the KV cache entirely. The model loses all memory of prior phases.
- State between nodes flows through **files on disk** (`$ARTIFACTS_DIR/brief.md`, `design-tokens.md`, `components.md`, etc.)
- Each `fresh_context` node's prompt explicitly lists files to read: "Read these files IN ORDER: 1. HANDOFF.md 2. user-profile.json 3. brief.md..."
- Nodes without `fresh_context` accumulate in the same KV cache session

**Net effect**: The model never sees the full raw conversation history at build time. It sees a curated set of artifact files that earlier nodes produced.

---

## 4. Output Format

**Three output paths:**

1. **Artifact files** (primary) — nodes specify `expected_artifacts: [path1, path2]`. The model writes files using its `write` tool during the turn. Executor checks existence; retries once if missing.
2. **Text via `__respond` tool** — model calls `__respond({"message": "..."})` for free-text responses captured by the executor.
3. **Structured JSON via `output_format`** — some nodes specify a JSON schema; executor appends "respond with ONLY valid JSON" and validates.

For the web-design workflow: the implement node writes actual source files (HTML, CSS, JS/TSX) to the project directory using the `write` tool. It also writes `implement-log.md` as an artifact. The harness does **no post-processing** on the output — files are written as-is by the model's tool calls.

---

## 5. Vision Support

**No.** Purely text-based.

The harness detects vision capability in the model profile (`supportsVision` flag from `input: ["image"]` in config), but never sends images. The web-design workflow (24 nodes) contains zero image/screenshot references. The current model config has `input: ["text"]` only — the Qwen3.6-27B MTP GGUF doesn't include a vision encoder.

---

## 6. Temperature and Inference Settings

The executor specifies NO inference parameters. Everything is delegated to PI Agent's model config:

| Setting | Value | Source |
|---------|-------|--------|
| Temperature | Not set — llama-server default | No override in executor |
| Context window | 131,072 tokens | `models.json` contextWindow |
| Max tokens | 4,096 per completion | `models.json` maxTokens |
| Timeout | 7,200,000 ms (2 hours) | `compat.timeout` |
| Reasoning | Enabled via `enable_thinking` | `compat.thinkingFormat: "qwen"` |

---

## 7. Running in Test Mode

**Minimal command:**

```bash
# From the harness project directory on AutoDL:
export PATH="/root/autodl-tmp/node-v22.15.0-linux-x64/bin:$PATH"
cd /root/autodl-tmp/<harness-dir>
pi
# Then inside the PI session:
/workflow run web-design "build a landing page for a dog daycare business"
```

**Non-interactive (single prompt mode):**

```bash
pi -p "/workflow run web-design-batch build a landing page for a dog daycare"
```

`pi -p` DOES support slash commands — the CLI checks for `/` prefix before sending to the model and routes to the extension command handler. Confirmed by reading the PI Agent source at `_reference/pi-mono/packages/coding-agent/src/core/agent-session.ts` lines 941-956.

**Artifacts land in:** `.pi/workflow-artifacts/<name>-<timestamp>/`

---

## 8. Batch Automation — Can Approval Gates Be Bypassed?

### The Problem

The web-design workflow has 6 approval gates that block on user input:

| Gate | on_reject | Downstream `$REJECTION_REASON` dependency |
|------|-----------|-------------------------------------------|
| gate-calibrate | continue | `refine-profile` reads it — handles empty correctly (copies draft as-is) |
| gate-brief | cancel | None |
| gate-plan | cancel | None |
| gate-prd | cancel | None |
| gate-final | continue | `rework` reads it — handles empty correctly (skips rework) |
| gate-rework | rollback | Terminal — nothing downstream |

The executor calls `ctx.ui.confirm()` at each gate — a synchronous blocking call. There is:
- No `--auto-approve` flag
- No environment variable bypass
- No test mode config
- No way to skip gates without modifying the workflow

### The Solution: Gate-Stripped Test Workflow

Create `.pi/workflows/web-design-batch.yaml` — a copy of `web-design.yaml` with all 6 approval nodes removed. This is safe because:

- The two gates that feed `$REJECTION_REASON` to downstream nodes (`gate-calibrate` -> `refine-profile`, `gate-final` -> `rework`) both have downstream prompts that explicitly handle empty/null rejection reasons by defaulting to "approved" behavior
- `$REJECTION_REASON` resolves to empty string when no gate produces it (executor line 1464)
- The remaining 4 gates (`gate-brief`, `gate-plan`, `gate-prd`, `gate-rework`) have no downstream data dependencies

The resulting 18-node workflow runs straight through with zero human input:

```
scaffold -> read-profile -> calibrate -> refine-profile -> save-profile -> resolve-dictionary
-> brief -> tokens -> inventory -> prd -> plan -> estimate
-> implement -> verify -> review -> rework -> verify-rework -> persist-handoff
```

### Batch Script

```bash
#!/bin/bash
HARNESS="/root/autodl-tmp/<v2-harness-dir>"
RESULTS="$HOME/batch-test-results"
mkdir -p "$RESULTS"

PROMPTS=(
  "Build a landing page for a dog daycare business"
  "Create a portfolio site for a freelance photographer"
  # ... 8 more prompts
)

export PATH="/root/autodl-tmp/node-v22.15.0-linux-x64/bin:$PATH"
cd "$HARNESS"

for i in "${!PROMPTS[@]}"; do
  PROMPT="${PROMPTS[$i]}"
  echo "=== Run $((i+1)): $PROMPT ==="

  pi -p "/workflow run web-design-batch $PROMPT"

  # Find latest artifacts dir
  LATEST=$(ls -td .pi/workflow-artifacts/web-design-batch-* | head -1)

  # Copy outputs
  mkdir -p "$RESULTS/run-$((i+1))"
  cp -r "$LATEST" "$RESULTS/run-$((i+1))/artifacts"
  cp -r src/ design-system/ "$RESULTS/run-$((i+1))/" 2>/dev/null

  # Clean for next run (no git on AutoDL, so just remove generated files)
  rm -rf src/ design-system/ 2>/dev/null

  echo "=== Run $((i+1)) complete ==="
done
```

### Completion Detection

Each run writes:
- `workflow-state.json` — lists `completedNodes` array; all 18 nodes present = done
- `events.jsonl` — append-only log; look for `workflow_end` event

---

## 9. AutoDL Operational Runbook (from V1 test experience)

Source: `PI-Agent-V1/AUTODL-TEST-SETUP.md`

### What's Already on the AutoDL Data Disk

```
/root/autodl-tmp/
├── start.sh                    <- starts both llama-servers
├── setup-pi.sh                 <- PATH, PI config, extension symlinks
├── node-v22.15.0-linux-x64/    <- Node.js binary
├── llama-mtp/                  <- llama-server binary (MTP build)
├── Qwen3.6-27B-MTP-UD-Q5_K_XL.gguf  <- generation model (19 GB)
├── nomic-embed-text-v1.5.Q8_0.gguf   <- embedding model (140 MB)
└── pi-modular/                 <- V1 codebase (rsync target)
```

### Boot Sequence (5 SSH commands from VPS)

```bash
PORT=<check AutoDL console — changes every reboot>
HOST="root@connect.westc.seetacloud.com"
KEY="/root/.ssh/id_ed25519"

# 1. Start llama-servers (~15s)
ssh -i $KEY -p $PORT $HOST 'bash /root/autodl-tmp/start.sh'

# 2. Setup PI Agent (PATH, config, symlinks)
ssh -i $KEY -p $PORT $HOST 'bash /root/autodl-tmp/setup-pi.sh'

# 3. Sync latest code
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='_reference/' \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/pi-harness-stable/ \
  -e "ssh -i $KEY -p $PORT" \
  $HOST:/root/autodl-tmp/pi-harness-v2/

# 4. Fix tsconfig paths + build
ssh -i $KEY -p $PORT $HOST \
  'export PATH="/root/autodl-tmp/node-v22.15.0-linux-x64/bin:$PATH" && \
   cd /root/autodl-tmp/pi-harness-v2 && \
   for ext in extensions/pi-*/tsconfig.json; do \
     sed -i "s|/usr/lib/node_modules|/root/autodl-tmp/node-v22.15.0-linux-x64/lib/node_modules|g" "$ext"; \
   done && \
   npm run build'

# 5. Verify health
ssh -i $KEY -p $PORT $HOST \
  'curl -sf localhost:11434/health && echo " gen OK" && \
   curl -sf localhost:8081/health && echo " embed OK"'
```

### Running Tests

```bash
ssh -i $KEY -p $PORT $HOST
export PATH="/root/autodl-tmp/node-v22.15.0-linux-x64/bin:$PATH"
cd /root/autodl-tmp/pi-harness-v2
tmux
pi
# Then: /workflow run web-design-batch "prompt here"
```

**PI must start from the project directory** — it finds `.pi/workflows/` relative to cwd.

### Collecting Results

```bash
rsync -avz -e "ssh -i $KEY -p $PORT" \
  $HOST:/root/autodl-tmp/pi-harness-v2/.pi/workflow-artifacts/ \
  /root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/FRONTEND-DESIGN-DATASET-V2/artifacts/
```

---

## 10. Key Gotchas

| Gotcha | Detail |
|--------|--------|
| **Port changes every reboot** | Always check AutoDL console first |
| **No git on AutoDL** | `.git` excluded from rsync — file changes from tests don't persist |
| **tsconfig paths** | Must `sed` fix after every rsync (VPS paths differ from AutoDL paths) |
| **`yaml` module** | `setup-pi.sh` copies it to `pi-workflows/node_modules/yaml` — `npm install` may overwrite |
| **`--cache-reuse 0`** | Mandatory flag for llama-server — without it, KV cache prefix reuse crashes MTP's recurrent state on sequential `fresh_context` phases |
| **Context 131K ceiling** | Only 3.3 GB VRAM headroom on RTX 5090 |
| **PI version** | v0.73.1 on AutoDL (v0.77.0 available but held back) |
| **PI cwd matters** | Must `cd` to project dir before running `pi` — workflows are relative to cwd |
| **`pi -p` + slash commands** | Works — source confirms `/` prefix detection before LLM routing |

---

## 11. Prerequisites Summary

### Already on AutoDL Data Disk (no install needed)

- Node.js v22.15.0
- llama-server (MTP build)
- Both GGUF models (generation + embedding)
- start.sh + setup-pi.sh scripts
- PI Agent globally installed

### Need to Add for V2 Testing

- rsync the V2 harness (`pi-harness-stable`) to AutoDL as `/root/autodl-tmp/pi-harness-v2/`
- Create `web-design-batch.yaml` (gate-stripped copy of web-design.yaml)
- Adapt `setup-pi.sh` if extension paths differ between V1 and V2 (same structure, should work as-is)
- Create batch run script

### Server Requirements

| Component | Requirement |
|-----------|-------------|
| GPU | RTX 5090 (32 GB VRAM) or RTX PRO 6000 |
| CUDA | 12.8+ (driver 580+) |
| Data disk | 50 GB+ |
| Ports | 11434 (generation), 8081 (embedding) |

---

## 12. Source Files Referenced

| File | What it tells us |
|------|-----------------|
| `pi-harness-stable/extensions/pi-workflows/src/executor.ts` | Core execution engine — how nodes run, approval blocking, artifact checks |
| `pi-harness-stable/extensions/pi-workflows/src/schema.ts` | Node type definitions (prompt, bash, approval) |
| `pi-harness-stable/.pi/workflows/web-design.yaml` | Full 24-node web-design workflow (995 lines) |
| `PI-Agent-V1/_reference/pi-mono/.../core/agent-session.ts` | PI Agent source — slash command routing in `-p` mode (lines 941-956) |
| `PI-Agent-V1/AUTODL-SETUP.md` | Infrastructure reference (models.json, llama-server flags, embedding server) |
| `PI-Agent-V1/AUTODL-TEST-SETUP.md` | Operational runbook (boot sequence, rsync, test suite, result collection) |
