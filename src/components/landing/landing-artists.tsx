import { motion } from "framer-motion";
import { Play } from "lucide-react";

const releases = [
  { artist: "Nova Sterling", title: "Midnight Frequencies", streams: "12.4M", hue: 295 },
  { artist: "Kai Aurora", title: "Velvet Static", streams: "8.7M", hue: 330 },
  { artist: "Lior Hex", title: "Paper Skies", streams: "5.2M", hue: 210 },
  { artist: "Mira Lune", title: "Glass Cathedral", streams: "3.9M", hue: 55 },
  { artist: "Echo & Sand", title: "Forever, Probably", streams: "2.4M", hue: 160 },
  { artist: "Yuki Drift", title: "Lavender Codes", streams: "1.8M", hue: 350 },
];

export function LandingArtists() {
  return (
    <section className="relative bg-card py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-cyan)]">
              Artist success
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              The next wave is{" "}
              <span className="text-gradient-brand">already releasing</span> on SoundXpand.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-light text-muted-foreground">
            From bedroom producers to indie labels — over 42,000 artists trust SoundXpand to ship their music to the world.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {releases.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative"
            >
              <div
                className="relative aspect-square overflow-hidden rounded-2xl border border-hairline"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.22 ${r.hue}), oklch(0.30 0.18 ${(r.hue + 60) % 360}))`,
                }}
              >
                <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
                  backgroundImage: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, black 0%, transparent 40%)",
                }} />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-black opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  <div className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {r.streams}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-1">
                <div className="font-display text-sm font-semibold tracking-tight truncate">{r.title}</div>
                <div className="text-xs font-light text-muted-foreground truncate">{r.artist}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
