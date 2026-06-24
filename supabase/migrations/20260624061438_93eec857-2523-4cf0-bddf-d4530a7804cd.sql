
CREATE POLICY "users upload own artwork" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artwork' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users read own artwork" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'artwork' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users update own artwork" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'artwork' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users delete own artwork" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'artwork' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users upload own audio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users read own audio" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users delete own audio" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "admins read all artwork" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('artwork','audio') AND public.has_role(auth.uid(), 'administrator'));
