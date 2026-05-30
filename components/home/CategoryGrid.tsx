import Link from 'next/link'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { HOME_CATEGORIES } from '@/lib/constants/categories'

// 首页分类网格 —— 读取 HOME_CATEGORIES(精选高频品类) + 末尾「全部」入口。
// 图标用 emoji(统一数据源 categories.ts，新增分类自动出现，不依赖凑不齐的 PNG)。
// 找师傅/找搭子 已在顶部主导航，这里只放纯闲置品类。
export default function CategoryGrid() {
  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-3 pb-12 grid grid-cols-5 gap-y-5 gap-x-1 justify-items-center md:flex md:items-center md:justify-between md:gap-4 md:overflow-x-auto no-scrollbar">
      {HOME_CATEGORIES.map((c, i) => (
        <ScrollReveal key={c.id} delay={i * 55} distance={12}>
          <Link
            href={`/browse?cat=${c.id}`}
            className="group flex flex-col items-center gap-2.5 md:min-w-[64px] transition-transform hover:-translate-y-1 active:translate-y-0 duration-200"
          >
            <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all bg-brand-cream border border-brand-line group-hover:border-brand-ink">
              {/* emoji 在 hover 时轻微摆动 — 唤醒图标 */}
              <span className="text-[30px] leading-none transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110">
                {c.icon}
              </span>
            </div>
            <span className="text-[13px] text-brand-ink font-medium whitespace-nowrap">
              {c.label}
            </span>
          </Link>
        </ScrollReveal>
      ))}
      <ScrollReveal delay={HOME_CATEGORIES.length * 55} distance={12}>
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
