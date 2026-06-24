import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_40%,transparent)_0%,transparent_70%)] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">
          Your sound, <span className="text-gradient-brand">everywhere</span>.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base font-light text-muted-foreground sm:text-lg">
          Join 42,000+ artists shipping music to the world with SoundXpand.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            to="/auth"
            hash="login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-violet)] px-7 py-3.5 font-display text-[15px] font-semibold text-white shadow-[0_0_40px_-8px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
          >
            Start free today <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
