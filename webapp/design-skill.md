# Design Standard — Frontend Design Expert Webapp

Design reference for anyone working on this project. Every pattern here is implemented and live. When in doubt, match what exists — don't invent new patterns.

---

## Design Philosophy

This is a data tool, not a portfolio piece. Think Linear.app, Vercel dashboard, Railway.app.

**Principles:**
- Information density over whitespace
- Restraint over expression — every visual decision earns its place
- Subtle motion that communicates state changes, never decorative animation
- Dark-first — screenshots pop against dark backgrounds
- Consistency — same patterns everywhere, no one-off treatments

---

## Color System

All colors are CSS custom properties in `src/styles/globals.css`. Never hardcode hex in components.

### Backgrounds

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg-primary` | #09090b | #ffffff | Page background |
| `--bg-secondary` | #0f0f11 | #fafafa | Elevated panels, inputs |
| `--bg-card` | #141416 | #ffffff | Card surfaces |
| `--bg-elevated` | #1a1a1e | #f4f4f5 | Hover states, active items |

### Text

| Token | Dark | Light | Use |
|---|---|---|---|
| `--text-primary` | #fafafa | #09090b | Headings, body |
| `--text-secondary` | #a1a1aa | #71717a | Descriptions, secondary info |
| `--text-muted` | #52525b | #a1a1aa | Labels, metadata, disabled |

### Accents

| Color | Hex | Use |
|---|---|---|
| Orange | `var(--accent)` #f97316 | Primary CTA, active states, score highlights |
| Teal | #2dd4bf | Hero gradient endpoint, fine-tuned model highlights, qualifying question numbers |
| White | #ffffff | GPT-5.4 in hero title (the "teacher model" pop) |
| Green | `var(--score-high)` #22c55e | High scores, positive deltas |
| Amber | `var(--score-mid)` #f59e0b | Medium scores |
| Red | `var(--score-low)` #ef4444 | Low scores, base model labels |

### When to use each accent

- **Orange** — buttons, active nav, CTA links, score highlights, stat values. The primary brand color.
- **Teal** — only for fine-tuned model context: terminal panel header, qualifying question numbers, Browse Training Data link, hero gradient blend.
- **White pop** — reserved for GPT-5.4 in the hero title. Don't use white-as-accent elsewhere.
- **Green/amber/red** — scores only. Never as decorative color.

---

## Typography

Font: Inter (400, 500, 600, 700, 800) via Google Fonts.
Code: JetBrains Mono (400, 500, 700).

| Role | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| Page title | 32px | 800 | 1.2 | One per page, tight tracking |
| Section heading | 24px | 700 | 1.2 | Section headers |
| Card title | 16px | 600 | 1.3 | Card headings, step titles |
| Body | 14-15px | 400 | 1.5-1.6 | Descriptions, paragraphs |
| Small text | 13px | 400-500 | 1.4 | Card prompts, metadata |
| Label | 11px | 500-600 | 1 | Uppercase tracking labels (`section-label` class) |
| Mono data | 11-14px | 700 | 1 | Scores, IDs, measurements |
| Eyebrow | 11px | 600 | 1 | `letter-spacing: 0.1em`, uppercase, `--text-muted` |

### Label pattern

```css
.section-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 500;
}
```

---

## Motion Design Catalog

All motion uses CSS custom property timing defined in `:root`. No JS animation libraries.

### Timing Tokens

```css
:root {
  --duration-fast:   120ms;   /* micro-interactions */
  --duration-base:   200ms;   /* hover, toggle, nav */
  --duration-slow:   300ms;   /* theme transition */
  --duration-enter:  450ms;   /* page/section entrance */
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* deceleration */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot */
}
```

### Motion Reference Table

| Pattern | Duration | Easing | CSS Class | Use |
|---|---|---|---|---|
| Page entrance | 450ms | ease-out | `.page-enter` | Route changes, page load |
| Scroll reveal | 450ms | ease-out | `.reveal` | Sections entering viewport |
| Stagger reveal | 450ms + 50ms/item | ease-out | `.reveal-stagger` | Gallery grids, card lists |
| Card hover | 200ms | ease-out | `.card-hover-lift` | Gallery cards, featured cards |
| Button press | 80ms | ease | `.btn-press` | All interactive buttons |
| Nav underline | 200ms | ease-out | `.nav-link.active` | Active route indicator |
| Theme icon | 300ms | ease-out | `.theme-icon` | Dark/light toggle rotation |
| Expand/collapse | 300ms | ease | `.expand-content` | Accordion panels |
| Shimmer | 1.8s | ease-in-out | `.skeleton` | Loading placeholders |
| Color hover | 150ms | ease | Tailwind `transition-colors duration-150` | Text/bg color on hover |

---

### Page Entrance

Fade + slide up on every page mount.

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fadeSlideUp var(--duration-enter) var(--ease-out) both;
}
```

