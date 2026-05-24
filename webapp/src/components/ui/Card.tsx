interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', padding = true, hover = false }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] ${padding ? 'p-5' : ''} ${hover ? 'transition-shadow hover:shadow-lg' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {children}
    </div>
  )
}
