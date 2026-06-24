import * as XLSX from "xlsx";

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

export function buildReleaseMetadataRow(release: any, track: any, trackNumber: number) {
  const row: Record<string, any> = {};
  for (const h of METADATA_HEADERS) row[h] = "";
  row["Recording title"] = track?.title ?? "";
  row["Recording ISRC"] = track?.isrc ?? "";
  row["Recording catalogue number "] = release?.catalog_number ?? "";
  row["Recording genre"] = track?.primary_genre ?? release?.primary_genre ?? "";
  row["Recording explicit lyrics"] = track?.is_explicit ? "Yes" : "No";
  row["Recording duration"] = track?.duration_seconds ?? "";
  row["Recording main artist"] = track?.artist_name ?? release?.artist_name ?? "";
  row["Recording label"] = release?.label_name ?? "";
  row["Recording audio file name"] = track?.audio_path?.split("/").pop() ?? "";
  row["Release title"] = release?.title ?? "";
  row["Release artist"] = release?.artist_name ?? "";
  row["Release type "] = release?.release_type ?? "";
  row["Release genre"] = release?.primary_genre ?? "";
  row["Release EAN"] = release?.upc ?? "";
  row["Release catalogue number"] = release?.catalog_number ?? "";
  row["Release date"] = release?.release_date ?? "";
  row["Release track number"] = trackNumber;
  row["Release p-line"] = release?.p_name ? `\u2117 ${release.p_year ?? ""} ${release.p_name}`.trim() : "";
  row["Release c-line"] = release?.c_name ? `© ${release.c_year ?? ""} ${release.c_name}`.trim() : "";
  row["Release p-date"] = release?.p_year ?? "";
  row["Release c-date"] = release?.c_year ?? "";
  row["Release cover image file name"] = release?.artwork_path?.split("/").pop() ?? "";
  return row;
}

export function downloadReleaseMetadataXlsx(release: any, tracks: any[]) {
  const rows = tracks.length > 0
    ? tracks.map((t, i) => buildReleaseMetadataRow(release, t, i + 1))
    : [buildReleaseMetadataRow(release, null, 1)];
  const ws = XLSX.utils.json_to_sheet(rows, { header: METADATA_HEADERS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Metadata");
  const fname = `${release?.catalog_number || release?.id || "release"}-metadata.xlsx`;
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
    // Excel serial date
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (!s) return null;
  // YYYY-MM-DD or YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  // DD-MM-YYYY or DD/MM/YYYY
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
  // Normalize date columns
  const dateCols = ["period_begins", "period_ends", "date"];
  return rows.map(r => {
    const out: Record<string, any> = { ...r };
    for (const c of dateCols) if (c in out) out[c] = normalizeDate(out[c]);
    return out;
  });
}

