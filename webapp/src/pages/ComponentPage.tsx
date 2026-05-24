import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComponent } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'
import Shimmer from '@/components/ui/Shimmer'

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
      <div className="page-enter page-container py-8 space-y-4">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-96" />
      </div>
    )
  }

  if (error || !component) {
    return (
      <div className="page-enter page-container py-8">
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-[var(--radius-xl)]">
          <p className="font-display text-xl text-text-muted">Component not found</p>
          <Link to="/components" className="mt-4 text-sm text-accent no-underline hover:text-accent-hover transition-colors">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter page-container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/components" className="label-caps text-text-muted no-underline hover:text-accent transition-colors">
          Gallery
        </Link>
        <span className="text-text-muted/40">/</span>
        <span className="label-caps text-accent">{id}</span>
      </div>
      <ComponentDetail component={component} />
    </div>
  )
}
