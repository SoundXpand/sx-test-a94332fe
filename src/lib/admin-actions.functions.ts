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
      .update({ status: "delivered", delivered_at: now, delivery_note: data.notes ?? null })
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
