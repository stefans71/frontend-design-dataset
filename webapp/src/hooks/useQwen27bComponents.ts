import { useState, useEffect } from 'react'
import type { Qwen27bComponent } from '@/lib/types'
import { getQwen27bComponents } from '@/lib/api'

export function useQwen27bComponents(params: {
  category?: string
  theme?: string
  sort?: string
  page?: number
}) {
  const [items, setItems] = useState<Qwen27bComponent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getQwen27bComponents(params)
      .then(res => {
        setItems(res.items)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
  }, [params.category, params.theme, params.sort, params.page])

  return { items, total, loading }
}
