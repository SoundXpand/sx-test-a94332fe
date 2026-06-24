
-- release_drafts table for wizard autosave
CREATE TABLE public.release_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled release',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_drafts TO authenticated;
GRANT ALL ON public.release_drafts TO service_role;
ALTER TABLE public.release_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages drafts" ON public.release_drafts FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER release_drafts_updated_at BEFORE UPDATE ON public.release_drafts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- platform_settings (admin-only key/value)
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage settings" ON public.platform_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrator')) WITH CHECK (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY "anyone reads brand settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);
