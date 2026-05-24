import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'

const links = [
  { to: '/', label: 'Home' },
  { to: '/components', label: 'Gallery' },
  { to: '/validation', label: 'Validation' },
  { to: '/conversations', label: 'Conversations' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>FDE</span>
          <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            Dataset Explorer
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => {
            const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 text-sm font-medium rounded-[var(--radius)] transition-colors no-underline"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={toggle} />
    </nav>
  )
}
