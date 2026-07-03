import { Twitter, Instagram, Youtube, Github } from "lucide-react";
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
    <footer className="relative border-t border-hairline bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandLogo height={36} />
            </div>
            <p className="mt-4 max-w-xs text-sm font-light text-muted-foreground">
              The next-generation music distribution platform for independent artists, producers and labels.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {g.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noreferrer" : undefined}
                      className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-hairline pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SoundXpand. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for artists who ship.</p>
        </div>
      </div>
    </footer>
  );
}
