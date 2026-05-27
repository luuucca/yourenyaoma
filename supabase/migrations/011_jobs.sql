-- 找工作 jobs — 招工广告
-- 模式跟 listings 类似，但更简单（无图片、无审核、无成色）
-- 业务规则：一个用户同时最多 2 条 status='published'（在 server action 里强制）

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 80),
  description text not null check (char_length(description) between 10 and 2000),
  region text not null,
  salary_text text,
  contact_wechat text,
  contact_whatsapp text,
  contact_email text,
  status text not null default 'published'
    check (status in ('published', 'closed')),
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_published_idx
  on public.jobs (created_at desc) where status = 'published';
create index if not exists jobs_user_idx on public.jobs (user_id);

alter table public.jobs enable row level security;

-- 读：published 公开 / 自己 / admin
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs
  for select using (
    status = 'published'
    or user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 写：只能自己创建
drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs
  for insert with check (user_id = auth.uid());

-- 改：只能改自己的
drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 删：只能删自己的
drop policy if exists jobs_delete on public.jobs;
create policy jobs_delete on public.jobs
  for delete using (user_id = auth.uid());

-- Helper：用户当前 published 招工数（限额校验）
create or replace function active_jobs_count(p_user_id uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.jobs
  where user_id = p_user_id and status = 'published'
$$;
