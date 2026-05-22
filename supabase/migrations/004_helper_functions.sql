-- 辅助函数
create or replace function public.increment_view_count(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.listings
     set view_count = view_count + 1
   where id = p_listing_id and status in ('published', 'sold');
end;
$$;

grant execute on function public.increment_view_count(uuid) to anon, authenticated;
