import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'
import CritiquePanel from '@/components/CritiquePanel'

function StatCard({ label, sublabel, value, suffix, variant }: { label: string; sublabel: string; value: string; suffix?: string; variant?: 'default' | 'positive' | 'negative' }) {
  const color = variant === 'positive' ? 'text-score-high' : variant === 'negative' ? 'text-score-low' : 'text-text-primary'
  return (
    <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 24px' }}>
      <span className="section-label block" style={{ marginBottom: 2 }}>{label}</span>
      <span className="text-text-muted block" style={{ fontSize: 11, marginBottom: 10 }}>{sublabel}</span>
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
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          VALIDATION · FINE-TUNED MODEL
        </div>
        <h1 className="text-text-primary" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Does fine-tuning actually improve output?
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>
          Base Qwen3-VL-8B vs Fine-Tuned — same 10 prompts, same hardware, scored by GPT-5.4
        </h2>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { icon: '⚡', text: 'Same 10 prompts fed to both models independently' },
            { icon: '🎯', text: 'GPT-5.4 scored each output — visual hierarchy, spacing, color fidelity, prompt adherence' },
            { icon: '🔬', text: 'Same critique rubric used during training — true apples-to-apples comparison' },
            { icon: '💻', text: 'Same hardware — RTX 3080 Ti 12GB, Q4_K_M quantization' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <span style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid" style={{ gap: 12, marginBottom: 32 }}>
        <StatCard label="BASE MODEL" sublabel="First-pass avg" value="4.5" suffix="/10" />
        <StatCard label="FINE-TUNED 8B" sublabel="First-pass avg" value="5.5" suffix="/10" />
        <StatCard
          label="IMPROVEMENT"
          sublabel="Design delta"
          value="+1.0"
          suffix="per component"
          variant="positive"
        />
        <StatCard
          label="COMPONENTS TESTED"
          sublabel="Head-to-head"
          value="10"
          suffix="same prompts"
        />
      </div>

      {/* Results */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'default', marginBottom: 12 }}>
          <span>↓</span>
          <span>Click any row to see side-by-side screenshots and critique</span>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table header */}
        <div className="bg-bg-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 70px', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-label">Prompt</span>
          <span className="section-label text-center">Category</span>
          <span className="section-label text-center">Base 8B</span>
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
                  <div style={{ minWidth: 0 }}>
                    <div className="font-mono text-text-muted" style={{ fontSize: 11, marginBottom: 4 }}>
                      {r.component_id || r.id}
                    </div>
                    <div className="prompt-text" style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.prompt || r.id}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge>{r.category}</Badge>
                </div>
                <div className="text-center">
                  <span className="font-mono text-text-secondary" style={{ fontSize: 13 }}>{r.base_score}</span>
                </div>
                <div className="text-center">
                  <span className="font-mono font-semibold" style={{ fontSize: 13, color: r.fine_tuned_score >= 7 ? 'var(--score-high)' : r.fine_tuned_score >= 5 ? 'var(--score-mid)' : 'var(--score-low)' }}>
                    {r.fine_tuned_score}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${r.delta >= 0 ? 'text-score-high' : 'text-score-low'}`} style={{ fontSize: 13 }}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Expanded: images + critiques */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  {/* Side-by-side screenshots */}
                  <div className="validation-expanded-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Base Qwen3-VL-8B
                        <span style={{ padding: '2px 8px', background: 'var(--bg-primary)', borderRadius: 4, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {r.base_score}/10
                        </span>
                      </div>
                      <img
                        src={`/screenshots/validation/base/${r.id}-desktop.webp`}
                        alt="Base model output"
                        className="w-full"
                        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Fine-Tuned 8B
                        <span style={{
                          padding: '2px 8px',
                          background: r.delta > 0 ? 'rgba(74, 222, 128, 0.1)' : 'var(--bg-primary)',
                          border: r.delta > 0 ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: r.delta > 0 ? 'var(--score-high)' : r.delta < 0 ? 'var(--score-low)' : 'var(--text-secondary)',
                        }}>
                          {r.fine_tuned_score}/10
                          {r.delta !== 0 && (
                            <span style={{ marginLeft: 4 }}>
                              {r.delta > 0 ? '+' : ''}{r.delta.toFixed(1)}
                            </span>
                          )}
                        </span>
                      </div>
                      <img
                        src={`/screenshots/validation/fine-tuned/${r.id}-desktop.webp`}
                        alt="Fine-tuned model output"
                        className="w-full"
                        style={{ borderRadius: 'var(--radius)', border: r.delta > 0 ? '1px solid var(--score-high)' : '1px solid var(--border)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  </div>

                  {/* Critique tabs below images */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
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
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Regression note */}
      <div style={{
        marginTop: 24,
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        fontSize: 13,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note on component-021 (navbar, -1.0):</span>{' '}
        The fine-tuned model generated a more verbose sidebar navbar with richer CSS but subtler active states.
        The base model's simpler orange left-rail indicator scored marginally higher under strict contrast criteria.
        Both models score poorly on navbars (3-4/10) — a known training gap.
      </div>

      {/* Self-improvement results */}
      <div style={{ marginTop: 48 }}>
        <span className="section-label block" style={{ marginBottom: 8 }}>SELF-IMPROVEMENT LOOP</span>
        <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Can the model critique and improve its own output?
        </h2>
        <p className="text-text-secondary" style={{ fontSize: 14, marginBottom: 24, maxWidth: 600, lineHeight: 1.6 }}>
          Each model was asked to critique its own generated screenshot, then rewrite the HTML
          to fix the issues it identified. Neither model reliably self-improves at 8B size —
          but the fine-tuned model degrades less.
        </p>

        <div className="rounded-lg border border-border overflow-hidden">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-bg-secondary" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="section-label text-left" style={{ padding: '10px 16px' }}>Condition</th>
                <th className="section-label text-right" style={{ padding: '10px 16px' }}>Avg Score</th>
                <th className="section-label text-right" style={{ padding: '10px 16px' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { condition: 'Base Qwen3-VL-8B — first pass', score: '4.50', delta: '—', deltaColor: 'var(--text-muted)', note: '' },
                { condition: 'Base Qwen3-VL-8B — after self-critique', score: '4.00', delta: '-0.50', deltaColor: 'var(--score-low)', note: 'gets worse' },
                { condition: 'Fine-tuned 8B — first pass', score: '5.50', delta: '+1.00 vs base', deltaColor: 'var(--score-high)', note: '' },
                { condition: 'Fine-tuned 8B — after self-critique', score: '5.15', delta: '-0.35', deltaColor: 'var(--score-mid)', note: 'degrades less' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="text-text-primary" style={{ padding: '12px 16px', fontSize: 14 }}>
                    {row.condition}
                    {row.note && (
                      <span className="text-text-muted" style={{ marginLeft: 8, fontSize: 11 }}>
                        — {row.note}
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-text-primary" style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
                    {row.score}/10
                  </td>
                  <td className="font-mono" style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, textAlign: 'right', color: row.deltaColor }}>
                    {row.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-text-muted" style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>
          The base model's self-critique loop makes designs worse — its feedback is too generic to guide meaningful improvements.
          The fine-tuned model was trained on 500 expert critique+improvement pairs, so it starts higher and handles the loop better.
          Neither reaches production quality on first pass — the training data used GPT-5.4's improvement step to reach 8.6/9.
        </p>
      </div>
    </div>
  )
}
