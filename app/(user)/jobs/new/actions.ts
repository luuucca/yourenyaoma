'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const jobSchema = z.object({
  title: z.string().trim().min(4, '标题至少 4 字').max(80, '标题不超过 80 字'),
  description: z
    .string()
    .trim()
    .min(10, '描述至少 10 字')
    .max(2000, '描述不超过 2000 字'),
  region: z.string().trim().min(2, '请填写工作地点').max(80),
  salary_text: z
    .string()
    .trim()
    .max(60, '薪资字段过长')
    .optional()
    .or(z.literal('')),
})

export type JobInput = z.infer<typeof jobSchema>

type Result = { id?: string; error?: string }

export async function publishJob(input: JobInput): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }
  if (!user.email_confirmed_at) return { error: '请先完成邮箱验证' }

  const parsed = jobSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? '校验失败' }

  // 限额：同时只能存在 2 条 published
  const { data: countRes } = await supabase.rpc('active_jobs_count', {
    p_user_id: user.id,
  })
  const activeCount = typeof countRes === 'number' ? countRes : 0
  if (activeCount >= 2) {
    return { error: '你已有 2 条招工广告，先关闭一条再发新的' }
  }

  // 检查 ban + 联系方式必须存在
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, wechat, whatsapp')
    .eq('id', user.id)
    .single()
  if (profile?.role === 'banned') return { error: '账号已被封禁' }
  if (!profile?.wechat && !profile?.whatsapp) {
    return { error: '请先去「我的 → 编辑资料」补充微信或 WhatsApp 后再发布' }
  }

  // 联系方式不再单独存 jobs 表 — 读时 JOIN profile
  // (DB 列保留向后兼容，统一存 null)
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      region: parsed.data.region,
      salary_text: parsed.data.salary_text || null,
      contact_wechat: null,
      contact_whatsapp: null,
      contact_email: null,
      status: 'published',
    })
    .select('id')
    .single()

  if (error || !job) return { error: error?.message ?? '发布失败' }

  revalidatePath('/')
  revalidatePath('/jobs')
  revalidatePath('/me/jobs')
  return { id: job.id }
}

export async function closeJob(jobId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('user_id', user.id) // RLS 也会拦，但显式更安全

  if (error) return { error: error.message }

  revalidatePath('/jobs')
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/me/jobs')
  return { ok: true }
}

export async function reopenJob(jobId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  // 重开前也要查限额
  const { data: countRes } = await supabase.rpc('active_jobs_count', {
    p_user_id: user.id,
  })
  if (typeof countRes === 'number' && countRes >= 2) {
    return { error: '已有 2 条招工广告在线，先关闭一条' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('user_id', user.id)
    .eq('status', 'closed')

  if (error) return { error: error.message }

  revalidatePath('/jobs')
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/me/jobs')
  return { ok: true }
}

export async function deleteJob(jobId: string): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/jobs')
  revalidatePath('/me/jobs')
  return { ok: true }
}
