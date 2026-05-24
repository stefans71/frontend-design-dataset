import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComponent } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'
import PageWrapper from '@/components/ui/PageWrapper'
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
      <PageWrapper>
        <div className="space-y-4">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-96" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !component) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-text-muted">Component not found</p>
          <Link to="/components" className="mt-3 text-sm text-accent no-underline hover:text-accent-hover transition-colors">
            Back to Gallery
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/components" className="text-sm text-text-muted no-underline hover:text-accent transition-colors">
            Gallery
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-sm font-mono font-medium text-text-primary">{id}</span>
        </div>
        <ComponentDetail component={component} />
      </div>
    </PageWrapper>
  )
}
