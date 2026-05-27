'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
}): Promise<Result> {
  const trimmed = input.body.trim()
  if (!trimmed) return { error: '不能发空消息' }
  if (trimmed.length > 2000) return { error: '消息太长（最多 2000 字）' }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  const { error } = await supabase.from('hangout_messages').insert({
    hangout_id: input.hangoutId,
    sender_id: user.id,
    body: trimmed,
  })

  if (error) {
    // RLS deny / 其它错
    return { error: `发送失败: ${error.message}` }
  }
  revalidatePath(`/buddies/${input.hangoutId}`)
  return { ok: true }
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
