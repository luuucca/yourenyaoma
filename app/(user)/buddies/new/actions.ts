'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hangoutSchema, type HangoutInput } from '@/lib/validations/hangout'

type Result = { id?: string; error?: string }

export async function createHangout(input: HangoutInput): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }
  if (!user.email_confirmed_at) return { error: '请先完成邮箱验证' }

  const parsed = hangoutSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? '校验失败' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role === 'banned') return { error: '账号已被封禁，无法发起活动' }

  const { data: hangout, error } = await supabase
    .from('hangouts')
    .insert({
      host_id: user.id,
      title: parsed.data.title,
      tag: parsed.data.tag,
      when_text: parsed.data.when_text,
      region: parsed.data.region,
      total_spots: parsed.data.total_spots,
      description: parsed.data.description || null,
      status: 'open',
    })
    .select('id')
    .single()
  if (error || !hangout) return { error: error?.message ?? '发布失败' }

  revalidatePath('/')
  revalidatePath('/buddies')
  return { id: hangout.id }
}
