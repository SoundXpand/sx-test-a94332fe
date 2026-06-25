import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AppRole = "artist" | "manager" | "viewer" | "administrator" | "sx_manager";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "administrator" });
  if (!data) throw new Error("Forbidden: administrators only");
}
async function assertStaff(supabase: any, userId: string) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Forbidden: staff only");
}

export const setUserRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string; role: AppRole }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.targetUserId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.targetUserId, role: data.role });
    if (error) throw error;
    return { ok: true };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { targetUserId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.targetUserId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.targetUserId);
    if (error) throw error;
    return { ok: true };
  });

export const createUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; password: string; role: AppRole; fullName?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true,
      user_metadata: { full_name: data.fullName ?? "" },
    });
    if (error) throw error;
    if (data.role !== "artist") {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", created.user.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: data.role });
    }
    return { ok: true, userId: created.user.id };
  });

export const markDeliveredFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { releaseId: string; dspStatus: Record<string, { status: string; note?: string }>; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const now = new Date().toISOString();
    const { error: relErr } = await context.supabase
      .from("releases")
      .update({ status: "live", delivered_at: now, delivery_note: data.notes ?? null })
      .eq("id", data.releaseId);
    if (relErr) throw relErr;
    const { error: delErr } = await context.supabase
      .from("release_deliveries")
      .insert({
        release_id: data.releaseId,
        delivered_at: now,
        authorized_by: context.userId,
        dsp_status: data.dspStatus,
        notes: data.notes ?? null,
      });
    if (delErr) throw delErr;
    return { ok: true };
  });

export const archiveReleaseFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { releaseId: string; restore?: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("releases")
      .update({ archived_at: data.restore ? null : new Date().toISOString() })
      .eq("id", data.releaseId);
    if (error) throw error;
    return { ok: true };
  });

export const updateReleaseAdminFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    releaseId: string;
    patch: Partial<{
      status: string; upc: string | null; catalog_number: string | null;
      admin_remarks: string | null; rejection_reason: string | null;
      release_date: string | null;
    }>;
    trackPatches?: Array<{ id: string; isrc?: string | null; title?: string }>;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    if (Object.keys(data.patch).length) {
      const { error } = await context.supabase.from("releases").update(data.patch).eq("id", data.releaseId);
      if (error) throw error;
    }
    if (data.trackPatches?.length) {
      for (const tp of data.trackPatches) {
        const { id, ...rest } = tp;
        await context.supabase.from("release_tracks").update(rest).eq("id", id);
      }
    }
    return { ok: true };
  });

export const purgeArchivedFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    // Collect storage paths first so we can delete files
    const { data: due } = await context.supabase
      .from("releases").select("id, artwork_path")
      .not("archived_at", "is", null)
      .lt("archived_at", new Date(Date.now() - 7 * 86400 * 1000).toISOString());
    const ids = (due ?? []).map((r: any) => r.id);
    if (ids.length === 0) return { purged: 0 };
    const { data: tracks } = await context.supabase
      .from("release_tracks").select("id, audio_path").in("release_id", ids);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const audioPaths = (tracks ?? []).map((t: any) => t.audio_path).filter(Boolean);
    const artPaths = (due ?? []).map((r: any) => r.artwork_path).filter(Boolean);
    if (audioPaths.length) await supabaseAdmin.storage.from("audio").remove(audioPaths);
    if (artPaths.length) await supabaseAdmin.storage.from("artwork").remove(artPaths);
    await context.supabase.from("release_tracks").delete().in("release_id", ids);
    await context.supabase.from("releases").delete().in("id", ids);
    return { purged: ids.length };
  });

export const updateDspDeliveryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    deliveryId?: string;
    releaseId: string;
    platform: string;
    status: string;
    external_url?: string | null;
    error?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const now = new Date().toISOString();
    const patch = {
      release_id: data.releaseId,
      platform: data.platform,
      status: data.status,
      external_url: data.external_url ?? null,
      error: data.error ?? null,
      last_event_at: now,
    };
    if (data.deliveryId) {
      const { error } = await context.supabase.from("dsp_deliveries").update(patch).eq("id", data.deliveryId);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("dsp_deliveries").upsert(patch, { onConflict: "release_id,platform" } as any);
      if (error) throw error;
    }
    return { ok: true };
  });


