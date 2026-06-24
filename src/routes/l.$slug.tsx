import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { Music } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  Spotify: "bg-[#1DB954] text-black hover:bg-[#1ed760]",
  "Apple Music": "bg-gradient-to-br from-[#FA243C] to-[#FB5C74] text-white hover:opacity-90",
  "YouTube Music": "bg-[#FF0000] text-white hover:bg-[#cc0000]",
  YouTube: "bg-[#FF0000] text-white hover:bg-[#cc0000]",
  Deezer: "bg-[#FF6B6B] text-white hover:bg-[#ff5252]",
  Tidal: "bg-black text-white hover:bg-neutral-900 border border-white/20",
  JioSaavn: "bg-[#2BC5B4] text-white hover:opacity-90",
  "Amazon Music": "bg-[#00A8E1] text-white hover:opacity-90",
};

const getSmartlink = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
    );
    const { data: rel } = await sb
      .from("public_releases")
      .select("id, slug, title, version, release_type, primary_genre, release_date, artwork_path")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!rel) return null;
    const { data: links } = await sb
      .from("release_links")
      .select("platform, url")
      .eq("release_id", rel.id);
    let artworkUrl: string | null = null;
    if (rel.artwork_path) {
      const { data: signed } = await sb.storage.from("artwork").createSignedUrl(rel.artwork_path, 60 * 60);
      artworkUrl = signed?.signedUrl ?? null;
    }
    // Look up artist via releases (need owner profile artist_name OR release.artist_name)
    const { data: full } = await sb.from("releases").select("id").eq("slug", data.slug).maybeSingle();
    let artist = "";
    if (full) {
      const { data: r2 } = await sb.from("releases").select("owner_id").eq("id", full.id).maybeSingle();
      if (r2?.owner_id) {
        const { data: prof } = await sb.from("profiles").select("artist_name, full_name").eq("user_id", r2.owner_id).maybeSingle();
        artist = prof?.artist_name || prof?.full_name || "";
      }
    }
    return { release: rel, links: links ?? [], artworkUrl, artist };
  });

export const Route = createFileRoute("/l/$slug")({
  loader: async ({ params }) => {
    const r = await getSmartlink({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }] };
    const { release, artworkUrl, artist } = loaderData;
    const title = `${release.title}${artist ? " — " + artist : ""}`;
    const desc = `Listen to ${release.title} on Spotify, Apple Music, YouTube and more.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(artworkUrl ? [{ property: "og:image", content: artworkUrl }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-8">
      <div>
        <h1 className="font-display text-2xl">Link not found</h1>
        <p className="text-muted-foreground mt-2">This smartlink may have been taken down.</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Back to SoundXpand</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center"><p>Something went wrong.</p></div>
  ),
  component: Smartlink,
});

function Smartlink() {
  const { release, links, artworkUrl, artist } = Route.useLoaderData() as NonNullable<Awaited<ReturnType<typeof getSmartlink>>>;
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {artworkUrl && (
        <div className="absolute inset-0 -z-10">
          <img src={artworkUrl} alt="" className="h-full w-full object-cover blur-3xl scale-125 opacity-30" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        </div>
      )}
      <div className="mx-auto max-w-md px-5 py-10 sm:py-16">
        <div className="aspect-square rounded-2xl overflow-hidden border border-border shadow-2xl">
          {artworkUrl ? (
            <img src={artworkUrl} alt={release.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center bg-muted"><Music className="h-12 w-12 text-muted-foreground" /></div>
          )}
        </div>
        <div className="mt-6 text-center">
          <h1 className="font-display text-2xl font-semibold">{release.title}</h1>
          {artist && <p className="text-muted-foreground mt-1">{artist}</p>}
          <p className="text-xs text-muted-foreground mt-2 capitalize">{release.release_type} · {release.primary_genre}</p>
        </div>
        <div className="mt-8 space-y-2.5">
          {links.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No streaming links available yet.</p>
          ) : links.map((l) => (
            <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-xl px-5 py-3.5 font-semibold transition ${PLATFORM_COLORS[l.platform] ?? "bg-card border border-border hover:bg-muted"}`}>
              <span>{l.platform}</span>
              <span className="text-sm opacity-80">Play →</span>
            </a>
          ))}
        </div>
        <div className="mt-10 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Powered by SoundXpand</Link>
        </div>
      </div>
    </div>
  );
}
