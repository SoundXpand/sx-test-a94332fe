import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Send,
  BarChart3,
  Wallet,
  Globe2,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Users,
  Radio,
  CheckCircle2,
  Clock,
  Music4,
} from "lucide-react";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { CookieConsentWidget } from "@/components/landing/cookie-consent-widget";
import { DSPS_FULL } from "@/lib/dsp-list";

export const Route = createFileRoute("/free-music-distribution")({
  head: () => ({
    meta: [
      { title: "Free music distribution to Spotify, Apple Music & 150+ stores — SoundXpand" },
      {
        name: "description",
        content:
          "Release unlimited music for free to 150+ platforms worldwide. Keep 100% of your royalties, rights and masters. Fast delivery, transparent analytics, zero hidden fees.",
      },
      { property: "og:title", content: "Free music distribution — SoundXpand" },
      {
        property: "og:description",
        content:
          "Release unlimited music to every major platform for free. Keep 100% rights and royalties.",
      },
      { property: "og:url", content: "https://sx-test.lovable.app/free-music-distribution" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free music distribution — SoundXpand" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/free-music-distribution" }],
  }),
  component: FreeMusicDistributionPage,
});

const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function FreeMusicDistributionPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <LandingNav />
      <main className="pt-16">
        <Hero />
        <MarqueeStrip />
        <ValueGrid />
        <TimelineSection />
        <PlatformShowcase />
        <RoyaltiesSection />
        <ComparisonSection />
        <TestimonialSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <ContactUsBadge />
      <CookieConsentWidget />
    </div>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-36 pb-28 sm:pt-44 sm:pb-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-320px] h-[820px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_20%,transparent)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-deep)_16%,transparent)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-6xl px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="chip-mono mx-auto"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber)]" />
          Free forever · 150+ platforms · Keep 100%
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-8 font-display text-[clamp(2.75rem,8vw,7rem)] font-800 leading-[0.92] tracking-[-0.04em]"
        >
          Release music.
          <br />
          Everywhere.{" "}
          <span className="italic bg-gradient-to-br from-[var(--amber-glow)] via-[var(--amber)] to-[var(--amber-deep)] bg-clip-text text-transparent">
            For free.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Upload once. Ship to Spotify, Apple Music, YouTube, TikTok, JioSaavn and 150+ more.
          No subscriptions. No per-release fees. You keep 100% of what you earn.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/auth"
            className="btn-tactile group inline-flex items-center gap-2 rounded-full bg-[var(--amber)] px-7 py-4 text-base font-semibold text-[var(--ink)]"
          >
            Start distributing free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/digital-music-platforms"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] px-7 py-4 text-base font-medium text-foreground/90 hover:border-[var(--amber)]/60 hover:text-[var(--amber)] transition"
          >
            Browse 150+ stores
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--hairline)] pt-10 sm:grid-cols-4"
        >
          {[
            { k: "0", v: "Upfront cost" },
            { k: "100%", v: "Royalties kept" },
            { k: "150+", v: "Stores & platforms" },
            { k: "48h", v: "Avg delivery" },
          ].map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
            >
              <div className="font-display text-3xl font-700 tracking-tight sm:text-4xl">
                {s.k}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                {s.v}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────  MARQUEE STRIP  ───────────────────────── */

function MarqueeStrip() {
  const items = DSPS_FULL.slice(0, 20);
  const row = [...items, ...items];
  return (
    <section className="relative border-y border-[var(--hairline)] bg-[color-mix(in_oklch,var(--charcoal)_60%,transparent)] py-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--ink)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--ink)] to-transparent" />
      <div className="flex gap-10 animate-[marquee_38s_linear_infinite] whitespace-nowrap will-change-transform">
        {row.map((d, i) => (
          <div key={i} className="flex items-center gap-3 opacity-80">
            {d.logo ? (
              <img src={d.logo} alt="" className="h-6 w-6 object-contain" loading="lazy" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-[var(--amber)]" />
            )}
            <span className="font-display text-lg tracking-tight text-foreground/85">
              {d.name.split(",")[0]}
            </span>
            <span className="text-[var(--hairline-strong)]">·</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

/* ─────────────────────────  VALUE BENTO  ─────────────────────────── */

function ValueGrid() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Why free actually means free"
          title={
            <>
              No catch. No commission.{" "}
              <span className="italic text-muted-foreground">Just distribution.</span>
            </>
          }
        />

        <div className="mt-16 grid gap-5 md:grid-cols-6">
          {/* Large hero card */}
          <BentoCard className="md:col-span-4 md:row-span-2 p-10 min-h-[380px]" glow>
            <div className="chip-mono w-max"><Wallet className="h-3.5 w-3.5" /> Royalties</div>
            <h3 className="mt-6 font-display text-4xl font-700 leading-[1.05] tracking-tight sm:text-5xl">
              Keep <span className="italic">100%</span> of what you earn.
            </h3>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Every stream, download and sync payout flows straight to your wallet.
              We don't skim, we don't lock you in, we don't own your masters.
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {["0% commission", "No hidden fees", "Own your masters", "Cancel anytime"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--hairline-strong)] bg-[var(--ink)]/40 px-3 py-1.5 text-xs text-foreground/85"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 p-8" icon={<InfinityIcon className="h-5 w-5" />}>
            <h4 className="font-display text-2xl font-600 tracking-tight">Unlimited releases</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Singles, EPs, albums — release as many as you want, forever.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 p-8" icon={<Zap className="h-5 w-5" />}>
            <h4 className="font-display text-2xl font-600 tracking-tight">Fast delivery</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Most stores go live in 24–72h. Pre-order windows supported.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 p-8" icon={<Users className="h-5 w-5" />}>
            <h4 className="font-display text-2xl font-600 tracking-tight">Automatic splits</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay collaborators automatically. No spreadsheets, no drama.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 p-8" icon={<ShieldCheck className="h-5 w-5" />}>
            <h4 className="font-display text-2xl font-600 tracking-tight">Rights protection</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Content ID + fingerprinting on YouTube, Meta, TikTok — free.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 p-8" icon={<BarChart3 className="h-5 w-5" />}>
            <h4 className="font-display text-2xl font-600 tracking-tight">Live analytics</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Trends by store, city and playlist — refreshed daily.
            </p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className = "",
  icon,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-3xl border border-[var(--hairline)] bg-[color-mix(in_oklch,var(--charcoal)_65%,transparent)] transition ${className}`}
    >
      {glow && (
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_28%,transparent)_0%,transparent_70%)] blur-3xl" />
      )}
      {icon && (
        <div className="mb-6 grid h-11 w-11 place-items-center rounded-xl border border-[var(--hairline-strong)] bg-[var(--ink)]/60 text-[var(--amber)]">
          {icon}
        </div>
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ────────────────────────────  TIMELINE  ─────────────────────────── */

function TimelineSection() {
  const steps = [
    {
      k: "01",
      icon: <Upload className="h-5 w-5" />,
      t: "Upload your track",
      d: "Drop a WAV or FLAC, add your artwork and metadata. Our AI cleans up tags automatically.",
    },
    {
      k: "02",
      icon: <Sparkles className="h-5 w-5" />,
      t: "Pick stores & date",
      d: "Choose from 150+ platforms and set a release date — schedule up to 12 months out.",
    },
    {
      k: "03",
      icon: <Send className="h-5 w-5" />,
      t: "We deliver globally",
      d: "One click sends your release to every DSP with clean metadata and CI protection.",
    },
    {
      k: "04",
      icon: <BarChart3 className="h-5 w-5" />,
      t: "Track & get paid",
      d: "Watch streams roll in live. Withdraw royalties to bank, PayPal or Wise — anytime.",
    },
  ];

  return (
    <section className="relative bg-[color-mix(in_oklch,var(--charcoal)_45%,transparent)] py-28 sm:py-36 border-y border-[var(--hairline)]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="From upload to payout"
          title={
            <>
              Four steps. <span className="italic text-muted-foreground">Zero friction.</span>
            </>
          }
        />

        <div className="relative mt-20">
          <div className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--hairline-strong)] to-transparent md:left-1/2" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`relative grid gap-8 md:grid-cols-2 md:items-center ${
                  i % 2 === 1 ? "md:[&>*:first-child]:col-start-2" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "md:text-right md:pr-16" : "md:pl-16"}>
                  <div className="chip-mono w-max md:inline-flex">
                    <span className="text-[var(--amber)]">{s.k}</span> · Step
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-700 tracking-tight sm:text-4xl">
                    {s.t}
                  </h3>
                  <p className="mt-3 max-w-md text-muted-foreground">{s.d}</p>
                </div>
                <div />

                {/* Node */}
                <div className="absolute left-6 top-2 -translate-x-1/2 md:left-1/2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--hairline-strong)] bg-[var(--ink)] text-[var(--amber)] shadow-[0_0_40px_-10px_var(--amber)]">
                    {s.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  PLATFORMS GRID  ──────────────────────── */

function PlatformShowcase() {
  const featured = DSPS_FULL.filter((d) => d.logo).slice(0, 24);
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <div className="chip-mono w-max">
              <Globe2 className="h-3.5 w-3.5" /> The network
            </div>
            <h2 className="mt-6 font-display text-4xl font-700 leading-[1.05] tracking-tight sm:text-6xl">
              Every store <br />
              <span className="italic text-muted-foreground">that matters.</span>
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              We deliver to 150+ DSPs, UGC platforms, audio libraries and rights societies —
              from Spotify and Apple Music down to regional players like JioSaavn, Boomplay,
              Anghami and NetEase.
            </p>
            <Link
              to="/digital-music-platforms"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--amber)] hover:gap-3 transition-all"
            >
              See the full network <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {featured.map((d, i) => (
              <motion.div
                key={d.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
                whileHover={{ y: -3, borderColor: "var(--amber)" }}
                className="group aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--hairline)] bg-[color-mix(in_oklch,var(--charcoal)_60%,transparent)] p-3 transition"
              >
                {d.logo ? (
                  <img src={d.logo} alt={d.name} className="h-8 w-8 object-contain" loading="lazy" />
                ) : (
                  <Music4 className="h-6 w-6 text-[var(--amber)]" />
                )}
                <span className="text-center text-[10px] leading-tight text-muted-foreground line-clamp-2">
                  {d.name.split(",")[0]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  ROYALTIES BAND  ──────────────────────── */

function RoyaltiesSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--cream)] py-28 sm:py-36 text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        backgroundImage:
          "linear-gradient(color-mix(in_oklch,var(--ink)_8%,transparent) 1px, transparent 1px)",
        backgroundSize: "100% 42px",
      }} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-deep)]" />
              Payouts
            </div>
            <h2 className="mt-6 font-display text-5xl font-800 leading-[0.95] tracking-[-0.03em] sm:text-7xl">
              You wrote it. <br />
              <span className="italic">You keep it.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-[var(--ink)]/70">
              Withdraw royalties anytime — no minimum threshold, no processing delays.
              Split payments automatically across collaborators, producers and writers.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Automatic royalty splits across unlimited collaborators",
                "Withdraw to bank, PayPal or Wise in 30+ currencies",
                "Detailed statements by store, country and track",
                "Tax forms auto-generated for your territory",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[var(--ink)]/85">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--amber-deep)]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock statement card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl border border-[var(--ink)]/10 bg-white p-8 shadow-[0_30px_80px_-30px_rgba(20,15,10,0.25)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--ink)]/50">
                  This month
                </div>
                <div className="mt-1 font-display text-4xl font-700">$12,847.20</div>
              </div>
              <div className="rounded-full bg-[var(--amber)]/20 px-3 py-1 text-xs font-medium text-[var(--amber-deep)]">
                +34% MoM
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                { s: "Spotify", n: "1.2M streams", v: "$5,340.10", pct: 82 },
                { s: "Apple Music", n: "384k streams", v: "$3,912.50", pct: 60 },
                { s: "YouTube Music", n: "620k streams", v: "$1,842.00", pct: 34 },
                { s: "JioSaavn", n: "1.8M streams", v: "$980.60", pct: 20 },
                { s: "Others (146)", n: "—", v: "$772.00", pct: 15 },
              ].map((r) => (
                <div key={r.s} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-[var(--ink)]">{r.s}</span>
                      <span className="ml-2 text-[var(--ink)]/50">{r.n}</span>
                    </div>
                    <span className="font-medium tabular-nums">{r.v}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/8">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--amber)] to-[var(--amber-deep)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full rounded-2xl bg-[var(--ink)] py-3.5 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--ink)]/90">
              Withdraw balance
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  COMPARISON  ──────────────────────────── */

function ComparisonSection() {
  const rows = [
    ["Upfront cost", "Free", "$20 – $60 / yr"],
    ["Commission on royalties", "0%", "9% – 15%"],
    ["Unlimited releases", "Yes", "Sometimes"],
    ["YouTube Content ID", "Included", "Paid add-on"],
    ["Automatic splits", "Included", "Paid add-on"],
    ["Own your masters", "Always", "Yes"],
    ["Delivery speed", "24–72h", "3–7 days"],
    ["Human support", "Yes", "Rare"],
  ];
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="How we compare"
          title={
            <>
              The old model is <span className="italic">expensive</span>.
            </>
          }
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 overflow-hidden rounded-3xl border border-[var(--hairline)]"
        >
          <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-[color-mix(in_oklch,var(--charcoal)_60%,transparent)] px-6 py-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <div />
            <div className="text-center text-[var(--amber)]">SoundXpand</div>
            <div className="text-center">Others</div>
          </div>
          {rows.map(([label, us, them], i) => (
            <div
              key={label}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center px-6 py-4 text-sm ${
                i % 2 === 0 ? "bg-[color-mix(in_oklch,var(--charcoal)_25%,transparent)]" : ""
              }`}
            >
              <div className="text-foreground/90">{label}</div>
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--amber)]/15 px-3 py-1 font-medium text-[var(--amber)]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {us}
                </span>
              </div>
              <div className="text-center text-muted-foreground">{them}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────  TESTIMONIAL  ──────────────────────────── */

function TestimonialSection() {
  return (
    <section className="relative py-28 sm:py-36 border-y border-[var(--hairline)]">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <Radio className="mx-auto h-8 w-8 text-[var(--amber)]" />
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-8 font-display text-3xl font-500 leading-[1.15] tracking-tight sm:text-5xl"
        >
          "I moved my whole catalogue over in a weekend. Same streams,
          <span className="italic text-[var(--amber)]"> zero commission</span> —
          and the analytics actually make sense."
        </motion.blockquote>
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--hairline-strong)] bg-[var(--charcoal)] font-display text-lg">
            M
          </div>
          <div className="text-left">
            <div className="font-medium">Maya Kade</div>
            <div className="text-xs text-muted-foreground">
              Independent artist · 2.4M monthly listeners
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────  FAQ  ────────────────────────────── */

function FaqSection() {
  const faqs = [
    {
      q: "Is it really free — forever?",
      a: "Yes. No signup fee, no per-release fee, no annual fee. You keep 100% of royalties. We monetise through optional premium services (advanced marketing, sync licensing, publishing admin) — never through your core distribution.",
    },
    {
      q: "How fast do releases go live?",
      a: "Most stores process within 24–72 hours after delivery. For guaranteed release-day launches we recommend scheduling 2 weeks in advance to allow editorial pitching.",
    },
    {
      q: "Do I keep my masters and copyrights?",
      a: "Always. SoundXpand is a distributor, not a label. You own everything you upload. Leave anytime with a one-click takedown.",
    },
    {
      q: "How do royalty splits work?",
      a: "Add collaborators to any release with their share %. When royalties come in, they're automatically split and paid directly to each contributor's wallet.",
    },
    {
      q: "Which countries can withdraw?",
      a: "Anywhere. We pay out in 30+ currencies via bank transfer, PayPal or Wise. No minimum threshold.",
    },
  ];
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="chip-mono w-max">FAQ</div>
          <h2 className="mt-6 font-display text-4xl font-700 leading-[1.05] tracking-tight sm:text-5xl">
            Questions,{" "}
            <span className="italic text-muted-foreground">answered.</span>
          </h2>
          <p className="mt-6 max-w-sm text-muted-foreground">
            Still curious? Ping our team — real humans, no bots, avg reply 12 min.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--amber)] hover:gap-3 transition-all"
          >
            Talk to our team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {faqs.map((f, i) => (
            <details key={i} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="font-display text-xl font-600 tracking-tight sm:text-2xl">
                  {f.q}
                </span>
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--hairline-strong)] text-[var(--amber)] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────  CTA  ────────────────────────────── */

function CtaSection() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_18%,transparent)_0%,transparent_65%)] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <Clock className="mx-auto h-8 w-8 text-[var(--amber)]" />
        <h2 className="mt-8 font-display text-5xl font-800 leading-[0.95] tracking-[-0.03em] sm:text-7xl">
          Your next release <br />
          is <span className="italic bg-gradient-to-br from-[var(--amber-glow)] to-[var(--amber-deep)] bg-clip-text text-transparent">one upload</span> away.
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
          Join thousands of artists distributing globally with SoundXpand.
          Free, fast, and forever yours.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/auth"
            className="btn-tactile group inline-flex items-center gap-2 rounded-full bg-[var(--amber)] px-7 py-4 text-base font-semibold text-[var(--ink)]"
          >
            Create free account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline-strong)] px-7 py-4 text-base font-medium text-foreground/90 hover:border-[var(--amber)]/60 hover:text-[var(--amber)] transition"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  SHARED HEADER  ───────────────────────── */

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="chip-mono mx-auto">{eyebrow}</div>
      <h2 className="mt-6 font-display text-4xl font-700 leading-[1.05] tracking-tight sm:text-6xl">
        {title}
      </h2>
    </motion.div>
  );
}
