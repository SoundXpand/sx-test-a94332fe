import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden border-t border-hairline">
      {/* Inverted cream band — the single light break */}
      <div className="relative bg-[color:var(--cream)] py-28 text-[color:var(--ink)] sm:py-40">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.2 0.01 70) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2 0.01 70) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 80%)",
          }}
        />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-deep)_18%,transparent),transparent_70%)] blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)]/10 bg-white/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber-deep)]" />
            Free forever plan · No credit card
          </div>
          <h2 className="mt-8 font-display text-[clamp(40px,8vw,96px)] font-bold leading-[0.98] tracking-[-0.045em] [text-wrap:balance]">
            Your sound,
            <br />
            <span className="italic font-medium text-[color:var(--amber-deep)]">everywhere</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[15px] font-light text-[color:var(--ink)]/70 sm:text-base">
            Join 42,000+ artists shipping music to the world with SoundXpand.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              hash="login"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] px-7 py-3.5 font-display text-[14px] font-semibold text-[color:var(--cream)] transition-transform hover:-translate-y-0.5 shadow-[0_20px_50px_-15px_color-mix(in_oklch,var(--ink)_60%,transparent)]"
            >
              Start free today <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)]/15 bg-white/60 px-6 py-3.5 font-display text-[14px] font-semibold text-[color:var(--ink)] backdrop-blur transition-colors hover:bg-white"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
