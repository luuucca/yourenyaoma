'use client'

import { useEffect, useState } from 'react'

/**
 * 手机端「添加到主屏」提示。
 * - 已经是 standalone（已装）→ 不显示
 * - 之前关过 → 7 天内不再显示
 * - iOS Safari：弹手把手步骤（iOS 不支持自动安装，只能教用户点分享）
 * - Android Chrome：拦 beforeinstallprompt，给「一键安装」按钮
 * - 延迟 4s 出现，避免一进站就糊脸
 */

const DISMISS_KEY = 'a2hs-dismissed-at'
const SNOOZE_DAYS = 7

export default function AddToHomeHint() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferred, setDeferred] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 已安装（standalone）→ 不提示
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari 专有
      (window.navigator as any).standalone === true
    if (standalone) return

    // 最近关过 → 暂停 SNOOZE_DAYS 天
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (at && Date.now() - at < SNOOZE_DAYS * 864e5) return
    } catch {
      /* ignore */
    }

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|micromessenger/i.test(ua)
    const isAndroid = /android/i.test(ua)

    if (isIOS && isSafari) {
      setPlatform('ios')
      const t = setTimeout(() => setVisible(true), 4000)
      return () => clearTimeout(t)
    }

    if (isAndroid) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferred(e)
        setPlatform('android')
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  async function androidInstall() {
    if (!deferred) return
    deferred.prompt()
    try {
      await deferred.userChoice
    } catch {
      /* ignore */
    }
    setDeferred(null)
    dismiss()
  }

  if (!visible || !platform) return null

  return (
    <div
      className="md:hidden fixed inset-x-3 z-50 bottom-[calc(72px+env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-label="添加到主屏幕"
    >
      <div className="bg-brand-ink text-white rounded-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4)] p-4 relative animate-card-rise">
        <button
          type="button"
          onClick={dismiss}
          aria-label="关闭"
          className="absolute top-2.5 right-3 text-white/50 hover:text-white text-[18px] leading-none"
        >
          ×
        </button>

        <div className="flex items-start gap-3">
          {/* 品牌图标 */}
          <div className="w-10 h-10 rounded-xl bg-brand-ink border border-white/20 flex items-center justify-center shrink-0">
            <span className="font-serif font-bold text-brand-yellow text-[20px] leading-none">
              要
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="font-medium text-[14px]">把「有人要吗」装到主屏</div>

            {platform === 'ios' ? (
              <div className="text-[12px] text-white/70 mt-1.5 leading-relaxed">
                点底部
                <ShareGlyph />
                分享按钮 → 选「添加到主屏幕」，下次像 app 一样秒开。
              </div>
            ) : (
              <div className="text-[12px] text-white/70 mt-1.5 leading-relaxed">
                一键装到桌面，全屏打开 + 新消息推送。
              </div>
            )}

            {platform === 'android' && (
              <button
                type="button"
                onClick={androidInstall}
                className="mt-3 bg-brand-yellow text-brand-ink rounded-pill px-4 py-1.5 text-[13px] font-semibold active:translate-y-px transition-transform"
              >
                安装到主屏
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// iOS 分享按钮图标（方框 + 向上箭头）
function ShareGlyph() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 align-middle mx-1 -mt-0.5">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
        <path
          d="M12 3v12M12 3l-4 4M12 3l4 4"
          stroke="#F4C300"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"
          stroke="#F4C300"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
