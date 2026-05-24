import { useState } from 'react'
import { useComponents } from '@/hooks/useComponents'
import type { GridCols, FilterCategory, FilterTheme, SortBy } from '@/lib/types'
import ComponentCard from '@/components/ComponentCard'
import FilterSidebar from '@/components/FilterSidebar'
import GridControl from '@/components/GridControl'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Component Gallery</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total} components
          </p>
        </div>
        <GridControl cols={cols} onChange={setCols} />
      </div>

      <div className="flex gap-6">
        <FilterSidebar
          filters={filters}
          onChange={f => { setFilters(f); setPage(0) }}
        />

        <div className="flex-1">
          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-[var(--radius-lg)] animate-pulse"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No components found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-4`}>
                {items.map(c => (
                  <ComponentCard key={c.id} component={c} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm rounded-[var(--radius)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    Prev
                  </button>
                  <span className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm rounded-[var(--radius)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    Next
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
