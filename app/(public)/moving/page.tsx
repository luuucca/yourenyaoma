import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DISTRICT_LABEL } from '@/lib/constants/districts'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: '搬家甩卖 · 整屋打包',
  description:
    '搬家 / 回国 / 毕业 — 整屋好物一次甩卖。包圆价 + 单件可单买。',
}

type Bundle = {
  id: string
  title: string
  description: string
  price: number
  district: string
  published_at: string
  listing_images: { image_url: string; sort_order: number }[]
}

export default async function MovingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 所有 category='moving' 且 parent_listing_id is null 的 listings —
  // 含 bundle 父 + 单件搬家件
  const { data: bundles } = await supabase
    .from('listings')
    .select(
      'id, title, description, price, district, published_at, listing_images(image_url, sort_order)',
    )
    .eq('category', 'moving')
    .eq('status', 'published')
    .is('parent_listing_id', null)
    .order('published_at', { ascending: false })
    .limit(60)

  // 每个 listing 算下有几件子
  const bundleIds = (bundles || []).map((b: any) => b.id)
  const childCounts = new Map<string, number>()
  if (bundleIds.length > 0) {
    const { data: childRows } = await supabase
      .from('listings')
      .select('parent_listing_id')
      .in('parent_listing_id', bundleIds)
      .eq('status', 'published')
    ;(childRows || []).forEach((r: any) => {
      childCounts.set(
        r.parent_listing_id,
        (childCounts.get(r.parent_listing_id) || 0) + 1,
      )
    })
  }

  const list = (bundles as Bundle[]) || []

  return (
    <article className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <header className="mb-10">
        <div className="font-mono text-[11px] tracking-[0.18em] text-brand-muted uppercase mb-3">
          — MOVING · 整屋打包
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-[36px] md:text-[56px] font-bold tracking-[-0.02em] text-brand-ink m-0 leading-[1.05]">
              搬家<span className="text-highlight-yellow">甩卖</span>
            </h1>
            <p className="text-[14px] text-brand-muted mt-3 max-w-[480px] leading-relaxed">
              回国 · 搬家 · 毕业 — 整屋好物一次拎走。包圆价 + 单件可单买，
              不浪费、不重新淘。
            </p>
          </div>
          <Link
            href="/publish/moving"
            className="shrink-0 bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all"
          >
            + 发布搬家甩卖
          </Link>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="border border-dashed border-brand-line rounded-2xl px-6 py-16 text-center bg-brand-cream">
          <div className="text-[14px] text-brand-muted mb-3">
            还没有搬家甩卖广告
          </div>
          <Link
            href="/publish/moving"
            className="inline-block bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 transition-all"
          >
            发布第一个 →
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((b) => {
            const cover =
              [...(b.listing_images ?? [])].sort(
                (a, c) => a.sort_order - c.sort_order,
              )[0]?.image_url ?? null
            const childCount = childCounts.get(b.id) || 0
            const region = DISTRICT_LABEL[b.district]?.slice(0, 8) || b.district
            const priceLabel =
              Number(b.price) > 0 ? `€${Number(b.price)} 包圆` : '按件单算'

            return (
              <li key={b.id}>
                <Link
                  href={`/listing/${b.id}`}
                  className="h-full block bg-white border border-brand-line-2 rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-200 ease-out hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.18)] motion-reduce:transition-none"
                >
                  <div className="aspect-video rounded-xl bg-[#F6F6F4] relative overflow-hidden">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={b.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, transparent 0 18px, rgba(0,0,0,0.025) 18px 19px)',
                        }}
                      />
                    )}
                    <span className="absolute top-3 left-3 bg-brand-ink text-white py-1 px-2.5 rounded-pill text-[10px] font-mono tracking-[0.08em]">
                      整屋打包
                    </span>
                    {childCount > 0 && (
                      <span className="absolute right-3 bottom-3 bg-white/90 text-brand-ink font-mono text-[11px] py-1 px-2.5 rounded-pill tracking-[0.08em]">
                        {childCount} 件
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-[18px] font-semibold m-0 text-brand-ink tracking-[-0.01em] line-clamp-1">
                    {b.title}
                  </h3>
                  <p className="text-[13px] text-[#666] leading-[1.5] line-clamp-2 flex-1">
                    {b.description}
                  </p>
                  <div className="flex justify-between items-baseline pt-3 border-t border-brand-line">
                    <span className="font-serif text-[16px] font-semibold text-brand-ink">
                      {priceLabel}
                    </span>
                    <span className="text-[12px] text-brand-muted">📍 {region}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {user && (
        <div className="mt-10 text-center">
          <Link
            href="/me/listings"
            className="text-[13px] text-brand-muted underline underline-offset-2 hover:text-brand-ink"
          >
            管理我发的搬家甩卖 →
          </Link>
        </div>
      )}
    </article>
  )
}
