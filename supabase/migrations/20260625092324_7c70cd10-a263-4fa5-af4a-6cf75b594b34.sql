
-- 1) Make public_profiles readable by anon by running as owner (bypasses RLS for this curated view only)
ALTER VIEW public.public_profiles SET (security_invoker = off);
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Remove the broad anon grant on profiles that the previous migration added (no longer needed)
REVOKE SELECT ON public.profiles FROM anon;
DROP POLICY IF EXISTS "Anon can view public profiles" ON public.profiles;

-- 2) Artists table (default row per artist profile)
CREATE TABLE IF NOT EXISTS public.artists_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  country text,
  bio text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.artists_directory TO authenticated;
GRANT SELECT ON public.artists_directory TO anon;
GRANT ALL ON public.artists_directory TO service_role;

ALTER TABLE public.artists_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artists"
  ON public.artists_directory FOR SELECT
  USING (true);

CREATE POLICY "Owner can manage their artist row"
  ON public.artists_directory FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage all artists"
  ON public.artists_directory FOR ALL
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_artists_directory_updated_at
  BEFORE UPDATE ON public.artists_directory
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) Auto-create artist row for profiles with role_type = 'Artist' (or null/empty defaults to artist)
CREATE OR REPLACE FUNCTION public.ensure_artist_directory_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.role_type, 'artist')) = 'artist' THEN
    INSERT INTO public.artists_directory (user_id, artist_name, country, bio, avatar_url)
    VALUES (
      NEW.user_id,
      COALESCE(NULLIF(NEW.artist_name, ''), NULLIF(NEW.display_name, ''), NULLIF(NEW.full_name, ''), NEW.username),
      NEW.country, NEW.bio, NEW.avatar_url
    )
    ON CONFLICT (user_id) DO UPDATE
      SET artist_name = EXCLUDED.artist_name,
          country    = EXCLUDED.country,
          bio        = EXCLUDED.bio,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_artist_sync ON public.profiles;
CREATE TRIGGER trg_profiles_artist_sync
  AFTER INSERT OR UPDATE OF role_type, artist_name, display_name, full_name, country, bio, avatar_url
  ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_artist_directory_row();

-- Backfill existing artist profiles
INSERT INTO public.artists_directory (user_id, artist_name, country, bio, avatar_url)
SELECT user_id,
       COALESCE(NULLIF(artist_name, ''), NULLIF(display_name, ''), NULLIF(full_name, ''), username),
       country, bio, avatar_url
FROM public.profiles
WHERE lower(COALESCE(role_type, 'artist')) = 'artist'
ON CONFLICT (user_id) DO NOTHING;
