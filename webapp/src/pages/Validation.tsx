import { useState, useEffect } from 'react'
import { getValidationResults } from '@/lib/api'
import type { ValidationResult } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

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
      <div className="space-y-4">
        <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[var(--radius-lg)] animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Validation Results</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Head-to-head comparison: base Qwen3-VL-8B vs fine-tuned model critiques
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Base Model Avg</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {avgBase.toFixed(1)}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/10</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fine-tuned Avg</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {avgFT.toFixed(1)}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/10</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg Delta</p>
          <p className="text-2xl font-bold mt-1" style={{ color: avgDelta >= 0 ? 'var(--score-high)' : 'var(--score-low)' }}>
            {avgDelta >= 0 ? '+' : ''}{avgDelta.toFixed(1)}
          </p>
        </Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-muted)' }}>Component</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
                <th className="text-center p-3 font-medium" style={{ color: 'var(--text-muted)' }}>Base</th>
                <th className="text-center p-3 font-medium" style={{ color: 'var(--text-muted)' }}>Fine-tuned</th>
                <th className="text-center p-3 font-medium" style={{ color: 'var(--text-muted)' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{r.id}</span>
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
                  <td className="p-3 text-center font-medium" style={{ color: r.delta >= 0 ? 'var(--score-high)' : 'var(--score-low)' }}>
                    {r.delta >= 0 ? '+' : ''}{r.delta.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
