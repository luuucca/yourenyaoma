'use client'

import Link from 'next/link'
import ShinyText from '@/components/ShinyText'

/**
 * Header 右上角「发布闲置」CTA — 黑底，文字带品牌黄色 shine sweep。
 * 每次扫光之间留 2.5s 间隔，避免抢眼。
 */
export default function ShinyPublishCTA() {
  return (
    <Link
      href="/publish"
      className="bg-brand-ink rounded-pill px-[22px] py-[10px] text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all duration-150 whitespace-nowrap inline-block"
    >
      <ShinyText
        text="发布闲置"
        color="#ffffff"
        shineColor="#F4C300"
        speed={2.2}
        spread={80}
        delay={2.5}
        className="font-medium"
      />
    </Link>
  )
}
