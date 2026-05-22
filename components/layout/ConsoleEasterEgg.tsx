'use client'
import { useEffect } from 'react'

// Discoverable delight for curious developers (and ourselves at 3am).
// Prints once on first mount. Used by the root layout.
export default function ConsoleEasterEgg() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Avoid spamming on every navigation — only first session load.
    if ((window as any).__YRYM_HELLO) return
    ;(window as any).__YRYM_HELLO = true

    const style = 'font: 22px/1.4 "Noto Serif SC", serif; color: #0d0d0d; background: #F4C300; padding: 12px 18px; border-radius: 4px;'
    const sub = 'font: 12px "JetBrains Mono", monospace; color: #888;'
    console.log('%c有人要吗?', style)
    console.log(
      '%c你不要的，正好有人要 — 邻里之间的温柔循环 · https://aoxiong.at',
      sub,
    )
    console.log(
      '%cLike what you see? Reach out — 邻居总是欢迎邻居。',
      sub,
    )
  }, [])
  return null
}
