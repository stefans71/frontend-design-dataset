# frontend-design-dataset

Generates synthetic frontend design training data for fine-tuning a vision-language model. A local LLM produces HTML components, which are rendered to screenshots, critiqued by an external model, and packaged into JSONL training records.

## Pipeline Stages

1. **Generate** (`bun run generate`) — Generate HTML/CSS components via llama-server
2. **Render** (`bun run render`) — Render HTML to PNG screenshots via Playwright
3. **Critique** (`bun run critique`) — Send screenshots to a critique model API for design feedback
4. **Package** (`bun run package`) — Assemble JSONL training records from all artifacts

## AutoDL Setup

```bash
source autodl-run.sh
bun install --registry https://registry.npmmirror.com
```

## Usage

### Test run (3 components)

```bash
bun run test:pipeline
```

### Full run

```bash
bun run pipeline
```

### Rsync to AutoDL

```bash
bash scripts/rsync-to-autodl.sh <PORT>
```

## Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```
