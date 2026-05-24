interface ShimmerProps {
  className?: string
}

export default function Shimmer({ className = '' }: ShimmerProps) {
  return <div className={`skeleton rounded-[var(--radius-lg)] ${className}`} />
}
