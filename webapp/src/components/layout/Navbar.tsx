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
    <nav className="sticky top-0 z-50 bg-bg-primary border-b border-border" style={{ height: 56 }}>
      <div className="page-container flex items-center justify-between h-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="font-semibold text-text-primary" style={{ fontSize: 15 }}>FDE</span>
            <span className="text-text-muted hidden sm:inline" style={{ fontSize: 13 }}>Frontend Design Expert</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(l => {
              const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-1.5 rounded-md text-sm no-underline transition-colors duration-150 ${
                    active
                      ? 'text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </div>
    </nav>
  )
}
