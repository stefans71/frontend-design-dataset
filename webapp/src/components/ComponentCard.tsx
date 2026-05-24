import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

export default function ComponentCard({ component }: { component: ComponentWithScore }) {
  const c = component
  const screenshotSrc = `/screenshots/${c.id}-desktop.webp`
  const score = c.score?.total ?? c.total

  return (
    <Link
      to={`/components/${c.id}`}
      className="group block rounded-[var(--radius-lg)] overflow-hidden transition-all no-underline"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="relative overflow-hidden aspect-[4/3]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <img
          src={screenshotSrc}
          alt={c.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {score !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge variant={scoreVariant(score)}>{score}/9</Badge>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {c.prompt}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge>{c.category}</Badge>
          <Badge>{c.theme}</Badge>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            T={c.temperature}
          </span>
        </div>
      </div>
    </Link>
  )
}
