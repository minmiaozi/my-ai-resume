-- 在 Supabase SQL Editor 中执行
-- 解决：permission denied for table payments

-- 1. 给 authenticated 角色表级权限（RLS 策略之外还需要 GRANT）
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;

-- 2. RLS 策略（如已存在会报错，可忽略或先 DROP）
alter table public.payments enable row level security;

drop policy if exists "payments_insert_own" on public.payments;
drop policy if exists "payments_select_own" on public.payments;
drop policy if exists "payments_update_own" on public.payments;

create policy "payments_insert_own"
on public.payments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "payments_select_own"
on public.payments for select
to authenticated
using (auth.uid() = user_id);

create policy "payments_update_own"
on public.payments for update
to authenticated
using (auth.uid() = user_id);
