'use client'
import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Dialog({ open, onClose, title, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-card w-full max-w-md max-h-[90vh] overflow-auto">
        {title && (
          <div className="px-5 py-4 border-b border-brand-line font-semibold">{title}</div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-brand-line flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
