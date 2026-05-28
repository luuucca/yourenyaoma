'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { pushToUser } from '@/lib/push/send'

type Result = { ok?: true; error?: string }

// Host-only: update the agenda (description) for their own hangout.
export async function updateHangoutDescription(
  hangoutId: string,
  description: string,
): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  if (description.length > 2000) return { error: '内容过长（最多 2000 字）' }

  // RLS already enforces host_id = auth.uid() for update, so this will fail
  // silently for non-hosts. We also pass user.id to make it explicit.
  const { error } = await supabase
    .from('hangouts')
    .update({ description: description.trim() || null })
    .eq('id', hangoutId)
    .eq('host_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/buddies/${hangoutId}`)
  revalidatePath('/buddies')
  return { ok: true }
}

// Group chat — send a message to a hangout. RLS enforces membership.
export async function sendHangoutMessage(input: {
  hangoutId: string
  body: string
}): Promise<{
  ok?: true
  error?: string
  message?: { id: string; sender_id: string; body: string; created_at: string }
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
    .from('hangout_messages')
    .insert({
      hangout_id: input.hangoutId,
      sender_id: user.id,
      body: trimmed,
    })
    .select('id, sender_id, body, created_at')
    .single()

  if (error) {
    return { error: `发送失败: ${error.message}` }
  }

  // 给群里除发送者外的所有成员推送（失败不阻塞发消息）
  try {
    const svc = createServiceClient()
    const { data: hangout } = await svc
      .from('hangouts')
      .select('host_id, title')
      .eq('id', input.hangoutId)
      .maybeSingle()
    const { data: parts } = await svc
      .from('hangout_participants')
      .select('user_id')
      .eq('hangout_id', input.hangoutId)
      .eq('status', 'joined')

    const memberIds = new Set<string>()
    if (hangout?.host_id) memberIds.add(hangout.host_id)
    ;(parts || []).forEach((p: any) => memberIds.add(p.user_id))
    memberIds.delete(user.id)

    const { data: senderProfile } = await svc
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle()
    const senderName = senderProfile?.nickname || '群友'

    await Promise.all(
      Array.from(memberIds).map((uid) =>
        pushToUser(svc, uid, {
          title: hangout?.title || '搭子群聊',
          body: `${senderName}: ${trimmed.slice(0, 70)}`,
          url: `/buddies/${input.hangoutId}`,
          tag: `hangout-${input.hangoutId}`,
        }),
      ),
    )
  } catch {
    // ignore push failure
  }

  return { ok: true, message: data }
}

// Host-only: cancel their hangout (sets status to 'cancelled').
export async function cancelHangout(hangoutId: string): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  const { error } = await supabase
    .from('hangouts')
    .update({ status: 'cancelled' })
    .eq('id', hangoutId)
    .eq('host_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/buddies/${hangoutId}`)
  revalidatePath('/buddies')
  return { ok: true }
}
