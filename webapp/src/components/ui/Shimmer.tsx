export default function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}