```tsx
// Usage in PageWrapper.tsx
<div className="page-enter px-6 py-8 mx-auto max-w-6xl">
  {children}
</div>
```

---

### Scroll Reveal

Sections fade in when entering viewport. Uses `useInView` hook (IntersectionObserver, fires once).

```css
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--duration-enter) var(--ease-out),
              transform var(--duration-enter) var(--ease-out);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```tsx
import { useInView } from '@/hooks/useInView'

const { ref, visible } = useInView()

<section ref={ref}>
  <div className={`reveal ${visible ? 'visible' : ''}`}>
    {/* section content */}
  </div>
</section>
```

---

### Stagger Reveal (Gallery Cards)

Cards cascade in with 50ms delay per item. Uses `--stagger-index` custom property.

```css
.reveal-stagger {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--duration-enter) var(--ease-out),
              transform var(--duration-enter) var(--ease-out);
  transition-delay: calc(var(--stagger-index, 0) * 50ms);
}
.reveal-stagger.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```tsx
const { ref: gridRef, visible: gridVisible } = useInView({ threshold: 0.05 })

<div key={page} ref={gridRef} className="grid grid-cols-3" style={{ gap: 16 }}>
  {items.map((item, i) => (
    <div
      key={item.id}
      className={`reveal-stagger ${gridVisible ? 'visible' : ''}`}
      style={{ '--stagger-index': i } as React.CSSProperties}
    >
      <ComponentCard component={item} />
    </div>
  ))}
</div>
```

Key the container on `page` so the IntersectionObserver remounts on page change and stagger replays.

---

### Card Hover Lift

Subtle elevation on hover — translateY + shadow increase.

```css
.card-hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out),
              border-color var(--duration-base) var(--ease-out);
}
.card-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

```tsx
<Link className="block bg-bg-card card-hover-lift"
      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
```

---

### Button Press Feedback

Scale down briefly on click for tactile feel.

```css
.btn-press {
  transition: transform 80ms ease, background-color 150ms ease, color 150ms ease;
}
.btn-press:active {
  transform: scale(0.97);
}
```

```tsx
<button className="btn-press bg-accent text-white hover:bg-accent-hover">
  Download
</button>
```

---

### Navbar Active Underline

CSS pseudo-element slides under the active nav link.

```css
.nav-link { position: relative; }
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  transition: width var(--duration-base) var(--ease-out),
              left var(--duration-base) var(--ease-out);
}
.nav-link.active::after {
  width: 100%;
  left: 0;
}
```

```tsx
<Link className={`nav-link ${active ? 'active' : ''}`}>
  {label}
</Link>
```

---

### Expand / Collapse

Smooth height animation using CSS grid trick.

```css
.expand-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.expand-content.open {
  grid-template-rows: 1fr;
}
.expand-content > div {
  overflow: hidden;
}
```

```tsx
<div className={`expand-content ${isOpen ? 'open' : ''}`}>
  <div>
    {/* collapsible content */}
  </div>
