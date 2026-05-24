import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getComponents } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'

interface Stats {
  total_components: number
  total_conversations: number
  avg_score: number
}

function scoreColor(score: number) {
  if (score >= 7) return 'bg-score-high/80 text-white'
  if (score >= 5) return 'bg-score-mid/80 text-white'
  return 'bg-score-low/80 text-white'
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [featured, setFeatured] = useState<ComponentWithScore[]>([])

  useEffect(() => {
    getStats().then(setStats)
    getComponents({ sort: 'score_desc', limit: 6, hasPng: 1 }).then(r => setFeatured(r.items))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="page-container" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <span className="section-label block" style={{ marginBottom: 16 }}>Dataset Explorer</span>
        <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          <span className="text-text-primary">500 UI Components</span><br />
          <span className="text-text-secondary">Scored, Critiqued &</span><br />
          <span className="text-text-secondary">Improved by GPT-5.4</span>
        </h1>
        <p className="text-text-secondary" style={{ fontSize: 16, maxWidth: 560, lineHeight: 1.65, marginTop: 24 }}>
          Qwen3.6-27B generated 500 UI components from natural language prompts.
          GPT-5.4 critiqued each one with specific measurements, then rewrote them
          with expert improvements — producing 3,090 fine-tuning records used to
          train Frontend Design Expert, a fine-tuned Qwen3-VL-8B that runs on a 12GB GPU.
        </p>
        <div className="flex items-center gap-3" style={{ marginTop: 28 }}>
          <Link
            to="/components"
            className="inline-flex items-center gap-2 no-underline bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600 }}
          >
            Browse Gallery →
          </Link>
          <a
            href="https://huggingface.co/stefans71/frontend-design-expert-8b"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border)' }}
          >
            Download Model ↗
          </a>
          <Link
            to="/validation"
            className="inline-flex items-center no-underline text-text-secondary hover:text-text-primary transition-colors duration-150"
            style={{ padding: '10px 16px', fontSize: 14, fontWeight: 500 }}
          >
            View Validation →
          </Link>
        </div>
      </section>

      {/* Stats row */}
      {stats && (
        <section className="border-t border-border">
          <div className="page-container flex items-center justify-center" style={{ padding: '20px 24px' }}>
            {[
              `${stats.total_components} Components`,
              `${stats.total_conversations} Conversations`,
              `${stats.avg_score?.toFixed(1) ?? '—'}/9 Avg Score`,
              'Apache 2.0',
            ].map((label, i) => (
              <span key={i} className="text-text-muted" style={{ fontSize: 13 }}>
                {i > 0 && <span style={{ margin: '0 16px', color: 'var(--border)' }}>·</span>}
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Featured Components */}
      {featured.length > 0 && (
        <section className="page-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600 }}>Top Scoring Components</h2>
            <Link to="/components" className="text-text-secondary no-underline hover:text-text-primary transition-colors duration-150" style={{ fontSize: 14 }}>
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
            {featured.map(c => {
              const score = c.score?.total ?? c.total
              return (
                <Link
                  key={c.id}
                  to={`/components/${c.id}`}
                  className="block overflow-hidden no-underline bg-bg-card transition-all duration-150 hover:-translate-y-0.5"
                  style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img
                      src={`/screenshots/${c.id}-desktop.webp`}
                      alt={c.prompt}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {score !== undefined && (
                      <span className={`absolute font-mono ${scoreColor(score)}`} style={{ top: 8, right: 8, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                        {score}/9
                      </span>
                    )}
                    <span className="absolute text-white/80" style={{ top: 8, left: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                      {c.category}
                    </span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.prompt}
                    </p>
                  </div>
                  <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: '#22c55e' }}>
                    Qwen3.6-27B · {c.category} · {c.theme} · T={c.temperature}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Pipeline + Validation */}
      <section className="border-t border-border">
        <div className="page-container grid grid-cols-1 md:grid-cols-2" style={{ paddingTop: 48, paddingBottom: 48, gap: 48 }}>
          {/* Pipeline */}
          <div>
            <span className="section-label block" style={{ marginBottom: 8 }}>Pipeline</span>
            <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>6-Stage Process</h2>
            <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Each component passes through generate, render, critique, improve, package, and evaluate —
              producing 3,090 training records for fine-tuning Qwen3-VL.
            </p>
            <div>
              {[
                ['01', 'Generate', 'Qwen3.6-27B creates HTML/CSS from prompts'],
                ['02', 'Render', 'Playwright captures desktop + mobile screenshots'],
                ['03', 'Critique', 'GPT-5.4 scores design quality with specifics'],
                ['04', 'Improve', 'GPT-5.4 rewrites with critique context'],
                ['05', 'Package', '6 record types per component'],
                ['06', 'Evaluate', '3-axis scoring (visual, alignment, interactivity)'],
              ].map(([num, title, desc]) => (
                <div key={num} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="font-mono text-accent" style={{ fontSize: 11, fontWeight: 600, paddingTop: 2 }}>{num}</span>
                  <div>
                    <span className="text-text-primary block" style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{title}</span>
                    <span className="text-text-secondary" style={{ fontSize: 13 }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validated Behaviors */}
          <div>
            <span className="section-label block" style={{ marginBottom: 8 }}>Results</span>
            <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Validated Behaviors</h2>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="text-left text-text-muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, paddingBottom: 12 }}>Test</th>
                  <th className="text-right text-text-muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, paddingBottom: 12 }}>Base</th>
                  <th className="text-right text-text-muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, paddingBottom: 12 }}>FT 8B</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Qualifying Questions', '1/10', '10/10'],
                  ['Vision Critique', 'Vague', 'px + hex'],
                  ['Token Accuracy', '—', '98.1%'],
                  ['Clean Output', 'Verbose', '0 chars'],
                ].map(([test, base, ft], i) => (
                  <tr key={i}>
                    <td className="text-text-primary" style={{ fontSize: 14, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>{test}</td>
                    <td className="text-right text-text-muted" style={{ fontSize: 14, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>{base}</td>
                    <td className="text-right font-mono text-score-high" style={{ fontSize: 14, fontWeight: 600, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>{ft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Model stats row */}
            <div className="flex" style={{ marginTop: 20, gap: 32 }}>
              <div>
                <span className="text-text-muted block" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>8B Expert</span>
                <span className="font-mono text-text-primary" style={{ fontSize: 14 }}>0.246 loss · 98.1% acc</span>
              </div>
              <div>
                <span className="text-text-muted block" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>4B Lite</span>
                <span className="font-mono text-text-primary" style={{ fontSize: 14 }}>0.325 loss · 92.5% acc</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Record Types */}
      <section className="border-t border-border">
        <div className="page-container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <span className="section-label block" style={{ marginBottom: 16 }}>Record Types</span>
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 16 }}>
            {[
              ['prompt_to_html', 'Text → HTML', 'Prompt generates self-contained component'],
              ['screenshot_to_critique', 'Image → Critique', 'Visual analysis with px-level specifics'],
              ['screenshot_to_code', 'Image → Code', 'Screenshot reverse-engineered to HTML'],
              ['mobile_to_code', 'Mobile → Code', 'Mobile viewport screenshot to HTML'],
              ['screenshot_html_to_critique', 'Image+Code → Critique', 'Combined visual and code analysis'],
              ['qualifying_conversation', 'Vague → Questions → Build', 'Multi-turn qualifying behavior'],
            ].map(([type, title, desc]) => (
              <div
                key={type}
                style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', transition: 'border-color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span className="font-mono text-text-muted block" style={{ fontSize: 11, marginBottom: 6 }}>{type}</span>
                <span className="text-text-primary block" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</span>
                <span className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.4 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
