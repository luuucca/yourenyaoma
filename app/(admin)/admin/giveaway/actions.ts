'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok?: true; error?: string; winner?: string }

async function assertAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' as const }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: '无权限' as const }
  return { user }
}

export async function createGiveaway(input: {
  title: string
  prize: string
  endsAt: string // ISO date
}): Promise<Result> {
  const auth = await assertAdmin()
  if ('error' in auth) return { error: auth.error }

  const title = input.title.trim()
  const prize = input.prize.trim()
  if (title.length < 2 || prize.length < 2) return { error: '标题/奖品太短' }
  const ends = new Date(input.endsAt)
  if (isNaN(ends.getTime()) || ends.getTime() < Date.now()) {
    return { error: '截止时间无效（要在未来）' }
  }

  const supabase = createClient()
  const { error } = await supabase.from('giveaways').insert({
    title,
    prize,
    ends_at: ends.toISOString(),
    status: 'active',
    created_by: auth.user.id,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/giveaway')
  revalidatePath('/giveaway/rules')
  return { ok: true }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return '***'
  const head = name.slice(0, 3)
  return `${head}${'*'.repeat(Math.max(2, name.length - 3))}@${domain}`
}

/**
 * 开奖：用 service-role 拉所有合格用户，随机抽 1 个，写入 giveaway_draws。
 * 合格 = 邮箱已验证 + ≥1 published listing + 注册 ≥ 抽奖启动日。
 */
export async function drawWinner(giveawayId: string, note?: string): Promise<Result> {
  const auth = await assertAdmin()
  if ('error' in auth) return { error: auth.error }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return { error: '缺 SUPABASE_SERVICE_ROLE_KEY' }

  const supabase = createClient()

  // 抽奖本身
  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('id, starts_at, status')
    .eq('id', giveawayId)
    .single()
  if (!giveaway) return { error: '抽奖不存在' }
  if (giveaway.status === 'drawn') return { error: '已经开过奖了' }

  // 已验证邮箱的用户（service-role REST）
  const usersRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    cache: 'no-store',
  })
  if (!usersRes.ok) return { error: '拉取用户失败' }
  const usersData = await usersRes.json()
  const authUsers: { id: string; email?: string; email_confirmed_at?: string }[] =
    usersData.users || usersData
  const confirmedIds = new Set(
    authUsers.filter((u) => u.email_confirmed_at).map((u) => u.id),
  )
  const emailById = new Map(authUsers.map((u) => [u.id, u.email || '']))

  // 注册时间 ≥ starts_at 的 profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname, created_at')
    .gte('created_at', giveaway.starts_at)
  const eligibleByDate = (profiles || []).filter((p: any) =>
    confirmedIds.has(p.id),
  )

  // 这些人里谁有 ≥1 published listing
  const candidateIds = eligibleByDate.map((p: any) => p.id)
  let withListing = new Set<string>()
  if (candidateIds.length > 0) {
    const { data: listingRows } = await supabase
      .from('listings')
      .select('user_id')
      .eq('status', 'published')
      .in('user_id', candidateIds)
    withListing = new Set((listingRows || []).map((r: any) => r.user_id))
  }

  const eligible = eligibleByDate.filter((p: any) => withListing.has(p.id))
  if (eligible.length === 0) {
    return { error: '当前没有合格参与者（需邮箱验证 + 发过 1 条闲置 + 注册晚于启动日）' }
  }

  // 随机抽一个
  const winner = eligible[Math.floor(Math.random() * eligible.length)] as any
  const winnerEmail = emailById.get(winner.id) || ''

  const { error: drawErr } = await supabase.from('giveaway_draws').insert({
    giveaway_id: giveawayId,
    winner_user_id: winner.id,
    winner_nickname: winner.nickname || '邻居',
    winner_email_masked: winnerEmail ? maskEmail(winnerEmail) : null,
    eligible_count: eligible.length,
    note: note?.trim() || null,
    drawn_by: auth.user.id,
  })
  if (drawErr) return { error: `开奖失败: ${drawErr.message}` }

  await supabase.from('giveaways').update({ status: 'drawn' }).eq('id', giveawayId)

  revalidatePath('/admin/giveaway')
  revalidatePath('/giveaway/rules')
  return { ok: true, winner: winner.nickname || '邻居' }
}
