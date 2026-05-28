import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 保存 / 更新当前用户的 Web Push 订阅
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '请先登录' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const sub = body?.subscription
  const endpoint: string | undefined = sub?.endpoint
  const p256dh: string | undefined = sub?.keys?.p256dh
  const auth: string | undefined = sub?.keys?.auth
  if (!endpoint || !p256dh || !auth) {
    return Response.json({ error: '订阅数据不完整' }, { status: 400 })
  }

  // upsert by endpoint (同设备重复订阅不报错)
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    },
    { onConflict: 'endpoint' },
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

// 取消订阅
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '请先登录' }, { status: 401 })

  const { endpoint } = await req.json().catch(() => ({}))
  if (!endpoint) return Response.json({ error: 'endpoint required' }, { status: 400 })

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  return Response.json({ ok: true })
}
