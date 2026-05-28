import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ui/ScrollReveal'

// Matches the YRYM Playful Homepage strip — 11 PNG icons + an "all" tile.
// Each tile uses an illustration PNG from /public/illustrations/.
// 找师傅/找搭子 已在顶部主导航，这里不再重复 — 只留纯闲置分类
const STRIP = [
  { img: 'chair.png', label: '家具', href: '/browse?cat=furniture' },
  { img: 'lamp.png', label: '家电', href: '/browse?cat=appliance' },
  { img: 'camera.png', label: '数码', href: '/browse?cat=digital' },
  { img: 'bag.png', label: '服饰', href: '/browse?cat=fashion' },
  { img: 'sneaker.png', label: '运动', href: '/browse?cat=sports' },
  { img: 'controller.png', label: '玩具', href: '/browse?cat=toys' },
  { img: 'guitar.png', label: '乐器', href: '/browse?cat=music' },
  { img: 'chair.png', label: '母婴', href: '/browse?cat=baby' },
  { img: 'lamp.png', label: '生活', href: '/browse?cat=life' },
] as const

export default function CategoryGrid() {
  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-3 pb-12 grid grid-cols-5 gap-y-5 gap-x-1 justify-items-center md:flex md:items-center md:justify-between md:gap-4 md:overflow-x-auto no-scrollbar">
      {STRIP.map((item, i) => {
        return (
          <ScrollReveal key={`${item.img}-${item.label}`} delay={i * 55} distance={12}>
            <Link
              href={item.href}
              className="group flex flex-col items-center gap-2.5 md:min-w-[64px] transition-transform hover:-translate-y-1 active:translate-y-0 duration-200"
            >
              <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all overflow-hidden bg-brand-cream border border-brand-line group-hover:border-brand-ink">
                {/* PNG wiggles slightly on hover — wakes up the illustrations */}
                <Image
                  src={`/illustrations/${item.img}`}
                  alt={item.label}
                  width={64}
                  height={64}
                  className="max-w-[72%] max-h-[72%] object-contain transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-110"
                />
              </div>
              <span className="text-[13px] text-brand-ink font-medium whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          </ScrollReveal>
        )
      })}
      <ScrollReveal delay={STRIP.length * 55} distance={12}>
        <Link
          href="/browse"
          className="group flex flex-col items-center gap-2.5 md:min-w-[64px] hover:-translate-y-1 active:translate-y-0 transition-transform duration-200"
        >
          <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center bg-brand-yellow-soft border border-brand-yellow-line text-[18px] text-brand-ink-soft transition-all group-hover:border-brand-yellow">
            <span className="transition-transform duration-300 group-hover:rotate-90">···</span>
          </div>
          <span className="text-[13px] text-brand-ink font-medium whitespace-nowrap">全部</span>
        </Link>
      </ScrollReveal>
    </section>
  )
}
