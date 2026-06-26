import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Kind = "artwork" | "audio" | "statement";

const ALLOWED: Record<Kind, { types: RegExp; maxBytes: number }> = {
  artwork:   { types: /^image\/(jpeg|png|webp|jpg)$/i, maxBytes: 15 * 1024 * 1024 },
  audio:     { types: /^audio\/(wav|wave|x-wav|flac|x-flac|mpeg|mp3|aac|x-aiff|aiff)$/i, maxBytes: 300 * 1024 * 1024 },
  statement: { types: /^application\/pdf$/i, maxBytes: 25 * 1024 * 1024 },
};

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);
}

export const createR2UploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: Kind; filename: string; contentType: string; sizeBytes?: number; subdir?: string }) => d)
  .handler(async ({ data, context }) => {
    const rule = ALLOWED[data.kind];
    if (!rule) throw new Error("Invalid kind");
    if (!rule.types.test(data.contentType)) throw new Error(`Content-Type ${data.contentType} not allowed for ${data.kind}`);
    if (data.sizeBytes && data.sizeBytes > rule.maxBytes) throw new Error(`File exceeds ${Math.round(rule.maxBytes / 1024 / 1024)}MB limit`);

    if (data.kind === "statement") {
      const { data: isStaff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
      if (!isStaff) throw new Error("Forbidden");
    }

    const { presignR2Put, r2PublicUrl } = await import("@/lib/r2.server");
    const rand = crypto.randomUUID();
    const safeName = sanitize(data.filename || "file");
    const sub = data.subdir ? `${data.subdir.replace(/^\/+|\/+$/g, "")}/` : "";
    const key = `${data.kind}/${context.userId}/${sub}${rand}-${safeName}`;
    const uploadUrl = await presignR2Put(key, data.contentType, 600);
    return { uploadUrl, publicUrl: r2PublicUrl(key), key };
  });

export const deleteR2ObjectFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { url: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isStaff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!isStaff) throw new Error("Forbidden");
    const { keyFromUrl, deleteR2Key } = await import("@/lib/r2.server");
    const key = keyFromUrl(data.url);
    if (!key) return { ok: false };
    await deleteR2Key(key);
    return { ok: true };
  });
