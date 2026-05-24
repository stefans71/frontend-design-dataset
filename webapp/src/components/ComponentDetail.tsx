import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import CritiquePanel from '@/components/CritiquePanel'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

interface ComponentDetailProps {
  component: ComponentWithScore & { critique?: string }
}

export default function ComponentDetail({ component: c }: ComponentDetailProps) {
  const score = c.score?.total ?? c.total
  const visual = c.score?.visual_score ?? c.visual_score
  const alignment = c.score?.alignment_score ?? c.alignment_score
  const interactivity = c.score?.interactivity_score ?? c.interactivity_score
  const desktopSrc = `/screenshots/${c.id}-desktop.webp`
  const mobileSrc = `/screenshots/${c.id}-mobile.webp`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div
          className="rounded-[var(--radius-lg)] overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <img src={desktopSrc} alt={c.prompt} className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>

        <div className="flex gap-4">
          <div
            className="w-48 rounded-[var(--radius)] overflow-hidden shrink-0"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <img src={mobileSrc} alt="Mobile view" className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <Card className="flex-1">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Prompt</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.prompt}</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
          <div className="space-y-2">
            {score !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</span>
                <Badge variant={scoreVariant(score)}>{score}/9</Badge>
              </div>
            )}
            {visual !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Visual</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{visual}/3</span>
              </div>
            )}
            {alignment !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Alignment</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{alignment}/3</span>
              </div>
            )}
            {interactivity !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Interactivity</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{interactivity}/3</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Metadata</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Category</span>
              <Badge>{c.category}</Badge>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Theme</span>
              <Badge>{c.theme}</Badge>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Temperature</span>
              <span style={{ color: 'var(--text-primary)' }}>{c.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Run</span>
              <span style={{ color: 'var(--text-primary)' }}>{c.run}</span>
            </div>
          </div>
        </Card>

        {c.critique && (
          <Card>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Design Critique</h3>
            <div className="max-h-96 overflow-y-auto">
              <CritiquePanel critique={c.critique} />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
