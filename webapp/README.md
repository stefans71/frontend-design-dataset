# Frontend Design Dataset Explorer

Interactive dataset viewer for the Frontend Design Expert fine-tuning project.

## Setup

```bash
# Install dependencies
bun install

# Copy data from dataset output
bun run copy-data

# Optimize images (requires webp tools)
bun run optimize-images

# Start dev server (frontend + API)
bun run dev:full
```

## Production (Coolify)

Build command: `bun run build`
Start command: `bun run server`
Port: 3001

## Stack
- Bun + TypeScript
- Vite + React
- Tailwind CSS
- SQLite via bun:sqlite
