interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'score-high' | 'score-mid' | 'score-low' | 'accent' | 'outline'
}

const variantClasses: Record<string, string> = {
  default: 'bg-bg-secondary text-text-secondary',
  'score-high': 'bg-score-high text-black',
  'score-mid': 'bg-score-mid text-black',
  'score-low': 'bg-score-low text-white',
  accent: 'bg-accent text-white',
  outline: 'bg-transparent border border-border-accent text-accent',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
