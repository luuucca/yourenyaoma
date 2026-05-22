import Link from 'next/link'
import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { DEMO_MOVING } from '@/lib/constants/demoData'

// 搬家甩卖 · full-bleed warm strip with 3 large cards.
// Background #FAF8F2 + 1px top/bottom #f0f0f0 borders per design.
export default function MovingSaleSection() {
  const items = DEMO_MOVING

  return (
    <div className="mt-20 py-16 md:py-[72px] bg-brand-warm border-y border-brand-line">
      <section className="max-w-[1360px] mx-auto px-4 md:px-16">
        <SectionHead
          eyebrow="— MOVING · 整屋打包"
          title="搬家甩卖专区"
          desc="回国 / 搬家 / 毕业 — 整屋好物一次拎走 · 可配搬家师傅上门"
          moreHref="/browse?cat=moving"
          moreLabel="看看打包价 →"
          tint="yellow"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((m, i) => (
            <ScrollReveal key={m.id} delay={i * 100}>
            <Link
              href={`/browse?cat=moving&pack=${m.id}`}
              className="h-full group bg-white border border-brand-line-2 rounded-[18px] p-[22px] flex flex-col gap-3.5 cursor-pointer transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.18)] active:translate-y-0"
            >
              {/* preview */}
              <div className="aspect-video rounded-xl bg-[#F6F6F4] relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent 0 18px, rgba(0,0,0,0.025) 18px 19px)',
                  }}
                />
                <span className="absolute top-3 left-3 bg-brand-ink text-white py-1 px-2.5 rounded-pill text-[10px] font-mono tracking-[0.08em]">
                  整屋打包
                </span>
                <span className="absolute right-3 bottom-3 bg-white/90 text-brand-ink font-mono text-[11px] py-1 px-2.5 rounded-pill tracking-[0.08em]">
                  {m.items} 件
                </span>
              </div>
              <h3 className="font-serif text-[19px] font-semibold m-0 text-brand-ink tracking-[-0.01em]">
                {m.title}
              </h3>
              <p className="text-[13px] text-[#666] leading-[1.5]">{m.desc}</p>
              <div className="flex justify-between items-baseline pt-3 border-t border-brand-line">
                <span className="font-serif text-[22px] font-semibold text-brand-ink">{m.price}</span>
                <span className="text-[12px] text-brand-muted">📍 {m.region}</span>
              </div>
            </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
