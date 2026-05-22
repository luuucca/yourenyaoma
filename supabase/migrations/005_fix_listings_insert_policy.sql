-- Fix listings_insert RLS policy
--
-- The original 002_rls_policies.sql tried to read `auth.users.email_confirmed_at`
-- inside the policy, but regular authenticated users do NOT have SELECT
-- privilege on auth.users — that's reserved for the service role. Result:
-- every publish attempt failed with `permission denied for table users`.
--
-- Server-side enforcement (app/(user)/publish/actions.ts) already rejects
-- unverified emails before the insert is attempted, so the RLS check is
-- redundant. This migration drops the broken policy and recreates it without
-- the auth.users lookup.

drop policy if exists "listings_insert" on public.listings;

create policy "listings_insert" on public.listings
  for insert with check (
    auth.uid() = user_id
    and (select role from public.profiles where id = auth.uid()) <> 'banned'
  );
