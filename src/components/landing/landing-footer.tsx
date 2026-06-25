import { Twitter, Instagram, Youtube, Github } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";

const groups = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Distribution", "Analytics", "Royalties"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help center", "Knowledge base", "Status", "API docs", "Changelog"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Cookies", "DMCA", "Acceptable use"],
  },
];

export function LandingFooter() {
  return (
    <footer className="relative border-t border-hairline bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandLogo height={28} />
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
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm font-light text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
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
