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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border backdrop-blur-md bg-bg-primary/80">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="font-display text-xl text-accent italic">FDE</span>
          <span className="w-px h-4 bg-border-accent" />
          <span className="text-xs font-medium text-text-muted hidden sm:inline tracking-wide">Dataset Explorer</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {links.map(l => {
            const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-[var(--radius)] transition-colors duration-[var(--duration-base)] no-underline ${
                  active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={toggle} />
    </nav>
  )
}
