'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; type: ToastType }

const ToastCtx = createContext<{ show: (m: string, t?: ToastType) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-2 rounded-pill shadow-card text-sm font-medium pointer-events-auto',
              t.type === 'success' && 'bg-brand-free text-white',
              t.type === 'error' && 'bg-brand-danger text-white',
              t.type === 'info' && 'bg-brand-ink text-white',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
