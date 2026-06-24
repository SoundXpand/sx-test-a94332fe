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
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-orange)]">
            Pricing
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Pricing that <span className="text-gradient-brand">scales with you</span>.
          </h2>
          <p className="mt-5 text-base font-light text-muted-foreground">
            One flat yearly fee. No per-release charges. Keep 100% of your rights.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={
                t.highlight
                  ? "relative overflow-hidden rounded-3xl p-px"
                  : "relative overflow-hidden rounded-3xl border border-hairline bg-card"
              }
              style={
                t.highlight
                  ? {
                      background:
                        "linear-gradient(135deg, var(--brand-violet), var(--brand-pink), var(--brand-orange))",
                    }
                  : undefined
              }
            >
              <div className={t.highlight ? "rounded-[calc(1.5rem-1px)] bg-card p-8" : "p-8"}>
                {t.highlight && (
                  <div className="mb-3 inline-flex rounded-full bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-pink)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Most popular
                  </div>
                )}
                <h3 className="font-display text-xl font-bold tracking-tight">{t.name}</h3>
                <p className="mt-1.5 text-sm font-light text-muted-foreground">{t.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold tracking-[-0.04em]">
                    {t.price}
                  </span>
                  <span className="text-sm font-light text-muted-foreground">{t.period}</span>
                </div>

                <Link
                  to="/"
                  hash="login"
                  className={
                    t.highlight
                      ? "mt-7 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-violet)] px-5 py-3 font-display text-sm font-semibold text-white shadow-[0_0_30px_-8px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
                      : "mt-7 inline-flex w-full items-center justify-center rounded-full border border-hairline-strong bg-surface-1 px-5 py-3 font-display text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
                  }
                >
                  {t.cta}
                </Link>

                <ul className="mt-8 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-light text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-green)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
