# Frontend Design Dataset Explorer

Dataset explorer for fine-tuned Qwen3-VL design models.
Live at https://qwen.data-analytics.space

## Tech Stack

- **Runtime:** Bun
- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (PostCSS plugin) + CSS custom properties in `src/styles/globals.css`
- **Backend:** Bun native HTTP server (`server/index.ts`)
- **Database:** SQLite via `bun:sqlite` (read-only dataset, `data/dataset.sqlite`)
- **Icons:** lucide-react
- **Routing:** React Router v7
- **Fonts:** Inter (body), JetBrains Mono (code/data) via Google Fonts CDN

## Commands

```
bun install              # install deps
bun run dev              # Vite dev server (port 5173)
bun run server           # API server (port 3001)
bun run dev:full         # both concurrently
bun run build            # tsc + vite build -> dist/
bun run typecheck        # TypeScript check (no emit)
bun run lint             # ESLint
bun run copy-data        # copy dataset from output dir
bun run optimize-images  # convert screenshots to webp
```

## Architecture

```
webapp/
├── server/index.ts        # Bun HTTP server: API + static file serving + inferCategory/inferTheme/inferDomain
├── src/
│   ├── App.tsx            # Router + theme context
│   ├── main.tsx           # React entry
│   ├── pages/             # Home, Gallery, ComponentPage, Validation, Conversations
│   ├── components/
│   │   ├── layout/        # Navbar, Sidebar
│   │   ├── ui/            # Button, Badge, Card, Toggle, Shimmer, PageWrapper, SectionHeading, GradientDivider
│   │   └── *.tsx          # ComponentCard, ComponentDetail, CritiquePanel, FilterSidebar, GridControl, ThemeToggle, BeforeAfter
│   ├── hooks/             # useTheme, useFontSize, useComponents, useInView
│   ├── lib/               # api.ts (fetch wrappers), types.ts
│   └── styles/globals.css # CSS variables, @theme tokens, keyframes, animations, responsive breakpoints (lines 143–201)
├── data/                  # gitignored, bind-mounted in Coolify
│   ├── dataset.sqlite     # components + conversations + eval_scores
│   ├── fine-tuned-scores.jsonl   # validation: base vs fine-tuned head-to-head scores
│   └── self-improve-scores.jsonl # self-critique loop results
├── public/                # screenshots/, hero-comparison.png, favicon.svg
├── design-skill.md        # comprehensive design standard with code snippets
└── dist/                  # build output (served by Bun in production)
```

## API Routes (server/index.ts)

- `GET /api/stats` — aggregate counts and avg score
- `GET /api/components?category=&theme=&sort=&page=&limit=&minScore=&maxScore=&hasPng=` — paginated component list with scores
- `GET /api/components/:id` — single component with HTML content, critique, and improved HTML
- `GET /api/conversations?type=&domain=&sort=&page=` — paginated conversation traces with domain counts
- `GET /api/validation` — fine-tuned vs base model comparison scores (from JSONL)
- `/screenshots/*` — served from `public/screenshots/`
- `/*` — SPA fallback to `dist/index.html`

Category, theme, and domain are inferred from prompt/message text at query time (`inferCategory`, `inferTheme`, `inferDomain` in server/index.ts), not stored in DB.

## Deploy

Deployed via Coolify (auto-deploy on push to main):
- **Build:** `bun run build`
- **Start:** `bun run server`
- **Port:** 3001 (PORT env var)
- **Domain:** qwen.data-analytics.space
- **Database:** bind-mounted `data/dataset.sqlite`

Verify deploy: note the JS hash before push (`curl -s https://qwen.data-analytics.space/ | grep -oP 'index-[A-Za-z0-9]+\.js'`), push, poll until hash changes, then verify HTTP 200.

## Design System

### Aesthetic Target

Linear.app / Vercel dashboard — restrained, professional, data-dense. NOT a portfolio piece.

### Typography

- **Body:** Inter, 14-15px, weight 400, line-height 1.5
- **Headings:** Inter, weight 600, tight tracking, 20-24px max for section headers
- **Mono:** JetBrains Mono for code, IDs, and numeric data only
- No display fonts, no serif headings, no dramatic type

### Colors (always use CSS variables)

