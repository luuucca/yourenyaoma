import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Noto_Serif_SC, JetBrains_Mono } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import ConsoleEasterEgg from '@/components/layout/ConsoleEasterEgg'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const noto = Noto_Sans_SC({
  subsets: ['latin'],
  // 900 needed for the giant "宣言横滚带" marquee — see DESIGN.md
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
})

const serif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: '有人要吗 — 维也纳华人二手闲置交易平台', template: '%s · 有人要吗' },
  description: '你不要的，正好有人要。维也纳本地华人二手闲置发布、浏览、自取交易平台。',
  openGraph: {
    title: '有人要吗 — 维也纳华人二手闲置交易平台',
    description: '你不要的，正好有人要。',
    type: 'website',
    locale: 'zh_CN',
  },
}

export const viewport: Viewport = {
  themeColor: '#F4C300',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${noto.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-white text-brand-ink antialiased">
        <ToastProvider>
          <ConsoleEasterEgg />
          <Header />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  )
}
