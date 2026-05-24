import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import CritiquePanel from '@/components/CritiquePanel'
import GradientDivider from '@/components/ui/GradientDivider'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

interface ComponentDetailProps {
  component: ComponentWithScore & { critique?: string }
}

function MetadataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border-subtle last:border-b-0">
      <span className="label-caps text-text-muted">{label}</span>
      <span>{children}</span>
    </div>
  )
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
        <div className="rounded-[var(--radius-lg)] overflow-hidden bg-bg-secondary border border-border relative">
          <div className="h-0.5 bg-accent/30" />
          <img src={desktopSrc} alt={c.prompt} className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>

        <div className="flex gap-4">
          <div className="w-48 rounded-[var(--radius)] overflow-hidden shrink-0 bg-bg-secondary border border-border">
            <img src={mobileSrc} alt="Mobile view" className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <Card className="flex-1">
            <h3 className="label-caps text-text-muted mb-2">Prompt</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{c.prompt}</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <h3 className="font-display text-base text-text-display mb-3">Score Breakdown</h3>
          <GradientDivider className="mb-3" />
          <div className="space-y-0">
            {score !== undefined && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-text-primary">Total</span>
                <Badge variant={scoreVariant(score)}>{score}/9</Badge>
              </div>
            )}
            {visual !== undefined && (
              <MetadataRow label="Visual">{visual}/3</MetadataRow>
            )}
            {alignment !== undefined && (
              <MetadataRow label="Alignment">{alignment}/3</MetadataRow>
            )}
            {interactivity !== undefined && (
              <MetadataRow label="Interactivity">{interactivity}/3</MetadataRow>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-base text-text-display mb-3">Metadata</h3>
          <GradientDivider className="mb-3" />
          <div>
            <MetadataRow label="Category"><Badge>{c.category}</Badge></MetadataRow>
            <MetadataRow label="Theme"><Badge>{c.theme}</Badge></MetadataRow>
            <MetadataRow label="Temperature">
              <span className="text-sm font-mono text-text-primary">{c.temperature}</span>
            </MetadataRow>
            <MetadataRow label="Run">
              <span className="text-sm font-mono text-text-primary">{c.run}</span>
            </MetadataRow>
          </div>
        </Card>

        {c.critique && (
          <Card>
            <h3 className="font-display text-base text-text-display mb-3">Design Critique</h3>
            <GradientDivider className="mb-3" />
            <div className="max-h-96 overflow-y-auto pr-1">
              <CritiquePanel critique={c.critique} />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
