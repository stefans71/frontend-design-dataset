import type { GridCols } from '@/lib/types'

const options: GridCols[] = [2, 3, 4]

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[var(--radius)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {options.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="flex items-center justify-center w-8 h-7 rounded text-xs font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: cols === n ? 'var(--bg-card)' : 'transparent',
            color: cols === n ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: cols === n ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
