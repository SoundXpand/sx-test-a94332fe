
-- dsp_deliveries
CREATE TABLE public.dsp_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  external_id text,
  external_url text,
  last_event_at timestamptz NOT NULL DEFAULT now(),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (release_id, platform)
);
GRANT SELECT ON public.dsp_deliveries TO authenticated;
GRANT ALL ON public.dsp_deliveries TO service_role;
ALTER TABLE public.dsp_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read deliveries" ON public.dsp_deliveries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.owner_id = auth.uid()));
CREATE POLICY "Admins read all deliveries" ON public.dsp_deliveries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'administrator'));

CREATE TRIGGER dsp_deliveries_updated BEFORE UPDATE ON public.dsp_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- release_events
CREATE TABLE public.release_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_id uuid,
  note text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.release_events TO authenticated;
GRANT ALL ON public.release_events TO service_role;
ALTER TABLE public.release_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read events" ON public.release_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.owner_id = auth.uid()));
CREATE POLICY "Admins read all events" ON public.release_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'administrator'));

CREATE INDEX release_events_release_idx ON public.release_events(release_id, created_at DESC);
CREATE INDEX dsp_deliveries_release_idx ON public.dsp_deliveries(release_id);

-- status change trigger
CREATE OR REPLACE FUNCTION public.log_release_status_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
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
END $$;

CREATE TRIGGER releases_log_status
  AFTER INSERT OR UPDATE OF status ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.log_release_status_change();

-- Seed deliveries + timeline for demo release "Lost Trails"
DO $$
DECLARE
  r_id uuid;
BEGIN
  SELECT id INTO r_id FROM public.releases WHERE title = 'Lost Trails' LIMIT 1;
  IF r_id IS NOT NULL THEN
    INSERT INTO public.dsp_deliveries(release_id, platform, status, external_url, last_event_at) VALUES
      (r_id, 'Spotify', 'live', 'https://open.spotify.com/album/demo', now() - interval '12 days'),
      (r_id, 'Apple Music', 'live', 'https://music.apple.com/album/demo', now() - interval '11 days'),
      (r_id, 'YouTube Music', 'delivered', 'https://music.youtube.com/album/demo', now() - interval '9 days'),
      (r_id, 'Deezer', 'in_delivery', NULL, now() - interval '2 days')
    ON CONFLICT (release_id, platform) DO NOTHING;

    INSERT INTO public.release_events(release_id, type, note, created_at) VALUES
      (r_id, 'submitted', 'Submitted for review', now() - interval '20 days'),
      (r_id, 'status_approved', 'Approved by moderation', now() - interval '18 days'),
      (r_id, 'delivery_started', 'Sent to DSPs', now() - interval '17 days'),
      (r_id, 'delivered_spotify', 'Delivered to Spotify', now() - interval '13 days'),
      (r_id, 'live_spotify', 'Live on Spotify', now() - interval '12 days'),
      (r_id, 'live_apple', 'Live on Apple Music', now() - interval '11 days'),
      (r_id, 'delivered_youtube', 'Delivered to YouTube Music', now() - interval '9 days');
  END IF;
END $$;