</div>
```

---

### Theme Toggle Rotation

Icon rotates 180 degrees when switching themes.

```css
.theme-icon {
  transition: transform var(--duration-slow) var(--ease-out);
}
.theme-icon.rotate {
  transform: rotate(180deg);
}
```

```tsx
<svg className={`theme-icon ${theme === 'dark' ? 'rotate' : ''}`}>
```

---

### Loading Shimmer

Gradient sweep replaces content during loading.

```css
.skeleton {
  background: linear-gradient(110deg, var(--bg-secondary) 0%, var(--bg-elevated) 45%, var(--bg-secondary) 55%);
  background-size: 250% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

```tsx
<Shimmer className="h-16" />  // renders <div class="skeleton h-16" />
```

---

### Gradient Divider

Horizontal accent line that fades out.

```css
.divider-gradient {
  height: 1px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--border) 50%, transparent 100%);
}
```

---

## Interaction Patterns

### Hover States

All hover transitions use `transition-colors duration-150` (Tailwind) or the timing vars.

- **Text links:** `text-text-secondary` -> `text-text-primary` on hover
- **Bordered buttons:** border color shifts to `--text-muted` on hover
- **Cards:** `.card-hover-lift` — translateY(-2px) + shadow elevation
- **Nav links:** background shifts to `--bg-secondary` on hover (via JS onMouseEnter/Leave for non-active items)

### Focus States

Use the browser default focus ring for accessibility. Don't suppress it.

### Active / Selected States

- **Nav link:** `nav-link active` — orange underline via CSS pseudo-element
- **Filter items:** orange left border + `--bg-secondary` background
- **Tab buttons:** `--accent` background + white text (for selected tab)
- **Pagination:** `--accent` background + white text for current page number

### Cursor

- All clickable elements: `cursor-pointer`
- Disabled: `cursor-default` + `opacity-30`
- No custom cursor images or effects

---

## Component Patterns

### Cards

- 1px `var(--border)` border
- `var(--radius)` (8px) corners
- `var(--shadow-sm)` shadow
- `.card-hover-lift` on interactive cards
- Internal padding: 24px for content cards, 12-14px for gallery cards

### Badges

Small pill shape. Variants:
- **default:** muted bg/text
- **score-high/mid/low:** colored with 10% opacity background + 20% opacity border
- **accent:** orange variant
- **outline:** transparent with border

Size: `px-2 py-0.5 text-xs font-medium font-mono`

### Buttons

Three variants via `Button.tsx`:
- **primary:** `bg-accent text-white hover:bg-accent-hover`
- **secondary:** `border border-border bg-transparent text-text-primary hover:bg-bg-elevated`
- **ghost:** `bg-transparent text-text-secondary hover:text-text-primary`

All buttons have `.btn-press` for scale(0.97) active feedback.

### Stat Cards

Pattern used on Validation and Conversations pages:
- Bordered card (`rounded-lg border border-border bg-bg-card`)
- Label (11px uppercase, `--text-secondary`)
- Sublabel (11px, `--text-secondary`)
- Large mono value (32px, weight 700, color-coded)

---

## Anti-patterns

These have been explicitly rejected through design iteration. Do not reintroduce them.

| Don't | Why |
|---|---|
| Glassmorphism / frosted glass | Looks portfolio-ish, not tool-like |
| Noise texture overlays | Adds visual clutter, no information value |
| Gradient mesh backgrounds | Too dramatic for a data tool |
| Glow effects on cards/buttons | Heavy, not Linear.app |
| Instrument Serif or display fonts | Rejected 3 times — Inter only |
| Bento grid layouts | Not data-dense enough |
| Multi-second entrance animations | Motion should be fast (120-450ms), not cinematic |
| Framer Motion or GSAP | CSS-only motion, no animation deps |
| Color outside the token system | Always use CSS variables |
| Emojis in UI | Use text labels or Lucide icons |
| Large CTA buttons | Small, restrained buttons only |
| Heavy card shadows | Use `var(--shadow-sm)`, never deep shadows |

---

## Responsive Breakpoints

Defined in `globals.css`:

- **768px:** Grids collapse to 1-2 columns, sidebar moves below content, terminal hidden, gallery single-col, validation nav hides prompt/scores
- **390px:** Further reduction — stats single-col, smaller nav links, hero title clamps down

Mobile-first is not the priority — this is a desktop data tool. But nothing should break on mobile.

---

## useInView Hook Reference

```tsx
import { useInView } from '@/hooks/useInView'

// Basic usage — fires once when element enters viewport
const { ref, visible } = useInView()

// With options
const { ref, visible } = useInView({ threshold: 0.05 })
```

The hook uses IntersectionObserver with `unobserve` on first intersection — elements animate in once and stay visible. They do not re-animate on scroll back up.
