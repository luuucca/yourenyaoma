-- 搬家甩卖 bundle 关系
-- 复用 listings 表：父 listing 是 category='moving' 的 bundle 入口，
-- 子 listings 通过 parent_listing_id 挂在父下面。
--
-- bundle_only = true: 子 listing 只在父 bundle 详情里展示，不出现在 /browse
-- bundle_only = false: 子 listing 也出现在 /browse 普通分类里（独立可购）

alter table public.listings
  add column if not exists parent_listing_id uuid
  references public.listings(id) on delete cascade;

alter table public.listings
  add column if not exists bundle_only boolean not null default false;

create index if not exists listings_parent_idx
  on public.listings (parent_listing_id) where parent_listing_id is not null;

-- 防止循环嵌套（父不能是自己的子）— 简单 CHECK 即可，FK 自身已经禁止设为自己
alter table public.listings
  drop constraint if exists listings_not_self_parent;
alter table public.listings
  add constraint listings_not_self_parent check (parent_listing_id is null or parent_listing_id <> id);
