import { motion } from "framer-motion";
import { Upload, Store, CalendarClock, TrendingUp } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Upload,
    title: "Upload your track",
    desc: "Drag in WAV or FLAC. We validate audio, artwork and metadata automatically — no more rejected releases.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
  },
  {
    n: "02",
    icon: Store,
    title: "Pick your stores",
    desc: "Choose from 150+ DSPs — Spotify, Apple, YouTube, TikTok, Tidal, JioSaavn and every regional store worth reaching.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
  },
  {
    n: "03",
    icon: CalendarClock,
    title: "Schedule the release",
    desc: "Set a global release date or stagger by region. Coordinate rollouts, pitches and press moments in one place.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  },
  {
    n: "04",
    icon: TrendingUp,
    title: "Earn & grow",
    desc: "Track streams, collect royalties and get AI-powered insights to grow your audience where it matters.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how" className="relative border-t border-hairline py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_10%,transparent)_0%,transparent_65%)] blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="eyebrow">How it works</div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
            From studio to streaming
            <br />
            in <span className="text-gradient-amber italic font-medium">minutes</span>.
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative mt-20">
          {/* vertical line */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-hairline-strong to-transparent md:left-1/2 md:-translate-x-1/2"
          />
          <div className="space-y-16 md:space-y-28">
            {steps.map((s, i) => {
              const flip = i % 2 === 1;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.6 }}
                  className="relative grid gap-8 md:grid-cols-2 md:items-center"
                >
                  {/* node */}
                  <div className="absolute left-6 top-4 z-10 -translate-x-1/2 md:left-1/2">
                    <div className="grid h-4 w-4 place-items-center rounded-full border border-hairline-strong bg-background">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] shadow-[0_0_12px_var(--amber)]" />
                    </div>
                  </div>

                  {/* text */}
                  <div className={`pl-14 md:pl-0 ${flip ? "md:order-2 md:pl-16" : "md:pr-16 md:text-right"}`}>
                    <div className={`inline-flex items-center gap-3 ${flip ? "" : "md:flex-row-reverse"}`}>
                      <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
                        Step {s.n}
                      </span>
                      <span className="h-px w-8 bg-hairline-strong" />
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[15px] font-light leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>

                  {/* visual */}
                  <div className={`pl-14 md:pl-0 ${flip ? "md:order-1 md:pr-16" : "md:pl-16"}`}>
                    <div className="card-lift group relative overflow-hidden rounded-2xl border border-hairline bg-[color:var(--charcoal)]">
                      <img
                        src={s.image}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--ink)]/70 via-transparent to-transparent" />
                      <div className="absolute inset-x-5 bottom-5 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--amber)] text-[var(--ink)]">
                          <s.icon className="h-4 w-4" />
                        </div>
                        <span className="font-display text-sm font-semibold text-foreground">
                          {s.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
