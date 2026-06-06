import { useState, useEffect, useRef, useCallback } from 'react'
import type { ComponentWithScore } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import CritiquePanel from '@/components/CritiquePanel'
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

interface ComponentDetailProps {
  component: ComponentWithScore & { critique?: string; improved_html?: string; component_html?: string; pi_harness_html?: string }
  neighbors?: { prev: string | null; next: string | null }
  onNavigate?: (id: string) => void
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  mode?: 'training' | 'pi-harness'
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

type Tab = 'original' | 'critique' | 'improved' | 'pi-harness'

function ResizableIframe({ srcDoc, title, expanded, label, attribution }: {
  srcDoc: string
  title: string
  expanded: boolean
  label: string
  attribution: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = useState(false)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const startRef = useRef<{ x: number; y: number; w: number; h: number; corner: string }>({ x: 0, y: 0, w: 0, h: 0, corner: '' })

  const onMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    startRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, corner }
    setResizing(true)
  }, [])

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      const s = startRef.current
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      let w = s.w
      let h = s.h
      if (s.corner.includes('r')) w = Math.max(320, s.w + dx)
      if (s.corner.includes('l')) w = Math.max(320, s.w - dx)
      if (s.corner.includes('b')) h = Math.max(200, s.h + dy)
      setSize({ w, h })
    }
    const onUp = () => setResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizing])

  useEffect(() => { if (expanded) setSize(null) }, [expanded])

  const iframeStyle: React.CSSProperties = expanded
    ? { height: size?.h ?? 'calc(100vh - 140px)', width: '100%', background: '#fff' }
    : { height: size?.h ?? 560, width: size?.w ?? '100%', maxWidth: '100%', background: '#fff' }

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-visible border border-border"
      style={{ position: 'relative', width: expanded ? '100%' : (size?.w ?? '100%'), maxWidth: '100%' }}
    >
      <div className="flex items-center justify-between bg-bg-secondary" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
          </div>
          <span className="font-mono text-text-muted" style={{ fontSize: 11 }}>{label}</span>
        </div>
        {attribution}
      </div>
      <iframe
        srcDoc={srcDoc}
        title={title}
        className="border-0 block"
        style={iframeStyle}
        sandbox="allow-scripts"
      />
      {!expanded && (
        <>
          <div onMouseDown={e => onMouseDown(e, 'br')} style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: 'absolute', bottom: 2, right: 2 }}>
              <line x1="14" y1="6" x2="6" y2="14" stroke="var(--text-muted)" strokeWidth="1" strokeOpacity="0.5" />
              <line x1="14" y1="10" x2="10" y2="14" stroke="var(--text-muted)" strokeWidth="1" strokeOpacity="0.5" />
            </svg>
          </div>
          <div onMouseDown={e => onMouseDown(e, 'b')} style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 6, cursor: 'ns-resize', zIndex: 10 }} />
          <div onMouseDown={e => onMouseDown(e, 'r')} style={{ position: 'absolute', top: 40, right: 0, bottom: 16, width: 6, cursor: 'ew-resize', zIndex: 10 }} />
        </>
      )}
      {resizing && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: startRef.current.corner === 'b' ? 'ns-resize' : startRef.current.corner === 'r' ? 'ew-resize' : 'nwse-resize' }} />}
    </div>
  )
}

function TabButton({ tab, current, available, onClick }: { tab: Tab; current: Tab; available: boolean; onClick: () => void; label?: string }) {
  const isActive = current === tab
  const baseColor = !available
    ? isActive ? 'var(--text-muted)' : 'color-mix(in srgb, var(--text-muted) 50%, transparent)'
    : isActive ? '#93b4ff' : '#6b8acd'
  return (
    <button
      onClick={onClick}
      className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
      style={{
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: isActive && available ? 600 : 400,
        color: baseColor,
        borderBottom: isActive
          ? available ? '2px solid var(--accent)' : '2px dashed var(--text-muted)'
          : '2px solid transparent',
        marginBottom: -1,
      }}
    >
      {tab === 'original' ? (
        <span style={{
          background: 'linear-gradient(90deg, #f97316 0%, #f97316 20%, #2dd4bf 80%, #2dd4bf 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700,
        }}>Qwen3.6-27B-Q5</span>
      ) : tab === 'critique' ? 'Critique'
        : tab === 'pi-harness' ? <span style={{ color: '#93b4ff', fontWeight: 700 }}>Pi Harness</span>
        : 'GPT-5.4'}
    </button>
  )
}

