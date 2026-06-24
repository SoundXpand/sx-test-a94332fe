
-- Profile public + bio fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS social_spotify text,
  ADD COLUMN IF NOT EXISTS social_apple text,
  ADD COLUMN IF NOT EXISTS social_soundcloud text,
  ADD COLUMN IF NOT EXISTS social_website text;

-- Public read for is_public profiles (anon + authenticated)
DROP POLICY IF EXISTS "public profiles readable" ON public.profiles;
CREATE POLICY "public profiles readable" ON public.profiles FOR SELECT TO anon, authenticated USING (is_public = true);
GRANT SELECT ON public.profiles TO anon;

-- Username generator with overflow past SX999
CREATE OR REPLACE FUNCTION public.next_sx_username()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n bigint; s text;
BEGIN
  n := nextval('public.sx_username_seq');
  IF n <= 999 THEN s := 'SX' || LPAD(n::text, 3, '0');
  ELSE s := 'SX' || LPAD(n::text, 5, '0');
  END IF;
  RETURN s;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_soundxpand()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_username text; v_meta jsonb;
BEGIN
  v_username := public.next_sx_username();
  v_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  INSERT INTO public.profiles (
    user_id, email, username, full_name, artist_name, mobile, country,
    role_type, first_name, last_name, city, main_genre, current_distributor,
    tracks_released_bucket, private_link, spotify_monthly_listeners_bucket,
    social_instagram, social_facebook, social_tiktok, social_vk, social_youtube,
    label_name, privacy_accepted_at
  ) VALUES (
    NEW.id, NEW.email, v_username,
    COALESCE(v_meta->>'full_name',''), COALESCE(v_meta->>'artist_name',''),
    NULLIF(v_meta->>'mobile',''), v_meta->>'country', v_meta->>'role_type',
    v_meta->>'first_name', v_meta->>'last_name', v_meta->>'city',
    v_meta->>'main_genre', v_meta->>'current_distributor',
    v_meta->>'tracks_released_bucket', v_meta->>'private_link',
    v_meta->>'spotify_monthly_listeners_bucket',
    v_meta->>'social_instagram', v_meta->>'social_facebook',
    v_meta->>'social_tiktok', v_meta->>'social_vk', v_meta->>'social_youtube',
    v_meta->>'label_name',
    CASE WHEN (v_meta->>'privacy_accepted')::boolean THEN now() ELSE NULL END
  ) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'artist')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $function$;

-- User activity log
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  summary text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.user_activity_log TO authenticated;
GRANT ALL ON public.user_activity_log TO service_role;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own activity read" ON public.user_activity_log;
CREATE POLICY "own activity read" ON public.user_activity_log FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "own activity insert" ON public.user_activity_log;
CREATE POLICY "own activity insert" ON public.user_activity_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS user_activity_log_user_created_idx ON public.user_activity_log(user_id, created_at DESC);

-- Notifications (per-user OR broadcast when user_id null)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read own or broadcast" ON public.notifications;
CREATE POLICY "read own or broadcast" ON public.notifications FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid() OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "staff insert notifications" ON public.notifications;
CREATE POLICY "staff insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "mark own read" ON public.notifications;
CREATE POLICY "mark own read" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Royalty statement files
CREATE TABLE IF NOT EXISTS public.royalty_statement_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  username text NOT NULL,
  period_label text NOT NULL,
  summary text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  pdf_path text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.royalty_statement_files TO authenticated;
GRANT ALL ON public.royalty_statement_files TO service_role;
ALTER TABLE public.royalty_statement_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner reads royalty files" ON public.royalty_statement_files;
CREATE POLICY "owner reads royalty files" ON public.royalty_statement_files FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "staff manage royalty files" ON public.royalty_statement_files;
CREATE POLICY "staff manage royalty files" ON public.royalty_statement_files FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Allow analytics_rows insertions with NULL owner (already nullable? no -- not null). Make nullable so unmatched usernames still ingest.
ALTER TABLE public.analytics_rows ALTER COLUMN owner_id DROP NOT NULL;
