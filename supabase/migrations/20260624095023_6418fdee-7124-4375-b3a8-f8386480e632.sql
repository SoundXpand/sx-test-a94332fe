
-- Artists table
CREATE TABLE public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  spotify_url text,
  apple_music_url text,
  youtube_music_url text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX artists_owner_idx ON public.artists(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners manage own artists" ON public.artists
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "admins read all artists" ON public.artists
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'::app_role));

CREATE TRIGGER artists_updated_at BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Extend profiles with onboarding columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_type text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS main_genre text,
  ADD COLUMN IF NOT EXISTS current_distributor text,
  ADD COLUMN IF NOT EXISTS tracks_released_bucket text,
  ADD COLUMN IF NOT EXISTS private_link text,
  ADD COLUMN IF NOT EXISTS spotify_monthly_listeners_bucket text,
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_facebook text,
  ADD COLUMN IF NOT EXISTS social_tiktok text,
  ADD COLUMN IF NOT EXISTS social_vk text,
  ADD COLUMN IF NOT EXISTS social_youtube text,
  ADD COLUMN IF NOT EXISTS label_name text,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz;

-- Extend releases with selected artists
ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS artist_ids uuid[] NOT NULL DEFAULT '{}';

-- Updated handle_new_user trigger to copy onboarding details
CREATE OR REPLACE FUNCTION public.handle_new_user_soundxpand()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_username text;
  v_meta jsonb;
BEGIN
  v_username := 'SX' || LPAD(nextval('public.sx_username_seq')::text, 3, '0');
  v_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  INSERT INTO public.profiles (
    user_id, email, username, full_name, artist_name, mobile, country,
    role_type, first_name, last_name, city, main_genre, current_distributor,
    tracks_released_bucket, private_link, spotify_monthly_listeners_bucket,
    social_instagram, social_facebook, social_tiktok, social_vk, social_youtube,
    label_name, privacy_accepted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    COALESCE(v_meta->>'full_name', ''),
    COALESCE(v_meta->>'artist_name', ''),
    NULLIF(v_meta->>'mobile', ''),
    v_meta->>'country',
    v_meta->>'role_type',
    v_meta->>'first_name',
    v_meta->>'last_name',
    v_meta->>'city',
    v_meta->>'main_genre',
    v_meta->>'current_distributor',
    v_meta->>'tracks_released_bucket',
    v_meta->>'private_link',
    v_meta->>'spotify_monthly_listeners_bucket',
    v_meta->>'social_instagram',
    v_meta->>'social_facebook',
    v_meta->>'social_tiktok',
    v_meta->>'social_vk',
    v_meta->>'social_youtube',
    v_meta->>'label_name',
    CASE WHEN (v_meta->>'privacy_accepted')::boolean THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'artist')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $function$;
