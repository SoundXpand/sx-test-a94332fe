
-- 1) Restrict analytics_uploads SELECT to staff
DROP POLICY IF EXISTS "auth read uploads" ON public.analytics_uploads;
CREATE POLICY "staff read uploads" ON public.analytics_uploads
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- 2) Restrict platform_settings SELECT to safe keys for non-admins; admins read all
DROP POLICY IF EXISTS "anyone reads brand settings" ON public.platform_settings;
CREATE POLICY "admins read all settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrator'::app_role));
CREATE POLICY "auth read public brand keys" ON public.platform_settings
  FOR SELECT TO authenticated USING (key = ANY (ARRAY['brand','features']));

-- 3) Public profile exposure: drop anon-readable policy on profiles; expose only safe columns via view
DROP POLICY IF EXISTS "public profiles readable" ON public.profiles;

DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true, security_barrier = true) AS
SELECT
  user_id, username, role_type, full_name, artist_name, display_name,
  avatar_url, country, bio, is_public,
  social_instagram, social_youtube, social_spotify, social_apple,
  social_soundcloud, social_tiktok, social_facebook, social_vk, social_website
FROM public.profiles
WHERE is_public = true;

-- Re-add a narrow anon/auth SELECT policy backing the view (security_invoker uses caller permissions)
CREATE POLICY "anon read public profile safe cols" ON public.profiles
  FOR SELECT TO anon, authenticated USING (is_public = true);
-- Note: anon clients must query public_profiles view; base table still column-protected via app convention.
-- Revoke direct table column access for anon by restricting column-level SELECT to safe columns only.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  user_id, username, role_type, full_name, artist_name, display_name,
  avatar_url, country, bio, is_public,
  social_instagram, social_youtube, social_spotify, social_apple,
  social_soundcloud, social_tiktok, social_facebook, social_vk, social_website
) ON public.profiles TO anon;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4) Lock down SECURITY DEFINER functions: revoke EXECUTE from PUBLIC/anon/authenticated where not needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_soundxpand() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_release_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_release_slug() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_sx_username() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_archived_releases() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role and is_staff are called via PostgREST RPC by signed-in users; keep authenticated only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
