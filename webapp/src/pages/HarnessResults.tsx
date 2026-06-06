import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getComponent, getHarnessStats } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import Shimmer from '@/components/ui/Shimmer'
import Badge from '@/components/ui/Badge'
import { ArrowRight, TrendingUp, Equal, ArrowDown } from 'lucide-react'

type FullComponent = ComponentWithScore & { critique?: string; improved_html?: string; component_html?: string; pi_harness_html?: string }

const FEATURED_IDS = [
  'component-014-run0',
  'component-026-run0',
  'component-062-run0',
]

function StatCard({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card" style={{ padding: '16px 20px' }}>
      <span className="block text-text-muted" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: color || 'var(--text-primary)' }}>{value}</span>
        {suffix && <span className="text-text-secondary" style={{ fontSize: 13 }}>{suffix}</span>}
      </div>
    </div>
  )
}

function ShowcaseCard({ component, index }: { component: FullComponent; index: number }) {
  const [activeTab, setActiveTab] = useState<'original' | 'harness'>('original')
  const rawScore = component.v1_raw_total
  const harnessScore = component.harness_total
  const delta = rawScore != null && harnessScore != null ? harnessScore - rawScore : null

  return (
    <div
      className="rounded-lg border border-border bg-bg-card page-enter"
      style={{ animationDelay: `${index * 80}ms`, overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <Link
            to={`/pi-harness/components/${component.id}`}
            className="font-mono text-text-primary no-underline hover:text-accent transition-colors duration-150"
            style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}
          >
            {component.id}
          </Link>
          <Badge>{component.category}</Badge>
        </div>
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          {rawScore != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted" style={{ fontSize: 11 }}>27B Raw</span>
              <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa' }}>{rawScore}/9</span>
            </div>
          )}
          {harnessScore != null && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 11, color: '#93b4ff' }}>Harness</span>
              <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: '#93b4ff' }}>{harnessScore}/9</span>
            </div>
          )}
          {delta != null && delta > 0 && (
            <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--score-high)', padding: '2px 8px', background: 'rgba(74,222,128,0.1)', borderRadius: 4 }}>
              +{delta}
            </span>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <p className="text-text-secondary" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          {component.prompt}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center" style={{ borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
        <button
          onClick={() => setActiveTab('original')}
          className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
          style={{
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: activeTab === 'original' ? 600 : 400,
            color: activeTab === 'original' ? '#a1a1aa' : 'var(--text-muted)',
            borderBottom: activeTab === 'original' ? '2px solid #a1a1aa' : '2px solid transparent',
            marginBottom: -1,
          }}
        >
          <span style={{
            background: 'linear-gradient(90deg, #f97316 0%, #f97316 20%, #2dd4bf 80%, #2dd4bf 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700,
          }}>Qwen3.6-27B-Q5</span>
        </button>
        <button
          onClick={() => setActiveTab('harness')}
          className="cursor-pointer bg-transparent border-0 transition-colors duration-150"
          style={{
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: activeTab === 'harness' ? 600 : 400,
            color: activeTab === 'harness' ? '#93b4ff' : 'var(--text-muted)',
            borderBottom: activeTab === 'harness' ? '2px solid #93b4ff' : '2px solid transparent',
            marginBottom: -1,
          }}
        >
          <span style={{ color: '#93b4ff', fontWeight: 700 }}>Pi Harness</span>
        </button>
        <div style={{ flex: 1 }} />
        <Link
          to={`/pi-harness/components/${component.id}`}
          className="no-underline text-text-muted hover:text-text-primary transition-colors duration-150 flex items-center gap-1"
          style={{ fontSize: 12 }}
        >
          View detail <ArrowRight size={12} />
        </Link>
      </div>

      {/* Iframe */}
      <div style={{ position: 'relative' }}>
        <iframe
          srcDoc={activeTab === 'original' ? (component.component_html || '') : (component.pi_harness_html || '')}
          title={activeTab === 'original' ? 'Original Qwen output' : 'Pi Harness output'}
          className="w-full border-0 block"
          style={{ height: 480, background: '#fff' }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}

export default function HarnessResults() {
  const [stats, setStats] = useState<{ total: number; harness_avg: number; raw_avg: number; gpt_avg: number; wins: number; ties: number; losses: number } | null>(null)
  const [featured, setFeatured] = useState<FullComponent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getHarnessStats(),
      ...FEATURED_IDS.map(id => getComponent(id)),
    ])
      .then(([s, ...comps]) => {
        setStats(s)
        setFeatured(comps)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-24 mt-4" />
        <Shimmer className="h-96 mt-4" />
      </div>
    )
  }

  const improvement = stats ? (stats.harness_avg - stats.raw_avg).toFixed(2) : '0'

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          PI HARNESS V4.2 · RESULTS
        </div>
        <h1 className="text-text-primary" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
          Harness Results
        </h1>
        <p className="text-text-secondary" style={{ fontSize: 15, maxWidth: 640, lineHeight: 1.7, marginBottom: 16 }}>
          The Pi Harness V4.2 self-improvement loop produces noticeable polish improvements over the
          Qwen 27B base model. Each component was generated by{' '}
          <span style={{ background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B-Q5</span>
          , then refined through the harness's critique-and-rewrite pipeline.
          The results show consistent quality gains — tighter spacing, better color contrast,
          more polished micro-interactions, and stronger visual hierarchy.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>Scored by <strong style={{ color: 'var(--text-secondary)' }}>Claude Opus 4.6</strong></span>
          <span>·</span>
          <span>/9 HTML rubric</span>
          <span>·</span>
          <span><strong style={{ color: 'var(--text-primary)' }}>{stats?.total || 100}</strong> components tested</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 validation-stats-grid page-enter" style={{ gap: 12, marginBottom: 32 }}>
        <StatCard
          label="27B RAW AVG"
          value={stats?.raw_avg?.toFixed(2) || '8.63'}
          suffix="/9"
          color="#a1a1aa"
        />
        <StatCard
          label="PI HARNESS AVG"
          value={stats?.harness_avg?.toFixed(2) || '8.82'}
          suffix="/9"
          color="#93b4ff"
        />
        <StatCard
          label="IMPROVEMENT"
          value={`+${improvement}`}
          suffix="avg delta"
          color="var(--score-high)"
        />
        <StatCard
          label="GPT-5.4 AVG"
          value={stats?.gpt_avg?.toFixed(2) || '8.77'}
          suffix="/9"
          color="#22c55e"
        />
      </div>

      {/* Win/tie/loss bar */}
      {stats && (
        <div className="rounded-lg border border-border bg-bg-card page-enter" style={{ padding: '16px 20px', marginBottom: 40, animationDelay: '100ms' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="text-text-secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              Pi Harness vs 27B Raw — per-component outcomes
            </span>
            <span className="text-text-muted" style={{ fontSize: 12 }}>{stats.total} components</span>
          </div>
          <div className="flex" style={{ height: 28, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
            <div
              style={{ flex: stats.wins, background: 'var(--score-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px 0 0 6px' }}
              title={`${stats.wins} improved`}
            >
              <span className="font-mono" style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                <TrendingUp size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
                {stats.wins}
              </span>
            </div>
            <div
              style={{ flex: stats.ties, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title={`${stats.ties} tied`}
            >
              <span className="font-mono text-text-muted" style={{ fontSize: 11, fontWeight: 600 }}>
                <Equal size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
                {stats.ties}
              </span>
            </div>
            <div
              style={{ flex: stats.losses, background: 'var(--score-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 6px 6px 0', minWidth: stats.losses > 0 ? 32 : 0 }}
              title={`${stats.losses} regressed`}
            >
              {stats.losses > 0 && (
                <span className="font-mono" style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                  <ArrowDown size={11} style={{ display: 'inline', marginRight: 2, verticalAlign: -1 }} />
                  {stats.losses}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4" style={{ marginTop: 8 }}>
            <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--score-high)', display: 'inline-block' }} />
              Improved ({stats.wins})
            </span>
            <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--bg-elevated)', display: 'inline-block' }} />
              Maintained ({stats.ties})
            </span>
            {stats.losses > 0 && (
              <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--score-low)', display: 'inline-block' }} />
                Regressed ({stats.losses})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Featured showcase */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          FEATURED COMPARISONS
        </div>
        <h2 className="text-text-primary" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          Before &amp; after — toggle to see the difference
        </h2>
        <p className="text-text-secondary" style={{ fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Click between tabs to see the original Qwen output and the Pi Harness refined version.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {featured.map((comp, i) => (
          <ShowcaseCard key={comp.id} component={comp} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Link
          to="/pi-harness/components"
          className="no-underline text-text-muted hover:text-text-primary transition-colors duration-150"
          style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          Browse all {stats?.total || 100} harness components <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
