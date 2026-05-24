import type { ComponentWithScore } from '@/lib/types'

export default function ComponentCard({ component }: { component: ComponentWithScore }) {
  return <div>{component.id}</div>
}
