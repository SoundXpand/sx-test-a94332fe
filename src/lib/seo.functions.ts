import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertStaff(supabase: any, userId: string) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Forbidden: staff only");
}

export const getSeoOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [settings, robots, qPending, qSuccess, qFailed, qTotal, releases, profiles, recent] = await Promise.all([
      supabaseAdmin.from("seo_settings").select("*").eq("key", "default").maybeSingle(),
      supabaseAdmin.from("seo_robots_config").select("updated_at").eq("key", "default").maybeSingle(),
      supabaseAdmin.from("seo_index_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("seo_index_queue").select("id", { count: "exact", head: true }).eq("status", "success"),
      supabaseAdmin.from("seo_index_queue").select("id", { count: "exact", head: true }).eq("status", "failed"),
      supabaseAdmin.from("seo_index_queue").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("releases").select("id", { count: "exact", head: true }).in("status", ["live", "delivered"]).not("slug", "is", null),
      supabaseAdmin.from("profiles").select("user_id", { count: "exact", head: true }).eq("status", "approved"),
      supabaseAdmin.from("seo_index_queue").select("id, url, target, status, google_status, bing_status, updated_at, last_error").order("updated_at", { ascending: false }).limit(15),
    ]);
    return {
      settings: settings.data,
      robotsUpdatedAt: robots.data?.updated_at ?? null,
      queue: {
        pending: qPending.count ?? 0,
        success: qSuccess.count ?? 0,
        failed: qFailed.count ?? 0,
        total: qTotal.count ?? 0,
      },
      counts: { releases: releases.count ?? 0, profiles: profiles.count ?? 0 },
      recent: recent.data ?? [],
    };
  });

export const listIndexQueueFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string; limit?: number }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("seo_index_queue").select("*").order("created_at", { ascending: false }).limit(data.limit ?? 200);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const enqueueUrlsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { urls: string[]; target?: "google" | "bing" | "both"; action?: "URL_UPDATED" | "URL_DELETED"; source?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const urls = Array.from(new Set(data.urls.map(u => u.trim()).filter(Boolean)));
    if (urls.length === 0) return { inserted: 0 };
    const rows = urls.map(u => ({
      url: u, target: data.target ?? "both", action: data.action ?? "URL_UPDATED",
      source: data.source ?? "manual", status: "pending",
    }));
    const { error } = await supabaseAdmin.from("seo_index_queue").insert(rows);
    if (error) throw error;
    return { inserted: rows.length };
  });

export const rebuildIndexQueueFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { include: { releases?: boolean; profiles?: boolean; core?: boolean } }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: s } = await supabaseAdmin.from("seo_settings").select("base_url").eq("key", "default").maybeSingle();
    const base = s?.base_url || "https://sx-test.lovable.app";
    const urls: { url: string; source: string; source_id?: string }[] = [];
    if (data.include.core !== false) {
      ["/", "/free-music-distribution", "/legal/terms", "/legal/privacy"].forEach(p => urls.push({ url: base + p, source: "core" }));
    }
    if (data.include.releases) {
      const { data: rel } = await supabaseAdmin.from("releases").select("id, slug").in("status", ["live", "delivered"]).not("slug", "is", null);
      (rel ?? []).forEach((r: any) => urls.push({ url: `${base}/l/${r.slug}`, source: "release", source_id: r.id }));
    }
    if (data.include.profiles) {
      const { data: p } = await supabaseAdmin.from("profiles").select("user_id, username, role_type").eq("status", "approved").not("username", "is", null);
      (p ?? []).forEach((r: any) => {
        const rt = (r.role_type || "artist").toLowerCase();
        urls.push({ url: `${base}/${rt}/${r.username}`, source: "profile", source_id: r.user_id });
      });
    }
    if (urls.length === 0) return { inserted: 0 };
    const rows = urls.map(u => ({ url: u.url, target: "both", action: "URL_UPDATED", source: u.source, source_id: u.source_id, status: "pending" }));
    const { error } = await supabaseAdmin.from("seo_index_queue").insert(rows);
    if (error) throw error;
    return { inserted: rows.length };
  });

export const processIndexQueueFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { runIndexQueue } = await import("./seo-runner.server");
    return await runIndexQueue(data.limit ?? 50);
  });

export const clearIndexQueueFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("seo_index_queue").delete();
    q = data.status && data.status !== "all" ? q.eq("status", data.status) : q.gte("created_at", "1970-01-01");
    const { error } = await q;
    if (error) throw error;
    return { ok: true };
  });

export const getRobotsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("seo_robots_config").select("*").eq("key", "default").maybeSingle();
    return data;
  });

export const saveRobotsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content: string }) => z.object({ content: z.string().min(1).max(20000) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("seo_robots_config").upsert({ key: "default", content: data.content, updated_by: context.userId, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

export const saveSeoSettingsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {};
    ["base_url","google_site_verification","bing_site_verification","google_indexing_enabled","bing_indexnow_enabled","bing_indexnow_key","auto_enqueue_on_publish"].forEach(k => {
      if (data[k] !== undefined) patch[k] = data[k];
    });
    patch.updated_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("seo_settings").update(patch).eq("key", "default");
    if (error) throw error;
    return { ok: true };
  });
