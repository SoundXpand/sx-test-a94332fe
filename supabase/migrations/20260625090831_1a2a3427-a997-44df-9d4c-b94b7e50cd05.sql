
-- Add separate public_handle for user-customizable public URL slug.
-- Keep `username` as the immutable internal Account ID (SX000001+).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_handle text;

-- Backfill: copy current username so existing public URLs keep resolving.
UPDATE public.profiles SET public_handle = lower(username) WHERE public_handle IS NULL AND username IS NOT NULL;

-- Unique, case-insensitive index for handle lookups.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_public_handle_lower_idx
  ON public.profiles (lower(public_handle))
  WHERE public_handle IS NOT NULL;

-- Validate format on write (3-32 chars; a-z, 0-9, _ or -).
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_public_handle_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_public_handle_format
  CHECK (public_handle IS NULL OR public_handle ~ '^[a-z0-9_-]{3,32}$');

-- Bump the SX sequence: new sign-ups start at SX000001 going forward.
-- Existing users keep whatever they currently have.
SELECT setval('public.sx_username_seq', GREATEST(
  (SELECT COALESCE(MAX(NULLIF(regexp_replace(username, '^SX', ''), '')::bigint), 0) FROM public.profiles WHERE username ~ '^SX[0-9]+$'),
  0
));

-- Always emit 6-digit zero-padded SX IDs from now on.
CREATE OR REPLACE FUNCTION public.next_sx_username()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE n bigint;
BEGIN
  n := nextval('public.sx_username_seq');
  RETURN 'SX' || LPAD(n::text, 6, '0');
END $function$;

-- Refresh public view to expose handle alongside username.
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
  SELECT user_id, username, public_handle, role_type, full_name, artist_name, display_name,
         avatar_url, country, bio, is_public,
         social_instagram, social_youtube, social_spotify, social_apple,
         social_soundcloud, social_tiktok, social_facebook, social_vk, social_website
    FROM public.profiles
   WHERE is_public = true;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
