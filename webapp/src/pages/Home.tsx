import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '@/lib/api'
import Card from '@/components/ui/Card'
import PageWrapper from '@/components/ui/PageWrapper'
import GradientDivider from '@/components/ui/GradientDivider'
import { useInView } from '@/hooks/useInView'

interface Stats {
  total_components: number
  total_conversations: number
  avg_score: number
  categories?: Record<string, number>
}

function AnimatedNumber({ value, suffix }: { value: string; suffix?: string }) {
  return (
    <span className="font-mono text-3xl font-bold text-text-primary tabular-nums">
      {value}
      {suffix && <span className="text-sm font-normal text-text-muted ml-0.5">{suffix}</span>}
    </span>
  )
}

function StatCard({ label, value, suffix, href }: { label: string; value: number | string; suffix?: string; href: string }) {
  const { ref, visible } = useInView()
  return (
    <Link to={href} className="no-underline">
      <div
        ref={ref}
        className={`reveal ${visible ? 'visible' : ''} group p-5 rounded-[var(--radius-lg)] bg-bg-card border border-border hover:border-border-accent hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
      >
        <span className="label-caps text-text-muted">{label}</span>
        <div className="mt-2">
          <AnimatedNumber value={String(value)} suffix={suffix} />
        </div>
        <div className="h-0.5 bg-accent/20 mt-3 rounded-full group-hover:bg-accent/40 transition-colors" />
      </div>
    </Link>
  )
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  return (
    <PageWrapper>
      {/* Hero */}
      <div className="relative py-12 mb-10">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
        }} />
        <h1 className="font-display text-5xl text-text-display tracking-tight relative">
          Frontend Design Expert
        </h1>
        <p className="text-lg text-text-secondary mt-3 max-w-xl relative">
          Training dataset explorer for the Qwen3-VL fine-tuned design models
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <StatCard label="Components" value={stats.total_components} href="/components" />
          <StatCard label="Conversations" value={stats.total_conversations} href="/conversations" />
          <StatCard label="Avg Score" value={stats.avg_score?.toFixed(1) ?? '—'} suffix="/9" href="/validation" />
        </div>
      )}

      <GradientDivider className="mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mb-10">
        <Card>
          <h2 className="font-display text-lg text-text-display mb-3">About the Dataset</h2>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              3,090 training records generated from 500 UI components across 5 temperature variants.
              Each component goes through a 6-stage pipeline: generate, render, critique, improve, package, evaluate.
            </p>
            <p>Fine-tuned models available on HuggingFace:</p>
            <ul className="list-disc list-inside space-y-1 text-text-muted">
              <li>8B Expert — 98.1% token accuracy, 0.246 final loss</li>
              <li>4B Lite — 92.5% token accuracy, 0.325 final loss</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-text-display mb-3">Record Types</h2>
          <div className="space-y-1.5 text-sm">
            {[
              ['prompt_to_html', 'Text prompt → HTML component'],
              ['screenshot_to_critique', 'Screenshot → design critique'],
              ['screenshot_to_code', 'Screenshot → HTML code'],
              ['mobile_to_code', 'Mobile screenshot → HTML'],
              ['screenshot_html_to_critique', 'Screenshot + HTML → critique'],
              ['qualifying_conversation', 'Vague request → questions → build'],
            ].map(([type, desc]) => (
              <div key={type} className="flex items-start gap-2">
                <code className="text-xs px-1.5 py-0.5 rounded shrink-0 font-mono bg-bg-secondary text-accent">
                  {type}
                </code>
                <span className="text-text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="spotlight">
        <h2 className="font-display text-lg text-text-display mb-3">Validated Behaviors</h2>
        <GradientDivider className="mb-4" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-4 label-caps text-text-muted">Test</th>
                <th className="text-left py-2.5 pr-4 label-caps text-text-muted">Base 8B</th>
                <th className="text-left py-2.5 pr-4 label-caps text-text-muted">FT 8B</th>
                <th className="text-left py-2.5 label-caps text-text-muted">FT 4B</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Qualifying questions (10 vague)', '1/10', '10/10', '9/10'],
                ['Vision critique specificity', 'Vague', 'px + hex + WCAG', 'px + contrast'],
                ['Token accuracy (training)', '—', '98.1%', '92.5%'],
                ['Clean HTML output', 'Verbose', '0 wrapper chars', '0 wrapper chars'],
              ].map(([test, base, ft8, ft4], i) => (
                <tr key={i} className="border-b border-border-subtle hover:bg-bg-elevated/50 transition-colors">
                  <td className="py-2.5 pr-4 text-text-primary">{test}</td>
                  <td className="py-2.5 pr-4 text-text-secondary">{base}</td>
                  <td className="py-2.5 pr-4 font-medium text-score-high">{ft8}</td>
                  <td className="py-2.5 font-medium text-score-high">{ft4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  )
}
