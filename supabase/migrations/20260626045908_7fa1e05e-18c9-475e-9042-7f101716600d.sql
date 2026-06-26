
-- 1) Profile status guard: only staff can change profile status
CREATE OR REPLACE FUNCTION public.guard_profile_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Only staff can change profile status';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_guard_status ON public.profiles;
CREATE TRIGGER profiles_guard_status BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_status_change();

-- 2) Release status guard: non-staff owners may only set status within a safe set
CREATE OR REPLACE FUNCTION public.guard_release_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE allowed text[] := ARRAY['draft','pending','takedown_requested'];
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.is_staff(auth.uid()) THEN
    IF NOT (NEW.status = ANY(allowed)) THEN
      RAISE EXCEPTION 'Owners cannot set status to %', NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS releases_guard_status ON public.releases;
CREATE TRIGGER releases_guard_status BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.guard_release_status_change();

-- 3) Fix SECURITY DEFINER view: recreate public_releases with security_invoker
DROP VIEW IF EXISTS public.public_releases;
CREATE VIEW public.public_releases
WITH (security_invoker = on) AS
SELECT id, slug, title, version, release_type, primary_genre, release_date,
       artwork_path, owner_id, status, delivered_at
  FROM public.releases
 WHERE status IN ('live','delivered') AND slug IS NOT NULL;
GRANT SELECT ON public.public_releases TO anon, authenticated;

-- 4) Waitlist: restrict insert to authenticated users only
DROP POLICY IF EXISTS "join waitlist with email" ON public.notify_waitlist;
REVOKE INSERT ON public.notify_waitlist FROM anon;
CREATE POLICY "join waitlist with email" ON public.notify_waitlist
  FOR INSERT TO authenticated
  WITH CHECK (length(email) > 3 AND email LIKE '%_@_%');

-- 5) Restrict admin_remarks to service role only (server functions)
REVOKE SELECT (admin_remarks), UPDATE (admin_remarks), INSERT (admin_remarks)
  ON public.releases FROM authenticated;
REVOKE SELECT (admin_remarks), UPDATE (admin_remarks), INSERT (admin_remarks)
  ON public.releases FROM anon;
