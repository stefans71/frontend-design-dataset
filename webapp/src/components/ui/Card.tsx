interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  variant?: 'default' | 'spotlight' | 'ghost' | 'glass'
}

const variantClasses = {
  default: 'bg-bg-card border border-border shadow-[var(--shadow-sm)]',
  spotlight: 'bg-bg-spotlight border border-border-accent shadow-[var(--shadow-sm)]',
  ghost: 'border border-border-subtle bg-transparent',
  glass: 'glass',
}

export default function Card({ children, className = '', padding = true, hover = false, variant = 'default' }: CardProps) {
  return (
    <div
      className={[
        'rounded-[var(--radius-lg)]',
        variantClasses[variant],
        padding ? 'p-5' : '',
        hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-border-accent cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
