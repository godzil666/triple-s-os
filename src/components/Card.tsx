import type { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`card ${className}`}>{children}</div>
}
