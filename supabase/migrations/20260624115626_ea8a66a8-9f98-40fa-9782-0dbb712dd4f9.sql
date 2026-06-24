
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('administrator'::app_role,'sx_manager'::app_role)
  )
$$;

CREATE TABLE IF NOT EXISTS public.analytics_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  filename text NOT NULL,
  period_label text,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_uploads TO authenticated;
GRANT ALL ON public.analytics_uploads TO service_role;
ALTER TABLE public.analytics_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage uploads" ON public.analytics_uploads FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "auth read uploads" ON public.analytics_uploads FOR SELECT TO authenticated USING (true);

ALTER TABLE public.analytics_rows
  ADD COLUMN IF NOT EXISTS upload_id uuid REFERENCES public.analytics_uploads(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS sale_type text,
  ADD COLUMN IF NOT EXISTS censor_catalogue_number text,
  ADD COLUMN IF NOT EXISTS recording_title text,
  ADD COLUMN IF NOT EXISTS artists text,
  ADD COLUMN IF NOT EXISTS isrc text,
  ADD COLUMN IF NOT EXISTS licensee_catalogue_number text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS period_begins date,
  ADD COLUMN IF NOT EXISTS period_ends date,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS right_type_group text,
  ADD COLUMN IF NOT EXISTS use_type text,
  ADD COLUMN IF NOT EXISTS outlet text,
  ADD COLUMN IF NOT EXISTS collection_share numeric,
  ADD COLUMN IF NOT EXISTS quantity numeric,
  ADD COLUMN IF NOT EXISTS licensor_revenue numeric,
  ADD COLUMN IF NOT EXISTS source_currency text,
  ADD COLUMN IF NOT EXISTS licensor_currency text,
  ADD COLUMN IF NOT EXISTS conversion_rate numeric,
  ADD COLUMN IF NOT EXISTS release_title text,
  ADD COLUMN IF NOT EXISTS release_ean text,
  ADD COLUMN IF NOT EXISTS commercial_model text,
  ADD COLUMN IF NOT EXISTS product text,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "staff read all analytics" ON public.analytics_rows;
CREATE POLICY "staff read all analytics" ON public.analytics_rows FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR owner_id = auth.uid());
DROP POLICY IF EXISTS "staff insert analytics" ON public.analytics_rows;
CREATE POLICY "staff insert analytics" ON public.analytics_rows FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.release_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  authorized_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  dsp_status jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  excel_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_deliveries TO authenticated;
GRANT ALL ON public.release_deliveries TO service_role;
ALTER TABLE public.release_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage deliveries" ON public.release_deliveries FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "owner read own deliveries" ON public.release_deliveries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.releases r WHERE r.id = release_id AND r.owner_id = auth.uid()));

ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_note text;

DROP POLICY IF EXISTS "staff update releases" ON public.releases;
CREATE POLICY "staff update releases" ON public.releases FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR owner_id = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) OR owner_id = auth.uid());
DROP POLICY IF EXISTS "admin delete releases" ON public.releases;
CREATE POLICY "admin delete releases" ON public.releases FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator') OR owner_id = auth.uid());
DROP POLICY IF EXISTS "staff read all releases" ON public.releases;
CREATE POLICY "staff read all releases" ON public.releases FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR owner_id = auth.uid());

DROP POLICY IF EXISTS "staff manage tickets" ON public.support_tickets;
CREATE POLICY "staff manage tickets" ON public.support_tickets FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) OR user_id = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "staff manage ticket messages" ON public.support_messages;
CREATE POLICY "staff manage ticket messages" ON public.support_messages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin manage roles" ON public.user_roles;
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrator')) WITH CHECK (public.has_role(auth.uid(), 'administrator'));

DROP POLICY IF EXISTS "staff read profiles" ON public.profiles;
CREATE POLICY "staff read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "staff update profiles" ON public.profiles;
CREATE POLICY "staff update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR user_id = auth.uid())
  WITH CHECK (public.is_staff(auth.uid()) OR user_id = auth.uid());
DROP POLICY IF EXISTS "admin delete profiles" ON public.profiles;
CREATE POLICY "admin delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrator'));
