import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnnouncementMarquee from './AnnouncementMarquee'
import ShinyPublishCTA from './ShinyPublishCTA'
import GradientText from '@/components/GradientText'

const NAV_ITEMS = [
  { href: '/', label: '首页' },
  { href: '/browse', label: '分类' },
  { href: '/free', label: '免费送' },
  { href: '/pros', label: '找师傅' },
  { href: '/buddies', label: '找搭子' },
  { href: '/safety', label: '安全交易' },
  { href: '/about', label: '关于我们' },
] as const

export default async function Header() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <AnnouncementMarquee />
      <header className="sticky top-0 z-40 bg-white border-b border-brand-line">
        <div className="max-w-[1360px] mx-auto flex items-center px-4 md:px-16 py-5 md:py-7 gap-6 md:gap-12">
          <Link
            href="/"
            className="font-serif font-bold text-[22px] tracking-[-0.01em] inline-flex items-baseline gap-1.5 whitespace-nowrap"
          >
            {/* 三色 brand 渐变：ink 黑 → 品牌黄 → 暖焰红，yoyo 平滑往返 6s 一轮 */}
            <GradientText
              colors={['#0d0d0d', '#F4C300', '#E03E3E']}
              animationSpeed={6}
              direction="horizontal"
              yoyo
            >
              有人要吗
            </GradientText>
            {/* Brand dot — subtle "breath" every few seconds keeps the logo alive */}
            <span className="w-2 h-2 rounded-sm bg-brand-yellow inline-block brand-breath motion-reduce:animate-none" aria-hidden />
          </Link>
          <nav aria-label="主导航" className="hidden md:flex gap-9 text-[14px] text-[#444] ml-6">
            {NAV_ITEMS.map((item) => (
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
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5 md:gap-[22px] text-[13px] text-[#444]">
            {user ? (
              <Link href="/me" className="hidden sm:inline hover:text-brand-ink transition-colors">
                我的
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
