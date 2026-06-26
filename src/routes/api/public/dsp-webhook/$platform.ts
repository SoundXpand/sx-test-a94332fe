import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  release_id: z.string().uuid().optional(),
  platform: z.string().min(1),
  status: z.enum(["queued", "in_delivery", "delivered", "live", "rejected", "takedown"]),
  external_id: z.string().optional(),
  external_url: z.string().url().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/api/public/dsp-webhook/$platform")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.DSP_WEBHOOK_SECRET || "";
        const provided = request.headers.get("x-webhook-secret") || "";
        if (!secret || provided !== secret) {
          return new Response("Invalid signature", { status: 401 });
        }
        const raw = await request.json().catch(() => null);
        const parsed = Body.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const { release_id, platform, status, external_id, external_url, error } = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let target: any = null;
        if (external_id) {
          const { data } = await supabaseAdmin.from("dsp_deliveries").select("id,release_id").eq("external_id", external_id).maybeSingle();
          target = data;
        }
        if (!target && release_id) {
          const { data } = await supabaseAdmin.from("dsp_deliveries").select("id,release_id").eq("release_id", release_id).ilike("platform", platform).maybeSingle();
          target = data;
        }
        if (!target && release_id) {
          const { data } = await supabaseAdmin.from("dsp_deliveries").insert({
            release_id, platform, status, external_id, external_url, error, last_event_at: new Date().toISOString(),
          }).select("id,release_id").single();
          target = data;
        }
        if (!target) return new Response("Delivery not found", { status: 404 });

        await supabaseAdmin.from("dsp_deliveries").update({
          status, external_id, external_url, error, last_event_at: new Date().toISOString(),
        }).eq("id", target.id);

        await supabaseAdmin.from("release_events").insert({
          release_id: target.release_id,
          type: `dsp_${status}_${platform.toLowerCase().replace(/\s+/g, "_")}`,
          note: `${platform}: ${status.replace(/_/g, " ")}${external_url ? ` — ${external_url}` : ""}`,
          payload: { platform, status, external_id, external_url, error },
        });

        return Response.json({ ok: true });
      },
    },
  },
});
