import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/branding/brand-logo";

type NavItem =
  | { label: string; href: string; external?: boolean }
  | { label: string; to: string }
  | { label: string; menu: { label: string; description: string; to: string }[] };

const monetization = [
  { label: "Music Publishing", description: "Collect global publishing royalties", to: "/publishing" },
  { label: "YouTube Content ID", description: "Monetize every use of your music on YouTube", to: "/youtube-content-id" },
  { label: "Sync Licensing", description: "Get your music in film, TV, ads and games", to: "/sync" },
  { label: "YouTube CMS & AOC", description: "Full CMS access and Art Track ownership", to: "/youtube-cms" },
];

const build = [
  { label: "AI Tools", description: "Smart mastering, tagging and artwork", to: "/ai-tools" },
  { label: "Music Promotion", description: "Playlist pitching, ads and PR", to: "/music-promotion" },
  { label: "Advanced Insights", description: "Deep analytics on fans and revenue", to: "/advanced-insights" },
];

const items: NavItem[] = [
  { label: "Monetization", menu: monetization },
  { label: "Build", menu: build },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "https://blog.soundxpand.com", external: true },
  { label: "Contact", to: "/contact" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-hairline bg-background/75 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandLogo height={34} />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {items.map((item) => {
            if ("menu" in item) {
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-50 w-[360px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="relative overflow-hidden rounded-2xl border border-hairline-strong bg-popover/95 p-2 shadow-2xl backdrop-blur-2xl">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--amber)]/40 to-transparent" />
                      {item.menu.map((m) => (
                        <Link
                          key={m.to}
                          to={m.to as never}
                          className="group/item flex items-start justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2"
                        >
                          <div>
                            <div className="font-display text-sm font-semibold text-foreground">{m.label}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{m.description}</div>
                          </div>
                          <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-100 group-hover/item:text-[var(--amber)]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            if ("to" in item) {
              return (
                <Link
                  key={item.label}
                  to={item.to as never}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                {item.external && <ArrowUpRight className="h-3 w-3 opacity-60" />}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/auth"
            hash="login"
            className="hidden text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            hash="login"
            className="btn-tactile btn-tactile-hover inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-[13px] font-semibold"
          >
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-hairline text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-hairline bg-background/95 backdrop-blur-xl transition-[max-height] duration-300",
          open ? "max-h-[640px]" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-3">
          {items.map((item) => {
            if ("menu" in item) {
              const isOpen = mobileMenu === item.label;
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileMenu(isOpen ? null : item.label)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-foreground"
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="ml-3 flex flex-col border-l border-hairline pl-3">
                      {item.menu.map((m) => (
                        <Link
                          key={m.to}
                          to={m.to as never}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface-1 hover:text-foreground"
                        >
                          {m.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            if ("to" in item) {
              return (
                <Link
                  key={item.label}
                  to={item.to as never}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-1 hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-1 hover:text-foreground"
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
