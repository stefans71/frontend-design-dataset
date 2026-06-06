import { Link, useLocation } from 'react-router-dom'

const fineTunedLinks = [
  { to: '/fine-tuned', label: 'Overview' },
  { to: '/validation', label: 'Validation' },
  { to: '/components', label: 'Training Data' },
  { to: '/conversations', label: 'Conversations' },
]

const piHarnessLinks = [
  { to: '/pi-harness/components', label: 'Testing Data' },
  { to: '/pi-harness/results', label: 'Harness Results' },
]

export const fineTunedPaths = ['/', '/fine-tuned', '/validation', '/components', '/conversations']

export default function SectionNav() {
  const { pathname } = useLocation()

  const isFineTuned = pathname === '/fine-tuned' ||
    pathname === '/validation' ||
    pathname.startsWith('/components') ||
    pathname === '/conversations'

  const isPiHarness = pathname.startsWith('/pi-harness')

  const links = isFineTuned ? fineTunedLinks : isPiHarness ? piHarnessLinks : null

  if (!links) return null

  return (
    <div className="section-nav border-b border-border" style={{ background: 'var(--bg-primary)' }}>
      <div className="page-container flex items-center" style={{ gap: 4, height: 40 }}>
        {links.map(l => {
          const active = l.to === '/fine-tuned'
            ? pathname === '/fine-tuned'
            : l.to === '/pi-harness'
              ? pathname === '/pi-harness'
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
