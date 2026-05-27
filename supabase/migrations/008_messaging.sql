-- 站内信 — conversations + messages
-- 一个 conversation = 一个 listing 上买家和卖家的一对一对话
-- 买家发起，平台留 log，可换微信前先在平台聊
--
-- 索引策略：
--  - 收件箱按 last_message_at desc 排序
--  - 单个 conversation 内消息按 created_at desc
--  - 未读消息只索引 read_at is null 的

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conv_unique unique (listing_id, buyer_id, seller_id),
  constraint conv_not_self check (buyer_id <> seller_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint msg_body_len check (char_length(body) between 1 and 2000)
);

create index if not exists idx_conv_buyer on conversations(buyer_id, last_message_at desc);
create index if not exists idx_conv_seller on conversations(seller_id, last_message_at desc);
create index if not exists idx_msg_conv_time on messages(conversation_id, created_at desc);
create index if not exists idx_msg_unread on messages(conversation_id, sender_id) where read_at is null;

-- 启用 RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- conversations: 参与者可读
drop policy if exists conv_select on conversations;
create policy conv_select on conversations
  for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- conversations: 买家创建 (insert 时 buyer_id 必须等于 auth.uid())
drop policy if exists conv_insert on conversations;
create policy conv_insert on conversations
  for insert to authenticated
  with check (auth.uid() = buyer_id and buyer_id <> seller_id);

-- conversations: 参与者可更新 last_message_at
drop policy if exists conv_update on conversations;
create policy conv_update on conversations
  for update to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- messages: 参与者可读
drop policy if exists msg_select on messages;
create policy msg_select on messages
  for select to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- messages: 只有参与者本人能以自己身份发消息
drop policy if exists msg_insert on messages;
create policy msg_insert on messages
  for insert to authenticated
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- messages: 收件人可标记已读（只能更新别人发给自己的消息的 read_at）
drop policy if exists msg_update_read on messages;
create policy msg_update_read on messages
  for update to authenticated
  using (
    sender_id <> auth.uid() and
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- 触发器：发新消息时更新 conversation.last_message_at
create or replace function bump_conv_last_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_conv on messages;
create trigger trg_bump_conv
  after insert on messages
  for each row execute function bump_conv_last_message();

-- 启用 Realtime 推送
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- 给当前用户在某 conversation 内未读消息数的辅助函数
create or replace function unread_count_for_conversation(p_conv_id uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from messages m
  join conversations c on c.id = m.conversation_id
  where m.conversation_id = p_conv_id
    and m.sender_id <> auth.uid()
    and m.read_at is null
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
$$;

-- 给当前用户总未读数（Header 红点用）
create or replace function unread_count_total()
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from messages m
  join conversations c on c.id = m.conversation_id
  where m.sender_id <> auth.uid()
    and m.read_at is null
    and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
$$;
