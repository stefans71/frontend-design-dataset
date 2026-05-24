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
    <div className="page-enter page-container py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="label-caps text-accent block mb-2">Gallery</span>
          <h1 className="font-display text-3xl font-700 text-text-display">Components</h1>
          <p className="text-sm text-text-muted mt-1 font-mono">{total} items</p>
        </div>
        <GridControl cols={cols} onChange={setCols} />
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          filters={filters}
          onChange={f => { setFilters(f); setPage(0) }}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={`grid ${gridClass} gap-5`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="aspect-[4/3] rounded-[var(--radius-lg)]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-[var(--radius-xl)]">
              <p className="font-display text-xl text-text-muted">No components found</p>
              <p className="text-sm mt-2 text-text-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-5`}>
                {items.map((c, i) => (
                  <ComponentCard key={c.id} component={c} index={i} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-bg-elevated hover:border-border-accent transition-all disabled:opacity-20 cursor-pointer disabled:cursor-default"
                  >
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i
                    } else if (page < 3) {
                      pageNum = i
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 7 + i
                    } else {
                      pageNum = page - 3 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 text-sm font-mono rounded-lg transition-all duration-200 cursor-pointer ${
                          page === pageNum
                            ? 'bg-accent text-[#06080d] font-bold'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-bg-elevated hover:border-border-accent transition-all disabled:opacity-20 cursor-pointer disabled:cursor-default"
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
