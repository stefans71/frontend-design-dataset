import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ComponentWithScore } from '@/lib/types'

export default function ComponentCard({ component, basePath = '/components' }: { component: ComponentWithScore; index?: number; basePath?: string }) {
  const c = component
  const score = c.score?.total ?? c.total
  const [imgFailed, setImgFailed] = useState(false)

  const idMatch = c.id.match(/component-(\d+)-run(\d+)/)
  const shortId = idMatch ? `#${idMatch[1]}-r${idMatch[2]}` : c.id

  return (
    <Link
      to={`${basePath}/${c.id}`}
      className="block overflow-hidden no-underline bg-bg-card card-hover-lift"
      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
    >
      {/* Zone 1 — Screenshot */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {imgFailed ? (
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--bg-secondary)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, color: 'var(--text-muted)',
          }}>
            <span style={{ fontSize: 24 }}>⬡</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{c.category}</span>
          </div>
        ) : (
          <img
            src={`/screenshots/${c.id}-desktop.webp`}
            alt={c.prompt}
            loading="lazy"
            className="w-full h-full object-cover object-top"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            onError={() => setImgFailed(true)}
          />
        )}
        {score !== undefined && (
          <span className="absolute font-mono" style={{
            top: 8, right: 8, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            backdropFilter: 'blur(4px)',
            background: score >= 7 ? 'rgba(34,197,94,0.8)' : score >= 5 ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)',
            color: '#fff',
          }}>
            {score}/9
          </span>
        )}
        <span className="absolute" style={{ top: 8, left: 8, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.8)' }}>
          {c.category}
        </span>
        <span className="absolute font-mono" style={{
          bottom: 8, right: 8, fontSize: 10, fontWeight: 600,
          padding: '2px 6px', borderRadius: 4,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          color: 'rgba(255,255,255,0.7)',
        }}>
          {shortId}
        </span>
      </div>

      {/* Zone 2 — Prompt */}
      <div style={{ padding: '12px 14px' }}>
        <p className="text-text-primary" style={{ fontSize: 13, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {c.prompt}
        </p>
      </div>

      {/* Zone 3 — Metadata footer */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4,
            border: '1px solid var(--border-subtle)', flexShrink: 0,
          }}>
            <span style={{ background: 'linear-gradient(90deg, #f97316 0%, #2dd4bf 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>Qwen3.6-27B</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.category} · {c.theme} · T={c.temperature}
          </span>
        </div>
        {score !== undefined && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 99, flexShrink: 0,
            background: score >= 8 ? 'rgba(74,222,128,0.1)' : score >= 6 ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)',
            color: score >= 8 ? 'var(--score-high)' : score >= 6 ? 'var(--score-mid)' : 'var(--score-low)',
            border: `1px solid ${score >= 8 ? 'rgba(74,222,128,0.3)' : score >= 6 ? 'rgba(251,146,60,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {score}/9
          </span>
        )}
      </div>
    </Link>
  )
}
