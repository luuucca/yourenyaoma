import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = { title: '砍价记录' }

// /me/offers — centralised offer inbox.
// `?view=received` (default): chains where current user is the SELLER
// `?view=sent`               : chains where current user is the BUYER
// Each chain shows the latest move + a `你的回合` badge when the viewer needs
// to respond. Click the row to jump to the listing detail page which has the
// full OfferChain UI with accept/reject/counter buttons.
export default async function MyOffersPage({
  searchParams,
}: {
  searchParams: { view?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/offers')

  const view: 'received' | 'sent' =
    searchParams.view === 'sent' ? 'sent' : 'received'

  // Fetch all offers where this user is buyer or seller, newest first
  const { data: rows } = await supabase
    .from('price_offers')
    .select(
      'id, chain_id, listing_id, buyer_id, seller_id, proposer, amount, status, created_at, ' +
        'listings!price_offers_listing_id_fkey(id, title, price, listing_images(image_url, sort_order))',
    )
    .order('created_at', { ascending: false })

  // Roll up into chains: keep only the latest move per chain_id
  const seen = new Set<string>()
  const latest: any[] = []
  for (const o of rows ?? []) {
    if (!seen.has(o.chain_id)) {
      seen.add(o.chain_id)
      latest.push(o)
    }
  }

  // Filter by view
  const filtered = latest.filter((o) =>
    view === 'received' ? o.seller_id === user.id : o.buyer_id === user.id,
  )

  // Counts for the tabs (across all chains, not just filtered view)
  const receivedCount = latest.filter((o) => o.seller_id === user.id).length
  const sentCount = latest.filter((o) => o.buyer_id === user.id).length
  // "你的回合" = the latest pending offer was proposed by the OTHER party
  const yourTurnCount = (view === 'received'
    ? latest.filter((o) => o.seller_id === user.id)
    : latest.filter((o) => o.buyer_id === user.id)
  ).filter(
    (o) =>
      o.status === 'pending' &&
      ((view === 'received' && o.proposer === 'buyer') ||
        (view === 'sent' && o.proposer === 'seller')),
  ).length

  return (
    <div className="container-page py-6 max-w-3xl">
      <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
        <h1 className="font-display text-2xl m-0">砍价记录</h1>
        <div className="flex gap-2 text-sm">
          <Tab
            href="/me/offers"
            active={view === 'received'}
            label={`收到的 ${receivedCount > 0 ? `(${receivedCount})` : ''}`}
          />
          <Tab
            href="/me/offers?view=sent"
            active={view === 'sent'}
            label={`发出的 ${sentCount > 0 ? `(${sentCount})` : ''}`}
          />
        </div>
      </div>

      {yourTurnCount > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-brand-yellow-soft border border-brand-yellow-line text-[13px] text-brand-ink">
          🪓 有 <strong>{yourTurnCount}</strong> 条砍价等你回应
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-brand-muted">
          {view === 'received' ? (
            <>
              你的闲置还没收到砍价。
              <br />
              <Link href="/me/listings" className="text-brand-ink underline mt-2 inline-block">
                看看我的发布
              </Link>
            </>
          ) : (
            <>
              你还没砍过别人的闲置。
              <br />
              <Link href="/browse" className="text-brand-ink underline mt-2 inline-block">
                去逛逛 → 看到喜欢的点 🪓 砍一刀
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o: any) => {
            const listing = o.listings
            const cover = [...(listing?.listing_images ?? [])].sort(
              (a: any, b: any) => a.sort_order - b.sort_order,
            )?.[0]?.image_url
            const isYourTurn =
              o.status === 'pending' &&
              ((view === 'received' && o.proposer === 'buyer') ||
                (view === 'sent' && o.proposer === 'seller'))
            const statusLabel = {
              pending: isYourTurn ? '你的回合' : '等对方回应',
              accepted: '✓ 已接受',
              rejected: '✗ 已拒绝',
              countered: '↻ 已回砍',
              expired: '已过期',
            }[o.status as string]
            const statusClass =
              o.status === 'accepted'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : o.status === 'rejected'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isYourTurn
                    ? 'bg-brand-yellow text-brand-ink border-brand-yellow font-semibold'
                    : 'bg-brand-line text-brand-ink-soft border-brand-line'

            return (
              <li key={o.chain_id} className="card p-3">
                <Link
                  href={`/listing/${o.listing_id}`}
                  className="flex gap-3 items-center"
                >
                  <div className="w-16 h-16 rounded-lg bg-brand-cream overflow-hidden relative shrink-0">
                    {cover ? (
                      <Image src={cover} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px] truncate text-brand-ink">
                      {listing?.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap text-[12px] text-brand-muted">
                      <span className="text-brand-ink-soft">
                        现价 <strong className="text-brand-ink">€{listing?.price}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        {o.proposer === 'buyer'
                          ? view === 'received'
                            ? '买家出价 '
                            : '你出价 '
                          : view === 'sent'
                            ? '卖家回砍 '
                            : '你回砍 '}
                        <strong className="font-serif text-[15px] text-brand-ink">
                          €{o.amount}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] py-1 px-2.5 rounded-pill border whitespace-nowrap ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Tab({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={
        'px-3 py-1.5 rounded-pill transition-colors ' +
        (active
          ? 'bg-brand-ink text-white'
          : 'bg-white border border-brand-line hover:border-brand-ink')
      }
    >
      {label}
    </Link>
  )
}
