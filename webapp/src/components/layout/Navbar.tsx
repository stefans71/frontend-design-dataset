import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { useFontSize } from '@/hooks/useFontSize'

const links = [
  { to: '/', label: 'Home' },
  { to: '/validation', label: 'Validation' },
  { to: '/components', label: 'Gallery' },
  { to: '/conversations', label: 'Conversations' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const { size, decrease, increase } = useFontSize()

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary border-b border-border" style={{ height: 60 }}>
      <div className="page-container flex items-center justify-between h-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center no-underline">
            <span className="text-text-primary" style={{ fontSize: 18, fontWeight: 800 }}>FDE</span>
            <span className="text-text-muted hidden sm:inline" style={{ fontSize: 13, marginLeft: 8 }}>Frontend Design Expert</span>
          </Link>
          <div className="flex items-center" style={{ gap: 4 }}>
            {links.map(l => {
              const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="no-underline transition-colors duration-150"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 14,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 400,
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {l.label}
                  {active && (
                    <span style={{ display: 'block', height: 2, background: 'var(--accent)', marginTop: 2, borderRadius: 1 }} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={decrease}
            disabled={size === 'sm'}
            className="flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text-secondary border border-border hover:border-text-muted transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-default bg-transparent"
            style={{ fontSize: 12, fontWeight: 600 }}
            aria-label="Decrease font size"
          >
            A−
          </button>
          <button
            onClick={increase}
            disabled={size === 'lg'}
            className="flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text-secondary border border-border hover:border-text-muted transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-default bg-transparent"
            style={{ fontSize: 12, fontWeight: 600 }}
            aria-label="Increase font size"
          >
            A+
          </button>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </div>
    </nav>
  )
}
