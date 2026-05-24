import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getComponents } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import { useInView } from '@/hooks/useInView'

interface Stats {
  total_components: number
  total_conversations: number
  avg_score: number
  categories?: Record<string, number>
}

function StatBlock({ label, value, suffix, delay = 0 }: { label: string; value: string; suffix?: string; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="label-caps text-text-muted block mb-2">{label}</span>
      <span className="font-mono text-4xl font-bold text-text-primary tabular-nums tracking-tight">
        {value}
      </span>
      {suffix && <span className="font-mono text-lg text-text-muted ml-1">{suffix}</span>}
    </div>
  )
}

function FeaturedCard({ component, size = 'normal', index = 0 }: {
  component: ComponentWithScore
  size?: 'large' | 'normal'
  index?: number
}) {
  const score = component.score?.total ?? component.total
  const src = `/screenshots/${component.id}-desktop.webp`
  const isLarge = size === 'large'

  return (
    <Link
      to={`/components/${component.id}`}
      className={`card-enter group relative block overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-card no-underline ${
        isLarge ? 'row-span-2' : ''
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={src}
          alt={component.prompt}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.05]"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">{component.prompt}</p>
        </div>
      </div>
      {score !== undefined && (
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold rounded-full backdrop-blur-md ${
            score >= 7 ? 'bg-score-high/20 text-score-high border border-score-high/30'
            : score >= 5 ? 'bg-score-mid/20 text-score-mid border border-score-mid/30'
            : 'bg-score-low/20 text-score-low border border-score-low/30'
          }`}>
            {score}/9
          </span>
        </div>
      )}
      <div className="absolute top-3 left-3">
        <span className="label-caps px-2 py-1 rounded-md bg-black/40 text-white/70 backdrop-blur-md">
          {component.category}
        </span>
      </div>
    </Link>
  )
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [featured, setFeatured] = useState<ComponentWithScore[]>([])

  useEffect(() => {
    getStats().then(setStats)
    getComponents({ sort: 'score_desc', limit: 6, hasPng: 1 }).then(r => setFeatured(r.items))
  }, [])

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8">
        <div className="hero-gradient" />
        <div className="page-container relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-elevated mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace" }} className="text-text-muted">Dataset Explorer</span>
          </div>
          <h1 className="font-display font-800 text-text-display leading-[0.95] max-w-3xl" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            Frontend Design{' '}
            <span className="text-gradient">Expert</span>
          </h1>
          <p className="text-xl text-text-secondary mt-6 max-w-xl font-light leading-relaxed">
            Browse 500 synthetic UI components generated via teacher-student distillation,
            scored and critiqued by GPT-5.4.
          </p>
          <div className="flex items-center gap-6 mt-8">
            <Link
              to="/components"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] bg-accent text-[#06080d] font-semibold text-sm no-underline hover:bg-accent-hover transition-colors"
            >
              Browse Gallery
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              to="/validation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] border border-border text-text-secondary font-medium text-sm no-underline hover:border-border-accent hover:text-text-primary transition-all"
            >
              View Results
            </Link>
          </div>
        </div>
      </section>


      {/* Stats Strip */}
      {stats && (
        <section className="border-y border-border bg-bg-secondary/50 py-6">
          <div className="page-container grid grid-cols-3 gap-8 items-start">
            <StatBlock label="Components" value={String(stats.total_components)} delay={0} />
            <StatBlock label="Conversations" value={String(stats.total_conversations)} delay={100} />
            <StatBlock label="Avg Score" value={stats.avg_score?.toFixed(1) ?? '—'} suffix="/ 9" delay={200} />
          </div>
        </section>
      )}

      {/* Featured Components — Bento Grid */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="label-caps text-accent block mb-2">Featured</span>
                <h2 className="font-display text-3xl font-700 text-text-display">Top Scoring Components</h2>
              </div>
              <Link to="/components" className="label-caps text-text-muted hover:text-accent transition-colors no-underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {featured.map((c, i) => (
                <FeaturedCard key={c.id} component={c} size={i === 0 ? 'large' : 'normal'} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="border-t border-border">
        <div className="page-container py-16 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ columnGap: '48px' }}>
          <div>
            <span className="label-caps text-accent block mb-3">Pipeline</span>
            <h2 className="font-display text-2xl font-700 text-text-display mb-4">6-Stage Process</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Each component passes through generate, render, critique, improve, package, and evaluate —
              producing 3,090 training records for fine-tuning Qwen3-VL.
            </p>
            <div className="space-y-3">
              {[
                ['01', 'Generate', 'Qwen3.6-27B creates HTML/CSS from prompts'],
                ['02', 'Render', 'Playwright captures desktop + mobile screenshots'],
                ['03', 'Critique', 'GPT-5.4 scores design quality with specifics'],
                ['04', 'Improve', 'GPT-5.4 rewrites with critique context'],
                ['05', 'Package', '6 record types per component'],
                ['06', 'Evaluate', '3-axis scoring (visual, alignment, interactivity)'],
              ].map(([num, title, desc]) => (
                <div key={num} className="flex items-start gap-4 group">
                  <span className="font-mono text-xs text-accent/60 mt-0.5 shrink-0">{num}</span>
                  <div>
                    <span className="text-sm font-semibold text-text-primary">{title}</span>
                    <span className="text-sm text-text-muted ml-2">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="label-caps text-accent-warm block mb-3">Results</span>
            <h2 className="font-display text-2xl font-700 text-text-display mb-4">Validated Behaviors</h2>
            <div className="rounded-[var(--radius-lg)] border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-elevated/50">
                    <th className="text-left p-3 label-caps text-text-muted">Test</th>
                    <th className="text-right p-3 label-caps text-text-muted">Base</th>
                    <th className="text-right p-3 label-caps text-text-muted">FT 8B</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Qualifying Questions', '1/10', '10/10'],
                    ['Vision Critique', 'Vague', 'px + hex'],
                    ['Token Accuracy', '—', '98.1%'],
                    ['Clean Output', 'Verbose', '0 chars'],
                  ].map(([test, base, ft], i) => (
                    <tr key={i} className="border-t border-border-subtle">
                      <td className="p-3 text-text-primary font-medium">{test}</td>
                      <td className="p-3 text-right text-text-muted">{base}</td>
                      <td className="p-3 text-right font-mono font-bold text-score-high">{ft}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-3">
              {[
                ['8B Expert', '0.246 loss', 'bg-accent/10 text-accent border-accent/20'],
                ['4B Lite', '0.325 loss', 'bg-accent-warm/10 text-accent-warm border-accent-warm/20'],
              ].map(([name, detail, cls]) => (
                <div key={name} className={`flex-1 p-4 rounded-[var(--radius)] border ${cls}`}>
                  <span className="text-sm font-semibold block">{name}</span>
                  <span className="font-mono text-xs opacity-70">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Record Types Strip */}
      <section className="border-t border-border bg-bg-secondary/30">
        <div className="page-container py-12">
          <span className="label-caps text-text-muted block mb-6">Record Types</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gap: '16px' }}>
            {[
              ['prompt_to_html', 'Text → HTML', 'Prompt generates self-contained component'],
              ['screenshot_to_critique', 'Image → Critique', 'Visual analysis with px-level specifics'],
              ['screenshot_to_code', 'Image → Code', 'Screenshot reverse-engineered to HTML'],
              ['mobile_to_code', 'Mobile → Code', 'Mobile viewport screenshot to HTML'],
              ['screenshot_html_to_critique', 'Image+Code → Critique', 'Combined visual and code analysis'],
              ['qualifying_conversation', 'Vague → Questions → Build', 'Multi-turn qualifying behavior'],
            ].map(([type, title, desc]) => (
              <div key={type} className="p-4 rounded-[var(--radius)] border border-border-subtle hover:border-border-accent transition-colors group flex flex-col min-h-[100px]">
                <code className="font-mono text-xs text-accent">{type}</code>
                <p className="text-sm font-semibold text-text-primary mt-1">{title}</p>
                <p className="text-xs text-text-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
