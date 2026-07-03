import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload, Globe, Shield, BarChart3, Sparkles, Users, Music, Palette, Radio,
  Youtube, DollarSign, FileText, Bell, Calendar, Link2, Zap, Layers, Cpu,
  Mic, Play, Video, MessageSquare, Boxes, Wallet, Star, Search, LineChart,
  Lock, Cloud, Rocket, ArrowRight,
} from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";

export const Route = createFileRoute("/more-features")({
  head: () => ({
    meta: [
      { title: "All Features — SoundXpand Music Distribution" },
      { name: "description", content: "Explore every SoundXpand feature: unlimited distribution, publishing, YouTube Content ID, sync, AI tools, analytics, splits, promotion and more." },
      { property: "og:title", content: "All Features — SoundXpand" },
      { property: "og:description", content: "The complete SoundXpand feature list for artists, producers and labels." },
    ],
    links: [{ rel: "canonical", href: "https://soundxpand.com/more-features" }],
  }),
  component: MoreFeaturesPage,
});

type Feature = { icon: JSX.Element; title: string; description: string };
type Group = { eyebrow: string; title: string; description: string; features: Feature[] };

const groups: Group[] = [
  {
    eyebrow: "Distribution",
    title: "Global distribution built for scale",
    description: "Ship unlimited releases to 150+ platforms worldwide with zero commission.",
    features: [
      { icon: <Upload className="h-5 w-5" />, title: "Unlimited releases", description: "Distribute unlimited singles, EPs and albums under one flat plan." },
      { icon: <Globe className="h-5 w-5" />, title: "150+ platforms", description: "Spotify, Apple Music, Tidal, Amazon, YouTube, JioSaavn, KKBOX, Anghami, Boomplay and more." },
      { icon: <Calendar className="h-5 w-5" />, title: "Release scheduling", description: "Plan pre-saves, timed premieres and platform-specific rollouts." },
      { icon: <Link2 className="h-5 w-5" />, title: "Smart links", description: "Auto-generated multi-platform landing pages for every release." },
      { icon: <Shield className="h-5 w-5" />, title: "Rights protection", description: "ISRC, UPC and metadata verification before delivery." },
      { icon: <Bell className="h-5 w-5" />, title: "Delivery notifications", description: "Live status per store with detailed logs and takedown control." },
    ],
  },
  {
    eyebrow: "Monetization",
    title: "Every royalty stream, one dashboard",
    description: "Collect from streaming, mechanicals, performance, sync and neighbouring rights globally.",
    features: [
      { icon: <DollarSign className="h-5 w-5" />, title: "Streaming royalties", description: "Track earnings across every DSP down to the ISRC and territory." },
      { icon: <FileText className="h-5 w-5" />, title: "Music publishing", description: "Global mechanical and performance royalty collection with MLC, ASCAP, PPL India, GVL and more." },
      { icon: <Youtube className="h-5 w-5" />, title: "YouTube Content ID", description: "Monetize UGC usage of your recordings on YouTube automatically." },
      { icon: <Radio className="h-5 w-5" />, title: "Neighbouring rights", description: "Collect performer royalties from broadcasters worldwide." },
      { icon: <Video className="h-5 w-5" />, title: "Sync licensing", description: "Pitch your catalog to film, TV, games and brand supervisors." },
      { icon: <Wallet className="h-5 w-5" />, title: "Splits & payouts", description: "Automatic royalty splits with instant payouts to collaborators." },
    ],
  },
  {
    eyebrow: "AI Tools",
    title: "Creator-first AI",
    description: "Responsible AI that speeds up the boring parts so you can focus on the music.",
    features: [
      { icon: <Palette className="h-5 w-5" />, title: "AI cover art", description: "Generate release covers in seconds with prompt-guided styles." },
      { icon: <Sparkles className="h-5 w-5" />, title: "Metadata assistant", description: "Auto-suggest genres, moods and language tags for better discovery." },
      { icon: <MessageSquare className="h-5 w-5" />, title: "Bio & press writer", description: "Draft artist bios, EPKs and pitch text from a few bullet points." },
      { icon: <Search className="h-5 w-5" />, title: "Playlist matcher", description: "Find playlists and curators that fit your sound." },
      { icon: <Mic className="h-5 w-5" />, title: "Vocal stem separation", description: "Split stems for remixes, mashups and short-form content." },
      { icon: <Cpu className="h-5 w-5" />, title: "Mastering suggestions", description: "AI-guided loudness, EQ and tonal balance targets before delivery." },
    ],
  },
  {
    eyebrow: "Analytics",
    title: "Insights that actually move numbers",
    description: "Understand where your audience is growing and what to double-down on.",
    features: [
      { icon: <BarChart3 className="h-5 w-5" />, title: "Advanced analytics", description: "Streams, listeners, saves and playlists per platform and territory." },
      { icon: <LineChart className="h-5 w-5" />, title: "Trends & forecasts", description: "Weekly growth, drop-off signals and release momentum tracking." },
      { icon: <Users className="h-5 w-5" />, title: "Audience insights", description: "Age, gender, location and top cities per release and artist." },
      { icon: <Star className="h-5 w-5" />, title: "Playlist tracking", description: "Track every editorial and algorithmic playlist add or drop." },
    ],
  },
  {
    eyebrow: "Promotion",
    title: "Reach more of the right ears",
    description: "Native promotion tools built for the modern release cycle.",
    features: [
      { icon: <Rocket className="h-5 w-5" />, title: "Pre-save campaigns", description: "Beautiful pre-save pages with fan capture and retargeting pixels." },
      { icon: <Play className="h-5 w-5" />, title: "Playlist pitching", description: "Submit to editorial teams at Spotify, Apple, Tidal and more." },
      { icon: <Zap className="h-5 w-5" />, title: "Ad campaigns", description: "Run Meta and TikTok ads from your dashboard with creator-tuned templates." },
      { icon: <Video className="h-5 w-5" />, title: "Short-form assets", description: "Auto-generate lyric videos, canvas loops and Reels-ready clips." },
    ],
  },
  {
    eyebrow: "Team & Ops",
    title: "For labels, managers and collectives",
    description: "Everything you need to run a modern indie label.",
    features: [
      { icon: <Users className="h-5 w-5" />, title: "Team roles", description: "Invite managers, mixers, publicists with fine-grained permissions." },
      { icon: <Boxes className="h-5 w-5" />, title: "Catalog manager", description: "Bulk edits, migrations and imports from other distributors." },
      { icon: <Music className="h-5 w-5" />, title: "Artist rosters", description: "Manage many artists under one umbrella with per-artist analytics." },
      { icon: <Layers className="h-5 w-5" />, title: "White-label options", description: "Custom domain smart links and branded reports." },
      { icon: <Lock className="h-5 w-5" />, title: "Enterprise security", description: "SSO, audit logs and role-based access controls." },
      { icon: <Cloud className="h-5 w-5" />, title: "API & webhooks", description: "Integrate SoundXpand with your existing stack." },
    ],
  },
];

function MoreFeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--brand-pink) 40%, transparent) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            All features · Complete list
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Every feature, in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            SoundXpand is a full stack for independent artists — distribution, publishing, monetization, AI, analytics and promotion. Explore what's inside.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl space-y-20 px-5 sm:px-8">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="flex flex-col gap-2 border-b border-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">
                    {g.eyebrow}
                  </div>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {g.title}
                  </h2>
                </div>
                <p className="max-w-md text-sm font-light text-muted-foreground">{g.description}</p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.features.map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-hairline bg-surface-1/30 p-5 transition-colors hover:border-hairline-strong hover:bg-surface-1/60"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                      {f.icon}
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm font-light text-muted-foreground">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-3xl border border-hairline bg-gradient-to-br from-[color-mix(in_oklch,var(--brand-violet)_15%,transparent)] to-transparent p-10 text-center sm:p-14">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to try SoundXpand?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Start distributing for free. Upgrade any time to unlock publishing, sync and enterprise features.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-6 py-3 font-display text-sm font-semibold text-white"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 font-display text-sm font-semibold"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
