import { NextResponse } from 'next/server'

// GET /api/check-nickname?nickname=xxx
//
// Returns { available: boolean, reason?: 'too_short' | 'invalid' }.
// Uses service_role to query profiles (case-insensitive ilike). The profiles
// table is publicly readable per RLS, but service_role bypasses any future
// tightening of that policy.
//
// Used by SignupForm for debounced realtime nickname availability check.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const nickname = (url.searchParams.get('nickname') || '').trim()

  if (nickname.length < 2) {
    return NextResponse.json({ available: false, reason: 'too_short' })
  }
  if (nickname.length > 24) {
    return NextResponse.json({ available: false, reason: 'too_long' })
  }
  // Disallow whitespace-only and a few obvious reserved words
  if (/^\s+$/.test(nickname)) {
    return NextResponse.json({ available: false, reason: 'invalid' })
  }
  if (['admin', 'administrator', '管理员', 'system', 'root'].includes(nickname.toLowerCase())) {
    return NextResponse.json({ available: false, reason: 'reserved' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Case-insensitive exact match (PostgREST `ilike` with escaped special chars)
  const safeNickname = nickname.replace(/[%_,]/g, '\\$&')
  const res = await fetch(
    `${supabaseUrl}/rest/v1/profiles?nickname=ilike.${encodeURIComponent(safeNickname)}&select=id&limit=1`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: 'no-store',
    },
  )
  if (!res.ok) {
    return NextResponse.json({ available: false, reason: 'server_error' }, { status: 500 })
  }
  const rows = await res.json()
  return NextResponse.json({ available: rows.length === 0 })
}
