import { createServerFn } from "@tanstack/react-start";

/** Public, unauthenticated read of a few safe platform flags for landing/auth UI. */
export const getPublicPlatformFlagsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("platform_settings")
      .select("value")
      .eq("key", "features")
      .maybeSingle();
    const v = (data?.value ?? {}) as Record<string, unknown>;
    return {
      auto_approve: Boolean(v.auto_approve),
      maintenance: Boolean(v.maintenance),
    };
  },
);
