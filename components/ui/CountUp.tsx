'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Numeric target. If string with non-digits, only digits animate, suffix kept. */
  value: number | string
  /** Animation duration in ms. */
  duration?: number
  /** Threshold for the IntersectionObserver. */
  threshold?: number
  /** Optional suffix string ("年", "+", "/小时"). */
  suffix?: string
  /** Optional prefix string ("€"). */
  prefix?: string
  className?: string
}

/**
 * Counts up to `value` once when the element first scrolls into view.
 * Uses requestAnimationFrame with ease-out-cubic for smooth deceleration.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 *
 * If `value` is a string like "€60/小时", pass it as `value` and we'll only
 * animate the embedded digits, preserving the rest of the string.
 */
export default function CountUp({
  value,
  duration = 1200,
  threshold = 0.5,
  suffix = '',
  prefix = '',
  className = '',
}: Props) {
  // Parse string input: extract first integer to animate, keep rest as suffix.
  let target = 0
  let computedPrefix = prefix
  let computedSuffix = suffix
  if (typeof value === 'string') {
    const m = value.match(/(\D*)(\d+)(.*)/)
    if (m) {
      computedPrefix = computedPrefix || m[1]
      target = parseInt(m[2], 10)
      computedSuffix = computedSuffix || m[3]
    }
  } else {
    target = value
  }

  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const triggered = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(target)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3) // ease-out-cubic
            setDisplay(Math.round(target * eased))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [target, duration, threshold])

  return (
    <span ref={ref} className={className}>
      {computedPrefix}
      {display}
      {computedSuffix}
    </span>
  )
}
