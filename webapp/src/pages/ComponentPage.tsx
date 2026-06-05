import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getComponent, getComponentNeighbors } from '@/lib/api'
import type { ComponentWithScore } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'
import Shimmer from '@/components/ui/Shimmer'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ComponentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [component, setComponent] = useState<(ComponentWithScore & { critique?: string; improved_html?: string; component_html?: string }) | null>(null)
  const [neighbors, setNeighbors] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getComponent(id),
      getComponentNeighbors(id),
    ])
      .then(([comp, nb]) => { setComponent(comp); setNeighbors(nb) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const lastPage = sessionStorage.getItem('gallery-page') || '0'
  const backTo = `/components?page=${lastPage}`

  const navButton = (targetId: string | null, direction: 'prev' | 'next') => (
    <button
      onClick={() => targetId && navigate(`/components/${targetId}`)}
      disabled={!targetId}
      className="flex items-center justify-center cursor-pointer disabled:cursor-default disabled:opacity-25 text-text-muted hover:text-text-primary hover:bg-bg-secondary bg-transparent transition-colors duration-150"
      style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
      aria-label={direction === 'prev' ? 'Previous component' : 'Next component'}
    >
      {direction === 'prev' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  )

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={backTo}
            className="flex items-center justify-center no-underline text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors duration-150"
            style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
            aria-label="Back to Training Data"
          >
            <span style={{ fontSize: 16 }}>←</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link to={backTo} className="text-text-muted no-underline hover:text-text-primary transition-colors duration-150">
              Components
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary font-medium">{id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {navButton(neighbors.prev, 'prev')}
          {navButton(neighbors.next, 'next')}
        </div>
      </div>
      <ComponentDetail
        component={component}
        neighbors={neighbors}
        onNavigate={targetId => navigate(`/components/${targetId}`)}
      />
    </div>
  )
}
