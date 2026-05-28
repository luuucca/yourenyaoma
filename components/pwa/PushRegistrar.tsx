'use client'

import { useEffect } from 'react'

/**
 * 静默注册 Service Worker（用于离线兜底 + 接收 push）。
 * 不主动弹权限请求 — 那个交给 PushOptInButton 在用户有意图时再触发，
 * 避免一进站就弹「允许通知吗」吓跑用户。
 */
export default function PushRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // 注册 SW（已注册会复用）
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 静默失败 — 不打扰用户
    })
  }, [])

  return null
}
