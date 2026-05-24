import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
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
      <div className="page-enter max-w-6xl mx-auto px-6 py-8 space-y-4">
        <Shimmer className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-5">
          <Shimmer className="h-24" />
          <Shimmer className="h-24" />
          <Shimmer className="h-24" />
        </div>
        <Shimmer className="h-64" />
      </div>
    )
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <span className="label-caps text-accent block mb-2">Validation</span>
        <h1 className="font-display text-3xl font-700 text-text-display">Model Comparison</h1>
        <p className="text-sm text-text-muted mt-1">Base Qwen3-VL-8B vs fine-tuned critique quality</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Card>
          <span className="label-caps text-text-muted">Base Model</span>
          <p className="font-mono text-3xl font-bold text-text-primary mt-2 tabular-nums">
            {avgBase.toFixed(1)}<span className="text-lg text-text-muted">/10</span>
          </p>
        </Card>
        <Card>
          <span className="label-caps text-text-muted">Fine-tuned</span>
          <p className="font-mono text-3xl font-bold text-text-primary mt-2 tabular-nums">
            {avgFT.toFixed(1)}<span className="text-lg text-text-muted">/10</span>
          </p>
        </Card>
        <Card variant="spotlight">
          <span className="label-caps text-text-muted">Delta</span>
          <p className={`font-mono text-3xl font-bold mt-2 tabular-nums ${avgDelta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
            {avgDelta >= 0 ? '+' : ''}{avgDelta.toFixed(1)}
          </p>
        </Card>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-card overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated/50 border-b border-border">
                <th className="text-left p-4 label-caps text-text-muted">Component</th>
                <th className="text-left p-4 label-caps text-text-muted">Category</th>
                <th className="text-center p-4 label-caps text-text-muted">Base</th>
                <th className="text-center p-4 label-caps text-text-muted">Fine-tuned</th>
                <th className="text-center p-4 label-caps text-text-muted">Delta</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} className="border-b border-border-subtle hover:bg-bg-elevated/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-xs text-text-primary">{r.id}</span>
                  </td>
                  <td className="p-4">
                    <Badge>{r.category}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={scoreVariant(r.base_score)}>{r.base_score}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={scoreVariant(r.fine_tuned_score)}>{r.fine_tuned_score}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-mono font-bold ${r.delta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
                      {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
