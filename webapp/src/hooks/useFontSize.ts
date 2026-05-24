import { useState, useEffect } from 'react'

type FontSize = 'sm' | 'md' | 'lg'

export function useFontSize() {
  const [size, setSize] = useState<FontSize>(() => {
    return (localStorage.getItem('fontSize') as FontSize) || 'md'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', size)
    localStorage.setItem('fontSize', size)
  }, [size])

  const decrease = () => setSize(s => s === 'lg' ? 'md' : s === 'md' ? 'sm' : 'sm')
  const increase = () => setSize(s => s === 'sm' ? 'md' : s === 'md' ? 'lg' : 'lg')

  return { size, decrease, increase }
}
