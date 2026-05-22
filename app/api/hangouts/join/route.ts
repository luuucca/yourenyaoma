import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/hangouts/join
// Body: { hangout_id: string }
// Returns: { joined: true, host_contact: { wechat, whatsapp, ... } }
// - Requires authenticated user (401 otherwise)
// - Hosts can't join their own hangout
// - 'open' status only; full/closed/cancelled hangouts rejected
// - Inserts into hangout_participants; the sync_hangout_spots trigger updates
//   taken_spots and flips status to 'full' when capacity is reached.
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
  const hangout_id: string | undefined = body?.hangout_id
  if (!hangout_id) return NextResponse.json({ error: 'missing hangout_id' }, { status: 400 })

  // Fetch the hangout + host contact
  const { data: hangout, error } = await supabase
    .from('hangouts')
    .select(
      'id, host_id, status, taken_spots, total_spots, profiles!hangouts_host_id_fkey(nickname, wechat, whatsapp)',
    )
    .eq('id', hangout_id)
    .single()

  if (error || !hangout) {
    return NextResponse.json({ error: 'hangout not found' }, { status: 404 })
  }
  if (hangout.host_id === user.id) {
    return NextResponse.json({ error: '不能加入自己发起的活动' }, { status: 403 })
  }
  if (hangout.status !== 'open') {
    return NextResponse.json({ error: '活动已满 / 已关闭' }, { status: 409 })
  }

  // Insert participant (idempotent via unique PK)
  const { error: insertErr } = await supabase.from('hangout_participants').insert({
    hangout_id,
    user_id: user.id,
    status: 'joined',
  })
  if (insertErr && !insertErr.message.includes('duplicate')) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Host contact for the joining user to coordinate
  const hostProfile: any = (hangout as any).profiles
  return NextResponse.json({
    joined: true,
    host: hostProfile
      ? {
          nickname: hostProfile.nickname,
          wechat: hostProfile.wechat,
          whatsapp: hostProfile.whatsapp,
        }
      : null,
  })
}