function NavArrow({ targetId, direction, onNavigate, size: sz = 28 }: {
  targetId: string | null; direction: 'prev' | 'next'; onNavigate?: (id: string) => void; size?: number
}) {
  return (
    <button
      onClick={() => targetId && onNavigate?.(targetId)}
      disabled={!targetId}
      className="flex items-center justify-center cursor-pointer disabled:cursor-default disabled:opacity-25 text-text-muted hover:text-text-primary hover:bg-bg-secondary bg-transparent transition-colors duration-150"
      style={{ width: sz, height: sz, borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
      aria-label={direction === 'prev' ? 'Previous component' : 'Next component'}
    >
      {direction === 'prev' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
    </button>
  )
}

export default function ComponentDetail({ component: c, neighbors, onNavigate, expanded: expandedProp = false, onExpandedChange, mode = 'training' }: ComponentDetailProps) {
  const [tab, setTab] = useState<Tab>('original')
  const expanded = expandedProp
  const setExpanded = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(expanded) : v
    onExpandedChange?.(next)
  }
  const score = c.score?.total ?? c.total
  const visual = c.score?.visual_score ?? c.visual_score
  const alignment = c.score?.alignment_score ?? c.alignment_score
  const interactivity = c.score?.interactivity_score ?? c.interactivity_score

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const tabs: { key: Tab; available: boolean }[] = mode === 'pi-harness'
    ? [
        { key: 'original', available: true },
        { key: 'improved', available: !!c.improved_html },
        { key: 'pi-harness', available: !!c.pi_harness_html },
      ]
    : [
        { key: 'original', available: true },
        { key: 'critique', available: !!c.critique },
        { key: 'improved', available: !!c.improved_html },
      ]

  const iframeTab = tab === 'original' || tab === 'improved' || tab === 'pi-harness'
  const showExpandButton = iframeTab
  const hasContent = tab === 'original' ? !!c.component_html
    : tab === 'improved' ? !!c.improved_html
    : tab === 'pi-harness' ? !!c.pi_harness_html
    : false

  const expandedContent = expanded ? (
    <div
      style={{
        position: 'fixed',
        top: 100,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Expanded toolbar: centered tabs + nav, exit right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '8px 0', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div />
          <div className="flex items-center" style={{ gap: 2 }}>
            {tabs.map(t => (
              <TabButton key={t.key} tab={t.key} current={tab} available={t.available} onClick={() => setTab(t.key)} />
            ))}
            {neighbors && onNavigate && (
              <div className="flex items-center gap-1" style={{ marginLeft: 8 }}>
                <NavArrow targetId={neighbors.prev} direction="prev" onNavigate={onNavigate} size={26} />
                <NavArrow targetId={neighbors.next} direction="next" onNavigate={onNavigate} size={26} />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setExpanded(false)}
              className="cursor-pointer bg-transparent border-0 text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center gap-1.5"
              style={{ fontSize: 12, padding: '6px 8px' }}
            >
              <Minimize2 size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Expanded content */}
        <div style={{ flex: 1, minHeight: 0, paddingTop: 12 }}>
          {iframeTab && hasContent ? (
            <div className="rounded-lg overflow-hidden border border-border" style={{ height: '100%' }}>
              <iframe
                srcDoc={tab === 'original' ? c.component_html! : tab === 'pi-harness' ? c.pi_harness_html! : c.improved_html!}
                title={tab === 'original' ? 'Original component' : tab === 'pi-harness' ? 'Pi Harness output' : 'Improved by GPT-5.4'}
                className="w-full h-full border-0 block"
                style={{ background: '#fff' }}
                sandbox="allow-scripts"
              />
            </div>
          ) : tab === 'critique' ? (
            <div className="rounded-lg border border-border overflow-auto" style={{ height: '100%' }}>
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
          ) : (
            <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: '100%' }}>
              <p className="text-text-muted" style={{ fontSize: 14 }}>
                Content not available for this component
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
    {expandedContent}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 component-detail-layout">
      <div className="lg:col-span-3 space-y-4">
        {/* Tab switcher */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          <div className="flex items-center" style={{ gap: 2 }}>
            {tabs.map(t => (
              <TabButton key={t.key} tab={t.key} current={tab} available={t.available} onClick={() => setTab(t.key)} />
            ))}
            {neighbors && onNavigate && (
              <div className="flex items-center gap-1" style={{ marginLeft: 8 }}>
                <NavArrow targetId={neighbors.prev} direction="prev" onNavigate={onNavigate} size={26} />
                <NavArrow targetId={neighbors.next} direction="next" onNavigate={onNavigate} size={26} />
              </div>
            )}
          </div>
          {showExpandButton && hasContent && (
            <button
              onClick={() => setExpanded(x => !x)}
              className="cursor-pointer bg-transparent border-0 text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center gap-1.5"
              style={{ fontSize: 12, padding: '6px 8px', marginBottom: -1 }}
              aria-label={expanded ? 'Collapse preview' : 'Expand preview'}
            >
              {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{expanded ? 'Collapse' : 'Expand'}</span>
            </button>
          )}
        </div>

        {/* Tab content */}
        {tab === 'original' && (
          <div>
            {c.component_html ? (
              <ResizableIframe
                srcDoc={c.component_html}
                title="Original component"
                expanded={expanded}
                label="component.html"
                attribution={
                  <span style={{ fontSize: 11, color: '#22c55e' }}><span style={{ background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B</span> · T={c.temperature}</span>
                }
              />
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
              <ResizableIframe
                srcDoc={c.improved_html}
                title="Improved by GPT-5.4"
                expanded={expanded}
                label="improved.html"
                attribution={
                  <span style={{ fontSize: 11, color: '#22c55e' }}>Rewritten by GPT-5.4</span>
                }
              />
            ) : (
              <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: 300 }}>
                <p className="text-text-muted" style={{ fontSize: 14 }}>
                  Improved version not available for this component
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'pi-harness' && (
          <div>
            {c.pi_harness_html ? (
              <ResizableIframe
                srcDoc={c.pi_harness_html}
                title="Pi Harness output"
                expanded={expanded}
                label="pi-harness.html"
                attribution={
                  <span style={{ fontSize: 11, color: '#93b4ff', fontWeight: 600 }}>Pi Harness V4.2</span>
                }
              />
            ) : (
              <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: 300 }}>
                <p className="text-text-muted" style={{ fontSize: 14 }}>
                  Pi Harness output not available for this component
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
            <span style={{ fontSize: 11, background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>T={c.temperature}</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>{c.run}</span>
          </div>
        </div>

        {/* Score */}
        <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <span className="section-label" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Score</span>
              <span style={{ fontSize: 12, marginLeft: 6, color: 'var(--text-secondary)' }}>GPT-5.4 eval</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Scored by: Claude Opus 4.6</span>
            </div>
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
    </>
  )
}
