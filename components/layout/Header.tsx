import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnnouncementMarquee from './AnnouncementMarquee'
import ShinyPublishCTA from './ShinyPublishCTA'

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/browse', label: '分类' },
  { href: '/pros', label: '找师傅' },
  { href: '/buddies', label: '找搭子' },
  { href: '/jobs', label: '找工作' },
  { href: '/safety', label: '安全交易' },
] as const

export default async function Header() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 拉未读消息数（用于「我的」右上小红点）。失败时静默为 0，不阻塞渲染。
  let unread = 0
  if (user) {
    const { data } = await supabase.rpc('unread_count_total')
    unread = typeof data === 'number' ? data : 0
  }

  return (
    <>
      <AnnouncementMarquee />
      <header className="sticky top-0 z-40 bg-white border-b border-brand-line">
        <div className="max-w-[1360px] mx-auto flex items-center px-4 md:px-16 py-5 md:py-7 gap-6 md:gap-12">
          <Link
            href="/"
            className="font-serif font-bold text-[22px] tracking-[-0.01em] text-brand-ink inline-flex items-baseline gap-1.5 whitespace-nowrap"
          >
            有人要吗
            {/* Brand dot — subtle "breath" every few seconds keeps the logo alive */}
            <span className="w-2 h-2 rounded-sm bg-brand-yellow inline-block brand-breath motion-reduce:animate-none" aria-hidden />
          </Link>
          <nav aria-label="主导航" className="hidden md:flex gap-9 text-[14px] text-[#444] ml-6">
            {NAV_ITEMS.map((item) => {
              if (item.href === '/browse') {
                // 「分类」hover 下拉：全部闲置 / 搬家甩卖 / 免费送
                return (
                  <div
                    key={item.href}
                    className="relative inline-flex items-center min-h-[44px] py-0.5 group"
                  >
                    <Link
                      href="/browse"
                      aria-haspopup="menu"
                      className="hover:text-brand-ink transition-colors inline-flex items-center gap-1"
                    >
                      {item.label}
                      <svg
                        viewBox="0 0 12 12"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className="transition-transform group-hover:rotate-180"
                      >
                        <path d="M3 4.5 L6 7.5 L9 4.5" />
                      </svg>
                    </Link>
                    {/* 不可见 padding 当桥，避免鼠标从触发器移到菜单时关闭 */}
                    <div className="absolute top-full left-0 hidden group-hover:block group-focus-within:block pt-2 z-50">
                      <ul className="bg-white border border-brand-line rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] py-1.5 min-w-[160px]">
                        <li>
                          <Link
                            href="/browse"
                            className="block px-4 py-2 text-[13px] hover:bg-brand-cream transition-colors"
                          >
                            全部闲置
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/browse?cat=moving"
                            className="block px-4 py-2 text-[13px] hover:bg-brand-cream transition-colors"
                          >
                            搬家甩卖
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/free"
                            className="block px-4 py-2 text-[13px] hover:bg-brand-cream transition-colors"
                          >
                            免费送
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.href === '/' ? 'page' : undefined}
                  className={
                    item.href === '/'
                      ? 'text-brand-ink font-semibold inline-flex items-center min-h-[44px] py-0.5 transition-colors'
                      : 'inline-flex items-center min-h-[44px] py-0.5 hover:text-brand-ink transition-colors'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-5 md:gap-[22px] text-[13px] text-[#444]">
            {user ? (
              <Link
                href="/me"
                className="hidden sm:inline-flex items-center gap-1.5 hover:text-brand-ink transition-colors relative"
              >
                我的
                {unread > 0 && (
                  <span
                    className="bg-brand-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-label={`${unread} 条未读消息`}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:inline hover:text-brand-ink transition-colors">
                登录
              </Link>
            )}
            <ShinyPublishCTA />
          </div>
        </div>
      </header>
    </>
  )
}
