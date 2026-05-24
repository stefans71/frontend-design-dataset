import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'

function scoreColor(score: number) {
  if (score >= 7) return 'bg-score-high/80 text-white'
  if (score >= 5) return 'bg-score-mid/80 text-white'
  return 'bg-score-low/80 text-white'
}

export default function ComponentCard({ component }: { component: ComponentWithScore; index?: number }) {
  const c = component
  const score = c.score?.total ?? c.total

  return (
    <Link
      to={`/components/${c.id}`}
      className="block overflow-hidden no-underline bg-bg-card transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
    >
      {/* Zone 1 — Screenshot */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={`/screenshots/${c.id}-desktop.webp`}
          alt={c.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {score !== undefined && (
          <span className={`absolute font-mono ${scoreColor(score)}`} style={{ top: 8, right: 8, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
            {score}/9
          </span>
        )}
        <span className="absolute text-white/80" style={{ top: 8, left: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          {c.category}
        </span>
      </div>

      {/* Zone 2 — Prompt */}
      <div style={{ padding: '12px 14px' }}>
        <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {c.prompt}
        </p>
      </div>

      {/* Zone 3 — Metadata footer */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: '#22c55e' }}>
        Qwen3.6-27B · {c.category} · {c.theme} · T={c.temperature}
      </div>
    </Link>
  )
}
