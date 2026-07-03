import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Leaf, HeartHandshake, Scale, Sparkles, Users, ArrowRight, FileText } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";

export const Route = createFileRoute("/pledges")({
  head: () => ({
    meta: [
      { title: "Our Pledges — SoundXpand" },
      { name: "description", content: "SoundXpand's public pledges on integrity, sustainability, transparency and artist-first practices in music distribution." },
      { property: "og:title", content: "Our Pledges — SoundXpand" },
      { property: "og:description", content: "Our commitments to integrity, sustainability and the independent music community." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://soundxpand.com/pledges" }],
  }),
  component: PledgesPage,
});

const pledges = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Integrity Pledge",
    body: "Aligned with the Central Vigilance Commission, we uphold the highest ethical standards across every part of our business — from royalty splits to rights protection.",
    href: "https://soundxpand.com/pledge/integrity-pledge-cvc",
    tag: "CVC",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Sustainability Pledge",
    body: "We continuously reduce the carbon footprint of our infrastructure, prefer green cloud regions and offset residual emissions from streaming operations.",
    tag: "Environment",
  },
  {
    icon: <HeartHandshake className="h-6 w-6" />,
    title: "Artist-first Pledge",
    body: "100% of royalties belong to the artist. We never take a cut of your recording rights, master ownership or fan data.",
    tag: "Fairness",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Transparency Pledge",
    body: "Statements, splits, takedowns and disputes — every action on your catalog is timestamped and auditable inside your dashboard.",
    tag: "Reporting",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Pledge",
    body: "We invest in independent scenes worldwide through free educational content, artist grants and community events.",
    tag: "Community",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Innovation Pledge",
    body: "We ship responsible AI tools that support human creativity — never replace it — and clearly label AI-assisted content across the supply chain.",
    tag: "Responsible AI",
  },
];

function PledgesPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
        <div
          className="pointer-events-none absolute left-1/2 top-[-100px] h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--brand-violet) 45%, transparent) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)]" />
            Our commitments
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Pledges
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            Pledges articulate our unwavering commitment to responsible practices across diverse sectors — from sustainability and innovation to community engagement and artist welfare. They reflect our values and mission to foster growth and integrity in every part of the music ecosystem.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pledges.map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface-1/40 p-6 transition-colors hover:border-hairline-strong"
              >
                <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-[color-mix(in_oklch,var(--brand-violet)_40%,transparent)] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                  {p.icon}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{p.tag}</div>
                <h3 className="mt-1 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm font-light text-muted-foreground">{p.body}</p>
                {p.href && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-[var(--brand-pink)]"
                  >
                    Read pledge <FileText className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-hairline bg-gradient-to-br from-[color-mix(in_oklch,var(--brand-violet)_15%,transparent)] to-transparent p-10 text-center">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Have a suggestion for a new pledge?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Write to us — we review community suggestions every quarter and publish updates transparently.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-6 py-3 font-display text-sm font-semibold text-white"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
