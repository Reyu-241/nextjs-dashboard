alter table public.patients
  add column if not exists owner_id uuid references public.users (id);

alter table public.appointments
  add column if not exists owner_id uuid references public.users (id);

alter table public.treatments
  add column if not exists owner_id uuid references public.users (id);

create index if not exists patients_owner_id_idx
  on public.patients (owner_id);

create index if not exists appointments_owner_id_idx
  on public.appointments (owner_id);

create index if not exists treatments_owner_id_idx
  on public.treatments (owner_id);

create table if not exists public.clinic_data_owner (
  singleton boolean primary key default true check (singleton),
  owner_id uuid not null references public.users (id),
  created_at timestamptz not null default now()
);

revoke all on public.clinic_data_owner from public, anon, authenticated;
grant select, insert, update, delete on public.clinic_data_owner to service_role;

create or replace function public.claim_unowned_clinic_data(requested_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  primary_owner_id uuid;
begin
  if requested_user_id is null then
    raise exception 'A clinic user ID is required.';
  end if;

  insert into public.clinic_data_owner (singleton, owner_id)
  values (true, requested_user_id)
  on conflict (singleton) do nothing;

  select owner_id
  into primary_owner_id
  from public.clinic_data_owner
  where singleton = true
  for update;

  update public.patients
  set owner_id = primary_owner_id
  where owner_id is null;

  update public.appointments
  set owner_id = primary_owner_id
  where owner_id is null;

  update public.treatments
  set owner_id = primary_owner_id
  where owner_id is null;

  return primary_owner_id;
end;
$$;

revoke all on function public.claim_unowned_clinic_data(uuid) from public, anon, authenticated;
grant execute on function public.claim_unowned_clinic_data(uuid) to service_role;

create or replace view public.patients_per_month
with (security_invoker = true) as
select
  months.month_start,
  to_char(months.month_start, 'Mon YYYY') as label,
  count(patients.id)::int as new_patients,
  owners.owner_id
from (select distinct owner_id from public.patients where owner_id is not null) as owners
cross join generate_series(
  date_trunc('month', now()) - interval '5 months',
  date_trunc('month', now()),
  interval '1 month'
) as months(month_start)
left join public.patients
  on patients.owner_id = owners.owner_id
 and patients.created_at >= months.month_start
 and patients.created_at < months.month_start + interval '1 month'
group by owners.owner_id, months.month_start
order by owners.owner_id, months.month_start;

create or replace view public.appointment_status_this_month
with (security_invoker = true) as
select appointments.status, count(*)::int as total, appointments.owner_id
from public.appointments
join public.patients
  on patients.id = appointments.patient_id
 and patients.owner_id = appointments.owner_id
where appointments.owner_id is not null
  and appointments.starts_at >= date_trunc('month', now())
  and appointments.starts_at < date_trunc('month', now()) + interval '1 month'
group by appointments.owner_id, appointments.status;

grant select on public.patients_per_month to service_role;
grant select on public.appointment_status_this_month to service_role;

notify pgrst, 'reload schema';
