
ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_remarks text;

CREATE INDEX IF NOT EXISTS releases_archived_at_idx ON public.releases(archived_at);

-- Hide archived from non-staff owner view (owners still see in their own catalog if they want, but admin lists filter explicitly).
-- Provide a security-definer purge fn for hard-delete after 7d.
CREATE OR REPLACE FUNCTION public.purge_archived_releases()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  WITH purged AS (
    DELETE FROM public.releases
    WHERE archived_at IS NOT NULL
      AND archived_at < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO n FROM purged;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION public.purge_archived_releases() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_archived_releases() TO authenticated;
