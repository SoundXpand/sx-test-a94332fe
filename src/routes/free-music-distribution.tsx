import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";
import fluidHero from "@/assets/landing/fluid-3d-hero.png";
import fluidSecondary from "@/assets/landing/fluid-3d-secondary.png";


export const Route = createFileRoute("/free-music-distribution")({
  head: () => ({
    meta: [
      { title: "Free music distribution to Spotify, Apple Music & 150+ stores — SoundXpand" },
      {
        name: "description",
        content:
          "Distribute your music for free to Spotify, Apple Music, YouTube Music, TikTok, JioSaavn and 150+ stores worldwide. Keep 100% of your rights and royalties.",
      },
      { property: "og:title", content: "Free music distribution — SoundXpand" },
      {
        property: "og:description",
        content:
          "Release your music to every major platform for free. Keep 100% rights, collect royalties on autopilot.",
      },
      { property: "og:url", content: "/free-music-distribution" },
      { name: "twitter:title", content: "Free music distribution — SoundXpand" },
      {
        name: "twitter:description",
        content:
          "Release your music to every major platform for free. Keep 100% rights and royalties.",
      },
    ],
    links: [{ rel: "canonical", href: "/free-music-distribution" }],
  }),
  component: FreeMusicDistributionPage,
});

const ROTATING_TEXT = "CONTACT US • GET STARTED FREE • ";

function RotatingBadge() {
  // Build SVG textPath with the rotating string repeated to fill the circle
  const text = ROTATING_TEXT.repeat(2);
  return (
    <div className="relative grid h-32 w-32 place-items-center sm:h-40 sm:w-40">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]"
        aria-hidden
      >
        <defs>
          <path
            id="rot-circle"
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <text
          className="fill-foreground"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            letterSpacing: "0.22em",
            fontWeight: 600,
          }}
        >
          <textPath href="#rot-circle" startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <div className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white shadow-[0_0_30px_-4px_var(--brand-violet-deep)] sm:h-16 sm:w-16">
        <Music2 className="h-6 w-6" />
      </div>
    </div>
  );
}

function FreeMusicDistributionPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <LandingNav />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
          {/* Orbs */}
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_55%,transparent)_0%,transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-48 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-pink)_30%,transparent)_0%,transparent_70%)] blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
            }}
          />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" /> 100% free forever
              </span>
              <h1 className="mt-6 font-display text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.02] tracking-[-0.04em]">
                Free music{" "}
                <span className="text-gradient-brand">distribution</span> to
                every store on earth.
              </h1>
              <p className="mt-6 max-w-md text-base font-light text-muted-foreground sm:text-lg">
                Release your music to Spotify, Apple Music, YouTube Music,
                TikTok, JioSaavn and 150+ platforms — keep 100% of your rights
                and royalties.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/auth"
                  hash="login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-violet)] px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_0_40px_-8px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
                >
                  Distribute free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-2"
                >
                  How it works
                </a>
              </div>
            </div>

            {/* 3D fluid image */}
            <div className="relative mx-auto aspect-square w-full max-w-[560px]">
              <img
                src={fluidHero}
                alt="3D holographic fluid sculpture representing music flowing to every platform"
                width={1024}
                height={1024}
                className="h-full w-full object-contain drop-shadow-[0_30px_80px_rgba(167,139,250,0.35)] animate-[float_8s_ease-in-out_infinite]"
              />
            </div>
          </div>

          {/* Rotating contact badge — bottom center, replacing scroll-down */}
          <div className="relative mx-auto mt-16 flex justify-center">
            <Link to="/auth" hash="login" aria-label="Contact us / Get started free">
              <RotatingBadge />
            </Link>
          </div>
        </section>

        {/* ABOUT — split with second 3D image */}
        <section id="how" className="relative overflow-hidden py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <img
                src={fluidSecondary}
                alt="Holographic 3D wave representing royalty flow"
                width={1024}
                height={1024}
                loading="lazy"
                className="h-full w-full object-contain drop-shadow-[0_30px_80px_rgba(244,114,182,0.3)]"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-violet)]">
                Who we are
              </span>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
                Distribution built for independent artists.
              </h2>
              <p className="mt-5 text-base font-light text-muted-foreground sm:text-lg">
                SoundXpand delivers your releases to every major DSP — Spotify,
                Apple Music, YouTube Music, TikTok, Amazon, Deezer, Tidal,
                JioSaavn, Boomplay and 150+ more — with transparent royalty
                accounting and real-time analytics.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {[
                  "Unlimited free uploads — no per-release fees",
                  "Keep 100% of your master rights and royalties",
                  "Automated splits & payouts to collaborators",
                  "Lightning-fast takedowns and metadata fixes",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--brand-violet)] to-[var(--brand-pink)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-24 sm:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_40%,transparent)_0%,transparent_70%)] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              Ship your sound, <span className="text-gradient-brand">free</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-light text-muted-foreground">
              Sign up in 30 seconds and release your next track to the world.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                hash="login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-violet)] px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_0_40px_-8px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
              >
                Start free today <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
