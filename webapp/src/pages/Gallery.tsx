import { useState } from 'react'
import { useComponents } from '@/hooks/useComponents'
import type { GridCols, FilterCategory, FilterTheme, SortBy } from '@/lib/types'
import ComponentCard from '@/components/ComponentCard'
import FilterSidebar from '@/components/FilterSidebar'
import GridControl from '@/components/GridControl'
import Shimmer from '@/components/ui/Shimmer'

export default function Gallery() {
  const [cols, setCols] = useState<GridCols>(3)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    category: 'all' as FilterCategory,
    theme: 'all' as FilterTheme,
    sort: 'score_desc' as SortBy,
    minScore: 0,
    maxScore: 9,
  })

  const params = {
    category: filters.category !== 'all' ? filters.category : undefined,
    theme: filters.theme !== 'all' ? filters.theme : undefined,
    sort: filters.sort,
    page,
    minScore: filters.minScore,
    maxScore: filters.maxScore,
  }
  const { items, total, loading } = useComponents(params)
  const totalPages = Math.ceil(total / 24)

  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600 }}>Components</h1>
          <p className="text-text-muted" style={{ fontSize: 13, marginTop: 2 }}>{total} items</p>
        </div>
        <div className="grid-control"><GridControl cols={cols} onChange={setCols} /></div>
      </div>

      <div className="flex gallery-layout" style={{ gap: 32 }}>
        <FilterSidebar
          filters={filters}
          onChange={f => { setFilters(f); setPage(0) }}
        />

        <div className="flex-1 min-w-0">
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
              <div className={`grid ${gridClass} gallery-grid`} style={{ gap: 16 }}>
                {items.map((c, i) => (
                  <ComponentCard key={c.id} component={c} index={i} />
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
                    ←
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
                    →
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
