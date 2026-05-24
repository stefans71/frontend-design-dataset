import { Database } from 'bun:sqlite'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(import.meta.dir, '../data/dataset.sqlite')
const db = new Database(DB_PATH)

function inferCategory(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('form') || p.includes('login') || p.includes('signup') || p.includes('checkout')) return 'form'
  if (p.includes('nav') || p.includes('menu') || p.includes('sidebar')) return 'navbar'
  if (p.includes('card') || p.includes('pricing') || p.includes('product') || p.includes('profile')) return 'card'
  if (p.includes('mobile') || p.includes('bottom') || p.includes('tab bar')) return 'mobile'
  if (p.includes('table') || p.includes('chart') || p.includes('dashboard') || p.includes('stat')) return 'data_display'
  if (p.includes('cta') || p.includes('hero') || p.includes('testimonial') || p.includes('marketing')) return 'marketing'
  return 'misc'
}

function inferTheme(prompt: string): 'dark' | 'light' {
  return prompt.toLowerCase().includes('dark') ? 'dark' : 'light'
}

const server = Bun.serve({
  port: 3001,
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

      const rows = db.query(`
        SELECT c.id, c.prompt, c.temperature, c.run, c.suffix,
               e.total, e.visual_score, e.alignment_score, e.interactivity_score
        FROM components c
        JOIN eval_scores e ON c.id = e.component_id
        WHERE e.total BETWEEN ? AND ?
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `).all(minScore, maxScore, limit, page * limit) as Record<string, string | number>[]

      const total = (db.query(`
        SELECT COUNT(*) as n FROM components c
        JOIN eval_scores e ON c.id = e.component_id
        WHERE e.total BETWEEN ? AND ?
      `).get(minScore, maxScore) as Record<string, number>).n

      const items = rows
        .map(r => ({ ...r, category: inferCategory(r.prompt as string), theme: inferTheme(r.prompt as string) }))
        .filter(r => !category || category === 'all' || r.category === category)
        .filter(r => !theme || theme === 'all' || r.theme === theme)

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

      const critiquePath = join(
        import.meta.dir,
        `../../output/assets/components/${id}/critique.md`
      )
      if (existsSync(critiquePath)) {
        component.critique = readFileSync(critiquePath, 'utf-8')
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
      return Response.json(results, { headers })
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
