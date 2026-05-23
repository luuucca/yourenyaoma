'use client'
import { useEffect } from 'react'
import Link from 'next/link'

// Route-segment error boundary. Triggered when a server / client error bubbles
// inside any `app/...` route. Kept simple — log to console for dev visibility,
// give the user a way out, and offer a retry that resets the boundary.
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app error boundary]', error)
  }, [error])

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-red-700 mb-4">
          something broke
        </div>
        <h1 className="font-serif text-[40px] md:text-[56px] font-bold leading-[1] tracking-[-0.025em] text-brand-ink m-0">
          这里出了点小状况
        </h1>
        <p className="mt-5 text-[15px] text-brand-ink-soft leading-relaxed">
          页面加载时遇到错误。多数情况下重试一次就好；如果持续出问题，
          发邮件给 <strong className="font-mono text-brand-ink">luuucca.97@gmail.com</strong>。
        </p>
        {error?.digest && (
          <p className="mt-3 text-[11px] font-mono text-brand-muted">
            错误编号：{error.digest}
          </p>
        )}
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="bg-brand-ink text-white rounded-pill px-6 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all"
          >
            重试
          </button>
          <Link
            href="/"
            className="bg-white border border-brand-line text-brand-ink rounded-pill px-6 py-3 text-[13px] font-medium hover:border-brand-ink active:translate-y-px transition-all"
          >
            回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
