-- Web Push 订阅 — 每个用户每个设备一条订阅
-- endpoint 是浏览器 push service 返回的唯一 URL，作为去重键

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists push_sub_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- 用户只能看/删自己的订阅
drop policy if exists push_sub_select on push_subscriptions;
create policy push_sub_select on push_subscriptions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists push_sub_insert on push_subscriptions;
create policy push_sub_insert on push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists push_sub_delete on push_subscriptions;
create policy push_sub_delete on push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- 发送方（server action）用 service-role 读取收件人的订阅，绕过 RLS
