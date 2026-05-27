-- 搭子群聊 hangout_messages
-- 一个 hangout = 一个群聊房间
-- 成员定义：host 或 已加入的 participant (hangout_participants.status='joined')

create table if not exists hangout_messages (
  id uuid primary key default gen_random_uuid(),
  hangout_id uuid not null references hangouts(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint hm_body_len check (char_length(body) between 1 and 2000)
);

create index if not exists idx_hm_hangout_time on hangout_messages(hangout_id, created_at desc);

-- 成员判断 helper（security definer 绕过 hangout_participants 自身的 RLS，避免递归）
create or replace function is_hangout_member(p_hangout_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from hangouts h
    where h.id = p_hangout_id and h.host_id = auth.uid()
  ) or exists (
    select 1 from hangout_participants hp
    where hp.hangout_id = p_hangout_id
      and hp.user_id = auth.uid()
      and hp.status = 'joined'
  )
$$;

alter table hangout_messages enable row level security;

-- SELECT：成员可读全部历史
drop policy if exists hm_select on hangout_messages;
create policy hm_select on hangout_messages
  for select to authenticated
  using (is_hangout_member(hangout_id));

-- INSERT：成员可发；sender 必须是自己
drop policy if exists hm_insert on hangout_messages;
create policy hm_insert on hangout_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and is_hangout_member(hangout_id)
  );

-- 不允许 UPDATE / DELETE (聊天记录不可改/删)

-- 启用 Realtime
alter publication supabase_realtime add table hangout_messages;
