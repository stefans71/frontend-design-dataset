import { useState } from 'react'
import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import CritiquePanel from '@/components/CritiquePanel'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

interface ComponentDetailProps {
  component: ComponentWithScore & { critique?: string; improved_html?: string; component_html?: string }
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border-subtle last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      {children}
    </div>
  )
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100
  return (
    <div className="py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="font-mono text-sm font-medium text-text-primary">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-score-high transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

type Tab = 'original' | 'critique' | 'improved'

export default function ComponentDetail({ component: c }: ComponentDetailProps) {
  const [tab, setTab] = useState<Tab>('original')
  const score = c.score?.total ?? c.total
  const visual = c.score?.visual_score ?? c.visual_score
  const alignment = c.score?.alignment_score ?? c.alignment_score
  const interactivity = c.score?.interactivity_score ?? c.interactivity_score

  const tabs: { key: Tab; label: string }[] = [
    { key: 'original', label: 'Original' },
    { key: 'critique', label: 'Critique' },
    { key: 'improved', label: 'Improved' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 component-detail-layout">
      <div className="lg:col-span-3 space-y-4">
        {/* Tab switcher */}
        <div className="flex items-center" style={{ gap: 2, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
              style={{
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'original' && (
          <div>
            {c.component_html ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                    </div>
                    <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>component.html</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#22c55e' }}>Qwen3.6-27B · T={c.temperature}</span>
                </div>
                <iframe
                  srcDoc={c.component_html}
                  title="Original component"
                  className="w-full border-0"
                  style={{ height: 560, background: '#fff' }}
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={`/screenshots/${c.id}-desktop.webp`}
                  alt={c.prompt}
                  className="w-full"
                  style={{ background: 'var(--bg-secondary)' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>
        )}

        {tab === 'critique' && (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                </div>
                <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>critique.md</span>
              </div>
              <span style={{ fontSize: 11, color: '#22c55e' }}>GPT-5.4 Design Review</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {c.critique ? (
                <CritiquePanel critique={c.critique} />
              ) : (
                <p className="text-text-muted" style={{ fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
                  Critique not available
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'improved' && (
          <div>
            {c.improved_html ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                    </div>
                    <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>improved.html</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#22c55e' }}>Rewritten by GPT-5.4</span>
                </div>
                <iframe
                  srcDoc={c.improved_html}
                  title="Improved by GPT-5.4"
                  className="w-full border-0"
                  style={{ height: 560, background: '#fff' }}
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: 300 }}>
                <p className="text-text-muted" style={{ fontSize: 14 }}>
                  Improved version not available for this component
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-4">
        {/* Prompt */}
        <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 16px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
            <span className="section-label">Prompt</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>{c.id}</span>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-text-primary" style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              {c.prompt}
            </p>
          </div>
          <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
            <span className="text-text-muted" style={{ fontSize: 11 }}>Qwen3.6-27B</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>T={c.temperature}</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>{c.run}</span>
          </div>
        </div>

        {/* Score */}
        <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <span className="section-label">Score</span>
            {score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-text-primary" style={{ fontSize: 20, fontWeight: 700 }}>{score}</span>
                <span className="text-text-muted" style={{ fontSize: 13 }}>/9</span>
                <Badge variant={scoreVariant(score)}>{score >= 7 ? 'High' : score >= 5 ? 'Mid' : 'Low'}</Badge>
              </div>
            )}
          </div>
          {visual !== undefined && <ScoreBar label="Visual" value={visual} max={3} />}
          {alignment !== undefined && <ScoreBar label="Alignment" value={alignment} max={3} />}
          {interactivity !== undefined && <ScoreBar label="Interactivity" value={interactivity} max={3} />}
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
          <span className="section-label block" style={{ marginBottom: 12 }}>Metadata</span>
          <MetaRow label="Category"><Badge>{c.category}</Badge></MetaRow>
          <MetaRow label="Theme"><Badge>{c.theme}</Badge></MetaRow>
          <MetaRow label="Temperature"><span className="font-mono text-sm text-text-primary">{c.temperature}</span></MetaRow>
          <MetaRow label="Run"><span className="font-mono text-sm text-text-primary">{c.run}</span></MetaRow>
        </div>
      </div>
    </div>
  )
}
