import { useEffect, useRef, useState } from "react";

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

function useCountUp(target: number, durationMs = 1600, start = true) {
  const [val, setVal] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return val;
}

function StatItem({ value, prefix = "", suffix = "", label, decimals = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const v = useCountUp(value, 1600, inView);
  const formatted =
    decimals > 0
      ? v.toFixed(decimals)
      : Math.round(v).toLocaleString("en-US");

  return (
    <div ref={ref} className="px-6 py-10 sm:px-10 sm:py-12">
      <div className="font-display text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
        {prefix}
        <span className="text-gradient-brand">{formatted}</span>
        {suffix}
      </div>
      <div className="mt-2 text-sm font-light text-muted-foreground">{label}</div>
    </div>
  );
}

export function LandingStats() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-hairline bg-surface-1 backdrop-blur-xl md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--hairline)]">
          <StatItem value={42000} suffix="+" label="Artists distributed" />
          <StatItem value={1.2} decimals={1} suffix="M" label="Tracks delivered" />
          <StatItem value={180} suffix="+" label="Countries reached" />
          <StatItem value={28} prefix="$" suffix="M" label="Royalties paid" />
        </div>
      </div>
    </section>
  );
}
