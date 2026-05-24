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
  { value: 'score_desc', label: 'Score ↓' },
  { value: 'score_asc', label: 'Score ↑' },
  { value: 'temperature', label: 'Temp' },
]

function FilterGroup<T extends string>({ label, options, value, onSelect }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  return (
    <div>
      <span className="label-caps text-text-muted block mb-2.5">{label}</span>
      <div className="space-y-0.5">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-150 cursor-pointer ${
              value === o.value
                ? 'text-accent bg-accent-subtle font-medium'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            <span className="flex items-center gap-2">
              {value === o.value && <span className="w-1 h-1 rounded-full bg-accent shrink-0" />}
              {o.label}
            </span>
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
    <aside className="w-52 shrink-0 space-y-6">
      <FilterGroup label="Category" options={categories} value={filters.category} onSelect={v => set('category', v)} />
      <FilterGroup label="Theme" options={themes} value={filters.theme} onSelect={v => set('theme', v)} />
      <FilterGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => set('sort', v)} />
      <div>
        <span className="label-caps text-text-muted block mb-2.5">Score Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={9}
            value={filters.minScore}
            onChange={e => set('minScore', Number(e.target.value))}
            className="w-14 px-2 py-2 text-sm font-mono rounded-lg border border-border bg-bg-card text-text-primary text-center focus:outline-none focus:border-accent transition-colors"
          />
          <span className="text-xs text-text-muted">—</span>
          <input
            type="number"
            min={0}
            max={9}
            value={filters.maxScore}
            onChange={e => set('maxScore', Number(e.target.value))}
            className="w-14 px-2 py-2 text-sm font-mono rounded-lg border border-border bg-bg-card text-text-primary text-center focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ category: 'all', theme: 'all', sort: 'score_desc', minScore: 0, maxScore: 9 })}
          className="label-caps text-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          Reset all ×
        </button>
      )}
    </aside>
  )
}
