
ALTER VIEW public.public_releases SET (security_invoker = true);
REVOKE EXECUTE ON FUNCTION public.log_dsp_delivery_change() FROM anon, authenticated, public;
