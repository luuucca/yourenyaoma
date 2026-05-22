-- 砍一刀 / 还价 schema
--
-- price_offers tracks the offer chain between buyer and seller for a listing.
-- Each row is one move in the conversation; counter-offers reference their
-- parent via parent_offer_id so we can render the back-and-forth.
--
-- Flow:
--   1. Buyer creates a 'pending' offer at price < listing.price
--   2. Seller can:
--      - accept    → offer.status='accepted'; listing can move to sold
--      - reject    → offer.status='rejected'; end of chain
--      - counter   → offer.status='countered' + new 'pending' offer with
--                    counter_offer.parent_offer_id = original.id and the
--                    SELLER as the proposer now
--   3. Loop until accepted or rejected. We also enforce that a counter must
--      be < listing.price and >= the previous buyer offer (otherwise it's
--      not a counter, it's a price hike).

create table public.price_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  /** who made THIS specific move: 'buyer' or 'seller' */
  proposer text not null check (proposer in ('buyer','seller')),
  /** the price proposed in this move */
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','countered','expired')),
  message text,
  parent_offer_id uuid references public.price_offers(id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  /** denormalized for fast filtering — original buyer-seller pair */
  chain_id uuid not null
);
create index price_offers_listing_idx on public.price_offers (listing_id, created_at desc);
create index price_offers_buyer_idx on public.price_offers (buyer_id, created_at desc);
create index price_offers_seller_idx on public.price_offers (seller_id, created_at desc);
create index price_offers_chain_idx on public.price_offers (chain_id, created_at);
create index price_offers_pending_idx on public.price_offers (status, listing_id)
  where status = 'pending';

-- updated_at trigger not needed since we use responded_at

-- ============================================================
-- RLS
-- ============================================================
alter table public.price_offers enable row level security;

-- Buyer and seller can both read every move in their own chains.
-- Admin sees all.
create policy "offers_select_party" on public.price_offers
  for select using (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Insert: must be a party to the offer; proposer must match auth.uid()'s role
-- in this chain (buyer or seller). Banned users can't propose.
create policy "offers_insert" on public.price_offers
  for insert with check (
    (auth.uid() = buyer_id or auth.uid() = seller_id)
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
    and (
      (proposer = 'buyer'  and auth.uid() = buyer_id)
      or
      (proposer = 'seller' and auth.uid() = seller_id)
    )
  );

-- Update: only the OTHER party can change status (accept/reject/counter)
create policy "offers_update_counterparty" on public.price_offers
  for update using (
    (auth.uid() = buyer_id or auth.uid() = seller_id)
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
