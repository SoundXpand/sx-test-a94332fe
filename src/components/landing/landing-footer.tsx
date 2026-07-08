import { Twitter, Instagram, Youtube, Github, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";

type FooterLink = { label: string; href: string; external?: boolean };

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "Monetization",
    links: [
      { label: "Music Publishing", href: "/publishing" },
      { label: "YouTube Content ID", href: "/youtube-content-id" },
      { label: "Sync Licensing", href: "/sync" },
      { label: "YouTube CMS & AOC", href: "/youtube-cms" },
      { label: "Distribution", href: "/free-music-distribution" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "AI Tools", href: "/ai-tools" },
      { label: "Music Promotion", href: "/music-promotion" },
      { label: "Advanced Insights", href: "/advanced-insights" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "https://blog.soundxpand.com", external: true },
      { label: "Contact", href: "/contact" },
      { label: "Pledges", href: "/pledges" },
      { label: "Press & Brand", href: "/brand-assets" },
      { label: "All features", href: "/more-features" },
      { label: "Platforms", href: "/digital-music-platforms" },
      { label: "Help center", href: "/legal/pages" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "DMCA", href: "/legal/dmca" },
      { label: "Refund", href: "/legal/refund" },
      { label: "Editorial", href: "/legal/editorial" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-[color:var(--ink)]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--amber-glow)_10%,transparent),transparent_70%)] blur-3xl" />

      {/* Oversized wordmark */}
      <div className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <div className="pointer-events-none select-none font-display text-[clamp(80px,18vw,220px)] font-bold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_color-mix(in_oklch,var(--foreground)_18%,transparent)]">
          SoundXpand
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <BrandLogo height={34} />
            <p className="mt-5 max-w-xs text-[13px] font-light leading-relaxed text-muted-foreground">
              The next-generation music distribution platform for independent artists,
              producers and labels.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted-foreground transition-all hover:border-[var(--amber)]/40 hover:text-[var(--amber)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--amber)]/80">
                {g.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noreferrer" : undefined}
                      className="group inline-flex items-center gap-1 text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                      {l.external && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SoundXpand. All rights reserved.
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Built for artists who ship.
          </p>
        </div>
      </div>
    </footer>
  );
}
