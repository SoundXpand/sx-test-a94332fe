import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail, Palette, Type, ShieldAlert, ImageIcon } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";

const PRESS_EMAIL = "press@soundxpand.com";
const LOGO_PACK_URL = "https://soundxpand.com/assets/downloads/soundxpand-logos.zip";

export const Route = createFileRoute("/brand-assets")({
  head: () => ({
    meta: [
      { title: "Press & Brand Assets — SoundXpand" },
      { name: "description", content: "Download official SoundXpand logos, wordmarks and brand guidelines. Contact our press team for media enquiries." },
      { property: "og:title", content: "Press & Brand Assets — SoundXpand" },
      { property: "og:description", content: "Official brand assets, logos and press contact for SoundXpand." },
    ],
    links: [{ rel: "canonical", href: "https://soundxpand.com/brand-assets" }],
  }),
  component: BrandAssetsPage,
});

const rules = [
  { icon: <ShieldAlert className="h-5 w-5" />, title: "Get authorization", body: "Obtain explicit written approval from SoundXpand before using our marks in your materials." },
  { icon: <ImageIcon className="h-5 w-5" />, title: "Use official files", body: "Always download the latest logo pack from this page — never redraw, screenshot or trace." },
  { icon: <Palette className="h-5 w-5" />, title: "Respect the colors", body: "Use only the approved color variations. Do not tint, gradient-fill or recolor the marks." },
  { icon: <Type className="h-5 w-5" />, title: "Preserve proportions", body: "Do not stretch, rotate or crop the logo. Maintain minimum clear space equal to the height of the ‘S'." },
];

function BrandAssetsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[440px] w-[440px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklch, var(--brand-cyan) 40%, transparent) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Press · Brand
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Press &amp; Brand Assets
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            Before use, kindly review and adhere to the provided guidelines to ensure compliance with our brand assets policies.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={LOGO_PACK_URL}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-6 py-3 font-display text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" /> Download logo pack
            </a>
            <a
              href={`mailto:${PRESS_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-6 py-3 font-display text-sm font-semibold"
            >
              <Mail className="h-4 w-4" /> {PRESS_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-black to-neutral-900 p-10 lg:col-span-2 lg:min-h-[360px]">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-[var(--brand-violet)] to-[var(--brand-pink)] opacity-30 blur-3xl" />
              <div className="relative flex h-full flex-col items-center justify-center gap-6">
                <img
                  src="https://soundxpand.com/assets/images/logo/sx-logo-white.svg"
                  alt="SoundXpand logo"
                  className="h-16 w-auto"
                />
                <a
                  href={LOGO_PACK_URL}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur"
                >
                  <Download className="h-4 w-4" /> Download logos pack (SVG + PNG)
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-hairline bg-surface-1/40 p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)] text-white">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">Press enquiries</h3>
              <p className="mt-2 text-sm font-light text-muted-foreground">
                For interviews, exclusives, product news and speaker requests, please reach our press team.
              </p>
              <a
                href={`mailto:${PRESS_EMAIL}`}
                className="mt-4 inline-flex text-sm font-semibold text-foreground hover:text-[var(--brand-pink)]"
              >
                {PRESS_EMAIL} →
              </a>
              <p className="mt-6 text-xs text-muted-foreground">We usually respond within 2 business days.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guide to using our brand</h2>
          <p className="mt-2 max-w-2xl text-sm font-light text-muted-foreground">
            Welcome to SoundXpand, your premier music distribution and promotion partner. To ensure a consistent and respectful representation of our brand, please follow these guidelines when using our logos and trademarks.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {rules.map((r) => (
              <div key={r.title} className="rounded-2xl border border-hairline bg-surface-1/40 p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                  {r.icon}
                </div>
                <h3 className="mt-3 font-display text-base font-semibold">{r.title}</h3>
                <p className="mt-1.5 text-sm font-light text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-hairline bg-surface-1/30 p-6 text-sm font-light text-muted-foreground">
            <p>
              By downloading and using SoundXpand's brand assets you acknowledge that all logos, wordmarks and trademarks remain the exclusive property of SoundXpand and are provided under a limited, revocable, non-exclusive license for editorial and integration purposes only. Any commercial, misleading or defamatory use is strictly prohibited.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
