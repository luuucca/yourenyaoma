'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark' | 'emerald'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-yellow text-brand-ink hover:brightness-95 shadow-pill font-medium',
  secondary: 'bg-white text-brand-ink border border-brand-line hover:border-brand-ink',
  ghost: 'bg-transparent text-brand-ink hover:bg-brand-yellow-soft/50',
  danger: 'bg-brand-danger text-white hover:brightness-95',
  dark: 'bg-brand-ink text-white hover:bg-brand-ink/90',
  emerald: 'bg-brand-emerald text-white hover:brightness-95 font-medium',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-pill transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? '加载中…' : children}
    </button>
  )
})
