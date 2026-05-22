import Link from 'next/link'
import HangoutsSection from '@/components/home/HangoutsSection'

export const metadata = {
  title: '找搭子 — 同城活动',
  description: '饭搭子 · 球友 · 游戏车队 · 驴友 · 拼车——漂泊的日子也要有邻居一起玩。',
}

export default function BuddiesPage() {
  return (
    <main className="pt-6 pb-20">
      <div className="max-w-[1360px] mx-auto px-4 md:px-16 pt-8 pb-2 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
            BUDDIES · 找搭子
          </span>
          <h1 className="font-serif text-[40px] md:text-[56px] font-semibold tracking-[-0.02em] text-brand-ink mt-3 mb-3">
            找搭子
          </h1>
          <p className="text-[15px] text-[#555] max-w-[640px] leading-[1.6]">
            饭搭子 · 球友 · 游戏车队 · 驴友 · 拼车——漂泊的日子也要有邻居一起玩。加入下面的活动，或自己发起一个。
          </p>
        </div>
        <Link
          href="/buddies/new"
          className="bg-brand-ink text-white rounded-pill px-6 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all whitespace-nowrap"
        >
          + 发起活动
        </Link>
      </div>
      <HangoutsSection />
    </main>
  )
}
