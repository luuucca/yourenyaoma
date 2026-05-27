import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '我的' }

export default async function MePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, district, role')
    .eq('id', user.id)
    .single()

  // Run all the counts in parallel
  const [
    { count: listingCount },
    { count: favoriteCount },
    { count: hostingCount },
    { count: joinedCount },
    { count: offerCount },
    unreadResult,
  ] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('favorites')
      .select('listing_id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('hangouts')
      .select('id', { count: 'exact', head: true })
      .eq('host_id', user.id),
    supabase
      .from('hangout_participants')
      .select('hangout_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'joined'),
    // pending offers involving viewer (as buyer OR seller) — rough "unread" count
    supabase
      .from('price_offers')
      .select('id', { count: 'exact', head: true })
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .eq('status', 'pending'),
    // 站内信未读数
    supabase.rpc('unread_count_total'),
  ])
  const unreadMessages = typeof unreadResult.data === 'number' ? unreadResult.data : 0

  return (
    <div className="container-page py-6 max-w-2xl">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-yellow-soft flex items-center justify-center text-2xl font-medium">
            {profile?.nickname?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{profile?.nickname}</div>
            <div className="text-xs text-brand-muted truncate">{user.email}</div>
            {profile?.role === 'admin' && (
              <div className="text-xs text-brand-yellow font-medium mt-1">管理员</div>
            )}
            {!user.email_confirmed_at && (
              <div className="text-xs text-brand-danger mt-1">邮箱未验证</div>
            )}
          </div>
          <Link href="/me/edit">
            <Button variant="secondary" size="sm">编辑资料</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link
          href="/me/listings"
          className="card p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <span className="text-2xl mb-1">📦</span>
          <span className="font-medium">我的闲置</span>
          <span className="text-xs text-brand-muted">{listingCount ?? 0} 件</span>
        </Link>
        <Link
          href="/me/favorites"
          className="card p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <span className="text-2xl mb-1">❤️</span>
          <span className="font-medium">我的收藏</span>
          <span className="text-xs text-brand-muted">{favoriteCount ?? 0} 件</span>
        </Link>
        <Link
          href="/me/hangouts"
          className="card p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <span className="text-2xl mb-1">🪧</span>
          <span className="font-medium">我发起的活动</span>
          <span className="text-xs text-brand-muted">{hostingCount ?? 0} 场</span>
        </Link>
        <Link
          href="/me/hangouts?joined=1"
          className="card p-4 flex flex-col items-center justify-center hover:shadow-lg transition"
        >
          <span className="text-2xl mb-1">🤝</span>
          <span className="font-medium">我加入的活动</span>
          <span className="text-xs text-brand-muted">{joinedCount ?? 0} 场</span>
        </Link>
        <Link
          href="/me/offers"
          className={
            'card p-4 flex flex-col items-center justify-center hover:shadow-lg transition ' +
            ((offerCount ?? 0) > 0 ? 'border-2 border-brand-yellow' : '')
          }
        >
          <span className="text-2xl mb-1">🪓</span>
          <span className="font-medium">砍价记录</span>
          <span className="text-xs text-brand-muted">
            {(offerCount ?? 0) > 0 ? `${offerCount} 条等回应` : '暂无未读'}
          </span>
        </Link>
        <Link
          href="/me/messages"
          className={
            'card p-4 flex flex-col items-center justify-center hover:shadow-lg transition relative ' +
            (unreadMessages > 0 ? 'border-2 border-brand-danger' : '')
          }
        >
          <span className="text-2xl mb-1">💬</span>
          <span className="font-medium">站内信</span>
          <span className="text-xs text-brand-muted">
            {unreadMessages > 0 ? `${unreadMessages} 条未读` : '暂无未读'}
          </span>
          {unreadMessages > 0 && (
            <span className="absolute top-2 right-2 bg-brand-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadMessages > 99 ? '99+' : unreadMessages}
            </span>
          )}
        </Link>
      </div>

      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          className="card mt-3 p-4 flex items-center justify-between hover:shadow-lg transition"
        >
          <span className="font-medium">🛡️ 管理员后台</span>
          <span className="text-brand-muted">→</span>
        </Link>
      )}

      <form action="/auth/logout" method="POST" className="mt-6">
        <Button type="submit" variant="secondary" size="md" className="w-full">
          退出登录
        </Button>
      </form>
    </div>
  )
}
