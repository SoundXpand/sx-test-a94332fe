import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Upload your track",
    desc: "Drag in WAV or FLAC. We validate audio, artwork and metadata automatically.",
  },
  {
    n: "02",
    title: "Pick your stores",
    desc: "Choose from 150+ DSPs — Spotify, Apple, YouTube, TikTok, Tidal, JioSaavn and more.",
  },
  {
    n: "03",
    title: "Schedule release",
    desc: "Set a global release date or stagger by region. We handle the rest.",
  },
  {
    n: "04",
    title: "Earn & grow",
    desc: "Track streams, collect royalties and get AI-powered insights to grow your audience.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_25%,transparent)_0%,transparent_70%)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-pink)]">
            How it works
          </p>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            From studio to streaming{" "}
            <span className="text-gradient-brand">in minutes</span>.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-hairline bg-card p-6 transition-all hover:-translate-y-1 hover:border-hairline-strong"
            >
              <div className="font-display text-5xl font-extrabold text-foreground/10 transition-colors group-hover:text-gradient-brand">
                {s.n}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
