import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingGallery } from '@/components/listing/ListingGallery'
import { ContactReveal } from '@/components/listing/ContactReveal'
import { FavoriteButton } from '@/components/listing/FavoriteButton'
import { ReportDialog } from '@/components/listing/ReportDialog'
import OfferDialog from '@/components/listing/OfferDialog'
import OfferChain, { type ChainOffer } from '@/components/listing/OfferChain'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/formatPrice'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { CATEGORY_LABEL } from '@/lib/constants/categories'
import { CONDITION_LABEL } from '@/lib/constants/conditions'
import { DISTRICT_LABEL } from '@/lib/constants/districts'

// DOM order mirrors what users want to see on MOBILE:
//   1. Title + Price + Actions
//   2. Gallery
//   3. Description
//   4. Seller + Contact
//   5. Safety reminder
// On desktop (md+) we keep a 2-column layout by giving each card an explicit
// `md:col-start` / `md:row-start`. The source order doesn't change.
export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select(
      '*, listing_images(image_url, sort_order), profiles!listings_user_id_fkey(id, nickname, avatar_url, district)',
    )
    .eq('id', params.id)
    .single()

  if (!listing) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === listing.user_id
  if (
    !isOwner &&
    listing.status !== 'published' &&
    listing.status !== 'sold'
  ) {
    notFound()
  }

  if (!isOwner) {
    await supabase.rpc('increment_view_count', { p_listing_id: params.id })
  }

  const images = ((listing as any).listing_images ?? [])
    .slice()
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => i.image_url) as string[]
  const seller = (listing as any).profiles

  let isFavorited = false
  let offers: ChainOffer[] = []
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()
    isFavorited = !!fav

    // Fetch THIS user's offer chain on THIS listing (whether they're buyer or
    // seller). RLS already filters to party-only.
    const { data: rawOffers } = await supabase
      .from('price_offers')
      .select('id, chain_id, amount, proposer, status, message, created_at')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: true })
    offers = (rawOffers ?? []) as ChainOffer[]
  }
  const viewerRole: 'buyer' | 'seller' = isOwner ? 'seller' : 'buyer'
  const hasActiveOffer = offers.some((o) => o.status === 'pending')

  return (
    <div className="container-page py-6 grid gap-4 md:gap-6 md:grid-cols-[1fr_360px]">
      {/* 1. Title + Price + Badges + Actions */}
      <section className="card p-5 md:col-start-2 md:row-start-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-[24px] md:text-[28px] font-bold leading-tight text-brand-ink m-0">
            {listing.title}
          </h1>
          {listing.status === 'sold' && <Badge variant="sold">已售出</Badge>}
          {listing.status === 'pending' && isOwner && (
            <Badge variant="pending">待审核</Badge>
          )}
          {listing.status === 'rejected' && isOwner && (
            <Badge variant="rejected">已拒绝</Badge>
          )}
          {listing.status === 'hidden' && isOwner && (
            <Badge variant="hidden">已隐藏</Badge>
          )}
        </div>
        <div className="mt-3">
          <span
            className={`font-serif text-[32px] md:text-[36px] font-bold leading-none ${
              Number(listing.price) === 0 ? 'text-brand-free' : 'text-brand-ink'
            }`}
          >
            {formatPrice(Number(listing.price))}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="yellow">
            {CATEGORY_LABEL[listing.category] ?? listing.category}
          </Badge>
          <Badge>{CONDITION_LABEL[listing.condition] ?? listing.condition}</Badge>
          <Badge>
            {DISTRICT_LABEL[listing.district]?.slice(0, 5) ?? listing.district}
          </Badge>
          {listing.pickup_available && <Badge>可自取</Badge>}
        </div>
        <div className="mt-4 text-xs text-brand-muted">
          发布于 {formatRelativeTime(listing.created_at)} ·{' '}
          {listing.view_count ?? 0} 次浏览
        </div>

        {isOwner ? (
          <>
            <div className="mt-4 flex gap-2">
              <Link href="/me/listings" className="flex-1">
                <Button variant="secondary" className="w-full">
                  管理我的发布
                </Button>
              </Link>
            </div>
            {/* Seller side: same compact placement so they can respond to
                buyer offers without scrolling past the description. */}
            {offers.length > 0 && (
              <div className="mt-5 pt-5 border-t border-brand-line">
                <div className="text-[13px] font-semibold mb-3 text-brand-ink-soft flex items-center gap-1.5">
                  🪓 收到的砍价
                </div>
                <OfferChain
                  chain={offers}
                  listingPrice={Number(listing.price)}
                  viewerRole="seller"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mt-4 flex gap-2 flex-wrap">
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={isFavorited}
                loggedIn={!!user}
              />
              {Number(listing.price) > 0 && !hasActiveOffer && (
                <OfferDialog
                  listingId={listing.id}
                  listingPrice={Number(listing.price)}
                  loggedIn={!!user}
                />
              )}
              <ReportDialog listingId={listing.id} />
            </div>
            {/* Offer chain renders directly under the action buttons so the
                buyer sees their pending offer immediately, no scrolling needed. */}
            {offers.length > 0 && (
              <div className="mt-5 pt-5 border-t border-brand-line">
                <div className="text-[13px] font-semibold mb-3 text-brand-ink-soft flex items-center gap-1.5">
                  🪓 砍价记录
                </div>
                <OfferChain
                  chain={offers}
                  listingPrice={Number(listing.price)}
                  viewerRole="buyer"
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* 2. Gallery */}
      <div className="md:col-start-1 md:row-start-1 md:row-span-2">
        <ListingGallery images={images} />
      </div>

      {/* 3. Description */}
      <section className="card p-5 md:col-start-1 md:row-start-3">
        <h2 className="font-semibold mb-2">商品描述</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {listing.description}
        </p>
      </section>

      {/* (offer chain now lives inside the title/price card above) */}

      {/* 4. Seller + Contact */}
      <section className="card p-5 md:col-start-2 md:row-start-2">
        <div className="text-sm font-semibold mb-3">卖家</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-yellow-soft flex items-center justify-center text-lg font-medium">
            {seller?.nickname?.[0] ?? '?'}
          </div>
          <div>
            <div className="font-medium text-sm">{seller?.nickname}</div>
            {seller?.district && (
              <div className="text-xs text-brand-muted">
                {DISTRICT_LABEL[seller.district]?.slice(0, 5)}
              </div>
            )}
          </div>
        </div>
        <ContactReveal
          listingId={listing.id}
          loggedIn={!!user}
          sellerId={listing.user_id}
          viewerId={user?.id ?? null}
        />
      </section>

      {/* 5. Safety reminder — always last */}
      <section className="card p-5 bg-brand-yellow-soft/30 border border-brand-yellow text-sm md:col-start-1 md:col-span-2 md:row-start-4">
        <div className="font-semibold mb-2">⚠️ 安全交易提醒</div>
        <ul className="space-y-1 text-brand-ink-soft">
          <li>· 建议本地当面交易</li>
          <li>· 不要提前转账，不要点击陌生付款链接</li>
          <li>· 不要使用加密货币付款</li>
          <li>· 贵重物品请当面验货后付款</li>
        </ul>
        <Link href="/safety" className="text-xs underline mt-3 inline-block">
          查看完整安全指南 →
        </Link>
      </section>
    </div>
  )
}
