'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { pushToUser } from '@/lib/push/send'

/**
 * 站内信 server actions。
 * 所有写操作通过 RLS 自动校验 — 不在 Node 端重复 auth 检查
 * （除了拿 user.id 用于 buyer_id）。
 */

export async function createOrFindConversation(input: {
  listingId: string
  sellerId: string
}): Promise<{ conversationId?: string; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }
  if (user.id === input.sellerId) return { error: '不能给自己发消息' }

  // 先查是否已有对话
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', input.listingId)
    .eq('buyer_id', user.id)
    .eq('seller_id', input.sellerId)
    .maybeSingle()

  if (existing) return { conversationId: existing.id }

  // 不存在则创建
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: input.listingId,
      buyer_id: user.id,
      seller_id: input.sellerId,
    })
    .select('id')
    .single()

  if (error) {
    return { error: `创建对话失败: ${error.message}` }
  }
  return { conversationId: data.id }
}

export async function sendMessage(input: {
  conversationId: string
  body: string
}): Promise<{
  ok?: true
  error?: string
  message?: {
    id: string
    sender_id: string
    body: string
    read_at: string | null
    created_at: string
  }
}> {
  const trimmed = input.body.trim()
  if (!trimmed) return { error: '不能发空消息' }
  if (trimmed.length > 2000) return { error: '消息太长（最多 2000 字）' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select('id, sender_id, body, read_at, created_at')
    .single()

  if (error) {
    return { error: `发送失败: ${error.message}` }
  }
  revalidatePath('/me/messages')
  revalidatePath(`/me/messages/${input.conversationId}`)

  // 给对方推送（失败绝不阻塞发消息）
  try {
    const { data: conv } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', input.conversationId)
      .maybeSingle()
    if (conv) {
      const recipientId =
        conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .maybeSingle()
      await pushToUser(createServiceClient(), recipientId, {
        title: senderProfile?.nickname || '新私信',
        body: trimmed.slice(0, 80),
        url: `/me/messages/${input.conversationId}`,
        tag: `conv-${input.conversationId}`,
      })
    }
  } catch {
    // ignore push failure
  }

  return { ok: true, message: data }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // 标记别人发给我的所有未读消息为已读
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  revalidatePath('/me/messages')
}
