
-- Account status enum
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('pending_approval', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sequence for SX### usernames
CREATE SEQUENCE IF NOT EXISTS public.sx_username_seq START 1;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  artist_name text NOT NULL DEFAULT '',
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  mobile text UNIQUE,
  country text,
  status public.account_status NOT NULL DEFAULT 'pending_approval',
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrator'));
CREATE POLICY "admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrator'));

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile + assign artist role on new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_soundxpand()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username text;
BEGIN
  v_username := 'SX' || LPAD(nextval('public.sx_username_seq')::text, 3, '0');
  INSERT INTO public.profiles (user_id, email, username, full_name, artist_name, mobile, country)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'artist_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'mobile', ''),
    NEW.raw_user_meta_data->>'country'
  )
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'artist')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_sx ON auth.users;
CREATE TRIGGER on_auth_user_created_sx
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_soundxpand();

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users insert own logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users read own logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrator'));

-- Notify waitlist for coming-soon tools
CREATE TABLE IF NOT EXISTS public.notify_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool text NOT NULL,
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool, email)
);
GRANT INSERT ON public.notify_waitlist TO authenticated, anon;
GRANT ALL ON public.notify_waitlist TO service_role;
GRANT SELECT ON public.notify_waitlist TO authenticated;
ALTER TABLE public.notify_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can join waitlist" ON public.notify_waitlist
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "admins read waitlist" ON public.notify_waitlist
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'administrator'));

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own tickets" ON public.support_tickets
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage all tickets" ON public.support_tickets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ticket messages" ON public.support_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "users insert into own tickets" ON public.support_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );
CREATE POLICY "admins manage all messages" ON public.support_messages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));

-- Releases
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  version text,
  release_type text NOT NULL DEFAULT 'single',
  primary_genre text,
  secondary_genre text,
  language text,
  release_date date,
  original_release_date date,
  copyright_year int,
  record_label text,
  upc text,
  catalog_number text,
  parental_advisory boolean NOT NULL DEFAULT false,
  artwork_path text,
  store_selection jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.releases TO authenticated;
GRANT ALL ON public.releases TO service_role;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages releases" ON public.releases
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "admins manage all releases" ON public.releases
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));

DROP TRIGGER IF EXISTS releases_updated_at ON public.releases;
CREATE TRIGGER releases_updated_at BEFORE UPDATE ON public.releases
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Release tracks
CREATE TABLE IF NOT EXISTS public.release_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  track_number int NOT NULL,
  title text NOT NULL,
  version text,
  language text,
  explicit boolean NOT NULL DEFAULT false,
  isrc text,
  composer text,
  lyricist text,
  producer text,
  featured_artist text,
  contributors text,
  publishing_info text,
  copyright_owner text,
  audio_path text,
  duration_seconds numeric,
  file_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_tracks TO authenticated;
GRANT ALL ON public.release_tracks TO service_role;
ALTER TABLE public.release_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages tracks" ON public.release_tracks
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.owner_id = auth.uid())
  );
CREATE POLICY "admins manage all tracks" ON public.release_tracks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));

-- Analytics rows
CREATE TABLE IF NOT EXISTS public.analytics_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid REFERENCES public.releases(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.release_tracks(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  country text,
  date date NOT NULL,
  streams bigint NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.analytics_rows TO authenticated;
GRANT ALL ON public.analytics_rows TO service_role;
ALTER TABLE public.analytics_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads analytics" ON public.analytics_rows
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "admins manage all analytics" ON public.analytics_rows
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));

-- Royalty statements
CREATE TABLE IF NOT EXISTS public.royalty_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.royalty_statements TO authenticated;
GRANT ALL ON public.royalty_statements TO service_role;
ALTER TABLE public.royalty_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads statements" ON public.royalty_statements
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "admins manage all statements" ON public.royalty_statements
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'administrator'))
  WITH CHECK (public.has_role(auth.uid(), 'administrator'));
