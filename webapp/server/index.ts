import { Database } from 'bun:sqlite'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(import.meta.dir, '../data/dataset.sqlite')
const db = new Database(DB_PATH)

function inferCategory(prompt: string): string {
  const p = prompt.toLowerCase()

  // Mobile first
  if (p.includes('mobile') || p.includes('bottom sheet') || p.includes('bottom nav') ||
      p.includes('tab bar') || p.includes('phone screen') || p.includes('ios app') ||
      p.includes('android') || p.includes('app screen') || p.includes('swipe')) return 'mobile'

  // Navigation
  if (p.includes('sidebar') || p.includes('navbar') || p.includes('nav bar') ||
      p.includes('navigation') || p.includes('breadcrumb') || p.includes('mega menu') ||
      p.includes('top menu') || p.includes('side menu') || p.includes('dropdown menu')) return 'navbar'

  // Data display
  if (p.includes('dashboard') || p.includes('analytics') || p.includes('invoice') ||
      p.includes('data table') || p.includes('chart') || p.includes('graph') ||
      p.includes('kpi') || p.includes('leaderboard') || p.includes('activity feed') ||
      p.includes('metrics') || p.includes('stats card')) return 'data_display'

  // Marketing
  if (p.includes('hero section') || p.includes('cta section') || p.includes('call-to-action') ||
      p.includes('testimonial') || p.includes('landing page') || p.includes('marketing page') ||
      p.includes('feature section') || p.includes('pricing page') || p.includes('announcement') ||
      p.includes('newsletter') || p.includes('email signup') || p.includes('waitlist') ||
      p.includes('cta') || p.includes('start for free') || p.includes('get started') ||
      p.includes('hero') || p.includes('above the fold')) return 'marketing'

  // Misc UI components — not forms
  if (p.includes('modal') || p.includes('dialog') || p.includes('toolbar') ||
      p.includes('pagination') || p.includes('command palette') ||
      p.includes('button states') || p.includes('floating action') ||
      p.includes('toast') || p.includes('notification') || p.includes('badge') ||
      p.includes('tooltip') || p.includes('popover')) return 'misc'

  // Forms — careful with 'sign'
  if (p.includes('login form') || p.includes('login page') ||
      p.includes('sign up') || p.includes('sign-up') || p.includes('signup') ||
      p.includes('sign in') || p.includes('sign-in') || p.includes('signin') ||
      p.includes('registration') || p.includes('checkout') || p.includes('payment form') ||
      p.includes('contact form') || p.includes('search bar') || p.includes('search input') ||
      p.includes('onboarding') || p.includes('2fa') || p.includes('authentication') ||
      p.includes('upload') || p.includes('input field') || p.includes('form field') ||
      p.includes('wizard')) return 'form'

  // Cards
  if (p.includes('pricing card') || p.includes('product card') || p.includes('profile card') ||
      p.includes('user card') || p.includes('feature card') || p.includes('stat card') ||
      p.includes('card component') || p.includes('pricing tier') || p.includes('plan card')) return 'card'

  // Looser catches — order matters
  if (p.includes('table') || p.includes('list view') || p.includes('data grid')) return 'data_display'
  if (p.includes('card') || p.includes('product') || p.includes('profile') || p.includes('pricing')) return 'card'
  if (p.includes('form') || p.includes('input') || p.includes('filter')) return 'form'
  if (p.includes('menu') || p.includes('navigation')) return 'navbar'

  return 'misc'
}

function inferTheme(prompt: string): 'dark' | 'light' {
  return prompt.toLowerCase().includes('dark') ? 'dark' : 'light'
}

