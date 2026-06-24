
-- Pin search_path on trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Revoke direct execute on security-definer trigger fns (triggers run as owner regardless)
REVOKE EXECUTE ON FUNCTION public.handle_new_user_soundxpand() FROM PUBLIC, anon, authenticated;

-- Tighten waitlist insert: must provide an email; admins only read
DROP POLICY IF EXISTS "anyone can join waitlist" ON public.notify_waitlist;
CREATE POLICY "join waitlist with email" ON public.notify_waitlist
  FOR INSERT TO authenticated, anon
  WITH CHECK (length(email) > 3 AND email LIKE '%_@_%');
