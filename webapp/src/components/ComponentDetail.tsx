import type { ComponentWithScore } from '@/lib/types'

export default function ComponentDetail({ component }: { component: ComponentWithScore }) {
  return <div>{component.id}</div>
}
