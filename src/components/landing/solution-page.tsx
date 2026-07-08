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
  /** kept for API compat, no longer changes color */
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

export function SolutionPage({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroImageAlt,
  primaryCta = { label: "Start free", to: "/auth" },
  secondaryCta,
  stats,
  sections,
  features,
  faq,
  ctaTitle = "Ready to grow with SoundXpand?",
  ctaSubtitle = "Join thousands of artists building sustainable music careers.",
}: SolutionPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse 65% 55% at 50% 40%, black 30%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-glow)_15%,transparent),transparent_70%)] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chip-mono"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber)]" />
              {eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="display-xl mt-6 text-[clamp(36px,6vw,80px)] [text-wrap:balance]"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-xl text-[16px] font-light leading-relaxed text-muted-foreground sm:text-lg"
            >
              {subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              {primaryCta.to ? (
                <Link
                  to={primaryCta.to as never}
                  className="btn-tactile btn-tactile-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-[14px] font-semibold"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={primaryCta.href}
                  className="btn-tactile btn-tactile-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-display text-[14px] font-semibold"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              {secondaryCta &&
                (secondaryCta.to ? (
                  <Link
                    to={secondaryCta.to as never}
                    className="btn-ghost-ink btn-ghost-ink-hover inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-display text-[14px] font-medium"
                  >
                    {secondaryCta.label}
                  </Link>
                ) : (
                  <a
                    href={secondaryCta.href}
                    className="btn-ghost-ink btn-ghost-ink-hover inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-display text-[14px] font-medium"
                  >
                    {secondaryCta.label}
                  </a>
                ))}
            </motion.div>
            {stats && (
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-hairline pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-bold sm:text-3xl text-gradient-amber">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {s.label}
                    </div>
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
            <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_18%,transparent),transparent_70%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-hairline-strong bg-[color:var(--charcoal)]">
              <img
                src={heroImage}
                alt={heroImageAlt}
                className="aspect-[4/3] h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--ink)]/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      {features && features.length > 0 && (
        <section className="border-t border-hairline bg-[color:var(--charcoal)] py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <div className="eyebrow">Capabilities</div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] sm:text-5xl">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-[15px] font-light text-muted-foreground">
                A complete toolkit built for independent artists, producers and labels.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="card-lift group rounded-2xl border border-hairline bg-background p-7"
                >
                  <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-surface-1 text-[var(--amber)]">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-base font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[13px] font-light leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALTERNATING SECTIONS */}
      <section className="border-t border-hairline py-24">
        <div className="mx-auto max-w-7xl space-y-28 px-5 sm:px-8">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`grid gap-12 lg:grid-cols-2 lg:items-center ${
                s.reverse ?? i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                {s.eyebrow && <div className="eyebrow">{s.eyebrow}</div>}
                <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {s.title}
                </h2>
                <p className="mt-5 text-[15px] font-light leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {s.bullets && (
                  <ul className="mt-7 space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
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
                  <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_12%,transparent),transparent_70%)] blur-2xl" />
                  <div className="card-lift group relative overflow-hidden rounded-2xl border border-hairline">
                    <img
                      src={s.image}
                      alt={s.imageAlt ?? ""}
                      className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <section className="border-t border-hairline bg-[color:var(--charcoal)] py-24">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="text-center">
              <div className="eyebrow">FAQ</div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] sm:text-5xl">
                Frequently asked
              </h2>
            </div>
            <div className="mt-12 overflow-hidden rounded-2xl border border-hairline bg-background/60">
              {faq.map((f) => (
                <details key={f.q} className="group border-b border-hairline px-6 py-5 last:border-b-0 open:bg-surface-1/40">
                  <summary className="flex cursor-pointer items-center justify-between font-display text-base font-semibold list-none">
                    {f.q}
                    <span className="text-[var(--amber)] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — cream inversion */}
      <section className="border-t border-hairline">
        <div className="relative overflow-hidden bg-[color:var(--cream)] py-24 text-[color:var(--ink)]">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-deep)_18%,transparent),transparent_70%)] blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
            <h2 className="font-display text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
              {ctaTitle}
            </h2>
            <p className="mt-4 text-[color:var(--ink)]/70">{ctaSubtitle}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-3.5 font-display text-sm font-semibold text-[color:var(--cream)] transition-transform hover:-translate-y-0.5 shadow-[0_20px_50px_-15px_color-mix(in_oklch,var(--ink)_60%,transparent)]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)]/15 bg-white/60 px-6 py-3.5 font-display text-sm font-semibold text-[color:var(--ink)] backdrop-blur"
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
