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

const siteName = '有人要吗'
const siteTitle = '有人要吗 — 海外华人邻里社区'
const siteDescription =
  '你不要的，正好有人要。海外华人邻里社区 — 一个平台解决四件事：闲置二手、找师傅、找搭子、找工作。'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: '%s · 有人要吗' },
  description: siteDescription,
  applicationName: siteName,
  keywords: ['海外华人', '二手闲置', '邻里社区', '找师傅', '找搭子', '柏林', '维也纳', '慕尼黑'],
  authors: [{ name: 'LUUUCCA' }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    locale: 'zh_CN',
    siteName,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
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
