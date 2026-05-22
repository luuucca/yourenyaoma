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
