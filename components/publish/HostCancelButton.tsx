'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cancelHangout } from '@/app/(public)/buddies/[id]/actions'

type Props = {
  hangoutId: string
  hangoutTitle: string
}

// Host-only "取消活动" with confirm. After cancel, RLS-restricted to host,
// and the listing remains visible (status=cancelled) but with a red 「已取消」
// pill on the detail page.
export default function HostCancelButton({ hangoutId, hangoutTitle }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    if (!confirm(`确定取消「${hangoutTitle}」？\n\n取消后会显示「已取消」状态，已加入的邻居不会再收到提醒。`))
      return
    setBusy(true)
    setError(null)
    const r = await cancelHangout(hangoutId)
    setBusy(false)
    if (r.error) {
      setError(r.error)
      return
    }
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="bg-white border border-brand-line text-brand-ink-soft hover:text-red-700 hover:border-red-300 rounded-pill px-4 py-2.5 min-h-[44px] text-[12px] font-medium active:translate-y-px transition-all duration-150 disabled:opacity-50"
      >
        {busy ? '取消中…' : '取消活动'}
      </button>
      {error && (
        <div className="mt-2 text-[12px] text-red-700">{error}</div>
      )}
    </>
  )
}
