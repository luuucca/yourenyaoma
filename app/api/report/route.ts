import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reportSchema } from '@/lib/validations/report'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = reportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? '参数错误' },
      { status: 400 },
    )
  }

  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('listing_id', parsed.data.listing_id)
    .eq('status', 'open')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '你已经举报过这个商品' }, { status: 400 })
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    listing_id: parsed.data.listing_id,
    reason: parsed.data.reason,
    description: parsed.data.description || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
