import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQwen27bComponents } from '@/hooks/useQwen27bComponents'
import type { GridCols, FilterCategory, Qwen27bComponent } from '@/lib/types'
import GridControl from '@/components/GridControl'
import Shimmer from '@/components/ui/Shimmer'

function Qwen27bCard({ component, basePath }: { component: Qwen27bComponent; index?: number; basePath: string }) {
  const c = component
  const idMatch = c.id.match(/component-(\d+)-run(\d+)/)
  const shortId = idMatch ? `#${idMatch[1]}-r${idMatch[2]}` : c.id

  // Compute average score across available conditions
  const scores: number[] = []
  if (c.q5_score != null) scores.push(c.q5_score)
  if (c.q8_va_score != null) scores.push(c.q8_va_score)
  if (c.q8_vb_score != null) scores.push(c.q8_vb_score)
  if (c.q8_vc_score != null) scores.push(c.q8_vc_score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null

  return (
    <Link
      to={`${basePath}/${c.id}`}
      className="block overflow-hidden no-underline bg-bg-card card-hover-lift"
      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
    >
      {/* Zone 1 — Placeholder with category */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'var(--bg-secondary)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: 24 }}>&#x2B21;</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{c.category}</span>
        </div>
        {avgScore !== null && (
          <span className="absolute font-mono" style={{
            top: 8, right: 8, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            backdropFilter: 'blur(4px)',
            background: avgScore >= 7 ? 'rgba(34,197,94,0.8)' : avgScore >= 5 ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)',
            color: '#fff',
          }}>
            avg {avgScore.toFixed(1)}
          </span>
        )}
        <span className="absolute" style={{ top: 8, left: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.8)' }}>
          {c.category}
        </span>
        <span className="absolute font-mono" style={{
          bottom: 8, right: 8, fontSize: 10, fontWeight: 600,
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          color: 'rgba(255,255,255,0.7)',
        }}>
          {shortId}
        </span>
      </div>

      {/* Zone 2 — Prompt */}
      <div style={{ padding: '12px 14px' }}>
        <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {c.prompt}
        </p>
      </div>

      {/* Zone 3 — Scores footer */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4,
            border: '1px solid var(--border-subtle)', flexShrink: 0,
            color: '#f97316', fontWeight: 700,
          }}>
            Q5 vs Q8
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.category} · {c.theme}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {c.q5_score != null && (
            <span className="font-mono" style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
              {c.q5_score}/9
            </span>
          )}
          {c.q8_va_score != null && (
            <span className="font-mono" style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
              {c.q8_va_score}/10
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'form', label: 'Forms' },
  { value: 'card', label: 'Cards' },
  { value: 'navbar', label: 'Navigation' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'data_display', label: 'Data Display' },
  { value: 'marketing', label: 'Marketing' },
]

type Qwen27bFilterTheme = 'all' | 'dark' | 'light'
const themes: { value: Qwen27bFilterTheme; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

type Qwen27bSort = 'id_asc' | 'id_desc'
const sorts: { value: Qwen27bSort; label: string }[] = [
  { value: 'id_asc', label: 'ID ↑' },
  { value: 'id_desc', label: 'ID ↓' },
]

function FilterGroup<T extends string>({ label, options, value, onSelect }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 4,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {label}
      </div>
      <div className="space-y-0.5">
        {options.map(o => {
          const isActive = value === o.value
          return (
            <button
              key={o.value}
              onClick={() => onSelect(o.value)}
              className="w-full text-left cursor-pointer bg-transparent border-0"
              style={{
                padding: '6px 8px',
                paddingLeft: isActive ? 10 : 8,
                fontSize: 14,
                borderRadius: 4,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                transition: 'all 150ms',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Qwen27bGallery() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [cols, setCols] = useState<GridCols>(3)
  const [page, setPage] = useState(() => Number(searchParams.get('page') || 0))
  const [search, setSearch] = useState('')
  const storageKey = 'qwen27b-gallery-page'

  useEffect(() => {
    sessionStorage.setItem(storageKey, String(page))
  }, [page])

  const [filters, setFilters] = useState({
    category: 'all' as FilterCategory,
    theme: 'all' as Qwen27bFilterTheme,
    sort: 'id_asc' as Qwen27bSort,
  })

  const params = {
    category: filters.category !== 'all' ? filters.category : undefined,
    theme: filters.theme !== 'all' ? filters.theme : undefined,
    sort: filters.sort,
    page,
  }
  const { items, total, loading } = useQwen27bComponents(params)
  const totalPages = Math.ceil(total / 24)
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'

  const hasActiveFilters = filters.category !== 'all' || filters.theme !== 'all'

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
              QWEN 3.6 27B
            </div>
            <h1 className="text-text-primary" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>Q6 VS Q8 Comparison</h1>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Comparing</span>
              <span style={{ color: '#f97316', fontWeight: 700 }}>Q5_K_XL</span>
              <span>vs</span>
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>Q8_K_XL</span>
              <span>quantization</span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>GPT-5.4 scored</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.6, marginBottom: 12 }}>
              Same 100 prompts (T=0.5) run through two quantization levels with three Q8 conditions:
              raw output, T=0.85, and T=0.85 with self-check. Compare design quality side by side.
            </p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span><strong style={{ color: 'var(--accent)' }}>100</strong> prompts</span>
              <span>·</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>3</strong> Q8 conditions</span>
              <span>·</span>
              <span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Q5</span>
                {' vs '}
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>Q8 T=0.6</span>
                {' vs '}
                <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Q8 T=0.85</span>
                {' vs '}
                <span style={{ color: '#10b981', fontWeight: 600 }}>Q8 T=0.85 2p</span>
              </span>
            </div>
          </div>
          <div className="grid-control"><GridControl cols={cols} onChange={setCols} /></div>
        </div>
      </div>

      <div className="flex gallery-layout" style={{ gap: 32 }}>
        <aside className="shrink-0 space-y-5 gallery-sidebar" style={{ width: 240 }}>
          <FilterGroup label="Category" options={categories} value={filters.category} onSelect={v => setFilters(f => ({ ...f, category: v }))} />
          <FilterGroup label="Theme" options={themes} value={filters.theme} onSelect={v => setFilters(f => ({ ...f, theme: v }))} />
          <FilterGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => setFilters(f => ({ ...f, sort: v }))} />
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ category: 'all', theme: 'all', sort: 'id_asc' })}
              className="cursor-pointer transition-colors duration-150 bg-transparent border-0"
              style={{ fontSize: 12, color: 'var(--text-muted)' }}
            >
              Reset filters
            </button>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Search + pagination bar */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16, gap: 12 }}>
            <form
              onSubmit={e => {
                e.preventDefault()
                const q = search.trim()
                if (!q) return
                const numMatch = q.match(/(\d{1,3})/)
                if (numMatch) {
                  const num = numMatch[1].padStart(3, '0')
                  navigate(`/qwen27b/component-${num}-run0`)
                }
              }}
              className="flex items-center"
              style={{ gap: 6 }}
            >
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Jump to # (e.g. 54, 012)"
                className="text-text-primary bg-bg-card focus:outline-none transition-colors"
                style={{
                  width: 200, height: 32, fontSize: 13, padding: '0 10px',
                  borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                }}
              />
              <button
                type="submit"
                className="cursor-pointer text-text-muted hover:text-text-primary bg-transparent transition-colors duration-150"
                style={{ height: 32, padding: '0 10px', fontSize: 13, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
              >
                Go
              </button>
            </form>
            {totalPages > 1 && (
              <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150 bg-transparent"
                  style={{ padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  &#8592;
                </button>
                <span className="font-mono text-text-muted" style={{ fontSize: 12 }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150 bg-transparent"
                  style={{ padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>
          {loading ? (
            <div className={`grid ${gridClass}`} style={{ gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="aspect-[4/3]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <p className="text-text-muted" style={{ fontSize: 16 }}>No components found</p>
              <p className="text-text-muted" style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div key={page} className={`grid ${gridClass} gallery-grid`} style={{ gap: 16 }}>
                {items.map((c, i) => (
                  <div
                    key={c.id}
                    className="page-enter"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <Qwen27bCard component={c} index={i} basePath="/qwen27b" />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1" style={{ marginTop: 32 }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150"
                    style={{ padding: '6px 10px', fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
                  >
                    &#8592;
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) pageNum = i
                    else if (page < 3) pageNum = i
                    else if (page > totalPages - 4) pageNum = totalPages - 7 + i
                    else pageNum = page - 3 + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className="font-mono cursor-pointer transition-colors duration-150"
                        style={{
                          width: 32, height: 32,
                          fontSize: 13,
                          borderRadius: 'var(--radius)',
                          border: page === pageNum ? '1px solid var(--accent)' : '1px solid transparent',
                          background: page === pageNum ? 'var(--accent)' : 'transparent',
                          color: page === pageNum ? '#fff' : 'var(--text-muted)',
                          fontWeight: page === pageNum ? 600 : 400,
                        }}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="cursor-pointer disabled:cursor-default disabled:opacity-25 transition-colors duration-150"
                    style={{ padding: '6px 10px', fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
