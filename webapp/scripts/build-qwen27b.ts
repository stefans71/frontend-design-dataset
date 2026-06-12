import { Database } from 'bun:sqlite'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(import.meta.dir, '../data/dataset.sqlite')
const db = new Database(DB_PATH)

const COMPONENT_ROOT = '/root/tinkering/Local-LLMs/Local-LLM-Agent/frontend-design-dataset/output/assets/components'
const Q8_ROOT = '/root/tinkering/Local-LLMs/Local-LLM-Agent/pi-harness-stable/qwen-27b-dense-re-test-W-v2-pi-harness/Qwen3.6--27B-MTP-UD_Q8_K_XL'

function inferCategory(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('mobile') || p.includes('bottom sheet') || p.includes('bottom nav') ||
      p.includes('tab bar') || p.includes('phone screen') || p.includes('ios app') ||
      p.includes('android') || p.includes('app screen') || p.includes('swipe')) return 'mobile'
  if (p.includes('sidebar') || p.includes('navbar') || p.includes('nav bar') ||
      p.includes('navigation') || p.includes('breadcrumb') || p.includes('mega menu') ||
      p.includes('top menu') || p.includes('side menu') || p.includes('dropdown menu')) return 'navbar'
  if (p.includes('dashboard') || p.includes('analytics') || p.includes('invoice') ||
      p.includes('data table') || p.includes('chart') || p.includes('graph') ||
      p.includes('kpi') || p.includes('leaderboard') || p.includes('activity feed') ||
      p.includes('metrics') || p.includes('stats card')) return 'data_display'
  if (p.includes('hero section') || p.includes('cta section') || p.includes('call-to-action') ||
      p.includes('testimonial') || p.includes('landing page') || p.includes('marketing page') ||
      p.includes('feature section') || p.includes('pricing page') || p.includes('announcement') ||
      p.includes('newsletter') || p.includes('email signup') || p.includes('waitlist') ||
      p.includes('cta') || p.includes('start for free') || p.includes('get started') ||
      p.includes('hero') || p.includes('above the fold')) return 'marketing'
  if (p.includes('modal') || p.includes('dialog') || p.includes('toolbar') ||
      p.includes('pagination') || p.includes('command palette') ||
      p.includes('button states') || p.includes('floating action') ||
      p.includes('toast') || p.includes('notification') || p.includes('badge') ||
      p.includes('tooltip') || p.includes('popover')) return 'misc'
  if (p.includes('login form') || p.includes('login page') ||
      p.includes('sign up') || p.includes('sign-up') || p.includes('signup') ||
      p.includes('sign in') || p.includes('sign-in') || p.includes('signin') ||
      p.includes('registration') || p.includes('checkout') || p.includes('payment form') ||
      p.includes('contact form') || p.includes('search bar') || p.includes('search input') ||
      p.includes('onboarding') || p.includes('2fa') || p.includes('authentication') ||
      p.includes('upload') || p.includes('input field') || p.includes('form field') ||
      p.includes('wizard')) return 'form'
  if (p.includes('pricing card') || p.includes('product card') || p.includes('profile card') ||
      p.includes('user card') || p.includes('feature card') || p.includes('stat card') ||
      p.includes('card component') || p.includes('pricing tier') || p.includes('plan card')) return 'card'
  if (p.includes('table') || p.includes('list view') || p.includes('data grid')) return 'data_display'
  if (p.includes('card') || p.includes('product') || p.includes('profile') || p.includes('pricing')) return 'card'
  if (p.includes('form') || p.includes('input') || p.includes('filter')) return 'form'
  if (p.includes('menu') || p.includes('navigation')) return 'navbar'
  return 'misc'
}

function inferTheme(prompt: string): 'dark' | 'light' {
  return prompt.toLowerCase().includes('dark') ? 'dark' : 'light'
}

// Load Q8 scores from JSONL files
function loadScores(filename: string): Map<string, { score: number; critique: string }> {
  const path = join(Q8_ROOT, 'scores', filename)
  const map = new Map<string, { score: number; critique: string }>()
  if (!existsSync(path)) {
    console.warn(`Score file not found: ${path}`)
    return map
  }
  const lines = readFileSync(path, 'utf-8').trim().split('\n')
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      map.set(obj.id, { score: obj.score, critique: obj.critique || '' })
    } catch (e) {
      console.warn(`Failed to parse score line: ${line}`)
    }
  }
  return map
}

