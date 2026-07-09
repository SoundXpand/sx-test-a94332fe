import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DistributionNetwork } from "./distribution-network";

const platformDots: { name: string; slug: string }[] = [
  { name: "Spotify", slug: "spotify" },
  { name: "Apple Music", slug: "apple" },
  { name: "YouTube", slug: "youtube" },
  { name: "TikTok", slug: "tiktok" },
  { name: "Tidal", slug: "tidal" },
  { name: "Deezer", slug: "deezer" },
];

export function LandingHero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Single warm glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_18%,transparent)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-deep)_14%,transparent)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          {/* Left: editorial headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chip-mono"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber)]" />
              Music distribution · Reimagined
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="display-xl mt-7 text-[clamp(44px,7.2vw,92px)] [text-wrap:balance]"
            >
              The record label
              <br />
              in your <span className="text-gradient-amber italic font-medium">pocket</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="mt-7 max-w-lg text-[17px] font-light leading-relaxed text-muted-foreground"
            >
              Ship your music to Spotify, Apple, YouTube, TikTok and 150+ platforms.
              Keep 100% of your rights. Collect royalties on autopilot.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/auth"
                hash="login"
                className="btn-tactile btn-tactile-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-[14px] font-semibold"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="btn-ghost-ink btn-ghost-ink-hover inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-medium"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Watch demo · 90s
              </a>
            </motion.div>

            {/* Platform inline strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-6"
            >
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Live on
              </span>
              {platformDots.map((p) => (
                <span key={p} className="text-[13px] font-medium text-muted-foreground">
                  {p}
                </span>
              ))}
              <span className="text-[13px] font-medium text-[var(--amber)]">+150 more</span>
            </motion.div>
          </div>

          {/* Right: layered floating UI */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative mx-auto aspect-square w-full max-w-[520px]"
          >
            {/* soft warm halo */}
            <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_18%,transparent),transparent_70%)] blur-2xl" />

            {/* Dashboard preview card */}
            <div className="absolute left-0 top-6 w-[74%] rotate-[-4deg] overflow-hidden rounded-3xl border border-hairline-strong bg-[color:var(--charcoal)] shadow-2xl backdrop-blur-xl animate-float-y">
              <div className="flex items-center gap-1.5 border-b border-hairline px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
                  Dashboard · Streams
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold tracking-tight">
                    2,481,392
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--amber)]">
                    <TrendingUp className="h-3 w-3" /> +18.4%
                  </span>
                </div>
                <svg viewBox="0 0 200 60" className="mt-3 h-16 w-full">
                  <defs>
                    <linearGradient id="hf" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,45 L20,40 L40,42 L60,30 L80,32 L100,20 L120,25 L140,15 L160,18 L180,8 L200,12 L200,60 L0,60 Z"
                    fill="url(#hf)"
                  />
                  <path
                    d="M0,45 L20,40 L40,42 L60,30 L80,32 L100,20 L120,25 L140,15 L160,18 L180,8 L200,12"
                    fill="none"
                    stroke="var(--amber)"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  {["Spotify", "Apple", "YouTube"].map((p, i) => (
                    <div key={p} className="rounded-lg border border-hairline bg-black/20 px-2 py-1.5">
                      <div className="text-muted-foreground/70">{p}</div>
                      <div className="font-display text-xs font-semibold text-foreground">
                        {["1.2M", "612K", "489K"][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Artwork tile */}
            <div
              className="absolute right-0 top-0 h-[42%] w-[46%] rotate-[6deg] overflow-hidden rounded-3xl border border-hairline-strong shadow-2xl animate-float-y"
              style={{ animationDelay: "-2s" }}
            >
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3">
                <div className="text-[10px] uppercase tracking-widest text-white/70">Now delivering</div>
                <div className="font-display text-sm font-bold text-white">Midnight Frequencies</div>
                <div className="text-[10px] text-white/60">Nova Sterling · Single</div>
              </div>
              <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                <Play className="h-3 w-3 fill-current" />
              </div>
            </div>

            {/* Royalty chip */}
            <div
              className="absolute bottom-8 right-8 rotate-[-3deg] rounded-2xl border border-hairline-strong bg-[color:var(--charcoal)]/90 px-4 py-3 shadow-2xl backdrop-blur-xl animate-float-y"
              style={{ animationDelay: "-4s" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--amber)]/15">
                  <Sparkles className="h-4 w-4 text-[var(--amber)]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    Royalties paid
                  </div>
                  <div className="font-display text-base font-bold">$4,281.20</div>
                </div>
              </div>
            </div>

            {/* Distribution mini-badge */}
            <div className="absolute bottom-0 left-8 rounded-full border border-hairline-strong bg-[color:var(--charcoal)]/90 px-4 py-2 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-[var(--amber)]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--amber)]" />
                </span>
                Delivering · 152 stores
              </div>
            </div>
          </motion.div>
        </div>

        {/* Distribution network below */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 sm:mt-32"
        >
          <div className="mb-8 text-center">
            <div className="eyebrow">One upload · Everywhere</div>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              A single source of truth for your entire catalogue
            </h3>
          </div>
          <DistributionNetwork />
        </motion.div>
      </div>
    </section>
  );
}
