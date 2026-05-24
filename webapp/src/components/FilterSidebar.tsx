import type { FilterCategory, FilterTheme, SortBy } from '@/lib/types'

interface FilterState {
  category: FilterCategory
  theme: FilterTheme
  sort: SortBy
  minScore: number
  maxScore: number
}

interface FilterSidebarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
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
  { value: 'score_desc', label: 'Score (High)' },
  { value: 'score_asc', label: 'Score (Low)' },
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
      <span className="label-caps text-text-muted block mb-2">{label}</span>
      <div className="space-y-0.5">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={`w-full text-left px-3 py-1.5 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] cursor-pointer ${
              value === o.value
                ? 'text-accent bg-accent-subtle border-l-2 border-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border-l-2 border-transparent'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val })

  const hasActiveFilters = filters.category !== 'all' || filters.theme !== 'all' || filters.minScore > 0 || filters.maxScore < 9

  return (
    <aside className="w-52 shrink-0 space-y-6 pr-4 border-r border-border-subtle">
      <FilterGroup label="Category" options={categories} value={filters.category} onSelect={v => set('category', v)} />
      <FilterGroup label="Theme" options={themes} value={filters.theme} onSelect={v => set('theme', v)} />
      <FilterGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => set('sort', v)} />
      <div>
        <span className="label-caps text-text-muted block mb-2">Score Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={9}
            value={filters.minScore}
            onChange={e => set('minScore', Number(e.target.value))}
            className="w-14 px-2 py-1.5 text-sm rounded-[var(--radius-sm)] border border-border bg-bg-secondary text-text-primary text-center focus:outline-none focus:border-accent transition-colors"
          />
          <span className="text-xs text-text-muted">to</span>
          <input
            type="number"
            min={0}
            max={9}
            value={filters.maxScore}
            onChange={e => set('maxScore', Number(e.target.value))}
            className="w-14 px-2 py-1.5 text-sm rounded-[var(--radius-sm)] border border-border bg-bg-secondary text-text-primary text-center focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ category: 'all', theme: 'all', sort: 'score_desc', minScore: 0, maxScore: 9 })}
          className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          Reset filters
        </button>
      )}
    </aside>
  )
}
