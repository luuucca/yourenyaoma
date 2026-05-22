import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { SAFETY_STEPS } from '@/lib/constants/demoData'

// 安全交易 3 步 — full-bleed black strip with reversed eyebrow/title.
// Each step: 56px serif numeral in 40% yellow + title + gray description.
export default function SafetyStepsSection() {
  return (
    <div className="mt-20 py-16 md:py-[72px] bg-brand-ink text-white">
      <section className="max-w-[1360px] mx-auto px-4 md:px-16">
        <SectionHead
          eyebrow="— SAFETY · 安全交易"
          title="3 步安心交易"
          desc="站内沟通 · 同城见面 · 双向评价 — 邻里之间的小默契"
          invertOnDark
          tint="yellow"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAFETY_STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 120} distance={24}>
              <div className="h-full bg-brand-dark-card text-white rounded-[18px] p-8 border border-brand-dark-border relative">
                <div className="font-serif text-[56px] font-semibold text-brand-yellow leading-none opacity-40">
                  {s.n}
                </div>
                <h3 className="font-serif text-[22px] font-semibold mt-5 mb-2 tracking-[-0.01em]">
                  {s.t}
                </h3>
                <p className="text-[13px] leading-[1.6] text-[#bbb] m-0">{s.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
