alter table public.appointments
  add column if not exists provider_type text,
  add column if not exists provider_name text,
  add column if not exists appointment_type text,
  add column if not exists payment_method text;

alter table public.appointments
  drop constraint if exists appointments_provider_type_check,
  add constraint appointments_provider_type_check
    check (provider_type is null or provider_type in ('general_practitioner', 'dentist', 'nurse')),
  drop constraint if exists appointments_provider_name_check,
  add constraint appointments_provider_name_check
    check (
      (provider_type is null and provider_name is null)
      or (
        provider_type is not null
        and provider_name is not null
        and (
          (provider_type = 'general_practitioner' and provider_name in ('General Practitioner 1', 'General Practitioner 2', 'General Practitioner 3'))
          or (provider_type = 'dentist' and provider_name in ('Dentist 1', 'Dentist 2', 'Dentist 3'))
          or (provider_type = 'nurse' and provider_name in ('Nurse 1', 'Nurse 2', 'Nurse 3'))
        )
      )
    ),
  drop constraint if exists appointments_appointment_type_check,
  add constraint appointments_appointment_type_check
    check (appointment_type is null or appointment_type in ('consultation', 'consultation_with_procedure')),
  drop constraint if exists appointments_payment_method_check,
  add constraint appointments_payment_method_check
    check (payment_method is null or payment_method in ('medical_aid', 'private', 'insurance'));

alter table public.appointments enable row level security;

grant select, insert, update, delete on table public.appointments to service_role;

notify pgrst, 'reload schema';