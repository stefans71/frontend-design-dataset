# Implementation Plan

## prompts/components.ts

Export `COMPONENT_PROMPTS: string[]` with 20 diverse, specific prompts. Each prompt is self-contained and specifies framework, colors, and realistic content.

### Required mix (20 prompts):

1. Primary CTA button with hover/disabled states — dark theme, blue accent
2. Email signup form with validation states — light theme, green accent
3. Pricing card (Pro tier) with feature list and CTA — dark theme, purple gradient
4. Responsive navbar with logo, links, and mobile hamburger — light theme
5. User profile card with avatar, stats, and action buttons — dark theme, slate/cyan
6. Toast notification stack (success, error, warning) — light theme
7. Stats dashboard card with big numbers and sparkline placeholders — dark theme, emerald accent
8. Login form with social auth buttons — light theme, minimal
9. E-commerce product card with image placeholder, price, and add-to-cart — light theme
10. Mobile bottom navigation bar with 5 icons and active state — dark theme
11. Settings toggle list with descriptions — light theme
12. File upload dropzone with progress indicator — dark theme, indigo accent
13. Comment thread with nested replies and timestamps — light theme
14. Pricing table (3 tiers) with highlighted recommended plan — light theme, blue
15. Search bar with filters dropdown and recent searches — dark theme
16. Testimonial card with star rating and avatar — light theme, warm tones
17. Mobile app onboarding card with illustration placeholder and pagination dots — dark theme
18. Data table with sortable headers, pagination, and row selection — light theme
19. Cookie consent banner with accept/reject/customize — dark theme, amber accent
20. Notification bell dropdown with unread count and notification list — light theme

At least prompts 1, 3, 5, 10, 12, 15, 17, 19 are dark theme (8 dark variants).

Each prompt must specify:
- Exact component description
- Color palette (specific Tailwind colors)
- Light or dark theme
- Realistic content (no lorem ipsum, no placeholder text)
- "Use Tailwind CSS via CDN. Center the component with padding. Self-contained HTML document."

---

## Stage 1 — generate.ts

### Function: `generateComponent(prompt: string, outputDir: string): Promise<void>`

1. Load dotenv at module top
2. Check if `{outputDir}/component.html` exists — skip if so
3. POST to `${LLAMA_SERVER_URL}/v1/chat/completions`:
   ```json
   {
     "model": "${LLAMA_MODEL}",
     "messages": [
       {
         "role": "system",
         "content": "You are a frontend developer. Output a complete, self-contained HTML document. Use Tailwind CSS via CDN (<script src=\"https://cdn.tailwindcss.com\"></script>). Use realistic content — no lorem ipsum, no placeholder text. Center the component on the page with padding. Do not use external images. Output only the HTML, no explanation."
       },
       {
         "role": "user",
         "content": "<the component prompt>"
       }
     ],
     "chat_template_kwargs": {
       "enable_thinking": false
     },
     "temperature": 0.7,
     "max_tokens": 4096
   }
   ```
4. Extract `choices[0].message.content`
5. Strip markdown fences: remove leading ````html\n` and trailing ````\n` if present
6. Save `{outputDir}/component.html`
7. Save `{outputDir}/metadata.json`:
   ```json
   {
     "prompt": "<the prompt>",
     "model": "<LLAMA_MODEL>",
     "timestamp": "<ISO 8601>",
     "stage": "generate"
   }
   ```

### Function: `generateAll(): Promise<void>`

1. Load `COMPONENT_PROMPTS` from `prompts/components.ts`
2. Read `TEST_MODE` and `TEST_COUNT` from env
3. If `TEST_MODE === "true"`, slice prompts to first `TEST_COUNT` (default 3)
4. For each prompt at index `i`:
   - `outputDir = ${OUTPUT_DIR}/component-${String(i).padStart(3, '0')}`
   - `mkdir -p` the output dir
   - Call `generateComponent(prompt, outputDir)`
   - Log progress: `[generate] Component ${i+1}/${total} done`
5. Log summary: `[generate] ${total} components generated`

