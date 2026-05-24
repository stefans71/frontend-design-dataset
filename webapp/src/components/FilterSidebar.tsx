import type { FilterCategory, FilterTheme, SortBy } from '@/lib/types'

interface FilterState {
  category: FilterCategory
  theme: FilterTheme
  sort: SortBy
  minScore: number
  maxScore: number
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

const themes: { value: FilterTheme; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

const sorts: { value: SortBy; label: string }[] = [
  { value: 'score_desc', label: 'Score ↓' },
  { value: 'score_asc', label: 'Score ↑' },
  { value: 'temperature', label: 'Temperature' },
]

function FilterGroup<T extends string>({ label, options, value, onSelect }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  return (
    <div>
      <span className="section-label block mb-2">{label}</span>
      <div className="space-y-0.5">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={`w-full text-left px-2.5 py-1.5 text-sm rounded-md cursor-pointer transition-colors duration-150 ${
              value === o.value
                ? 'text-text-primary font-medium bg-bg-elevated'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FilterSidebar({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val })

  const hasActiveFilters = filters.category !== 'all' || filters.theme !== 'all' || filters.minScore > 0 || filters.maxScore < 9

  return (
    <aside className="shrink-0 space-y-5" style={{ width: 200 }}>
      <FilterGroup label="Category" options={categories} value={filters.category} onSelect={v => set('category', v)} />
      <FilterGroup label="Theme" options={themes} value={filters.theme} onSelect={v => set('theme', v)} />
      <FilterGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => set('sort', v)} />
      <div>
        <span className="section-label block mb-2">Score Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0} max={9}
            value={filters.minScore}
            onChange={e => set('minScore', Number(e.target.value))}
            className="w-14 px-2 py-1.5 text-sm font-mono rounded-md border border-border bg-bg-card text-text-primary text-center focus:outline-none focus:border-text-muted transition-colors"
          />
          <span className="text-xs text-text-muted">—</span>
          <input
            type="number"
            min={0} max={9}
            value={filters.maxScore}
            onChange={e => set('maxScore', Number(e.target.value))}
            className="w-14 px-2 py-1.5 text-sm font-mono rounded-md border border-border bg-bg-card text-text-primary text-center focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ category: 'all', theme: 'all', sort: 'score_desc', minScore: 0, maxScore: 9 })}
          className="text-xs text-text-muted hover:text-text-secondary cursor-pointer transition-colors duration-150"
        >
          Reset filters
        </button>
      )}
    </aside>
  )
}
