import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

export default function ComponentCard({ component, index = 0 }: { component: ComponentWithScore; index?: number }) {
  const c = component
  const screenshotSrc = `/screenshots/${c.id}-desktop.webp`
  const score = c.score?.total ?? c.total

  return (
    <Link
      to={`/components/${c.id}`}
      className="group block rounded-[var(--radius-xl)] overflow-hidden bg-bg-card border border-border no-underline card-enter transition-all duration-200 hover:-translate-y-1 hover:border-border-accent hover:shadow-[var(--shadow-md),var(--shadow-glow)]"
      style={{ animationDelay: `${index * 50}ms`, boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-bg-secondary">
        <img
          src={screenshotSrc}
          alt={c.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-all duration-500 brightness-[0.95] contrast-[1.02] group-hover:brightness-100 group-hover:contrast-100 group-hover:scale-[1.03]"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {score !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <Badge variant={scoreVariant(score)}>{score}/9</Badge>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium line-clamp-2 leading-snug text-text-primary">
          {c.prompt}
        </p>
        <div className="flex items-center gap-2 mt-2.5">
          <Badge>{c.category}</Badge>
          <Badge>{c.theme}</Badge>
          <span className="text-xs ml-auto font-mono text-text-muted">
            T={c.temperature}
          </span>
        </div>
      </div>
    </Link>
  )
}
