interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'score-high' | 'score-mid' | 'score-low' | 'accent' | 'outline'
}

const variantClasses: Record<string, string> = {
  default: 'bg-bg-elevated text-text-secondary border border-border-subtle',
  'score-high': 'bg-score-high/15 text-score-high border border-score-high/25',
  'score-mid': 'bg-score-mid/15 text-score-mid border border-score-mid/25',
  'score-low': 'bg-score-low/15 text-score-low border border-score-low/25',
  accent: 'bg-accent/15 text-accent border border-accent/25',
  outline: 'bg-transparent border border-border text-text-secondary',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md font-mono ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
