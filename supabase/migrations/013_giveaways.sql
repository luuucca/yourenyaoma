-- 抽奖系统 (PRODUCT.md #42 冷启动钩子)
-- 奖品如 €200 MediaMarkt 代金券。资格：邮箱已验证 + ≥1 published listing
-- + 注册时间 ≥ 抽奖启动日。开奖记录留痕（合格人数 + 可选 random.org signed URL）。

create table if not exists giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  prize text not null check (char_length(prize) between 2 and 120),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'drawn', 'closed')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists giveaway_draws (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references giveaways(id) on delete cascade,
  winner_user_id uuid references auth.users(id),
  winner_nickname text,         -- 公示快照
  winner_email_masked text,     -- 脱敏邮箱快照（如 luu***@gmail.com）
  eligible_count int not null default 0, -- 当时合格人数（公平性证据）
  random_org_url text,          -- 可选 random.org signed result（公平性证据）
  note text,                    -- 开奖备注
  drawn_at timestamptz not null default now(),
  drawn_by uuid references auth.users(id),
  unique (giveaway_id)          -- 一个抽奖只开一次
);

create index if not exists giveaways_status_idx on giveaways (status, ends_at desc);

alter table giveaways enable row level security;
alter table giveaway_draws enable row level security;

-- 公开可读 — /giveaway/rules 公示规则 + 中奖名单
drop policy if exists giveaways_select_public on giveaways;
create policy giveaways_select_public on giveaways for select using (true);

drop policy if exists draws_select_public on giveaway_draws;
create policy draws_select_public on giveaway_draws for select using (true);

-- 写操作不开放给 client（admin 走 server action + service role 绕过 RLS）
-- 默认拒绝所有 insert/update/delete

-- 资格判定 helper：返回某用户对某抽奖是否合格
-- security definer 以便读 auth.users.email_confirmed_at
create or replace function is_giveaway_eligible(p_user_id uuid, p_giveaway_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    -- 邮箱已验证
    exists (
      select 1 from auth.users u
      where u.id = p_user_id and u.email_confirmed_at is not null
    )
    -- 至少 1 条 published listing
    and exists (
      select 1 from listings l
      where l.user_id = p_user_id and l.status = 'published'
    )
    -- 注册时间 ≥ 抽奖启动日
    and exists (
      select 1 from profiles p, giveaways g
      where p.id = p_user_id and g.id = p_giveaway_id
        and p.created_at >= g.starts_at
    )
$$;
