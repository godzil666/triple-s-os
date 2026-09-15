import { useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string }
export function Select({ label, hint, error, id, className = '', children, ...props }: Props) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  return <div className={`field ${className}`}>
    <label htmlFor={fieldId}>{label}</label>
    <div className="select-wrap">
      <select {...props} id={fieldId} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${fieldId}-description` : undefined}>{children}</select>
      <ChevronDown size={16} aria-hidden="true" />
    </div>
    {(error || hint) && <p id={`${fieldId}-description`} className={error ? 'field-error' : 'field-hint'}>{error || hint}</p>}
  </div>
}
