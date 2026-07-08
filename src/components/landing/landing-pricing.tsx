import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Starter",
    price: "₹999",
    period: "/year",
    desc: "For solo artists releasing their first tracks.",
    features: ["Unlimited singles", "150+ stores", "85% royalties", "Basic analytics", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/year",
    desc: "For working artists shipping releases regularly.",
    features: [
      "Unlimited releases",
      "100% royalties",
      "Advanced analytics",
      "Custom release dates",
      "Splits & collaborators",
      "Priority support",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Label",
    price: "₹4,999",
    period: "/year",
    desc: "For labels managing multiple artists & catalogs.",
    features: [
      "Everything in Pro",
      "Multi-artist roster",
      "Team accounts & roles",
      "Label dashboard",
      "Dedicated success manager",
      "API access",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="relative border-t border-hairline bg-[color:var(--charcoal)] py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-glow)_10%,transparent),transparent_70%)] blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">Pricing</div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
            Simple pricing.
            <br />
            <span className="text-gradient-amber italic font-medium">Serious</span> results.
          </h2>
          <p className="mt-6 text-[15px] font-light text-muted-foreground">
            One flat yearly fee. No per-release charges. Keep 100% of your rights, forever.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={
                t.highlight
                  ? "card-lift relative overflow-hidden rounded-3xl border border-[var(--amber)]/40 bg-background p-8 shadow-[0_30px_80px_-30px_color-mix(in_oklch,var(--amber-deep)_50%,transparent)] md:-my-4 md:py-10"
                  : "card-lift relative overflow-hidden rounded-3xl border border-hairline bg-background p-8"
              }
            >
              {t.highlight && (
                <>
                  <div className="pointer-events-none absolute -top-40 left-1/2 h-[300px] w-[400px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-glow)_18%,transparent),transparent_70%)] blur-2xl" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--amber)] to-transparent" />
                  <div className="relative mb-4 inline-flex rounded-full bg-[var(--amber)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                    Most popular
                  </div>
                </>
              )}
              <h3 className="font-display text-xl font-bold tracking-tight">{t.name}</h3>
              <p className="mt-1.5 text-sm font-light text-muted-foreground">{t.desc}</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-[-0.05em]">
                  {t.price}
                </span>
                <span className="text-sm font-light text-muted-foreground">{t.period}</span>
              </div>

              <Link
                to="/auth"
                hash="login"
                className={
                  t.highlight
                    ? "btn-tactile btn-tactile-hover mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 font-display text-sm font-semibold"
                    : "btn-ghost-ink btn-ghost-ink-hover mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 font-display text-sm font-semibold"
                }
              >
                {t.cta}
              </Link>

              <div className="divider-hair mt-8" />

              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
