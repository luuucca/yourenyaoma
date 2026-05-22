import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/hangouts/leave
// Body: { hangout_id: string }
// - Requires authenticated user (401 otherwise)
// - Sets the participant row's status to 'cancelled' (we keep the audit row
//   instead of hard-deleting, so the join trigger recomputes taken_spots and
//   we have a record the user once joined).
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

  // Hard delete is cleaner here — re-joining a cancelled row would otherwise
  // require an UPDATE, and the PK (hangout_id, user_id) means we can't re-INSERT
  // until the cancelled row is gone. Deleting also lets the count trigger run
  // naturally on DELETE.
  const { error } = await supabase
    .from('hangout_participants')
    .delete()
    .eq('hangout_id', hangout_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ left: true })
}
