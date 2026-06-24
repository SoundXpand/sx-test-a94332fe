
-- Release lifecycle extensions
ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS taken_down_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_url text;

ALTER TABLE public.release_drafts
  ADD COLUMN IF NOT EXISTS source_release_id uuid REFERENCES public.releases(id) ON DELETE SET NULL;

-- release_links: DSP URLs per release
CREATE TABLE IF NOT EXISTS public.release_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  external_id text,
  artwork_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(release_id, platform)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_links TO authenticated;
GRANT SELECT ON public.release_links TO anon;
GRANT ALL ON public.release_links TO service_role;
ALTER TABLE public.release_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their release links"
  ON public.release_links FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND (r.owner_id = auth.uid() OR public.has_role(auth.uid(),'administrator'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND (r.owner_id = auth.uid() OR public.has_role(auth.uid(),'administrator'))));

CREATE POLICY "Public can read links for live releases"
  ON public.release_links FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.status = 'live'));

-- dsp_lookup_cache
CREATE TABLE IF NOT EXISTS public.dsp_lookup_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL,
  platform text NOT NULL,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(query_hash, platform)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsp_lookup_cache TO authenticated;
GRANT ALL ON public.dsp_lookup_cache TO service_role;
ALTER TABLE public.dsp_lookup_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cache" ON public.dsp_lookup_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write cache" ON public.dsp_lookup_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update cache" ON public.dsp_lookup_cache FOR UPDATE TO authenticated USING (true);

-- Anon-readable view of live releases for smartlink page
CREATE OR REPLACE VIEW public.public_releases
WITH (security_invoker = true)
AS
SELECT id, slug, title, version, release_type, primary_genre, release_date, artwork_path
FROM public.releases
WHERE status = 'live' AND slug IS NOT NULL;
GRANT SELECT ON public.public_releases TO anon, authenticated;

-- Anon SELECT policy on releases for the view (security_invoker)
DROP POLICY IF EXISTS "Anon can read live releases for smartlink" ON public.releases;
CREATE POLICY "Anon can read live releases for smartlink"
  ON public.releases FOR SELECT TO anon
  USING (status = 'live' AND slug IS NOT NULL);

-- Slug generator
CREATE OR REPLACE FUNCTION public.generate_release_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate text;
  i int := 0;
BEGIN
  IF NEW.status = 'live' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    LOOP
      candidate := lower(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.releases WHERE slug = candidate);
      i := i + 1;
      IF i > 10 THEN
        candidate := lower(substr(md5(NEW.id::text), 1, 8));
        EXIT;
      END IF;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS releases_generate_slug ON public.releases;
CREATE TRIGGER releases_generate_slug
  BEFORE INSERT OR UPDATE OF status ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.generate_release_slug();

-- Backfill slug for any existing live release
UPDATE public.releases SET slug = lower(substr(md5(id::text), 1, 8)) WHERE status = 'live' AND slug IS NULL;
