import type { GridCols } from '@/lib/types'

const options: GridCols[] = [2, 3, 4]

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-card border border-border">
      {options.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex items-center justify-center w-8 h-7 rounded-md text-xs font-mono transition-all duration-150 cursor-pointer ${
            cols === n
              ? 'bg-accent text-[#06080d] font-bold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
