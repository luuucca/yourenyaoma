-- 「有人要吗」初始化 schema
-- 在 Supabase Dashboard → SQL Editor 中按顺序执行 001 / 002 / 003

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles（与 auth.users 1:1）
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  district text,
  wechat text,
  whatsapp text,
  role text not null default 'user' check (role in ('user','admin','banned')),
  approved_listing_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- listings
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 60),
  description text not null check (char_length(description) between 5 and 2000),
  price numeric(10,2) not null check (price >= 0),
  is_free boolean generated always as (price = 0) stored,
  category text not null,
  district text not null,
  condition text not null,
  pickup_available boolean not null default true,
  status text not null default 'pending'
    check (status in ('draft','pending','published','rejected','hidden','sold')),
  view_count int not null default 0,
  report_count int not null default 0,
  is_featured boolean not null default false,
  is_urgent boolean not null default false,
  featured_until timestamptz,
  rejected_reason text,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  sold_at timestamptz
);
create index listings_status_published_idx on public.listings (status, published_at desc);
create index listings_category_idx on public.listings (category) where status = 'published';
create index listings_district_idx on public.listings (district) where status = 'published';
create index listings_user_idx on public.listings (user_id);

-- ============================================================
-- listing_images
-- ============================================================
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index listing_images_listing_idx on public.listing_images (listing_id, sort_order);

-- ============================================================
-- favorites
-- ============================================================
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ============================================================
-- reports
-- ============================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  listing_id uuid not null references public.listings(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index reports_listing_idx on public.reports (listing_id);
create index reports_status_idx on public.reports (status);

-- ============================================================
-- moderation_logs
-- ============================================================
create table public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index moderation_logs_created_idx on public.moderation_logs (created_at desc);

-- ============================================================
-- blocked_words（可在数据库里维护）
-- ============================================================
create table public.blocked_words (
  id uuid primary key default gen_random_uuid(),
  word text unique not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- contact_reveals（反爬虫日志 + 未来付费解锁伏笔）
-- ============================================================
create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  revealed_at timestamptz not null default now()
);
create index contact_reveals_viewer_idx on public.contact_reveals (viewer_id, revealed_at desc);

-- ============================================================
-- 触发器：auth.users 创建后自动建立 profile
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 触发器：举报 >= 2 自动隐藏
-- ============================================================
create or replace function public.auto_hide_on_reports()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare cnt int;
begin
  select count(*) into cnt
    from public.reports
   where listing_id = new.listing_id and status = 'open';

  update public.listings
     set report_count = cnt,
         status = case
           when cnt >= 2 and status = 'published' then 'hidden'
           else status
         end
   where id = new.listing_id;

  return new;
end;
$$;

drop trigger if exists reports_after_insert on public.reports;
create trigger reports_after_insert
  after insert on public.reports
  for each row execute function public.auto_hide_on_reports();

-- ============================================================
-- 触发器：updated_at 自动更新
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- ============================================================
-- 触发器：商品状态变为 published 时增加用户 approved_listing_count
-- ============================================================
create or replace function public.bump_approved_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE')
     and old.status <> 'published'
     and new.status = 'published' then
    update public.profiles
       set approved_listing_count = approved_listing_count + 1
     where id = new.user_id;
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end; $$;

create trigger listings_bump_count before update on public.listings
  for each row execute function public.bump_approved_count();

-- ============================================================
-- Storage bucket（图片）
-- ============================================================
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;
