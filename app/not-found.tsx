import Link from 'next/link'

export const metadata = { title: '页面不见了 · 404' }

// App-level 404 — same brand language as the hero. Friendly Chinese copy
// avoiding the standard "404 NOT FOUND" cold technical tone.
export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-brand-muted mb-4">
          404 · NOT FOUND
        </div>
        <h1 className="font-serif text-[56px] md:text-[80px] font-bold leading-[0.95] tracking-[-0.025em] text-brand-ink m-0">
          这条街
          <br />
          <span className="bg-[linear-gradient(180deg,transparent_60%,#F4C300_60%,#F4C300_92%,transparent_92%)] px-1">
            没找到
          </span>
        </h1>
        <p className="mt-6 text-[15px] text-brand-ink-soft leading-relaxed">
          可能是链接错了 · 或者这个商品/活动已经被取走了。
          <br />
          回去逛逛别的好物。
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-brand-ink text-white rounded-pill px-6 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all"
          >
            回首页
          </Link>
          <Link
            href="/browse"
            className="bg-white border border-brand-line text-brand-ink rounded-pill px-6 py-3 text-[13px] font-medium hover:border-brand-ink active:translate-y-px transition-all"
          >
            去逛闲置
          </Link>
        </div>
      </div>
    </main>
  )
}
