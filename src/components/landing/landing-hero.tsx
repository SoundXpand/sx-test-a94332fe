import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";
import { DistributionNetwork } from "./distribution-network";

export function LandingHero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_55%,transparent)_0%,transparent_70%)] blur-3xl animate-orb" />
      <div className="pointer-events-none absolute -left-32 top-48 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-pink)_35%,transparent)_0%,transparent_70%)] blur-3xl animate-orb" />
      <div className="pointer-events-none absolute -right-32 top-32 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-cyan)_25%,transparent)_0%,transparent_70%)] blur-3xl animate-orb" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)]">
            <Sparkles className="h-3 w-3 text-white" />
          </span>
          New — AI-powered release insights
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-7 max-w-4xl font-display text-[clamp(34px,7vw,88px)] font-extrabold leading-[1.05] tracking-[-0.04em] [overflow-wrap:anywhere] [text-wrap:balance] hyphens-auto"
        >
          Distribute your music{" "}
          <span className="text-gradient-brand">everywhere</span> at once.
        </motion.h1>


        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-base font-light text-muted-foreground sm:text-lg"
        >
          Release to Spotify, Apple Music, YouTube Music, TikTok, Instagram and
          150+ platforms worldwide. Keep 100% of your rights — collect royalties on autopilot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Link
            to="/auth"
            hash="login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-violet)] px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_0_40px_-8px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            <Play className="h-4 w-4" /> Book demo
          </a>
        </motion.div>

        {/* Distribution network */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-16 sm:mt-20"
        >
          <DistributionNetwork />
        </motion.div>
      </div>
    </section>
  );
}
