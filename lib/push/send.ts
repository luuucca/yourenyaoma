import 'server-only'
import webpush from 'web-push'

/**
 * Web Push 发送 helper。用 service-role 读取收件人订阅后调用。
 * 仅在 server 端（nodejs runtime）使用 — web-push 不能跑 Edge。
 */

let configured = false
function ensureConfigured() {
  if (configured) return
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
  if (!pub || !priv) {
    throw new Error('VAPID keys 未配置')
  }
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
}

type PushSub = {
  endpoint: string
  p256dh: string
  auth: string
}

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * 给某个用户的所有设备推送。失败的订阅（410 Gone）自动从库里删除。
 * 用 service-role client 传入以读取/清理订阅。
 */
export async function pushToUser(
  serviceClient: {
    from: (t: string) => any
  },
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return { sent: 0, failed: 0 } // 未配置 → 静默跳过
  }
  ensureConfigured()

  const { data: subs } = await serviceClient
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 }

  const json = JSON.stringify(payload)
  let sent = 0
  let failed = 0
  const deadEndpoints: string[] = []

  await Promise.all(
    (subs as (PushSub & { id: string })[]).map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          json,
        )
        sent++
      } catch (e: any) {
        failed++
        // 404 / 410 = 订阅失效，清理掉
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          deadEndpoints.push(s.endpoint)
        }
      }
    }),
  )

  if (deadEndpoints.length > 0) {
    await serviceClient
      .from('push_subscriptions')
      .delete()
      .in('endpoint', deadEndpoints)
  }

  return { sent, failed }
}
