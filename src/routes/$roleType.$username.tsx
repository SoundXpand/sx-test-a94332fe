import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import {
  ExternalLink, Music, Instagram, Youtube, Facebook, Globe,
  Sparkles, ArrowRight, Headphones, Disc3,
} from "lucide-react";
import { ArtworkImage } from "@/components/catalog/artwork-image";
import { BrandLogo } from "@/components/branding/brand-logo";

const ROLES = ["artist", "band", "label", "publisher", "manager", "producer", "songwriter"];

const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((d: { username: string }) => d)
  .handler(async ({ data }) => {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
    );
    const { data: profile } = await sb
      .from("public_profiles")
      .select("*")
      .ilike("username", data.username)
      .maybeSingle();
    if (!profile) return null;
    const { data: rels } = await sb
      .from("public_releases")
      .select("id,title,release_type,release_date,artwork_path,slug,primary_genre")
      .eq("owner_id", (profile as any).user_id)
      .order("release_date", { ascending: false })
      .limit(60);
    const releases = await Promise.all(
      (rels ?? []).map(async (r) => {
        let url: string | null = null;
        if (r.artwork_path) {
          const { data: signed } = await sb.storage.from("artwork").createSignedUrl(r.artwork_path, 60 * 60);
          url = signed?.signedUrl ?? null;
        }
        return { ...r, artworkUrl: url };
      })
    );
    let avatarUrl: string | null = (profile as any).avatar_url ?? null;
    return { profile, releases, avatarUrl };
  });

export const Route = createFileRoute("/$roleType/$username")({
  beforeLoad: ({ params }) => {
    if (!ROLES.includes(params.roleType)) throw notFound();
  },
  loader: async ({ params }) => {
    const r = await getPublicProfile({ data: { username: params.username } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ params, loaderData }) => {
    const p: any = loaderData?.profile;
    const name = p?.display_name || p?.artist_name || p?.full_name || params.username;
    const title = `${name} — ${params.roleType} on SoundXpand`;
    const desc = (p?.bio?.slice(0, 155)) ||
      `Listen to ${name}'s music on Spotify, Apple Music, YouTube and more. Discover their latest releases on SoundXpand.`;
    const url = `https://asset-friend-hub.lovable.app/${params.roleType}/${params.username}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        ...(loaderData?.avatarUrl ? [{ property: "og:image", content: loaderData.avatarUrl }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": params.roleType === "artist" ? "MusicGroup" : "Person",
          name,
          url,
          ...(p?.country ? { address: { "@type": "PostalAddress", addressCountry: p.country } } : {}),
          ...(loaderData?.avatarUrl ? { image: loaderData.avatarUrl } : {}),
          sameAs: [p?.social_instagram, p?.social_youtube, p?.social_spotify, p?.social_apple, p?.social_soundcloud, p?.social_tiktok, p?.social_facebook, p?.social_website].filter(Boolean),
        }),
      }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center px-4 bg-background">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile not found</h1>
        <p className="text-sm text-muted-foreground mt-2">This page is private or doesn't exist.</p>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Back to SoundXpand</Link>
      </div>
    </div>
  ),
  component: PublicProfile,
});

const SOCIAL_ICONS: Record<string, any> = {
  Instagram, YouTube: Youtube, Facebook, Website: Globe,
};

function PublicProfile() {
  const { roleType, username } = Route.useParams();
  const { profile, releases, avatarUrl } = Route.useLoaderData() as NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>;
  const p: any = profile;
  const name = p.display_name || p.artist_name || p.full_name || p.username;
  const initials = name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  const socials = [
    ["Spotify", p.social_spotify, Headphones, "from-[#1DB954]/30"],
    ["Apple Music", p.social_apple, Music, "from-pink-500/30"],
    ["YouTube", p.social_youtube, Youtube, "from-red-500/30"],
    ["Instagram", p.social_instagram, Instagram, "from-fuchsia-500/30"],
    ["SoundCloud", p.social_soundcloud, Music, "from-orange-500/30"],
    ["TikTok", p.social_tiktok, Music, "from-cyan-500/30"],
    ["Facebook", p.social_facebook, Facebook, "from-blue-500/30"],
    ["Website", p.social_website, Globe, "from-emerald-500/30"],
  ].filter(([, v]) => v) as [string, string, any, string][];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Vibrant gradient blur backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-primary/40 blur-[160px] animate-orb" />
        <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/35 blur-[160px] animate-orb" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-cyan-500/30 blur-[160px] animate-orb" style={{ animationDelay: "4s" }} />
      </div>

      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo height={26} />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">Sign in</Link>
            <Link to="/auth" className="text-sm rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-medium hover:opacity-90">
              Distribute your music
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Hero */}
        <section className="flex items-end gap-6 flex-wrap">
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl bg-gradient-to-br from-primary/40 to-fuchsia-500/40 text-white grid place-items-center text-4xl font-bold overflow-hidden shrink-0 ring-4 ring-background shadow-2xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" loading="eager" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-medium">{roleType}</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-1 leading-tight">{name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span>@{p.username}</span>
              {p.country && <span>· {p.country}</span>}
              <span>· {releases.length} release{releases.length !== 1 ? "s" : ""}</span>
            </div>
            {p.bio && <p className="mt-4 text-base leading-relaxed max-w-2xl whitespace-pre-line text-foreground/90">{p.bio}</p>}
          </div>
        </section>

        {/* Social grid */}
        {socials.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Find me on</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {socials.map(([label, url, Icon, grad]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative overflow-hidden flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 backdrop-blur px-4 py-3 hover:border-primary/40 transition`}
                >
                  <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${grad} to-transparent opacity-60 group-hover:opacity-100 transition`} />
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-sm truncate">{label}</span>
                  <ExternalLink className="h-3 w-3 ml-auto opacity-50 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Discography */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
              <Disc3 className="h-5 w-5 text-primary" /> Discography
            </h2>
            <span className="text-xs text-muted-foreground">{releases.length} release{releases.length !== 1 ? "s" : ""}</span>
          </div>
          {releases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center text-sm text-muted-foreground">
              No public releases yet — check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {releases.map((r: any) => (
                <a
                  key={r.id}
                  href={r.slug ? `/l/${r.slug}` : "#"}
                  className="group block"
                >
                  <ArtworkImage src={r.artworkUrl} alt={r.title} className="aspect-square rounded-xl group-hover:ring-2 ring-primary/60 transition" />
                  <div className="mt-2.5 font-semibold text-sm truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground capitalize truncate">
                    {r.release_type}{r.primary_genre ? ` · ${r.primary_genre}` : ""}
                  </div>
                  {r.release_date && <div className="text-[10px] text-muted-foreground mt-0.5">{r.release_date}</div>}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Signup promo */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-cyan-500/10 p-8 sm:p-12">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Your music. <span className="text-primary">Everywhere.</span>
            </h2>
            <p className="mt-3 text-foreground/80 text-base sm:text-lg">
              Join {name} and thousands of artists distributing to Spotify, Apple Music, YouTube, JioSaavn and 150+ platforms — keep 100% of your rights.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 transition">
                Start distributing free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="inline-flex items-center rounded-full border border-border bg-background/60 px-6 py-3 font-medium hover:bg-muted/50 transition">
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 mt-10 bg-background/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-muted-foreground flex flex-wrap gap-4 justify-between">
          <div>© 2026 SoundXpand · Empowering independent artists</div>
          <div className="flex gap-4">
            <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:hello@soundxpand.com" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
