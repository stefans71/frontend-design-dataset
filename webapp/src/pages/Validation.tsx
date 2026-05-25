import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Shimmer from '@/components/ui/Shimmer'
import { Zap, Target, Microscope, Monitor, ChevronDown } from 'lucide-react'
import CritiquePanel from '@/components/CritiquePanel'

function StatCard({ label, sublabel, value, suffix, variant }: { label: string; sublabel: string; value: string; suffix?: string; variant?: 'default' | 'positive' | 'negative' }) {
  const color = variant === 'positive' ? 'text-score-high' : variant === 'negative' ? 'text-score-low' : 'text-text-primary'
  return (
    <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 24px' }}>
      <span className="block text-text-secondary" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 2 }}>{label}</span>
      <span className="text-text-secondary block" style={{ fontSize: 11, marginBottom: 10 }}>{sublabel}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono ${color}`} style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{value}</span>
        {suffix && <span className="text-text-secondary" style={{ fontSize: 14 }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function Validation() {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorRow, setAnchorRow] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [critiqueTab, setCritiqueTab] = useState<'fine_tuned' | 'base'>('fine_tuned')
  const [critiqueOpen, setCritiqueOpen] = useState(false)

  const scrollToRow = (i: number) => {
    setTimeout(() => {
      const el = document.querySelector(`[data-row="${i}"]`)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 50)
  }
  const openRow = (i: number) => { setAnchorRow(i); setActiveIndex(i); setCritiqueTab('fine_tuned'); setCritiqueOpen(false) }
  const closeRow = () => { setAnchorRow(null); setActiveIndex(null) }
  const handlePrev = () => { if (activeIndex !== null && activeIndex > 0) { const n = activeIndex - 1; setActiveIndex(n); setAnchorRow(n); setCritiqueTab('fine_tuned'); setCritiqueOpen(false); scrollToRow(n) } }
  const handleNext = () => { if (activeIndex !== null && activeIndex < results.length - 1) { const n = activeIndex + 1; setActiveIndex(n); setAnchorRow(n); setCritiqueTab('fine_tuned'); setCritiqueOpen(false); scrollToRow(n) } }

  useEffect(() => {
    getValidationResults()
      .then(setResults)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') closeRow()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, results.length])

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
          <span style={{
            background: 'linear-gradient(90deg, #f97316 0%, #f97316 20%, #2dd4bf 80%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', fontWeight: 600,
          }}>Qwen3-VL-8B</span>
          {' '}Base vs{' '}
          <span style={{
            background: 'linear-gradient(90deg, #f97316 0%, #f97316 20%, #2dd4bf 80%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', fontWeight: 600,
          }}>Qwen3-VL-8B</span>
          {' '}Fine-Tuned — same 10 prompts, same hardware, scored by GPT-5.4
        </h2>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { Icon: Zap, text: 'Same 10 prompts fed to both models independently' },
            { Icon: Target, text: 'GPT-5.4 scored each output — visual hierarchy, spacing, color fidelity, prompt adherence' },
            { Icon: Microscope, text: 'Same critique rubric used during training — true apples-to-apples comparison' },
            { Icon: Monitor, text: 'Same hardware — RTX 3080 Ti 12GB, Q4_K_M quantization' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <item.Icon size={14} style={{ marginTop: 3, flexShrink: 0, color: 'var(--text-muted)' }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid" style={{ gap: 12, marginBottom: 32 }}>
        <StatCard label="BASE MODEL" sublabel="First-pass avg" value="4.5" suffix="/10" variant="negative" />
        <StatCard label="FINE-TUNED 8B" sublabel="First-pass avg" value="5.5" suffix="/10" variant="positive" />
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

      <div className="rounded-lg border border-border" style={{ overflow: 'clip' }}>
        {/* Table header — swaps to nav bar when expanded */}
        {activeIndex !== null ? (() => {
          const ar = results[activeIndex]
          return (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-secondary)', position: 'sticky', top: 60, zIndex: 10,
              gap: 12, flexWrap: 'wrap' as const,
            }}>
              {/* Left — component info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {ar.component_id || ar.id}
                </span>
                <span className="validation-nav-prompt" style={{
                  fontSize: 13, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>
                  {ar.prompt || ar.id}
                </span>
              </div>

              {/* Right — scores + grouped nav buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div className="validation-nav-scores" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)' }}>
                    {ar.category}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {ar.base_score}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--score-mid)' }}>
                    {ar.fine_tuned_score}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: ar.delta > 0 ? 'var(--score-high)' : ar.delta < 0 ? 'var(--score-low)' : 'var(--text-muted)' }}>
                    {ar.delta > 0 ? '+' : ''}{ar.delta.toFixed(1)}
                  </span>
                </div>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {activeIndex + 1}/{results.length}
                </span>

                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <button
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    style={{
                      padding: '6px 12px', background: 'transparent', border: 'none',
                      borderRight: '1px solid var(--border)',
                      color: activeIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: 14, opacity: activeIndex === 0 ? 0.4 : 1,
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => { if (activeIndex > 0) e.currentTarget.style.background = 'var(--bg-card)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={activeIndex === results.length - 1}
                    style={{
                      padding: '6px 12px', background: 'transparent', border: 'none',
                      color: activeIndex === results.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: activeIndex === results.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: 14, opacity: activeIndex === results.length - 1 ? 0.4 : 1,
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => { if (activeIndex < results.length - 1) e.currentTarget.style.background = 'var(--bg-card)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    →
                  </button>
                </div>

                <button
                  onClick={closeRow}
                  style={{
                    padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: 14, lineHeight: 1, transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })() : (
          <div className="bg-bg-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 70px', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-label">Prompt</span>
            <span className="section-label text-center">Category</span>
            <span className="section-label text-center">Base 8B</span>
            <span className="section-label text-center">FT 8B</span>
            <span className="section-label text-right">Delta</span>
          </div>
        )}

        {/* Rows */}
        {results.map((r, i) => {
          const isAnchor = anchorRow === i
          const isActive = activeIndex === i
          return (
            <div key={r.id} data-row={i}>
              <div
                onClick={() => isAnchor ? closeRow() : openRow(i)}
                className="cursor-pointer transition-colors duration-100"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 80px 80px 70px',
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom: isAnchor ? 'none' : '1px solid var(--border-subtle)',
                  background: isActive ? 'var(--bg-elevated)' : isAnchor ? 'var(--bg-secondary)' : i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                }}
                onMouseEnter={e => { if (!isAnchor) e.currentTarget.style.background = 'var(--bg-secondary)' }}
                onMouseLeave={e => { if (!isAnchor && !isActive) e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-card)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-text-muted" style={{ fontSize: 11, width: 12, textAlign: 'center' }}>
                    {isAnchor ? '▾' : '▸'}
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

              {/* Expanded panel — anchored to this row, shows results[activeIndex] */}
              {isAnchor && activeIndex !== null && (() => {
                const ar = results[activeIndex]
                return (
                <div style={{ padding: '16px 20px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  {/* Side-by-side screenshots */}
                  <div className="validation-expanded-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Base Qwen3-VL-8B
                        <span style={{ padding: '2px 8px', background: 'var(--bg-primary)', borderRadius: 4, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {ar.base_score}/10
                        </span>
                      </div>
                      <img
                        src={`/screenshots/validation/base/${ar.id}-desktop.webp`}
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
                          background: ar.delta > 0 ? 'rgba(74, 222, 128, 0.1)' : 'var(--bg-primary)',
                          border: ar.delta > 0 ? '1px solid rgba(74, 222, 128, 0.3)' : 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: ar.delta > 0 ? 'var(--score-high)' : ar.delta < 0 ? 'var(--score-low)' : 'var(--text-secondary)',
                        }}>
                          {ar.fine_tuned_score}/10
                          {ar.delta !== 0 && (
                            <span style={{ marginLeft: 4 }}>
                              {ar.delta > 0 ? '+' : ''}{ar.delta.toFixed(1)}
                            </span>
                          )}
                        </span>
                      </div>
                      <img
                        src={`/screenshots/validation/fine-tuned/${ar.id}-desktop.webp`}
                        alt="Fine-tuned model output"
                        className="w-full"
                        style={{ borderRadius: 'var(--radius)', border: ar.delta > 0 ? '1px solid var(--score-high)' : '1px solid var(--border)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  </div>

                  {/* Critique pill tabs */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{
                      display: 'flex', gap: 4, padding: 4,
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius)',
                      width: 'fit-content', marginBottom: 16,
                      border: '1px solid var(--border)',
                    }}>
                      {[
                        { key: 'fine_tuned' as const, label: 'Fine-tuned Critique', score: ar.fine_tuned_score },
                        { key: 'base' as const, label: 'Base Critique', score: ar.base_score },
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={e => { e.stopPropagation(); if (critiqueTab === t.key && critiqueOpen) { setCritiqueOpen(false) } else { setCritiqueTab(t.key); setCritiqueOpen(true) } }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'calc(var(--radius) - 2px)',
                            border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 500,
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'all 150ms',
                            background: critiqueTab === t.key ? 'var(--bg-card)' : 'transparent',
                            color: critiqueTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: critiqueTab === t.key ? 'var(--shadow-sm)' : 'none',
                          }}
                        >
                          <ChevronDown size={12} style={{
                            transition: 'transform 200ms',
                            transform: critiqueTab === t.key && critiqueOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: critiqueTab === t.key ? 'var(--text-secondary)' : 'var(--text-muted)',
                          }} />
                          {t.label}
                          <span style={{
                            padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                            background: critiqueTab === t.key
                              ? t.key === 'fine_tuned' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(156, 163, 175, 0.15)'
                              : 'transparent',
                            color: t.key === 'fine_tuned' ? 'var(--score-high)' : 'var(--text-muted)',
                            border: `1px solid ${t.key === 'fine_tuned' ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                          }}>
                            {t.score}/10
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className={`expand-content ${critiqueOpen ? 'open' : ''}`}>
                      <div>
                        <div className="rounded-lg border border-border" style={{ padding: '20px 24px', background: 'var(--bg-primary)' }}>
                          {critiqueTab === 'fine_tuned' && ar.fine_tuned_critique ? (
                            <CritiquePanel critique={ar.fine_tuned_critique} />
                          ) : critiqueTab === 'base' && ar.base_critique ? (
                            <CritiquePanel critique={ar.base_critique} />
                          ) : (
                            <p className="text-text-muted" style={{ fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                              Critique not available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })()}
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
