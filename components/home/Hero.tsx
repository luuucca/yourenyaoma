import Link from 'next/link'
import TrueFocus from '@/components/TrueFocus'

const HOT_SEARCHES = ['IKEA 沙发', '搬家甩卖', '自行车', 'MacBook', '中文书', '免费送']

export default function Hero() {
  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-12 md:pt-[72px] pb-8 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-14 items-center">
      {/* LEFT */}
      <div>
        <div className="font-mono text-[12px] tracking-[0.18em] text-brand-muted uppercase mb-7 font-medium">
          OVERSEAS · 海外华人邻里社区
        </div>

        {/* h1: bolder hierarchy — weight 700 + tighter tracking + extra letter spacing punch */}
        {/* H1 with stagger entry — first line fades in, then second line, then highlight auto-draws */}
        <h1 className="font-serif font-bold text-[56px] md:text-[104px] leading-[0.98] tracking-[-0.025em] text-brand-ink m-0">
          <span className="inline-block opacity-0 animate-[pf-rise_0.7s_cubic-bezier(0.25,1,0.5,1)_0.05s_forwards]">
            你不要的，
          </span>
          <br />
          <span className="inline-block opacity-0 animate-[pf-rise_0.7s_cubic-bezier(0.25,1,0.5,1)_0.25s_forwards]">
            <span className="hero-highlight">正好有人要</span>
          </span>
        </h1>

        {/* search */}
        <form
          action="/browse"
          role="search"
          className="mt-9 flex items-center border border-brand-ink rounded-pill pl-6 pr-1.5 py-1.5 max-w-[520px] bg-white focus-within:ring-2 focus-within:ring-brand-yellow focus-within:ring-offset-2"
        >
          <label htmlFor="hero-search" className="sr-only">
            搜索闲置 · 师傅 · 搭子
          </label>
          <svg
            className="w-[18px] h-[18px] text-brand-muted mr-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            id="hero-search"
            name="q"
            aria-label="搜索闲置、师傅、搭子"
            placeholder="搜沙发 · 找翻译 · 约球友 · 免费送…"
            className="flex-1 bg-transparent py-3 text-[14px] text-brand-ink outline-none placeholder:text-[#999]"
          />
          <button
            type="submit"
            className="bg-brand-ink text-white rounded-pill min-w-[64px] min-h-[44px] px-7 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all duration-150"
          >
            搜索
          </button>
        </form>

        <div className="flex gap-6 mt-6 items-center">
          <Link
            href="/browse"
            className="text-[14px] text-[#444] underline underline-offset-4 hover:text-brand-ink transition-colors"
          >
            去逛逛 →
          </Link>
        </div>

        <div className="mt-9 font-mono text-[11px] text-brand-muted tracking-[0.18em] uppercase">— popular</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {HOT_SEARCHES.map((q) => (
            <Link
              key={q}
              href={`/browse?q=${encodeURIComponent(q)}`}
              className="text-[12px] py-1.5 px-3.5 border border-brand-line-3 rounded-pill text-brand-ink-soft hover:border-brand-ink hover:text-brand-ink transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT — TrueFocus 品牌主张：「你不要」/「我要」焦点切换；裸放在白底，黄边角即视觉锚点 */}
      <div className="relative aspect-square flex items-center justify-center p-8">
        <div className="font-serif font-bold text-[52px] md:text-[96px] text-brand-ink leading-none">
          <TrueFocus
            sentence="你不要，我要"
            separator="，"
            borderColor="#F4C300"
            glowColor="rgba(244, 195, 0, 0.55)"
            animationDuration={1.1}
            pauseBetweenAnimations={1.6}
            blurAmount={6}
          />
        </div>
      </div>
    </section>
  )
}
