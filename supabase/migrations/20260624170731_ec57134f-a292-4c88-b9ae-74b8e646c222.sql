
CREATE OR REPLACE FUNCTION public.log_release_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.release_events(release_id, type, actor_id, note)
      VALUES (NEW.id, 'created', NEW.owner_id, 'Release created');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.release_events(release_id, type, actor_id, note, payload)
      VALUES (NEW.id, 'status_' || NEW.status, auth.uid(),
              'Status changed from ' || OLD.status || ' to ' || NEW.status,
              jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $function$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='release_events' AND policyname='Owners insert events') THEN
    CREATE POLICY "Owners insert events" ON public.release_events
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_events.release_id AND r.owner_id = auth.uid())
        OR public.is_staff(auth.uid())
      );
  END IF;
END $$;

GRANT INSERT ON public.release_events TO authenticated;
