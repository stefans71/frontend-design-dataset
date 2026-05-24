import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PageWrapper from '@/components/ui/PageWrapper'
import SectionHeading from '@/components/ui/SectionHeading'
import Shimmer from '@/components/ui/Shimmer'

function scoreVariant(score: number) {
  if (score >= 7) return 'score-high' as const
  if (score >= 5) return 'score-mid' as const
  return 'score-low' as const
}

export default function Validation() {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getValidationResults()
      .then(setResults)
      .finally(() => setLoading(false))
  }, [])

  const avg = (fn: (r: ValidationResult) => number) =>
    results.length > 0 ? results.reduce((s, r) => s + fn(r), 0) / results.length : 0

  const avgBase = avg(r => r.base_score)
  const avgFT = avg(r => r.fine_tuned_score)
  const avgDelta = avg(r => r.delta)

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <Shimmer className="h-8 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-20" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <SectionHeading
        title="Validation Results"
        subtitle="Head-to-head comparison: base Qwen3-VL-8B vs fine-tuned model critiques"
        divider
        className="mb-8"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Card>
          <span className="label-caps text-text-muted">Base Model Avg</span>
          <p className="font-mono text-2xl font-bold text-text-primary mt-2">
            {avgBase.toFixed(1)}<span className="text-sm font-normal text-text-muted">/10</span>
          </p>
        </Card>
        <Card>
          <span className="label-caps text-text-muted">Fine-tuned Avg</span>
          <p className="font-mono text-2xl font-bold text-text-primary mt-2">
            {avgFT.toFixed(1)}<span className="text-sm font-normal text-text-muted">/10</span>
          </p>
        </Card>
        <Card variant="spotlight">
          <span className="label-caps text-text-muted">Avg Delta</span>
          <p className={`font-mono text-2xl font-bold mt-2 ${avgDelta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
            {avgDelta >= 0 ? '+' : ''}{avgDelta.toFixed(1)}
          </p>
        </Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3.5 label-caps text-text-muted">Component</th>
                <th className="text-left p-3.5 label-caps text-text-muted">Category</th>
                <th className="text-center p-3.5 label-caps text-text-muted">Base</th>
                <th className="text-center p-3.5 label-caps text-text-muted">Fine-tuned</th>
                <th className="text-center p-3.5 label-caps text-text-muted">Delta</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} className="border-b border-border-subtle hover:bg-bg-elevated/50 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono text-xs text-text-primary">{r.id}</span>
                  </td>
                  <td className="p-3.5">
                    <Badge>{r.category}</Badge>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge variant={scoreVariant(r.base_score)}>{r.base_score}</Badge>
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge variant={scoreVariant(r.fine_tuned_score)}>{r.fine_tuned_score}</Badge>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`font-mono font-medium ${r.delta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
                      {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  )
}
