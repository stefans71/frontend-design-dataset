import { useState } from 'react'
import { useComponents } from '@/hooks/useComponents'
import type { GridCols, FilterCategory, FilterTheme, SortBy } from '@/lib/types'
import ComponentCard from '@/components/ComponentCard'
import FilterSidebar from '@/components/FilterSidebar'
import GridControl from '@/components/GridControl'
import PageWrapper from '@/components/ui/PageWrapper'
import Shimmer from '@/components/ui/Shimmer'
import SectionHeading from '@/components/ui/SectionHeading'

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
    <PageWrapper wide>
      <div className="flex items-center justify-between mb-6">
        <SectionHeading
          title="Component Gallery"
          subtitle={`${total} components`}
        />
        <GridControl cols={cols} onChange={setCols} />
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          filters={filters}
          onChange={f => { setFilters(f); setPage(0) }}
        />

        <div className="flex-1 pl-2">
          {loading ? (
            <div className={`grid ${gridClass} gap-5`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="aspect-[4/3]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium text-text-muted">No components found</p>
              <p className="text-sm mt-1 text-text-muted">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-5`}>
                {items.map((c, i) => (
                  <ComponentCard key={c.id} component={c} index={i} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm rounded-[var(--radius)] bg-bg-secondary text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    Prev
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
                        className={`w-8 h-8 text-sm font-mono rounded-[var(--radius)] transition-all duration-[var(--duration-fast)] cursor-pointer ${
                          page === pageNum
                            ? 'bg-accent text-white'
                            : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm rounded-[var(--radius)] bg-bg-secondary text-text-secondary hover:bg-bg-elevated transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
