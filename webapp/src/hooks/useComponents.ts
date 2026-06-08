import { useState, useEffect } from 'react'
import type { ComponentWithScore } from '@/lib/types'
import { getComponents } from '@/lib/api'

export function useComponents(params: {
  category?: string
  theme?: string
  sort?: string
  page?: number
  hasHtmlCompare?: number
}) {
  const [items, setItems] = useState<ComponentWithScore[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getComponents(params)
      .then(res => {
        setItems(res.items)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
  }, [params.category, params.theme, params.sort, params.page, params.hasHtmlCompare])

  return { items, total, loading }
}
