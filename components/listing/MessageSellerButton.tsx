'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createOrFindConversation } from '@/app/(user)/me/messages/actions'

/**
 * Listing 详情页「发消息」按钮 — 跟现有 ContactReveal 并存。
 *
 * 流程：
 * - 未登录：跳登录页
 * - 自己的商品：不显示
 * - 点击：创建/查找 conversation → 跳到 /me/messages/{id}
 */
export function MessageSellerButton({
  listingId,
  sellerId,
  loggedIn,
  viewerId,
}: {
  listingId: string
  sellerId: string
  loggedIn: boolean
  viewerId: string | null
}) {
  const router = useRouter()
  const { show } = useToast()
  const [loading, setLoading] = useState(false)

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`}
        className="block w-full"
      >
        <Button className="w-full" variant="primary">
          登录后发消息
        </Button>
      </Link>
    )
  }

  if (viewerId === sellerId) return null

  async function start() {
    setLoading(true)
    const result = await createOrFindConversation({ listingId, sellerId })
    setLoading(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    if (result.conversationId) {
      router.push(`/me/messages/${result.conversationId}`)
    }
  }

  return (
    <Button
      onClick={start}
      loading={loading}
      variant="primary"
      className="w-full"
    >
      💬 发消息
    </Button>
  )
}
