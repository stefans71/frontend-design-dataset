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
  component: ComponentWithScore & {
    critique?: string; improved_html?: string; component_html?: string;
    pi_harness_html?: string; pi_harness_v45_html?: string;
    condition_g_html?: string; condition_f_html?: string; condition_d_html?: string; condition_e_html?: string;
    q5_html?: string; q8_va_html?: string; q8_vb_html?: string; q8_vc_html?: string;
    q5_score?: number; q8_va_score?: number; q8_vb_score?: number; q8_vc_score?: number;
    q8_va_critique?: string; q8_vb_critique?: string; q8_vc_critique?: string;
  }
  neighbors?: { prev: string | null; next: string | null }
  onNavigate?: (id: string) => void
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  mode?: 'training' | 'pi-harness' | 'html-compare' | 'qwen27b'
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

type Tab = 'original' | 'critique' | 'improved' | 'pi-harness' | 'pi-harness-v42c' | 'cond-g' | 'cond-f' | 'cond-d' | 'cond-e' | 'q5' | 'q8-va' | 'q8-vb' | 'q8-vc'

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
        : tab === 'pi-harness' ? <span style={{ color: '#93b4ff', fontWeight: 700 }}>Pi Harness V4.5</span>
        : tab === 'pi-harness-v42c' ? <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>V4.2C</span>
        : tab === 'cond-g' ? <span style={{ color: '#93b4ff', fontWeight: 700 }}>8B-VL-Base</span>
        : tab === 'cond-f' ? <span style={{ color: '#10b981', fontWeight: 700 }}>Fine Tuned 8B</span>
        : tab === 'cond-d' ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>Harness D</span>
        : tab === 'cond-e' ? <span style={{ color: '#a78bfa', fontWeight: 700 }}>Harness E</span>
        : tab === 'q5' ? <span style={{ color: '#f97316', fontWeight: 700 }}>Q5 T=0.5</span>
        : tab === 'q8-va' ? <span style={{ color: '#3b82f6', fontWeight: 700 }}>Q8 T=0.6</span>
        : tab === 'q8-vb' ? <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Q8 T=0.85</span>
        : tab === 'q8-vc' ? <span style={{ color: '#10b981', fontWeight: 700 }}>Q8 T=0.85 2p</span>
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

// 2x2 comparison panel for qwen27b expand mode
function ComparisonPanel({ label, color, html, onClick }: {
  label: string; color: string; html?: string; onClick: () => void
}) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-border"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        className="flex items-center justify-between bg-bg-secondary cursor-pointer"
        style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
        onClick={onClick}
      >
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
        <Maximize2 size={12} style={{ color: 'var(--text-muted)' }} />
      </div>
      {html ? (
        <iframe
          srcDoc={html}
          title={label}
          className="w-full border-0 block"
          style={{ flex: 1, minHeight: 0, background: '#fff' }}
          sandbox="allow-scripts"
        />
      ) : (
        <div className="flex items-center justify-center" style={{ flex: 1, color: 'var(--text-muted)', fontSize: 13 }}>
          Not available
        </div>
      )}
    </div>
  )
}

