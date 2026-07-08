import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const featured = {
  quote:
    "SoundXpand replaced our label ops. Delivery, royalties, splits — one dashboard, zero email chains. We shipped 40 releases last quarter.",
  name: "Nova Sterling",
  role: "Artist · 12.4M streams",
  image:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&q=80",
};

const testimonials = [
  {
    quote:
      "Went from CD Baby to SoundXpand and cut delivery time in half. The analytics alone are worth it.",
    name: "Kai Aurora",
    role: "Producer",
  },
  {
    quote:
      "Finally a distributor that treats independent labels like partners. Onboarding was a single call.",
    name: "Lior Hex",
    role: "Label owner",
  },
  {
    quote:
      "Splits with collaborators used to be a nightmare. Now they're automatic and paid on time.",
    name: "Mira Lune",
    role: "Songwriter",
  },
];

const marqueeArtists = [
  "Nova Sterling", "Kai Aurora", "Lior Hex", "Mira Lune", "Echo & Sand", "Yuki Drift",
  "Sable Frost", "Amara Kite", "Iris Vale", "Onyx Fold", "Rune Hollow", "Sol Marin",
];

export function LandingArtists() {
  return (
    <section className="relative border-t border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="eyebrow">Artist success</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
              The next wave is already
              <br />
              <span className="text-gradient-amber italic font-medium">releasing</span> on SoundXpand.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] font-light text-muted-foreground">
            42,000+ artists, producers and labels — from bedroom-first releases to catalog majors —
            trust us with their sound.
          </p>
        </div>

        {/* Featured quote — magazine layout */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:items-stretch">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-hairline bg-[color:var(--charcoal)] p-10 sm:p-14"
          >
            <Quote className="absolute right-8 top-8 h-16 w-16 text-[var(--amber)]/10" />
            <blockquote className="font-display text-2xl font-medium leading-[1.25] tracking-[-0.01em] text-foreground sm:text-3xl">
              "{featured.quote}"
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4 border-t border-hairline pt-6">
              <img
                src={featured.image}
                alt=""
                className="h-14 w-14 rounded-full border border-hairline-strong object-cover"
              />
              <div>
                <div className="font-display text-base font-bold">{featured.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {featured.role}
                </div>
              </div>
            </figcaption>
          </motion.figure>

          <div className="flex flex-col gap-4">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-lift flex-1 rounded-2xl border border-hairline bg-background p-6"
              >
                <blockquote className="text-[15px] font-light leading-relaxed text-foreground">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-display font-semibold text-foreground">{t.name}</span>
                  <span className="uppercase tracking-widest text-muted-foreground">{t.role}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div className="relative mt-20 overflow-hidden border-y border-hairline py-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max animate-marquee items-center gap-12">
            {[...marqueeArtists, ...marqueeArtists].map((a, i) => (
              <span
                key={i}
                className="font-display text-2xl font-bold tracking-tight text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
