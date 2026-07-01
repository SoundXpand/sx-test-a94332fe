import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { LandingNav } from "./landing-nav";
import { LandingFooter } from "./landing-footer";
import { ContactUsBadge } from "./contact-us-badge";

export interface SolutionSection {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
}

export interface SolutionStat {
  value: string;
  label: string;
}

export interface SolutionFAQ {
  q: string;
  a: string;
}

interface SolutionPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  accent?: "violet" | "pink" | "cyan" | "green" | "orange";
  primaryCta?: { label: string; to?: string; href?: string };
  secondaryCta?: { label: string; to?: string; href?: string };
  stats?: SolutionStat[];
  sections: SolutionSection[];
  features?: { title: string; description: string; icon?: ReactNode }[];
  faq?: SolutionFAQ[];
  ctaTitle?: string;
  ctaSubtitle?: string;
}

const accentMap = {
  violet: {
    from: "var(--brand-violet-deep)",
    to: "var(--brand-violet)",
    glow: "var(--brand-violet-deep)",
  },
  pink: {
    from: "var(--brand-pink)",
    to: "var(--brand-violet)",
    glow: "var(--brand-pink)",
  },
  cyan: {
    from: "var(--brand-cyan)",
    to: "var(--brand-violet)",
    glow: "var(--brand-cyan)",
  },
  green: {
    from: "var(--brand-green)",
    to: "var(--brand-cyan)",
    glow: "var(--brand-green)",
  },
  orange: {
    from: "var(--brand-orange)",
    to: "var(--brand-pink)",
    glow: "var(--brand-orange)",
  },
};

export function SolutionPage({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroImageAlt,
  accent = "violet",
  primaryCta = { label: "Start free", to: "/auth" },
  secondaryCta,
  stats,
  sections,
  features,
  faq,
  ctaTitle = "Ready to grow with SoundXpand?",
  ctaSubtitle = "Join thousands of artists building sustainable music careers.",
}: SolutionPageProps) {
  const a = accentMap[accent];
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, color-mix(in oklch, ${a.glow} 45%, transparent) 0%, transparent 70%)` }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground backdrop-blur"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
              />
              {eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-xl text-base font-light text-muted-foreground sm:text-lg"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {primaryCta.to ? (
                <Link
                  to={primaryCta.to as never}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold text-white shadow-[0_0_28px_-4px] transition-transform hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                    boxShadow: `0 0 28px -4px ${a.glow}`,
                  }}
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                    boxShadow: `0 0 28px -4px ${a.glow}`,
                  }}
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              {secondaryCta &&
                (secondaryCta.to ? (
                  <Link
                    to={secondaryCta.to as never}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-5 py-2.5 font-display text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface-1"
                  >
                    {secondaryCta.label}
                  </Link>
                ) : (
                  <a
                    href={secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-5 py-2.5 font-display text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface-1"
                  >
                    {secondaryCta.label}
                  </a>
                ))}
            </motion.div>
            {stats && (
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-hairline pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div
                      className="font-display text-2xl font-bold sm:text-3xl"
                      style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    >
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div
              className="absolute -inset-8 rounded-[3rem] opacity-40 blur-2xl"
              style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
            />
            <div className="relative overflow-hidden rounded-3xl border border-hairline">
              <img src={heroImage} alt={heroImageAlt} className="h-full w-full object-cover aspect-[4/3]" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      {features && features.length > 0 && (
        <section className="border-t border-hairline bg-surface-1/30 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-3 text-muted-foreground">
                A complete toolkit built for independent artists, producers and labels.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group rounded-2xl border border-hairline bg-background/60 p-6 backdrop-blur transition-colors hover:border-hairline-strong"
                >
                  <div
                    className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALTERNATING SECTIONS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl space-y-24 px-5 sm:px-8">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid gap-10 lg:grid-cols-2 lg:items-center ${s.reverse ?? i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div>
                {s.eyebrow && (
                  <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: a.glow }}>
                    {s.eyebrow}
                  </div>
                )}
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{s.title}</h2>
                <p className="mt-4 text-base font-light text-muted-foreground">{s.body}</p>
                {s.bullets && (
                  <ul className="mt-6 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span
                          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                          style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {s.image && (
                <div className="relative">
                  <div
                    className="absolute -inset-6 rounded-[2rem] opacity-25 blur-2xl"
                    style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-hairline">
                    <img src={s.image} alt={s.imageAlt ?? ""} className="h-full w-full object-cover aspect-[4/3]" loading="lazy" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <section className="border-t border-hairline bg-surface-1/30 py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked</h2>
            </div>
            <div className="mt-10 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-background/60">
              {faq.map((f) => (
                <details key={f.q} className="group px-6 py-5 open:bg-surface-1/40">
                  <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold list-none">
                    {f.q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm font-light text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-hairline p-10 text-center sm:p-16"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklch, ${a.from} 20%, transparent), color-mix(in oklch, ${a.to} 15%, transparent))`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse at center, color-mix(in oklch, ${a.glow} 25%, transparent), transparent 70%)` }}
            />
            <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">{ctaTitle}</h2>
            <p className="relative mt-3 text-muted-foreground">{ctaSubtitle}</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})`, boxShadow: `0 0 32px -4px ${a.glow}` }}
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background/60 px-6 py-3 font-display text-sm font-semibold text-foreground backdrop-blur"
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
