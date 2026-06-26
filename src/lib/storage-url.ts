import { supabase } from "@/integrations/supabase/client";

/** Resolve a stored media reference to a usable URL.
 *  - If the value is already an https URL (R2 public), return as-is.
 *  - Otherwise treat as a Supabase bucket-relative path and sign it (legacy).
 */
export async function resolveMediaUrl(stored: string | null | undefined, legacyBucket: "artwork" | "audio" | "statements", expiresIn = 3600): Promise<string | null> {
  if (!stored) return null;
  if (/^https?:\/\//i.test(stored)) return stored;
  const { data } = await supabase.storage.from(legacyBucket).createSignedUrl(stored, expiresIn);
  return data?.signedUrl ?? null;
}

export function isUrl(s: string | null | undefined): s is string {
  return !!s && /^https?:\/\//i.test(s);
}

export async function uploadToR2(opts: {
  kind: "artwork" | "audio" | "statement";
  file: File;
  subdir?: string;
}): Promise<string> {
  const { createR2UploadUrl } = await import("@/lib/r2-upload.functions");
  const { uploadUrl, publicUrl } = await createR2UploadUrl({
    data: {
      kind: opts.kind,
      filename: opts.file.name,
      contentType: opts.file.type || "application/octet-stream",
      sizeBytes: opts.file.size,
      subdir: opts.subdir,
    },
  });
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": opts.file.type || "application/octet-stream" },
    body: opts.file,
  });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`);
  return publicUrl;
}
