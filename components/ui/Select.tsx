'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, placeholder, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium mb-1.5">{label}</span>}
      <select
        ref={ref}
        className={cn(
          'w-full h-11 px-4 rounded-xl border bg-white outline-none transition appearance-none',
          'bg-[url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%231A1A1A%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_1rem_center] pr-10',
          'border-brand-line focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30',
          error && 'border-brand-danger',
          className,
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-brand-danger">{error}</span>}
    </label>
  )
})
