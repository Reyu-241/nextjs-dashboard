alter table public.appointments enable row level security;
alter table public.treatments enable row level security;

grant select, insert, update, delete
  on table public.appointments, public.treatments
  to authenticated;

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
      select 1
      from public.patients p
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
      select 1
      from public.patients p
      where p.id = patient_id
    )
  );

drop policy if exists "appointments: delete own" on public.appointments;
create policy "appointments: delete own"
  on public.appointments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "treatments: select own" on public.treatments;
create policy "treatments: select own"
  on public.treatments
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "treatments: insert own" on public.treatments;
create policy "treatments: insert own"
  on public.treatments
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "treatments: update own" on public.treatments;
create policy "treatments: update own"
  on public.treatments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists "treatments: delete own" on public.treatments;
create policy "treatments: delete own"
  on public.treatments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete
  on table public.appointments, public.treatments
  to service_role;
