import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { DEMO_MOVING } from '@/lib/constants/demoData'
import { DISTRICT_LABEL } from '@/lib/constants/districts'

// 搬家甩卖 · 优先显示真实 bundle 父 listing（category='moving' 有 children），
// 没有数据时回落到 DEMO_MOVING 占位
export default async function MovingSaleSection() {
  const supabase = createClient()

  // 拉所有 category='moving' 且 status='published' 的父 listings（parent_listing_id is null）
  const { data: parents } = await supabase
    .from('listings')
    .select(
      'id, title, description, price, district, published_at, listing_images(image_url, sort_order)',
    )
    .eq('category', 'moving')
    .eq('status', 'published')
    .is('parent_listing_id', null)
    .order('published_at', { ascending: false })
    .limit(3)

  // 每个父算下有几件子
  const parentIds = (parents || []).map((p: any) => p.id)
  const childCounts = new Map<string, number>()
  if (parentIds.length > 0) {
    const { data: childRows } = await supabase
      .from('listings')
      .select('parent_listing_id')
      .in('parent_listing_id', parentIds)
      .eq('status', 'published')
    ;(childRows || []).forEach((r: any) => {
      childCounts.set(r.parent_listing_id, (childCounts.get(r.parent_listing_id) || 0) + 1)
    })
  }

  // 只保留至少有 1 个子的真 bundle
  const realBundles = (parents || []).filter(
    (p: any) => (childCounts.get(p.id) || 0) > 0,
  )

  const useDemo = realBundles.length === 0
  const items = useDemo ? DEMO_MOVING : realBundles

  return (
    <div className="mt-20 py-16 md:py-[72px] bg-brand-warm border-y border-brand-line">
      <section className="max-w-[1360px] mx-auto px-4 md:px-16">
        <SectionHead
          eyebrow="— MOVING · 整屋打包"
          title="搬家甩卖专区"
          desc="回国 / 搬家 / 毕业 — 整屋好物一次拎走 · 可包圆可单买"
          moreHref="/moving"
          moreLabel="查看全部 →"
          tint="yellow"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((m: any, i: number) => {
            // demo data 用 m.id (number) / m.title / m.desc / m.price / m.region / m.items
            // real data 用 m.id (uuid) / m.title / m.description / m.price / m.district / childCount
            const isDemo = useDemo
            const href = isDemo ? `/moving` : `/listing/${m.id}`
            const cover = isDemo
              ? null
              : [...(m.listing_images ?? [])].sort(
                  (a: any, b: any) => a.sort_order - b.sort_order,
                )[0]?.image_url
            const itemsCount = isDemo
              ? m.items
              : childCounts.get(m.id) || 0
            const region = isDemo
              ? m.region
              : DISTRICT_LABEL[m.district]?.slice(0, 8) || m.district
            const desc = isDemo ? m.desc : m.description
            const priceLabel = isDemo
              ? m.price
              : Number(m.price) > 0
                ? `€${Number(m.price)} 包圆`
                : '按件单算'

            return (
              <ScrollReveal key={m.id} delay={i * 100}>
                <Link
                  href={href}
                  className="h-full group bg-white border border-brand-line-2 rounded-[18px] p-[22px] flex flex-col gap-3.5 cursor-pointer transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.18)] active:translate-y-0"
                >
                  <div className="aspect-video rounded-xl bg-[#F6F6F4] relative overflow-hidden">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={m.title}
                        className="absolute inset-0 w-full h-full object-cover"
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
                    <span className="absolute right-3 bottom-3 bg-white/90 text-brand-ink font-mono text-[11px] py-1 px-2.5 rounded-pill tracking-[0.08em]">
                      {itemsCount} 件
                    </span>
                  </div>
                  <h3 className="font-serif text-[19px] font-semibold m-0 text-brand-ink tracking-[-0.01em] line-clamp-1">
                    {m.title}
                  </h3>
                  <p className="text-[13px] text-[#666] leading-[1.5] line-clamp-2">
                    {desc}
                  </p>
                  <div className="flex justify-between items-baseline pt-3 border-t border-brand-line">
                    <span className="font-serif text-[18px] font-semibold text-brand-ink">
                      {priceLabel}
                    </span>
                    <span className="text-[12px] text-brand-muted">📍 {region}</span>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </section>
    </div>
  )
}
