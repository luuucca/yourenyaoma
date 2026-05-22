import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/reveal-pro-contact
// Body: { pro_user_id: string }
// Returns: { wechat, whatsapp, email }
// - Requires authenticated user (401 otherwise)
// - Logs a row to pro_contact_requests for anti-scrape + future paywall
// - Returns the pro's contact fields if status === 'approved'
export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const pro_user_id: string | undefined = body?.pro_user_id
  if (!pro_user_id || typeof pro_user_id !== 'string') {
    return NextResponse.json({ error: 'missing pro_user_id' }, { status: 400 })
  }

  // Fetch the pro
  const { data: pro, error } = await supabase
    .from('pros')
    .select('user_id, status, contact_wechat, contact_whatsapp, contact_email')
    .eq('user_id', pro_user_id)
    .single()

  if (error || !pro) {
    return NextResponse.json({ error: 'pro not found' }, { status: 404 })
  }
  if (pro.status !== 'approved') {
    return NextResponse.json({ error: 'pro not approved' }, { status: 403 })
  }

  // Log the reveal (RLS allows viewer_id = auth.uid())
  await supabase.from('pro_contact_requests').insert({
    viewer_id: user.id,
    pro_user_id: pro.user_id,
  })

  return NextResponse.json({
    wechat: pro.contact_wechat,
    whatsapp: pro.contact_whatsapp,
    email: pro.contact_email,
  })
}
