import type { GridCols } from '@/lib/types'

const options: GridCols[] = [2, 3, 4]

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden">
      {options.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex items-center justify-center w-8 h-7 text-xs font-mono cursor-pointer transition-colors duration-150 border-0 ${
            cols === n
              ? 'bg-bg-elevated text-text-primary font-medium'
              : 'bg-transparent text-text-muted hover:text-text-secondary'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
