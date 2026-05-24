interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  wide?: boolean
}

export default function PageWrapper({ children, className = '', wide = false }: PageWrapperProps) {
  return (
    <div className={`page-enter px-6 py-8 mx-auto ${wide ? 'max-w-7xl' : 'max-w-6xl'} ${className}`}>
      {children}
    </div>
  )
}
