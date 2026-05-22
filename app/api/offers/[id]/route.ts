import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/offers/[id]
// Body: { action: 'accept' | 'reject' | 'counter', amount?: number, message?: string }
// - The COUNTERPARTY (not the proposer) responds to the most recent pending
//   offer in a chain.
// - 'accept'  → marks offer.status='accepted'. (Marking the listing sold is a
//                separate explicit step on the seller's side.)
// - 'reject'  → marks offer.status='rejected'; ends the chain.
// - 'counter' → marks offer.status='countered' + inserts a new pending offer
//                with the OPPOSITE proposer, amount must be > prev amount but
//                < listing.price (you can counter up, not down).
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { id } = params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const action: string | undefined = body?.action
  const message = typeof body?.message === 'string' ? body.message.slice(0, 280) : null

  if (!action || !['accept', 'reject', 'counter'].includes(action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 })
  }

  // Load the target offer (RLS lets buyer + seller read their own).
  const { data: offer, error: oerr } = await supabase
    .from('price_offers')
    .select('*, listings!price_offers_listing_id_fkey(price, status)')
    .eq('id', id)
    .single()
  if (oerr || !offer) return NextResponse.json({ error: '砍价不存在' }, { status: 404 })

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: '此砍价已被处理' }, { status: 409 })
  }

  // Only the COUNTERPARTY can respond — the side that DIDN'T propose this move.
  const isBuyer = user.id === offer.buyer_id
  const isSeller = user.id === offer.seller_id
  const isCounterparty =
    (offer.proposer === 'buyer' && isSeller) ||
    (offer.proposer === 'seller' && isBuyer)
  if (!isCounterparty) {
    return NextResponse.json(
      { error: '只能回应对方发起的砍价' },
      { status: 403 },
    )
  }

  if (action === 'accept' || action === 'reject') {
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'
    const { error: uerr } = await supabase
      .from('price_offers')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', id)
    if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: newStatus })
  }

  // action === 'counter'
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: '请输入有效金额' }, { status: 400 })
  }
  const listingPrice = Number((offer as any).listings?.price ?? 0)
  if (amount >= listingPrice) {
    return NextResponse.json(
      { error: `回砍金额需低于原价 €${listingPrice}` },
      { status: 400 },
    )
  }
  if (amount <= Number(offer.amount)) {
    return NextResponse.json(
      { error: `回砍金额需高于对方出价 €${offer.amount}` },
      { status: 400 },
    )
  }

  // Mark previous offer 'countered'
  const { error: uerr } = await supabase
    .from('price_offers')
    .update({ status: 'countered', responded_at: new Date().toISOString() })
    .eq('id', id)
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 })

  // Insert the new pending offer with OPPOSITE proposer
  const nextProposer = offer.proposer === 'buyer' ? 'seller' : 'buyer'
  const { data: inserted, error: ierr } = await supabase
    .from('price_offers')
    .insert({
      listing_id: offer.listing_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      proposer: nextProposer,
      amount,
      message,
      parent_offer_id: offer.id,
      chain_id: offer.chain_id,
      status: 'pending',
    })
    .select('id, chain_id, amount, status, created_at, proposer')
    .single()
  if (ierr) return NextResponse.json({ error: ierr.message }, { status: 500 })

  return NextResponse.json({ ok: true, offer: inserted })
}
