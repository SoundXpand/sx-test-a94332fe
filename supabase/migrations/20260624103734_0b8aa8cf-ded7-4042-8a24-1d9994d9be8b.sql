ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sub_labels text[] DEFAULT '{}';
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS sub_label text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS p_year int;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS p_name text;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS c_year int;
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS c_name text;
ALTER TABLE public.release_tracks ADD COLUMN IF NOT EXISTS primary_genre text;
CREATE UNIQUE INDEX IF NOT EXISTS releases_catalog_number_key
  ON public.releases (catalog_number) WHERE catalog_number IS NOT NULL;