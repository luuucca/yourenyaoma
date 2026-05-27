import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '站内信' }

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  last_message_at: string
  // Joined data
  listings: {
    id: string
    title: string
    price: number | null
    cover_image_path: string | null
    status: string
  } | null
  // Counter-party profile
  buyer_profile: { nickname: string | null } | null
  seller_profile: { nickname: string | null } | null
}

export default async function MessagesInboxPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/messages')

  // 拉用户所有 conversations，按最新消息时间倒序
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      last_message_at,
      listings!conversations_listing_id_fkey (
        id, title, price, cover_image_path, status
      ),
      buyer_profile:profiles!conversations_buyer_id_fkey ( nickname ),
      seller_profile:profiles!conversations_seller_id_fkey ( nickname )
    `,
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
    .returns<Conversation[]>()

  if (error) {
    return (
      <div className="container-page py-6 max-w-2xl">
        <h1 className="font-display text-2xl mb-6">站内信</h1>
        <div className="text-brand-danger text-sm">{error.message}</div>
      </div>
    )
  }

  // 拉每个对话的最新消息 + 该对话内当前用户的未读数
  const convIds = (conversations || []).map((c) => c.id)
  const [lastMessagesRes, unreadRes] = await Promise.all([
    convIds.length > 0
      ? supabase
          .from('messages')
          .select('id, conversation_id, sender_id, body, created_at')
          .in('conversation_id', convIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    convIds.length > 0
      ? supabase
          .from('messages')
          .select('id, conversation_id, sender_id, read_at')
          .in('conversation_id', convIds)
          .is('read_at', null)
          .neq('sender_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const lastByConv = new Map<string, any>()
  ;(lastMessagesRes.data || []).forEach((m: any) => {
    if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m)
  })
  const unreadByConv = new Map<string, number>()
  ;(unreadRes.data || []).forEach((m: any) => {
    unreadByConv.set(
      m.conversation_id,
      (unreadByConv.get(m.conversation_id) || 0) + 1,
    )
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div className="container-page py-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-2xl">站内信</h1>
        <Link
          href="/me"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          返回我的
        </Link>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-16 text-brand-muted text-sm">
          还没有对话。
          <br />
          <span className="text-xs">浏览闲置，对感兴趣的点「发消息」联系卖家。</span>
        </div>
      ) : (
        <ul className="border border-brand-line rounded-2xl overflow-hidden divide-y divide-brand-line bg-white">
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === user.id
            const counterParty = isBuyer
              ? c.seller_profile?.nickname
              : c.buyer_profile?.nickname
            const lastMsg = lastByConv.get(c.id)
            const unread = unreadByConv.get(c.id) || 0
            const listing = c.listings
            const cover = listing?.cover_image_path
              ? `${supabaseUrl}/storage/v1/object/public/listings/${listing.cover_image_path}`
              : null

            return (
              <li key={c.id}>
                <Link
                  href={`/me/messages/${c.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-brand-cream transition-colors"
                >
                  {/* listing 封面 */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-cream shrink-0 relative">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted-soft text-xs">
                        ✦
                      </div>
                    )}
                  </div>

                  {/* 主体 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {counterParty || (isBuyer ? '卖家' : '买家')}
                        <span className="text-[11px] font-normal text-brand-muted ml-2">
                          {isBuyer ? '· 你买' : '· 你卖'}
                        </span>
                      </span>
                      <span className="text-[11px] font-mono text-brand-muted shrink-0">
                        {formatTime(c.last_message_at)}
                      </span>
                    </div>
                    <div className="text-[12px] text-brand-muted truncate mt-0.5">
                      {listing?.title || '已删除的商品'}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[13px] text-brand-ink-soft truncate">
                        {lastMsg
                          ? `${lastMsg.sender_id === user.id ? '你: ' : ''}${lastMsg.body}`
                          : '还没消息'}
                      </span>
                      {unread > 0 && (
                        <span className="bg-brand-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
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

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMin = (now.getTime() - d.getTime()) / 1000 / 60
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${Math.floor(diffMin)} 分钟前`
  if (diffMin < 60 * 24)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diffMin < 60 * 24 * 7)
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  return d.toLocaleDateString('zh-CN', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  })
}
