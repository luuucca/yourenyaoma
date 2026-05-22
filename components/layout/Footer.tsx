import Link from 'next/link'

// Minimal-style 4-column footer (no language switcher per user iteration).
const COLUMNS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: '产品',
    links: [
      { href: '/publish', label: '发布闲置' },
      { href: '/pros', label: '找师傅' },
      { href: '/buddies', label: '找搭子' },
      { href: '/browse?cat=moving', label: '搬家甩卖' },
      { href: '/free', label: '免费送' },
    ],
  },
  {
    label: '帮助',
    links: [
      { href: '/safety', label: '安全交易' },
      { href: '/rules', label: '禁止发布' },
      { href: '/pros#cert', label: '师傅资质认证' },
      { href: '/about', label: '联系我们' },
    ],
  },
  {
    label: '社区',
    links: [
      { href: '/about', label: '关于我们' },
      { href: '/about#story', label: '社区故事' },
      { href: '/about#feedback', label: '意见反馈' },
    ],
  },
  {
    label: '法律',
    links: [
      { href: '/terms', label: '使用条款' },
      { href: '/privacy', label: '隐私政策' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-brand-line bg-white mt-20">
      <div className="max-w-[1360px] mx-auto px-4 md:px-16 pt-16 pb-10 grid grid-cols-2 md:grid-cols-5 gap-10 text-[14px]">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif font-bold text-[22px] tracking-[-0.01em] text-brand-ink inline-flex items-baseline gap-1.5">
            有人要吗
            <span className="w-2 h-2 rounded-sm bg-brand-yellow -translate-y-0.5 inline-block" aria-hidden />
          </div>
          <p className="text-brand-muted leading-relaxed mt-4 text-[13px] max-w-[260px]">
            面向海外华人的同城邻里社区。一个平台解决三件事——闲置二手、靠谱师傅、同城搭子。让漂泊的日子也有邻里温度。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.label}>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted mb-4">
              {col.label}
            </div>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-[#444] hover:text-brand-ink transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1360px] mx-auto px-4 md:px-16 py-5 border-t border-brand-line text-[12px] text-brand-muted flex flex-col md:flex-row gap-2 md:justify-between">
        <span>© {new Date().getFullYear()} 有人要吗 · 海外华人邻里社区</span>
        <span>本地自取交易，平台不参与担保</span>
      </div>
    </footer>
  )
}
