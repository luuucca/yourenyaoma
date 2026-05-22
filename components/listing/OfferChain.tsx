'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type ChainOffer = {
  id: string
  chain_id: string
  amount: number
  proposer: 'buyer' | 'seller'
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired'
  message: string | null
  created_at: string
}

type Props = {
  chain: ChainOffer[]
  listingPrice: number
  /** Whose perspective is this rendering for? Used to compute "你" / "对方". */
  viewerRole: 'buyer' | 'seller'
}

// Renders one chain's back-and-forth, with action buttons on the LATEST pending
// move (when it's the viewer's turn to respond).
export default function OfferChain({ chain, listingPrice, viewerRole }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [counterAmount, setCounterAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const lastPending = chain.find((o) => o.status === 'pending')
  const isViewerTurn =
    lastPending && lastPending.proposer !== viewerRole // the OTHER party proposed → viewer's turn

  async function act(offerId: string, action: 'accept' | 'reject' | 'counter', amount?: number) {
    setBusyId(offerId)
    setError(null)
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount }),
      })
      const data = await res.json()
      if (!res.ok) setError(data?.error || '操作失败')
      else {
        setCounterFor(null)
        setCounterAmount('')
        router.refresh()
      }
    } catch (e: any) {
      setError(e?.message || '网络错误')
    } finally {
      setBusyId(null)
    }
  }

  const submitCounter = (e: React.FormEvent) => {
    e.preventDefault()
    const v = Number(counterAmount)
    if (!Number.isFinite(v) || v <= 0) {
      setError('请输入有效金额')
      return
    }
    if (lastPending) act(lastPending.id, 'counter', v)
  }

  return (
    <div className="space-y-2.5">
      {chain.map((o) => {
        const isViewersMove = o.proposer === viewerRole
        const sideLabel = isViewersMove ? '你出价' : '对方出价'
        const statusLabel = {
          pending: '等待回应',
          accepted: '✓ 已接受',
          rejected: '✗ 已拒绝',
          countered: '↻ 已回砍',
          expired: '已过期',
        }[o.status]
        const statusColor = {
          pending: 'text-brand-ink-soft',
          accepted: 'text-brand-free',
          rejected: 'text-red-600',
          countered: 'text-brand-ink-soft',
          expired: 'text-brand-muted',
        }[o.status]
        return (
          <div
            key={o.id}
            className={
              'rounded-2xl p-4 border ' +
              (isViewersMove
                ? 'bg-brand-yellow-soft border-brand-yellow-line ml-6'
                : 'bg-brand-cream border-brand-line mr-6')
            }
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-mono uppercase tracking-wider text-brand-muted">
                  {sideLabel}
                </span>
                <span className="font-serif text-[20px] font-bold text-brand-ink">
                  €{Number(o.amount)}
                </span>
              </div>
              <span className={'text-[12px] font-medium ' + statusColor}>{statusLabel}</span>
            </div>
            {o.message && (
              <p className="mt-2 text-[13px] text-brand-ink-soft leading-relaxed whitespace-pre-wrap">
                {o.message}
              </p>
            )}
          </div>
        )
      })}

      {/* Action row — only when the latest pending move is by the OTHER party */}
      {isViewerTurn && lastPending && counterFor !== lastPending.id && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={busyId === lastPending.id}
            onClick={() => act(lastPending.id, 'accept')}
            className="bg-brand-free text-white rounded-pill px-4 py-2 min-h-[40px] text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all disabled:opacity-50"
          >
            ✓ 接受 €{lastPending.amount}
          </button>
          <button
            type="button"
            disabled={busyId === lastPending.id}
            onClick={() => {
              setCounterFor(lastPending.id)
              setCounterAmount('')
            }}
            className="bg-brand-yellow text-brand-ink rounded-pill px-4 py-2 min-h-[40px] text-[13px] font-semibold hover:opacity-90 active:translate-y-px transition-all disabled:opacity-50"
          >
            🪓 回砍一刀
          </button>
          <button
            type="button"
            disabled={busyId === lastPending.id}
            onClick={() => act(lastPending.id, 'reject')}
            className="bg-white border border-brand-line text-brand-ink rounded-pill px-4 py-2 min-h-[40px] text-[13px] font-medium hover:border-brand-ink active:translate-y-px transition-all disabled:opacity-50"
          >
            拒绝
          </button>
        </div>
      )}

      {isViewerTurn && lastPending && counterFor === lastPending.id && (
        <form
          onSubmit={submitCounter}
          className="rounded-2xl p-4 bg-white border border-brand-ink mt-2"
        >
          <div className="text-[13px] font-medium text-brand-ink mb-2">
            回砍一刀 — 你的报价（需高于对方 €{lastPending.amount}，低于原价 €{listingPrice}）
          </div>
          <div className="flex gap-2 items-stretch">
            <div className="flex items-stretch border border-brand-ink rounded-pill overflow-hidden bg-white flex-1">
              <span className="px-3 flex items-center font-serif text-[16px] font-bold bg-brand-yellow-soft">
                €
              </span>
              <input
                type="number"
                step="1"
                min={Number(lastPending.amount) + 1}
                max={listingPrice - 1}
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 outline-none text-[15px] font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={busyId === lastPending.id}
              className="bg-brand-ink text-white rounded-pill px-4 py-2 text-[13px] font-medium hover:opacity-85 disabled:opacity-50"
            >
              发送
            </button>
            <button
              type="button"
              onClick={() => setCounterFor(null)}
              className="text-[13px] text-brand-ink-soft underline underline-offset-4 hover:text-brand-ink"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-[13px]">{error}</div>
      )}
    </div>
  )
}
