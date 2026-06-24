
-- Tighten cache RLS: per-user cache entries
ALTER TABLE public.dsp_lookup_cache ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
DROP POLICY IF EXISTS "Authenticated read cache" ON public.dsp_lookup_cache;
DROP POLICY IF EXISTS "Authenticated write cache" ON public.dsp_lookup_cache;
DROP POLICY IF EXISTS "Authenticated update cache" ON public.dsp_lookup_cache;
CREATE POLICY "Users read own cache" ON public.dsp_lookup_cache FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own cache" ON public.dsp_lookup_cache FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own cache" ON public.dsp_lookup_cache FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Lock down slug generator (only trigger context calls it)
REVOKE EXECUTE ON FUNCTION public.generate_release_slug() FROM PUBLIC, anon, authenticated;
