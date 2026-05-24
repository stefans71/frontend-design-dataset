interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  variant?: 'default' | 'spotlight' | 'ghost'
  glow?: boolean
}

const variantClasses = {
  default: 'bg-bg-card border border-border',
  spotlight: 'bg-bg-spotlight border border-border-accent',
  ghost: 'border border-border-subtle bg-transparent',
}

export default function Card({ children, className = '', padding = true, hover = false, variant = 'default', glow = false }: CardProps) {
  return (
    <div
      className={[
        'rounded-[var(--radius-lg)]',
        variantClasses[variant],
        padding ? 'p-5' : '',
        hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-border-accent cursor-pointer' : '',
        glow ? 'hover:shadow-[var(--shadow-md),var(--shadow-glow)]' : '',
        className,
      ].join(' ')}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </div>
  )
}
