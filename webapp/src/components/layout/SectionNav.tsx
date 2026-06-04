import { Link, useLocation } from 'react-router-dom'

const sectionLinks = [
  { to: '/fine-tuned', label: 'Overview' },
  { to: '/validation', label: 'Validation' },
  { to: '/components', label: 'Training Data' },
  { to: '/conversations', label: 'Conversations' },
]

export const fineTunedPaths = ['/', '/fine-tuned', '/validation', '/components', '/conversations']

export default function SectionNav() {
  const { pathname } = useLocation()

  const isSection = pathname === '/fine-tuned' ||
    pathname === '/validation' ||
    pathname.startsWith('/components') ||
    pathname === '/conversations'

  if (!isSection) return null

  return (
    <div className="section-nav border-b border-border" style={{ background: 'var(--bg-primary)' }}>
      <div className="page-container flex items-center" style={{ gap: 4, height: 40 }}>
        {sectionLinks.map(l => {
          const active = l.to === '/fine-tuned'
            ? pathname === '/fine-tuned'
            : pathname.startsWith(l.to)
          return (
            <Link
              key={l.to}
              to={l.to}
              className="no-underline transition-colors duration-150"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                background: active ? 'var(--bg-secondary)' : 'transparent',
              }}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
