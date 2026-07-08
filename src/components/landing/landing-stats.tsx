import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  decimals?: number;
  caption?: string;
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

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function Big({ value, prefix = "", suffix = "", label, decimals = 0, caption }: StatProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const v = useCountUp(value, 1800, inView);
  const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
  return (
    <div ref={ref} className="relative">
      <div className="eyebrow">{caption ?? "Headline"}</div>
      <div className="mt-3 font-display text-[clamp(64px,10vw,144px)] font-bold leading-none tracking-[-0.05em]">
        {prefix}
        <span className="text-gradient-amber">{formatted}</span>
        {suffix}
      </div>
      <div className="mt-4 max-w-sm text-sm font-light text-muted-foreground">{label}</div>
    </div>
  );
}

function Small({ value, prefix = "", suffix = "", label, decimals = 0 }: StatProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const v = useCountUp(value, 1600, inView);
  const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
  return (
    <div ref={ref} className="border-t border-hairline py-6 first:border-t-0 sm:border-l sm:border-t-0 sm:pl-8 sm:first:border-l-0 sm:first:pl-0">
      <div className="font-display text-4xl font-bold tracking-[-0.04em]">
        {prefix}
        <span className="text-foreground">{formatted}</span>
        {suffix}
      </div>
      <div className="mt-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
    </div>
  );
}

export function LandingStats() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-24 lg:items-end"
        >
          <Big
            value={42000}
            suffix="+"
            caption="Trusted worldwide"
            label="Artists, producers and labels ship their music through SoundXpand every month."
          />
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
            <Small value={1.2} decimals={1} suffix="M" label="Tracks delivered" />
            <Small value={180} suffix="+" label="Countries reached" />
            <Small value={28} prefix="$" suffix="M" label="Royalties paid" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
