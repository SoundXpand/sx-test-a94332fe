
CREATE TABLE public.cookie_consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id text,
  choice text NOT NULL CHECK (choice IN ('all','selected','rejected')),
  essentials boolean NOT NULL DEFAULT true,
  preferences boolean NOT NULL DEFAULT false,
  analytics boolean NOT NULL DEFAULT false,
  marketing boolean NOT NULL DEFAULT false,
  page_path text,
  user_agent text,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.cookie_consent_logs TO anon, authenticated;
GRANT SELECT ON public.cookie_consent_logs TO authenticated;
GRANT ALL ON public.cookie_consent_logs TO service_role;

ALTER TABLE public.cookie_consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert consent" ON public.cookie_consent_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "staff can read consent logs" ON public.cookie_consent_logs
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
