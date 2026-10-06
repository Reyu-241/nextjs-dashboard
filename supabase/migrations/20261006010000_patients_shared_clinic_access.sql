-- Patient access is authorized by the app's NextAuth session. Server-side
-- service-role requests therefore do not have a Supabase Auth user to own rows.
ALTER TABLE public.patients
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN user_id DROP DEFAULT;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.patients TO service_role;
