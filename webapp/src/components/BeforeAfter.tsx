import { useState } from 'react'

export default function BeforeAfter({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const [view, setView] = useState<'before' | 'after'>('after')

  return (
    <div>
      <div className="flex gap-1 mb-3 p-1 rounded-[var(--radius)]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {(['before', 'after'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 py-1.5 text-sm font-medium rounded transition-colors capitalize cursor-pointer"
            style={{
              backgroundColor: view === v ? 'var(--bg-card)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {v === 'before' ? 'Original' : 'Improved'}
          </button>
        ))}
      </div>
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <img
          src={view === 'before' ? beforeSrc : afterSrc}
          alt={`${view} screenshot`}
          className="w-full"
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
    </div>
  )
}
