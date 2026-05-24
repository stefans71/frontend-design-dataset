import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'

function scoreColor(score: number) {
  if (score >= 7) return 'bg-score-high/15 text-score-high border-score-high/25'
  if (score >= 5) return 'bg-score-mid/15 text-score-mid border-score-mid/25'
  return 'bg-score-low/15 text-score-low border-score-low/25'
}

export default function ComponentCard({ component, index = 0 }: { component: ComponentWithScore; index?: number }) {
  const c = component
  const screenshotSrc = `/screenshots/${c.id}-desktop.webp`
  const score = c.score?.total ?? c.total

  return (
    <Link
      to={`/components/${c.id}`}
      className="card-enter group relative block overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-card no-underline transition-all duration-300 hover:-translate-y-1 hover:border-border-accent hover:shadow-[var(--shadow-md),var(--shadow-glow)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-bg-secondary">
        <img
          src={screenshotSrc}
          alt={c.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {score !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded-md backdrop-blur-md border ${scoreColor(score)}`}>
              {score}/9
            </span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium line-clamp-2 leading-snug text-text-primary group-hover:text-accent transition-colors duration-300">
          {c.prompt}
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="label-caps text-text-muted">{c.category}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="label-caps text-text-muted">{c.theme}</span>
          <span className="font-mono text-[10px] ml-auto text-text-muted">
            T={c.temperature}
          </span>
        </div>
      </div>
    </Link>
  )
}
