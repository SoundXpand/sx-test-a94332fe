import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { Music, Sparkles, ArrowRight, Share2, ExternalLink } from "lucide-react";
import { ArtworkImage } from "@/components/catalog/artwork-image";

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
      .select("id, slug, title, version, release_type, primary_genre, release_date, artwork_path, owner_id, status, delivered_at")
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
    let artist = "";
    let artistUsername = "";
    if ((rel as any).owner_id) {
      const { data: prof } = await sb.from("public_profiles").select("artist_name, full_name, username").eq("user_id", (rel as any).owner_id).maybeSingle();
      artist = (prof as any)?.artist_name || (prof as any)?.full_name || "";
      artistUsername = (prof as any)?.username || "";
    }
    return { release: rel, links: links ?? [], artworkUrl, artist, artistUsername };
  });

export const Route = createFileRoute("/l/$slug")({
  loader: async ({ params }) => {
    const r = await getSmartlink({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }] };
    const { release, artworkUrl, artist } = loaderData;
    const title = `${release.title}${artist ? " — " + artist : ""}`;
    const desc = `Listen to ${release.title}${artist ? " by " + artist : ""} on Spotify, Apple Music, YouTube and 150+ streaming platforms.`;
    const url = `https://asset-friend-hub.lovable.app/l/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "music.song" },
        { property: "og:url", content: url },
        ...(artworkUrl ? [
          { property: "og:image", content: artworkUrl },
          { property: "og:image:width", content: "1400" },
          { property: "og:image:height", content: "1400" },
        ] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(artworkUrl ? [{ name: "twitter:image", content: artworkUrl }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          name: release.title,
          ...(artist ? { byArtist: { "@type": "MusicGroup", name: artist } } : {}),
          ...(release.release_date ? { datePublished: release.release_date } : {}),
          genre: release.primary_genre,
          ...(artworkUrl ? { image: artworkUrl } : {}),
          url,
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-8 bg-background">
      <div>
        <h1 className="font-display text-2xl">Link not found</h1>
        <p className="text-muted-foreground mt-2">This smartlink may have been taken down.</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Back to SoundXpand</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background"><p>Something went wrong.</p></div>
  ),
  component: Smartlink,
});

function Smartlink() {
  const { release, links, artworkUrl, artist, artistUsername } = Route.useLoaderData() as NonNullable<Awaited<ReturnType<typeof getSmartlink>>>;
  const isLive = (release as any).status === "live" || (release as any).status === "delivered";

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* Vibrant artwork blur backdrop */}
      <div className="absolute inset-0 -z-10">
        {artworkUrl ? (
          <>
            <img src={artworkUrl} alt="" className="h-full w-full object-cover blur-3xl scale-150 opacity-40" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-[140px]" />
            <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/25 blur-[140px]" />
          </>
        )}
      </div>

      {/* Top brand bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold">SoundXpand</span>
        </Link>
        <Link to="/auth" className="text-xs rounded-full bg-background/60 backdrop-blur border border-border/60 px-3 py-1.5 hover:bg-background">
          Distribute free
        </Link>
      </header>

      <div className="mx-auto max-w-md px-5 pt-20 pb-12 sm:pt-24 sm:pb-16">
        <div className="aspect-square rounded-3xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/10">
          {artworkUrl ? (
            <ArtworkImage src={artworkUrl} alt={release.title} className="h-full w-full" />
          ) : (
            <div className="h-full w-full grid place-items-center bg-muted"><Music className="h-12 w-12 text-muted-foreground" /></div>
          )}
        </div>

        <div className="mt-6 text-center">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Out now
            </span>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight">{release.title}</h1>
          {artist && (
            artistUsername ? (
              <Link to="/$roleType/$username" params={{ roleType: "artist", username: artistUsername }} className="text-muted-foreground mt-1 inline-block hover:text-foreground">
                {artist}
              </Link>
            ) : <p className="text-muted-foreground mt-1">{artist}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 capitalize">
            {release.release_type}{release.primary_genre ? ` · ${release.primary_genre}` : ""}{release.release_date ? ` · ${release.release_date}` : ""}
          </p>
        </div>

        {/* Share */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ title: release.title, url: window.location.href }).catch(() => {});
              } else if (typeof navigator !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs rounded-full border border-border/60 bg-background/60 backdrop-blur px-3 py-1.5 hover:bg-background"
          >
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>

        <div className="mt-6 space-y-2.5">
          {links.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">Streaming links coming soon.</p>
          ) : links.map((l) => (
            <a key={l.platform} href={l.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-xl px-5 py-3.5 font-semibold transition shadow-lg shadow-black/10 ${PLATFORM_COLORS[l.platform] ?? "bg-card border border-border hover:bg-muted"}`}>
              <span>{l.platform}</span>
              <span className="text-sm opacity-80 inline-flex items-center gap-1">Play <ExternalLink className="h-3 w-3" /></span>
            </a>
          ))}
        </div>

        {/* Signup promo */}
        <div className="mt-10 relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-cyan-500/10 p-6">
          <Sparkles className="h-6 w-6 text-primary mb-2" />
          <h2 className="font-display text-lg font-semibold leading-snug">
            Got a track? Release it to the world.
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            SoundXpand puts your music on Spotify, Apple Music, YouTube, JioSaavn and 150+ platforms — keep 100% of your rights.
          </p>
          <Link to="/auth" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
            Get started free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Powered by SoundXpand</Link>
          <span className="mx-2">·</span>
          <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
          <span className="mx-2">·</span>
          <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
