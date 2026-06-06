import { Pi, ArrowRight, Terminal, FileCode, Wrench, Clock, CheckCircle, XCircle, BookOpen, TrendingUp, Zap, Target, Shield } from 'lucide-react'

function Dial({ value, max, label, sublabel, color, size = 100 }: { value: number; max: number; label: string; sublabel: string; color: string; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const pct = value / max
  const offset = circ * (1 - pct)
  return (
    <div className="flex flex-col items-center" style={{ gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size * 0.24, fontWeight: 700, fill: color, fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </text>
      </svg>
      <span className="text-text-secondary" style={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{sublabel}</span>
    </div>
  )
}

function PiNode({ number, title, type, duration, children, isLast }: {
  number: number; title: string; type: string; duration: string; children: React.ReactNode; isLast?: boolean
}) {
  const typeIcon = type.includes('pi') ? <Terminal size={12} /> : type.includes('Bash') ? <FileCode size={12} /> : <Wrench size={12} />
  const typeColor = type.includes('pi') ? '#93b4ff' : type.includes('Bash') ? 'var(--accent)' : '#2dd4bf'
  return (
    <div className="flex gap-4" style={{ position: 'relative' }}>
      <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-center" style={{
          width: 40, height: 40, borderRadius: '50%', border: `2px solid ${typeColor}`,
          background: 'var(--bg-primary)', zIndex: 1,
        }}>
          <Pi size={18} style={{ color: typeColor }} />
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4, marginBottom: 4, minHeight: 20 }} />
        )}
      </div>
      <div className="flex-1" style={{ paddingBottom: isLast ? 0 : 32 }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 8 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>NODE {number}</span>
          <span className="text-text-primary" style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 12 }}>
          <span className="flex items-center gap-1.5" style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
            background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${typeColor} 30%, transparent)`,
            color: typeColor,
          }}>
            {typeIcon} {type}
          </span>
          <span className="flex items-center gap-1 text-text-muted" style={{ fontSize: 12 }}>
            <Clock size={11} /> {duration}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '16px 20px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const VERSIONS = [
  { version: 'V2', arch: '8-node YAML workflow', nodes: 8, llm: 5, time: '~20 min', completion: '76/100', failures: '24 timeouts', dict: 'None', change: 'Hostile review + rework' },
  { version: 'V3', arch: '9-node YAML + dictionary', nodes: 9, llm: 5, time: '~25 min', completion: '9/12', failures: '3', dict: '42 rules', change: 'Structured review by rule ID' },
  { version: 'V4', arch: '7-node YAML, raw-first', nodes: 7, llm: 3, time: '~8 min', completion: '4/12', failures: 'scope expansion', dict: '49 rules', change: 'Dictionary in generate (caused over-building)' },
  { version: 'V4.1', arch: 'Split: pi + direct API', nodes: 2, llm: 2, time: '~5.5 min', completion: '12/12', failures: '0', dict: '52 rules', change: 'YAML work order + sign-off' },
  { version: 'V4.2', arch: 'Split + new rules', nodes: 2, llm: 2, time: '~5.5 min', completion: '50/50', failures: '0', dict: '62 rules', change: 'TY-08 display size, LS-07 CTA, CD color direction' },
  { version: 'V4.2C', arch: 'Split + persona + prompt injection', nodes: 2, llm: 2, time: '~5.5 min', completion: '100/100', failures: '0', dict: '62 rules', change: 'Expert persona + prompt-aware polish' },
]

export default function ThePi() {
  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(147,180,255,0.15) 0%, rgba(249,115,22,0.1) 100%)',
            border: '1px solid rgba(147,180,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pi size={22} style={{ color: '#93b4ff' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              PI HARNESS V4.2C
            </div>
            <h1 className="text-text-primary" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>The Pi</h1>
          </div>
        </div>
        <p className="text-text-secondary" style={{ fontSize: 16, maxWidth: 720, lineHeight: 1.75, marginBottom: 0 }}>
          The Pi Harness transforms raw{' '}
          <span style={{ background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B</span>{' '}
          output into production-quality UI components in 5.5 minutes — matching or exceeding GPT-5.4 improved output on code quality benchmarks, with 100% completion rate and zero failures across 100 components.
        </p>
      </div>

      {/* Key metric dials */}
      <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid page-enter" style={{ gap: 16, marginBottom: 48 }}>
        <div className="rounded-lg border border-border bg-bg-card flex flex-col items-center" style={{ padding: '24px 16px' }}>
          <Dial value={3.6} max={4} label="3.6x" sublabel="Faster than V2" color="var(--accent)" size={96} />
        </div>
        <div className="rounded-lg border border-border bg-bg-card flex flex-col items-center" style={{ padding: '24px 16px' }}>
          <Dial value={100} max={100} label="100%" sublabel="Completion Rate" color="var(--score-high)" size={96} />
        </div>
        <div className="rounded-lg border border-border bg-bg-card flex flex-col items-center" style={{ padding: '24px 16px' }}>
          <Dial value={0} max={1} label="0" sublabel="Failures (of 100)" color="#93b4ff" size={96} />
        </div>
        <div className="rounded-lg border border-border bg-bg-card flex flex-col items-center" style={{ padding: '24px 16px' }}>
          <Dial value={62} max={62} label="62" sublabel="Production Rules" color="#2dd4bf" size={96} />
        </div>
      </div>

      {/* How It Works — flow diagram */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          HOW IT WORKS
        </div>
        <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
          Split pipeline architecture
        </h2>

        {/* 3-box flow */}
        <div className="flex items-stretch the-pi-flow" style={{ gap: 0, marginBottom: 24 }}>
          {/* Session 1 */}
          <div className="flex-1 rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 16px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(147,180,255,0.12)', border: '1px solid rgba(147,180,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Pi size={14} style={{ color: '#93b4ff' }} />
              </div>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: '#93b4ff' }}>SESSION 1</span>
            </div>
            <span className="text-text-primary block" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Raw Generate</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <span>Expert UI/UX persona</span>
              <span>Raw generate from prompt only</span>
              <span>Full creative freedom</span>
            </div>
            <div className="flex items-center gap-1 mt-3" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={10} /> ~2 min
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="flex items-center the-pi-arrow" style={{ padding: '0 8px', flexShrink: 0 }}>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Bash checklist */}
          <div className="flex-1 rounded-lg border bg-bg-card" style={{ padding: '20px 20px 16px', borderColor: 'var(--accent)', borderWidth: 1 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Terminal size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>BASH</span>
            </div>
            <span className="text-text-primary block" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>21-Item Checklist</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <span>Greps HTML for missing items</span>
              <span>Production standards audit</span>
              <span>Generates YAML work order</span>
            </div>
            <div className="flex items-center gap-1 mt-3" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={10} /> &lt;1 sec
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="flex items-center the-pi-arrow" style={{ padding: '0 8px', flexShrink: 0 }}>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Session 2 */}
          <div className="flex-1 rounded-lg border border-border bg-bg-card" style={{ padding: '20px 20px 16px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wrench size={14} style={{ color: '#2dd4bf' }} />
              </div>
              <span className="font-mono" style={{ fontSize: 11, fontWeight: 600, color: '#2dd4bf' }}>SESSION 2</span>
            </div>
            <span className="text-text-primary block" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>YAML Work Order Polish</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <span>Direct API call to Qwen 27B</span>
              <span>YAML work order + original prompt</span>
              <span>Sign-off on each fix</span>
            </div>
            <div className="flex items-center gap-1 mt-3" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={10} /> ~3 min
            </div>
          </div>
        </div>

        {/* Explanation text */}
        <div className="rounded-lg border border-border bg-bg-secondary" style={{ padding: '16px 20px' }}>
          <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            The V4.2C split pipeline separates creative generation from production polish. Session 1 generates raw HTML using an expert UI/UX persona — the model builds freely from the prompt with no constraints. A bash checklist then audits the raw output against 21 production standards (hover states, focus-visible, SVG icons, responsive breakpoints, ARIA, typography scale). Missing items become a YAML work order sent to Session 2, which also receives the original prompt for factual verification (correct prices, colors, labels). The model applies each fix and signs off on every item. Two completely independent sessions, ~5.5 minutes total, zero failures across 100 components.
          </p>
        </div>
      </div>

      {/* Evolution Table */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          EVOLUTION
        </div>
        <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
          Six iterations to production
        </h2>

        <div className="rounded-lg border border-border overflow-hidden" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr className="bg-bg-secondary">
                {['Version', 'Architecture', 'Nodes', 'LLM Calls', 'Avg Time', 'Completion', 'Failures', 'Rules', 'Key Change'].map(h => (
                  <th key={h} className="section-label text-left" style={{ padding: '10px 12px', fontSize: 10, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VERSIONS.map((v, i) => {
                const isCurrent = v.version === 'V4.2C'
                return (
                  <tr key={v.version} style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isCurrent ? 'rgba(147,180,255,0.06)' : i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                  }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="font-mono" style={{
                        fontSize: 12, fontWeight: 700,
                        color: isCurrent ? '#93b4ff' : 'var(--text-primary)',
                      }}>{v.version}</span>
                    </td>
                    <td className="text-text-secondary" style={{ padding: '10px 12px', fontSize: 12 }}>{v.arch}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(v.nodes, 9) }).map((_, j) => (
                          <Pi key={j} size={10} style={{ color: isCurrent ? '#93b4ff' : 'var(--text-muted)', opacity: 0.7 }} />
                        ))}
                      </div>
                    </td>
                    <td className="font-mono text-text-secondary" style={{ padding: '10px 12px', fontSize: 12 }}>{v.llm}</td>
                    <td className="font-mono text-text-secondary" style={{ padding: '10px 12px', fontSize: 12 }}>{v.time}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="font-mono" style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: v.completion.startsWith('100') || v.completion === '50/50' || v.completion === '12/12' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                        color: v.completion.startsWith('100') || v.completion === '50/50' || v.completion === '12/12' ? 'var(--score-high)' : 'var(--score-low)',
                        border: `1px solid ${v.completion.startsWith('100') || v.completion === '50/50' || v.completion === '12/12' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {v.completion}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {v.failures === '0' ? (
                        <span className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--score-high)' }}>
                          <CheckCircle size={12} /> 0
                        </span>
                      ) : (
                        <span className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--score-low)' }}>
                          <XCircle size={12} /> {v.failures}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="font-mono text-text-secondary" style={{ fontSize: 12 }}>{v.dict}</span>
                    </td>
                    <td className="text-text-secondary" style={{ padding: '10px 12px', fontSize: 12, maxWidth: 200 }}>{v.change}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Trend indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid" style={{ gap: 12, marginTop: 16 }}>
          {[
            { icon: <Zap size={14} />, label: 'Speed', from: '20 min', to: '5.5 min', delta: '3.6x faster', color: 'var(--accent)' },
            { icon: <Target size={14} />, label: 'Completion', from: '76%', to: '100%', delta: '+24%', color: 'var(--score-high)' },
            { icon: <Shield size={14} />, label: 'Failures', from: '24', to: '0', delta: '-24', color: '#93b4ff' },
            { icon: <BookOpen size={14} />, label: 'Dictionary', from: '0', to: '62 rules', delta: '+62', color: '#2dd4bf' },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border bg-bg-card" style={{ padding: '12px 16px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <span style={{ color: m.color }}>{m.icon}</span>
                <span className="text-text-muted" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-text-muted" style={{ fontSize: 12, textDecoration: 'line-through' }}>{m.from}</span>
                <TrendingUp size={12} style={{ color: m.color }} />
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.to}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Diagram */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          NODE DETAIL
        </div>
        <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
          Pipeline walkthrough
        </h2>

        <PiNode number={1} title="Raw Generate" type="pi -p (PI Agent)" duration="~2 min">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="flex items-start gap-3">
              <span className="text-text-muted" style={{ fontSize: 11, fontWeight: 600, width: 48, flexShrink: 0, paddingTop: 2 }}>Input</span>
              <span className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>User prompt + expert persona</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-text-muted" style={{ fontSize: 11, fontWeight: 600, width: 48, flexShrink: 0, paddingTop: 2 }}>Output</span>
              <span className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>raw-output.html</span> (6–25 KB)
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Model generates the component from the prompt with full creative freedom. Expert persona primes for typography hierarchy, spacing systems, and color theory. No dictionary, no constraints — build what the prompt asks for.
              </p>
            </div>
          </div>
        </PiNode>

        <PiNode number={2} title="Production Checklist" type="Bash (grep/regex)" duration="<1 sec">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.65, margin: 0 }}>
              Audits the raw HTML against 21 production standards:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '6px 16px' }}>
              {[
                'Hover states (≥4)', 'Focus-visible (≥2)', 'Disabled styles',
                'Transitions', 'Reduced-motion', 'Responsive (768+1024px)',
                'Inline SVG icons (≥2)', 'ARIA attributes', 'Multi-layer shadows',
                'Hover lift (translateY)', 'Letter-spacing', 'Word-break',
                'Display text ≥48px', 'Green checkmarks', 'Clean glow',
                'Solid headings', 'Pricing card flow', 'CTA contrast',
                'Card elevation', 'Typography scale', 'Color direction',
              ].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 11, lineHeight: 1.4 }}>
                  <CheckCircle size={10} style={{ color: 'var(--score-high)', flexShrink: 0 }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </PiNode>

        <PiNode number={3} title="YAML Work Order Polish" type="Direct API (Qwen 27B)" duration="~3 min" isLast>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="flex items-start gap-3">
              <span className="text-text-muted" style={{ fontSize: 11, fontWeight: 600, width: 48, flexShrink: 0, paddingTop: 2 }}>Input</span>
              <span className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>Raw HTML + YAML fix list + original prompt + dictionary reference</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-text-muted" style={{ fontSize: 11, fontWeight: 600, width: 48, flexShrink: 0, paddingTop: 2 }}>Output</span>
              <span className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>harness-output.html</span> (polished) +{' '}
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>sign-off.yaml</span>
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                Receives a structured YAML work order listing every missing item with a rule ID, CSS example, and specific instruction. Also receives the original user prompt for factual cross-checking (verifying prices, colors, labels match what was requested). Applies each fix and outputs a sign-off confirming what was changed. Average polish adds <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>+3.9 KB</span> of production code.
              </p>
            </div>
          </div>
        </PiNode>
      </div>

      {/* Score comparison note */}
      <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '20px 24px' }}>
        <div className="flex items-start gap-3" style={{ marginBottom: 12 }}>
          <Pi size={16} style={{ color: '#93b4ff', flexShrink: 0, marginTop: 2 }} />
          <span className="text-text-primary" style={{ fontSize: 14, fontWeight: 600 }}>About these scores</span>
        </div>
        <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.7, margin: 0, paddingLeft: 28 }}>
          All three conditions (27B Raw, GPT-5.4 Improved, Pi Harness V4.2C) were scored by the same Claude Opus 4.6 model using the same <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>evaluate.ts</span> rubric reading HTML source code. This /9 rubric measures code structure — color usage, prompt alignment, and interactivity implementation — not visual design quality. All three conditions score similarly (8.6–8.8/9) because Qwen3.6-27B naturally produces well-structured HTML that passes these checks. The meaningful quality differences are in production polish: the Pi Harness adds hover/focus/disabled states, inline SVG icons, responsive breakpoints, ARIA accessibility, and prompt-faithful styling that the code rubric confirms but cannot fully differentiate from the raw model's baseline competence.
        </p>
      </div>
    </div>
  )
}
