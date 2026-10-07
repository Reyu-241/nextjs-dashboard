alter table public.patients
  add column if not exists file_path text;

insert into storage.buckets (id, name, public)
values ('patient-files', 'patient-files', false)
on conflict (id) do update
set public = false;
