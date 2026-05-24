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

function SelectGroup<T extends string>({ label, options, value, onSelect }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className="px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer"
            style={{
              backgroundColor: value === o.value ? 'var(--accent)' : 'var(--bg-secondary)',
              color: value === o.value ? '#fff' : 'var(--text-secondary)',
            }}
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

  return (
    <aside className="w-56 shrink-0 space-y-5 pr-4">
      <SelectGroup label="Category" options={categories} value={filters.category} onSelect={v => set('category', v)} />
      <SelectGroup label="Theme" options={themes} value={filters.theme} onSelect={v => set('theme', v)} />
      <SelectGroup label="Sort" options={sorts} value={filters.sort} onSelect={v => set('sort', v)} />
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          Score Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={9}
            value={filters.minScore}
            onChange={e => set('minScore', Number(e.target.value))}
            className="w-14 px-2 py-1 text-sm rounded-[var(--radius-sm)] border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="number"
            min={0}
            max={9}
            value={filters.maxScore}
            onChange={e => set('maxScore', Number(e.target.value))}
            className="w-14 px-2 py-1 text-sm rounded-[var(--radius-sm)] border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
    </aside>
  )
}
