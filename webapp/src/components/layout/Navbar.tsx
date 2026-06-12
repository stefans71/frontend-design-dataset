import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { useFontSize } from '@/hooks/useFontSize'

const links = [
  { to: '/', label: 'Home' },
  { to: '/fine-tuned', label: 'Fine Tuned' },
  { to: '/pi-harness/html-compare', label: 'Pi Harness' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const { size, decrease, increase } = useFontSize()
  const [qwen27bOpen, setQwen27bOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQwen27bOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const isQwen27bActive = pathname.startsWith('/qwen27b')

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary border-b border-border" style={{ height: 60 }}>
      <div className="page-container flex items-center justify-between h-full">
        <div className="flex items-center gap-8 navbar-brand-group">
          <Link to="/" className="flex items-center no-underline">
            <span className="text-text-primary" style={{ fontSize: 18, fontWeight: 800 }}>FDE</span>
            <span className="text-text-muted hidden sm:inline navbar-brand-subtitle" style={{ fontSize: 13, marginLeft: 8 }}>Frontend Design Expert</span>
          </Link>
          <div className="flex items-center navbar-links" style={{ gap: 4 }}>
            {links.map(l => {
              const active = l.to === '/'
                ? pathname === '/'
                : l.to === '/pi-harness/html-compare'
                  ? pathname.startsWith('/pi-harness')
                  : l.to === '/fine-tuned'
                    ? pathname !== '/' && !pathname.startsWith('/pi-harness') && !pathname.startsWith('/qwen27b')
                    : pathname.startsWith(l.to)
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`no-underline transition-colors duration-150 nav-link ${active ? 'active' : ''}`}
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
                </Link>
              )
            })}
            {/* 3.6 27B dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setQwen27bOpen(v => !v)}
                className={`no-underline transition-colors duration-150 nav-link cursor-pointer bg-transparent border-0 flex items-center gap-1 ${isQwen27bActive ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  color: isQwen27bActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isQwen27bActive ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!isQwen27bActive) {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isQwen27bActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                3.6 27B
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginTop: 1, transform: qwen27bOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {qwen27bOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    minWidth: 160,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.15))',
                    padding: '4px',
                    zIndex: 100,
                  }}
                >
                  <Link
                    to="/qwen27b"
                    onClick={() => setQwen27bOpen(false)}
                    className="no-underline flex items-center transition-colors duration-150"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 13,
                      color: pathname === '/qwen27b' || pathname.startsWith('/qwen27b/') ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: pathname.startsWith('/qwen27b') ? 500 : 400,
                      background: pathname.startsWith('/qwen27b') ? 'var(--bg-secondary)' : 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                    onMouseLeave={e => { if (!pathname.startsWith('/qwen27b')) e.currentTarget.style.background = 'transparent' }}
                  >
                    Q5 VS Q8
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 navbar-controls">
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
