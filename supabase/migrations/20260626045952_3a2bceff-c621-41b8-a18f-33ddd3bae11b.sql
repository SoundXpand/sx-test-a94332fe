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