- **Backgrounds:** `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-card)`, `var(--bg-elevated)`
- **Text:** `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
- **Orange accent:** `var(--accent)` = #f97316 — sparingly, active states and CTAs only
- **Teal:** #2dd4bf — hero gradient endpoint, fine-tuned terminal panel, qualifying question numbers
- **Borders:** `var(--border)`, `var(--border-subtle)` — 1px, never heavy
- **Scores:** `var(--score-high)` green, `var(--score-mid)` amber, `var(--score-low)` red

### Motion

All animations use CSS custom property timing. No JS animation libraries.

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 120ms | Micro-interactions |
| `--duration-base` | 200ms | Hover, toggle, nav |
| `--duration-slow` | 300ms | Theme transition |
| `--duration-enter` | 450ms | Page/section entrance |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Deceleration curve |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Overshoot for toggles |

CSS classes: `.page-enter`, `.reveal`, `.reveal-stagger`, `.card-hover-lift`, `.btn-press`, `.nav-link.active`, `.theme-icon`, `.expand-content`, `.skeleton`

### Layout

- Dense information layout — no excessive whitespace
- Subtle 1px borders, not heavy cards
- 8px grid spacing (`--radius: 8px`)
- `.page-container`: max-width 1280px, centered, 24px padding

### Responsive

All responsive code lives in `src/styles/globals.css` lines 143–201. Three breakpoints:

| Breakpoint | Target | File location |
|---|---|---|
| `max-width: 768px` | Tablets + phones | `globals.css:144–190` |
| `max-width: 480px` | Small phones | `globals.css:192–195` |
| `max-width: 390px` | iPhone SE (smallest supported) | `globals.css:197–201` |

`html` has `overflow-x: hidden` to prevent horizontal scrollbar on all viewports.

**768px** collapses all two-column layouts to single-column:

| Class | Effect |
|---|---|
| `.page-container` | padding 24px → 16px |
| `.navbar-brand-subtitle` | hidden |
| `.navbar-brand-group` | gap reduced to 12px, `min-width: 0` |
| `.navbar-links` | scrollable overflow, hidden scrollbar, `nowrap` links |
| `.navbar-links a` | smaller padding + font (13px) |
| `.navbar-controls` | `flex-shrink: 0` |
| `.hero-grid` | single column, `.hero-terminal` hidden |
| `.hero-title` | `clamp(28px, 8vw, 42px)` |
| `.hero-buttons` | stack vertical, full-width |
| `.stats-row` | 2-column grid, no right borders |
| `.how-it-works-grid`, `.download-grid`, `.featured-grid` | single column |
| `.gallery-layout` | column direction, sidebar goes full-width on top |
| `.gallery-sidebar` | full width, bottom border instead of side |
| `.gallery-grid` | single column |
| `.grid-control` | hidden |
| `.component-detail-layout` | single column |
| `.validation-stats-grid` | 2-column |
| `.validation-expanded-grid` | single column |
| `.validation-nav-prompt`, `.validation-nav-scores` | hidden |
| `.validation-table-wrap` | horizontal scroll for table content |
| `h1`, `h2` | fluid clamp sizing |

**480px** hides font-size controls (A-/A+) in navbar.

**390px** (iPhone SE) further reduces:
- Nav links: 11px font, tighter padding
- Hero title: fixed 26px
- Stats row: single column

To test: Chrome DevTools → iPhone SE (375×667). All pages should be usable with no horizontal scroll.

### Component Conventions

- **Buttons:** small, restrained — `Button.tsx` with `variant={primary|secondary|ghost}`
- **Badges:** small pill, muted — `Badge.tsx` with variant system
- **Cards:** 1px border, `var(--shadow-sm)`, `var(--radius)` corners, `.card-hover-lift` on hover
- **Expand/collapse:** `.expand-content` / `.expand-content.open` (grid-template-rows 0fr to 1fr)
- User prefers `style={{}}` for exact pixel values over Tailwind approximations when precision matters

## What to AVOID

- Glassmorphism, noise overlays, gradient meshes, glow effects
- Display fonts or dramatic type
- Heavy shadows, bento grid layouts
- Dramatic animations — motion must be subtle and professional
- Adding npm dependencies without explicit approval
- Hardcoding hex colors (use CSS variables)
- Changing the hero gradient (orange to teal on "Qwen3-VL-8B")
- Changing hero title color hierarchy: gradient model name, darker grey "Fine-Tuned on", white "GPT-5.4 Critiques"

## Reference

Linear.app, Vercel dashboard, Railway.app — serious B2B tools.
NOT: Dribbble shots, portfolio pieces, landing pages.
