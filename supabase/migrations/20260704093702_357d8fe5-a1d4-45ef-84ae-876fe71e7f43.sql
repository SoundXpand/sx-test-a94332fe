
CREATE TABLE public.user_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_key TEXT NOT NULL,
  version TEXT NOT NULL,
  signature_type TEXT NOT NULL CHECK (signature_type IN ('draw','type')),
  signature_data TEXT NOT NULL,
  signed_name TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT true,
  licensor_hash TEXT NOT NULL,
  licensee_hash TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX user_agreements_user_key_ver_idx
  ON public.user_agreements(user_id, agreement_key, version);

GRANT SELECT, INSERT ON public.user_agreements TO authenticated;
GRANT ALL ON public.user_agreements TO service_role;

ALTER TABLE public.user_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own agreements"
  ON public.user_agreements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Users insert own agreements"
  ON public.user_agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
