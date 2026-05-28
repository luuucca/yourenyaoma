import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GiveawayManager } from '@/components/admin/GiveawayManager'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '抽奖管理' }

export default async function AdminGiveawayPage() {
  const supabase = createClient()

  const { data: giveaways } = await supabase
    .from('giveaways')
    .select('id, title, prize, starts_at, ends_at, status')
    .order('created_at', { ascending: false })

  // 拉每个抽奖的开奖结果
  const ids = (giveaways || []).map((g: any) => g.id)
  const drawByGiveaway = new Map<string, any>()
  if (ids.length > 0) {
    const { data: draws } = await supabase
      .from('giveaway_draws')
      .select('giveaway_id, winner_nickname, winner_email_masked, eligible_count, drawn_at')
      .in('giveaway_id', ids)
    ;(draws || []).forEach((d: any) => drawByGiveaway.set(d.giveaway_id, d))
  }

  const withDraws = (giveaways || []).map((g: any) => ({
    ...g,
    draw: drawByGiveaway.get(g.id) || null,
  }))

  return (
    <div className="container-page py-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-2xl">抽奖管理</h1>
        <Link
          href="/admin"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          返回后台
        </Link>
      </div>
      <GiveawayManager giveaways={withDraws} />
    </div>
  )
}
