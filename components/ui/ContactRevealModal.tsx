'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Contact = {
  wechat?: string | null
  whatsapp?: string | null
  email?: string | null
  phone?: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  contact: Contact | null
  loading?: boolean
  error?: string | null
}

// Generic modal used by Pro "聊一聊", Hangout "我要加入" success, and Free "Take it"
// to show the resolved contact info after the server confirms the reveal/join.
// Renders via portal into document.body so it escapes any clipped section.
export default function ContactRevealModal({
  open,
  onClose,
  title,
  subtitle,
  contact,
  loading,
  error,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!mounted || !open) return null

  // Render via portal so the `fixed` positioning escapes any ancestor that
  // creates a containing block via `transform` (e.g. our ScrollReveal cards,
  // which use translateY for entrance animation).
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-white rounded-2xl max-w-md w-full p-7 shadow-2xl border border-brand-line"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-ink hover:bg-brand-cream transition-colors"
        >
          ✕
        </button>
        <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">{title}</h2>
        {subtitle && (
          <p className="text-[13px] text-brand-muted mt-1.5">{subtitle}</p>
        )}

        {loading && (
          <div className="mt-6 py-8 text-center text-brand-muted text-sm">解锁中…</div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {contact && !loading && !error && (
          <div className="mt-6 space-y-3">
            {contact.wechat && (
              <ContactRow label="微信" value={contact.wechat} />
            )}
            {contact.whatsapp && (
              <ContactRow label="WhatsApp" value={contact.whatsapp} href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} />
            )}
            {contact.email && (
              <ContactRow label="邮箱" value={contact.email} href={`mailto:${contact.email}`} />
            )}
            {contact.phone && (
              <ContactRow label="电话" value={contact.phone} href={`tel:${contact.phone}`} />
            )}
            {!contact.wechat && !contact.whatsapp && !contact.email && !contact.phone && (
              <div className="text-sm text-brand-muted py-3">
                这位邻居还没填联系方式，等他们补完后再试。
              </div>
            )}
            <p className="text-[11px] text-brand-muted pt-3 border-t border-brand-line leading-relaxed">
              提示：站内 IM 即将上线。在此之前请通过上面方式联系，并优先在公共场所交付。
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl bg-brand-cream border border-brand-line">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-brand-muted font-mono uppercase tracking-wider">{label}</span>
        {href ? (
          <a
            href={href}
            className="text-[15px] font-medium text-brand-ink truncate hover:underline"
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {value}
          </a>
        ) : (
          <span className="text-[15px] font-medium text-brand-ink truncate">{value}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        className="text-[12px] text-brand-ink-soft hover:text-brand-ink px-3 py-1.5 rounded-full border border-brand-line bg-white transition-colors active:translate-y-px shrink-0"
        title="复制"
      >
        复制
      </button>
    </div>
  )
}
