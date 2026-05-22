'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ContactRevealModal from '@/components/ui/ContactRevealModal'

type Props = {
  hangoutId: string
  hangoutTitle: string
  isAuthed: boolean
  /** Whether the current viewer is the host (button disabled in that case). */
  isHost?: boolean
  /** If user already joined, show "退出" toggle. */
  alreadyJoined?: boolean
}

// Toggleable button: joined ↔ leave. Joining surfaces host contact via the
// reveal modal; leaving silently confirms via the same modal.
export default function HangoutJoinButton({
  hangoutId,
  hangoutTitle,
  isAuthed,
  isHost,
  alreadyJoined,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(!!alreadyJoined)

  const handleClick = async () => {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent('/buddies')}`)
      return
    }
    if (isHost) return

    if (joined) {
      // LEAVE flow — no modal needed, just confirm + refresh
      if (!confirm(`确定退出「${hangoutTitle}」？`)) return
      setLoading(true)
      try {
        const res = await fetch('/api/hangouts/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hangout_id: hangoutId }),
        })
        const data = await res.json()
        if (!res.ok) {
          alert(data?.error || '退出失败')
        } else {
          setJoined(false)
          router.refresh()
        }
      } finally {
        setLoading(false)
      }
      return
    }

    // JOIN flow
    setOpen(true)
    setLoading(true)
    setError(null)
    setContact(null)
    try {
      const res = await fetch('/api/hangouts/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hangout_id: hangoutId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || '加入失败')
      } else {
        setJoined(true)
        setContact({
          wechat: data?.host?.wechat,
          whatsapp: data?.host?.whatsapp,
        })
        router.refresh()
      }
    } catch (e: any) {
      setError(e?.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  const label = isHost ? '你是发起人' : joined ? '退出活动' : '我要加入'
  const variant = joined
    ? 'bg-white text-brand-ink border border-brand-line hover:border-brand-ink'
    : 'bg-brand-ink text-white hover:opacity-85'

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isHost || loading}
        aria-label={joined ? `退出「${hangoutTitle}」` : `加入「${hangoutTitle}」`}
        className={`${variant} py-2.5 px-4 min-h-[44px] rounded-pill text-[12px] font-medium active:translate-y-px transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? '处理中…' : label}
      </button>
      <ContactRevealModal
        open={open}
        onClose={() => setOpen(false)}
        title={`已加入：${hangoutTitle}`}
        subtitle="复制发起人联系方式约一下时间和地点。公共场所见面更安心。"
        loading={loading}
        error={error}
        contact={contact}
      />
    </>
  )
}
