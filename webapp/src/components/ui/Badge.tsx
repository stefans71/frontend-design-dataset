interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'score-high' | 'score-mid' | 'score-low' | 'accent'
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
  'score-high': { backgroundColor: 'var(--score-high)', color: '#000' },
  'score-mid': { backgroundColor: 'var(--score-mid)', color: '#000' },
  'score-low': { backgroundColor: 'var(--score-low)', color: '#fff' },
  accent: { backgroundColor: 'var(--accent)', color: '#fff' },
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}
