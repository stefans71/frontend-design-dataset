import { useCallback, useEffect, useRef, useState } from 'react'

export function useInView(options?: IntersectionObserverInit) {
  const [visible, setVisible] = useState(false)
  const elRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    elRef.current = node
    if (!node || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1, ...options }
    )
    observer.observe(node)
    observerRef.current = observer
  }, [visible])

  useEffect(() => () => { observerRef.current?.disconnect() }, [])

  return { ref, visible }
}
