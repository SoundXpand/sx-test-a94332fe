import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Music } from "lucide-react";

const ROLES = ["artist", "label", "publisher", "manager", "producer"];

export const Route = createFileRoute("/$roleType/$username")({
  beforeLoad: ({ params }) => {
    if (!ROLES.includes(params.roleType)) throw notFound();
  },
  component: PublicProfile,
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — SoundXpand` },
      { name: "description", content: `Public ${params.roleType} profile on SoundXpand.` },
      { property: "og:title", content: `${params.username} on SoundXpand` },
      { property: "og:type", content: "profile" },
    ],
  }),
});

function PublicProfile() {
  const { username, roleType } = Route.useParams();
  const [profile, setProfile] = useState<any>(null);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("public_profiles" as any).select("*").ilike("username", username).maybeSingle();
      setProfile(p);
      if (p) {
        const { data: rels } = await supabase
          .from("releases")
          .select("id,title,release_type,release_date,artwork_path,slug")
          .eq("owner_id", (p as any).user_id)
          .eq("status", "live")
          .order("release_date", { ascending: false });
        setReleases(rels ?? []);
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!profile) return (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile is private or not found</h1>
        <p className="text-sm text-muted-foreground mt-2">This {roleType} hasn't made their profile public.</p>
        <Button asChild className="mt-4"><Link to="/">Back to home</Link></Button>
      </div>
    </div>
  );

  const initials = (profile.display_name || profile.artist_name || profile.username || "?").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  const socials = [
    ["Instagram", profile.social_instagram],
    ["YouTube", profile.social_youtube],
    ["Spotify", profile.social_spotify],
    ["Apple Music", profile.social_apple],
    ["SoundCloud", profile.social_soundcloud],
    ["TikTok", profile.social_tiktok],
    ["Facebook", profile.social_facebook],
    ["Website", profile.social_website],
  ].filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Music className="h-4 w-4 text-primary" /><span className="font-display font-semibold">SoundXpand</span></Link>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="h-24 w-24 rounded-full bg-primary/15 text-primary grid place-items-center text-2xl font-semibold overflow-hidden shrink-0">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{roleType}</div>
            <h1 className="font-display text-3xl font-semibold">{profile.display_name || profile.artist_name || profile.username}</h1>
            {profile.country && <div className="text-sm text-muted-foreground mt-1">{profile.country}</div>}
            {profile.bio && <p className="mt-3 text-sm leading-relaxed max-w-2xl whitespace-pre-line">{profile.bio}</p>}
          </div>
        </div>

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map(([k, v]) => (
              <Button key={k} asChild variant="outline" size="sm"><a href={v as string} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />{k}</a></Button>
            ))}
          </div>
        )}

        <section>
          <h2 className="font-display text-xl font-semibold mb-3">Discography</h2>
          {releases.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground border-dashed">No public releases yet.</Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {releases.map(r => (
                <a key={r.id} href={r.slug ? `/l/${r.slug}` : "#"} className="group block">
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                    {r.artwork_path ? <img src={r.artwork_path} alt={r.title} className="h-full w-full object-cover group-hover:scale-105 transition" /> : <div className="h-full grid place-items-center text-muted-foreground"><Music className="h-8 w-8" /></div>}
                  </div>
                  <div className="mt-2 font-medium text-sm truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.release_type} · {r.release_date || ""}</div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border mt-10">
        <div className="max-w-4xl mx-auto px-4 py-6 text-xs text-muted-foreground flex flex-wrap gap-4 justify-between">
          <div>© 2026 SoundXpand</div>
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
