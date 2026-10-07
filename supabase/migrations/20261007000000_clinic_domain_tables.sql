create extension if not exists pgcrypto;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  full_name text not null,
  phone text,
  date_of_birth date,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  starts_at timestamptz not null,
  status text not null check (status in ('booked', 'done', 'no_show')),
  created_at timestamptz not null default now()
);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  procedure text not null,
  fee_cents integer not null check (fee_cents >= 0),
  created_at timestamptz not null default now()
);

alter table public.patients
  alter column user_id set default auth.uid();

alter table public.appointments
  alter column user_id set default auth.uid();

alter table public.treatments
  alter column user_id set default auth.uid();

create index if not exists patients_created_at_idx
  on public.patients (created_at desc);

create index if not exists appointments_patient_id_idx
  on public.appointments (patient_id);

create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at desc);

create index if not exists treatments_appointment_id_idx
  on public.treatments (appointment_id);

grant select, insert, update, delete on table public.patients to service_role;
grant select, insert, update, delete on table public.appointments to service_role;
grant select, insert, update, delete on table public.treatments to service_role;
