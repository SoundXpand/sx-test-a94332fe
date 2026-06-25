UPDATE public.releases SET status = 'live' WHERE status = 'delivered';

CREATE OR REPLACE FUNCTION public.notify_owner_on_release_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, kind, title, body)
    VALUES (
      NEW.owner_id,
      'release_approved',
      'Release approved — ready for delivery 🎉',
      'Your release "' || COALESCE(NEW.title, 'Untitled') ||
        '" has been approved by moderation and is queued for delivery to DSPs. Congratulations!'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_release_approved ON public.releases;
CREATE TRIGGER trg_notify_owner_on_release_approved
AFTER UPDATE OF status ON public.releases
FOR EACH ROW
EXECUTE FUNCTION public.notify_owner_on_release_approved();

REVOKE EXECUTE ON FUNCTION public.notify_owner_on_release_approved() FROM anon, authenticated, public;