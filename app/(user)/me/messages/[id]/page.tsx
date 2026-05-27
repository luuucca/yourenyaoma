import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markConversationRead } from '../actions'
import { ConversationThread } from '@/components/messaging/ConversationThread'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '对话' }

export default async function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/me/messages/${params.id}`)

  const { data: conv } = await supabase
    .from('conversations')
    .select(
      `
      id, listing_id, buyer_id, seller_id, created_at,
      listings!conversations_listing_id_fkey (
        id, title, price, cover_image_path, status
      ),
      buyer_profile:profiles!conversations_buyer_id_fkey ( nickname ),
      seller_profile:profiles!conversations_seller_id_fkey ( nickname )
    `,
    )
    .eq('id', params.id)
    .maybeSingle()

  if (!conv) notFound()
  if (conv.buyer_id !== user.id && conv.seller_id !== user.id) notFound()

  // 标记已读
  await markConversationRead(params.id)

  // 拉历史消息（按时间正序）
  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, body, read_at, created_at')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const listing = (conv as any).listings as {
    id: string
    title: string
    price: number | null
    cover_image_path: string | null
    status: string
  } | null
  const cover = listing?.cover_image_path
    ? `${supabaseUrl}/storage/v1/object/public/listings/${listing.cover_image_path}`
    : null

  const isBuyer = conv.buyer_id === user.id
  const counterParty = isBuyer
    ? (conv as any).seller_profile?.nickname || '卖家'
    : (conv as any).buyer_profile?.nickname || '买家'

  return (
    <div className="container-page py-4 max-w-2xl">
      <div className="mb-3">
        <Link
          href="/me/messages"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          ← 全部对话
        </Link>
      </div>

      {/* 顶部：商品卡片 */}
      {listing && (
        <Link
          href={`/listing/${listing.id}`}
          className="flex items-center gap-3 border border-brand-line rounded-2xl px-3 py-2.5 mb-3 bg-white hover:border-brand-ink transition-colors"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-cream shrink-0 relative">
            {cover ? (
              <Image
                src={cover}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-muted-soft text-xs">
                ✦
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">{listing.title}</div>
            <div className="flex items-center gap-2 text-[12px] text-brand-muted">
              {listing.price !== null && listing.price !== undefined ? (
                <span className="font-mono">€{listing.price}</span>
              ) : null}
              {listing.status === 'sold' && (
                <span className="text-brand-danger">已售出</span>
              )}
              {listing.status === 'hidden' && (
                <span className="text-brand-muted">已下架</span>
              )}
            </div>
          </div>
        </Link>
      )}

      <div className="text-[12px] text-brand-muted mb-2 px-1">
        与 <span className="font-semibold text-brand-ink">{counterParty}</span> 的对话
        <span className="ml-2 text-brand-muted-soft">
          · {isBuyer ? '你是买家' : '你是卖家'}
        </span>
      </div>

      <ConversationThread
        conversationId={params.id}
        viewerId={user.id}
        initialMessages={messages || []}
      />
    </div>
  )
}
