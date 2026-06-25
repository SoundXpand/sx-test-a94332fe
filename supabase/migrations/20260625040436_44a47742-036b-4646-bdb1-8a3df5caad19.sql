
-- 1. Public smartlink view: include delivered releases
DROP VIEW IF EXISTS public.public_releases;
CREATE VIEW public.public_releases AS
SELECT id, slug, title, version, release_type, primary_genre, release_date,
       artwork_path, owner_id, status, delivered_at
FROM public.releases
WHERE status IN ('live','delivered') AND slug IS NOT NULL;
GRANT SELECT ON public.public_releases TO anon, authenticated;

-- 2. release_links public read for delivered too
DROP POLICY IF EXISTS "Public can read links for live releases" ON public.release_links;
CREATE POLICY "Public can read links for live or delivered releases"
ON public.release_links FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_links.release_id AND r.status IN ('live','delivered')));

-- 3. Slug trigger: also generate when status flips to delivered
CREATE OR REPLACE FUNCTION public.generate_release_slug()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE candidate text; i int := 0;
BEGIN
  IF NEW.status IN ('live','delivered') AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    LOOP
      candidate := lower(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.releases WHERE slug = candidate);
      i := i + 1;
      IF i > 10 THEN candidate := lower(substr(md5(NEW.id::text), 1, 8)); EXIT; END IF;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

-- Backfill slugs for delivered releases missing one
UPDATE public.releases SET slug = lower(substr(md5(id::text || clock_timestamp()::text), 1, 6))
WHERE status IN ('live','delivered') AND (slug IS NULL OR slug = '');

-- 4. Log dsp_deliveries changes into release_events
CREATE OR REPLACE FUNCTION public.log_dsp_delivery_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.release_events(release_id, type, actor_id, note, payload)
    VALUES (NEW.release_id, 'dsp_' || NEW.status, auth.uid(),
            NEW.platform || ' → ' || NEW.status || COALESCE(' (' || NEW.error || ')', ''),
            jsonb_build_object('platform', NEW.platform, 'status', NEW.status, 'url', NEW.external_url));
  ELSIF TG_OP = 'UPDATE' AND (NEW.status IS DISTINCT FROM OLD.status OR NEW.external_url IS DISTINCT FROM OLD.external_url OR NEW.error IS DISTINCT FROM OLD.error) THEN
    INSERT INTO public.release_events(release_id, type, actor_id, note, payload)
    VALUES (NEW.release_id, 'dsp_' || NEW.status, auth.uid(),
            NEW.platform || ' → ' || NEW.status || COALESCE(' (' || NEW.error || ')', ''),
            jsonb_build_object('platform', NEW.platform, 'from', OLD.status, 'to', NEW.status, 'url', NEW.external_url));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS dsp_delivery_audit ON public.dsp_deliveries;
CREATE TRIGGER dsp_delivery_audit
AFTER INSERT OR UPDATE ON public.dsp_deliveries
FOR EACH ROW EXECUTE FUNCTION public.log_dsp_delivery_change();

-- Allow staff to update dsp_deliveries (currently only SELECT policies exist)
DROP POLICY IF EXISTS "Staff manage deliveries" ON public.dsp_deliveries;
CREATE POLICY "Staff manage deliveries"
ON public.dsp_deliveries FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 5. CMS Page Builder
CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  seo_title text,
  seo_description text,
  og_image_url text,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_pages TO authenticated;
GRANT ALL ON public.cms_pages TO service_role;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published pages" ON public.cms_pages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Staff manage pages" ON public.cms_pages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER cms_pages_updated BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.cms_page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('hero','rich_text','image','cta','features','embed')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cms_page_blocks_page_pos ON public.cms_page_blocks(page_id, position);
GRANT SELECT ON public.cms_page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_page_blocks TO authenticated;
GRANT ALL ON public.cms_page_blocks TO service_role;
ALTER TABLE public.cms_page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads blocks of published pages" ON public.cms_page_blocks FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.cms_pages p WHERE p.id = cms_page_blocks.page_id AND p.status = 'published'));
CREATE POLICY "Staff manage blocks" ON public.cms_page_blocks FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER cms_blocks_updated BEFORE UPDATE ON public.cms_page_blocks FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
