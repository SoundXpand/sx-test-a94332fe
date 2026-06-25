
-- Stop exposing the profiles base table to anonymous visitors entirely
DROP POLICY IF EXISTS "anon read public profile safe cols" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;

-- public_profiles view already exists; ensure anon can read it
GRANT SELECT ON public.public_profiles TO anon;

-- Add missing UPDATE policy on audio bucket (mirrors owner-folder check)
DROP POLICY IF EXISTS "audio owner update" ON storage.objects;
CREATE POLICY "audio owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);
