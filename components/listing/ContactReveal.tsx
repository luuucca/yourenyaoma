'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type Contact = { wechat?: string | null; whatsapp?: string | null }

export function ContactReveal({
  listingId,
  loggedIn,
  sellerId,
  viewerId,
}: {
  listingId: string
  loggedIn: boolean
  sellerId: string
  viewerId: string | null
}) {
  const { show } = useToast()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`}
        className="block mt-4"
      >
        <Button className="w-full" variant="dark">登录后查看联系方式</Button>
      </Link>
    )
  }

  if (viewerId === sellerId) {
    return <p className="text-xs text-brand-muted mt-4">这是你自己的商品。</p>
  }

  if (contact) {
    return (
      <div className="mt-4 space-y-2 text-sm">
        {contact.wechat && (
          <div className="flex justify-between items-center bg-brand-cream rounded-xl px-3 py-2">
            <span className="text-brand-muted">微信</span>
            <span className="font-mono font-medium">{contact.wechat}</span>
          </div>
        )}
        {contact.whatsapp && (
          <div className="flex justify-between items-center bg-brand-cream rounded-xl px-3 py-2">
            <span className="text-brand-muted">WhatsApp</span>
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[^\d+]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-medium underline"
            >
              {contact.whatsapp}
            </a>
          </div>
        )}
        {!contact.wechat && !contact.whatsapp && (
          <p className="text-xs text-brand-muted">卖家没有填写联系方式。</p>
        )}
        <p className="text-xs text-brand-muted">
          请遵守<Link href="/safety" className="underline">安全交易指南</Link>，不要提前转账。
        </p>
      </div>
    )
  }

  async function reveal() {
    setLoading(true)
    const res = await fetch('/api/reveal-contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId }),
    })
    setLoading(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: '未知错误' }))
      show(error || '解锁失败', 'error')
      return
    }
    const data = await res.json()
    setContact(data.contact ?? {})
  }

  return (
    <Button onClick={reveal} loading={loading} className="w-full mt-4">
      显示卖家联系方式
    </Button>
  )
}
