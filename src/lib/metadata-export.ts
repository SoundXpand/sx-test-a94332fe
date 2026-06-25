import * as XLSX from "xlsx";
import { DSPS_FULL } from "@/lib/dsp-list";

export const METADATA_HEADERS = [
  "Recording title","Recording title localized","Recording subtitle","Recording subtitle localized",
  "Recording alternative title","Recording alternative title localized","Recording ISRC",
  "Recording catalogue number ","Recording genre","Recording explicit lyrics","Recording duration",
  "Recording creation date","Recording country of creation","Recording main artist",
  "Recording main artist localized","Recording main artist share","Recording featured artist",
  "Recording featured artist localized","Recording featured artist share","Recording contributors",
  "Recording contributors localized","Recording contributors shares","Recording producer",
  "Recording producer localized","Recording producer share","Recording label","Recording label localized",
  "Recording label share","Recording conductor","Recording conductor localized","Recording conductor share",
  "Recording territories","Recording excluding territories","Recording contract period begins",
  "Recording contract period ends","Recording contract number","Recording audio file name",
  "Recording snippet start","Recording snippet end","Release title","Release title localized",
  "Release subtitle","Release subtitle localized","Release artist","Release artist localized",
  "Release type ","Release genre","Release EAN","Release GRID","Release catalogue number",
  "Release outlets","Release date","Release date territories","Release duration","Release track number",
  "Release p-line","Release c-line","Release p-date","Release c-date","Release cover image file name",
  "Composition title","Composition title localized","Composition subtitle ","Composition subtitle localized",
  "Composition alternative title","Composition alternative title localized","Composition ISWC",
  "Composition catalogue number","Composition genre","Composition creation date",
  "Composition lyrics languages","Composition lyrics file name","Composition territories",
  "Composition excluding territories","Composition contract period begins","Composition contract period ends",
  "Composition contract number",
  ...[1, 2, 3, 4].flatMap(n => [
    `Author #${n} name `,`Author #${n} name localized`,`Author #${n} role`,
    `Author #${n} IPI name number`,`Author #${n} society`,`Author #${n} share`,
    `Author #${n} publisher`,`Author #${n} publisher localized`,`Author #${n} publisher IPI name number `,
    `Author #${n} publisher society`,`Author #${n} publisher share`,
  ]),
];

function formatDuration(s?: number | string | null): string {
  if (s === null || s === undefined || s === "") return "";
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return "";
  const m = Math.floor(n / 60);
  const sec = Math.floor(n % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function isoDate(v: any): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toISOString().slice(0, 10);
  } catch { return String(v); }
}

function splitContribs(raw?: string | null): string[] {
  if (!raw) return [];
  return String(raw).split(/[;,/&]| feat\.? | ft\.? | and /i).map(s => s.trim()).filter(Boolean);
}

function equalShares(n: number): string {
  if (n <= 0) return "";
  const each = (100 / n).toFixed(2);
  return Array(n).fill(each).join(";");
}

function dspOutletList(): string {
  return DSPS_FULL.map(d => d.name).join(";");
}

function allTerritories(): string {
  return "Worldwide";
}

