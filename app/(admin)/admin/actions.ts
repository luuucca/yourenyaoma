'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' as const, supabase: null, user: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return { error: '需要管理员权限' as const, supabase: null, user: null }
  }
  return { error: null as null, supabase, user }
}

async function logAction(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  listingId?: string,
  userId?: string,
  reason?: string,
) {
  await supabase.from('moderation_logs').insert({
    admin_id: adminId,
    listing_id: listingId ?? null,
    user_id: userId ?? null,
    action,
    reason: reason ?? null,
  })
}

function revalidateBrowse() {
  revalidatePath('/')
  revalidatePath('/browse')
}

export async function approveListing(id: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('listings')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      rejected_reason: null,
      rejected_at: null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'approve', id)
  revalidatePath('/admin/pending')
  revalidateBrowse()
  return { ok: true }
}

export async function rejectListing(id: string, reason: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('listings')
    .update({
      status: 'rejected',
      rejected_reason: reason,
      rejected_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'reject', id, undefined, reason)
  revalidatePath('/admin/pending')
  return { ok: true }
}

export async function hideListing(id: string, reason?: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('listings')
    .update({ status: 'hidden' })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'hide', id, undefined, reason)
  revalidatePath('/admin/pending')
  revalidateBrowse()
  return { ok: true }
}

export async function unhideListing(id: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('listings')
    .update({ status: 'published', report_count: 0 })
    .eq('id', id)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'unhide', id)
  revalidatePath('/admin/pending')
  revalidateBrowse()
  return { ok: true }
}

export async function banUser(userId: string, reason?: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('profiles')
    .update({ role: 'banned' })
    .eq('id', userId)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'ban_user', undefined, userId, reason)
  revalidatePath('/admin/users')
  return { ok: true }
}

export async function unbanUser(userId: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)
  if (error) return { error: error.message }
  await logAction(r.supabase, r.user.id, 'unban_user', undefined, userId)
  revalidatePath('/admin/users')
  return { ok: true }
}

/**
 * Manually mark a user's email as verified — used as a fallback for Chinese
 * email providers (QQ / 163 / 新浪 / 139) that reject Supabase's default
 * outgoing SMTP. Calls auth.v1.admin.users via service_role, since the regular
 * supabase-js client doesn't expose admin user management.
 */
export async function confirmUserEmail(userId: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_confirm: true }),
  })
  if (!res.ok) {
    const body = await res.text()
    return { error: `Auth admin API ${res.status}: ${body}` }
  }
  await logAction(r.supabase, r.user.id, 'confirm_email_manual', undefined, userId)
  revalidatePath('/admin/users')
  return { ok: true }
}

export async function resolveReport(reportId: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('reports')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) return { error: error.message }
  revalidatePath('/admin/reports')
  return { ok: true }
}

export async function dismissReport(reportId: string) {
  const r = await requireAdmin()
  if (!r.supabase) return { error: r.error }
  const { error } = await r.supabase
    .from('reports')
    .update({ status: 'dismissed', resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) return { error: error.message }
  revalidatePath('/admin/reports')
  return { ok: true }
}
