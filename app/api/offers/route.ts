import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/offers
// Body: { listing_id: string, amount: number, message?: string }
// - Authenticated user creates a new chain-starting offer on a listing.
// - Amount must be strictly less than the listing's current price.
// - Buyer cannot offer on their own listing.
// - A new `chain_id` is allocated; subsequent counters reuse it.
export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const listing_id: string | undefined = body?.listing_id
  const amount = Number(body?.amount)
  const message = typeof body?.message === 'string' ? body.message.slice(0, 280) : null

  if (!listing_id) return NextResponse.json({ error: 'missing listing_id' }, { status: 400 })
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: '请输入有效金额' }, { status: 400 })
  }

  // Fetch listing for price + seller + ownership check
  const { data: listing, error: lerr } = await supabase
    .from('listings')
    .select('id, user_id, price, status')
    .eq('id', listing_id)
    .single()
  if (lerr || !listing) return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  if (listing.status !== 'published') {
    return NextResponse.json({ error: '此商品当前不接受砍价' }, { status: 409 })
  }
  if (listing.user_id === user.id) {
    return NextResponse.json({ error: '不能给自己的闲置砍价' }, { status: 403 })
  }
  if (amount >= Number(listing.price)) {
    return NextResponse.json(
      { error: `砍价金额需低于现价 €${listing.price}` },
      { status: 400 },
    )
  }

  // Use crypto.randomUUID for the chain id so a buyer can have multiple
  // independent chains on one listing (rare but legitimate after rejection).
  const chain_id = crypto.randomUUID()

  const { data: created, error: ierr } = await supabase
    .from('price_offers')
    .insert({
      listing_id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      proposer: 'buyer',
      amount,
      message,
      chain_id,
      status: 'pending',
    })
    .select('id, chain_id, amount, status, created_at')
    .single()
  if (ierr) return NextResponse.json({ error: ierr.message }, { status: 500 })

  return NextResponse.json({ offer: created })
}
