import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, type = 'button', ...props }: Props) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`button button--${variant} ${className}`}>
    {loading && <span className="spinner" aria-hidden="true" />}{children}
  </button>
}
