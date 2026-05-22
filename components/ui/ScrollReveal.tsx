'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Stagger delay in ms. Pass `index * step` from the parent map. */
  delay?: number
  /** Distance to translate from below, in px. Default 16. */
  distance?: number
  /** Intersection ratio that triggers the reveal. Default 0.15. */
  threshold?: number
  /** Custom className to merge onto the wrapper. */
  className?: string
  /** Whether to render as inline (span) instead of block (div). */
  inline?: boolean
}

/**
 * Wraps children in a div that fades + rises on first scroll into view.
 * One-shot: disconnects after triggering. Respects prefers-reduced-motion via
 * the global @media rule in globals.css (which neutralises our transition).
 *
 * Usage:
 *   {items.map((it, i) => (
 *     <ScrollReveal key={it.id} delay={i * 70}>
 *       <Card ... />
 *     </ScrollReveal>
 *   ))}
 */
export default function ScrollReveal({
  children,
  delay = 0,
  distance = 16,
  threshold = 0.15,
  className = '',
  inline = false,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // If the user prefers reduced motion, show immediately; no animation.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold])

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : `translateY(${distance}px)`,
    transitionProperty: 'opacity, transform',
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: shown ? 'auto' : 'opacity, transform',
  }

  if (inline) {
    return (
      <span ref={ref as any} style={style} className={className}>
        {children}
      </span>
    )
  }
  return (
    <div ref={ref as any} style={style} className={className}>
      {children}
    </div>
  )
}
