'use client'
import { useState } from 'react'

type Props = {
  title: string
  /** Path without origin, e.g. /listing/abc. We resolve origin at click time
   *  so the share URL has the user's actual host (works across dev/prod). */
  path: string
  className?: string
}

// Native share when available (mobile Safari + Android Chrome), copy-to-
// clipboard everywhere else. Keeps the brand styling and shows a transient
// confirmation badge.
export default function ShareButton({ title, path, className }: Props) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (busy) return
    setBusy(true)
    const url = `${window.location.origin}${path}`
    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, url })
          // navigator.share returns void on success; we can't show "复制" but
          // OS UI gives feedback. Done.
        } catch (e: any) {
          // user cancelled is `AbortError` — silent
          if (e?.name !== 'AbortError') {
            await fallback(url)
          }
        }
      } else {
        await fallback(url)
      }
    } finally {
      setBusy(false)
    }
  }

  async function fallback(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // last-resort: open a prompt with the URL so user can copy manually
      window.prompt('复制下面这个链接：', url)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="分享链接"
      className={
        className ||
        'inline-flex items-center justify-center gap-1.5 bg-white border border-brand-line text-brand-ink-soft hover:text-brand-ink hover:border-brand-ink rounded-pill px-4 h-10 text-sm font-medium active:translate-y-px transition-all'
      }
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
        <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
      </svg>
      {copied ? '已复制链接' : '分享'}
    </button>
  )
}
