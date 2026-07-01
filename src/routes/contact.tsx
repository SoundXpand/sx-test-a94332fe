import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, Phone } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ContactUsBadge } from "@/components/landing/contact-us-badge";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SoundXpand — Talk to the Team" },
      { name: "description", content: "Get in touch with SoundXpand for support, partnerships, press or a demo of our distribution and monetization platform." },
      { property: "og:title", content: "Contact SoundXpand" },
      { property: "og:description", content: "Support, partnerships, press or a product demo — we're here." },
      { property: "og:url", content: "https://sx-test.lovable.app/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://sx-test.lovable.app/contact" }],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: <Mail className="h-5 w-5" />,
    title: "General enquiries",
    description: "Questions about the platform, plans and features.",
    value: "hello@soundxpand.com",
    href: "mailto:hello@soundxpand.com",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Artist support",
    description: "Release help, delivery issues and account questions.",
    value: "support@soundxpand.com",
    href: "mailto:support@soundxpand.com",
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "Partnerships & press",
    description: "Labels, distributors, media and integrations.",
    value: "partners@soundxpand.com",
    href: "mailto:partners@soundxpand.com",
  },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <ContactUsBadge />

      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 30%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-violet-deep)_45%,transparent)_0%,transparent_70%)] blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)]" />
            Contact us
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Talk to a{" "}
            <span className="bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] bg-clip-text text-transparent">real human</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light text-muted-foreground sm:text-lg">
            No chatbots, no ticket queues. Whether you need release support, want to partner with us or just have a question — we typically reply within a few hours.
          </p>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-3 sm:px-8">
          {channels.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-hairline bg-surface-1/40 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface-1/60"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                {c.icon}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 text-sm font-medium text-foreground group-hover:text-[var(--brand-pink)]">{c.value} →</div>
            </a>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Send us a message</h2>
            <p className="mt-3 text-muted-foreground">
              Fill in the form and we'll route it to the right team. Include as much detail as you can — attach links, screenshots and release IDs where relevant.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-semibold">Headquarters</div>
                  <div className="text-sm text-muted-foreground">Remote-first, with teams in London, New York, Mumbai and Berlin.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-semibold">Response time</div>
                  <div className="text-sm text-muted-foreground">Under 4 business hours, Mon-Fri.</div>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl border border-hairline bg-surface-1/40 p-6 backdrop-blur sm:p-8 lg:col-span-3"
          >
            {sent ? (
              <div className="grid min-h-[400px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white">
                    <Send className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">Message sent</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thanks — we've got it. Expect a reply from the team within a few hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="name" required />
                  <Field label="Email address" name="email" type="email" required />
                </div>
                <Field label="Company / artist name" name="company" />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic</label>
                  <select
                    name="topic"
                    className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm outline-none focus:border-hairline-strong"
                  >
                    <option>General enquiry</option>
                    <option>Distribution support</option>
                    <option>Publishing / Content ID</option>
                    <option>Partnerships</option>
                    <option>Press</option>
                    <option>Careers</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm outline-none focus:border-hairline-strong"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] px-5 py-3 font-display text-sm font-semibold text-white shadow-[0_0_28px_-4px_var(--brand-violet-deep)] transition-transform hover:-translate-y-0.5"
                >
                  Send message
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-sm outline-none focus:border-hairline-strong"
      />
    </div>
  );
}
