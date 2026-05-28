export const metadata = { title: '离线' }

export default function OfflinePage() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted mb-3">
        offline
      </div>
      <h1 className="font-serif text-[32px] font-bold text-brand-ink m-0">
        网络断了
      </h1>
      <p className="text-[14px] text-brand-muted mt-4 leading-relaxed">
        现在连不上网。已经看过的页面还能浏览，
        <br />
        恢复网络后刷新就好。
      </p>
    </div>
  )
}
