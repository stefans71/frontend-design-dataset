interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'score-high' | 'score-mid' | 'score-low' | 'accent' | 'outline'
}

const variantClasses: Record<string, string> = {
  default: 'bg-bg-elevated text-text-secondary border border-border-subtle',
  'score-high': 'bg-score-high/10 text-score-high border border-score-high/20',
  'score-mid': 'bg-score-mid/10 text-score-mid border border-score-mid/20',
  'score-low': 'bg-score-low/10 text-score-low border border-score-low/20',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  outline: 'bg-transparent border border-border text-text-secondary',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded font-mono ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
