
-- SEO center tables

CREATE TABLE public.seo_index_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'both', -- 'google' | 'bing' | 'both'
  action TEXT NOT NULL DEFAULT 'URL_UPDATED', -- URL_UPDATED | URL_DELETED
  source TEXT, -- release | profile | page | manual | sitemap
  source_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | success | failed | skipped
  google_status TEXT,
  google_response JSONB,
  bing_status TEXT,
  bing_response JSONB,
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seo_queue_status ON public.seo_index_queue(status, created_at);
CREATE INDEX idx_seo_queue_url ON public.seo_index_queue(url);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_index_queue TO authenticated;
GRANT ALL ON public.seo_index_queue TO service_role;
ALTER TABLE public.seo_index_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read queue" ON public.seo_index_queue FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write queue" ON public.seo_index_queue FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_seo_queue_updated BEFORE UPDATE ON public.seo_index_queue
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Robots config (single row, key='default')
CREATE TABLE public.seo_robots_config (
  key TEXT PRIMARY KEY DEFAULT 'default',
  content TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_robots_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_robots_config TO authenticated;
GRANT ALL ON public.seo_robots_config TO service_role;
ALTER TABLE public.seo_robots_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read robots" ON public.seo_robots_config FOR SELECT USING (true);
CREATE POLICY "Staff write robots" ON public.seo_robots_config FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_seo_robots_updated BEFORE UPDATE ON public.seo_robots_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.seo_robots_config (key, content) VALUES ('default',
'User-agent: *
Allow: /
Disallow: /auth
Disallow: /pending
Disallow: /reset-password
Disallow: /dashboard
Disallow: /admin

Sitemap: https://sx-test.lovable.app/sitemap.xml
');

-- SEO settings (single row)
CREATE TABLE public.seo_settings (
  key TEXT PRIMARY KEY DEFAULT 'default',
  base_url TEXT NOT NULL DEFAULT 'https://sx-test.lovable.app',
  google_site_verification TEXT,
  bing_site_verification TEXT,
  google_indexing_enabled BOOLEAN NOT NULL DEFAULT false,
  bing_indexnow_enabled BOOLEAN NOT NULL DEFAULT false,
  bing_indexnow_key TEXT,
  auto_enqueue_on_publish BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_settings TO authenticated;
GRANT ALL ON public.seo_settings TO service_role;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read settings" ON public.seo_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff write settings" ON public.seo_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_seo_settings_updated BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.seo_settings (key) VALUES ('default');

-- Auto-enqueue trigger: when release goes live or a smartlink slug is set
CREATE OR REPLACE FUNCTION public.enqueue_release_index()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_base TEXT; v_auto BOOLEAN;
BEGIN
  SELECT base_url, auto_enqueue_on_publish INTO v_base, v_auto FROM public.seo_settings WHERE key='default';
  IF NOT COALESCE(v_auto, true) THEN RETURN NEW; END IF;
  IF NEW.status IN ('live','delivered') AND NEW.slug IS NOT NULL AND
     (TG_OP='INSERT' OR OLD.slug IS DISTINCT FROM NEW.slug OR OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.seo_index_queue(url, target, action, source, source_id)
    VALUES (v_base || '/l/' || NEW.slug, 'both', 'URL_UPDATED', 'release', NEW.id::text);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_enqueue_release AFTER INSERT OR UPDATE OF status, slug ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_release_index();
