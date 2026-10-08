create or replace view public.patients_per_month
with (security_invoker = true) as
select
  months.month_start,
  to_char(months.month_start, 'Mon YYYY') as label,
  count(patients.id)::int as new_patients
from generate_series(
  date_trunc('month', now()) - interval '5 months',
  date_trunc('month', now()),
  interval '1 month'
) as months(month_start)
left join public.patients
  on patients.created_at >= months.month_start
 and patients.created_at < months.month_start + interval '1 month'
group by months.month_start
order by months.month_start;

create or replace view public.appointment_status_this_month
with (security_invoker = true) as
select appointments.status, count(*)::int as total
from public.appointments
join public.patients on patients.id = appointments.patient_id
where appointments.starts_at >= date_trunc('month', now())
  and appointments.starts_at < date_trunc('month', now()) + interval '1 month'
group by appointments.status;

grant select on public.patients_per_month to service_role;
grant select on public.appointment_status_this_month to service_role;

notify pgrst, 'reload schema';
