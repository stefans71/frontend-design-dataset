interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors rounded-[var(--radius)]'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'text-white cursor-pointer',
    secondary: 'border cursor-pointer',
    ghost: 'cursor-pointer',
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{
        ...(variant === 'primary' && { backgroundColor: 'var(--accent)' }),
        ...(variant === 'secondary' && { borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'transparent' }),
        ...(variant === 'ghost' && { color: 'var(--text-secondary)', backgroundColor: 'transparent' }),
      }}
      {...props}
    >
      {children}
    </button>
  )
}
