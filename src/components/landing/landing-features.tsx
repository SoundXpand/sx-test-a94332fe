import { Globe, Zap, Wallet, BarChart3, Shield, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function LandingFeatures() {
  return (
    <section id="features" className="relative border-t border-hairline bg-[color:var(--charcoal)] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--amber)]/25 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="eyebrow">Platform</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
              Everything you need.
              <br />
              <span className="italic font-medium text-muted-foreground">Nothing you don't.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] font-light text-muted-foreground">
            A complete distribution stack — engineered for the tempo of modern releases and the
            precision independent artists demand.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
          {/* Feature 1 — hero tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="card-lift relative col-span-6 overflow-hidden rounded-3xl border border-hairline bg-background p-8 md:col-span-4 md:row-span-2 md:p-12"
          >
            <div className="pointer-events-none absolute -top-40 -right-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_20%,transparent),transparent_70%)] blur-2xl" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <Globe className="h-6 w-6 text-[var(--amber)]" />
                <h3 className="mt-6 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                  Global distribution to <span className="text-gradient-amber">150+ stores</span>
                </h3>
                <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-muted-foreground">
                  Deliver to Spotify, Apple, YouTube, TikTok, Instagram, Deezer, Tidal, JioSaavn,
                  Boomplay and more — from a single upload. Automated QC, metadata validation and
                  instant takedowns whenever you need them.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Spotify", "Apple Music", "YouTube", "TikTok", "Instagram", "Deezer", "Tidal", "JioSaavn", "Boomplay", "Amazon"].map(
                  (p) => (
                    <span
                      key={p}
                      className="rounded-full border border-hairline bg-surface-1 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {p}
                    </span>
                  ),
                )}
                <span className="rounded-full border border-[var(--amber)]/30 bg-[var(--amber)]/10 px-3 py-1 text-[11px] font-medium text-[var(--amber)]">
                  +140 more
                </span>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 — top right */}
          <FeatureCard
            className="col-span-6 md:col-span-2"
            icon={<Zap className="h-5 w-5" />}
            title="Fast delivery"
            desc="Live in stores in 24–72h. Automated validation removes friction."
            visual={
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">24</span>
                <span className="text-sm text-muted-foreground">–72h</span>
              </div>
            }
          />

          {/* Feature 3 */}
          <FeatureCard
            className="col-span-6 md:col-span-2"
            icon={<Wallet className="h-5 w-5" />}
            title="Royalty collection"
            desc="Automated splits with collaborators. Payout in any currency."
            visual={
              <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-1 px-3 py-2 text-xs">
                <div className="h-6 w-6 rounded-full bg-[var(--amber)]/20" />
                <div className="h-6 w-6 -ml-3 rounded-full bg-bone/40" />
                <div className="h-6 w-6 -ml-3 rounded-full bg-amber-deep/60" />
                <span className="ml-1 text-muted-foreground">3-way split</span>
              </div>
            }
          />

          {/* Feature 4 */}
          <FeatureCard
            className="col-span-6 md:col-span-2"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Advanced analytics"
            desc="Streams, revenue and audience broken down by store, daily."
            visual={
              <svg viewBox="0 0 100 32" className="h-8 w-full">
                <path
                  d="M0,26 L10,22 L20,24 L30,18 L40,20 L50,12 L60,14 L70,8 L80,10 L90,4 L100,6"
                  fill="none"
                  stroke="var(--amber)"
                  strokeWidth="1.5"
                />
              </svg>
            }
          />

          {/* Feature 5 */}
          <FeatureCard
            className="col-span-6 md:col-span-2"
            icon={<Shield className="h-5 w-5" />}
            title="Rights protection"
            desc="Content ID, copyright monitoring, dispute tooling — 100% yours."
          />

          {/* Feature 6 */}
          <FeatureCard
            className="col-span-6 md:col-span-2"
            icon={<Sparkles className="h-5 w-5" />}
            title="AI insights"
            desc="Genre suggestions and audience matching from our distribution graph."
            badge="New"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  visual,
  badge,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  visual?: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className={`card-lift group relative overflow-hidden rounded-3xl border border-hairline bg-background p-7 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-1 text-[var(--amber)]">
          {icon}
        </div>
        {badge && (
          <span className="rounded-full border border-[var(--amber)]/40 bg-[var(--amber)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--amber)]">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-6 font-display text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-[13px] font-light leading-relaxed text-muted-foreground">{desc}</p>
      {visual && <div className="mt-5">{visual}</div>}
      <ArrowUpRight className="absolute right-6 top-6 h-4 w-4 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 group-hover:text-[var(--amber)]" />
    </motion.div>
  );
}
