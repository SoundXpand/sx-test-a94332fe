import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, ArrowRight, Music } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";
import { DSPS_FULL, DSP_CATEGORIES, RIGHTS_SOCIETIES, type DspCategory } from "@/lib/dsp-list";

export const Route = createFileRoute("/digital-music-platforms")({
  head: () => ({
    meta: [
      { title: "Digital Music Platforms — SoundXpand Distribution Network" },
      { name: "description", content: "Distribute your music to 150+ digital music platforms including Spotify, Apple Music, Tidal, YouTube, Amazon, JioSaavn, Anghami, Boomplay and rights societies worldwide." },
      { property: "og:title", content: "Digital Music Platforms — SoundXpand" },
      { property: "og:description", content: "Every DSP, UGC service, audio library and rights society SoundXpand delivers to." },
    ],
    links: [{ rel: "canonical", href: "https://soundxpand.com/digital-music-platforms" }],
  }),
  component: PlatformsPage,
});

type FilterId = DspCategory | "all";

function PlatformsPage() {
  const [tab, setTab] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DSPS_FULL.filter((d) => {
      const inTab = tab === "all" || d.categories.includes(tab);
      const inQ = !q || d.name.toLowerCase().includes(q);
      return inTab && inQ;
    });
  }, [tab, query]);

  const allSocietiesSelected = selectedSocieties.length === RIGHTS_SOCIETIES.length;

  const toggleSociety = (id: string) =>
    setSelectedSocieties((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAllSocieties = () =>
    setSelectedSocieties(allSocietiesSelected ? [] : RIGHTS_SOCIETIES.map((r) => r.id));

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-14 sm:pt-40">
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--brand-violet) 45%, transparent) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <Music className="h-3 w-3" /> Distribution network
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Digital Music Platforms
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            SoundXpand delivers your music to 150+ digital stores, streaming services, UGC platforms, audio libraries and rights societies across every major market — all under one dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-6 py-3 font-display text-sm font-semibold text-white"
            >
              Sell your music online <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-t border-hairline bg-surface-1/30 py-8 sticky top-16 z-30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {DSP_CATEGORIES.map((c) => {
                const active = tab === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setTab(c.id as FilterId)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white"
                        : "border border-hairline bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search platforms…"
                className="w-full rounded-full border border-hairline bg-background pl-9 pr-4 py-2 text-sm outline-none focus:border-[var(--brand-pink)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-6 text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> platforms
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d) => (
              <div
                key={d.slug + d.name}
                className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface-1/30 p-5 transition-all hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-1/60"
              >
                <div className="flex h-14 items-center">
                  {d.logo ? (
                    <img
                      src={d.logo}
                      alt={d.name}
                      className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                      <Music className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold leading-tight">{d.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-hairline px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                    >
                      {c.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-hairline p-12 text-center text-sm text-muted-foreground">
              No platforms match your search.
            </div>
          )}
        </div>
      </section>

      {/* RIGHTS SOCIETIES */}
      <section className="border-t border-hairline bg-surface-1/30 py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-pink)]">Rights collection</div>
              <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Rights societies</h2>
              <p className="mt-2 max-w-2xl text-sm font-light text-muted-foreground">
                Combine collection across the world's leading rights and neighbouring-rights organisations. Select the ones you want SoundXpand to register your works with.
              </p>
            </div>
            <button
              onClick={toggleAllSocieties}
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold transition-all sm:self-auto ${
                allSocietiesSelected
                  ? "bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white"
                  : "border border-hairline bg-background text-foreground"
              }`}
            >
              <span
                className={`grid h-4 w-4 place-items-center rounded ${allSocietiesSelected ? "bg-white/20" : "border border-hairline"}`}
              >
                {allSocietiesSelected && <Check className="h-3 w-3" />}
              </span>
              All societies
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {RIGHTS_SOCIETIES.map((s) => {
              const active = selectedSocieties.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors ${
                    active ? "border-[var(--brand-pink)] bg-surface-1/60" : "border-hairline bg-surface-1/30 hover:border-hairline-strong"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSociety(s.id)}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded ${
                      active
                        ? "bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white"
                        : "border border-hairline"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-display text-sm font-semibold">{s.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.territory}</div>
                    </div>
                    <p className="mt-1 text-xs font-light text-muted-foreground">{s.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedSocieties.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-background p-4 text-sm">
              <div className="text-muted-foreground">
                Selected <span className="font-semibold text-foreground">{selectedSocieties.length}</span> of {RIGHTS_SOCIETIES.length} societies
              </div>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-4 py-2 text-xs font-semibold text-white"
              >
                Register your works <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-3xl border border-hairline bg-gradient-to-br from-[color-mix(in_oklch,var(--brand-violet)_18%,transparent)] to-transparent p-10 text-center sm:p-14">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">One upload. Every platform.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Deliver your music to every major DSP, monetize UGC and collect from rights societies worldwide — from a single dashboard.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-6 py-3 font-display text-sm font-semibold text-white"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 font-display text-sm font-semibold"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
