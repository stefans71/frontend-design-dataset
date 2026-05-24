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

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border-subtle last:border-b-0">
      <span className="label-caps text-text-muted">{label}</span>
      {children}
    </div>
  )
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100
  return (
    <div className="py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="label-caps text-text-muted">{label}</span>
        <span className="font-mono text-sm font-bold text-text-primary">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
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
        <div className="rounded-[var(--radius-lg)] overflow-hidden bg-bg-card border border-border shadow-[var(--shadow)]">
          <div className="h-1 bg-gradient-to-r from-accent to-accent-warm" />
          <img src={desktopSrc} alt={c.prompt} className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>

        <div className="flex gap-4">
          <div className="w-44 rounded-[var(--radius)] overflow-hidden shrink-0 bg-bg-card border border-border">
            <img src={mobileSrc} alt="Mobile view" className="w-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <Card className="flex-1">
            <span className="label-caps text-accent block mb-2">Prompt</span>
            <p className="text-sm leading-relaxed text-text-secondary">{c.prompt}</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <span className="label-caps text-accent block mb-3">Score</span>
          {score !== undefined && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <span className="font-mono text-3xl font-bold text-text-primary">{score}</span>
              <span className="text-text-muted">/9</span>
              <span className="ml-auto"><Badge variant={scoreVariant(score)}>{score >= 7 ? 'High' : score >= 5 ? 'Mid' : 'Low'}</Badge></span>
            </div>
          )}
          {visual !== undefined && <ScoreBar label="Visual" value={visual} max={3} />}
          {alignment !== undefined && <ScoreBar label="Alignment" value={alignment} max={3} />}
          {interactivity !== undefined && <ScoreBar label="Interactivity" value={interactivity} max={3} />}
        </Card>

        <Card>
          <span className="label-caps text-accent block mb-3">Metadata</span>
          <MetaRow label="Category"><Badge>{c.category}</Badge></MetaRow>
          <MetaRow label="Theme"><Badge>{c.theme}</Badge></MetaRow>
          <MetaRow label="Temperature"><span className="font-mono text-sm text-text-primary">{c.temperature}</span></MetaRow>
          <MetaRow label="Run"><span className="font-mono text-sm text-text-primary">{c.run}</span></MetaRow>
        </Card>

        {c.critique && (
          <Card>
            <span className="label-caps text-accent block mb-3">Design Critique</span>
            <div className="max-h-96 overflow-y-auto pr-1">
              <CritiquePanel critique={c.critique} />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