### Entry point

If `import.meta.main`, call `generateAll()`.

---

## Stage 2 — render.ts

### Function: `renderComponent(htmlPath: string, outputDir: string): Promise<void>`

1. Check if both `screenshot-desktop.png` and `screenshot-mobile.png` exist in `outputDir` — skip if so
2. Read HTML from `htmlPath`
3. **Desktop screenshot (1280x900):**
   - Launch Chromium: `chromium.launch()`
   - Create page with viewport `{ width: 1280, height: 900 }`
   - `page.setContent(html, { waitUntil: 'networkidle' })`
   - Wait additional 1500ms (Tailwind CDN load buffer)
   - `page.screenshot({ path: outputDir/screenshot-desktop.png, fullPage: true })`
   - Close browser
4. **Mobile screenshot (390x844):**
   - Launch Chromium
   - Create page with viewport `{ width: 390, height: 844 }`
   - Same setContent + wait pattern
   - `page.screenshot({ path: outputDir/screenshot-mobile.png, fullPage: true })`
   - Close browser

### Function: `renderAll(): Promise<void>`

1. Glob `${OUTPUT_DIR}/component-*/component.html`
2. Sort by directory name
3. For each HTML file:
   - Call `renderComponent(htmlPath, dirname(htmlPath))`
   - Log progress: `[render] Component ${i+1}/${total} rendered`
4. Log summary

### Entry point

If `import.meta.main`, call `renderAll()`.

---

## Stage 3 — critique.ts

### Critique prompt (hardcoded constant)

```
You are a senior product designer reviewing a UI component screenshot.

Provide a structured design critique covering:
1. Visual hierarchy — is the most important element immediately obvious?
2. Spacing & layout — consistent spacing system? Specific values that need changing?
3. Typography — weight contrast, size scale, readability
4. Color — contrast ratios, palette cohesion, WCAG AA accessibility
5. Component completeness — all states shown? (hover, disabled, loading, error, empty)
6. Production readiness — what would a senior designer change before shipping?

Score 1-10. Be specific — name exact measurements, not general advice.
```

### Function: `critiqueComponent(screenshotPath: string, outputDir: string): Promise<void>`

1. Check if `{outputDir}/critique.md` exists — skip if so
2. Build command:
   ```
   codex exec -m gpt-5.4 --dangerously-bypass-approvals-and-sandbox --ephemeral -i {screenshotPath} "{CRITIQUE_PROMPT}"
   ```
3. Run via `Bun.spawn()`:
   - Capture stdout as text
   - Set timeout: 120_000ms
   - On timeout, kill process and log warning, skip component
4. Parse stdout:
   - Split by newlines
   - Strip trailing lines that match token count pattern (lines containing "tokens" or starting with `---`)
   - Join remaining lines as the critique text
5. Save `{outputDir}/critique.md`

### Function: `critiqueAll(): Promise<void>`

1. Glob `${OUTPUT_DIR}/component-*/screenshot-desktop.png`
2. Sort by directory name
3. For each screenshot (**sequentially**, no parallelism):
   - Call `critiqueComponent(screenshotPath, dirname(screenshotPath))`
   - Log progress: `[critique] Component ${i+1}/${total} critiqued`
4. Log summary

### Entry point

If `import.meta.main`, call `critiqueAll()`.

---

## Output Directory Structure (per component)

```
output/component-000/
├── component.html          (Stage 1)
├── metadata.json           (Stage 1)
├── screenshot-desktop.png  (Stage 2)
├── screenshot-mobile.png   (Stage 2)
└── critique.md             (Stage 3)
```

---

## Implementation Order

1. `prompts/components.ts` — write all 20 prompts
2. `src/generate.ts` — implement and syntax check
3. `src/render.ts` — implement and syntax check
4. `src/critique.ts` — implement and syntax check
5. Test with `TEST_MODE=true bun run generate`, then `render`, then `critique`
6. `src/pipeline.ts` and `src/package-dataset.ts` — later, after stages 1-3 are validated
