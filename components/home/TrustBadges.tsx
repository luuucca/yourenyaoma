import { TRUST_ITEMS } from '@/lib/constants/demoData'
import ScrollReveal from '@/components/ui/ScrollReveal'

// 信任栏 — single light-gray pill containing 4 trust items.
// First item dot is yellow (brand-yellow), the rest are white circles.
const ICONS = ['👥', '✓', '📍', '💬']

export default function TrustBadges() {
  return (
    <section className="max-w-[1360px] mx-auto mt-14 px-4 md:px-16">
      <div className="border border-brand-line rounded-2xl py-[22px] px-7 flex flex-col md:flex-row justify-between gap-6 md:gap-8 bg-brand-cream">
        {TRUST_ITEMS.map((item, i) => (
          <ScrollReveal key={item.t} delay={i * 90} className="flex-1">
            <div className="flex items-center gap-3.5">
              <div
                className={
                  'w-9 h-9 rounded-full flex items-center justify-center text-[13px] text-brand-ink shrink-0 ' +
                  (i === 0
                    ? 'bg-brand-yellow border border-brand-yellow pulse-soft motion-reduce:animate-none'
                    : 'bg-white border border-brand-line-2')
                }
                aria-hidden
              >
                {ICONS[i]}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-brand-ink">{item.t}</div>
                <div className="text-[11px] text-brand-muted mt-0.5">{item.d}</div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
