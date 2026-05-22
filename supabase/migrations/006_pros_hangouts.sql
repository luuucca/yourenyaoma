-- 找师傅 (pros) + 找搭子 (hangouts) schema
--
-- Mirrors the listings table's pattern: row-level security on, owner reads/edits
-- own + admin override, public only sees `status = 'approved'/'published'`.
--
-- After running this, the homepage ProsSection / HangoutsSection can switch
-- from DEMO_PROS / DEMO_HANGOUTS demo data to live queries.

-- ============================================================
-- pros — 认证师傅档案
-- 每个 user 可以同时是普通买家/卖家 AND 一个认证师傅，所以 pros 是一对一
-- 扩展 profiles 而非合并；user_id 是 PK + FK。
-- ============================================================
create table public.pros (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (char_length(role) between 2 and 60),
    -- e.g. "法定翻译 · 中德", "搬家 · 整屋打包"
  badge text,
    -- e.g. "宣誓翻译", "持证电工" — short cred tag
  region text not null,
    -- e.g. "Berlin Mitte", "Berlin · 全城"
  rate text not null,
    -- free-form pricing, e.g. "€60/小时", "€280 起", "€2800/月"
  years int not null default 0 check (years >= 0 and years <= 80),
  jobs_count int not null default 0 check (jobs_count >= 0),
  intro text not null check (char_length(intro) between 5 and 2000),
  avatar_url text,
  contact_wechat text,
  contact_whatsapp text,
  contact_email text,
  cert_image_urls text[] not null default '{}',
    -- proof images uploaded for admin review
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','suspended')),
  rejected_reason text,
  rejected_at timestamptz,
  approved_at timestamptz,
  view_count int not null default 0,
  contact_request_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pros_status_idx on public.pros (status, approved_at desc);

-- ============================================================
-- pro_contact_requests — 当登录用户点「聊一聊」时记录
-- 类似 contact_reveals 的反爬虫日志 + 未来变现伏笔
-- ============================================================
create table public.pro_contact_requests (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  pro_user_id uuid not null references public.pros(user_id) on delete cascade,
  revealed_at timestamptz not null default now()
);
create index pro_contact_requests_viewer_idx
  on public.pro_contact_requests (viewer_id, revealed_at desc);

-- ============================================================
-- hangouts — 同城搭子活动
-- ============================================================
create table public.hangouts (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  tag text not null,
    -- 球友 / 学习 / 饭搭子 / 游戏 / 户外 / 拼车 / 其他
  description text,
  when_text text not null,
    -- free-form for flexibility: "周六 11:00", "每周二 19:00"
  starts_at timestamptz,
    -- structured timestamp when known — used for "本周活动" filter
  region text not null,
    -- e.g. "Berlin Mitte · 1.2km", "线上 · 国服"
  total_spots int not null default 1 check (total_spots between 1 and 200),
  taken_spots int not null default 0
    check (taken_spots >= 0 and taken_spots <= total_spots),
  cover_image_url text,
  status text not null default 'open'
    check (status in ('open','full','closed','cancelled','hidden')),
  view_count int not null default 0,
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hangouts_status_idx on public.hangouts (status, created_at desc);
create index hangouts_tag_idx on public.hangouts (tag) where status = 'open';

-- ============================================================
-- hangout_participants — m:n between hangouts and users
-- ============================================================
create table public.hangout_participants (
  hangout_id uuid not null references public.hangouts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  status text not null default 'joined'
    check (status in ('joined','cancelled','removed')),
  primary key (hangout_id, user_id)
);
create index hangout_participants_user_idx on public.hangout_participants (user_id);

-- ============================================================
-- Triggers: updated_at 自动更新
-- ============================================================
create trigger pros_updated_at before update on public.pros
  for each row execute function public.set_updated_at();
create trigger hangouts_updated_at before update on public.hangouts
  for each row execute function public.set_updated_at();

-- ============================================================
-- Trigger: pros 状态转 approved 时记录 approved_at
-- ============================================================
create or replace function public.stamp_pros_approved()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE'
     and old.status <> 'approved'
     and new.status = 'approved' then
    new.approved_at := coalesce(new.approved_at, now());
  end if;
  return new;
end; $$;
create trigger pros_stamp_approved before update on public.pros
  for each row execute function public.stamp_pros_approved();

-- ============================================================
-- Trigger: hangout_participants insert → bump hangouts.taken_spots
-- and flip status to 'full' when capacity reached.
-- ============================================================
create or replace function public.sync_hangout_spots()
returns trigger language plpgsql security definer set search_path = public as $$
declare cnt int; cap int;
begin
  select count(*), max(h.total_spots)
    into cnt, cap
    from public.hangout_participants p
    join public.hangouts h on h.id = p.hangout_id
   where p.hangout_id = coalesce(new.hangout_id, old.hangout_id)
     and p.status = 'joined';

  update public.hangouts
     set taken_spots = cnt,
         status = case
           when status in ('open','full') and cnt >= cap then 'full'
           when status = 'full' and cnt < cap then 'open'
           else status
         end
   where id = coalesce(new.hangout_id, old.hangout_id);

  return coalesce(new, old);
end; $$;
create trigger hangout_participants_sync
  after insert or update or delete on public.hangout_participants
  for each row execute function public.sync_hangout_spots();

-- ============================================================
-- RLS
-- ============================================================
alter table public.pros                    enable row level security;
alter table public.pro_contact_requests    enable row level security;
alter table public.hangouts                enable row level security;
alter table public.hangout_participants    enable row level security;

-- pros: anyone can read approved, owner reads own, admin reads all
create policy "pros_select" on public.pros
  for select using (
    status = 'approved'
    or user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "pros_insert_self" on public.pros
  for insert with check (
    auth.uid() = user_id
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
  );

create policy "pros_update" on public.pros
  for update using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "pros_delete" on public.pros
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- pro_contact_requests: viewer can insert + read own; admin reads all
create policy "pro_reveals_insert_self" on public.pro_contact_requests
  for insert with check (auth.uid() = viewer_id);

create policy "pro_reveals_select" on public.pro_contact_requests
  for select using (
    auth.uid() = viewer_id
    or auth.uid() = pro_user_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- hangouts: anyone can read open/full, host reads own (any status), admin all
create policy "hangouts_select" on public.hangouts
  for select using (
    status in ('open','full')
    or host_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "hangouts_insert_self" on public.hangouts
  for insert with check (
    auth.uid() = host_id
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
  );

create policy "hangouts_update" on public.hangouts
  for update using (
    host_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "hangouts_delete" on public.hangouts
  for delete using (
    host_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- hangout_participants: anyone can read for an open hangout (to show "缺位"),
-- user inserts only themselves, host or admin can remove anyone.
create policy "hp_select" on public.hangout_participants
  for select using (
    exists (
      select 1 from public.hangouts h
       where h.id = hangout_id
         and (h.status in ('open','full') or h.host_id = auth.uid() or user_id = auth.uid())
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "hp_insert_self" on public.hangout_participants
  for insert with check (
    auth.uid() = user_id
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
  );

create policy "hp_update_self_or_host" on public.hangout_participants
  for update using (
    user_id = auth.uid()
    or exists (
      select 1 from public.hangouts h
       where h.id = hangout_id and h.host_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "hp_delete_self_or_host" on public.hangout_participants
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.hangouts h
       where h.id = hangout_id and h.host_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Storage bucket for cert images + hangout cover images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('pros', 'pros', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('hangouts', 'hangouts', true)
on conflict (id) do nothing;

create policy "storage_pros_public_read"
  on storage.objects for select
  using (bucket_id = 'pros');

create policy "storage_pros_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'pros'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_hangouts_public_read"
  on storage.objects for select
  using (bucket_id = 'hangouts');

create policy "storage_hangouts_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'hangouts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
