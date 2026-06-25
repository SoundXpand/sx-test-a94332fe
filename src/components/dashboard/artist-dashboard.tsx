import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, Music, Video, TrendingUp, Share2, Mail, Sparkles, ExternalLink,
  Disc3, Clock, CheckCircle2, BarChart3, DollarSign, Heart,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export function ArtistDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const [rel, an, deliveredAll] = await Promise.all([
        supabase.from("releases").select("id,title,release_type,status,release_date,artwork_path,created_at,slug,delivered_at").eq("owner_id", u.user.id).order("created_at", { ascending: false }),
        supabase.from("analytics_rows").select("streams,revenue").eq("owner_id", u.user.id),
        supabase.from("releases").select("id,title,artist_name,release_date,slug,delivered_at").eq("status", "delivered").gte("delivered_at", since30).order("delivered_at", { ascending: false }).limit(12),
      ]);
      const releases = rel.data ?? [];
      setStats({
        total: releases.length,
        pending: releases.filter(r => r.status === "pending").length,
        live: releases.filter(r => r.status === "live" || r.status === "delivered").length,
        streams: (an.data ?? []).reduce((s, r) => s + (r.streams || 0), 0),
        revenue: (an.data ?? []).reduce((s, r) => s + Number(r.revenue || 0), 0),
      });
      setRecent(releases.slice(0, 5));
      setTrending(deliveredAll.data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Total releases", value: stats?.total ?? "—", icon: Disc3 },
    { label: "Pending review", value: stats?.pending ?? "—", icon: Clock },
    { label: "Live/Delivered", value: stats?.live ?? "—", icon: CheckCircle2 },
    { label: "Total streams", value: stats ? stats.streams.toLocaleString() : "—", icon: BarChart3 },
    { label: "Revenue", value: stats ? `₹${stats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Distribute, track, and grow your music.</p>
        </div>
        <Button asChild><Link to="/releases/new"><Plus className="h-4 w-4 mr-1.5" />New release</Link></Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(w => (
          <Card key={w.label} className="p-5 bg-card/60 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{w.label}</span>
              <w.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-2xl font-semibold">{w.value}</div>
          </Card>
        ))}
      </div>

      {/* Promotion cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/15 via-card/60 to-card/60 border-primary/30">
          <Music className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-display text-lg font-semibold">Music distribution</h3>
          <p className="text-sm text-muted-foreground mt-1">Reach 150+ platforms worldwide.</p>
          <Button asChild className="mt-4 w-full"><Link to="/releases/new">Start a release</Link></Button>
        </Card>
        <Card className="p-6 bg-card/40 border-dashed border-border opacity-80">
          <Video className="h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="font-display text-lg font-semibold">Video distribution</h3>
          <p className="text-sm text-muted-foreground mt-1">Push videos to YouTube Music, Vevo, and more.</p>
          <Button disabled className="mt-4 w-full" variant="outline">Coming soon</Button>
        </Card>
        <Card className="p-6 bg-card/60 border-border">
          <Share2 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-display text-lg font-semibold">Social promotion</h3>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated smart links so fans find your music anywhere.</p>
          <Button asChild variant="outline" className="mt-4 w-full"><Link to="/tools">Open tools</Link></Button>
        </Card>
      </div>

      {/* Trending — last 30 days delivered across all users */}
      <Card className="p-6 bg-card/60 border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary animate-pulse" />Charts · last 30 days delivered
          </h2>
          <span className="text-xs text-muted-foreground">Across the SoundXpand catalog</span>
        </div>
        {trending.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No deliveries in the last 30 days.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trending.map((r, i) => (
              <Card key={r.id} className="p-4 bg-muted/20 border-border hover:border-primary/40 transition group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground">#{i + 1}</div>
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.artist_name || "Unknown"}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{r.release_date || ""}</div>
                  </div>
                  {r.slug ? (
                    <a href={`/l/${r.slug}`} target="_blank" rel="noreferrer" className="opacity-60 group-hover:opacity-100 transition">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
                {r.slug && (
                  <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                    <a href={`/l/${r.slug}`} target="_blank" rel="noreferrer">Smart link</a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Recent releases */}
      <Card className="p-6 bg-card/60 border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Your recent releases</h2>
          <Link to="/catalog" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases yet" description="Upload your first release to start tracking streams and revenue." actionLabel="Create release" actionTo="/releases/new" />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map(r => (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <div className="h-10 w-10 rounded-md bg-muted grid place-items-center text-muted-foreground"><Disc3 className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.release_type} · {r.release_date || "Unscheduled"}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{r.status.replace(/_/g," ")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Collaboration + quote */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-card/60 to-card/60 border-border">
          <Sparkles className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-display text-lg font-semibold">Got an idea?</h3>
          <p className="text-sm text-muted-foreground mt-1">Collaborations, partnerships, label deals — we'd love to hear from you.</p>
          <Button asChild className="mt-4">
            <a href="mailto:mca@soundxpand.com"><Mail className="h-4 w-4 mr-1.5" />mca@soundxpand.com</a>
          </Button>
        </Card>
        <RotatingQuoteCard />
      </div>

      {/* YouTube channel feature */}
      <Card className="p-0 bg-card/60 border-border overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.4fr]">
          <div className="p-6 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-wider text-primary mb-2">SoundXpand on YouTube</div>
            <h3 className="font-display text-xl font-semibold">Watch artist stories, tutorials & behind-the-scenes</h3>
            <p className="text-sm text-muted-foreground mt-2">Subscribe to follow our community of independent artists.</p>
            <Button asChild className="mt-4 w-fit" variant="outline">
              <a href="https://www.youtube.com/@soundxpand" target="_blank" rel="noreferrer">
                <Video className="h-4 w-4 mr-1.5" />Open channel
              </a>
            </Button>
          </div>
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed?listType=user_uploads&list=soundxpand"
              title="SoundXpand YouTube"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

const QUOTES: { text: string; author: string }[] = [
  { text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" },
  { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { text: "One good thing about music — when it hits you, you feel no pain.", author: "Bob Marley" },
  { text: "Music produces a kind of pleasure which human nature cannot do without.", author: "Confucius" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
  { text: "Music is the strongest form of magic.", author: "Marilyn Manson" },
  { text: "If music be the food of love, play on.", author: "William Shakespeare" },
  { text: "Music expresses that which cannot be said and on which it is impossible to be silent.", author: "Victor Hugo" },
  { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.", author: "Plato" },
  { text: "The only truth is music.", author: "Jack Kerouac" },
];

function RotatingQuoteCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % QUOTES.length), 30000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <Card className="p-6 bg-card/60 border-border flex flex-col justify-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <Heart className="h-6 w-6 text-primary mb-3 relative" />
      <blockquote key={i} className="font-display text-lg italic leading-snug animate-in fade-in slide-in-from-bottom-1 duration-700 relative">
        "{q.text}"
      </blockquote>
      <p className="text-xs text-muted-foreground mt-2 relative">— {q.author}</p>
      <div className="flex gap-1 mt-4 relative">
        {QUOTES.map((_, idx) => (
          <span key={idx} className={`h-1 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
        ))}
      </div>
    </Card>
  );
}
