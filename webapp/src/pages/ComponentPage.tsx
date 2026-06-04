import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComponent } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'
import Shimmer from '@/components/ui/Shimmer'

export default function ComponentPage() {
  const { id } = useParams<{ id: string }>()
  const [component, setComponent] = useState<(ComponentWithScore & { critique?: string; improved_html?: string; component_html?: string }) | null>(null)
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
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-96 mt-4" />
      </div>
    )
  }

  if (error || !component) {
    return (
      <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-text-muted" style={{ fontSize: 16 }}>Component not found</p>
          <Link to="/components" className="mt-3 text-sm text-text-secondary no-underline hover:text-text-primary transition-colors duration-150">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/components"
          className="flex items-center justify-center no-underline text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors duration-150"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
          aria-label="Back to Training Data"
        >
          <span style={{ fontSize: 16 }}>←</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/components" className="text-text-muted no-underline hover:text-text-primary transition-colors duration-150">
            Components
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-medium">{id}</span>
        </div>
      </div>
      <ComponentDetail component={component} />
    </div>
  )
}
