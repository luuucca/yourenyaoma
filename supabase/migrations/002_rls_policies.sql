-- RLS 策略
alter table public.profiles         enable row level security;
alter table public.listings         enable row level security;
alter table public.listing_images   enable row level security;
alter table public.favorites        enable row level security;
alter table public.reports          enable row level security;
alter table public.moderation_logs  enable row level security;
alter table public.blocked_words    enable row level security;
alter table public.contact_reveals  enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "profiles_read_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- ============================================================
-- listings
-- ============================================================
create policy "listings_select" on public.listings
  for select using (
    status = 'published'
    or user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "listings_insert" on public.listings
  for insert with check (
    auth.uid() = user_id
    and (select email_confirmed_at from auth.users where id = auth.uid()) is not null
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
  );

create policy "listings_update" on public.listings
  for update using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "listings_delete" on public.listings
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- listing_images
-- ============================================================
create policy "images_select" on public.listing_images
  for select using (
    exists (
      select 1 from public.listings l
       where l.id = listing_id
         and (
           l.status = 'published'
           or l.user_id = auth.uid()
           or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
         )
    )
  );

create policy "images_modify_own" on public.listing_images
  for all using (
    exists (
      select 1 from public.listings l
       where l.id = listing_id and l.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l
       where l.id = listing_id and l.user_id = auth.uid()
    )
  );

-- ============================================================
-- favorites
-- ============================================================
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ============================================================
-- reports
-- ============================================================
create policy "reports_insert_logged_in" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_admin" on public.reports
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "reports_update_admin" on public.reports
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- moderation_logs
-- ============================================================
create policy "logs_select_admin" on public.moderation_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "logs_insert_admin" on public.moderation_logs
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- blocked_words：所有人可读（前端预检），仅 admin 可写
-- ============================================================
create policy "bw_read" on public.blocked_words for select using (true);
create policy "bw_insert_admin" on public.blocked_words for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "bw_update_admin" on public.blocked_words for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "bw_delete_admin" on public.blocked_words for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- contact_reveals
-- ============================================================
create policy "reveals_insert_self" on public.contact_reveals
  for insert with check (auth.uid() = viewer_id);

create policy "reveals_select_self_or_admin" on public.contact_reveals
  for select using (
    auth.uid() = viewer_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Storage policies（listings bucket）
-- ============================================================
create policy "storage_listings_public_read"
  on storage.objects for select
  using (bucket_id = 'listings');

create policy "storage_listings_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_listings_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
