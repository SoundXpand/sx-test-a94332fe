
ALTER VIEW public.public_profiles SET (security_invoker = on);

GRANT SELECT (
  user_id, username, role_type, full_name, artist_name, display_name,
  avatar_url, country, bio, is_public,
  social_instagram, social_youtube, social_spotify, social_apple,
  social_soundcloud, social_tiktok, social_facebook, social_vk, social_website
) ON public.profiles TO anon;

DROP POLICY IF EXISTS "Anon can view public profiles" ON public.profiles;
CREATE POLICY "Anon can view public profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (is_public = true);
