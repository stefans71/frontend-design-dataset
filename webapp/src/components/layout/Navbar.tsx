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
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
              <span className="font-display text-sm font-800 text-accent">F</span>
            </div>
            <span className="font-display text-sm font-700 text-text-primary tracking-tight hidden sm:block">
              FDE
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(l => {
              const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 no-underline ${
                    active
                      ? 'text-accent bg-accent-subtle'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
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
