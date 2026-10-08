create extension if not exists pgcrypto;

alter table public.patients
  alter column user_id set default gen_random_uuid();

with ranked_patients as (
  select
    id,
    user_id,
    row_number() over (partition by user_id order by created_at, id) as user_id_rank
  from public.patients
)
update public.patients as patients
set user_id = gen_random_uuid()
from ranked_patients
where patients.id = ranked_patients.id
  and (ranked_patients.user_id is null or ranked_patients.user_id_rank > 1);

alter table public.patients
  alter column user_id set not null;

create unique index if not exists patients_user_id_unique_idx
  on public.patients (user_id);

notify pgrst, 'reload schema';
