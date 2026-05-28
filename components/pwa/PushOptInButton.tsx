'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

// urlBase64 → Uint8Array（subscribe 需要 applicationServerKey）
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

type State = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading'

/**
 * 开启推送按钮。放在 /me 页面里 —— 用户主动点才请求通知权限 + 订阅。
 * iOS 必须先把网站「添加到主屏幕」并从主屏打开，才能开通知（iOS 16.4+）。
 */
export default function PushOptInButton() {
  const { show } = useToast()
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    setState(Notification.permission as State)
  }, [])

  async function enable() {
    setState('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission as State)
        if (permission === 'denied') {
          show('通知权限被拒绝 — 可在浏览器设置里重新允许', 'error')
        }
        return
      }

      const reg = await navigator.serviceWorker.ready
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!key) {
        show('推送未配置', 'error')
        setState('default')
        return
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })
      if (!res.ok) {
        show('订阅保存失败', 'error')
        setState('default')
        return
      }
      setState('granted')
      show('已开启消息推送 🔔', 'success')
    } catch (e: any) {
      show(`开启失败: ${e?.message || '未知错误'}`, 'error')
      setState('default')
    }
  }

  if (state === 'unsupported') {
    return (
      <div className="text-[12px] text-brand-muted">
        当前浏览器不支持推送。iOS 用户请先「添加到主屏幕」再打开。
      </div>
    )
  }

  if (state === 'granted') {
    return (
      <div className="text-[13px] text-brand-free flex items-center gap-1.5">
        🔔 消息推送已开启
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === 'loading' || state === 'denied'}
      className="text-[13px] bg-brand-ink text-white rounded-pill px-4 py-2 font-medium hover:opacity-85 active:translate-y-px transition-all disabled:opacity-50"
    >
      {state === 'loading'
        ? '处理中…'
        : state === 'denied'
          ? '通知被拒（去浏览器设置开）'
          : '🔔 开启新消息推送'}
    </button>
  )
}
