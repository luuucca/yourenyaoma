import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import HangoutCover from '@/components/listing/HangoutCover'
import { pickHangoutCover } from '@/lib/utils/hangoutCover'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '我的活动' }

// /me/hangouts — list current user's hangouts.
// Default: hangouts they HOST (so they can cancel / edit agenda).
// ?joined=1 → hangouts they've JOINED but don't host.
export default async function MeHangoutsPage({
  searchParams,
}: {
  searchParams: { joined?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/hangouts')

  const joinedView = searchParams.joined === '1'

  let rows: any[] = []
  if (joinedView) {
    const { data } = await supabase
      .from('hangout_participants')
      .select(
        'hangout_id, joined_at, hangouts!hangout_participants_hangout_id_fkey(id, title, tag, when_text, region, status, taken_spots, total_spots, description)',
      )
      .eq('user_id', user.id)
      .eq('status', 'joined')
      .order('joined_at', { ascending: false })
    rows = (data ?? [])
      .map((p: any) => p.hangouts)
      .filter(Boolean)
  } else {
    const { data } = await supabase
      .from('hangouts')
      .select('id, title, tag, when_text, region, status, taken_spots, total_spots, description, created_at')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
    rows = data ?? []
  }

  return (
    <div className="container-page py-6 max-w-3xl">
      <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
        <h1 className="font-display text-2xl m-0">
          {joinedView ? '我加入的活动' : '我发起的活动'}
        </h1>
        <div className="flex gap-2 text-sm">
          <Link
            href="/me/hangouts"
            className={
              'px-3 py-1.5 rounded-pill transition-colors ' +
              (!joinedView
                ? 'bg-brand-ink text-white'
                : 'bg-white border border-brand-line hover:border-brand-ink')
            }
          >
            发起
          </Link>
          <Link
            href="/me/hangouts?joined=1"
            className={
              'px-3 py-1.5 rounded-pill transition-colors ' +
              (joinedView
                ? 'bg-brand-ink text-white'
                : 'bg-white border border-brand-line hover:border-brand-ink')
            }
          >
            加入
          </Link>
          <Link
            href="/buddies/new"
            className="px-3 py-1.5 rounded-pill bg-brand-yellow text-brand-ink font-medium hover:brightness-95 transition"
          >
            + 发起新活动
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-12 text-center text-brand-muted">
          {joinedView ? (
            <>
              你还没加入任何活动。
              <br />
              <Link href="/buddies" className="text-brand-ink underline mt-2 inline-block">
                去逛搭子
              </Link>
            </>
          ) : (
            <>
              你还没发起过活动。
              <br />
              <Link href="/buddies/new" className="text-brand-ink underline mt-2 inline-block">
                发起一个吧
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((h) => {
            const cover = pickHangoutCover(h.title, h.description, h.tag)
            const remaining = Math.max(0, h.total_spots - h.taken_spots)
            const spotsLabel =
              h.status === 'cancelled'
                ? '已取消'
                : h.status === 'closed'
                  ? '已关闭'
                  : h.status === 'full'
                    ? `已满 ${h.taken_spots} 人`
                    : `${remaining}/${h.total_spots} 缺`
            const statusChipClass =
              h.status === 'cancelled'
                ? 'bg-red-50 text-red-700 border-red-200'
                : h.status === 'closed'
                  ? 'bg-brand-line text-brand-ink-soft border-brand-line'
                  : 'bg-brand-yellow text-brand-ink border-brand-yellow'
            return (
              <li
                key={h.id}
                className="card p-3 flex gap-3 items-center hover:shadow-lg transition"
              >
                <Link
                  href={`/buddies/${h.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
                    <HangoutCover spec={cover} className="h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted">
                        {h.tag}
                      </span>
                      <span
                        className={`text-[10px] py-0.5 px-2 rounded-pill border font-medium ${statusChipClass}`}
                      >
                        {spotsLabel}
                      </span>
                    </div>
                    <div className="font-serif font-semibold text-brand-ink text-[15px] leading-tight truncate">
                      {h.title}
                    </div>
                    <div className="text-xs text-brand-muted mt-1 truncate">
                      🕛 {h.when_text} · 📍 {h.region}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
