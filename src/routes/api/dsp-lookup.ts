import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type Hit = { platform: string; title: string; artist: string; url: string; externalId: string; artwork?: string };

function corsHeaders(origin: string | null) {
  // Reflect same-origin only; fall back to no CORS header when origin is missing
  const allowed = origin ?? "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

async function requireAuth(request: Request): Promise<Response | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.slice(7);
  if (!token || token.split(".").length !== 3) return new Response("Unauthorized", { status: 401 });
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return new Response("Server misconfigured", { status: 500 });
  const supa = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data, error } = await supa.auth.getClaims(token);
  if (error || !data?.claims?.sub) return new Response("Unauthorized", { status: 401 });
  return null;
}

async function spotify(upc: string | undefined, query: string | undefined): Promise<Hit[]> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return [];
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${id}:${secret}`),
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) return [];
  const { access_token } = (await tokenRes.json()) as { access_token: string };
  const q = upc ? `upc:${upc}` : query!;
  const type = upc ? "album" : "track";
  const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=5`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!r.ok) return [];
  const json: any = await r.json();
  const items = json.albums?.items ?? json.tracks?.items ?? [];
  return items.map((it: any) => ({
    platform: "Spotify",
    title: it.name,
    artist: (it.artists ?? []).map((a: any) => a.name).join(", "),
    url: it.external_urls?.spotify ?? "",
    externalId: it.id,
    artwork: (it.images ?? it.album?.images ?? [])[0]?.url,
  }));
}

async function youtube(query: string): Promise<Hit[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  const r = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${key}`
  );
  if (!r.ok) return [];
  const json: any = await r.json();
  return (json.items ?? []).map((it: any) => ({
    platform: "YouTube",
    title: it.snippet.title,
    artist: it.snippet.channelTitle,
    url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    externalId: it.id.videoId,
    artwork: it.snippet.thumbnails?.high?.url,
  }));
}

async function deezer(upc: string | undefined, query: string | undefined): Promise<Hit[]> {
  try {
    if (upc) {
      const r = await fetch(`https://api.deezer.com/album/upc:${upc}`);
      if (!r.ok) return [];
      const a: any = await r.json();
      if (a.error || !a.id) return [];
      return [{
        platform: "Deezer",
        title: a.title,
        artist: a.artist?.name ?? "",
        url: a.link,
        externalId: String(a.id),
        artwork: a.cover_medium,
      }];
    }
    const r = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query!)}&limit=5`);
    if (!r.ok) return [];
    const json: any = await r.json();
    return (json.data ?? []).map((t: any) => ({
      platform: "Deezer",
      title: t.title,
      artist: t.artist?.name ?? "",
      url: t.link,
      externalId: String(t.id),
      artwork: t.album?.cover_medium,
    }));
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/api/dsp-lookup")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { upc?: string; artist?: string; title?: string };
          const upc = body.upc?.trim() || undefined;
          const query = [body.artist, body.title].filter(Boolean).join(" ").trim() || undefined;
          if (!upc && !query) {
            return new Response(JSON.stringify({ error: "Provide upc or artist+title" }), {
              status: 400, headers: { "Content-Type": "application/json", ...CORS },
            });
          }
          const [sp, yt, dz] = await Promise.all([
            spotify(upc, query).catch(() => []),
            youtube(query ?? `upc ${upc}`).catch(() => []),
            deezer(upc, query).catch(() => []),
          ]);
          const hits = [...sp, ...yt, ...dz];
          return new Response(JSON.stringify({ hits }), {
            status: 200, headers: { "Content-Type": "application/json", ...CORS },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 500, headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      },
    },
  },
});
