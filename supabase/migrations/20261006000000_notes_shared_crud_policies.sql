ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read notes" ON public.notes;
CREATE POLICY "public can read notes"
  ON public.notes
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "public can insert notes" ON public.notes;
CREATE POLICY "public can insert notes"
  ON public.notes
  FOR INSERT
  TO anon
  WITH CHECK (char_length(btrim(title)) BETWEEN 1 AND 200);

DROP POLICY IF EXISTS "public can update notes" ON public.notes;
CREATE POLICY "public can update notes"
  ON public.notes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (char_length(btrim(title)) BETWEEN 1 AND 200);

DROP POLICY IF EXISTS "public can delete notes" ON public.notes;
CREATE POLICY "public can delete notes"
  ON public.notes
  FOR DELETE
  TO anon
  USING (true);
