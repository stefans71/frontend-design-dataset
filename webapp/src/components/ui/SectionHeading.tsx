interface SectionHeadingProps {
  title: string
  subtitle?: string
  divider?: boolean
  className?: string
}

export default function SectionHeading({ title, subtitle, divider = false, className = '' }: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className="font-display text-2xl text-text-display tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      {divider && <div className="divider-gradient mt-4" />}
    </div>
  )
}
