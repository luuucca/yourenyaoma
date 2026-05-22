'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  listingId: string
  listingPrice: number
  loggedIn: boolean
}

// 「砍一刀」 — buyer offers a price < listing.price.
// Renders a button that opens a modal with a price input + optional message.
// On submit, POSTs /api/offers and shows server response.
export default function OfferDialog({ listingId, listingPrice, loggedIn }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState<string>('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ amount: number } | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('请填一个有效金额')
      return
    }
    if (value >= listingPrice) {
      setError(`砍价金额需低于现价 €${listingPrice}`)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          amount: value,
          message: message || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || '提交失败')
      } else {
        setSuccess({ amount: value })
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || '网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  const openModal = () => {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`)
      return
    }
    setAmount('')
    setMessage('')
    setError(null)
    setSuccess(null)
    setOpen(true)
  }

  const node = open && mounted ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="砍一刀"
        className="relative bg-white rounded-2xl max-w-md w-full p-7 shadow-2xl border border-brand-line"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-ink hover:bg-brand-cream transition-colors"
        >
          ✕
        </button>

        {success ? (
          <>
            <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">
              砍价已发送 🎉
            </h2>
            <p className="text-[13px] text-brand-muted mt-2">
              你出价 <strong className="text-brand-ink">€{success.amount}</strong>，
              卖家接到后可以接受、拒绝或回砍。结果会出现在「我的 → 砍价记录」里。
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all"
              >
                好的
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">
              砍一刀
            </h2>
            <p className="text-[13px] text-brand-muted mt-1.5">
              现价 €{listingPrice}。出一个你能接受的价格，卖家可以接受 / 拒绝 / 回砍。
            </p>

            <label className="block mt-5">
              <span className="text-[13px] font-medium text-brand-ink block mb-1.5">
                你想出多少？
              </span>
              <div className="flex items-stretch border border-brand-ink rounded-pill overflow-hidden bg-white">
                <span className="px-4 flex items-center font-serif text-[18px] font-bold text-brand-ink bg-brand-yellow-soft border-r border-brand-yellow-line">
                  €
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="1"
                  max={listingPrice - 1}
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`低于 ${listingPrice}`}
                  className="flex-1 px-3 py-3 outline-none text-[16px] font-medium"
                />
              </div>
            </label>

            <label className="block mt-4">
              <span className="text-[13px] font-medium text-brand-ink block mb-1.5">
                留言（可选）
              </span>
              <textarea
                rows={3}
                maxLength={280}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="可自取，今晚就能取"
                className="w-full px-3 py-2 rounded-2xl border border-brand-line bg-white outline-none focus:border-brand-ink text-[14px]"
              />
            </label>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-[13px]">
                {error}
              </div>
            )}

            <div className="mt-5 flex gap-2 items-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all disabled:opacity-50"
              >
                {submitting ? '发送中…' : '砍他一刀'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[13px] text-brand-ink-soft underline underline-offset-4 hover:text-brand-ink"
              >
                取消
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Match the Button size used by FavoriteButton + ReportDialog (h-10 px-4 text-sm)
          so the three sit on the same baseline, with yellow brand fill to stand out. */}
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center rounded-pill transition disabled:opacity-50 whitespace-nowrap h-10 px-4 text-sm font-medium bg-brand-yellow text-brand-ink hover:brightness-95 shadow-pill flex-1"
      >
        🪓 砍一刀
      </button>
      {node && createPortal(node, document.body)}
    </>
  )
}