console.log('Loading Q8 scores...')
const vaScores = loadScores('V-A-codex-gpt54-scores.jsonl')
const vbScores = loadScores('V-B-codex-gpt54-scores.jsonl')
const vcScores = loadScores('V-C-codex-gpt54-scores.jsonl')
console.log(`  V-A: ${vaScores.size}, V-B: ${vbScores.size}, V-C: ${vcScores.size}`)

// Create table
db.exec('DROP TABLE IF EXISTS components_qwen27b')
db.exec(`
  CREATE TABLE components_qwen27b (
    id TEXT PRIMARY KEY,
    prompt TEXT,
    temperature REAL,
    run TEXT,
    category TEXT,
    theme TEXT,
    q5_html TEXT,
    q8_va_html TEXT,
    q8_vb_html TEXT,
    q8_vc_html TEXT,
    q5_score REAL,
    q8_va_score REAL,
    q8_vb_score REAL,
    q8_vc_score REAL,
    q8_va_critique TEXT,
    q8_vb_critique TEXT,
    q8_vc_critique TEXT
  )
`)

const insert = db.prepare(`
  INSERT INTO components_qwen27b (
    id, prompt, temperature, run, category, theme,
    q5_html, q8_va_html, q8_vb_html, q8_vc_html,
    q5_score, q8_va_score, q8_vb_score, q8_vc_score,
    q8_va_critique, q8_vb_critique, q8_vc_critique
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

let inserted = 0
let skipped = 0

for (let i = 0; i < 100; i++) {
  const num = String(i).padStart(3, '0')
  const id = `component-${num}-run0`

  // Get prompt from components table
  const row = db.query('SELECT prompt, temperature FROM components WHERE id = ?').get(id) as { prompt: string; temperature: number } | null
  if (!row) {
    console.warn(`Component ${id} not found in components table, skipping`)
    skipped++
    continue
  }

  // Q5 HTML
  const q5Path = join(COMPONENT_ROOT, id, 'component.html')
  const q5Html = existsSync(q5Path) ? readFileSync(q5Path, 'utf-8') : null

  // Q8 HTML files
  const vaPath = join(Q8_ROOT, 'condition-V-A-Raw', id, 'harness-output.html')
  const vbPath = join(Q8_ROOT, 'condition-V-B-T085', id, 'harness-output.html')
  const vcPath = join(Q8_ROOT, 'condition-V-C-selfcheck', id, 'harness-output.html')

  const vaHtml = existsSync(vaPath) ? readFileSync(vaPath, 'utf-8') : null
  const vbHtml = existsSync(vbPath) ? readFileSync(vbPath, 'utf-8') : null
  const vcHtml = existsSync(vcPath) ? readFileSync(vcPath, 'utf-8') : null

  // Q5 score from eval_scores
  const evalRow = db.query('SELECT total FROM eval_scores WHERE component_id = ?').get(id) as { total: number } | null
  const q5Score = evalRow?.total ?? null

  // Q8 scores from JSONL
  const vaData = vaScores.get(id)
  const vbData = vbScores.get(id)
  const vcData = vcScores.get(id)

  const category = inferCategory(row.prompt)
  const theme = inferTheme(row.prompt)

  insert.run(
    id, row.prompt, row.temperature, 'run0', category, theme,
    q5Html, vaHtml, vbHtml, vcHtml,
    q5Score, vaData?.score ?? null, vbData?.score ?? null, vcData?.score ?? null,
    vaData?.critique ?? null, vbData?.critique ?? null, vcData?.critique ?? null
  )
  inserted++
}

console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)

// Verify
const count = (db.query('SELECT COUNT(*) as n FROM components_qwen27b').get() as { n: number }).n
const withQ5 = (db.query('SELECT COUNT(*) as n FROM components_qwen27b WHERE q5_html IS NOT NULL').get() as { n: number }).n
const withVA = (db.query('SELECT COUNT(*) as n FROM components_qwen27b WHERE q8_va_html IS NOT NULL').get() as { n: number }).n
const withVB = (db.query('SELECT COUNT(*) as n FROM components_qwen27b WHERE q8_vb_html IS NOT NULL').get() as { n: number }).n
const withVC = (db.query('SELECT COUNT(*) as n FROM components_qwen27b WHERE q8_vc_html IS NOT NULL').get() as { n: number }).n

console.log(`\nVerification:`)
console.log(`  Total rows: ${count}`)
console.log(`  With Q5 HTML: ${withQ5}`)
console.log(`  With V-A HTML: ${withVA}`)
console.log(`  With V-B HTML: ${withVB}`)
console.log(`  With V-C HTML: ${withVC}`)

db.close()
