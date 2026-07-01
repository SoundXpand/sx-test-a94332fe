// Server-only queue processor for SEO indexing (Google Indexing API + Bing IndexNow).
// Credentials read from env at call time; if missing, marks entries "skipped" with a note.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Row = {
  id: string; url: string; target: string; action: string; attempts: number;
};

async function submitGoogle(url: string, action: string): Promise<{ ok: boolean; status?: any; error?: string }> {
  const saJson = process.env.GOOGLE_INDEXING_SA_JSON;
  if (!saJson) return { ok: false, error: "GOOGLE_INDEXING_SA_JSON not configured" };
  try {
    const sa = JSON.parse(saJson);
    // Build a JWT for Google OAuth
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600, iat: now,
    };
    const b64 = (o: any) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const unsigned = `${b64(header)}.${b64(claim)}`;
    const { createSign, createPrivateKey } = await import("crypto");
    const key = createPrivateKey(sa.private_key);
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned); signer.end();
    const sig = signer.sign(key).toString("base64url");
    const jwt = `${unsigned}.${sig}`;
    const tokRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    if (!tokRes.ok) return { ok: false, error: `token: ${tokRes.status}` };
    const tok = await tokRes.json() as any;
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok.access_token}` },
      body: JSON.stringify({ url, type: action }),
    });
    const body = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, status: body } : { ok: false, error: `${res.status}: ${JSON.stringify(body).slice(0, 300)}` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "google error" };
  }
}

async function submitBing(url: string): Promise<{ ok: boolean; status?: any; error?: string }> {
  const key = process.env.BING_INDEXNOW_KEY;
  if (!key) return { ok: false, error: "BING_INDEXNOW_KEY not configured" };
  try {
    let host = "";
    try { host = new URL(url).host; } catch { return { ok: false, error: "invalid url" }; }
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: [url] }),
    });
    const text = await res.text().catch(() => "");
    return res.ok ? { ok: true, status: { code: res.status } } : { ok: false, error: `${res.status}: ${text.slice(0, 300)}` };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "bing error" };
  }
}

export async function runIndexQueue(limit = 50) {
  const { data: settings } = await supabaseAdmin.from("seo_settings").select("*").eq("key", "default").maybeSingle();
  const googleOn = settings?.google_indexing_enabled;
  const bingOn = settings?.bing_indexnow_enabled;

  const { data: rows } = await supabaseAdmin
    .from("seo_index_queue")
    .select("id, url, target, action, attempts")
    .in("status", ["pending", "failed"])
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(limit);

  const jobs = (rows ?? []) as Row[];
  let ok = 0, fail = 0, skipped = 0;

  for (const r of jobs) {
    await supabaseAdmin.from("seo_index_queue").update({ status: "processing", attempts: r.attempts + 1 }).eq("id", r.id);
    const patch: any = { submitted_at: new Date().toISOString() };
    let googleR: any = null, bingR: any = null;
    const doGoogle = googleOn && (r.target === "google" || r.target === "both");
    const doBing = bingOn && (r.target === "bing" || r.target === "both");

    if (doGoogle) googleR = await submitGoogle(r.url, r.action || "URL_UPDATED");
    if (doBing) bingR = await submitBing(r.url);

    if (googleR) { patch.google_status = googleR.ok ? "ok" : "error"; patch.google_response = googleR; }
    if (bingR) { patch.bing_status = bingR.ok ? "ok" : "error"; patch.bing_response = bingR; }

    if (!doGoogle && !doBing) {
      patch.status = "skipped";
      patch.last_error = "No indexing target enabled";
      skipped++;
    } else {
      const anyOk = (doGoogle && googleR?.ok) || (doBing && bingR?.ok);
      const anyFail = (doGoogle && !googleR?.ok) || (doBing && !bingR?.ok);
      patch.status = anyOk && !anyFail ? "success" : anyOk ? "success" : "failed";
      patch.last_error = [googleR?.error, bingR?.error].filter(Boolean).join(" | ") || null;
      if (patch.status === "success") ok++; else fail++;
    }
    await supabaseAdmin.from("seo_index_queue").update(patch).eq("id", r.id);
  }
  return { processed: jobs.length, ok, fail, skipped };
}
