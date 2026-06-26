import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const simulateDspWebhookFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    releaseId: string;
    platform: string;
    status: "queued" | "in_delivery" | "delivered" | "live" | "rejected" | "takedown";
    externalUrl?: string;
  }) => d)
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Forbidden: staff only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const platform = data.platform;
    const nowIso = new Date().toISOString();

    let { data: existing } = await supabaseAdmin
      .from("dsp_deliveries")
      .select("id, release_id")
      .eq("release_id", data.releaseId)
      .ilike("platform", platform)
      .maybeSingle();

    if (!existing) {
      const ins = await supabaseAdmin
        .from("dsp_deliveries")
        .insert({
          release_id: data.releaseId, platform, status: data.status,
          external_url: data.externalUrl ?? null, last_event_at: nowIso,
        })
        .select("id, release_id")
        .single();
      existing = ins.data ?? null;
    } else {
      await supabaseAdmin.from("dsp_deliveries").update({
        status: data.status, external_url: data.externalUrl ?? null, last_event_at: nowIso,
      }).eq("id", existing.id);
    }

    await supabaseAdmin.from("release_events").insert({
      release_id: data.releaseId,
      type: `dsp_${data.status}_${platform.toLowerCase().replace(/\s+/g, "_")}`,
      note: `${platform}: ${data.status.replace(/_/g, " ")}${data.externalUrl ? ` — ${data.externalUrl}` : ""}`,
      payload: { platform, status: data.status, external_url: data.externalUrl, simulated: true },
    });

    return { ok: true };
  });
