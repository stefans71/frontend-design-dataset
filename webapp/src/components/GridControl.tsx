import type { GridCols } from '@/lib/types'

const options: GridCols[] = [2, 3, 4]

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius)] bg-bg-secondary">
      {options.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex items-center justify-center w-8 h-7 rounded text-xs font-medium transition-all duration-[var(--duration-fast)] cursor-pointer ${
            cols === n
              ? 'bg-bg-card text-text-primary shadow-[var(--shadow-sm)]'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
