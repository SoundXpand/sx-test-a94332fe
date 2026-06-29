import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Item = {
  id: string;
  title: string;
  artist_name?: string | null;
  release_date?: string | null;
  slug?: string | null;
};

// 6 unique animated "Apple Music"-style textures. Pure CSS gradients — cheap on GPU.
// We cycle by (index % textures.length) so chains of 3 are always unique,
// and the next 3 use the next 3 textures — repeating up to 30 items.
const textures: { bg: string; anim: string }[] = [
  {
    bg: "radial-gradient(120% 90% at 20% 20%, #ff6a3d 0%, #d83a7a 45%, #5b1e8a 100%)",
    anim: "tex-pan-a",
  },
  {
    bg: "conic-gradient(from 120deg at 60% 40%, #00c2ff, #7a5cff, #ff4ecd, #00c2ff)",
    anim: "tex-spin",
  },
  {
    bg: "linear-gradient(135deg, #1d976c 0%, #93f9b9 100%), radial-gradient(circle at 70% 30%, #fffbe6 0%, transparent 60%)",
    anim: "tex-pan-b",
  },
  {
    bg: "radial-gradient(140% 100% at 80% 80%, #ffb347 0%, #ff5e62 50%, #2a1b3d 100%)",
    anim: "tex-pulse",
  },
  {
    bg: "linear-gradient(120deg, #0f2027 0%, #2c5364 50%, #00d4ff 100%)",
    anim: "tex-pan-a",
  },
  {
    bg: "conic-gradient(from 0deg at 40% 60%, #f7971e, #ffd200, #21d4fd, #b721ff, #f7971e)",
    anim: "tex-spin-slow",
  },
];

function TextureTile({ item, rank }: { item: Item; rank: number }) {
  const t = textures[rank % textures.length];
  return (
    <Card className="relative h-full overflow-hidden border-border bg-card/60 p-0 group">
      <div
        aria-hidden
        className="absolute inset-0 will-change-transform"
        style={{
          background: t.bg,
          backgroundSize: "180% 180%",
          animation: `${t.anim} 14s ease-in-out infinite`,
          filter: "saturate(1.05)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.5) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,.4) 0%, transparent 40%)",
        }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
            #{rank + 1}
          </span>
          {item.slug ? (
            <a
              href={`/l/${item.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-black/40 p-1.5 opacity-80 hover:opacity-100 backdrop-blur-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
        <div>
          <div className="font-display text-base font-semibold truncate drop-shadow">
            {item.title}
          </div>
          <div className="text-xs opacity-90 truncate">{item.artist_name || "Unknown"}</div>
          {item.slug ? (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="mt-3 h-7 w-full bg-white/90 text-black hover:bg-white"
            >
              <a href={`/l/${item.slug}`} target="_blank" rel="noreferrer">
                Smart link
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function ChartsCarousel({ items }: { items: Item[] }) {
  const list = items.slice(0, 30);
  const [start, setStart] = useState(0);
  const visible = 3;

  useEffect(() => {
    if (list.length <= visible) return;
    const id = setInterval(() => setStart((s) => (s + 1) % list.length), 2000);
    return () => clearInterval(id);
  }, [list.length]);

  if (list.length === 0) return null;

  // Render visible + 1 (the incoming card), translate strip leftward by 1 slot then snap.
  const slots = Array.from({ length: Math.min(visible + 1, list.length) }, (_, i) => {
    const idx = (start + i) % list.length;
    return { idx, item: list[idx] };
  });

  return (
    <>
      <style>{`
        @keyframes tex-pan-a {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes tex-pan-b {
          0%,100% { background-position: 100% 0%; }
          50% { background-position: 0% 100%; }
        }
        @keyframes tex-spin {
          0% { transform: rotate(0deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }
        @keyframes tex-spin-slow {
          0% { transform: rotate(0deg) scale(1.15); }
          100% { transform: rotate(-360deg) scale(1.15); }
        }
        @keyframes tex-pulse {
          0%,100% { background-position: 50% 50%; transform: scale(1); }
          50% { background-position: 60% 40%; transform: scale(1.05); }
        }
        @keyframes carousel-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 4)); }
        }
      `}</style>
      <div className="relative overflow-hidden">
        <div
          key={start}
          className="flex gap-3"
          style={{
            width: `calc((100% + 0.75rem) * ${slots.length} / 3)`,
            animation: "carousel-slide 2s ease-in-out forwards",
          }}
        >
          {slots.map(({ idx, item }) => (
            <div
              key={`${item.id}-${idx}`}
              className="shrink-0"
              style={{ width: `calc((100% - ${(slots.length - 1) * 0.75}rem) / ${slots.length})`, aspectRatio: "1 / 1" }}
            >
              <TextureTile item={item} rank={idx} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