export default function ComponentDetail({ component: c, neighbors, onNavigate, expanded: expandedProp = false, onExpandedChange, mode = 'training' }: ComponentDetailProps) {
  const [tab, setTab] = useState<Tab>(mode === 'html-compare' ? 'cond-g' : mode === 'qwen27b' ? 'q5' : 'original')
  const expanded = expandedProp
  const setExpanded = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(expanded) : v
    onExpandedChange?.(next)
  }
  const score = c.score?.total ?? c.total
  const visual = c.score?.visual_score ?? c.visual_score
  const alignment = c.score?.alignment_score ?? c.alignment_score
  const interactivity = c.score?.interactivity_score ?? c.interactivity_score

  // State for qwen27b 2x2 grid expand
  const [expandedMode, setExpandedMode] = useState<'grid' | 'single'>('grid')
  const [focusedVariant, setFocusedVariant] = useState<'q5' | 'q8-va' | 'q8-vb' | 'q8-vc'>('q5')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'qwen27b' && expanded) {
          if (expandedMode === 'single') {
            setExpandedMode('grid')
          } else {
            setExpanded(false)
          }
        } else {
          setExpanded(false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, expandedMode, mode])

  const tabs: { key: Tab; available: boolean }[] = mode === 'qwen27b'
    ? [
        { key: 'q5', available: !!c.q5_html },
        { key: 'q8-va', available: !!c.q8_va_html },
        { key: 'q8-vb', available: !!c.q8_vb_html },
        { key: 'q8-vc', available: !!c.q8_vc_html },
      ]
    : mode === 'html-compare'
    ? [
        { key: 'cond-g', available: !!c.condition_g_html },
        { key: 'cond-f', available: !!c.condition_f_html },
        { key: 'cond-d', available: !!c.condition_d_html },
        { key: 'cond-e', available: !!c.condition_e_html },
      ]
    : mode === 'pi-harness'
    ? [
        { key: 'original', available: true },
        { key: 'improved', available: !!c.improved_html },
        { key: 'pi-harness', available: !!c.pi_harness_v45_html },
        { key: 'pi-harness-v42c', available: !!c.pi_harness_html },
      ]
    : [
        { key: 'original', available: true },
        { key: 'critique', available: !!c.critique },
        { key: 'improved', available: !!c.improved_html },
      ]

  const iframeTab = tab === 'original' || tab === 'improved' || tab === 'pi-harness' || tab === 'pi-harness-v42c' || tab === 'cond-g' || tab === 'cond-f' || tab === 'cond-d' || tab === 'cond-e' || tab === 'q5' || tab === 'q8-va' || tab === 'q8-vb' || tab === 'q8-vc'
  const showExpandButton = iframeTab
  const hasContent = tab === 'original' ? !!c.component_html
    : tab === 'improved' ? !!c.improved_html
    : tab === 'pi-harness' ? !!c.pi_harness_v45_html
    : tab === 'pi-harness-v42c' ? !!c.pi_harness_html
    : tab === 'cond-g' ? !!c.condition_g_html
    : tab === 'cond-f' ? !!c.condition_f_html
    : tab === 'cond-d' ? !!c.condition_d_html
    : tab === 'cond-e' ? !!c.condition_e_html
    : tab === 'q5' ? !!c.q5_html
    : tab === 'q8-va' ? !!c.q8_va_html
    : tab === 'q8-vb' ? !!c.q8_vb_html
    : tab === 'q8-vc' ? !!c.q8_vc_html
    : false

  // Helper to get srcDoc for a tab
  const getSrcDoc = (t: Tab): string | undefined => {
    switch (t) {
      case 'original': return c.component_html ?? undefined
      case 'improved': return c.improved_html ?? undefined
      case 'pi-harness': return c.pi_harness_v45_html ?? undefined
      case 'pi-harness-v42c': return c.pi_harness_html ?? undefined
      case 'cond-g': return c.condition_g_html ?? undefined
      case 'cond-f': return c.condition_f_html ?? undefined
      case 'cond-d': return c.condition_d_html ?? undefined
      case 'cond-e': return c.condition_e_html ?? undefined
      case 'q5': return c.q5_html ?? undefined
      case 'q8-va': return c.q8_va_html ?? undefined
      case 'q8-vb': return c.q8_vb_html ?? undefined
      case 'q8-vc': return c.q8_vc_html ?? undefined
      default: return undefined
    }
  }

  const getTabTitle = (t: Tab): string => {
    switch (t) {
      case 'original': return 'Original component'
      case 'improved': return 'Improved by GPT-5.4'
      case 'pi-harness': return 'Pi Harness V4.5'
      case 'pi-harness-v42c': return 'Pi Harness V4.2C'
      case 'cond-g': return '8B-VL-Base'
      case 'cond-f': return 'Fine Tuned 8B'
      case 'cond-d': return 'Harness D'
      case 'cond-e': return 'Harness E'
      case 'q5': return 'Q5_K_XL'
      case 'q8-va': return 'Q8 T=0.6'
      case 'q8-vb': return 'Q8 T=0.85'
      case 'q8-vc': return 'Q8 T=0.85 2p'
      default: return ''
    }
  }

  // Qwen27b grid variants config
  const qwen27bVariants: { key: 'q5' | 'q8-va' | 'q8-vb' | 'q8-vc'; label: string; color: string; html?: string }[] = [
    { key: 'q5', label: 'Q5_K_XL', color: '#f97316', html: c.q5_html ?? undefined },
    { key: 'q8-va', label: 'Q8 T=0.6', color: '#3b82f6', html: c.q8_va_html ?? undefined },
    { key: 'q8-vb', label: 'Q8 T=0.85', color: '#8b5cf6', html: c.q8_vb_html ?? undefined },
    { key: 'q8-vc', label: 'Q8 T=0.85 2p', color: '#10b981', html: c.q8_vc_html ?? undefined },
  ]

  // Qwen27b expanded content (2x2 grid)
  const qwen27bExpandedContent = (mode === 'qwen27b' && expanded) ? (
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
        {/* Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '8px 0', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div />
          <div className="flex items-center" style={{ gap: 4 }}>
            {expandedMode === 'single' && (
              <button
                onClick={() => setExpandedMode('grid')}
                className="cursor-pointer bg-transparent border-0 text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center gap-1"
                style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}
              >
                All
              </button>
            )}
            {expandedMode === 'single' && (
              <>
                {qwen27bVariants.map(v => (
                  <button
                    key={v.key}
                    onClick={() => setFocusedVariant(v.key)}
                    className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
                    style={{
                      fontSize: 12, padding: '6px 10px', borderRadius: 6,
                      color: focusedVariant === v.key ? v.color : 'var(--text-muted)',
                      fontWeight: focusedVariant === v.key ? 600 : 400,
                      border: focusedVariant === v.key ? `1px solid ${v.color}` : '1px solid transparent',
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </>
            )}
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

        {/* Content area */}
        {expandedMode === 'grid' ? (
          <div style={{ flex: 1, minHeight: 0, paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
            {qwen27bVariants.map(v => (
              <ComparisonPanel
                key={v.key}
                label={v.label}
                color={v.color}
                html={v.html}
                onClick={() => { setExpandedMode('single'); setFocusedVariant(v.key) }}
              />
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, paddingTop: 8 }}>
            {(() => {
              const v = qwen27bVariants.find(x => x.key === focusedVariant)
              return v?.html ? (
                <div className="rounded-lg overflow-hidden border border-border" style={{ height: '100%' }}>
                  <iframe
                    srcDoc={v.html}
                    title={v.label}
                    className="w-full h-full border-0 block"
                    style={{ background: '#fff' }}
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: '100%' }}>
                  <p className="text-text-muted" style={{ fontSize: 14 }}>Content not available</p>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  ) : null

  // Non-qwen27b expanded content (existing behavior)
  const standardExpandedContent = (mode !== 'qwen27b' && expanded) ? (
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
                srcDoc={getSrcDoc(tab)!}
                title={getTabTitle(tab)}
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

  // Helper: render iframe tab content for any mode (used in the non-expanded view)
  const renderIframeTabContent = (tabKey: Tab, srcDoc: string | undefined, title: string, label: string, attribution: React.ReactNode, notAvailableMsg: string) => {
    if (tab !== tabKey) return null
    return (
      <div>
        {srcDoc ? (
          <ResizableIframe
            srcDoc={srcDoc}
            title={title}
            expanded={expanded}
            label={label}
            attribution={attribution}
          />
        ) : (
          <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height: 300 }}>
            <p className="text-text-muted" style={{ fontSize: 14 }}>
              {notAvailableMsg}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
    {qwen27bExpandedContent}
    {standardExpandedContent}
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
          {showExpandButton && (mode === 'qwen27b' || hasContent) && (
            <button
              onClick={() => { setExpanded(x => !x); if (mode === 'qwen27b') setExpandedMode('grid') }}
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

        {renderIframeTabContent('improved', c.improved_html ?? undefined, 'Improved by GPT-5.4', 'improved.html',
          <span style={{ fontSize: 11, color: '#22c55e' }}>Rewritten by GPT-5.4</span>,
          'Improved version not available for this component'
        )}

        {renderIframeTabContent('pi-harness', c.pi_harness_v45_html ?? undefined, 'Pi Harness V4.5', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#93b4ff', fontWeight: 600 }}>Pi Harness V4.5</span>,
          'Pi Harness V4.5 output not available for this component'
        )}

        {renderIframeTabContent('pi-harness-v42c', c.pi_harness_html ?? undefined, 'Pi Harness V4.2C', 'harness-output.html',
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Pi Harness V4.2C</span>,
          'Pi Harness V4.2C output not available for this component'
        )}

        {renderIframeTabContent('cond-g', c.condition_g_html ?? undefined, '8B-VL-Base', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#93b4ff', fontWeight: 600 }}>8B-VL-Base (Condition G)</span>,
          '8B-VL-Base output not available for this component'
        )}

        {renderIframeTabContent('cond-f', c.condition_f_html ?? undefined, 'Fine Tuned 8B', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Fine Tuned 8B (Condition F)</span>,
          'Fine Tuned 8B output not available for this component'
        )}

        {renderIframeTabContent('cond-d', c.condition_d_html ?? undefined, 'Harness D', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Harness D (Condition D)</span>,
          'Harness D output not available for this component'
        )}

        {renderIframeTabContent('cond-e', c.condition_e_html ?? undefined, 'Harness E', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Harness E (Condition E)</span>,
          'Harness E output not available for this component'
        )}

        {/* Qwen27b tabs */}
        {renderIframeTabContent('q5', c.q5_html ?? undefined, 'Q5_K_XL', 'component.html',
          <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>Qwen 3.6 27B · Q5_K_XL</span>,
          'Q5 output not available for this component'
        )}

        {renderIframeTabContent('q8-va', c.q8_va_html ?? undefined, 'Q8 T=0.6', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>Q8_K_XL · T=0.6</span>,
          'Q8 T=0.6 output not available for this component'
        )}

        {renderIframeTabContent('q8-vb', c.q8_vb_html ?? undefined, 'Q8 T=0.85', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>Q8_K_XL · T=0.85</span>,
          'Q8 T=0.85 output not available for this component'
        )}

        {renderIframeTabContent('q8-vc', c.q8_vc_html ?? undefined, 'Q8 T=0.85 2p', 'harness-output.html',
          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Q8_K_XL · T=0.85 · Self-check</span>,
          'Q8 T=0.85 2p output not available for this component'
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
            {mode === 'qwen27b' ? (
              <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>Qwen 3.6 27B</span>
            ) : (
              <span style={{ fontSize: 11, background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B</span>
            )}
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>T={c.temperature}</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>·</span>
            <span className="text-text-muted" style={{ fontSize: 11 }}>{c.run}</span>
          </div>
        </div>

        {/* Score */}
        {mode === 'qwen27b' ? (
          <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
            <div style={{ marginBottom: 16 }}>
              <span className="section-label" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Conditions</span>
            </div>
            {[
              { label: 'Q5 T=0.5', color: '#f97316', available: c.q5_score != null },
              { label: 'Q8 T=0.6', color: '#3b82f6', available: c.q8_va_score != null },
              { label: 'Q8 T=0.85', color: '#8b5cf6', available: c.q8_vb_score != null },
              { label: 'Q8 T=0.85 2p', color: '#10b981', available: c.q8_vc_score != null },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-b-0">
                <span className="text-sm" style={{ color: row.color, fontWeight: 600 }}>{row.label}</span>
                <span className="text-sm" style={{ color: row.available ? 'var(--score-high)' : 'var(--text-muted)' }}>
                  {row.available ? '✓' : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : mode === 'html-compare' ? (
          <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
            <div style={{ marginBottom: 16 }}>
              <span className="section-label" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Condition Comparison</span>
            </div>
            {[
              { label: '8B-VL-Base', available: !!c.condition_g_html, color: '#93b4ff' },
              { label: 'Fine Tuned 8B', available: !!c.condition_f_html, color: '#10b981' },
              { label: 'Harness D', available: !!c.condition_d_html, color: '#f59e0b' },
              { label: 'Harness E', available: !!c.condition_e_html, color: '#a78bfa' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-border-subtle last:border-b-0">
                <span className="text-sm" style={{ color: row.color, fontWeight: 600 }}>{row.label}</span>
                <span className="text-sm" style={{ color: row.available ? 'var(--score-high)' : 'var(--text-muted)' }}>
                  {row.available ? '✓' : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : mode === 'pi-harness' ? (
          <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 12px' }}>
            <div style={{ marginBottom: 16 }}>
              <span className="section-label" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Score Comparison</span>
              <span style={{ fontSize: 12, marginLeft: 6, color: 'var(--text-secondary)' }}>/9 HTML Rubric</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Scored by: Claude Opus 4.6</span>
            </div>
            {[
              { label: '27B Raw', value: c.v1_raw_total, color: '#a1a1aa' },
              { label: 'GPT-5.4', value: score, color: '#22c55e' },
              { label: 'Pi Harness V4.5', value: c.harness_total, color: '#93b4ff' },
            ].map(row => (
              <div key={row.label} className="py-2 border-b border-border-subtle last:border-b-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm" style={{ color: row.color, fontWeight: 600 }}>{row.label}</span>
                  <span className="font-mono text-sm font-medium text-text-primary">
                    {row.value != null ? `${row.value}/9` : '—'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: row.value != null ? `${(row.value / 9) * 100}%` : '0%',
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}

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
