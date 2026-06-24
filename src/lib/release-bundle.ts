import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { METADATA_HEADERS, buildReleaseMetadataRow } from "@/lib/metadata-export";

function extOf(path: string, fallback = "wav") {
  const m = /\.([a-zA-Z0-9]+)$/.exec(path || "");
  return m ? m[1].toLowerCase() : fallback;
}
function baseName(release: any) {
  return (release.upc || release.catalog_number || release.id || "release").toString();
}

async function downloadStoragePath(bucket: string, path: string): Promise<Blob | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).download(path);
  return data ?? null;
}

export async function buildReleaseZip(release: any): Promise<Blob> {
  const zip = new JSZip();
  const base = baseName(release);
  const folder = zip.folder(base)!;

  // Tracks
  const { data: tracks } = await supabase
    .from("release_tracks").select("*").eq("release_id", release.id).order("track_number");
  const ts = tracks ?? [];

  // Metadata xlsx
  const rows = ts.length
    ? ts.map((t, i) => {
        const r = buildReleaseMetadataRow(release, t, i + 1);
        // Override audio filename to renamed scheme
        r["Recording audio file name"] = `${base}_${String(i + 1).padStart(2, "0")}.${extOf(t.audio_path || "")}`;
        r["Release cover image file name"] = `${base}.${extOf(release.artwork_path || "", "jpg")}`;
        return r;
      })
    : [buildReleaseMetadataRow(release, null, 1)];
  const ws = XLSX.utils.json_to_sheet(rows, { header: METADATA_HEADERS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Metadata");
  const xlsxBuf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  folder.file(`${base}.xlsx`, xlsxBuf);

  // Artwork
  if (release.artwork_path) {
    const art = await downloadStoragePath("artwork", release.artwork_path);
    if (art) folder.file(`${base}.${extOf(release.artwork_path, "jpg")}`, art);
  }

  // Audio files
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i];
    if (!t.audio_path) continue;
    const blob = await downloadStoragePath("audio", t.audio_path);
    if (blob) folder.file(`${base}_${String(i + 1).padStart(2, "0")}.${extOf(t.audio_path)}`, blob);
  }

  return await zip.generateAsync({ type: "blob" });
}

export async function downloadReleaseBundle(release: any) {
  const blob = await buildReleaseZip(release);
  triggerDownload(blob, `${baseName(release)}.zip`);
}

export async function downloadBulkBundles(releases: any[]) {
  const outer = new JSZip();
  for (const r of releases) {
    const zip = await buildReleaseZip(r);
    outer.file(`${baseName(r)}.zip`, zip);
  }
  const blob = await outer.generateAsync({ type: "blob" });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `soundxpand-delivery-${stamp}.zip`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
