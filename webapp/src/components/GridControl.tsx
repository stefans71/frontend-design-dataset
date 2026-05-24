import type { GridCols } from '@/lib/types'

const options: GridCols[] = [2, 3, 4]

const gridIcons: Record<number, string> = {
  2: '▦',
  3: '▦▦',
  4: '▦▦▦',
}

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return (
    <div className="flex items-center gap-1">
      {options.map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="cursor-pointer transition-colors duration-150"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 'var(--radius)',
            fontSize: 12,
            fontWeight: cols === n ? 600 : 400,
            fontFamily: 'var(--font-mono)',
            background: cols === n ? 'var(--accent)' : 'var(--bg-secondary)',
            color: cols === n ? '#fff' : 'var(--text-secondary)',
            border: cols === n ? '1px solid var(--accent)' : '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: -2 }}>{gridIcons[n]}</span>
          {n}
        </button>
      ))}
    </div>
  )
}
