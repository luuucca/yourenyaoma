'use client'
import { useEffect, useRef } from 'react'

// Minimal wrapper around Cloudflare Turnstile JS API. Loads the script once,
// renders the widget into a managed div, and reports the resulting token back
// to the parent via onToken.
//
// Setup:
//   1. Get a site key from https://dash.cloudflare.com/?to=/:account/turnstile
//   2. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local
//   3. In Supabase Dashboard → Authentication → Settings → enable
//      "Cloudflare Turnstile" and paste the SECRET key there.
//      Supabase then validates the token on signUp({ captchaToken }).

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'flexible'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

type Props = {
  /** Called whenever a new token is issued. Token expires; check expired-callback. */
  onToken: (token: string | null) => void
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export default function TurnstileWidget({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return // skip silently if not configured

    // Load script once
    let script = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    let mounted = true
    const tryRender = () => {
      if (!mounted) return
      if (!window.turnstile || !containerRef.current) {
        setTimeout(tryRender, 100)
        return
      }
      if (widgetIdRef.current) return // already rendered
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
        theme: 'light',
        size: 'flexible',
      })
    }
    tryRender()

    return () => {
      mounted = false
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onToken])

  // When site key isn't set, show a small explanatory placeholder so the dev
  // notices something's missing. In production builds you should always have it.
  if (!siteKey) {
    return (
      <div className="text-[11px] text-brand-muted p-3 rounded-xl bg-brand-cream border border-brand-line">
        Cloudflare Turnstile 未配置 — 跳过人机验证。生产环境记得在 .env.local 设置{' '}
        <code className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>。
      </div>
    )
  }

  return <div ref={containerRef} className="min-h-[65px]" aria-label="人机验证" />
}
