'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ContactRevealModal from '@/components/ui/ContactRevealModal'

type Props = {
  proUserId: string
  proName: string
  /** Whether the current viewer is authenticated. Server-rendered. */
  isAuthed: boolean
}

// Client island for the "聊一聊" button on each pro card.
// Not authed → redirect to /login?next=/. Authed → POST /api/reveal-pro-contact
// and display the contact info in a modal.
export default function ProContactButton({ proUserId, proName, isAuthed }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent('/pros')}`)
      return
    }
    setOpen(true)
    setLoading(true)
    setError(null)
    setContact(null)
    try {
      const res = await fetch('/api/reveal-pro-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pro_user_id: proUserId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error === 'unauthorized' ? '请先登录' : (data?.error || '解锁失败'))
      } else {
        setContact(data)
      }
    } catch (e: any) {
      setError(e?.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`联系 ${proName}`}
        className="bg-brand-ink text-white py-2.5 px-4 min-h-[44px] rounded-pill text-[12px] font-medium hover:opacity-85 active:translate-y-px transition-all duration-150"
      >
        聊一聊
      </button>
      <ContactRevealModal
        open={open}
        onClose={() => setOpen(false)}
        title={`联系 ${proName}`}
        subtitle="平台已认证 · 同城见面优先 · 留存站内沟通记录"
        loading={loading}
        error={error}
        contact={contact}
      />
    </>
  )
}
