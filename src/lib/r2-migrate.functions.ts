import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function migrateOne(
  bucket: "artwork" | "audio" | "statements",
  kind: "artwork" | "audio" | "statement",
  ownerId: string | null,
  path: string,
): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { putR2Bytes } = await import("@/lib/r2.server");
  const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
  if (error || !data) return null;
  const ext = (path.match(/\.([a-zA-Z0-9]+)$/)?.[1] || "bin").toLowerCase();
  const mime =
    kind === "artwork" ? (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg")
    : kind === "statement" ? "application/pdf"
    : ext === "mp3" ? "audio/mpeg" : ext === "flac" ? "audio/flac" : ext === "aac" ? "audio/aac" : "audio/wav";
  const base = path.split("/").pop() || `${crypto.randomUUID()}.${ext}`;
  const key = `${kind}/${ownerId || "legacy"}/${crypto.randomUUID()}-${base}`;
  return putR2Bytes(key, data, mime);
}

export const migrateMediaToR2Fn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isStaff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!isStaff) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const result = { artwork: 0, audio: 0, statements: 0, errors: [] as string[] };

    // Artwork on releases
    const { data: rels } = await supabaseAdmin
      .from("releases").select("id, owner_id, artwork_path")
      .not("artwork_path", "is", null)
      .limit(500);
    for (const r of (rels ?? []) as any[]) {
      if (!r.artwork_path || /^https?:\/\//i.test(r.artwork_path)) continue;
      try {
        const url = await migrateOne("artwork", "artwork", r.owner_id, r.artwork_path);
        if (url) {
          await supabaseAdmin.from("releases").update({ artwork_path: url }).eq("id", r.id);
          result.artwork++;
        }
      } catch (e: any) { result.errors.push(`artwork ${r.id}: ${e.message}`); }
    }

    // Audio on tracks
    const { data: trs } = await supabaseAdmin
      .from("release_tracks").select("id, release_id, audio_path")
      .not("audio_path", "is", null)
      .limit(2000);
    // join owner via releases
    const trackList = (trs ?? []) as any[];
    const relIds = Array.from(new Set(trackList.map(t => t.release_id)));
    const ownersByRelease = new Map<string, string>();
    if (relIds.length) {
      const { data: owners } = await supabaseAdmin.from("releases").select("id, owner_id").in("id", relIds);
      for (const o of (owners ?? []) as any[]) ownersByRelease.set(o.id, o.owner_id);
    }
    for (const t of trackList) {
      if (!t.audio_path || /^https?:\/\//i.test(t.audio_path)) continue;
      try {
        const url = await migrateOne("audio", "audio", ownersByRelease.get(t.release_id) || null, t.audio_path);
        if (url) {
          await supabaseAdmin.from("release_tracks").update({ audio_path: url }).eq("id", t.id);
          result.audio++;
        }
      } catch (e: any) { result.errors.push(`audio ${t.id}: ${e.message}`); }
    }

    // Royalty PDFs
    const { data: pdfs } = await supabaseAdmin
      .from("royalty_statement_files" as any).select("id, owner_id, pdf_path")
      .not("pdf_path", "is", null)
      .limit(500);
    for (const r of (pdfs ?? []) as any[]) {
      if (!r.pdf_path || /^https?:\/\//i.test(r.pdf_path)) continue;
      try {
        const url = await migrateOne("statements", "statement", r.owner_id, r.pdf_path);
        if (url) {
          await supabaseAdmin.from("royalty_statement_files" as any).update({ pdf_path: url }).eq("id", r.id);
          result.statements++;
        }
      } catch (e: any) { result.errors.push(`statement ${r.id}: ${e.message}`); }
    }

    return result;
  });