export function buildReleaseMetadataRow(
  release: any,
  track: any,
  trackNumber: number,
  opts: { ownerCountry?: string | null; ownerName?: string | null; totalDuration?: number } = {}
) {
  const row: Record<string, any> = {};
  for (const h of METADATA_HEADERS) row[h] = "";

  const country = opts.ownerCountry || release?.country || "";
  const created = isoDate(release?.created_at);

  // Recording
  row["Recording title"] = track?.title ?? "";
  row["Recording ISRC"] = track?.isrc ?? "";
  row["Recording catalogue number "] = release?.catalog_number ?? "";
  row["Recording genre"] = track?.primary_genre ?? release?.primary_genre ?? "";
  row["Recording explicit lyrics"] = track?.explicit ? "Yes" : "No";
  row["Recording duration"] = formatDuration(track?.duration_seconds);
  row["Recording creation date"] = created;
  row["Recording country of creation"] = country;
  row["Recording main artist"] = track?.artist_name ?? release?.artist_name ?? opts.ownerName ?? "";
  row["Recording main artist share"] = "100.00";
  row["Recording featured artist"] = track?.featured_artist ?? "";
  if (track?.featured_artist) row["Recording featured artist share"] = "100.00";

  const contribs = splitContribs(track?.contributors);
  row["Recording contributors"] = contribs.join(";");
  row["Recording contributors shares"] = equalShares(contribs.length);

  row["Recording producer"] = track?.producer ?? "";
  if (track?.producer) row["Recording producer share"] = "100.00";

  row["Recording label"] = release?.record_label ?? release?.label_name ?? "";
  row["Recording label share"] = release?.record_label ? "100.00" : "";

  row["Recording territories"] = allTerritories();
  row["Recording audio file name"] = track?.audio_path?.split("/").pop() ?? "";

  // Release
  row["Release title"] = release?.title ?? "";
  row["Release artist"] = release?.artist_name ?? opts.ownerName ?? "";
  row["Release type "] = release?.release_type ?? "";
  row["Release genre"] = release?.primary_genre ?? "";
  row["Release EAN"] = release?.upc ?? "";
  row["Release catalogue number"] = release?.catalog_number ?? "";
  row["Release outlets"] = dspOutletList();
  row["Release date"] = isoDate(release?.release_date);
  row["Release date territories"] = allTerritories();
  row["Release duration"] = formatDuration(opts.totalDuration);
  row["Release track number"] = trackNumber;

  // ℗ / © without the symbols — year + name only
  row["Release p-line"] = release?.p_name ? `${release?.p_year ?? ""} ${release.p_name}`.trim() : "";
  row["Release c-line"] = release?.c_name ? `${release?.c_year ?? ""} ${release.c_name}`.trim() : "";
  row["Release p-date"] = release?.p_year ?? "";
  row["Release c-date"] = release?.c_year ?? "";
  row["Release cover image file name"] = release?.artwork_path?.split("/").pop() ?? "";

  // Composition basics from track
  row["Composition title"] = track?.title ?? "";
  row["Composition genre"] = track?.primary_genre ?? release?.primary_genre ?? "";
  row["Composition creation date"] = created;
  row["Composition lyrics languages"] = track?.language ?? release?.language ?? "";
  row["Composition territories"] = allTerritories();

  // Authors from composer/lyricist split, equal shares up to 4
  const authors = [
    ...splitContribs(track?.composer).map(n => ({ name: n, role: "Composer" })),
    ...splitContribs(track?.lyricist).map(n => ({ name: n, role: "Lyricist" })),
  ].slice(0, 4);
  const authorShare = authors.length ? (100 / authors.length).toFixed(2) : "";
  authors.forEach((a, i) => {
    const n = i + 1;
    row[`Author #${n} name `] = a.name;
    row[`Author #${n} role`] = a.role;
    row[`Author #${n} share`] = authorShare;
  });

  return row;
}

export function downloadReleaseMetadataXlsx(
  release: any,
  tracks: any[],
  opts: { ownerCountry?: string | null; ownerName?: string | null } = {}
) {
  const total = tracks.reduce((s, t) => s + Number(t?.duration_seconds || 0), 0);
  const rows = tracks.length > 0
    ? tracks.map((t, i) => buildReleaseMetadataRow(release, t, i + 1, { ...opts, totalDuration: total }))
    : [buildReleaseMetadataRow(release, null, 1, { ...opts, totalDuration: total })];
  const ws = XLSX.utils.json_to_sheet(rows, { header: METADATA_HEADERS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Metadata");
  const fname = `${release?.upc || release?.catalog_number || release?.id || "release"}-metadata.xlsx`;
  XLSX.writeFile(wb, fname);
}

export const ACCOUNTING_HEADERS = [
  "username","sale_type","censor_catalogue_number","recording_title","artists","isrc",
  "licensee_catalogue_number","source","period_begins","period_ends","country","right_type_group",
  "use_type","outlet","collection_share","quantity","licensor_revenue","source_currency",
  "licensor_currency","conversion_rate","release_title","release_ean","commercial_model","product",
];

export function downloadAccountingTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([ACCOUNTING_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Accounting");
  XLSX.writeFile(wb, "soundxpand-accounting-template.xlsx");
}

function normalizeDate(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export async function parseAccountingFile(file: File): Promise<Record<string, any>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false }) as Record<string, any>[];
  const dateCols = ["period_begins", "period_ends", "date"];
  return rows.map(r => {
    const out: Record<string, any> = { ...r };
    for (const c of dateCols) if (c in out) out[c] = normalizeDate(out[c]);
    return out;
  });
}