const server = Bun.serve({
  port: Number(process.env.PORT || 3001),
  fetch(req) {
    const url = new URL(req.url)
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }

    if (url.pathname === '/api/stats') {
      const total = (db.query('SELECT COUNT(*) as n FROM components').get() as Record<string, number>).n
      const convs = (db.query('SELECT COUNT(*) as n FROM conversations').get() as Record<string, number>).n
      const avg = (db.query('SELECT AVG(total) as avg FROM eval_scores').get() as Record<string, number>).avg
      return Response.json({ total_components: total, total_conversations: convs, avg_score: avg }, { headers })
    }

    if (url.pathname === '/api/components') {
      const category = url.searchParams.get('category')
      const theme = url.searchParams.get('theme')
      const minScore = Number(url.searchParams.get('minScore') || 0)
      const maxScore = Number(url.searchParams.get('maxScore') || 9)
      const sort = url.searchParams.get('sort') || 'score_desc'
      const page = Number(url.searchParams.get('page') || 0)
      const limit = Number(url.searchParams.get('limit') || 24)

      const orderBy = sort === 'score_asc' ? 'e.total ASC' :
                      sort === 'score_desc' ? 'e.total DESC' :
                      sort === 'temperature' ? 'c.temperature ASC' : 'e.total DESC'

      const hasPng = url.searchParams.get('hasPng')
      const pngFilter = hasPng === '1' ? ' AND c.has_desktop_png = 1' : ''

      const allRows = db.query(`
        SELECT c.id, c.prompt, c.temperature, c.run, c.suffix,
               e.total, e.visual_score, e.alignment_score, e.interactivity_score,
               c.has_desktop_png
        FROM components c
        JOIN eval_scores e ON c.id = e.component_id
        WHERE e.total BETWEEN ? AND ?${pngFilter}
        ORDER BY ${orderBy}
      `).all(minScore, maxScore) as Record<string, string | number>[]

      const enriched = allRows.map(r => ({
        ...r,
        category: inferCategory(r.prompt as string),
        theme: inferTheme(r.prompt as string),
      }))

      const filtered = enriched
        .filter(r => !category || category === 'all' || r.category === category)
        .filter(r => !theme || theme === 'all' || r.theme === theme)

      const total = filtered.length
      const items = filtered.slice(page * limit, (page + 1) * limit)

      return Response.json({ items, total }, { headers })
    }

    if (url.pathname.startsWith('/api/components/')) {
      const id = url.pathname.replace('/api/components/', '')
      const component = db.query(`
        SELECT c.*, e.total, e.visual_score, e.alignment_score, e.interactivity_score
        FROM components c
        JOIN eval_scores e ON c.id = e.component_id
        WHERE c.id = ?
      `).get(id) as Record<string, string | number> | null

      if (!component) return new Response('Not found', { status: 404 })

      if (component.critique_text) {
        component.critique = component.critique_text
        delete component.critique_text
      }

      component.category = inferCategory(component.prompt as string)
      component.theme = inferTheme(component.prompt as string)

      return Response.json(component, { headers })
    }

    if (url.pathname === '/api/conversations') {
      const type = url.searchParams.get('type')
      const page = Number(url.searchParams.get('page') || 0)
      const limit = 20

      const params: (string | number)[] = []
      let whereClause = ''
      if (type && type !== 'all') {
        whereClause = 'WHERE type = ?'
        params.push(type)
      }
      params.push(limit, page * limit)

      const rows = db.query(`
        SELECT id, type, domain, persona, turn_count, messages_json
        FROM conversations
        ${whereClause}
        ORDER BY rowid
        LIMIT ? OFFSET ?
      `).all(...params) as Record<string, string | number>[]

      const countParams: string[] = []
      if (type && type !== 'all') countParams.push(type)

      const total = (db.query(`
        SELECT COUNT(*) as n FROM conversations
        ${whereClause}
      `).get(...countParams) as Record<string, number>).n

      const items = rows.map(r => ({
        ...r,
        messages: JSON.parse(r.messages_json as string)
      }))

      return Response.json({ items, total }, { headers })
    }

    if (url.pathname === '/api/validation') {
      const scoresPath = join(import.meta.dir, '../data/fine-tuned-scores.jsonl')
      if (!existsSync(scoresPath)) return Response.json([], { headers })

      const lines = readFileSync(scoresPath, 'utf-8').trim().split('\n')
      const results = lines.map(l => JSON.parse(l))

      const enriched = results.map((r: any) => {
        try {
          const component = db.query(
            'SELECT prompt FROM components WHERE id = ?'
          ).get(r.component || r.id) as any
          return {
            ...r,
            prompt: component?.prompt || r.component || r.id,
            component_id: r.component || r.id
          }
        } catch {
          return { ...r, component_id: r.component || r.id }
        }
      })

      return Response.json(enriched, { headers })
    }

    // Static screenshots from mounted volume (/app/public/screenshots)
    if (url.pathname.startsWith('/screenshots/')) {
      const shotPath = join(import.meta.dir, '../public', url.pathname)
      if (existsSync(shotPath)) return new Response(Bun.file(shotPath))
    }

    // Static frontend (Vite build output) + SPA fallback
    const distPath = join(import.meta.dir, '../dist')
    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname
    const filePath = join(distPath, requestedPath)
    if (existsSync(filePath)) {
      return new Response(Bun.file(filePath))
    }
    const indexPath = join(distPath, 'index.html')
    if (existsSync(indexPath)) {
      return new Response(Bun.file(indexPath), {
        headers: { 'Content-Type': 'text/html' },
      })
    }
    return new Response('Not found', { status: 404 })
  }
})

console.log(`API server running at http://localhost:${server.port}`)
