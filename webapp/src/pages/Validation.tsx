import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'
import CritiquePanel from '@/components/CritiquePanel'

function StatCard({ label, value, suffix, variant }: { label: string; value: string; suffix?: string; variant?: 'default' | 'positive' | 'negative' }) {
  const color = variant === 'positive' ? 'text-score-high' : variant === 'negative' ? 'text-score-low' : 'text-text-primary'
  return (
    <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 24px' }}>
      <span className="section-label block" style={{ marginBottom: 10 }}>{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono ${color}`} style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        {suffix && <span className="text-text-muted" style={{ fontSize: 14 }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function Validation() {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [critiqueTab, setCritiqueTab] = useState<'fine_tuned' | 'base'>('fine_tuned')

  useEffect(() => {
    getValidationResults()
      .then(setResults)
      .finally(() => setLoading(false))
  }, [])

  const avg = (fn: (r: ValidationResult) => number) =>
    results.length > 0 ? results.reduce((s, r) => s + fn(r), 0) / results.length : 0

  const avgBase = avg(r => r.base_score)
  const avgFT = avg(r => r.fine_tuned_score)
  const avgDelta = avg(r => r.delta)
  const improved = results.filter(r => r.delta > 0).length
  const total = results.length

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-24 mt-4" />
        <Shimmer className="h-64 mt-4" />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span className="section-label block" style={{ marginBottom: 8 }}>Validation</span>
        <h1 className="text-text-primary" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
          Head-to-Head Comparison
        </h1>
        <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8, maxWidth: 560 }}>
          Same {total} components critiqued by both base Qwen3-VL-8B and the fine-tuned
          Frontend Design Expert. GPT-5.4 scored each critique for specificity,
          measurements, and actionable feedback.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12, marginBottom: 32 }}>
        <StatCard label="Base Model" value={avgBase.toFixed(1)} suffix="/10" />
        <StatCard label="Fine-tuned" value={avgFT.toFixed(1)} suffix="/10" />
        <StatCard
          label="Avg Delta"
          value={`${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(1)}`}
          variant={avgDelta >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Improved"
          value={`${improved}/${total}`}
          variant={improved > total / 2 ? 'positive' : 'negative'}
        />
      </div>

      {/* Results */}
      <div style={{ marginBottom: 16 }}>
        <span className="section-label block" style={{ marginBottom: 12 }}>Results by Component</span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table header */}
        <div className="bg-bg-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 70px', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-label">Component</span>
          <span className="section-label text-center">Category</span>
          <span className="section-label text-center">Base</span>
          <span className="section-label text-center">FT 8B</span>
          <span className="section-label text-right">Delta</span>
        </div>

        {/* Rows */}
        {results.map((r, i) => {
          const isExpanded = expandedId === r.id
          return (
            <div key={r.id}>
              <div
                onClick={() => {
                  setExpandedId(isExpanded ? null : r.id)
                  setCritiqueTab('fine_tuned')
                }}
                className="cursor-pointer transition-colors duration-100"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 80px 80px 70px',
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom: isExpanded ? 'none' : '1px solid var(--border-subtle)',
                  background: isExpanded ? 'var(--bg-secondary)' : i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-card)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-text-muted" style={{ fontSize: 11, width: 12, textAlign: 'center' }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                  <span className="font-mono text-text-primary" style={{ fontSize: 13 }}>{r.id}</span>
                </div>
                <div className="text-center">
                  <Badge>{r.category}</Badge>
                </div>
                <div className="text-center">
                  <span className="font-mono text-text-secondary" style={{ fontSize: 13 }}>{r.base_score}</span>
                </div>
                <div className="text-center">
                  <span className={`font-mono font-semibold`} style={{ fontSize: 13, color: r.fine_tuned_score >= 7 ? 'var(--score-high)' : r.fine_tuned_score >= 5 ? 'var(--score-mid)' : 'var(--score-low)' }}>
                    {r.fine_tuned_score}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${r.delta >= 0 ? 'text-score-high' : 'text-score-low'}`} style={{ fontSize: 13 }}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Expanded critique comparison */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  {/* Critique tab switcher */}
                  <div className="flex items-center" style={{ gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                    {[
                      { key: 'fine_tuned' as const, label: 'Fine-tuned Critique', score: r.fine_tuned_score },
                      { key: 'base' as const, label: 'Base Critique', score: r.base_score },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={e => { e.stopPropagation(); setCritiqueTab(t.key) }}
                        className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
                        style={{
                          padding: '8px 14px',
                          fontSize: 13,
                          fontWeight: critiqueTab === t.key ? 600 : 400,
                          color: critiqueTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                          borderBottom: critiqueTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                          marginBottom: -1,
                        }}
                      >
                        {t.label}
                        <span className="font-mono ml-2" style={{ fontSize: 11, color: t.score >= 7 ? 'var(--score-high)' : t.score >= 5 ? 'var(--score-mid)' : 'var(--score-low)' }}>
                          {t.score}/10
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Critique content */}
                  <div className="rounded-lg border border-border" style={{ padding: '20px 24px', background: 'var(--bg-primary)' }}>
                    {critiqueTab === 'fine_tuned' && r.fine_tuned_critique ? (
                      <CritiquePanel critique={r.fine_tuned_critique} />
                    ) : critiqueTab === 'base' && r.base_critique ? (
                      <CritiquePanel critique={r.base_critique} />
                    ) : (
                      <p className="text-text-muted" style={{ fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                        Critique not available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
