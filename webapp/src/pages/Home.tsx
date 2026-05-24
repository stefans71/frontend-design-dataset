import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '@/lib/api'
import Card from '@/components/ui/Card'

interface Stats {
  total_components: number
  total_conversations: number
  avg_score: number
  categories?: Record<string, number>
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Frontend Design Expert
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Training dataset explorer for the Qwen3-VL fine-tuned design models
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Components" value={stats.total_components} href="/components" />
          <StatCard label="Conversations" value={stats.total_conversations} href="/conversations" />
          <StatCard label="Avg Score" value={stats.avg_score?.toFixed(1) ?? '—'} suffix="/9" href="/validation" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>About the Dataset</h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              3,090 training records generated from 500 UI components across 5 temperature variants.
              Each component goes through a 6-stage pipeline: generate, render, critique, improve, package, evaluate.
            </p>
            <p>
              Fine-tuned models available on HuggingFace:
            </p>
            <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-muted)' }}>
              <li>8B Expert — 98.1% token accuracy, 0.246 final loss</li>
              <li>4B Lite — 92.5% token accuracy, 0.325 final loss</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Record Types</h2>
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
                <code
                  className="text-xs px-1.5 py-0.5 rounded shrink-0 font-mono"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }}
                >
                  {type}
                </code>
                <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Validated Behaviors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Test</th>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Base 8B</th>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>FT 8B</th>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>FT 4B</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-secondary)' }}>
              {[
                ['Qualifying questions (10 vague)', '1/10', '10/10', '9/10'],
                ['Vision critique specificity', 'Vague', 'px + hex + WCAG', 'px + contrast'],
                ['Token accuracy (training)', '—', '98.1%', '92.5%'],
                ['Clean HTML output', 'Verbose', '0 wrapper chars', '0 wrapper chars'],
              ].map(([test, base, ft8, ft4], i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>{test}</td>
                  <td className="py-2 pr-4">{base}</td>
                  <td className="py-2 pr-4 font-medium" style={{ color: 'var(--score-high)' }}>{ft8}</td>
                  <td className="py-2 font-medium" style={{ color: 'var(--score-high)' }}>{ft4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, suffix, href }: { label: string; value: number | string; suffix?: string; href: string }) {
  return (
    <Link to={href} className="no-underline">
      <Card hover>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          {value}
          {suffix && <span className="text-sm font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
        </p>
      </Card>
    </Link>
  )
}
