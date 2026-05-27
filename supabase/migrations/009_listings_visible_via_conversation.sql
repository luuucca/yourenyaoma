-- 让对话参与者总能看到所聊的 listing，不论 status
-- 不加这条的话，listing 一旦从 published 变成 sold/hidden/pending，
-- 站内信收件箱里这条对话的商品就会显示成「已删除」（其实没删，只是 RLS 拦了）
--
-- 这个策略是「附加」的（PostgreSQL 多个 SELECT 策略之间是 OR），
-- 原来的 listings_select（published / owner / admin）保持不变。

drop policy if exists "listings_select_via_conversation" on public.listings;
create policy "listings_select_via_conversation" on public.listings
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.listing_id = listings.id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
