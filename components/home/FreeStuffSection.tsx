import Link from 'next/link'
import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { createClient } from '@/lib/supabase/server'
import { DEMO_FREE } from '@/lib/constants/demoData'

type Card = {
  id: string
  title: string
  region: string
  from: string
  href: string
  live: boolean
}

export default async function FreeStuffSection() {
  const supabase = createClient()
  const { data: rows } = await supabase
    .from('listings')
    .select(
      'id, title, district, profiles!listings_user_id_fkey(nickname)',
    )
    .eq('status', 'published')
    .eq('price', 0)
    .order('published_at', { ascending: false })
    .limit(4)

  const liveCards: Card[] =
    (rows ?? []).map((l: any) => ({
      id: l.id,
      title: l.title,
      region: l.district || '同城',
      from: l.profiles?.nickname ?? '邻居',
      href: `/listing/${l.id}`,
      live: true,
    }))

  const cards: Card[] =
    liveCards.length > 0
      ? liveCards
      : DEMO_FREE.map(
          (f): Card => ({
            id: f.id,
            title: f.title,
            region: f.region,
            from: f.from,
            href: '/browse?free=1',
            live: false,
          }),
        )

  return (
    <div className="mt-14 py-16 md:py-[72px] bg-white border-b border-brand-line">
      <section className="max-w-[1360px] mx-auto px-4 md:px-16">
        <SectionHead
          eyebrow="— FREE · 邻居好意"
          title="免费送 · Gratis"
          desc="携不走、不想扔、送邻居——带走就好，不用谢"
          moreHref="/free"
          moreLabel="逛免费送 →"
          tint="yellow"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
          {cards.map((f, i) => (
            <ScrollReveal key={f.id} delay={i * 80}>
              <Link
                href={f.href}
                className="h-full group bg-white border border-brand-line-2 rounded-2xl p-[18px] flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:translate-y-0 relative"
              >
                <span className="absolute top-3.5 right-3.5 font-mono text-[10px] text-brand-ink bg-brand-yellow py-[3px] px-2 rounded-pill tracking-[0.12em] stamp-impact motion-reduce:animate-none">
                  FREE
                </span>
                <div className="w-11 h-11 rounded-xl bg-brand-yellow-soft border border-brand-yellow-line flex items-center justify-center text-[22px] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
                  🎁
                </div>
                <h4 className="font-serif text-[16px] font-semibold m-0 text-brand-ink leading-[1.3] line-clamp-2">
                  {f.title}
                </h4>
                <div className="text-[12px] text-brand-muted">
                  来自 <b className="text-brand-ink font-medium">{f.from}</b> · {f.region}
                </div>
                <div className="mt-auto py-2.5 bg-brand-ink text-white rounded-pill text-center font-medium text-[12px] transition-all duration-150 group-hover:scale-[1.02] group-active:translate-y-px">
                  我要 · Take it
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
