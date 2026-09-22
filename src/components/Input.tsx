import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; leading?: ReactNode }
export function Input({ label, hint, error, leading, id, className = '', ...props }: Props) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = `${fieldId}-description`
  return <div className={`field ${className}`}>
    <label htmlFor={fieldId}>{label}</label>
    <div className={`input-wrap ${leading ? 'input-wrap--icon' : ''}`}>
      {leading && <span className="field-icon" aria-hidden="true">{leading}</span>}
      <input {...props} id={fieldId} aria-invalid={!!error || undefined} aria-describedby={error || hint ? descriptionId : undefined} />
    </div>
    {(error || hint) && <p id={descriptionId} className={error ? 'field-error' : 'field-hint'}>{error || hint}</p>}
  </div>
}
