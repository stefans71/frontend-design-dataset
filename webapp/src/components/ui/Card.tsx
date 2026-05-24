interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-bg-card shadow-[var(--shadow-sm)] ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
