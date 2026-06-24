import { Globe, Zap, Wallet, BarChart3, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Globe,
    title: "Global distribution",
    desc: "Deliver to Spotify, Apple, YouTube, TikTok, Instagram, Deezer, Tidal, JioSaavn, Boomplay and 150+ stores in one click.",
    accent: "var(--brand-violet)",
  },
  {
    icon: Zap,
    title: "Fast delivery",
    desc: "Releases go live within days. Automated QC, metadata validation and instant takedowns when you need them.",
    accent: "var(--brand-orange)",
  },
  {
    icon: Wallet,
    title: "Royalty collection",
    desc: "Track earnings in real time, automate splits with collaborators, withdraw to your bank in any currency.",
    accent: "var(--brand-green)",
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    desc: "Streams, revenue, audience demographics and platform breakdowns updated daily across every release.",
    accent: "var(--brand-cyan)",
  },
  {
    icon: Shield,
    title: "Rights protection",
    desc: "Built-in Content ID, copyright monitoring and store-level dispute tooling — you keep 100% ownership.",
    accent: "var(--brand-pink)",
  },
  {
    icon: Sparkles,
    title: "AI release insights",
    desc: "Smart genre suggestions, release-day predictions and audience matching powered by our distribution graph.",
    accent: "var(--brand-violet)",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-violet)]">
            Features
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Everything you need to{" "}
            <span className="text-gradient-brand">grow your sound</span>.
          </h2>
          <p className="mt-5 text-base font-light text-muted-foreground">
            A complete distribution stack built for independent artists, producers and labels.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative bg-card p-8 transition-colors hover:bg-popover"
            >
              <span
                className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)`,
                }}
              />
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl text-white"
                style={{
                  background: `linear-gradient(135deg, ${f.accent}, color-mix(in oklch, ${f.accent} 60%, var(--brand-violet-deep)))`,
                  boxShadow: `0 0 24px -8px ${f.accent}`,
                }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-tight">{f.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
