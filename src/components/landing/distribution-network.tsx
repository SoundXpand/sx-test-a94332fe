import { motion } from "framer-motion";

const platforms = [
  { label: "Spotify", color: "var(--brand-green)" },
  { label: "Apple Music", color: "var(--brand-pink)" },
  { label: "YouTube", color: "#ef4444" },
  { label: "TikTok", color: "var(--brand-cyan)" },
  { label: "Amazon", color: "var(--brand-orange)" },
  { label: "Instagram", color: "var(--brand-pink)" },
  { label: "Deezer", color: "var(--brand-violet)" },
  { label: "Tidal", color: "#60a5fa" },
  { label: "JioSaavn", color: "var(--brand-orange)" },
  { label: "Boomplay", color: "var(--brand-green)" },
  { label: "Wynk", color: "var(--brand-pink)" },
  { label: "Facebook", color: "#60a5fa" },
];

export function DistributionNetwork() {
  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const r = 210;

  return (
    <div className="relative mx-auto" style={{ maxWidth: size }}>
      <div className="relative aspect-square w-full">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <radialGradient id="core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--brand-violet)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--brand-violet-deep)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--brand-violet)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--brand-violet)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--brand-pink)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Connection lines */}
          {platforms.map((_, i) => {
            const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="url(#line)"
                strokeWidth="1"
              />
            );
          })}

          {/* Orbit rings */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--hairline)" />
          <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="var(--hairline)" strokeDasharray="2 6" />
          <circle cx={cx} cy={cy} r={r * 0.35} fill="none" stroke="var(--hairline)" strokeDasharray="2 6" />

          {/* Core glow */}
          <circle cx={cx} cy={cy} r="100" fill="url(#core)" />
        </svg>

        {/* Center node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white shadow-[0_0_40px_-4px_var(--brand-violet-deep)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse-ring" />
          </div>
        </div>

        {/* Orbiting platform chips */}
        {platforms.map((p, i) => {
          const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + (Math.cos(angle) * r) / (size / 100);
          const y = 50 + (Math.sin(angle) * r) / (size / 100);
          return (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.04, duration: 0.5 }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-medium">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                />
                {p.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
