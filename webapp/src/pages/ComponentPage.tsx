import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComponent } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'

export default function ComponentPage() {
  const { id } = useParams<{ id: string }>()
  const [component, setComponent] = useState<(ComponentWithScore & { critique?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getComponent(id)
      .then(setComponent)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
        <div className="h-96 rounded-[var(--radius-lg)] animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
      </div>
    )
  }

  if (error || !component) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Component not found</p>
        <Link
          to="/components"
          className="mt-3 text-sm no-underline"
          style={{ color: 'var(--accent)' }}
        >
          Back to Gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/components"
          className="text-sm no-underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Gallery
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{id}</span>
      </div>
      <ComponentDetail component={component} />
    </div>
  )
}
