'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...rest },
  ref,
) {
  const inputId = id || rest.name
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium mb-1.5">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full h-11 px-4 rounded-xl border bg-white outline-none transition',
          'border-brand-line focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30',
          error && 'border-brand-danger',
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-brand-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-brand-muted">{hint}</span>
      ) : null}
    </label>
  )
})

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium mb-1.5">{label}</span>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl border bg-white outline-none transition resize-y min-h-[120px]',
          'border-brand-line focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30',
          error && 'border-brand-danger',
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-brand-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-brand-muted">{hint}</span>
      ) : null}
    </label>
  )
})
