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
  { value: 'id_asc', label: 'ID ↑' },
  { value: 'id_desc', label: 'ID ↓' },
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

export default function FilterSidebar({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val })

  const hasActiveFilters = filters.category !== 'all' || filters.theme !== 'all' || filters.minScore > 0 || filters.maxScore < 9

  return (
    <aside className="shrink-0 space-y-5 gallery-sidebar" style={{ width: 240 }}>
      <FilterGroup label="Category" options={categories} value={filters.category} onSelect={v => set('category', v)} />
      <FilterGroup label="Theme" options={themes} value={filters.theme} onSelect={v => set('theme', v)} />
      <FilterGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => set('sort', v)} />
      <div>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 4,
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          Score Range
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0} max={9}
            value={filters.minScore}
            onChange={e => set('minScore', Number(e.target.value))}
            className="font-mono text-text-primary bg-bg-card text-center focus:outline-none transition-colors"
            style={{ width: 56, height: 32, fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          />
          <span className="text-text-muted" style={{ fontSize: 12 }}>—</span>
          <input
            type="number"
            min={0} max={9}
            value={filters.maxScore}
            onChange={e => set('maxScore', Number(e.target.value))}
            className="font-mono text-text-primary bg-bg-card text-center focus:outline-none transition-colors"
            style={{ width: 56, height: 32, fontSize: 14, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ category: 'all', theme: 'all', sort: 'score_desc', minScore: 0, maxScore: 9 })}
          className="cursor-pointer transition-colors duration-150 bg-transparent border-0"
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >
          Reset filters
        </button>
      )}
    </aside>
  )
}
