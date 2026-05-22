import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ listing_id: z.string().uuid() })

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  const { listing_id } = parsed.data

  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', listing_id)
    .single()

  if (!listing) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  }
  if (listing.status !== 'published' && listing.status !== 'sold') {
    return NextResponse.json({ error: '商品不可查看' }, { status: 403 })
  }
  if (listing.user_id === user.id) {
    return NextResponse.json({ error: '不能查看自己的联系方式' }, { status: 400 })
  }

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { count } = await supabase
    .from('contact_reveals')
    .select('id', { count: 'exact', head: true })
    .eq('viewer_id', user.id)
    .gte('revealed_at', oneMinuteAgo)
  if ((count ?? 0) >= 20) {
    return NextResponse.json({ error: '操作太频繁，请稍后再试' }, { status: 429 })
  }

  await supabase
    .from('contact_reveals')
    .insert({ viewer_id: user.id, listing_id })

  const { data: seller } = await supabase
    .from('profiles')
    .select('wechat, whatsapp')
    .eq('id', listing.user_id)
    .single()

  return NextResponse.json({
    contact: {
      wechat: seller?.wechat ?? null,
      whatsapp: seller?.whatsapp ?? null,
    },
  })
}
