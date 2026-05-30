-- ============================================================
-- 015 头像上传 + 昵称注册后锁定
-- ============================================================
-- 1) avatars 存储桶（公开读）—— 用户头像
-- 2) 存储 RLS：公开读 / 本人上传到自己的 {uid}/ 目录 / 本人删除
-- 3) 触发器：登录用户不能改 nickname（注册时定死）
--    service_role / 管理工具（SQL 编辑器）仍可改，留后台改名的口子
-- ============================================================

-- ---------- 1. avatars 存储桶 ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ---------- 2. avatars 存储 RLS ----------
-- 公开读（头像要在全站任意位置展示）
drop policy if exists "storage_avatars_public_read" on storage.objects;
create policy "storage_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 仅登录用户、且只能传到以自己 uid 命名的目录
drop policy if exists "storage_avatars_authenticated_upload" on storage.objects;
create policy "storage_avatars_authenticated_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 本人可删自己的旧头像（换头像时清理）
drop policy if exists "storage_avatars_owner_delete" on storage.objects;
create policy "storage_avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- 3. 锁定昵称：注册后不可修改 ----------
create or replace function public.prevent_nickname_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 仅拦截「已登录用户」自己改名；service_role / 后台(postgres) 放行
  if auth.role() = 'authenticated'
     and new.nickname is distinct from old.nickname then
    raise exception '昵称注册后不可修改';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_nickname_change on public.profiles;
create trigger trg_prevent_nickname_change
  before update on public.profiles
  for each row
  execute function public.prevent_nickname_change();
