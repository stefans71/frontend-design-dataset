import { useState } from 'react'

export default function BeforeAfter({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const [view, setView] = useState<'before' | 'after'>('after')

  return (
    <div>
      <div className="flex gap-1 mb-3 p-1 rounded-[var(--radius)] bg-bg-secondary">
        {(['before', 'after'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-1.5 text-sm font-medium rounded transition-all duration-[var(--duration-fast)] capitalize cursor-pointer ${
              view === v
                ? 'bg-bg-card text-text-primary shadow-[var(--shadow-sm)]'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {v === 'before' ? 'Original' : 'Improved'}
          </button>
        ))}
      </div>
      <div className="rounded-[var(--radius-lg)] overflow-hidden bg-bg-secondary border border-border">
        <img
          src={view === 'before' ? beforeSrc : afterSrc}
          alt={`${view} screenshot`}
          className="w-full"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    </div>
  )
}
