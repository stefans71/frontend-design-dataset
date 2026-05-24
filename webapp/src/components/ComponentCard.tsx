import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

export default function ComponentCard({ component }: { component: ComponentWithScore; index?: number }) {
  const c = component
  const score = c.score?.total ?? c.total

  return (
    <Link
      to={`/components/${c.id}`}
      className="block rounded-lg border border-border bg-bg-card overflow-hidden no-underline hover:border-text-muted transition-colors duration-150"
    >
      <div className="aspect-[4/3] bg-bg-secondary overflow-hidden">
        <img
          src={`/screenshots/${c.id}-desktop.webp`}
          alt={c.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div className="p-3">
        <p className="text-sm text-text-primary line-clamp-2 leading-snug">{c.prompt}</p>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <Badge>{c.category}</Badge>
          <span className="text-xs text-text-muted">{c.theme}</span>
          <span className="font-mono text-xs text-text-muted">T={c.temperature}</span>
          {score !== undefined && (
            <span className="ml-auto">
              <Badge variant={scoreVariant(score)}>{score}/9</Badge>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
