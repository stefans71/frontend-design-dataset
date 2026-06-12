import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getQwen27bComponent, getQwen27bNeighbors } from '@/lib/api'
import type { Qwen27bComponent } from '@/lib/types'
import ComponentDetail from '@/components/ComponentDetail'
import Shimmer from '@/components/ui/Shimmer'

export default function Qwen27bComponentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [component, setComponent] = useState<Qwen27bComponent | null>(null)
  const [neighbors, setNeighbors] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null })
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!id) return
    if (!component) setInitialLoading(true)
    Promise.all([
      getQwen27bComponent(id),
      getQwen27bNeighbors(id),
    ])
      .then(([comp, nb]) => { setComponent(comp); setNeighbors(nb) })
      .catch(() => setError(true))
      .finally(() => setInitialLoading(false))
  }, [id])

  const lastPage = sessionStorage.getItem('qwen27b-gallery-page') || '0'
  const backTo = `/qwen27b?page=${lastPage}`

  if (initialLoading && !component) {
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
          <Link to="/qwen27b" className="mt-3 text-sm text-text-secondary no-underline hover:text-text-primary transition-colors duration-150">
            &#8592; Back to Q5 VS Q8
          </Link>
        </div>
      </div>
    )
  }

  // Adapt the Qwen27bComponent to the shape ComponentDetail expects
  const adapted = {
    id: component.id,
    prompt: component.prompt,
    temperature: component.temperature,
    run: component.run,
    suffix: '',
    model: 'qwen3.6-27b',
    created_at: '',
    has_html: true,
    has_improved: false,
    has_desktop_png: false,
    has_mobile_png: false,
    has_critique: false,
    category: component.category,
    theme: component.theme as 'dark' | 'light',
    q5_html: component.q5_html,
    q8_va_html: component.q8_va_html,
    q8_vb_html: component.q8_vb_html,
    q8_vc_html: component.q8_vc_html,
    q5_score: component.q5_score,
    q8_va_score: component.q8_va_score,
    q8_vb_score: component.q8_vb_score,
    q8_vc_score: component.q8_vc_score,
    q8_va_critique: component.q8_va_critique,
    q8_vb_critique: component.q8_vb_critique,
    q8_vc_critique: component.q8_vc_critique,
  }

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={backTo}
          className="flex items-center justify-center no-underline text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors duration-150"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
          aria-label="Back to Q5 VS Q8"
        >
          <span style={{ fontSize: 16 }}>&#8592;</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link to={backTo} className="text-text-muted no-underline hover:text-text-primary transition-colors duration-150">
            Q5 VS Q8
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-medium">{id}</span>
        </div>
      </div>
      <ComponentDetail
        component={adapted}
        neighbors={neighbors}
        onNavigate={targetId => navigate(`/qwen27b/${targetId}`)}
        expanded={expanded}
        onExpandedChange={setExpanded}
        mode="qwen27b"
      />
    </div>
  )
}
