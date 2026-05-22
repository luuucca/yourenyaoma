import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import FavoriteHeart from '@/components/listing/FavoriteHeart'
import { DEMO_PRODUCTS, type DemoProduct } from '@/lib/constants/demoData'
import { formatDistrictShort, formatCondition } from '@/lib/utils/formatListing'

type Card = DemoProduct & { href: string; image?: string | null; favorited: boolean }

export default async function LatestListings() {
  const supabase = createClient()
  // Fetch listings + current user + their favorites in parallel
  const [{ data: rows }, { data: { user } }] = await Promise.all([
    supabase
      .from('listings')
      .select(
        'id, title, price, district, condition, status, listing_images(image_url, sort_order)',
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(8),
    supabase.auth.getUser(),
  ])

  let favoritedIds = new Set<string>()
  if (user && rows && rows.length > 0) {
    const ids = rows.map((r: any) => r.id)
    const { data: favs } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id)
      .in('listing_id', ids)
    favoritedIds = new Set((favs ?? []).map((f: any) => f.listing_id))
  }

  const liveCards: Card[] = (rows ?? []).map((l: any) => {
    const cover = [...(l.listing_images ?? [])].sort(
      (a: any, b: any) => a.sort_order - b.sort_order,
    )?.[0]?.image_url ?? null
    const isFree = Number(l.price) === 0
    return {
      id: l.id,
      title: l.title,
      price: isFree ? '免费' : `€${Number(l.price)}`,
      origPrice: '',
      region: formatDistrictShort(l.district),
      condition: formatCondition(l.condition),
      tags: [isFree ? '免费送' : '可议价'],
      pickup: true,
      badge: isFree ? 'FREE' : undefined,
      href: `/listing/${l.id}`,
      image: cover,
      favorited: favoritedIds.has(l.id),
    }
  })

  // Fallback to demo product set if no live data yet — matches the design.
  const cards: Card[] =
    liveCards.length > 0
      ? liveCards
      : DEMO_PRODUCTS.map(
          (p): Card => ({ ...p, href: '/browse', favorited: false }),
        )

  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-14">
      <SectionHead
        eyebrow="— NEW · 邻居刚上架"
        title="附近的好物"
        desc="3 km 以内 · 实时刷新 · 站内 IM 聊价 · 公共场所自取"
        moreHref="/browse"
        tint="yellow"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {cards.slice(0, 8).map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 70}>
            <Link
              href={p.href}
              className="h-full bg-white border border-brand-line-2 rounded-2xl p-3 flex flex-col gap-2.5 cursor-pointer transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:translate-y-0 group"
            >
              {/* image area — render real image if present, else striped placeholder */}
              <div className="aspect-[4/3] rounded-[10px] bg-brand-fill relative overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, transparent 0 14px, rgba(0,0,0,0.025) 14px 15px)',
                    }}
                  />
                )}
                {p.tags[0] && (
                  <span className="absolute top-2.5 left-2.5 text-[10px] py-[3px] px-2 bg-brand-ink text-white rounded-pill font-mono tracking-[0.04em]">
                    {p.tags[0]}
                  </span>
                )}
                {p.badge && (
                  <span className="absolute top-2.5 left-[70px] text-[10px] py-[3px] px-2 bg-brand-yellow text-brand-ink rounded-pill font-mono font-semibold tracking-[0.04em]">
                    {p.badge}
                  </span>
                )}
                {/* Real favorite button — only wired when card is live (has a UUID) */}
                {p.href.startsWith('/listing/') ? (
                  <FavoriteHeart
                    listingId={String(p.id)}
                    initialFavorited={p.favorited}
                    loggedIn={!!user}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute top-1.5 right-1.5 w-11 h-11 rounded-pill flex items-center justify-center text-[14px] text-[#444]"
                  >
                    <span className="w-7 h-7 rounded-pill bg-white/90 flex items-center justify-center">
                      ♡
                    </span>
                  </span>
                )}
              </div>
              <div className="text-[14px] font-medium text-brand-ink leading-[1.35] mx-1 mt-1 line-clamp-2">
                {p.title}
              </div>
              <div className="flex justify-between px-1 text-[11px] text-brand-muted">
                <span>{p.region}</span>
                <span>{p.condition}</span>
              </div>
              <div className="flex justify-between items-baseline px-1 pb-1">
                <span>
                  <span className="font-serif text-[22px] font-semibold text-brand-ink">
                    {p.price}
                  </span>
                  {p.origPrice && (
                    <span className="text-[11px] text-[#aaa] line-through ml-2">
                      {p.origPrice}
                    </span>
                  )}
                </span>
                {p.pickup && (
                  <span className="text-[11px] py-1 px-2.5 bg-brand-yellow-soft text-brand-ink rounded-pill font-medium border border-brand-yellow-line">
                    可自取
                  </span>
                )}
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
