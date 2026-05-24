import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
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
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-24 mt-4" />
        <Shimmer className="h-64 mt-4" />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="mb-8">
        <span className="section-label">Validation</span>
        <h1 className="font-semibold text-text-primary mt-2" style={{ fontSize: 20 }}>Model Comparison</h1>
        <p className="text-sm text-text-muted mt-1">Base Qwen3-VL-8B vs fine-tuned critique quality</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-border">
          <span className="text-sm text-text-muted">Base Model</span>
          <p className="font-mono text-2xl font-bold text-text-primary mt-1.5">
            {avgBase.toFixed(1)}<span className="text-sm text-text-muted font-normal">/10</span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <span className="text-sm text-text-muted">Fine-tuned</span>
          <p className="font-mono text-2xl font-bold text-text-primary mt-1.5">
            {avgFT.toFixed(1)}<span className="text-sm text-text-muted font-normal">/10</span>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <span className="text-sm text-text-muted">Delta</span>
          <p className={`font-mono text-2xl font-bold mt-1.5 ${avgDelta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
            {avgDelta >= 0 ? '+' : ''}{avgDelta.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Results table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary">
              <th className="text-left p-3 text-text-muted font-medium" style={{ fontSize: 12 }}>Component</th>
              <th className="text-left p-3 text-text-muted font-medium" style={{ fontSize: 12 }}>Category</th>
              <th className="text-center p-3 text-text-muted font-medium" style={{ fontSize: 12 }}>Base</th>
              <th className="text-center p-3 text-text-muted font-medium" style={{ fontSize: 12 }}>Fine-tuned</th>
              <th className="text-center p-3 text-text-muted font-medium" style={{ fontSize: 12 }}>Delta</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-t border-border-subtle hover:bg-bg-secondary/50 transition-colors duration-100">
                <td className="p-3">
                  <span className="font-mono text-xs text-text-primary">{r.id}</span>
                </td>
                <td className="p-3">
                  <Badge>{r.category}</Badge>
                </td>
                <td className="p-3 text-center">
                  <Badge variant={scoreVariant(r.base_score)}>{r.base_score}</Badge>
                </td>
                <td className="p-3 text-center">
                  <Badge variant={scoreVariant(r.fine_tuned_score)}>{r.fine_tuned_score}</Badge>
                </td>
                <td className="p-3 text-center">
                  <span className={`font-mono font-medium ${r.delta >= 0 ? 'text-score-high' : 'text-score-low'}`}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
