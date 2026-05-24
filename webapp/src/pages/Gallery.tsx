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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-text-primary" style={{ fontSize: 20 }}>Components</h1>
          <p className="text-sm text-text-muted mt-0.5">{total} items</p>
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
            <div className={`grid ${gridClass}`} style={{ gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="aspect-[4/3]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg">
              <p className="text-text-muted" style={{ fontSize: 16 }}>No components found</p>
              <p className="text-sm text-text-muted mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass}`} style={{ gap: 16 }}>
                {items.map((c, i) => (
                  <ComponentCard key={c.id} component={c} index={i} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-2.5 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-elevated transition-colors duration-150 disabled:opacity-25 cursor-pointer disabled:cursor-default"
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
                        className={`w-8 h-8 text-sm font-mono rounded-md cursor-pointer transition-colors duration-150 ${
                          page === pageNum
                            ? 'bg-bg-elevated text-text-primary font-medium border border-border'
                            : 'text-text-muted hover:text-text-primary border border-transparent'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-2.5 py-1.5 text-sm rounded-md border border-border text-text-secondary hover:bg-bg-elevated transition-colors duration-150 disabled:opacity-25 cursor-pointer disabled:cursor-default"
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
