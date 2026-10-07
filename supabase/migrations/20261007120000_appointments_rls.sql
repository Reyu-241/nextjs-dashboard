create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  starts_at timestamptz not null,
  status text not null default 'booked'
    check (status in ('booked', 'done', 'no_show')),
  created_at timestamptz not null default now()
);

-- The app uses NextAuth and inserts clinic records through the service role,
-- which has no Supabase Auth user. Keep user_id nullable for those records.
alter table public.appointments
  alter column user_id drop not null,
  alter column user_id set default auth.uid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_user_id_fkey'
  ) then
    alter table public.appointments
      add constraint appointments_user_id_fkey
      foreign key (user_id) references auth.users (id) not valid;
  end if;
end;
$$;

create index if not exists appointments_user_id_idx
  on public.appointments (user_id);

create index if not exists appointments_patient_id_idx
  on public.appointments (patient_id);

alter table public.appointments enable row level security;

drop policy if exists "appointments: select own" on public.appointments;
create policy "appointments: select own"
  on public.appointments
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "appointments: insert own" on public.appointments;
create policy "appointments: insert own"
  on public.appointments
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.patients p
      where p.id = patient_id
    )
  );

drop policy if exists "appointments: update own" on public.appointments;
create policy "appointments: update own"
  on public.appointments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.patients p
      where p.id = patient_id
    )
  );

drop policy if exists "appointments: delete own" on public.appointments;
create policy "appointments: delete own"
  on public.appointments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on table public.appointments to service_role;

notify pgrst, 'reload schema';
