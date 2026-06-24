
DROP POLICY IF EXISTS "statements staff write" ON storage.objects;
CREATE POLICY "statements staff write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'statements' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'statements' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "statements owner read" ON storage.objects;
CREATE POLICY "statements owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'statements' AND (public.is_staff(auth.uid()) OR (split_part(name,'/',1) = auth.uid()::text)));
