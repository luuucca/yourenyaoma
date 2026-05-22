import FreeStuffSection from '@/components/home/FreeStuffSection'

export const metadata = {
  title: '免费送 — Gratis',
  description: '邻居好意：携不走、不想扔、送邻居——带走就好，不用谢。',
}

export default function FreePage() {
  return (
    <main className="pt-6 pb-12">
      <div className="max-w-[1360px] mx-auto px-4 md:px-16 pt-8 pb-2">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
          FREE · 邻居好意
        </span>
        <h1 className="font-serif text-[40px] md:text-[56px] font-semibold tracking-[-0.02em] text-brand-ink mt-3 mb-3">
          免费送 · Gratis
        </h1>
        <p className="text-[15px] text-[#555] max-w-[640px] leading-[1.6]">
          携不走、不想扔、送邻居——带走就好，不用谢。
        </p>
      </div>
      <FreeStuffSection />
    </main>
  )
}
